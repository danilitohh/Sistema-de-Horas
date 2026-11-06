<?php

namespace Tests\Feature\Api;

use Tests\TestCase;

class ClientIndexTest extends TestCase
{
    public function test_guests_cannot_access_clients_index(): void
    {
    $response = $this->getJson('/api/clients');

    $response->assertUnauthorized();

    $response->assertExactJson([
        'message' => 'Unauthenticated.',
    ]);
    }

        public function test_authenticated_admin_can_access_clients_index(): void
    {
        $admin = new \App\Models\User();
        $admin->role = 'admin';

        \Laravel\Sanctum\Sanctum::actingAs($admin);

        $response = $this->getJson('/api/clients');

        $response->assertOk();

        $response->assertExactJson([
            'data' => [],
            'message' => 'API de clientes preparada',
        ]);
    }

    public function test_authenticated_normal_user_cannot_access_clients_index(): void
    {
        $user = new \App\Models\User();
        $user->role = 'user';

        \Laravel\Sanctum\Sanctum::actingAs($user);

        $response = $this->getJson('/api/clients');

        $response->assertForbidden();
    }
}
  