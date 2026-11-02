<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiToken extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function cafe()
    {
        return $this->belongsTo(Cafe::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function logs()
    {
        return $this->hasMany(AiChatLog::class);
    }
}
