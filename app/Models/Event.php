<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $fillable = [
        'name',
        'description',
        'start_date',
        'end_date',
        'location',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function courts(): HasMany
    {
        return $this->hasMany(Court::class);
    }
}
