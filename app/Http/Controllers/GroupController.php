<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Group;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class GroupController extends Controller
{
    /**
     * Display group management interface
     */
    public function index(Category $category): Response
    {
        $category->load([
            'event',
            'phases' => function ($query) {
                $query->orderBy('order');
            },
            'phases.groups.participants',
            'participants'
        ]);
        
        // Get current phase (first incomplete phase)
        $currentPhase = $category->phases()->where('is_completed', false)->orderBy('order')->first();
        
        return Inertia::render('Groups/Index', [
            'category' => $category,
            'phases' => $category->phases,
            'currentPhase' => $currentPhase,
            'participants' => $category->participants
        ]);
    }

    /**
     * Setup groups for a specific phase
     */
    public function setup(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'phase_id' => 'required|exists:tournament_phases,id',
            'number_of_groups' => 'required|integer|min:1|max:20',
        ]);

        $phase = \App\Models\TournamentPhase::findOrFail($validated['phase_id']);
        
        // Delete existing groups for this phase
        $phase->groups()->delete();

        // Create new groups with letter names (A, B, C, etc.)
        for ($i = 1; $i <= $validated['number_of_groups']; $i++) {
            $phase->groups()->create([
                'category_id' => $category->id,
                'name' => 'Group ' . chr(64 + $i), // chr(65) = 'A', chr(66) = 'B', etc.
                'order' => $i,
            ]);
        }

        return redirect()->route('categories.groups.index', $category)
            ->with('success', "Groups created for {$phase->name}.");
    }

    /**
     * Assign a participant to a group
     */
    public function assignParticipant(Request $request, Category $category, Group $group): RedirectResponse
    {
        $validated = $request->validate([
            'participant_id' => 'required|exists:participants,id',
        ]);

        // Check if participant belongs to this category
        $participant = $category->participants()->findOrFail($validated['participant_id']);

        // Remove participant from other groups in this category
        $category->groups->each(function ($g) use ($participant) {
            $g->participants()->detach($participant->id);
        });

        // Assign to the new group
        $group->participants()->attach($participant->id);

        return redirect()->route('categories.groups.index', $category)
            ->with('success', 'Participant assigned successfully.');
    }

    /**
     * Remove a participant from a group
     */
    public function removeParticipant(Category $category, Group $group, $participantId): RedirectResponse
    {
        $group->participants()->detach($participantId);

        return redirect()->route('categories.groups.index', $category)
            ->with('success', 'Participant removed from group.');
    }

    /**
     * Update group name
     */
    public function update(Request $request, Category $category, Group $group): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $group->update($validated);

        return redirect()->route('categories.groups.index', $category)
            ->with('success', 'Group updated successfully.');
    }

    /**
     * Delete a group
     */
    public function destroy(Category $category, Group $group): RedirectResponse
    {
        $group->delete();

        return redirect()->route('categories.groups.index', $category)
            ->with('success', 'Group deleted successfully.');
    }
}
