<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Project extends Model
{
    use HasFactory;

    protected $table = 'proyectos';

    public const CREATED_AT = 'creado_en';

    public const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'cliente_id',
        'nombre',
        'codigo',
        'horas_estimadas',
        'client_id',
        'name',
        'code',
        'color',
        'estimated_hours',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'cliente_id');
    }

    public function getClientIdAttribute(): mixed
    {
        return $this->attributes['cliente_id'] ?? null;
    }

    public function setClientIdAttribute(mixed $value): void
    {
        $this->attributes['cliente_id'] = $value;
    }

    public function getNameAttribute(): ?string
    {
        return $this->attributes['nombre'] ?? null;
    }

    public function setNameAttribute(?string $value): void
    {
        $this->attributes['nombre'] = $value;
    }

    public function getCodeAttribute(): ?string
    {
        return $this->attributes['codigo'] ?? null;
    }

    public function setCodeAttribute(?string $value): void
    {
        $this->attributes['codigo'] = $value;
    }

    public function getEstimatedHoursAttribute(): mixed
    {
        return $this->attributes['horas_estimadas'] ?? null;
    }

    public function setEstimatedHoursAttribute(mixed $value): void
    {
        $this->attributes['horas_estimadas'] = $value;
    }
}
