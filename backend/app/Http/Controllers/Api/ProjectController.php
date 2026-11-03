<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
    return response()->json([
        'data' => Project::query()
            ->with('client:id,name')
            ->orderBy('name')
            ->get(),
        'message' => 'Listado de proyectos',
    ]);
}

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectRequest $request)
    {
    $project = Project::create(
        $request->validated()
    );

    $project->load('client:id,name');

    return response()->json([
        'data' => $project,
        'message' => 'Proyecto creado correctamente',
    ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
    $project->load('client:id,name');

    return response()->json([
        'data' => $project,
        'message' => 'Detalle del proyecto',
    ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(
    UpdateProjectRequest $request,
    Project $project
    ) {
    $project->update(
        $request->validated()
    );

    $project->load('client:id,name');

    return response()->json([
        'data' => $project,
        'message' => 'Proyecto actualizado correctamente',
    ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
    $project->delete();

    return response()->json([
        'message' => 'Proyecto eliminado correctamente',
    ]);
    }
}
