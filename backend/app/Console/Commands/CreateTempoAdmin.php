<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

#[Signature('app:create-tempo-admin')]
#[Description('Crear un administrador en SQLite local de TEMPO')]
class CreateTempoAdmin extends Command
{
    public function handle(): int
    {
        $esperada = realpath(database_path('database.sqlite'));
        $configurada = config('database.connections.sqlite.database');

        $actual = is_string($configurada)
            ? realpath($configurada)
            : false;

        if (
            config('database.default') !== 'sqlite' ||
            $esperada === false ||
            $actual === false ||
            $actual !== $esperada
        ) {
            $this->error(
                'Operación bloqueada: debes utilizar SQLite local de TEMPO.'
            );

            return self::FAILURE;
        }

        $nombre = trim((string) $this->ask('Nombre completo'));
        $correo = strtolower(trim(
            (string) $this->ask('Correo electrónico')
        ));

        $clave = $this->secret('Contraseña segura');
        $confirmacion = $this->secret('Confirmar contraseña');

        $validador = Validator::make([
            'name' => $nombre,
            'email' => $correo,
            'password' => $clave,
            'password_confirmation' => $confirmacion,
        ], [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],
            'password' => [
                'required',
                'confirmed',
                Password::min(12)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ]);

        if ($validador->fails()) {
            foreach ($validador->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $admin = new User();
        $admin->name = $nombre;
        $admin->email = $correo;
        $admin->password = Hash::make($clave);
        $admin->role = 'admin';
        $admin->save();

        $this->info(
            'Administrador de TEMPO creado correctamente.'
        );

        return self::SUCCESS;
    }
}