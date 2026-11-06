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
#[Description('Crear un administrador en MySQL local de TEMPO')]
class CreateTempoAdmin extends Command
{
    public function handle(): int
    {
        $conexion = (string) config('database.default');
        $base = (string) config('database.connections.tempo_mysql.database');
        $host = strtolower((string) config('database.connections.tempo_mysql.host'));

        if (
            $conexion !== 'tempo_mysql' ||
            $base !== 'tempo_dev' ||
            ! in_array($host, ['127.0.0.1', 'localhost', '::1'], true)
        ) {
            $this->error(
                'Operación bloqueada: debes utilizar el MySQL local tempo_dev.'
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
                'unique:usuarios,correo',
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

        $admin = new User;
        $admin->nombre = $nombre;
        $admin->correo = $correo;
        $admin->contrasena = Hash::make($clave);
        $admin->rol = 'admin';
        $admin->save();

        $this->info(
            'Administrador de TEMPO creado correctamente.'
        );

        return self::SUCCESS;
    }
}
