<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectRelationshipsTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_belongs_to_client(): void
    {
        $client = Client::create([
            'name' => 'Cliente de prueba',
        ]);

        $project = Project::create([
            'client_id' => $client->id,
            'name' => 'Proyecto de prueba',
            'code' => 'PR-001',
            'color' => '#008080',
            'estimated_hours' => 12.5,
        ]);

        $this->assertTrue(
            $project->client->is($client)
        );
    }

    public function test_client_has_many_projects(): void
    {
        $client = Client::create([
            'name' => 'Cliente de prueba',
        ]);

        $client->projects()->create([
            'name' => 'Proyecto A',
        ]);

        $client->projects()->create([
            'name' => 'Proyecto B',
        ]);

        $this->assertCount(
            2,
            $client->projects
        );
    }
}