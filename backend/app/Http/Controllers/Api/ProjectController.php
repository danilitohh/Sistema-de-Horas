<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    public function index(): JsonResponse
    {
        $projects = Project::query()
            ->with('client:id,nombre')
            ->orderBy('nombre')
            ->get()
            ->map(fn (Project $project): array => $this->toDto($project))
            ->values();

        return response()->json([
            'data' => $projects,
            'message' => 'Listado de proyectos',
        ]);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = Project::create($this->toModelAttributes($request->validated()));

        return response()->json([
            'data' => $this->toDto($project->load('client:id,nombre')),
            'message' => 'Proyecto creado correctamente',
        ], 201);
    }

    public function show(Project $project): JsonResponse
    {
        return response()->json([
            'data' => $this->toDto($project->load('client:id,nombre')),
            'message' => 'Detalle del proyecto',
        ]);
    }

    public function update(
        UpdateProjectRequest $request,
        Project $project
    ): JsonResponse {
        $project->update($this->toModelAttributes($request->validated()));

        return response()->json([
            'data' => $this->toDto($project->refresh()->load('client:id,nombre')),
            'message' => 'Proyecto actualizado correctamente',
        ]);
    }

    public function destroy(Project $project): JsonResponse
    {
        $project->delete();

        return response()->json([
            'message' => 'Proyecto eliminado correctamente',
        ]);
    }

    /** @param array<string, mixed> $validated */
    private function toModelAttributes(array $validated): array
    {
        $map = [
            'client_id' => 'cliente_id',
            'name' => 'nombre',
            'code' => 'codigo',
            'estimated_hours' => 'horas_estimadas',
        ];
        $attributes = [];

        foreach ($map as $input => $column) {
            if (array_key_exists($input, $validated)) {
                $attributes[$column] = $validated[$input];
            }
        }

        if (array_key_exists('color', $validated)) {
            $attributes['color'] = $validated['color'];
        }

        return $attributes;
    }

    /** @return array<string, mixed> */
    private function toDto(Project $project): array
    {
        $client = $project->client;

        return [
            'id' => $project->id,
            'client_id' => $project->cliente_id,
            'name' => $project->nombre,
            'code' => $project->codigo,
            'color' => $project->color,
            'estimated_hours' => $project->horas_estimadas,
            'created_at' => $project->creado_en?->toISOString(),
            'updated_at' => $project->actualizado_en?->toISOString(),
            'client' => $client === null ? null : [
                'id' => $client->id,
                'name' => $client->nombre,
            ],
        ];
    }
}
