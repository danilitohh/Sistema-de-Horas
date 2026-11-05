<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LogoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_logout(): void
    {
        $this->postJson('/api/logout')
            ->assertUnauthorized();
    }

    public function test_logout_revokes_only_the_current_token(): void
    {
        $user = User::factory()->create();

        $currentToken = $user->createToken('tempo-api');
        $otherToken = $user->createToken('tempo-otra-sesion');

        $this->withToken($currentToken->plainTextToken)
            ->postJson('/api/logout')
            ->assertOk()
            ->assertJsonPath(
                'message',
                'Sesión cerrada correctamente.'
            );

        $this->assertDatabaseMissing('tokens_acceso', [
            'id' => $currentToken->accessToken->id,
        ]);

        $this->assertDatabaseHas('tokens_acceso', [
            'id' => $otherToken->accessToken->id,
        ]);
    }
}
