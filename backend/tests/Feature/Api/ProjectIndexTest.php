<?php

namespace Tests\Feature\Api;

use App\Models\Client;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProjectIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_projects_index(): void
    {
        $response = $this->getJson('/api/projects');

        $response->assertUnauthorized();

        $response->assertExactJson([
            'message' => 'Unauthenticated.',
        ]);
    }

    public function test_authenticated_admin_can_access_seeded_projects_index(): void
    {
        $admin = new User;
        $admin->role = 'admin';

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/projects');

        $response->assertOk();
        $response->assertJsonPath('message', 'Listado de proyectos');
        $response->assertJsonCount(69, 'data');

        $seededProject = collect($response->json('data'))
            ->firstWhere('name', 'Acortador de enlaces');

        $this->assertNotNull($seededProject);
        $this->assertNull($seededProject['client']);
    }

    public function test_authenticated_user_can_view_projects_with_client(): void
    {
        $client = Client::create([
            'name' => 'Cliente de prueba',
        ]);

        Project::create([
            'name' => 'Proyecto Zeta',
            'client_id' => $client->id,
        ]);

        Project::create([
            'name' => 'Proyecto Alfa',
        ]);

        $user = new User;
        $user->role = 'user';

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/projects');

        $response->assertOk();
        $response->assertJsonCount(71, 'data');

        $response->assertJsonPath(
            'message',
            'Listado de proyectos'
        );

        $projects = collect($response->json('data'));
        $projectWithoutClient = $projects->firstWhere('name', 'Proyecto Alfa');
        $projectWithClient = $projects->firstWhere('name', 'Proyecto Zeta');

        $this->assertNotNull($projectWithoutClient);
        $this->assertNull($projectWithoutClient['client']);
        $this->assertNotNull($projectWithClient);
        $this->assertSame('Cliente de prueba', $projectWithClient['client']['name']);
    }
}
