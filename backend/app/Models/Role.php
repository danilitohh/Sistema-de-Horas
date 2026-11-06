<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    protected $table = 'roles';

    protected $primaryKey = 'idroles';

    public $timestamps = false;

    public function getRouteKeyName(): string
    {
        return 'idroles';
    }

    protected $fillable = ['nombre'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'roles_idroles', 'idroles');
    }
}
