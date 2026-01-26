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
        'phase_id',
        'team1_id',
        'team2_id',
        'team1_template',
        'team2_template',
        'match_order',
        'court_id',
        'phase',
        'round',
        'scheduled_time',
        'team1_score',
        'team2_score',
        'winner_id',
        'status',
        'notes',
        'warmup_started_at',
        'warmup_ended_at',
        'warmup_skipped',
        'match_started_at',
        'match_ended_at',
        'score_details',
        'current_game_team1_points',
        'current_game_team2_points',
        'current_game_advantages',
        'current_server_team_id',
        'is_tiebreaker',
    ];

    protected $casts = [
        'scheduled_time' => 'datetime',
        'warmup_started_at' => 'datetime',
        'warmup_ended_at' => 'datetime',
        'match_started_at' => 'datetime',
        'match_ended_at' => 'datetime',
        'score_details' => 'array',
        'warmup_skipped' => 'boolean',
        'is_tiebreaker' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function tournamentPhase(): BelongsTo
    {
        return $this->belongsTo(TournamentPhase::class, 'phase_id');
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

    public function currentServerTeam(): BelongsTo
    {
        return $this->belongsTo(Participant::class, 'current_server_team_id');
    }
}
