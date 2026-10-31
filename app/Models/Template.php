<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    protected $guarded = ['id'];
    protected $casts = ['layout_config' => 'array', 'is_active' => 'boolean'];

    public function cafes()
    {
        return $this->hasMany(Cafe::class);
    }
}
