<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Event $event): Response
    {
        $categories = $event->categories()
            ->withCount('participants')
            ->get();
        
        return Inertia::render('Categories/Index', [
            'event' => $event,
            'categories' => $categories
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Event $event): Response
    {
        return Inertia::render('Categories/Create', [
            'event' => $event
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'max_participants' => 'nullable|integer|min:1',
            'teams_advance_per_group' => 'required|integer|min:1|max:10',
            'group_best_of_games' => 'required|integer|in:3,4,5',
            'group_scoring_type' => 'required|in:traditional,no_ad,advantage_limit',
            'group_advantage_limit' => 'nullable|integer|min:1|max:10|required_if:group_scoring_type,advantage_limit',
            'knockout_best_of_games' => 'required|integer|in:3,5',
            'knockout_scoring_type' => 'required|in:traditional,no_ad,advantage_limit',
            'knockout_advantage_limit' => 'nullable|integer|min:1|max:10|required_if:knockout_scoring_type,advantage_limit',
            'warmup_minutes' => 'required|integer|min:0|max:30',
        ]);

        $event->categories()->create($validated);

        return redirect()->route('events.categories.index', $event)
            ->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event, Category $category): Response
    {
        $category->load(['participants', 'groups.participants']);
        
        return Inertia::render('Categories/Show', [
            'event' => $event,
            'category' => $category
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Event $event, Category $category): Response
    {
        return Inertia::render('Categories/Edit', [
            'event' => $event,
            'category' => $category
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Event $event, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'max_participants' => 'nullable|integer|min:1',
            'teams_advance_per_group' => 'required|integer|min:1|max:10',
            'group_best_of_games' => 'required|integer|in:3,4,5',
            'group_scoring_type' => 'required|in:traditional,no_ad,advantage_limit',
            'group_advantage_limit' => 'nullable|integer|min:1|max:10|required_if:group_scoring_type,advantage_limit',
            'knockout_best_of_games' => 'required|integer|in:3,5',
            'knockout_scoring_type' => 'required|in:traditional,no_ad,advantage_limit',
            'knockout_advantage_limit' => 'nullable|integer|min:1|max:10|required_if:knockout_scoring_type,advantage_limit',
            'warmup_minutes' => 'required|integer|min:0|max:30',
        ]);

        $category->update($validated);

        return redirect()->route('events.categories.index', $event)
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event, Category $category): RedirectResponse
    {
        $category->delete();

        return redirect()->route('events.categories.index', $event)
            ->with('success', 'Category deleted successfully.');
    }

    /**
     * Display the leaderboard for a category
     */
    public function leaderboard(Event $event, Category $category): Response
    {
        $category->load('event');
        
        // Get all groups with their participants and matches
        $groups = $category->groups()
            ->with(['participants'])
            ->orderBy('order')
            ->get();

        $leaderboardData = [];

        foreach ($groups as $group) {
            $standings = [];

            foreach ($group->participants as $participant) {
                // Get all completed matches for this participant in this group
                $matches = \App\Models\GameMatch::where('group_id', $group->id)
                    ->where('phase', 'group')
                    ->where('status', 'completed')
                    ->where(function($query) use ($participant) {
                        $query->where('team1_id', $participant->id)
                              ->orWhere('team2_id', $participant->id);
                    })
                    ->get();

                $played = $matches->count();
                $won = 0;
                $lost = 0;
                $draw = 0;
                $gamesWon = 0;
                $gamesLost = 0;

                foreach ($matches as $match) {
                    $isTeam1 = $match->team1_id === $participant->id;
                    $teamScore = $isTeam1 ? $match->team1_score : $match->team2_score;
                    $opponentScore = $isTeam1 ? $match->team2_score : $match->team1_score;

                    $gamesWon += $teamScore ?? 0;
                    $gamesLost += $opponentScore ?? 0;

                    if ($match->winner_id === $participant->id) {
                        $won++;
                    } elseif ($match->winner_id === null) {
                        // Draw
                        $draw++;
                    } else {
                        $lost++;
                    }
                }

                $gameDiff = $gamesWon - $gamesLost;

                $standings[] = [
                    'participant' => $participant,
                    'played' => $played,
                    'won' => $won,
                    'draw' => $draw,
                    'lost' => $lost,
                    'games_won' => $gamesWon,
                    'games_lost' => $gamesLost,
                    'game_diff' => $gameDiff,
                ];
            }

            // Sort standings: 1) by games won, 2) by sets won (same as games_won)
            usort($standings, function($a, $b) {
                // First by matches won
                if ($b['won'] !== $a['won']) {
                    return $b['won'] - $a['won'];
                }
                // Then by games won
                if ($b['games_won'] !== $a['games_won']) {
                    return $b['games_won'] - $a['games_won'];
                }
                // Then by game difference
                if ($b['game_diff'] !== $a['game_diff']) {
                    return $b['game_diff'] - $a['game_diff'];
                }
                // Finally by games lost (fewer is better)
                return $a['games_lost'] - $b['games_lost'];
            });

            $leaderboardData[] = [
                'group' => $group,
                'standings' => $standings,
            ];
        }

        return Inertia::render('Categories/Leaderboard', [
            'event' => $event,
            'category' => $category,
            'leaderboardData' => $leaderboardData,
        ]);
    }
}
