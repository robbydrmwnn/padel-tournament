<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Participant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ParticipantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Category $category): Response
    {
        $category->load(['event', 'participants.groups']);
        
        return Inertia::render('Participants/Index', [
            'category' => $category,
            'participants' => $category->participants
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Category $category): Response
    {
        $category->load('event');
        
        return Inertia::render('Participants/Create', [
            'category' => $category
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'player_1' => 'required|string|max:255',
            'player_2' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $category->participants()->create($validated);

        return redirect()->route('categories.participants.index', $category)
            ->with('success', 'Participant created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category, Participant $participant): Response
    {
        $participant->load('groups');
        $category->load('event');
        
        return Inertia::render('Participants/Show', [
            'category' => $category,
            'participant' => $participant
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category, Participant $participant): Response
    {
        $category->load('event');
        
        return Inertia::render('Participants/Edit', [
            'category' => $category,
            'participant' => $participant
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category, Participant $participant): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'player_1' => 'required|string|max:255',
            'player_2' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $participant->update($validated);

        return redirect()->route('categories.participants.index', $category)
            ->with('success', 'Participant updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category, Participant $participant): RedirectResponse
    {
        $participant->delete();

        return redirect()->route('categories.participants.index', $category)
            ->with('success', 'Participant deleted successfully.');
    }
}
