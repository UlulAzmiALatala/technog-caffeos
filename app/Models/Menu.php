<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $guarded = ['id'];
    public function stocks()
    {
        return $this->belongsToMany(Stock::class, 'menu_stocks')->withPivot('qty_needed');
    }
}
