<?php

namespace Tests\Feature\Api;

use Tests\TestCase;

class ClientIndexTest extends TestCase
{
    public function test_clients_index_returns_expected_json(): void
    {
        $response = $this->getJson('/api/clients');

        $response->assertOk();

        $response->assertExactJson([
            'data' => [],
            'message' => 'API de clientes preparada',
        ]);
    }
}
  