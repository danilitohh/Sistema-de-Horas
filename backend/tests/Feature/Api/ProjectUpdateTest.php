<?php

namespace Tests\Feature\Api;

use App\Models\Client;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProjectUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_update_projects(): void
    {
        $project = Project::create([
            'name' => 'Proyecto original',
        ]);

        $response = $this->patchJson(
            "/api/projects/{$project->id}",
            ['name' => 'Proyecto actualizado']
        );

        $response->assertUnauthorized();
    }

    public function test_normal_users_cannot_update_projects(): void
    {
        $project = Project::create([
            'name' => 'Proyecto original',
        ]);

        $user = new User;
        $user->role = 'user';

        Sanctum::actingAs($user);

        $response = $this->patchJson(
            "/api/projects/{$project->id}",
            ['name' => 'Proyecto actualizado']
        );

        $response->assertForbidden();
    }

    public function test_admin_can_update_project(): void
    {
        $project = Project::create([
            'name' => 'Proyecto original',
        ]);

        $admin = new User;
        $admin->role = 'admin';

        Sanctum::actingAs($admin);

        $response = $this->patchJson(
            "/api/projects/{$project->id}",
            ['name' => 'Proyecto actualizado']
        );

        $response->assertOk();

        $response->assertJsonPath(
            'data.name',
            'Proyecto actualizado'
        );

        $response->assertJsonPath(
            'message',
            'Proyecto actualizado correctamente'
        );

        $this->assertDatabaseHas('proyectos', [
            'id' => $project->id,
            'nombre' => 'Proyecto actualizado',
        ]);
    }

    public function test_admin_can_update_project_partially(): void
    {
        $client = Client::create([
            'name' => 'Cliente de prueba',
        ]);

        $project = Project::create([
            'name' => 'Proyecto original',
            'client_id' => $client->id,
        ]);

        $admin = new User;
        $admin->role = 'admin';

        Sanctum::actingAs($admin);

        $response = $this->patchJson(
            "/api/projects/{$project->id}",
            ['name' => 'Nuevo nombre']
        );

        $response->assertOk();

        $response->assertJsonPath(
            'data.name',
            'Nuevo nombre'
        );

        $response->assertJsonPath(
            'data.client.name',
            'Cliente de prueba'
        );

        $this->assertDatabaseHas('proyectos', [
            'id' => $project->id,
            'nombre' => 'Nuevo nombre',
            'cliente_id' => $client->id,
        ]);
    }

    public function test_invalid_project_data_is_rejected(): void
    {
        $project = Project::create([
            'name' => 'Proyecto original',
        ]);

        $admin = new User;
        $admin->role = 'admin';

        Sanctum::actingAs($admin);

        $response = $this->patchJson(
            "/api/projects/{$project->id}",
            ['name' => '']
        );

        $response->assertUnprocessable();

        $response->assertJsonValidationErrors('name');
    }

    public function test_nonexistent_project_returns_not_found(): void
    {
        $admin = new User;
        $admin->role = 'admin';

        Sanctum::actingAs($admin);

        $response = $this->patchJson(
            '/api/projects/999999',
            ['name' => 'Proyecto actualizado']
        );

        $response->assertNotFound();
    }
}
