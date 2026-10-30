<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LoginTest extends TestCase
{   
    use RefreshDatabase;
    public function test_login_requires_email_and_password(): void
    {
        $response = $this->postJson('/api/login', []);

        $response->assertUnprocessable();

        $response->assertJsonValidationErrors([
            'email',
            'password',
        ]);
    }

    public function test_login_rejects_invalid_email_format(): void
{
    $response = $this->postJson('/api/login', [
        'email' => 'correo-invalido',
        'password' => 'ContrasenaDePrueba123!',
    ]);

    $response->assertUnprocessable();

    $response->assertJsonValidationErrors([
        'email',
    ]);

    $response->assertJsonMissingValidationErrors([
        'password',
    ]);
}

public function test_login_rejects_incorrect_password(): void
{
    User::factory()->create([
        'email' => 'usuario@tempo.test',
        'password' => Hash::make('ContrasenaCorrecta123!'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'usuario@tempo.test',
        'password' => 'ContrasenaIncorrecta123!',
    ]);

    $response->assertUnauthorized();

    $response->assertExactJson([
        'message' => 'Credenciales incorrectas.',
    ]);
}

public function test_login_succeeds_with_valid_credentials(): void
{
    $user = User::factory()->create([
        'email' => 'usuario@tempo.test',
        'password' => Hash::make('ContrasenaCorrecta123!'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'usuario@tempo.test',
        'password' => 'ContrasenaCorrecta123!',
    ]);

    $response->assertOk();

    $response->assertJsonPath(
        'message',
        'Inicio de sesión exitoso.'
    );

    $response->assertJsonPath('token_type', 'Bearer');

    $response->assertJsonPath('user.id', $user->id);
    $response->assertJsonPath('user.email', $user->email);

    $this->assertNotEmpty($response->json('token'));

    $this->assertDatabaseCount('personal_access_tokens', 1);
}
}