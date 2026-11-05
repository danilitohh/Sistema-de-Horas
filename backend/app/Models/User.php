<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Laravel\Sanctum\NewAccessToken;

#[Fillable([
    'nombre',
    'correo',
    'contrasena',
    'rol',
    'correo_verificado_en',
    'token_recordatorio',
    'name',
    'email',
    'password',
    'role',
    'email_verified_at',
    'remember_token',
])]
#[Hidden([
    'password',
    'remember_token',
    'contrasena',
    'token_recordatorio',
])]
class User extends Authenticatable
{
    protected $table = 'usuarios';

    public const CREATED_AT = 'creado_en';

    public const UPDATED_AT = 'actualizado_en';

    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'correo_verificado_en' => 'datetime',
            'contrasena' => 'hashed',
        ];
    }

    public function hasRole(string $role): bool
    {
        return $this->rol === $role;
    }

    public function getAuthPasswordName(): string
    {
        return 'contrasena';
    }

    public function getRememberTokenName(): string
    {
        return 'token_recordatorio';
    }

    public function tokens(): MorphMany
    {
        return $this->morphMany(TokenAcceso::class, 'propietario', 'tipo_propietario', 'id_propietario');
    }

    public function createToken(string $name, array $abilities = ['*'], ?DateTimeInterface $expiresAt = null): NewAccessToken
    {
        $plainTextToken = $this->generateTokenString();

        $token = $this->tokens()->create([
            'nombre' => $name,
            'token' => hash('sha256', $plainTextToken),
            'permisos' => $abilities,
            'expira_en' => $expiresAt,
        ]);

        return new NewAccessToken($token, $token->getKey().'|'.$plainTextToken);
    }

    public function getNameAttribute(): ?string
    {
        return $this->attributes['nombre'] ?? null;
    }

    public function setNameAttribute(?string $value): void
    {
        $this->attributes['nombre'] = $value;
    }

    public function getEmailAttribute(): ?string
    {
        return $this->attributes['correo'] ?? null;
    }

    public function setEmailAttribute(?string $value): void
    {
        $this->attributes['correo'] = $value;
    }

    public function getEmailVerifiedAtAttribute(): mixed
    {
        return $this->getAttribute('correo_verificado_en');
    }

    public function setEmailVerifiedAtAttribute(mixed $value): void
    {
        $this->attributes['correo_verificado_en'] = $value;
    }

    public function getPasswordAttribute(): mixed
    {
        return $this->attributes['contrasena'] ?? null;
    }

    public function setPasswordAttribute(?string $value): void
    {
        $this->attributes['contrasena'] = $value;
    }

    public function getRememberTokenAttribute(): mixed
    {
        return $this->attributes['token_recordatorio'] ?? null;
    }

    public function setRememberTokenAttribute(?string $value): void
    {
        $this->attributes['token_recordatorio'] = $value;
    }

    public function getRoleAttribute(): ?string
    {
        return $this->attributes['rol'] ?? null;
    }

    public function setRoleAttribute(?string $value): void
    {
        $this->attributes['rol'] = $value;
    }
}
