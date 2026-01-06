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
            'status' => 'nullable|in:scheduled,in_progress,completed,cancelled',
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
}
