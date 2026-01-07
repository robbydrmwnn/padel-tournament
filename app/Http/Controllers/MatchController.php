<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\GameMatch;
use App\Models\Group;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class MatchController extends Controller
{
    /**
     * Display matches for a category
     */
    public function index(Category $category): Response
    {
        $category->load([
            'event.courts',
            'groups.participants',
            'matches' => function ($query) {
                $query->with(['team1', 'team2', 'court', 'group'])
                      ->where('phase', 'group')
                      ->orderBy('group_id')
                      ->orderBy('scheduled_time');
            }
        ]);
        
        return Inertia::render('Matches/Index', [
            'category' => $category,
            'matches' => $category->matches,
            'courts' => $category->event->courts,
        ]);
    }

    /**
     * Generate group phase matches (round-robin)
     */
    public function generate(Category $category): RedirectResponse
    {
        // Delete existing group phase matches
        $category->matches()->where('phase', 'group')->delete();

        // Get all groups with participants
        $groups = $category->groups()->with('participants')->get();

        foreach ($groups as $group) {
            $participants = $group->participants;
            
            // Generate round-robin matches
            $count = $participants->count();
            
            for ($i = 0; $i < $count; $i++) {
                for ($j = $i + 1; $j < $count; $j++) {
                    GameMatch::create([
                        'category_id' => $category->id,
                        'group_id' => $group->id,
                        'team1_id' => $participants[$i]->id,
                        'team2_id' => $participants[$j]->id,
                        'phase' => 'group',
                        'status' => 'scheduled',
                    ]);
                }
            }
        }

        return redirect()->route('categories.matches.index', $category)
            ->with('success', 'Group phase matches generated successfully.');
    }

    /**
     * Update match scheduling
     */
    public function update(Request $request, Category $category, GameMatch $match): RedirectResponse
    {
        $validated = $request->validate([
            'court_id' => 'nullable|exists:courts,id',
            'scheduled_time' => 'nullable|date',
            'team1_score' => 'nullable|integer|min:0',
            'team2_score' => 'nullable|integer|min:0',
            'status' => 'nullable|in:scheduled,upcoming,in_progress,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        // Determine winner if both scores are provided
        if (isset($validated['team1_score']) && isset($validated['team2_score'])) {
            if ($validated['team1_score'] > $validated['team2_score']) {
                $validated['winner_id'] = $match->team1_id;
            } elseif ($validated['team2_score'] > $validated['team1_score']) {
                $validated['winner_id'] = $match->team2_id;
            }
            
            if ($validated['team1_score'] !== $validated['team2_score']) {
                $validated['status'] = 'completed';
            }
        }

        $match->update($validated);

        return redirect()->route('categories.matches.index', $category)
            ->with('success', 'Match updated successfully.');
    }

    /**
     * Delete a match
     */
    public function destroy(Category $category, GameMatch $match): RedirectResponse
    {
        $match->delete();

        return redirect()->route('categories.matches.index', $category)
            ->with('success', 'Match deleted successfully.');
    }

    /**
     * Show referee control page
     */
    public function referee(Category $category, GameMatch $match): Response
    {
        $category->load('event');
        $match->load(['team1', 'team2', 'court', 'group']);

        return Inertia::render('Matches/Referee', [
            'category' => $category,
            'match' => $match,
        ]);
    }

    /**
     * Show score monitor page for a specific court
     */
    public function courtMonitor(\App\Models\Court $court): Response
    {
        // Only get matches that are upcoming or in_progress
        // Don't show scheduled matches - those show default view
        $match = \App\Models\GameMatch::where('court_id', $court->id)
            ->whereIn('status', ['upcoming', 'in_progress'])
            ->with(['team1', 'team2', 'court', 'group', 'category.event'])
            ->orderBy('updated_at', 'desc')
            ->first();

        $court->load('event');

        return Inertia::render('Matches/CourtMonitor', [
            'court' => $court,
            'match' => $match, // Will be null if no upcoming/in_progress match
        ]);
    }

    /**
     * Prepare match for starting (change to upcoming status)
     */
    public function startPrep(Category $category, GameMatch $match): \Illuminate\Http\JsonResponse
    {
        // Check if match has a court assigned
        if (!$match->court_id) {
            return response()->json([
                'error' => 'Please assign a court before starting this match.'
            ], 422);
        }

        // Check if the court already has an active/upcoming match
        $activeMatch = GameMatch::where('court_id', $match->court_id)
            ->where('id', '!=', $match->id)
            ->where(function($query) {
                $query->where('status', 'upcoming')
                      ->orWhere('status', 'in_progress')
                      ->orWhere(function($q) {
                          $q->where('status', 'scheduled')
                            ->whereNotNull('warmup_started_at')
                            ->whereNull('match_ended_at');
                      });
            })
            ->with(['team1', 'team2', 'court'])
            ->first();

        if ($activeMatch) {
            $matchInfo = "{$activeMatch->team1->player_1}-{$activeMatch->team1->player_2} vs {$activeMatch->team2->player_1}-{$activeMatch->team2->player_2}";
            return response()->json([
                'error' => "Court {$activeMatch->court->name} is currently occupied by: {$matchInfo}. Please reset that match first or choose a different court."
            ], 422);
        }

        // Mark match as upcoming
        $match->update([
            'status' => 'upcoming',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Match is now ready to start. Court ' . $match->court->name . ' has been reserved.'
        ]);
    }

    /**
     * Start warm-up timer
     */
    public function warmupStart(Category $category, GameMatch $match): RedirectResponse
    {
        // Check if match has a court assigned
        if (!$match->court_id) {
            return back()->with('error', 'Please assign a court before starting warm-up.');
        }

        // Check if the court already has an active match
        $activeMatch = GameMatch::where('court_id', $match->court_id)
            ->where('id', '!=', $match->id)
            ->whereIn('status', ['upcoming', 'in_progress'])
            ->whereNull('match_ended_at')
            ->first();

        if ($activeMatch) {
            return back()->with('error', 'Court ' . $match->court->name . ' is currently occupied by another match. Please reset that match first or choose a different court.');
        }

        $match->update([
            'warmup_started_at' => now(),
            'status' => 'in_progress',
        ]);

        return back();
    }

    /**
     * Reset warm-up timer
     */
    public function warmupReset(Category $category, GameMatch $match): RedirectResponse
    {
        $match->update([
            'warmup_started_at' => null,
            'warmup_ended_at' => null,
            'warmup_skipped' => false,
        ]);

        return back();
    }

    /**
     * Skip warm-up
     */
    public function warmupSkip(Category $category, GameMatch $match): RedirectResponse
    {
        $match->update([
            'warmup_skipped' => true,
            'warmup_started_at' => $match->warmup_started_at ?? now(),
            'warmup_ended_at' => now(),
        ]);

        return back();
    }

    /**
     * End warm-up (automatic or manual)
     */
    public function warmupEnd(Category $category, GameMatch $match): RedirectResponse
    {
        $match->update([
            'warmup_ended_at' => now(),
        ]);

        return back();
    }

    /**
     * Start the actual match
     */
    public function startMatch(Category $category, GameMatch $match): RedirectResponse
    {
        // Check if match has a court assigned
        if (!$match->court_id) {
            return back()->with('error', 'Please assign a court before starting the match.');
        }

        // Check if the court already has an active match
        $activeMatch = GameMatch::where('court_id', $match->court_id)
            ->where('id', '!=', $match->id)
            ->where('status', 'in_progress')
            ->first();

        if ($activeMatch) {
            return back()->with('error', 'Court ' . $match->court->name . ' already has an active match. Please complete or cancel it first.');
        }

        $match->update([
            'match_started_at' => now(),
            'status' => 'in_progress',
            'current_game_team1_points' => '0',
            'current_game_team2_points' => '0',
            'current_game_advantages' => 0,
            'team1_score' => 0,
            'team2_score' => 0,
            'current_server_team_id' => $match->team1_id, // Team 1 serves first
            'score_details' => ['games' => []],
        ]);

        return back();
    }

    /**
     * Score a point for a team
     */
    public function scorePoint(Request $request, Category $category, GameMatch $match): RedirectResponse
    {
        $team = $request->input('team'); // 'team1' or 'team2'
        
        // Get scoring configuration
        $config = $match->phase === 'group' ? [
            'best_of' => $category->group_best_of_games,
            'scoring_type' => $category->group_scoring_type,
            'advantage_limit' => $category->group_advantage_limit,
        ] : [
            'best_of' => $category->knockout_best_of_games,
            'scoring_type' => $category->knockout_scoring_type,
            'advantage_limit' => $category->knockout_advantage_limit,
        ];

        $team1Points = $match->current_game_team1_points;
        $team2Points = $match->current_game_team2_points;
        
        // Point progression: 0 -> 15 -> 30 -> 40
        $pointProgression = ['0' => '15', '15' => '30', '30' => '40'];

        if ($team === 'team1') {
            // Check if game is won
            if ($team1Points === '40') {
                if ($team2Points === '40') {
                    // Deuce situation
                    if ($config['scoring_type'] === 'no_ad') {
                        // Golden point - team 1 wins
                        $this->teamWinsGame($match, 'team1', $config['best_of']);
                    } else if ($config['scoring_type'] === 'traditional') {
                        // Traditional - go to advantage
                        $team1Points = 'AD';
                        $team2Points = '40';
                    } else if ($config['scoring_type'] === 'advantage_limit') {
                        // Check advantage limit
                        if ($match->current_game_advantages >= $config['advantage_limit']) {
                            // Golden point - team 1 wins
                            $this->teamWinsGame($match, 'team1', $config['best_of']);
                        } else {
                            // Go to advantage
                            $team1Points = 'AD';
                            $team2Points = '40';
                            $match->current_game_advantages++;
                        }
                    }
                } else if ($team2Points === 'AD') {
                    // Back to deuce
                    $team1Points = '40';
                    $team2Points = '40';
                } else {
                    // Team 1 wins game
                    $this->teamWinsGame($match, 'team1', $config['best_of']);
                }
            } else if ($team1Points === 'AD') {
                // Team 1 wins game
                $this->teamWinsGame($match, 'team1', $config['best_of']);
            } else {
                // Progress point
                $team1Points = $pointProgression[$team1Points];
            }
        } else {
            // Team 2 scores
            if ($team2Points === '40') {
                if ($team1Points === '40') {
                    // Deuce situation
                    if ($config['scoring_type'] === 'no_ad') {
                        // Golden point - team 2 wins
                        $this->teamWinsGame($match, 'team2', $config['best_of']);
                    } else if ($config['scoring_type'] === 'traditional') {
                        // Traditional - go to advantage
                        $team2Points = 'AD';
                        $team1Points = '40';
                    } else if ($config['scoring_type'] === 'advantage_limit') {
                        // Check advantage limit
                        if ($match->current_game_advantages >= $config['advantage_limit']) {
                            // Golden point - team 2 wins
                            $this->teamWinsGame($match, 'team2', $config['best_of']);
                        } else {
                            // Go to advantage
                            $team2Points = 'AD';
                            $team1Points = '40';
                            $match->current_game_advantages++;
                        }
                    }
                } else if ($team1Points === 'AD') {
                    // Back to deuce
                    $team1Points = '40';
                    $team2Points = '40';
                } else {
                    // Team 2 wins game
                    $this->teamWinsGame($match, 'team2', $config['best_of']);
                }
            } else if ($team2Points === 'AD') {
                // Team 2 wins game
                $this->teamWinsGame($match, 'team2', $config['best_of']);
            } else {
                // Progress point
                $team2Points = $pointProgression[$team2Points];
            }
        }

        // Update current game points if game not won
        if ($match->status === 'in_progress') {
            $match->update([
                'current_game_team1_points' => $team1Points,
                'current_game_team2_points' => $team2Points,
            ]);
        }

        return back();
    }

    /**
     * Helper method to handle team winning a game
     */
    private function teamWinsGame(GameMatch $match, string $team, int $bestOf)
    {
        $team1Score = $match->team1_score;
        $team2Score = $match->team2_score;

        // Increment game score
        if ($team === 'team1') {
            $team1Score++;
        } else {
            $team2Score++;
        }

        // Store game result in score_details
        $scoreDetails = $match->score_details ?? ['games' => []];
        $scoreDetails['games'][] = [
            'team1' => $team1Score,
            'team2' => $team2Score,
        ];

        // Check if match is won
        $gamesNeededToWin = ceil($bestOf / 2);
        $matchWon = false;
        $winnerId = null;

        if ($team1Score >= $gamesNeededToWin && $team1Score > $team2Score) {
            $matchWon = true;
            $winnerId = $match->team1_id;
        } else if ($team2Score >= $gamesNeededToWin && $team2Score > $team1Score) {
            $matchWon = true;
            $winnerId = $match->team2_id;
        } else if ($bestOf === 4 && $team1Score === 2 && $team2Score === 2) {
            // Best of 4 can end in a draw
            $matchWon = true;
            $winnerId = null;
        }

        if ($matchWon) {
            $match->update([
                'team1_score' => $team1Score,
                'team2_score' => $team2Score,
                'winner_id' => $winnerId,
                'status' => 'completed',
                'match_ended_at' => now(),
                'score_details' => $scoreDetails,
            ]);
        } else {
            // Start new game
            $match->update([
                'team1_score' => $team1Score,
                'team2_score' => $team2Score,
                'current_game_team1_points' => '0',
                'current_game_team2_points' => '0',
                'current_game_advantages' => 0,
                'score_details' => $scoreDetails,
                // Switch server
                'current_server_team_id' => $match->current_server_team_id === $match->team1_id 
                    ? $match->team2_id 
                    : $match->team1_id,
            ]);
        }
    }

    /**
     * Undo last point
     */
    public function undoPoint(Request $request, Category $category, GameMatch $match): RedirectResponse
    {
        $team = $request->input('team');
        
        \Log::info('Undo point requested', [
            'team' => $team,
            'current_team1_points' => $match->current_game_team1_points,
            'current_team2_points' => $match->current_game_team2_points,
            'team1_score' => $match->team1_score,
            'team2_score' => $match->team2_score,
        ]);
        
        // Check if we need to undo a game win
        // A new game just started if both points are 0 or null, AND at least one team has games
        $isNewGame = (empty($match->current_game_team1_points) || $match->current_game_team1_points === '0') && 
                     (empty($match->current_game_team2_points) || $match->current_game_team2_points === '0');
        
        $hasGames = ($match->team1_score > 0 || $match->team2_score > 0);
        
        if ($isNewGame && $hasGames) {
            \Log::info('Attempting to undo game win');
            
            // We need to undo the last game win
            $scoreDetails = $match->score_details ?? ['games' => []];
            
            // Decrement the game score for the team that won
            $team1Score = $match->team1_score ?? 0;
            $team2Score = $match->team2_score ?? 0;
            
            if ($team === 'team1' && $team1Score > 0) {
                $team1Score--;
            } elseif ($team === 'team2' && $team2Score > 0) {
                $team2Score--;
            } else {
                return back()->with('error', 'Cannot undo - no games to undo for this team.');
            }
            
            // Remove the last game from history
            if (!empty($scoreDetails['games'])) {
                array_pop($scoreDetails['games']);
            }
            
            // Restore to the game-winning point state (40-30 in favor of the team that won)
            $team1Points = $team === 'team1' ? '40' : '30';
            $team2Points = $team === 'team2' ? '40' : '30';
            
            $match->update([
                'team1_score' => $team1Score,
                'team2_score' => $team2Score,
                'current_game_team1_points' => $team1Points,
                'current_game_team2_points' => $team2Points,
                'current_game_advantages' => 0,
                'score_details' => $scoreDetails,
                'status' => 'in_progress', // In case match was completed
                'winner_id' => null, // Clear winner if match was completed
                'match_ended_at' => null,
            ]);
            
            \Log::info('Game win undone successfully', [
                'new_team1_score' => $team1Score,
                'new_team2_score' => $team2Score,
                'restored_points' => "$team1Points-$team2Points",
            ]);
            
            return back()->with('success', 'Game win has been undone. Score restored to ' . $team1Score . '-' . $team2Score . ', points: ' . $team1Points . '-' . $team2Points);
        }
        
        // Normal point undo within a game
        $team1Points = $match->current_game_team1_points ?? '0';
        $team2Points = $match->current_game_team2_points ?? '0';
        
        $pointRegression = ['15' => '0', '30' => '15', '40' => '30', 'AD' => '40'];

        if ($team === 'team1') {
            if (isset($pointRegression[$team1Points])) {
                $team1Points = $pointRegression[$team1Points];
            } else {
                return back()->with('error', 'Cannot undo point - team already at 0.');
            }
        } else {
            if (isset($pointRegression[$team2Points])) {
                $team2Points = $pointRegression[$team2Points];
            } else {
                return back()->with('error', 'Cannot undo point - team already at 0.');
            }
        }
        
        $match->update([
            'current_game_team1_points' => $team1Points,
            'current_game_team2_points' => $team2Points,
        ]);

        return back();
    }

    /**
     * Reset match to scheduled state (undo start)
     */
    public function resetMatch(Category $category, GameMatch $match): RedirectResponse
    {
        // Only allow resetting if match hasn't been completed
        if ($match->status === 'completed') {
            return back()->with('error', 'Cannot reset a completed match. Please delete it instead.');
        }

        $wasUpcoming = $match->status === 'upcoming';
        $wasStarted = $match->match_started_at !== null || $match->warmup_started_at !== null;

        // Reset all match state
        $match->update([
            'status' => 'scheduled',
            'warmup_started_at' => null,
            'warmup_ended_at' => null,
            'warmup_skipped' => false,
            'match_started_at' => null,
            'match_ended_at' => null,
            'team1_score' => null,
            'team2_score' => null,
            'winner_id' => null,
            'score_details' => null,
            'current_game_team1_points' => null,
            'current_game_team2_points' => null,
            'current_game_advantages' => 0,
            'current_server_team_id' => null,
        ]);

        $message = $wasUpcoming && !$wasStarted
            ? 'Match has been reset. Court is now available for other matches.'
            : 'Match has been reset. All progress cleared. Court is now available for other matches.';

        return redirect()->route('categories.matches.index', $category)
            ->with('success', $message);
    }
}
