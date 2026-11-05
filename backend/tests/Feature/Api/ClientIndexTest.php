<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ClientIndexTest extends TestCase
{
    use RefreshDatabase;

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
        $admin = new User;
        $admin->role = 'admin';

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/clients');

        $response->assertOk();
        $response->assertJsonPath('message', 'Listado de clientes');
        $response->assertJsonCount(16, 'data');
        $response->assertJsonPath('data.0.name', 'Conecta');
        $response->assertJsonPath('data.15.name', 'Web');
    }

    public function test_authenticated_normal_user_cannot_access_clients_index(): void
    {
        $user = new User;
        $user->role = 'user';

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/clients');

        $response->assertForbidden();
    }
}
