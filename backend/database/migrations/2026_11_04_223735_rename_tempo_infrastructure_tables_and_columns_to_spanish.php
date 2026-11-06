<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach ([
            ['cache', 'almacen_temporal'],
            ['cache_locks', 'bloqueos_temporales'],
            ['sessions', 'sesiones'],
            ['password_reset_tokens', 'tokens_restablecimiento'],
            ['jobs', 'trabajos'],
            ['job_batches', 'lotes_trabajos'],
            ['failed_jobs', 'trabajos_fallidos'],
            ['personal_access_tokens', 'tokens_acceso'],
            ['migrations', 'migraciones'],
        ] as [$from, $to]) {
            $this->renameTableIfPresent($from, $to);
        }

        foreach ($this->columnRenames() as [$table, $from, $to]) {
            $this->renameColumnIfPresent($table, $from, $to);
        }
    }

    public function down(): void
    {
        foreach (array_reverse($this->columnRenames()) as [$table, $from, $to]) {
            $this->renameColumnIfPresent($table, $to, $from);
        }

        foreach (array_reverse([
            ['cache', 'almacen_temporal'],
            ['cache_locks', 'bloqueos_temporales'],
            ['sessions', 'sesiones'],
            ['password_reset_tokens', 'tokens_restablecimiento'],
            ['jobs', 'trabajos'],
            ['job_batches', 'lotes_trabajos'],
            ['failed_jobs', 'trabajos_fallidos'],
            ['personal_access_tokens', 'tokens_acceso'],
            ['migrations', 'migraciones'],
        ]) as [$from, $to]) {
            $this->renameTableIfPresent($to, $from);
        }
    }

    /**
     * @return array<int, array{0: string, 1: string, 2: string}>
     */
    private function columnRenames(): array
    {
        return [
            ['almacen_temporal', 'key', 'clave'],
            ['almacen_temporal', 'value', 'valor'],
            ['almacen_temporal', 'expiration', 'expiracion'],
            ['bloqueos_temporales', 'key', 'clave'],
            ['bloqueos_temporales', 'owner', 'propietario'],
            ['bloqueos_temporales', 'expiration', 'expiracion'],
            ['sesiones', 'user_id', 'usuario_id'],
            ['sesiones', 'ip_address', 'direccion_ip'],
            ['sesiones', 'user_agent', 'agente_usuario'],
            ['sesiones', 'payload', 'datos'],
            ['sesiones', 'last_activity', 'ultima_actividad'],
            ['tokens_restablecimiento', 'email', 'correo'],
            ['tokens_restablecimiento', 'created_at', 'creado_en'],
            ['trabajos', 'queue', 'cola'],
            ['trabajos', 'payload', 'datos'],
            ['trabajos', 'attempts', 'intentos'],
            ['trabajos', 'reserved_at', 'reservado_en'],
            ['trabajos', 'available_at', 'disponible_en'],
            ['trabajos', 'created_at', 'creado_en'],
            ['lotes_trabajos', 'name', 'nombre'],
            ['lotes_trabajos', 'total_jobs', 'trabajos_totales'],
            ['lotes_trabajos', 'pending_jobs', 'trabajos_pendientes'],
            ['lotes_trabajos', 'failed_jobs', 'trabajos_fallidos'],
            ['lotes_trabajos', 'failed_job_ids', 'ids_trabajos_fallidos'],
            ['lotes_trabajos', 'options', 'opciones'],
            ['lotes_trabajos', 'cancelled_at', 'cancelado_en'],
            ['lotes_trabajos', 'created_at', 'creado_en'],
            ['lotes_trabajos', 'finished_at', 'finalizado_en'],
            ['trabajos_fallidos', 'uuid', 'identificador'],
            ['trabajos_fallidos', 'connection', 'conexion'],
            ['trabajos_fallidos', 'queue', 'cola'],
            ['trabajos_fallidos', 'payload', 'datos'],
            ['trabajos_fallidos', 'exception', 'excepcion'],
            ['trabajos_fallidos', 'failed_at', 'fallido_en'],
            ['tokens_acceso', 'tokenable_type', 'tipo_propietario'],
            ['tokens_acceso', 'tokenable_id', 'id_propietario'],
            ['tokens_acceso', 'name', 'nombre'],
            ['tokens_acceso', 'abilities', 'permisos'],
            ['tokens_acceso', 'last_used_at', 'usado_en'],
            ['tokens_acceso', 'expires_at', 'expira_en'],
            ['tokens_acceso', 'created_at', 'creado_en'],
            ['tokens_acceso', 'updated_at', 'actualizado_en'],
            ['migraciones', 'migration', 'migracion'],
            ['migraciones', 'batch', 'lote'],
        ];
    }

    private function renameTableIfPresent(string $from, string $to): void
    {
        if (Schema::hasTable($from) && ! Schema::hasTable($to)) {
            Schema::rename($from, $to);
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
