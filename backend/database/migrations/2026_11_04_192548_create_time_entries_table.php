<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // La base conectada ya contiene `registros_horas`, que es la tabla
        // canónica del dominio. Evitar crear una segunda tabla en inglés.
        if (Schema::hasTable('registros_horas') || Schema::hasTable('time_entries')) {
            return;
        }

        Schema::create('time_entries', function (Blueprint $table) {
            $table->id();

            // Identificadores de registros existentes en React
            $table->string('legacy_id', 100)->nullable()->unique();
            $table->string('legacy_user_id', 100)->nullable();
            $table->string('legacy_project_id', 100)->nullable();

            // Relaciones con usuarios y proyectos reales
            $table->foreignId('user_id')->nullable()
                ->constrained('users')->restrictOnDelete();

            $table->foreignId('project_id')->nullable()
                ->constrained('projects')->nullOnDelete();

            // La tabla de tareas se implementara posteriormente
            $table->string('task_id', 100)->nullable();

            // Informacion del registro de horas
            $table->text('description')->nullable();
            $table->date('entry_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->unsignedInteger('duration_minutes');
            $table->boolean('is_billable')->default(false);

            // Fecha original del registro importado
            $table->timestamp('legacy_created_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('registros_horas')) {
            return;
        }

        Schema::dropIfExists('time_entries');
    }
};
