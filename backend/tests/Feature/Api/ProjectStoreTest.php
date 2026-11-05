<?php

namespace Tests\Feature\Api;

use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProjectStoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_create_projects(): void
    {
        $this->postJson('/api/projects', [
            'name' => 'Proyecto de prueba',
        ])->assertUnauthorized();
    }

    public function test_normal_users_cannot_create_projects(): void
    {
        $user = new User;
        $user->role = 'user';

        Sanctum::actingAs($user);

        $this->postJson('/api/projects', [
            'name' => 'Proyecto de prueba',
        ])->assertForbidden();
    }

    public function test_admin_can_create_project_with_client(): void
    {
        $client = Client::create([
            'name' => 'Cliente de prueba',
        ]);

        $admin = new User;
        $admin->role = 'admin';

        Sanctum::actingAs($admin);

        $this->postJson('/api/projects', [
            'name' => 'Proyecto Alfa',
            'client_id' => $client->id,
            'code' => 'PR-001',
            'color' => '#008080',
            'estimated_hours' => 12.5,
        ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Proyecto Alfa')
            ->assertJsonPath('data.client.name', 'Cliente de prueba')
            ->assertJsonPath(
                'message',
                'Proyecto creado correctamente'
            );

        $this->assertDatabaseHas('proyectos', [
            'nombre' => 'Proyecto Alfa',
            'cliente_id' => $client->id,
            'codigo' => 'PR-001',
        ]);
    }

    public function test_admin_can_create_project_without_client(): void
    {
        $admin = new User;
        $admin->role = 'admin';

        Sanctum::actingAs($admin);

        $this->postJson('/api/projects', [
            'name' => 'Proyecto independiente',
        ])
            ->assertCreated()
            ->assertJsonPath('data.client', null);

        $this->assertDatabaseHas('proyectos', [
            'nombre' => 'Proyecto independiente',
            'cliente_id' => null,
        ]);
    }

    public function test_invalid_project_data_is_rejected(): void
    {
        $admin = new User;
        $admin->role = 'admin';

        Sanctum::actingAs($admin);

        $this->postJson('/api/projects', [
            'name' => '',
            'client_id' => 999999,
            'color' => 'azul',
            'estimated_hours' => -1,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name',
                'client_id',
                'color',
                'estimated_hours',
            ]);
    }
}
