<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    protected $guarded = ['id'];
    public function menus()
    {
        return $this->belongsToMany(Menu::class, 'menu_stocks')->withPivot('qty_needed');
    }
}
