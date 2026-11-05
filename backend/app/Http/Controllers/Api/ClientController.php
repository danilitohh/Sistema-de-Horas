<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClientRequest;
use App\Models\Client;
use Illuminate\Http\JsonResponse;

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

    /** @return array{id: int, name: string} */
    private function toDto(Client $client): array
    {
        return [
            'id' => $client->id,
            'name' => $client->nombre,
        ];
    }
}
