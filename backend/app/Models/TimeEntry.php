<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimeEntry extends Model
{
    protected $table = 'registros_horas';

    public const CREATED_AT = 'creado_en';

    public const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'id_origen',
        'usuario_id_origen',
        'proyecto_id_origen',
        'usuario_id',
        'proyecto_id',
        'tarea_id',
        'descripcion',
        'fecha',
        'hora_inicio',
        'hora_fin',
        'duracion_minutos',
        'es_facturable',
        'creado_en_origen',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'duracion_minutos' => 'integer',
            'es_facturable' => 'boolean',
            'creado_en_origen' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'proyecto_id');
    }
}
