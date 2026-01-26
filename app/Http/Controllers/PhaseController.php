<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\TournamentPhase;
use App\Models\Group;
use App\Models\GameMatch;
use App\Models\Participant;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;

class PhaseController extends Controller
{
    /**
     * Get standings for a group phase
     */
    public function getStandings(TournamentPhase $phase): JsonResponse
    {
        if ($phase->type !== 'group') {
            return response()->json(['error' => 'Standings only available for group phases'], 400);
        }

        $standings = [];
        $groups = $phase->groups()->with('participants')->get();

        foreach ($groups as $group) {
            $groupStandings = [];
            
            foreach ($group->participants as $participant) {
                // Get all completed matches for this participant in this group
                $matches = GameMatch::where('group_id', $group->id)
                    ->where('status', 'completed')
                    ->where(function ($query) use ($participant) {
                        $query->where('team1_id', $participant->id)
                              ->orWhere('team2_id', $participant->id);
                    })
                    ->get();

                $wins = 0;
                $losses = 0;
                $gamesWon = 0;
                $gamesLost = 0;
                $points = 0;

                foreach ($matches as $match) {
                    if ($match->team1_id == $participant->id) {
                        $gamesWon += $match->team1_score ?? 0;
                        $gamesLost += $match->team2_score ?? 0;
                        
                        if ($match->winner_id == $participant->id) {
                            $wins++;
                            $points += 2; // 2 points for a win
                        } else {
                            $losses++;
                        }
                    } else {
                        $gamesWon += $match->team2_score ?? 0;
                        $gamesLost += $match->team1_score ?? 0;
                        
                        if ($match->winner_id == $participant->id) {
                            $wins++;
                            $points += 2; // 2 points for a win
                        } else {
                            $losses++;
                        }
                    }
                }

                $gameDifference = $gamesWon - $gamesLost;

                $groupStandings[] = [
                    'participant' => $participant,
                    'wins' => $wins,
                    'losses' => $losses,
                    'games_won' => $gamesWon,
                    'games_lost' => $gamesLost,
                    'game_difference' => $gameDifference,
                    'points' => $points,
                    'matches_played' => $matches->count(),
                ];
            }

            // Sort by: 1) Points, 2) Game difference, 3) Games won
            usort($groupStandings, function ($a, $b) {
                if ($a['points'] !== $b['points']) {
                    return $b['points'] - $a['points'];
                }
                if ($a['game_difference'] !== $b['game_difference']) {
                    return $b['game_difference'] - $a['game_difference'];
                }
                return $b['games_won'] - $a['games_won'];
            });

            // Add ranking
            foreach ($groupStandings as $index => &$standing) {
                $standing['rank'] = $index + 1;
            }

            $standings[$group->name] = $groupStandings;
        }

        return response()->json($standings);
    }

    /**
     * Get advancing participants from a phase
     */
    public function getAdvancingParticipants(TournamentPhase $phase): JsonResponse
    {
        if ($phase->type !== 'group') {
            return response()->json(['error' => 'Advancement only available from group phases'], 400);
        }

        $advancingParticipants = [];
        $groups = $phase->groups()->with('participants')->get();

        foreach ($groups as $group) {
            $groupStandings = $this->calculateGroupStandings($group);
            
            // Take top N participants based on teams_advance_per_group
            $advancing = array_slice($groupStandings, 0, $phase->teams_advance_per_group);
            
            foreach ($advancing as $standing) {
                $advancingParticipants[] = [
                    'participant' => $standing['participant'],
                    'group' => $group->name,
                    'rank' => $standing['rank'],
                    'points' => $standing['points'],
                ];
            }
        }

        return response()->json($advancingParticipants);
    }

    /**
     * Calculate standings for a single group
     */
    private function calculateGroupStandings(Group $group): array
    {
        $standings = [];
        
        foreach ($group->participants as $participant) {
            $matches = GameMatch::where('group_id', $group->id)
                ->where('status', 'completed')
                ->where(function ($query) use ($participant) {
                    $query->where('team1_id', $participant->id)
                          ->orWhere('team2_id', $participant->id);
                })
                ->get();

            $wins = 0;
            $losses = 0;
            $gamesWon = 0;
            $gamesLost = 0;
            $points = 0;

            foreach ($matches as $match) {
                if ($match->team1_id == $participant->id) {
                    $gamesWon += $match->team1_score ?? 0;
                    $gamesLost += $match->team2_score ?? 0;
                    
                    if ($match->winner_id == $participant->id) {
                        $wins++;
                        $points += 2;
                    } else {
                        $losses++;
                    }
                } else {
                    $gamesWon += $match->team2_score ?? 0;
                    $gamesLost += $match->team1_score ?? 0;
                    
                    if ($match->winner_id == $participant->id) {
                        $wins++;
                        $points += 2;
                    } else {
                        $losses++;
                    }
                }
            }

            $gameDifference = $gamesWon - $gamesLost;

            $standings[] = [
                'participant' => $participant,
                'wins' => $wins,
                'losses' => $losses,
                'games_won' => $gamesWon,
                'games_lost' => $gamesLost,
                'game_difference' => $gameDifference,
                'points' => $points,
                'matches_played' => $matches->count(),
            ];
        }

        // Sort standings
        usort($standings, function ($a, $b) {
            if ($a['points'] !== $b['points']) {
                return $b['points'] - $a['points'];
            }
            if ($a['game_difference'] !== $b['game_difference']) {
                return $b['game_difference'] - $a['game_difference'];
            }
            return $b['games_won'] - $a['games_won'];
        });

        // Add ranking
        foreach ($standings as $index => &$standing) {
            $standing['rank'] = $index + 1;
        }

        return $standings;
    }

