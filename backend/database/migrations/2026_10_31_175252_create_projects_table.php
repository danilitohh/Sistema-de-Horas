<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // La base de datos existente ya usa el esquema normalizado en español.
        // No crear el esquema legado en inglés cuando `proyectos` ya existe.
        if (Schema::hasTable('proyectos')) {
            return;
        }

        if (Schema::hasTable('projects')) {
            return;
        }

        Schema::create('projects', function (Blueprint $table) {
            $table->id();

            $table->foreignId('client_id')
                ->nullable()
                ->constrained('clients')
                ->nullOnDelete();

            $table->string('name');
            $table->string('code')->nullable();
            $table->string('color', 7)->nullable();
            $table->decimal('estimated_hours', 8, 2)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('proyectos')) {
            return;
        }

        Schema::dropIfExists('projects');
    }
};
