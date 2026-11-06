<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClientRequest;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    public function index(): JsonResponse
    {
        $clients = Client::query()
            ->select(['id', 'nombre'])
            ->orderBy('nombre')
            ->get()
            ->map(fn (Client $client): array => $this->toDto($client))
            ->values();

        return response()->json([
            'data' => $clients,
            'message' => 'Listado de clientes',
        ]);
    }

    public function store(StoreClientRequest $request): JsonResponse
    {
        $client = Client::query()->create([
            'nombre' => trim($request->validated()['name']),
        ]);

        return response()->json([
            'data' => $this->toDto($client),
            'message' => 'Cliente creado correctamente',
        ], 201);
    }

    public function update(Request $request, Client $client): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255', Rule::unique('clientes', 'nombre')->ignore($client->id)]]);
        $client->update(['nombre' => trim($data['name'])]);

        return response()->json(['data' => $this->toDto($client->refresh()), 'message' => 'Cliente actualizado.']);
    }

    public function destroy(Client $client): JsonResponse
    {
        if ($client->projects()->exists()) {
            return response()->json(['message' => 'No se puede eliminar un cliente con proyectos asociados.'], 409);
        }
        $client->delete();

        return response()->json(['message' => 'Cliente eliminado.']);
    }

    /** @return array{id: int, name: string} */
    private function toDto(Client $client): array
    {
        return [
            'id' => $client->id,
            'name' => $client->nombre,
        ];
    }
}
