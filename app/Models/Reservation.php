<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'reservation_time' => 'datetime',
    ];

    public function cafe()
    {
        return $this->belongsTo(Cafe::class);
    }

    public function table()
    {
        return $this->belongsTo(DiningTable::class, 'table_id');
    }
}
