<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = [
        'event_id',
        'name',
        'description',
        'max_participants',
        'teams_advance_per_group',
        'group_phase_completed',
        'group_best_of_games',
        'group_scoring_type',
        'group_advantage_limit',
        'knockout_best_of_games',
        'knockout_scoring_type',
        'knockout_advantage_limit',
        'warmup_minutes',
    ];

    protected $casts = [
        'group_phase_completed' => 'boolean',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class);
    }

    public function groups(): HasMany
    {
        return $this->hasMany(Group::class);
    }

    public function matches(): HasMany
    {
        return $this->hasMany(GameMatch::class);
    }
}
