<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cafe extends Model
{
    protected $guarded = ['id'];
    protected $casts = ['settings' => 'array', 'is_active' => 'boolean'];

    public function template()
    {
        return $this->belongsTo(Template::class);
    }
    public function users()
    {
        return $this->hasMany(User::class);
    }
    public function menus()
    {
        return $this->hasMany(Menu::class);
    }
    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }
    public function tables()
    {
        return $this->hasMany(DiningTable::class, 'cafe_id');
    }
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
