<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Event;
use App\Services\StandingsCalculator;
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
            'participant_mode' => 'required|in:team,individual',
            'warmup_minutes' => 'required|integer|min:0|max:30',
            'phases' => 'required|array|min:1',
            'phases.*.name' => 'required|string|max:255',
            'phases.*.type' => 'required|in:group,knockout',
            'phases.*.number_of_groups' => 'nullable|integer|min:1|required_if:phases.*.type,group',
            'phases.*.teams_advance_per_group' => 'nullable|integer|min:1|required_if:phases.*.type,group',
            'phases.*.games_target' => 'required|integer|in:4,6,8,10,12,21,25',
            'phases.*.scoring_type' => 'required|in:traditional,no_ad,advantage_limit',
            'phases.*.advantage_limit' => 'nullable|integer|min:1|max:10',
            'phases.*.use_tiebreaker' => 'required|boolean',
            'phases.*.tiebreaker_points' => 'nullable|integer|min:5|max:15|required_if:phases.*.use_tiebreaker,true',
            'phases.*.tiebreaker_two_point_difference' => 'nullable|boolean|required_if:phases.*.use_tiebreaker,true',
        ]);

        if ($validated['participant_mode'] === 'individual') {
            $hasKnockout = collect($validated['phases'])->contains(fn ($p) => ($p['type'] ?? null) === 'knockout');
            if ($hasKnockout) {
                return back()->withErrors([
                    'phases' => 'Individuals mode does not support knockout phases. Use group/rounds only.',
                ])->withInput();
            }
        }

        $category = $event->categories()->create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'max_participants' => $validated['max_participants'],
            'participant_mode' => $validated['participant_mode'],
            'warmup_minutes' => $validated['warmup_minutes'],
        ]);

        // Create phases
        foreach ($validated['phases'] as $index => $phaseData) {
            $isFinalPhase = ($index === count($validated['phases']) - 1); // Last phase is always final
            
            \App\Models\TournamentPhase::create([
                'category_id' => $category->id,
                'name' => $phaseData['name'],
                'type' => $phaseData['type'],
                'order' => $index + 1,
                'number_of_groups' => $phaseData['number_of_groups'] ?? null,
                'teams_advance_per_group' => $phaseData['teams_advance_per_group'] ?? null,
                'games_target' => $phaseData['games_target'],
                'scoring_type' => $phaseData['scoring_type'],
                'advantage_limit' => $phaseData['advantage_limit'] ?? null,
                'use_tiebreaker' => $phaseData['use_tiebreaker'],
                'tiebreaker_points' => $phaseData['tiebreaker_points'] ?? null,
                'tiebreaker_two_point_difference' => $phaseData['tiebreaker_two_point_difference'] ?? null,
                'is_final_phase' => $isFinalPhase,
            ]);
        }

        return redirect()->route('events.categories.index', $event)
            ->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event, Category $category): Response
    {
        $category->load([
            'participants',
            'phases' => function ($query) {
                $query->orderBy('order');
            },
            'phases.groups.participants',
            'phases.matches'
        ]);
        
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
        $category->load('phases');
        
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
            'participant_mode' => 'required|in:team,individual',
            'warmup_minutes' => 'required|integer|min:0|max:30',
            'phases' => 'required|array|min:1',
            'phases.*.id' => 'nullable|integer|exists:tournament_phases,id',
            'phases.*.name' => 'required|string|max:255',
            'phases.*.type' => 'required|in:group,knockout',
            'phases.*.number_of_groups' => 'nullable|integer|min:1|required_if:phases.*.type,group',
            'phases.*.teams_advance_per_group' => 'nullable|integer|min:1|required_if:phases.*.type,group',
            'phases.*.games_target' => 'required|integer|in:4,6,8,10,12,21,25',
            'phases.*.scoring_type' => 'required|in:traditional,no_ad,advantage_limit',
            'phases.*.advantage_limit' => 'nullable|integer|min:1|max:10',
            'phases.*.use_tiebreaker' => 'required|boolean',
            'phases.*.tiebreaker_points' => 'nullable|integer|min:5|max:15|required_if:phases.*.use_tiebreaker,true',
            'phases.*.tiebreaker_two_point_difference' => 'nullable|boolean|required_if:phases.*.use_tiebreaker,true',
        ]);

        if ($validated['participant_mode'] === 'individual') {
            $hasKnockout = collect($validated['phases'])->contains(fn ($p) => ($p['type'] ?? null) === 'knockout');
            if ($hasKnockout) {
                return back()->withErrors([
                    'phases' => 'Individuals mode does not support knockout phases. Use group/rounds only.',
                ])->withInput();
            }
        }

        $category->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'max_participants' => $validated['max_participants'],
            'participant_mode' => $validated['participant_mode'],
            'warmup_minutes' => $validated['warmup_minutes'],
        ]);

        // Get existing phase IDs
        $existingPhaseIds = $category->phases->pluck('id')->toArray();
        $submittedPhaseIds = collect($validated['phases'])->pluck('id')->filter()->toArray();
        
        // Delete phases that were removed
        $phasesToDelete = array_diff($existingPhaseIds, $submittedPhaseIds);
        \App\Models\TournamentPhase::whereIn('id', $phasesToDelete)->delete();

        // Update or create phases
        foreach ($validated['phases'] as $index => $phaseData) {
            $isFinalPhase = ($index === count($validated['phases']) - 1); // Last phase is always final
            
            if (!empty($phaseData['id'])) {
                // Update existing phase
                \App\Models\TournamentPhase::where('id', $phaseData['id'])->update([
                    'name' => $phaseData['name'],
                    'type' => $phaseData['type'],
                    'order' => $index + 1,
                    'number_of_groups' => $phaseData['number_of_groups'] ?? null,
                    'teams_advance_per_group' => $phaseData['teams_advance_per_group'] ?? null,
                    'games_target' => $phaseData['games_target'],
                    'scoring_type' => $phaseData['scoring_type'],
                    'advantage_limit' => $phaseData['advantage_limit'] ?? null,
                    'use_tiebreaker' => $phaseData['use_tiebreaker'],
                    'tiebreaker_points' => $phaseData['tiebreaker_points'] ?? null,
                    'tiebreaker_two_point_difference' => $phaseData['tiebreaker_two_point_difference'] ?? null,
                    'is_final_phase' => $isFinalPhase,
                ]);
            } else {
                // Create new phase
                \App\Models\TournamentPhase::create([
                    'category_id' => $category->id,
                    'name' => $phaseData['name'],
                    'type' => $phaseData['type'],
                    'order' => $index + 1,
                    'number_of_groups' => $phaseData['number_of_groups'] ?? null,
                    'teams_advance_per_group' => $phaseData['teams_advance_per_group'] ?? null,
                    'games_target' => $phaseData['games_target'],
                    'scoring_type' => $phaseData['scoring_type'],
                    'advantage_limit' => $phaseData['advantage_limit'] ?? null,
                    'use_tiebreaker' => $phaseData['use_tiebreaker'],
                    'tiebreaker_points' => $phaseData['tiebreaker_points'] ?? null,
                    'tiebreaker_two_point_difference' => $phaseData['tiebreaker_two_point_difference'] ?? null,
                    'is_final_phase' => $isFinalPhase,
                ]);
            }
        }

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
        $category->load(['event', 'phases']);

        $groupPhase = $category->phases()->where('type', 'group')->orderBy('order')->first();

        // Prefer phase-based groups; fallback to legacy category-level groups
        $groupsQuery = $groupPhase
            ? $groupPhase->groups()->with('participants')
            : $category->groups()->with('participants');

        $groups = $groupsQuery->orderBy('order')->get();

        $leaderboardData = [];

        foreach ($groups as $group) {
            $rows = StandingsCalculator::groupStandings($group, $category, $groupPhase);

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

        return Inertia::render('Categories/Leaderboard', [
            'event' => $event,
            'category' => $category,
            'leaderboardData' => $leaderboardData,
        ]);
    }
}
