<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\TournamentPhase;
use App\Models\Group;
use App\Models\GameMatch;
use App\Models\Participant;
use App\Services\StandingsCalculator;
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
            $rows = StandingsCalculator::groupStandings($group, $phase->category, $phase);

            $groupStandings = array_map(function ($row) {
                return [
                    'participant' => $row['participant'],
                    'wins' => $row['won'],
                    'losses' => $row['lost'],
                    'games_won' => $row['games_won'],
                    'games_lost' => $row['games_lost'],
                    'game_difference' => $row['game_diff'],
                    'points' => $row['points'],
                    'matches_played' => $row['played'],
                ];
            }, $rows);

            foreach ($groupStandings as $index => &$standing) {
                $standing['rank'] = $index + 1;
            }
            unset($standing);

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
        $group->loadMissing(['category', 'phase', 'participants']);

        $rows = StandingsCalculator::groupStandings($group, $group->category, $group->phase);

        $standings = array_map(function ($row) {
            return [
                'participant' => $row['participant'],
                'wins' => $row['won'],
                'losses' => $row['lost'],
                'games_won' => $row['games_won'],
                'games_lost' => $row['games_lost'],
                'game_difference' => $row['game_diff'],
                'points' => $row['points'],
                'matches_played' => $row['played'],
            ];
        }, $rows);

        foreach ($standings as $index => &$standing) {
            $standing['rank'] = $index + 1;
        }
        unset($standing);

        return $standings;
    }

    /**
     * Assign participants to next phase based on previous phase results
     */
    public function assignFromPreviousPhase(Request $request, Category $category, TournamentPhase $phase): RedirectResponse
    {
        $previousPhase = $category->phases()
            ->reorder()  // Clear default ordering from relationship
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
        \Log::info('resolveWinnerTemplate called', [
            'matchRef' => $matchRef, 
            'phase_id' => $previousPhase->id,
            'phase_name' => $previousPhase->name,
        ]);
        
        // Parse the match number from the reference
        $matchNumber = null;
        if (is_numeric($matchRef)) {
            $matchNumber = (int)$matchRef;
        } elseif (preg_match('/^(qf|sf|f)?(\d+)$/i', $matchRef, $matches)) {
            $matchNumber = (int)$matches[2];
        }
        
        if ($matchNumber === null) {
            \Log::warning('Invalid match reference format', ['matchRef' => $matchRef]);
            return null;
        }
        
        // Get all completed matches from the previous phase for diagnostics
        $allCompletedMatches = $previousPhase->matches()
            ->where('status', 'completed')
            ->orderBy('match_order')
            ->get();
        
        \Log::info('Available completed matches in previous phase', [
            'phase_name' => $previousPhase->name,
            'match_count' => $allCompletedMatches->count(),
            'match_orders' => $allCompletedMatches->pluck('match_order')->toArray(),
        ]);
        
        // First, try to find match by exact match_order
        $match = $allCompletedMatches->firstWhere('match_order', $matchNumber);
        
        // If not found by exact match_order, log detailed info for debugging
        if (!$match) {
            $availableOrders = $allCompletedMatches->pluck('match_order')->filter()->unique()->sort()->values()->toArray();
            
            \Log::warning('Match not found by exact match_order', [
                'requested_match_order' => $matchNumber,
                'previous_phase' => $previousPhase->name,
                'available_match_orders' => $availableOrders,
                'total_completed_matches' => $allCompletedMatches->count(),
            ]);
            
            // Also check if there's a match without completed status
            $pendingMatch = $previousPhase->matches()
                ->where('match_order', $matchNumber)
                ->first();
            
            if ($pendingMatch) {
                \Log::warning('Match exists but is not completed', [
                    'match_id' => $pendingMatch->id,
                    'match_order' => $pendingMatch->match_order,
                    'status' => $pendingMatch->status,
                ]);
            }
            
            return null;
        }
        
        if (!$match->winner_id) {
            \Log::warning('Match found but no winner set', [
                'matchRef' => $matchRef,
                'match_id' => $match->id,
                'match_order' => $match->match_order,
                'status' => $match->status,
                'team1_score' => $match->team1_score,
                'team2_score' => $match->team2_score,
            ]);
            return null;
        }
        
        $winner = Participant::find($match->winner_id);
        
        if ($winner) {
            \Log::info('Winner resolved successfully', [
                'matchRef' => $matchRef,
                'match_id' => $match->id,
                'match_order' => $match->match_order,
                'winner_id' => $winner->id,
                'winner_name' => $winner->name ?? ($winner->player_1 . ' / ' . $winner->player_2),
            ]);
        }
        
        return $winner;
    }

    /**
     * Resolve all template matches for a phase
     */
    public function resolvePhaseMatches(Request $request, Category $category, TournamentPhase $phase): RedirectResponse
    {
        // Reload the phase to get fresh data from database
        $phase->refresh();
        
        // Log all phases for debugging
        $allPhases = $category->phases()->orderBy('order')->get(['id', 'name', 'order', 'type']);
        \Log::info('All phases in category (from DB)', [
            'category_id' => $category->id,
            'phases' => $allPhases->toArray(),
        ]);
        
        \Log::info('resolvePhaseMatches called', [
            'category_id' => $category->id,
            'phase_id' => $phase->id,
            'phase_name' => $phase->name,
            'phase_order' => $phase->order,
        ]);

        // Use reorder() to clear the default orderBy('order') ASC from the relationship
        // Then apply our own orderBy('order', 'desc') to get the highest order first
        $phasesLessThanCurrent = $category->phases()
            ->reorder()  // Clear default ordering
            ->where('order', '<', $phase->order)
            ->orderBy('order', 'desc')
            ->get(['id', 'name', 'order']);
        
        \Log::info('Phases with order less than current', [
            'current_phase_order' => $phase->order,
            'candidates' => $phasesLessThanCurrent->toArray(),
        ]);

        $previousPhase = $phasesLessThanCurrent->first();

        if (!$previousPhase) {
            \Log::warning('No previous phase found');
            return back()->with('error', 'No previous phase to resolve from. Current phase order: ' . $phase->order);
        }

        \Log::info('Previous phase found', [
            'previous_phase_id' => $previousPhase->id,
            'previous_phase_name' => $previousPhase->name,
            'previous_phase_order' => $previousPhase->order,
            'previous_phase_type' => $previousPhase->type,
        ]);
        
        // Log the matches in the previous phase
        $previousPhaseMatches = $previousPhase->matches()
            ->select('id', 'match_order', 'status', 'winner_id', 'team1_id', 'team2_id')
            ->orderBy('match_order')
            ->get();
        \Log::info('Matches in previous phase', [
            'phase_name' => $previousPhase->name,
            'matches' => $previousPhaseMatches->toArray(),
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

        // Check if force re-resolve is requested
        $force = $request->boolean('force', false);
        
        $resolved = 0;
        $errors = [];
        $resolvedDetails = [];
        
        foreach ($matches as $match) {
            $updated = false;

            // Resolve team1 if template exists and (no team assigned OR force mode)
            if ($match->team1_template && (!$match->team1_id || $force)) {
                \Log::info('Resolving team1_template', [
                    'template' => $match->team1_template, 
                    'force' => $force,
                    'previous_phase' => $previousPhase->name,
                ]);
                $participant = $this->resolveMatchTemplate($match->team1_template, $previousPhase);
                if ($participant) {
                    $match->team1_id = $participant->id;
                    $updated = true;
                    $resolvedDetails[] = "{$match->team1_template} → {$participant->player_1}/{$participant->player_2}";
                    \Log::info('Team1 resolved', ['participant_id' => $participant->id, 'name' => $participant->name ?? $participant->player_1]);
                } else {
                    $errors[] = "Could not resolve: {$match->team1_template}";
                    \Log::warning('Failed to resolve team1_template', ['template' => $match->team1_template]);
                }
            }

            // Resolve team2 if template exists and (no team assigned OR force mode)
            if ($match->team2_template && (!$match->team2_id || $force)) {
                \Log::info('Resolving team2_template', [
                    'template' => $match->team2_template, 
                    'force' => $force,
                    'previous_phase' => $previousPhase->name,
                ]);
                $participant = $this->resolveMatchTemplate($match->team2_template, $previousPhase);
                if ($participant) {
                    $match->team2_id = $participant->id;
                    $updated = true;
                    $resolvedDetails[] = "{$match->team2_template} → {$participant->player_1}/{$participant->player_2}";
                    \Log::info('Team2 resolved', ['participant_id' => $participant->id, 'name' => $participant->name ?? $participant->player_1]);
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
        
        \Log::info('Resolved details', ['details' => $resolvedDetails]);

        // Get available match_orders for message
        $availableOrders = $previousPhase->matches()
            ->where('status', 'completed')
            ->orderBy('match_order')
            ->pluck('match_order')
            ->filter()
            ->unique()
            ->values()
            ->toArray();
        
        // Build debug info for message
        $allPhasesDebug = $allPhases->map(fn($p) => "{$p->name}=#{$p->order}")->implode(' → ');
        
        $message = "Resolved $resolved matches for {$phase->name} (order #{$phase->order}) using {$previousPhase->name} (order #{$previousPhase->order}). All phases: {$allPhasesDebug}";
        
        if (!empty($resolvedDetails)) {
            $message .= ". Details: " . implode(', ', array_slice($resolvedDetails, 0, 4));
        }
        
        if (!empty($errors)) {
            $message .= ". Errors: " . implode(', ', array_slice($errors, 0, 3));
        }
        
        if (!empty($availableOrders)) {
            $message .= ". Available match #s in {$previousPhase->name}: " . implode(', ', $availableOrders);
        } else {
            $message .= ". WARNING: No completed matches found in {$previousPhase->name}!";
        }

        \Log::info('Resolution complete', ['resolved' => $resolved, 'errors' => $errors, 'details' => $resolvedDetails]);

        return back()->with($resolved > 0 || empty($errors) ? 'success' : 'error', $message);
    }

    /**
     * Update phase order
     */
    public function updateOrder(Request $request, Category $category, TournamentPhase $phase): RedirectResponse
    {
        $validated = $request->validate([
            'order' => 'required|integer|min:1',
        ]);

        $phase->order = $validated['order'];
        $phase->save();

        return back()->with('success', "Updated {$phase->name} order to #{$validated['order']}");
    }

    /**
     * Renumber matches in a phase to ensure sequential match_order starting from 1
     */
    public function renumberMatches(Request $request, Category $category, TournamentPhase $phase): RedirectResponse
    {
        $matches = $phase->matches()
            ->orderBy('match_order')
            ->orderBy('scheduled_time')
            ->orderBy('id')
            ->get();

        $order = 1;
        foreach ($matches as $match) {
            if ($match->match_order !== $order) {
                $match->match_order = $order;
                $match->save();
            }
            $order++;
        }

        return back()->with('success', "Renumbered {$matches->count()} matches in {$phase->name}. Match orders are now 1 through {$matches->count()}.");
    }
}
