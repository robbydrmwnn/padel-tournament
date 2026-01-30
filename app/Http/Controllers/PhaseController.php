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
        
        // Ensure participants are loaded
        $group->load('participants');
        
        \Log::info('calculateGroupStandings', [
            'group_id' => $group->id,
            'group_name' => $group->name,
            'participants_count' => $group->participants->count(),
        ]);
        
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
     * Resolve a match template (e.g., "1st_group_A" or "winner_match_1") to an actual participant
     */
    public function resolveMatchTemplate(string $template, TournamentPhase $previousPhase): ?Participant
    {
        \Log::info('resolveMatchTemplate called', ['template' => $template, 'phase_id' => $previousPhase->id]);
        
        // Check if it's a "winner_match_X" template
        if (preg_match('/^winner_match_(.+)$/i', $template, $matches)) {
            return $this->resolveWinnerTemplate($matches[1], $previousPhase);
        }
        
        // Parse template: format is "Nth_group_X" where N is rank (1st, 2nd) and X is group letter
        // Example: "1st_group_A", "2nd_group_B", "1st_group_a"
        
        if (!preg_match('/^(\d+)(st|nd|rd|th)_group_([A-Za-z])$/i', $template, $matches)) {
            \Log::warning('Template regex did not match', ['template' => $template]);
            return null;
        }

        $rank = (int)$matches[1];
        $groupLetter = strtoupper($matches[3]);  // Normalize to uppercase

        \Log::info('Template parsed', ['rank' => $rank, 'groupLetter' => $groupLetter]);

        // Find the group - try multiple naming conventions
        $possibleNames = [
            $groupLetter,                    // "A"
            'Group ' . $groupLetter,         // "Group A"
            'Group' . $groupLetter,          // "GroupA"
            strtolower($groupLetter),        // "a"
            'group ' . strtolower($groupLetter), // "group a"
        ];
        
        $group = null;
        foreach ($possibleNames as $name) {
            $group = $previousPhase->groups()->whereRaw('LOWER(name) = ?', [strtolower($name)])->first();
            if ($group) {
                \Log::info('Group found with name pattern', ['pattern' => $name, 'actual_name' => $group->name]);
                break;
            }
        }
        
        if (!$group) {
            $availableGroups = $previousPhase->groups()->pluck('name')->toArray();
            \Log::warning('Group not found', [
                'groupLetter' => $groupLetter,
                'triedNames' => $possibleNames,
                'availableGroups' => $availableGroups,
            ]);
            return null;
        }

        \Log::info('Group found', ['group_id' => $group->id, 'group_name' => $group->name]);

        // Calculate standings for this group
        $standings = $this->calculateGroupStandings($group);

        \Log::info('Standings calculated', [
            'count' => count($standings),
            'standings' => array_map(fn($s) => [
                'participant_id' => $s['participant']->id ?? null,
                'participant_name' => $s['participant']->name ?? null,
                'wins' => $s['wins'] ?? 0,
                'points' => $s['points'] ?? 0,
            ], $standings),
        ]);

        // Get participant at the specified rank
        if (isset($standings[$rank - 1])) {
            \Log::info('Participant found at rank', ['rank' => $rank, 'participant_id' => $standings[$rank - 1]['participant']->id]);
            return $standings[$rank - 1]['participant'];
        }

        \Log::warning('No participant at rank', ['rank' => $rank, 'standings_count' => count($standings)]);
        return null;
    }

    /**
     * Resolve a winner template (e.g., "winner_match_1") to an actual participant
     */
    private function resolveWinnerTemplate(string $matchRef, TournamentPhase $previousPhase): ?Participant
    {
        \Log::info('resolveWinnerTemplate called', ['matchRef' => $matchRef, 'phase_id' => $previousPhase->id]);
        
        // Try to find the match by match_order number
        if (is_numeric($matchRef)) {
            $match = $previousPhase->matches()
                ->where('match_order', (int)$matchRef)
                ->where('status', 'completed')
                ->first();
        } else {
            // Try to match by pattern like "qf1", "sf1", etc.
            // First try exact match_order if it looks like a number with prefix
            if (preg_match('/^(qf|sf|f)?(\d+)$/i', $matchRef, $matches)) {
                $matchNumber = (int)$matches[2];
                $match = $previousPhase->matches()
                    ->where('match_order', $matchNumber)
                    ->where('status', 'completed')
                    ->first();
            } else {
                $match = null;
            }
        }
        
        if (!$match) {
            // Log available matches for debugging
            $availableMatches = $previousPhase->matches()
                ->where('status', 'completed')
                ->get(['id', 'match_order', 'winner_id'])
                ->toArray();
            
            \Log::warning('Match not found for winner template', [
                'matchRef' => $matchRef,
                'availableMatches' => $availableMatches,
            ]);
            return null;
        }
        
        if (!$match->winner_id) {
            \Log::warning('Match found but no winner set', [
                'matchRef' => $matchRef,
                'match_id' => $match->id,
                'status' => $match->status,
            ]);
            return null;
        }
        
        $winner = Participant::find($match->winner_id);
        
        if ($winner) {
            \Log::info('Winner resolved', [
                'matchRef' => $matchRef,
                'match_id' => $match->id,
                'winner_id' => $winner->id,
                'winner_name' => $winner->name,
            ]);
        }
        
        return $winner;
    }

    /**
     * Resolve all template matches for a phase
     */
    public function resolvePhaseMatches(Request $request, Category $category, TournamentPhase $phase): RedirectResponse
    {
        \Log::info('resolvePhaseMatches called', [
            'category_id' => $category->id,
            'phase_id' => $phase->id,
            'phase_name' => $phase->name,
            'phase_order' => $phase->order,
        ]);

        $previousPhase = $category->phases()
            ->where('order', '<', $phase->order)
            ->orderBy('order', 'desc')
            ->first();

        if (!$previousPhase) {
            \Log::warning('No previous phase found');
            return back()->with('error', 'No previous phase to resolve from');
        }

        \Log::info('Previous phase found', [
            'previous_phase_id' => $previousPhase->id,
            'previous_phase_name' => $previousPhase->name,
        ]);

        // Get all matches in this phase with templates
        $matches = $phase->matches()
            ->where(function($query) {
                $query->whereNotNull('team1_template')
                      ->orWhereNotNull('team2_template');
            })
            ->get();

        \Log::info('Matches with templates found', [
            'count' => $matches->count(),
            'matches' => $matches->map(fn($m) => [
                'id' => $m->id,
                'team1_template' => $m->team1_template,
                'team2_template' => $m->team2_template,
                'team1_id' => $m->team1_id,
                'team2_id' => $m->team2_id,
            ])->toArray(),
        ]);

        $resolved = 0;
        $errors = [];
        
        foreach ($matches as $match) {
            $updated = false;

            if ($match->team1_template && !$match->team1_id) {
                \Log::info('Resolving team1_template', ['template' => $match->team1_template]);
                $participant = $this->resolveMatchTemplate($match->team1_template, $previousPhase);
                if ($participant) {
                    $match->team1_id = $participant->id;
                    $updated = true;
                    \Log::info('Team1 resolved', ['participant_id' => $participant->id, 'name' => $participant->name]);
                } else {
                    $errors[] = "Could not resolve: {$match->team1_template}";
                    \Log::warning('Failed to resolve team1_template', ['template' => $match->team1_template]);
                }
            }

            if ($match->team2_template && !$match->team2_id) {
                \Log::info('Resolving team2_template', ['template' => $match->team2_template]);
                $participant = $this->resolveMatchTemplate($match->team2_template, $previousPhase);
                if ($participant) {
                    $match->team2_id = $participant->id;
                    $updated = true;
                    \Log::info('Team2 resolved', ['participant_id' => $participant->id, 'name' => $participant->name]);
                } else {
                    $errors[] = "Could not resolve: {$match->team2_template}";
                    \Log::warning('Failed to resolve team2_template', ['template' => $match->team2_template]);
                }
            }

            if ($updated) {
                $match->save();
                $resolved++;
            }
        }

        $message = "Resolved $resolved matches for {$phase->name}";
        if (!empty($errors)) {
            $message .= ". Errors: " . implode(', ', array_slice($errors, 0, 3));
        }

        \Log::info('Resolution complete', ['resolved' => $resolved, 'errors' => $errors]);

        return back()->with($resolved > 0 || empty($errors) ? 'success' : 'error', $message);
    }
}
