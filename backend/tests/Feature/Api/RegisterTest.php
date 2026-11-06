<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receive_a_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => '  Usuario Nuevo  ',
            'email' => ' USUARIO@TEMPO.TEST ',
            'password' => 'ContrasenaNueva123!',
            'password_confirmation' => 'ContrasenaNueva123!',
        ]);

        $response->assertCreated()
            ->assertJsonPath('message', 'Usuario registrado correctamente.')
            ->assertJsonPath('user.name', 'Usuario Nuevo')
            ->assertJsonPath('user.email', 'usuario@tempo.test')
            ->assertJsonPath('user.role', 'user');

        $this->assertNotEmpty($response->json('token'));
        $this->assertDatabaseHas('usuarios', [
            'nombre' => 'Usuario Nuevo',
            'correo' => 'usuario@tempo.test',
            'rol' => 'user',
        ]);

        $user = User::where('correo', 'usuario@tempo.test')->firstOrFail();

        $this->assertTrue(Hash::check(
            'ContrasenaNueva123!',
            $user->contrasena
        ));
    }

    public function test_registration_cannot_assign_admin_role(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Intento Admin',
            'email' => 'intento@tempo.test',
            'role' => 'admin',
            'password' => 'ContrasenaNueva123!',
            'password_confirmation' => 'ContrasenaNueva123!',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.role', 'user');
    }

    public function test_registration_rejects_duplicate_email(): void
    {
        User::factory()->create([
            'email' => 'existente@tempo.test',
        ]);

        $this->postJson('/api/register', [
            'name' => 'Otro Usuario',
            'email' => ' EXISTENTE@TEMPO.TEST ',
            'password' => 'ContrasenaNueva123!',
            'password_confirmation' => 'ContrasenaNueva123!',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_registration_requires_valid_password_data(): void
    {
        $this->postJson('/api/register', [
            'name' => '',
            'email' => 'correo-invalido',
            'password' => 'corta',
            'password_confirmation' => 'diferente',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_registered_user_can_login_with_the_new_account(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Usuario para Login',
            'email' => 'login@tempo.test',
            'password' => 'ContrasenaNueva123!',
            'password_confirmation' => 'ContrasenaNueva123!',
        ])->assertCreated();

        $this->postJson('/api/login', [
            'email' => ' LOGIN@TEMPO.TEST ',
            'password' => 'ContrasenaNueva123!',
        ])
            ->assertOk()
            ->assertJsonPath('user.email', 'login@tempo.test');
    }
}
