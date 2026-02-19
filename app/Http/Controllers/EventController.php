<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use App\Services\StandingsCalculator;

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
                          ->with([
                              'team1',
                              'team2',
                              'side1Player1',
                              'side1Player2',
                              'side2Player1',
                              'side2Player2',
                              'court',
                          ])
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
            // Priority: 1) Phase with in_progress matches, 2) Earliest phase with scheduled matches (that have teams assigned), 
            // 3) Most recent phase with completed matches, 4) First phase
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

            // If no in_progress matches, find the earliest phase (by order) with scheduled matches that have teams assigned
            if (!$currentPhase) {
                foreach ($category->phases as $phase) {
                    $scheduledMatchQuery = $phase->matches()->where('status', 'scheduled');

                    if ($category->participant_mode === 'individual') {
                        $scheduledMatchQuery
                            ->whereNotNull('side1_player1_id')
                            ->whereNotNull('side1_player2_id')
                            ->whereNotNull('side2_player1_id')
                            ->whereNotNull('side2_player2_id');
                    } else {
                        $scheduledMatchQuery
                            ->whereNotNull('team1_id')
                            ->whereNotNull('team2_id');
                    }

                    $scheduledMatch = $scheduledMatchQuery->first();
                    
                    if ($scheduledMatch) {
                        $currentPhase = $phase;
                        break; // Take the first phase (lowest order) with scheduled matches
                    }
                }
            }

            // If still no current phase, find the most recent phase with completed matches (to show its leaderboard)
            if (!$currentPhase) {
                foreach ($category->phases->reverse() as $phase) {
                    $completedMatch = $phase->matches()
                        ->where('status', 'completed')
                        ->first();
                    
                    if ($completedMatch) {
                        $currentPhase = $phase;
                        break;
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
                    // First try to get groups by phase_id, if empty fall back to groups by category_id (for legacy data)
                    $groups = $currentPhase->groups()
                        ->with(['participants'])
                        ->orderBy('order')
                        ->get();
                    
                    // Fallback: if no groups found by phase_id, try getting groups by category_id
                    if ($groups->isEmpty()) {
                        $groups = \App\Models\Group::where('category_id', $category->id)
                            ->with(['participants'])
                            ->orderBy('order')
                            ->get();
                    }

                    foreach ($groups as $group) {
                        $rows = StandingsCalculator::groupStandings($group, $category, $currentPhase);

                        $standings = array_map(function ($row) {
                            return [
                                'participant' => $row['participant'],
                                'played' => $row['played'],
                                'won' => $row['won'],
                                'draw' => $row['draw'],
                                'lost' => $row['lost'],
                                'games_won' => $row['games_won'],
                                'games_lost' => $row['games_lost'],
                                'game_diff' => $row['game_diff'],
                            ];
                        }, $rows);

                        $leaderboardData[] = [
                            'group' => $group,
                            'standings' => $standings,
                        ];
                    }
                } else {
                    // Knockout phase - show bracket or standings differently
                    // For now, we'll show completed matches
                    $knockoutMatches = $currentPhase->matches()
                        ->with([
                            'team1',
                            'team2',
                            'side1Player1',
                            'side1Player2',
                            'side2Player1',
                            'side2Player2',
                            'court',
                        ])
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
                    ->with([
                        'team1',
                        'team2',
                        'side1Player1',
                        'side1Player2',
                        'side2Player1',
                        'side2Player2',
                        'court',
                    ])
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
                ->with([
                    'team1',
                    'team2',
                    'side1Player1',
                    'side1Player2',
                    'side2Player1',
                    'side2Player2',
                    'category',
                    'tournamentPhase',
                ])
                ->orderBy('scheduled_time')
                ->first();
        }

        if ($court2) {
            $court2Match = \App\Models\GameMatch::where('court_id', $court2->id)
                ->whereIn('status', ['scheduled', 'in_progress'])
                ->with([
                    'team1',
                    'team2',
                    'side1Player1',
                    'side1Player2',
                    'side2Player1',
                    'side2Player2',
                    'category',
                    'tournamentPhase',
                ])
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
