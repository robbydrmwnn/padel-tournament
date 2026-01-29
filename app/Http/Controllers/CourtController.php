<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Court;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CourtController extends Controller
{
    /**
     * Display courts for an event
     */
    public function index(Event $event): Response
    {
        $event->load('courts');
        
        return Inertia::render('Courts/Index', [
            'event' => $event,
            'courts' => $event->courts()->orderBy('order')->get(),
        ]);
    }

    /**
     * Setup courts for an event
     */
    public function setup(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'number_of_courts' => 'required|integer|min:1|max:50',
        ]);

        // Delete existing courts
        $event->courts()->delete();

        // Create new courts with default numeric names
        for ($i = 1; $i <= $validated['number_of_courts']; $i++) {
            $event->courts()->create([
                'name' => (string) $i,
                'order' => $i,
            ]);
        }

        return redirect()->route('events.courts.index', $event)
            ->with('success', 'Courts created successfully.');
    }

    /**
     * Update court name
     */
    public function update(Request $request, Event $event, Court $court): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $court->update($validated);

        return redirect()->route('events.courts.index', $event)
            ->with('success', 'Court updated successfully.');
    }

    /**
     * Show all matches for a specific court
     */
    public function showMatches(Event $event, Court $court): Response
    {
        $event->load('courts');
        
        // Load all matches for this court from all categories in this event
        $matches = \App\Models\GameMatch::where('court_id', $court->id)
            ->whereHas('category', function ($query) use ($event) {
                $query->where('event_id', $event->id);
            })
            ->with(['team1', 'team2', 'court', 'group', 'category', 'tournamentPhase'])
            ->orderBy('scheduled_time', 'asc')
            ->get();
        
        return Inertia::render('Courts/Matches', [
            'event' => $event,
            'court' => $court,
            'matches' => $matches,
        ]);
    }

    /**
     * Delete a court
     */
    public function destroy(Event $event, Court $court): RedirectResponse
    {
        $court->delete();

        return redirect()->route('events.courts.index', $event)
            ->with('success', 'Court deleted successfully.');
    }
}
