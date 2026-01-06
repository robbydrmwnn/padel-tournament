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
}
