<?php

namespace Tests\Feature\Api;

use App\Models\Client;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProjectShowTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_view_project(): void
    {
        $project = Project::create([
            'name' => 'Proyecto privado',
        ]);

        $response = $this->getJson(
            "/api/projects/{$project->id}"
        );

        $response->assertUnauthorized();

        $response->assertExactJson([
            'message' => 'Unauthenticated.',
        ]);
    }

    public function test_authenticated_user_can_view_project_with_client(): void
    {
        $client = Client::create([
            'name' => 'Cliente de prueba',
        ]);

        $project = Project::create([
            'name' => 'Proyecto Alfa',
            'client_id' => $client->id,
        ]);

        $user = new User();
        $user->role = 'user';

        Sanctum::actingAs($user);

        $response = $this->getJson(
            "/api/projects/{$project->id}"
        );

        $response->assertOk();

        $response->assertJsonPath(
            'data.id',
            $project->id
        );

        $response->assertJsonPath(
            'data.name',
            'Proyecto Alfa'
        );

        $response->assertJsonPath(
            'data.client.name',
            'Cliente de prueba'
        );

        $response->assertJsonPath(
            'message',
            'Detalle del proyecto'
        );
    }

    public function test_authenticated_admin_can_view_project_without_client(): void
    {
        $project = Project::create([
            'name' => 'Proyecto independiente',
        ]);

        $admin = new User();
        $admin->role = 'admin';

        Sanctum::actingAs($admin);

        $response = $this->getJson(
            "/api/projects/{$project->id}"
        );

        $response->assertOk();

        $response->assertJsonPath(
            'data.name',
            'Proyecto independiente'
        );

        $response->assertJsonPath(
            'data.client',
            null
        );

        $response->assertJsonPath(
            'message',
            'Detalle del proyecto'
        );
    }

    public function test_nonexistent_project_returns_not_found(): void
    {
        $user = new User();
        $user->role = 'user';

        Sanctum::actingAs($user);

        $response = $this->getJson(
            '/api/projects/999999'
        );

        $response->assertNotFound();
    }
}