    /**
     * Assign participants to next phase based on previous phase results
     */
    public function assignFromPreviousPhase(Request $request, Category $category, TournamentPhase $phase): RedirectResponse
    {
        $previousPhase = $category->phases()
            ->where('order', '<', $phase->order)
            ->orderBy('order', 'desc')
            ->first();

        if (!$previousPhase) {
            return back()->with('error', 'No previous phase found');
        }

        if ($previousPhase->type !== 'group') {
            return back()->with('error', 'Can only assign from group phases');
        }

        // Get advancing participants from previous phase
        $advancingParticipants = [];
        $previousGroups = $previousPhase->groups()->with('participants')->get();

        foreach ($previousGroups as $group) {
            $groupStandings = $this->calculateGroupStandings($group);
            
            // Take top N participants
            $advancing = array_slice($groupStandings, 0, $previousPhase->teams_advance_per_group);
            
            foreach ($advancing as $standing) {
                $advancingParticipants[] = [
                    'participant' => $standing['participant'],
                    'group' => $group,
                    'rank' => $standing['rank'],
                ];
            }
        }

        // If current phase is a group phase, distribute participants
        if ($phase->type === 'group') {
            $currentGroups = $phase->groups()->orderBy('order')->get();
            
            if ($currentGroups->isEmpty()) {
                return back()->with('error', 'Please create groups for this phase first');
            }

            // Distribute participants evenly across groups
            foreach ($advancingParticipants as $index => $data) {
                $groupIndex = $index % $currentGroups->count();
                $currentGroups[$groupIndex]->participants()->attach($data['participant']->id);
            }

            return back()->with('success', count($advancingParticipants) . ' participants assigned to ' . $phase->name);
        }

        return back()->with('info', 'Manual match setup required for knockout phases');
    }

    /**
     * Resolve a match template (e.g., "1st_group_A") to an actual participant
     */
    public function resolveMatchTemplate(string $template, TournamentPhase $previousPhase): ?Participant
    {
        // Parse template: format is "Nth_group_X" where N is rank (1st, 2nd) and X is group letter
        // Example: "1st_group_A", "2nd_group_B"
        
        if (!preg_match('/^(\d+)(st|nd|rd|th)_group_([A-Z])$/', $template, $matches)) {
            return null;
        }

        $rank = (int)$matches[1];
        $groupLetter = $matches[3];
        $groupName = 'Group ' . $groupLetter;

        // Find the group
        $group = $previousPhase->groups()->where('name', $groupName)->first();
        
        if (!$group) {
            return null;
        }

        // Calculate standings for this group
        $standings = $this->calculateGroupStandings($group);

        // Get participant at the specified rank
        if (isset($standings[$rank - 1])) {
            return $standings[$rank - 1]['participant'];
        }

        return null;
    }

    /**
     * Resolve all template matches for a phase
     */
    public function resolvePhaseMatches(Request $request, Category $category, TournamentPhase $phase): RedirectResponse
    {
        $previousPhase = $category->phases()
            ->where('order', '<', $phase->order)
            ->orderBy('order', 'desc')
            ->first();

        if (!$previousPhase) {
            return back()->with('error', 'No previous phase to resolve from');
        }

        // Get all matches in this phase with templates
        $matches = $phase->matches()
            ->whereNotNull('team1_template')
            ->orWhereNotNull('team2_template')
            ->get();

        $resolved = 0;
        foreach ($matches as $match) {
            $updated = false;

            if ($match->team1_template && !$match->team1_id) {
                $participant = $this->resolveMatchTemplate($match->team1_template, $previousPhase);
                if ($participant) {
                    $match->team1_id = $participant->id;
                    $updated = true;
                }
            }

            if ($match->team2_template && !$match->team2_id) {
                $participant = $this->resolveMatchTemplate($match->team2_template, $previousPhase);
                if ($participant) {
                    $match->team2_id = $participant->id;
                    $updated = true;
                }
            }

            if ($updated) {
                $match->save();
                $resolved++;
            }
        }

        return back()->with('success', "Resolved $resolved matches for {$phase->name}");
    }
}
