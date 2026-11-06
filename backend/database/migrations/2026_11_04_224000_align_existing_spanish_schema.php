<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Completa el esquema español existente sin reemplazar tablas ni registros.
     *
     * Esta base fue creada antes de que el proyecto adoptara completamente el
     * contrato actual de la API. Las columnas se agregan de forma compatible
     * para que los modelos y controladores actuales puedan utilizarla.
     */
    public function up(): void
    {
        $this->alignUsers();
        $this->alignProjects();
        $this->alignTimeEntries();
    }

    private function alignUsers(): void
    {
        if (! Schema::hasTable('usuarios')) {
            return;
        }

        Schema::table('usuarios', function (Blueprint $table): void {
            if (! Schema::hasColumn('usuarios', 'rol')) {
                $table->string('rol', 30)->default('user');
            }

            if (! Schema::hasColumn('usuarios', 'correo_verificado_en')) {
                $table->timestamp('correo_verificado_en')->nullable();
            }

            if (! Schema::hasColumn('usuarios', 'token_recordatorio')) {
                $table->string('token_recordatorio', 100)->nullable();
            }
        });

        if (Schema::hasColumn('usuarios', 'roles_idroles')) {
            DB::table('usuarios')
                ->where('roles_idroles', 1)
                ->update(['rol' => 'admin']);
        }
    }

    private function alignProjects(): void
    {
        if (! Schema::hasTable('proyectos')) {
            return;
        }

        Schema::table('proyectos', function (Blueprint $table): void {
            if (! Schema::hasColumn('proyectos', 'codigo')) {
                $table->string('codigo')->nullable()->after('nombre');
            }

            if (Schema::hasColumn('proyectos', 'cliente_id')) {
                $table->unsignedInteger('cliente_id')->nullable()->change();
            }

            if (Schema::hasColumn('proyectos', 'color')) {
                $table->string('color', 55)->nullable()->change();
            }

            if (Schema::hasColumn('proyectos', 'horas_estimadas')) {
                $table->decimal('horas_estimadas', 10, 2)->nullable()->change();
            }
        });
    }

    private function alignTimeEntries(): void
    {
        if (! Schema::hasTable('registros_horas')) {
            return;
        }

        Schema::table('registros_horas', function (Blueprint $table): void {
            if (! Schema::hasColumn('registros_horas', 'id_origen')) {
                $table->string('id_origen', 100)->nullable()->unique();
            }

            if (! Schema::hasColumn('registros_horas', 'usuario_id_origen')) {
                $table->string('usuario_id_origen', 100)->nullable();
            }

            if (! Schema::hasColumn('registros_horas', 'proyecto_id_origen')) {
                $table->string('proyecto_id_origen', 100)->nullable();
            }

            if (! Schema::hasColumn('registros_horas', 'tarea_id')) {
                $table->string('tarea_id', 100)->nullable();
            }

            if (! Schema::hasColumn('registros_horas', 'es_facturable')) {
                $table->boolean('es_facturable')->default(false);
            }

            if (! Schema::hasColumn('registros_horas', 'creado_en_origen')) {
                $table->timestamp('creado_en_origen')->nullable();
            }

            if (Schema::hasColumn('registros_horas', 'usuario_id')) {
                $table->unsignedInteger('usuario_id')->nullable()->change();
            }

            if (Schema::hasColumn('registros_horas', 'proyecto_id')) {
                $table->unsignedInteger('proyecto_id')->nullable()->change();
            }

            if (Schema::hasColumn('registros_horas', 'hora_inicio')) {
                $table->time('hora_inicio')->nullable()->change();
            }

            if (Schema::hasColumn('registros_horas', 'hora_fin')) {
                $table->time('hora_fin')->nullable()->change();
            }
        });
    }

    public function down(): void
    {
        // Migración deliberadamente no destructiva: no se eliminan columnas
        // que podrían contener datos agregados durante la operación normal.
    }
};
