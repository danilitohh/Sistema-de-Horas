<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->renameIfPresent('users', 'usuarios');
        $this->renameIfPresent('clients', 'clientes');
        $this->renameIfPresent('projects', 'proyectos');
        $this->renameIfPresent('time_entries', 'registros_horas');
    }

    public function down(): void
    {
        $this->renameIfPresent('registros_horas', 'time_entries');
        $this->renameIfPresent('proyectos', 'projects');
        $this->renameIfPresent('clientes', 'clients');
        $this->renameIfPresent('usuarios', 'users');
    }

    private function renameIfPresent(string $from, string $to): void
    {
        if (Schema::hasTable($from) && ! Schema::hasTable($to)) {
            Schema::rename($from, $to);
        }
    }
};
