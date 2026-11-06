<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ChangePasswordTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_change_a_password(): void
    {
        $this->patchJson('/api/me/password', [
            'current_password' => 'ContrasenaActual123!',
            'password' => 'NuevaContrasena123!',
            'password_confirmation' => 'NuevaContrasena123!',
        ])->assertUnauthorized();
    }

    public function test_authenticated_user_can_change_own_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('ContrasenaActual123!'),
        ]);

        Sanctum::actingAs($user);

        $this->patchJson('/api/me/password', [
            'current_password' => 'ContrasenaActual123!',
            'password' => 'NuevaContrasena123!',
            'password_confirmation' => 'NuevaContrasena123!',
        ])
            ->assertOk()
            ->assertExactJson([
                'message' => 'Contraseña actualizada correctamente.',
            ]);

        $user->refresh();

        $this->assertTrue(Hash::check(
            'NuevaContrasena123!',
            $user->contrasena
        ));
        $this->assertFalse(Hash::check(
            'ContrasenaActual123!',
            $user->contrasena
        ));
    }

    public function test_current_password_must_be_correct(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('ContrasenaActual123!'),
        ]);

        Sanctum::actingAs($user);

        $this->patchJson('/api/me/password', [
            'current_password' => 'ContrasenaIncorrecta123!',
            'password' => 'NuevaContrasena123!',
            'password_confirmation' => 'NuevaContrasena123!',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['current_password']);
    }

    public function test_new_password_requires_confirmation_and_strength(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('ContrasenaActual123!'),
        ]);

        Sanctum::actingAs($user);

        $this->patchJson('/api/me/password', [
            'current_password' => 'ContrasenaActual123!',
            'password' => 'corta',
            'password_confirmation' => 'diferente',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }
}
