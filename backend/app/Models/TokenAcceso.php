<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\MorphTo;
use Laravel\Sanctum\PersonalAccessToken;

class TokenAcceso extends PersonalAccessToken
{
    protected $table = 'tokens_acceso';

    public const CREATED_AT = 'creado_en';

    public const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'nombre',
        'token',
        'permisos',
        'expira_en',
    ];

    protected $hidden = [
        'token',
    ];

    protected $casts = [
        'permisos' => 'json',
        'usado_en' => 'datetime',
        'expira_en' => 'datetime',
        'creado_en' => 'datetime',
        'actualizado_en' => 'datetime',
    ];

    public function tokenable(): MorphTo
    {
        return $this->morphTo('tokenable', 'tipo_propietario', 'id_propietario');
    }

    public function can($ability): bool
    {
        return in_array('*', $this->permisos ?? [], true)
            || in_array($ability, $this->permisos ?? [], true);
    }

    public function cant($ability): bool
    {
        return ! $this->can($ability);
    }

    public function getNameAttribute(): ?string
    {
        return $this->attributes['nombre'] ?? null;
    }

    public function setNameAttribute(?string $value): void
    {
        $this->attributes['nombre'] = $value;
    }

    public function getAbilitiesAttribute(): array
    {
        return $this->getAttribute('permisos') ?? [];
    }

    public function setAbilitiesAttribute(array|string|null $value): void
    {
        $this->attributes['permisos'] = $value;
    }

    public function getCreatedAtAttribute(): mixed
    {
        return $this->getAttribute('creado_en');
    }

    public function setCreatedAtAttribute(mixed $value): void
    {
        $this->attributes['creado_en'] = $value;
    }

    public function getUpdatedAtAttribute(): mixed
    {
        return $this->getAttribute('actualizado_en');
    }

    public function setUpdatedAtAttribute(mixed $value): void
    {
        $this->attributes['actualizado_en'] = $value;
    }

    public function getLastUsedAtAttribute(): mixed
    {
        return $this->getAttribute('usado_en');
    }

    public function setLastUsedAtAttribute(mixed $value): void
    {
        $this->attributes['usado_en'] = $value;
    }

    public function getExpiresAtAttribute(): mixed
    {
        return $this->getAttribute('expira_en');
    }

    public function setExpiresAtAttribute(mixed $value): void
    {
        $this->attributes['expira_en'] = $value;
    }
}
