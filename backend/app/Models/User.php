<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    protected $table = 'usuarios';

    public const CREATED_AT = 'creado_en';

    public const UPDATED_AT = 'actualizado_en';

    protected $fillable = ['nombre', 'correo', 'contrasena', 'roles_idroles'];

    protected $hidden = ['contrasena'];

    use Notifiable;

    protected function casts(): array
    {
        return ['contrasena' => 'hashed'];
    }

    public function getAuthPasswordName(): string
    {
        return 'contrasena';
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'roles_idroles', 'idroles');
    }

    public function hasRole(string $role): bool
    {
        return match (strtolower($role)) {
            'admin', 'administrador' => (int) $this->roles_idroles === 1,
            'user', 'usuario', 'colaborador' => (int) $this->roles_idroles === 2,
            default => false,
        };
    }

    public function roleCode(): string
    {
        return (int) $this->roles_idroles === 1 ? 'admin' : 'usuario';
    }
}
