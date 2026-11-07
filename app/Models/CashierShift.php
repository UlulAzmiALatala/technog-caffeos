<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashierShift extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function cafe()
    {
        return $this->belongsTo(Cafe::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
