<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $guarded = ['id'];

    public function cafe()
    {
        return $this->belongsTo(Cafe::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
