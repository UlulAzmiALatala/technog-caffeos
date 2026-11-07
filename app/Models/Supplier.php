<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $guarded = ['id'];

    public function cafe()
    {
        return $this->belongsTo(Cafe::class);
    }

    public function stockLogs()
    {
        return $this->hasMany(StockLog::class);
    }
}
