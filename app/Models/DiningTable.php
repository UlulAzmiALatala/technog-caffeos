<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiningTable extends Model
{
    protected $table = 'tables';
    protected $guarded = ['id'];

    public function cafe()
    {
        return $this->belongsTo(Cafe::class);
    }
}
