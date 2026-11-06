<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TimeEntryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $this->user($request);
        $entries = $this->visible($user)->with('project')->orderByDesc('fecha')->orderByDesc('id')->paginate(min(max($request->integer('per_page', 100), 1), 100));
        return response()->json(['data' => $entries->getCollection()->map(fn (TimeEntry $e) => $this->dto($e))->values(),
            'meta' => ['current_page' => $entries->currentPage(), 'last_page' => $entries->lastPage(), 'per_page' => $entries->perPage(), 'total' => $entries->total()], 'message' => 'Registros de horas']);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $this->user($request);
        $data = $request->validate($this->rules());
        $this->validateRange($data['horaInicio'], $data['horaFin']);
        $entry = TimeEntry::create($this->attributes($data) + ['usuario_id' => $user->id]);
        return response()->json(['data' => $this->dto($entry->load('project')), 'message' => 'Registro guardado.'], 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $entry = $this->find($this->user($request), $id);
        return response()->json(['data' => $this->dto($entry->load('project'))]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $entry = $this->find($this->user($request), $id);
        $data = $request->validate($this->rules(true));
        $start = $data['horaInicio'] ?? substr((string) $entry->hora_inicio, 0, 5);
        $end = $data['horaFin'] ?? substr((string) $entry->hora_fin, 0, 5);
        $this->validateRange($start, $end);
        $entry->update($this->attributes($data));
        return response()->json(['data' => $this->dto($entry->refresh()->load('project')), 'message' => 'Registro actualizado.']);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $this->find($this->user($request), $id)->delete();
        return response()->json(['message' => 'Registro eliminado.']);
    }

    private function rules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes|required' : 'required';
        return ['proyectoId' => [$required, 'integer', 'exists:proyectos,id'], 'descripcion' => [$required, 'string', 'max:10000'],
            'fecha' => [$required, 'date_format:Y-m-d', 'before_or_equal:today'], 'horaInicio' => [$required, 'date_format:H:i'],
            'horaFin' => [$required, 'date_format:H:i'], 'duracionMinutos' => [$required, 'integer', 'min:1', 'max:1440']];
    }

    private function attributes(array $data): array
    {
        $map = ['proyectoId' => 'proyecto_id', 'descripcion' => 'descripcion', 'fecha' => 'fecha', 'horaInicio' => 'hora_inicio', 'horaFin' => 'hora_fin', 'duracionMinutos' => 'duracion_minutos'];
        $out = [];
        foreach ($map as $in => $column) if (array_key_exists($in, $data)) $out[$column] = $data[$in];
        return $out;
    }

    private function dto(TimeEntry $e): array
    {
        return ['id' => (string) $e->id, 'usuarioId' => (string) $e->usuario_id, 'proyectoId' => (string) $e->proyecto_id,
            'descripcion' => $e->descripcion, 'fecha' => $e->fecha->format('Y-m-d'), 'horaInicio' => substr((string) $e->hora_inicio, 0, 5),
            'horaFin' => substr((string) $e->hora_fin, 0, 5), 'duracionMinutos' => (int) $e->duracion_minutos,
            'creadoEn' => $e->creado_en?->toISOString(), 'actualizadoEn' => $e->actualizado_en?->toISOString()];
    }

    private function user(Request $request): User
    {
        abort_unless($request->user() instanceof User, 401);
        return $request->user();
    }

    private function visible(User $user): Builder
    {
        return TimeEntry::query()->when(! $user->hasRole('admin'), fn (Builder $q) => $q->where('usuario_id', $user->id));
    }

    private function find(User $user, string $id): TimeEntry
    {
        return $this->visible($user)->whereKey($id)->firstOrFail();
    }

    private function validateRange(string $start, string $end): void
    {
        if ($start >= $end) throw ValidationException::withMessages(['horaFin' => 'La hora final debe ser posterior a la inicial.']);
    }
}
