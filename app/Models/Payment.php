<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    // Fungsi relasi balik ke tabel Orders yang dicari oleh PosController
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
