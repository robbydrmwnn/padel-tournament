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
        'group_tiebreaker_points',
        'group_tiebreaker_two_point_difference',
        'knockout_best_of_games',
        'knockout_scoring_type',
        'knockout_advantage_limit',
        'knockout_tiebreaker_points',
        'knockout_tiebreaker_two_point_difference',
        'warmup_minutes',
    ];

    protected $casts = [
        'group_phase_completed' => 'boolean',
        'group_tiebreaker_two_point_difference' => 'boolean',
        'knockout_tiebreaker_two_point_difference' => 'boolean',
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

    public function phases(): HasMany
    {
        return $this->hasMany(TournamentPhase::class)->orderBy('order');
    }

    public function currentPhase()
    {
        return $this->phases()->where('is_completed', false)->orderBy('order')->first();
    }

    public function matches(): HasMany
    {
        return $this->hasMany(GameMatch::class);
    }
}
