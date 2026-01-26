<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TournamentPhase extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'type',
        'order',
        'number_of_groups',
        'teams_advance_per_group',
        'games_target',
        'scoring_type',
        'advantage_limit',
        'tiebreaker_points',
        'tiebreaker_two_point_difference',
        'is_completed',
        'is_final_phase',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'is_final_phase' => 'boolean',
        'tiebreaker_two_point_difference' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function groups(): HasMany
    {
        return $this->hasMany(Group::class, 'phase_id');
    }

    public function matches(): HasMany
    {
        return $this->hasMany(GameMatch::class, 'phase_id');
    }
}

