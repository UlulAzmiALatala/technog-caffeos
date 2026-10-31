<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $guarded = ['id'];

    public function cafe()
    {
        return $this->belongsTo(Cafe::class);
    }
    public function table()
    {
        return $this->belongsTo(DiningTable::class, 'table_id');
    }
    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
    public function delivery()
    {
        return $this->hasOne(Delivery::class);
    }
    public function aiToken()
    {
        return $this->hasOne(AiToken::class);
    }
}
