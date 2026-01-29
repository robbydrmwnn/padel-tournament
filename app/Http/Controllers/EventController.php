<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $events = Event::withCount('categories')->latest()->get();
        
        return Inertia::render('Events/Index', [
            'events' => $events
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Events/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'status' => 'required|in:draft,active,completed,cancelled',
        ]);

        Event::create($validated);

        return redirect()->route('events.index')
            ->with('success', 'Event created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event): Response
    {
        $event->load([
            'categories' => function ($query) {
                $query->withCount(['participants', 'groups']);
            },
            'courts'
        ]);
        
        return Inertia::render('Events/Show', [
            'event' => $event
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Event $event): Response
    {
        return Inertia::render('Events/Edit', [
            'event' => [
                ...$event->toArray(),
                'start_date' => $event->start_date->format('Y-m-d'),
                'end_date' => $event->end_date->format('Y-m-d'),
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'status' => 'required|in:draft,active,completed,cancelled',
        ]);

        $event->update($validated);

        return redirect()->route('events.index')
            ->with('success', 'Event updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event): RedirectResponse
    {
        $event->delete();

        return redirect()->route('events.index')
            ->with('success', 'Event deleted successfully.');
    }

    /**
     * Display the leaderboard screensaver for an event (public, no auth required)
     */
    public function leaderboardScreensaver(Event $event): Response
    {
        $event->load([
            'categories' => function ($query) {
                $query->with([
                    'phases' => function ($q) {
                        $q->orderBy('order');
                    },
                    'phases.groups.participants',
                    'phases.matches' => function ($q) {
                        $q->whereIn('status', ['scheduled', 'in_progress', 'completed'])
                          ->orderBy('scheduled_time');
                    }
                ]);
            },
            'courts' => function ($query) {
                $query->orderBy('name');
            }
        ]);

        // Prepare leaderboard data for each category
        $categoriesData = [];
        foreach ($event->categories as $category) {
            // Find the current active phase
            // Priority: 1) Phase with in_progress matches, 2) Earliest phase with scheduled matches, 3) First phase
            $currentPhase = null;
            
            // First, check for any phase with in_progress matches
            foreach ($category->phases as $phase) {
                $inProgressMatch = $phase->matches()
                    ->where('status', 'in_progress')
                    ->first();
                
                if ($inProgressMatch) {
                    $currentPhase = $phase;
                    break;
                }
            }

            // If no in_progress matches, find the earliest phase (by order) with scheduled matches
            if (!$currentPhase) {
                foreach ($category->phases as $phase) {
                    $scheduledMatch = $phase->matches()
                        ->where('status', 'scheduled')
                        ->first();
                    
                    if ($scheduledMatch) {
                        $currentPhase = $phase;
                        break; // Take the first phase (lowest order) with scheduled matches
                    }
                }
            }

            // If still no current phase found, use the first phase
            if (!$currentPhase && $category->phases->isNotEmpty()) {
                $currentPhase = $category->phases->first();
            }

            $leaderboardData = [];
            $scheduleData = [];

            if ($currentPhase) {
                // Get leaderboard data based on phase type
                if ($currentPhase->type === 'group') {
                    // Group phase leaderboard
                    $groups = $currentPhase->groups()
                        ->with(['participants'])
                        ->orderBy('order')
                        ->get();

                    foreach ($groups as $group) {
                        $standings = [];

                        foreach ($group->participants as $participant) {
                            $matches = \App\Models\GameMatch::where('phase_id', $currentPhase->id)
                                ->where('group_id', $group->id)
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

                        // Sort standings
                        usort($standings, function($a, $b) {
                            if ($b['won'] !== $a['won']) return $b['won'] - $a['won'];
                            if ($b['game_diff'] !== $a['game_diff']) return $b['game_diff'] - $a['game_diff'];
                            if ($b['games_won'] !== $a['games_won']) return $b['games_won'] - $a['games_won'];
                            return $a['games_lost'] - $b['games_lost'];
                        });

                        $leaderboardData[] = [
                            'group' => $group,
                            'standings' => $standings,
                        ];
                    }
                } else {
                    // Knockout phase - show bracket or standings differently
                    // For now, we'll show completed matches
                    $knockoutMatches = $currentPhase->matches()
                        ->with(['team1', 'team2', 'court'])
                        ->where('status', 'completed')
                        ->orderBy('scheduled_time')
                        ->get();

                    $leaderboardData = [
                        'type' => 'knockout',
                        'matches' => $knockoutMatches,
                    ];
                }

                // Get schedule for this phase (both completed and upcoming)
                $scheduleData = $currentPhase->matches()
                    ->with(['team1', 'team2', 'court'])
                    ->whereIn('status', ['scheduled', 'in_progress', 'completed'])
                    ->orderBy('scheduled_time', 'desc')
                    ->get();
            }

            $categoriesData[] = [
                'category' => $category,
                'currentPhase' => $currentPhase,
                'leaderboardData' => $leaderboardData,
                'scheduleData' => $scheduleData,
            ];
        }

        // Get current matches on courts 1 and 2
        $court1 = $event->courts->where('name', '1')->first();
        $court2 = $event->courts->where('name', '2')->first();

        $court1Match = null;
        $court2Match = null;

        if ($court1) {
            $court1Match = \App\Models\GameMatch::where('court_id', $court1->id)
                ->whereIn('status', ['scheduled', 'in_progress'])
                ->with(['team1', 'team2', 'category', 'tournamentPhase'])
                ->orderBy('scheduled_time')
                ->first();
        }

        if ($court2) {
            $court2Match = \App\Models\GameMatch::where('court_id', $court2->id)
                ->whereIn('status', ['scheduled', 'in_progress'])
                ->with(['team1', 'team2', 'category', 'tournamentPhase'])
                ->orderBy('scheduled_time')
                ->first();
        }

        return Inertia::render('Events/LeaderboardScreensaver', [
            'event' => $event,
            'categoriesData' => $categoriesData,
            'court1' => $court1,
            'court2' => $court2,
            'court1Match' => $court1Match,
            'court2Match' => $court2Match,
        ]);
    }
}
