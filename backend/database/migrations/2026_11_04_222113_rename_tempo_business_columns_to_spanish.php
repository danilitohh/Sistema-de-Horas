<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach ([
            ['usuarios', 'name', 'nombre'],
            ['usuarios', 'email', 'correo'],
            ['usuarios', 'email_verified_at', 'correo_verificado_en'],
            ['usuarios', 'password', 'contrasena'],
            ['usuarios', 'remember_token', 'token_recordatorio'],
            ['usuarios', 'role', 'rol'],
            ['usuarios', 'created_at', 'creado_en'],
            ['usuarios', 'updated_at', 'actualizado_en'],
            ['clientes', 'name', 'nombre'],
            ['clientes', 'created_at', 'creado_en'],
            ['clientes', 'updated_at', 'actualizado_en'],
            ['proyectos', 'client_id', 'cliente_id'],
            ['proyectos', 'name', 'nombre'],
            ['proyectos', 'code', 'codigo'],
            ['proyectos', 'estimated_hours', 'horas_estimadas'],
            ['proyectos', 'created_at', 'creado_en'],
            ['proyectos', 'updated_at', 'actualizado_en'],
            ['registros_horas', 'legacy_id', 'id_origen'],
            ['registros_horas', 'legacy_user_id', 'usuario_id_origen'],
            ['registros_horas', 'legacy_project_id', 'proyecto_id_origen'],
            ['registros_horas', 'user_id', 'usuario_id'],
            ['registros_horas', 'project_id', 'proyecto_id'],
            ['registros_horas', 'task_id', 'tarea_id'],
            ['registros_horas', 'description', 'descripcion'],
            ['registros_horas', 'entry_date', 'fecha'],
            ['registros_horas', 'start_time', 'hora_inicio'],
            ['registros_horas', 'end_time', 'hora_fin'],
            ['registros_horas', 'duration_minutes', 'duracion_minutos'],
            ['registros_horas', 'is_billable', 'es_facturable'],
            ['registros_horas', 'legacy_created_at', 'creado_en_origen'],
            ['registros_horas', 'created_at', 'creado_en'],
            ['registros_horas', 'updated_at', 'actualizado_en'],
        ] as [$table, $from, $to]) {
            $this->renameColumnIfPresent($table, $from, $to);
        }
    }

    public function down(): void
    {
        foreach ([
            ['usuarios', 'nombre', 'name'],
            ['usuarios', 'correo', 'email'],
            ['usuarios', 'correo_verificado_en', 'email_verified_at'],
            ['usuarios', 'contrasena', 'password'],
            ['usuarios', 'token_recordatorio', 'remember_token'],
            ['usuarios', 'rol', 'role'],
            ['usuarios', 'creado_en', 'created_at'],
            ['usuarios', 'actualizado_en', 'updated_at'],
            ['clientes', 'nombre', 'name'],
            ['clientes', 'creado_en', 'created_at'],
            ['clientes', 'actualizado_en', 'updated_at'],
            ['proyectos', 'cliente_id', 'client_id'],
            ['proyectos', 'nombre', 'name'],
            ['proyectos', 'codigo', 'code'],
            ['proyectos', 'horas_estimadas', 'estimated_hours'],
            ['proyectos', 'creado_en', 'created_at'],
            ['proyectos', 'actualizado_en', 'updated_at'],
            ['registros_horas', 'id_origen', 'legacy_id'],
            ['registros_horas', 'usuario_id_origen', 'legacy_user_id'],
            ['registros_horas', 'proyecto_id_origen', 'legacy_project_id'],
            ['registros_horas', 'usuario_id', 'user_id'],
            ['registros_horas', 'proyecto_id', 'project_id'],
            ['registros_horas', 'tarea_id', 'task_id'],
            ['registros_horas', 'descripcion', 'description'],
            ['registros_horas', 'fecha', 'entry_date'],
            ['registros_horas', 'hora_inicio', 'start_time'],
            ['registros_horas', 'hora_fin', 'end_time'],
            ['registros_horas', 'duracion_minutos', 'duration_minutes'],
            ['registros_horas', 'es_facturable', 'is_billable'],
            ['registros_horas', 'creado_en_origen', 'legacy_created_at'],
            ['registros_horas', 'creado_en', 'created_at'],
            ['registros_horas', 'actualizado_en', 'updated_at'],
        ] as [$table, $from, $to]) {
            $this->renameColumnIfPresent($table, $from, $to);
        }
    }

    private function renameColumnIfPresent(string $tableName, string $from, string $to): void
    {
        if (
            ! Schema::hasTable($tableName)
            || ! Schema::hasColumn($tableName, $from)
            || Schema::hasColumn($tableName, $to)
        ) {
            return;
        }

        Schema::table($tableName, function (Blueprint $table) use ($from, $to): void {
            $table->renameColumn($from, $to);
        });
    }
};
