<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProjectController extends Controller
{
    public function index(): JsonResponse
    {
        $projects = Project::with('client')->orderBy('nombre')->get()->map(fn (Project $p) => $this->dto($p));
        return response()->json(['data' => $projects, 'message' => 'Listado de proyectos']);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());
        $project = Project::create($this->attributes($data));
        return response()->json(['data' => $this->dto($project->load('client')), 'message' => 'Proyecto creado.'], 201);
    }

    public function show(Project $project): JsonResponse
    {
        return response()->json(['data' => $this->dto($project->load('client'))]);
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $data = $request->validate($this->rules(true));
        $project->update($this->attributes($data));
        return response()->json(['data' => $this->dto($project->refresh()->load('client')), 'message' => 'Proyecto actualizado.']);
    }

    public function destroy(Project $project): JsonResponse
    {
        if ($project->timeEntries()->exists()) {
            return response()->json(['message' => 'No se puede eliminar un proyecto con registros de horas asociados.'], 409);
        }
        $project->delete();
        return response()->json(['message' => 'Proyecto eliminado.']);
    }

    private function rules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes|required' : 'required';
        return [
            'name' => [$required, 'string', 'max:255'],
            'client_id' => [$required, 'integer', 'exists:clientes,id'],
            'color' => [$required, 'string', 'max:55'],
            'estimated_hours' => [$required, 'numeric', 'min:0', 'max:99999999.99'],
        ];
    }

    private function attributes(array $data): array
    {
        $map = ['name' => 'nombre', 'client_id' => 'cliente_id', 'color' => 'color', 'estimated_hours' => 'horas_estimadas'];
        $attributes = [];
        foreach ($map as $input => $column) if (array_key_exists($input, $data)) $attributes[$column] = $data[$input];
        return $attributes;
    }

    private function dto(Project $project): array
    {
        return ['id' => $project->id, 'name' => $project->nombre, 'client_id' => $project->cliente_id,
            'color' => $project->color, 'estimated_hours' => (float) $project->horas_estimadas,
            'created_at' => $project->creado_en?->toISOString(), 'updated_at' => $project->actualizado_en?->toISOString(),
            'client' => $project->client ? ['id' => $project->client->id, 'name' => $project->client->nombre] : null];
    }
}
