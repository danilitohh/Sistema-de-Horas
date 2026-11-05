<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ClientStoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_create_clients(): void
    {
        $this->postJson('/api/clients', [
            'name' => 'Cliente nuevo',
        ])->assertUnauthorized();
    }

    public function test_normal_users_cannot_create_clients(): void
    {
        $user = User::factory()->create(['rol' => 'user']);
        Sanctum::actingAs($user);

        $this->postJson('/api/clients', [
            'name' => 'Cliente nuevo',
        ])->assertForbidden();
    }

    public function test_admin_can_create_a_client(): void
    {
        $admin = User::factory()->create(['rol' => 'admin']);
        Sanctum::actingAs($admin);

        $this->postJson('/api/clients', [
            'name' => 'Cliente nuevo',
        ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Cliente nuevo')
            ->assertJsonPath('message', 'Cliente creado correctamente');

        $this->assertDatabaseHas('clientes', [
            'nombre' => 'Cliente nuevo',
        ]);
    }

    public function test_admin_cannot_create_a_duplicate_client(): void
    {
        $admin = User::factory()->create(['rol' => 'admin']);
        Sanctum::actingAs($admin);

        $this->postJson('/api/clients', [
            'name' => '  Conecta  ',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);

    }
}
