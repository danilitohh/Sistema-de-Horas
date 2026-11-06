<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Project;
use App\Models\Role;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function analytics(): JsonResponse
    {
        return response()->json([
            'users' => User::count(),
            'projects' => Project::count(),
            'clients' => Client::count(),
            'time_entries' => TimeEntry::count(),
            'minutes_total' => (int) TimeEntry::sum('duracion_minutos'),
            'hours_by_day' => TimeEntry::query()->selectRaw('fecha, SUM(duracion_minutos) as minutos')
                ->groupBy('fecha')->orderBy('fecha')->limit(30)->get(),
            'hours_by_project' => TimeEntry::query()->join('proyectos', 'proyectos.id', '=', 'registros_horas.proyecto_id')
                ->selectRaw('proyectos.id, proyectos.nombre, SUM(registros_horas.duracion_minutos) as minutos')
                ->groupBy('proyectos.id', 'proyectos.nombre')->orderByDesc('minutos')->limit(8)->get(),
        ]);
    }

    public function users(): JsonResponse
    {
        return response()->json(['data' => User::with('role')->orderBy('id')->get()->map(fn (User $u) => $this->userDto($u))]);
    }

    public function storeUser(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'correo' => ['required', 'email', 'max:255', 'unique:usuarios,correo'],
            'contrasena' => ['required', 'string', 'min:8'],
            'roles_idroles' => ['required', 'integer', Rule::in([1, 2])],
        ]);
        $data['contrasena'] = Hash::make($data['contrasena']);
        $user = User::create($data)->load('role');

        return response()->json(['data' => $this->userDto($user)], 201);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'nombre' => ['sometimes', 'required', 'string', 'max:255'],
            'correo' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('usuarios', 'correo')->ignore($user->id)],
            'contrasena' => ['sometimes', 'nullable', 'string', 'min:8'],
            'roles_idroles' => ['sometimes', 'required', 'integer', Rule::in([1, 2])],
        ]);
        if (! empty($data['contrasena'])) $data['contrasena'] = Hash::make($data['contrasena']);
        else unset($data['contrasena']);
        if ((int) $user->id === (int) $request->user()->id && isset($data['roles_idroles']) && (int) $data['roles_idroles'] !== 1) {
            return response()->json(['message' => 'No puedes quitarte tu propio rol de administrador.'], 422);
        }
        $user->update($data);

        return response()->json(['data' => $this->userDto($user->refresh()->load('role'))]);
    }

    public function deleteUser(Request $request, User $user): JsonResponse
    {
        abort_if((int) $user->id === (int) $request->user()->id, 422, 'No puedes eliminar tu propia cuenta.');
        $user->delete();

        return response()->json(['message' => 'Usuario eliminado.']);
    }

    public function roles(): JsonResponse
    {
        return response()->json(['data' => Role::withCount('users')->orderBy('idroles')->get()]);
    }

    public function updateRole(Request $request, Role $role): JsonResponse
    {
        $data = $request->validate(['nombre' => ['required', 'string', 'max:45']]);
        $role->update($data);

        return response()->json(['data' => $role->refresh()->loadCount('users')]);
    }

    private function userDto(User $user): array
    {
        return ['id' => $user->id, 'nombre' => $user->nombre, 'correo' => $user->correo,
            'roles_idroles' => $user->roles_idroles, 'rol' => $user->role?->nombre,
            'creado_en' => $user->creado_en?->toISOString()];
    }
}
