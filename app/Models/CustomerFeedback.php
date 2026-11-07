<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerFeedback extends Model
{
    protected $table = 'customer_feedbacks';
    protected $guarded = ['id'];

    protected $casts = [
        'is_resolved' => 'boolean',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function cafe()
    {
        return $this->belongsTo(Cafe::class);
    }
}
