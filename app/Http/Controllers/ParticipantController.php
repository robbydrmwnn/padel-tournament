<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Participant;
use App\Imports\ParticipantsImport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;

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

    /**
     * Import participants from Excel file
     */
    public function import(Request $request, Category $category): RedirectResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:2048',
        ]);

        try {
            // Delete all existing participants for this category
            $deletedCount = $category->participants()->count();
            $category->participants()->delete();
            
            // Import new participants
            $import = new ParticipantsImport($category->id);
            Excel::import($import, $request->file('file'));

            $failures = $import->getFailures();
            
            if (count($failures) > 0) {
                $errorMessages = [];
                foreach ($failures as $failure) {
                    $errorMessages[] = "Row {$failure->row()}: " . implode(', ', $failure->errors());
                }
                
                return redirect()->route('categories.participants.index', $category)
                    ->with('warning', "Replaced {$deletedCount} existing participant(s). Import completed with " . count($failures) . ' error(s). ' . implode(' | ', array_slice($errorMessages, 0, 5)));
            }

            return redirect()->route('categories.participants.index', $category)
                ->with('success', "Successfully replaced {$deletedCount} existing participant(s) with new data from Excel.");
        } catch (\Exception $e) {
            return redirect()->route('categories.participants.index', $category)
                ->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

    /**
     * Download Excel template for participants
     */
    public function downloadTemplate(Category $category)
    {
        // Use CSV export which doesn't require ZipArchive
        return Excel::download(new class implements \Maatwebsite\Excel\Concerns\FromArray, \Maatwebsite\Excel\Concerns\WithHeadings {
            
            public function array(): array
            {
                return [
                    ['John Doe', 'Jane Smith', 'Team Alpha', 'john@example.com', '+1234567890', 'Sample team'],
                ];
            }
            
            public function headings(): array
            {
                return [
                    'player_1',
                    'player_2',
                    'team_name',
                    'email',
                    'phone',
                    'notes',
                ];
            }
        }, 'participants_template_' . str_replace(' ', '_', $category->name) . '_' . date('Y-m-d') . '.csv', \Maatwebsite\Excel\Excel::CSV);
    }
}
