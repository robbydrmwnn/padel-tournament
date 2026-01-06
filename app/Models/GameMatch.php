<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameMatch extends Model
{
    protected $table = 'matches';

    protected $fillable = [
        'category_id',
        'group_id',
        'team1_id',
        'team2_id',
        'court_id',
        'phase',
        'round',
        'scheduled_time',
        'team1_score',
        'team2_score',
        'winner_id',
        'status',
        'notes',
    ];

    protected $casts = [
        'scheduled_time' => 'datetime',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function team1(): BelongsTo
    {
        return $this->belongsTo(Participant::class, 'team1_id');
    }

    public function team2(): BelongsTo
    {
        return $this->belongsTo(Participant::class, 'team2_id');
    }

    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }

    public function winner(): BelongsTo
    {
        return $this->belongsTo(Participant::class, 'winner_id');
    }
}
