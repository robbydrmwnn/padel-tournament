<?php

namespace App\Services;

use App\Models\Category;
use App\Models\GameMatch;
use App\Models\Group;
use App\Models\TournamentPhase;

class StandingsCalculator
{
    /**
     * Calculate standings for a single group.
     *
     * Output rows:
     * - participant
     * - played, won, draw, lost
     * - games_won, games_lost, game_diff
     * - points (Win=2, Draw=0)
     */
    public static function groupStandings(Group $group, Category $category, ?TournamentPhase $phase = null): array
    {
        $participantMode = $category->participant_mode ?? 'team';

        $group->loadMissing('participants');
        $participants = $group->participants;

        $phaseId = $phase?->id ?? $group->phase_id;

        $matchesQuery = GameMatch::query()
            ->where('group_id', $group->id)
            ->where('status', 'completed');

        if (!empty($phaseId)) {
            $matchesQuery->where('phase_id', $phaseId);
        }

        $matches = $matchesQuery->get();

        $participantIds = $participants->pluck('id')->flip(); // fast lookup

        $statsById = [];
        foreach ($participants as $p) {
            $statsById[$p->id] = [
                'participant' => $p,
                'played' => 0,
                'won' => 0,
                'draw' => 0,
                'lost' => 0,
                'games_won' => 0,
                'games_lost' => 0,
                'game_diff' => 0,
                'points' => 0,
            ];
        }

        foreach ($matches as $match) {
            if ($participantMode === 'individual') {
                $side1 = array_values(array_filter([
                    $match->side1_player1_id,
                    $match->side1_player2_id,
                ]));
                $side2 = array_values(array_filter([
                    $match->side2_player1_id,
                    $match->side2_player2_id,
                ]));

                if (count($side1) !== 2 || count($side2) !== 2) {
                    continue;
                }

                $side1Score = $match->team1_score ?? 0;
                $side2Score = $match->team2_score ?? 0;

                foreach ($side1 as $pid) {
                    if (!isset($participantIds[$pid])) continue;
                    $statsById[$pid]['played']++;
                    $statsById[$pid]['games_won'] += $side1Score;
                    $statsById[$pid]['games_lost'] += $side2Score;
                }

                foreach ($side2 as $pid) {
                    if (!isset($participantIds[$pid])) continue;
                    $statsById[$pid]['played']++;
                    $statsById[$pid]['games_won'] += $side2Score;
                    $statsById[$pid]['games_lost'] += $side1Score;
                }

                $winnerSide = $match->winner_side;
                if (empty($winnerSide) && !empty($match->winner_id)) {
                    // Fallback for legacy updates/scoring flows that set winner_id but not winner_side
                    if (!empty($match->team1_id) && $match->winner_id == $match->team1_id) $winnerSide = 1;
                    if (!empty($match->team2_id) && $match->winner_id == $match->team2_id) $winnerSide = 2;
                }

                if ($winnerSide === 1) {
                    foreach ($side1 as $pid) {
                        if (!isset($participantIds[$pid])) continue;
                        $statsById[$pid]['won']++;
                        $statsById[$pid]['points'] += 2;
                    }
                    foreach ($side2 as $pid) {
                        if (!isset($participantIds[$pid])) continue;
                        $statsById[$pid]['lost']++;
                    }
                } elseif ($winnerSide === 2) {
                    foreach ($side2 as $pid) {
                        if (!isset($participantIds[$pid])) continue;
                        $statsById[$pid]['won']++;
                        $statsById[$pid]['points'] += 2;
                    }
                    foreach ($side1 as $pid) {
                        if (!isset($participantIds[$pid])) continue;
                        $statsById[$pid]['lost']++;
                    }
                } else {
                    // Draw/unknown
                    foreach (array_merge($side1, $side2) as $pid) {
                        if (!isset($participantIds[$pid])) continue;
                        $statsById[$pid]['draw']++;
                    }
                }

                continue;
            }

            // Team mode
            $t1 = $match->team1_id;
            $t2 = $match->team2_id;
            if (empty($t1) || empty($t2)) {
                continue;
            }

            if (!isset($participantIds[$t1]) || !isset($participantIds[$t2])) {
                continue;
            }

            $t1Score = $match->team1_score ?? 0;
            $t2Score = $match->team2_score ?? 0;

            $statsById[$t1]['played']++;
            $statsById[$t2]['played']++;

            $statsById[$t1]['games_won'] += $t1Score;
            $statsById[$t1]['games_lost'] += $t2Score;
            $statsById[$t2]['games_won'] += $t2Score;
            $statsById[$t2]['games_lost'] += $t1Score;

            if ($match->winner_id === $t1) {
                $statsById[$t1]['won']++;
                $statsById[$t1]['points'] += 2;
                $statsById[$t2]['lost']++;
            } elseif ($match->winner_id === $t2) {
                $statsById[$t2]['won']++;
                $statsById[$t2]['points'] += 2;
                $statsById[$t1]['lost']++;
            } else {
                $statsById[$t1]['draw']++;
                $statsById[$t2]['draw']++;
            }
        }

        foreach ($statsById as &$row) {
            $row['game_diff'] = $row['games_won'] - $row['games_lost'];
        }
        unset($row);

        $standings = array_values($statsById);

        usort($standings, function ($a, $b) {
            if ($a['points'] !== $b['points']) return $b['points'] <=> $a['points'];
            if ($a['game_diff'] !== $b['game_diff']) return $b['game_diff'] <=> $a['game_diff'];
            if ($a['games_won'] !== $b['games_won']) return $b['games_won'] <=> $a['games_won'];
            return $a['games_lost'] <=> $b['games_lost']; // fewer is better
        });

        return $standings;
    }
}

