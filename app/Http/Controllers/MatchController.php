<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\GameMatch;
use App\Models\Group;
use App\Models\Participant;
use App\Models\Court;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;

class MatchController extends Controller
{
    /**
     * Display matches for a category
     */
    public function index(Category $category): Response
    {
        $category->load([
            'event.courts',
            'phases' => function ($query) {
                $query->orderBy('order');
            },
            'phases.groups.participants',
            'phases.matches' => function ($query) {
                $query->with(['team1', 'team2', 'court', 'group', 'tournamentPhase'])
                      ->orderBy('match_order')
                      ->orderBy('scheduled_time');
            }
        ]);
        
        // Get current phase
        $currentPhase = $category->phases()->where('is_completed', false)->orderBy('order')->first();
        
        return Inertia::render('Matches/Index', [
            'category' => $category,
            'phases' => $category->phases,
            'currentPhase' => $currentPhase,
            'courts' => $category->event->courts,
        ]);
    }

    /**
     * Generate matches for a specific phase
     */
    public function generate(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'phase_id' => 'required|exists:tournament_phases,id',
        ]);

        $phase = \App\Models\TournamentPhase::findOrFail($validated['phase_id']);

        // Delete existing matches for this phase
        $phase->matches()->delete();

        if ($phase->type === 'group') {
            // Generate round-robin matches for group phase
            $groups = $phase->groups()->with('participants')->get();

            if ($groups->isEmpty()) {
                return back()->with('error', 'Please create groups for this phase first');
            }

            $matchOrder = 1;
            foreach ($groups as $group) {
                $participants = $group->participants;
                
                if ($participants->count() < 2) {
                    continue;
                }
                
                // Generate round-robin matches
                $count = $participants->count();
                
                for ($i = 0; $i < $count; $i++) {
                    for ($j = $i + 1; $j < $count; $j++) {
                        GameMatch::create([
                            'category_id' => $category->id,
                            'phase_id' => $phase->id,
                            'group_id' => $group->id,
                            'team1_id' => $participants[$i]->id,
                            'team2_id' => $participants[$j]->id,
                            'phase' => 'group',
                            'status' => 'scheduled',
                            'match_order' => $matchOrder++,
                        ]);
                    }
                }
            }

            return redirect()->route('categories.matches.index', $category)
                ->with('success', "Matches generated for {$phase->name}.");
        }

        // For knockout phases, return to index for manual setup
        return redirect()->route('categories.matches.index', $category)
            ->with('info', "Please set up matches manually for knockout phase: {$phase->name}");
    }

    /**
     * Create matches for knockout phase with templates
     */
    public function createKnockoutMatches(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'phase_id' => 'required|exists:tournament_phases,id',
            'matches' => 'required|array|min:1',
            'matches.*.team1_template' => 'required|string',
            'matches.*.team2_template' => 'required|string',
        ]);

        $phase = \App\Models\TournamentPhase::findOrFail($validated['phase_id']);

        if ($phase->type !== 'knockout') {
            return back()->with('error', 'This endpoint is only for knockout phases');
        }

        // Delete existing matches for this phase
        $phase->matches()->delete();

        $created = 0;
        // Create matches with templates
        foreach ($validated['matches'] as $index => $matchData) {
            GameMatch::create([
                'category_id' => $category->id,
                'phase_id' => $phase->id,
                'team1_template' => $matchData['team1_template'],
                'team2_template' => $matchData['team2_template'],
                'phase' => 'knockout',
                'status' => 'scheduled',
                'match_order' => $index + 1,
            ]);
            $created++;
        }

        \Log::info('Knockout matches created', [
            'phase_id' => $phase->id,
            'phase_name' => $phase->name,
            'count' => $created,
        ]);

        return redirect()->route('categories.matches.index', $category)
            ->with('success', "$created match(es) created for {$phase->name}. Participants will be assigned after previous phase completes.");
    }

    /**
     * Import match schedule from Excel file
     */
    public function importSchedule(Request $request, Category $category): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'schedule_file' => 'required|file|mimes:xlsx,xls',
            'phase_id' => 'required|exists:tournament_phases,id',
        ]);

        $phase = \App\Models\TournamentPhase::findOrFail($validated['phase_id']);

        try {
            $file = $request->file('schedule_file');
            $data = Excel::toArray([], $file)[0]; // Get first sheet

            if (empty($data)) {
                return response()->json([
                    'error' => 'The Excel file is empty.'
                ], 422);
            }

            // Note: We no longer require matches to exist - we'll create them if needed

            // Expect header row: Team 1, Team 2, Court, Date, Time
            // Skip first row (header)
            $headerRow = array_shift($data);
            
            // Normalize header to find column indices
            $headerMap = [];
            foreach ($headerRow as $index => $header) {
                $normalized = strtolower(trim($header));
                $headerMap[$normalized] = $index;
            }

            // Required columns
            $requiredColumns = ['team 1', 'team 2', 'court', 'date', 'time'];
            foreach ($requiredColumns as $col) {
                if (!isset($headerMap[$col]) && !isset($headerMap[str_replace(' ', '', $col)])) {
                    return response()->json([
                        'error' => "Missing required column: {$col}. Expected columns: Team 1, Team 2, Court, Date, Time"
                    ], 422);
                }
            }

            // Get column indices
            $team1Col = $headerMap['team 1'] ?? $headerMap['team1'] ?? null;
            $team2Col = $headerMap['team 2'] ?? $headerMap['team2'] ?? null;
            $courtCol = $headerMap['court'] ?? null;
            $dateCol = $headerMap['date'] ?? null;
            $timeCol = $headerMap['time'] ?? null;

            if (is_null($team1Col) || is_null($team2Col) || is_null($courtCol) || is_null($dateCol) || is_null($timeCol)) {
                return response()->json([
                    'error' => 'Could not identify all required columns. Please ensure columns are named: Team 1, Team 2, Court, Date, Time'
                ], 422);
            }

            // Get all participants for this category
            $participants = Participant::where('category_id', $category->id)->get();
            
            // Get all courts for this event
            $courts = Court::where('event_id', $category->event_id)->get();

            $updated = 0;
            $created = 0;
            $errors = [];

            DB::beginTransaction();

            // Get the highest match_order for this phase
            $maxMatchOrder = GameMatch::where('phase_id', $phase->id)->max('match_order') ?? 0;

            foreach ($data as $rowIndex => $row) {
                $rowNumber = $rowIndex + 2; // +2 because we removed header and Excel is 1-indexed
                
                // Skip empty rows
                if (empty(array_filter($row))) {
                    continue;
                }

                $team1Name = trim($row[$team1Col] ?? '');
                $team2Name = trim($row[$team2Col] ?? '');
                $courtName = trim($row[$courtCol] ?? '');
                $date = $row[$dateCol] ?? '';
                $time = $row[$timeCol] ?? '';

                if (empty($team1Name) || empty($team2Name)) {
                    $errors[] = "Row {$rowNumber}: Missing team names";
                    continue;
                }

                // Check if this is a knockout phase with templates
                if ($phase->type === 'knockout') {
                    // Handle knockout phase import with templates
                    $team1Template = $this->parseTeamTemplate($team1Name);
                    $team2Template = $this->parseTeamTemplate($team2Name);
                    
                    if (!$team1Template) {
                        $errors[] = "Row {$rowNumber}: Invalid team template: '{$team1Name}'. Use format like '1st Group A', 'Winner Match 1', or team name";
                        continue;
                    }
                    
                    if (!$team2Template) {
                        $errors[] = "Row {$rowNumber}: Invalid team template: '{$team2Name}'. Use format like '2nd Group B', 'Winner Match 2', or team name";
                        continue;
                    }
                    
                    // Find or create knockout match
                    $match = $this->findOrCreateKnockoutMatch($phase, $category, $team1Name, $team2Name, $team1Template, $team2Template, $maxMatchOrder, $created);
                    
                    if (!$match) {
                        $errors[] = "Row {$rowNumber}: Failed to create knockout match";
                        continue;
                    }
                    
                    // Parse and update schedule info
                    $updateData = $this->parseScheduleData($courtName, $courts, $date, $time, $rowNumber, $errors);
                    
                    if (!empty($updateData)) {
                        $match->update($updateData);
                        if (!$match->wasRecentlyCreated) {
                            $updated++;
                        }
                    }
                    
                    continue;
                }

                // Find teams by name - flexible matching
                // Supports: team name, "Player1 / Player2", "Player1/Player2", "Player1 - Player2"
                $team1 = $participants->first(function ($p) use ($team1Name) {
                    // Check team name field first
                    if (!empty($p->name) && strcasecmp(trim($p->name), $team1Name) === 0) {
                        return true;
                    }
                    
                    // Check player name combinations
                    $fullName1 = trim($p->player_1 . ' / ' . $p->player_2);
                    $fullName2 = trim($p->player_1 . '/' . $p->player_2);
                    $fullName3 = trim($p->player_1 . ' - ' . $p->player_2);
                    
                    return strcasecmp($fullName1, $team1Name) === 0 ||
                           strcasecmp($fullName2, $team1Name) === 0 ||
                           strcasecmp($fullName3, $team1Name) === 0;
                });

                $team2 = $participants->first(function ($p) use ($team2Name) {
                    // Check team name field first
                    if (!empty($p->name) && strcasecmp(trim($p->name), $team2Name) === 0) {
                        return true;
                    }
                    
                    // Check player name combinations
                    $fullName1 = trim($p->player_1 . ' / ' . $p->player_2);
                    $fullName2 = trim($p->player_1 . '/' . $p->player_2);
                    $fullName3 = trim($p->player_1 . ' - ' . $p->player_2);
                    
                    return strcasecmp($fullName1, $team2Name) === 0 ||
                           strcasecmp($fullName2, $team2Name) === 0 ||
                           strcasecmp($fullName3, $team2Name) === 0;
                });

                if (!$team1) {
                    // Show available team names for first 3 errors
                    if (count($errors) < 3) {
                        $availableTeams = $participants->take(3)->map(function ($p) {
                            $teamName = !empty($p->name) ? $p->name : ($p->player_1 . ' / ' . $p->player_2);
                            return $teamName;
                        })->implode(', ');
                        $errors[] = "Row {$rowNumber}: Team not found: '{$team1Name}'. Examples: {$availableTeams}";
                    } else {
                        $errors[] = "Row {$rowNumber}: Team not found: '{$team1Name}'";
                    }
                    continue;
                }

                if (!$team2) {
                    if (count($errors) < 3) {
                        $availableTeams = $participants->take(3)->map(function ($p) {
                            $teamName = !empty($p->name) ? $p->name : ($p->player_1 . ' / ' . $p->player_2);
                            return $teamName;
                        })->implode(', ');
                        $errors[] = "Row {$rowNumber}: Team not found: '{$team2Name}'. Examples: {$availableTeams}";
                    } else {
                        $errors[] = "Row {$rowNumber}: Team not found: '{$team2Name}'";
                    }
                    continue;
                }

                // Find the match
                $match = GameMatch::where('phase_id', $phase->id)
                    ->where(function ($query) use ($team1, $team2) {
                        $query->where(function ($q) use ($team1, $team2) {
                            $q->where('team1_id', $team1->id)
                              ->where('team2_id', $team2->id);
                        })->orWhere(function ($q) use ($team1, $team2) {
                            $q->where('team1_id', $team2->id)
                              ->where('team2_id', $team1->id);
                        });
                    })
                    ->first();

                if (!$match) {
                    // Match doesn't exist - create it
                    try {
                        $maxMatchOrder++;
                        
                        // Determine which group this match belongs to
                        // Try to find the group for team1 first
                        $group = $phase->groups()
                            ->whereHas('participants', function ($query) use ($team1) {
                                $query->where('participant_id', $team1->id);
                            })
                            ->first();
                        
                        $match = GameMatch::create([
                            'category_id' => $category->id,
                            'phase_id' => $phase->id,
                            'group_id' => $group ? $group->id : null,
                            'team1_id' => $team1->id,
                            'team2_id' => $team2->id,
                            'phase' => 'group',
                            'status' => 'scheduled',
                            'match_order' => $maxMatchOrder,
                        ]);
                        
                        $created++;
                    } catch (\Exception $e) {
                        $errors[] = "Row {$rowNumber}: Failed to create match between '{$team1Name}' and '{$team2Name}': " . $e->getMessage();
                        continue;
                    }
                }

                // Find court (if provided)
                $court = null;
                if (!empty($courtName)) {
                    $court = $courts->first(function ($c) use ($courtName) {
                        // Exact match
                        if (strcasecmp(trim($c->name), $courtName) === 0) {
                            return true;
                        }
                        // Try matching "1" to "Court 1", "2" to "Court 2", etc.
                        if (is_numeric($courtName)) {
                            if (strcasecmp(trim($c->name), "Court {$courtName}") === 0) {
                                return true;
                            }
                        }
                        return false;
                    });

                    if (!$court) {
                        $availableCourts = $courts->pluck('name')->take(5)->implode(', ');
                        $errors[] = "Row {$rowNumber}: Court not found: '{$courtName}'. Available courts: {$availableCourts}";
                    }
                }

                // Parse date and time
                $scheduledTime = null;
                if (!empty($date) && !empty($time)) {
                    try {
                        // Handle Excel date/time formats
                        if (is_numeric($date)) {
                            // Excel serial date
                            $dateObj = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($date);
                            $dateStr = $dateObj->format('Y-m-d');
                        } else {
                            // Try to parse date string
                            // Support formats: DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, YYYY/MM/DD
                            $dateStr = null;
                            
                            // Try DD-MM-YYYY or DD/MM/YYYY format first
                            if (preg_match('/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/', $date, $matches)) {
                                $day = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
                                $month = str_pad($matches[2], 2, '0', STR_PAD_LEFT);
                                $year = $matches[3];
                                $dateStr = "{$year}-{$month}-{$day}";
                            } 
                            // Try YYYY-MM-DD or YYYY/MM/DD format
                            else if (preg_match('/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/', $date, $matches)) {
                                $year = $matches[1];
                                $month = str_pad($matches[2], 2, '0', STR_PAD_LEFT);
                                $day = str_pad($matches[3], 2, '0', STR_PAD_LEFT);
                                $dateStr = "{$year}-{$month}-{$day}";
                            } else {
                                // Fallback to strtotime
                                $timestamp = strtotime($date);
                                if ($timestamp !== false) {
                                    $dateStr = date('Y-m-d', $timestamp);
                                }
                            }
                            
                            if (!$dateStr) {
                                $errors[] = "Row {$rowNumber}: Invalid date format: '{$date}'. Use DD-MM-YYYY or YYYY-MM-DD";
                                continue;
                            }
                        }

                        if (is_numeric($time)) {
                            // Excel serial time
                            $timeObj = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($time);
                            $timeStr = $timeObj->format('H:i:s');
                        } else {
                            // Parse time string (HH:MM or HH:MM:SS)
                            if (preg_match('/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/', $time, $matches)) {
                                $hour = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
                                $minute = str_pad($matches[2], 2, '0', STR_PAD_LEFT);
                                $second = isset($matches[3]) ? str_pad($matches[3], 2, '0', STR_PAD_LEFT) : '00';
                                $timeStr = "{$hour}:{$minute}:{$second}";
                            } else {
                                $errors[] = "Row {$rowNumber}: Invalid time format: '{$time}'. Use HH:MM (e.g., 09:00, 14:30)";
                                continue;
                            }
                        }

                        $scheduledTime = $dateStr . ' ' . $timeStr;
                    } catch (\Exception $e) {
                        $errors[] = "Row {$rowNumber}: Error parsing date/time: " . $e->getMessage();
                    }
                }

                // Update match
                $updateData = [];
                if ($court) {
                    $updateData['court_id'] = $court->id;
                }
                if ($scheduledTime) {
                    $updateData['scheduled_time'] = $scheduledTime;
                }

                if (!empty($updateData)) {
                    $match->update($updateData);
                    $updated++;
                }
            }

            DB::commit();

            // Build success message
            $messageParts = [];
            if ($created > 0) {
                $messageParts[] = "Created {$created} new match(es)";
            }
            if ($updated > 0) {
                $messageParts[] = "Updated {$updated} existing match(es)";
            }
            
            $message = !empty($messageParts) ? implode(' and ', $messageParts) : "No changes made";
            
            if (!empty($errors)) {
                $message .= ". Errors: " . implode('; ', array_slice($errors, 0, 5));
                if (count($errors) > 5) {
                    $message .= " (and " . (count($errors) - 5) . " more)";
                }
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'created' => $created,
                'updated' => $updated,
                'errors' => $errors,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Schedule import error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Error processing file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download schedule template Excel file
     */
    public function downloadScheduleTemplate(Request $request, Category $category)
    {
        // Get phase_id from request if provided
        $phaseId = $request->query('phase_id');
        
        $data = [
            ['Team 1', 'Team 2', 'Court', 'Date', 'Time'],
        ];

        if ($phaseId) {
            // Export existing matches if phase is specified
            $phase = \App\Models\TournamentPhase::findOrFail($phaseId);
            
            $matches = GameMatch::where('phase_id', $phaseId)
                ->with(['team1', 'team2', 'court'])
                ->orderBy('scheduled_time')
                ->orderBy('match_order')
                ->get();

            if ($phase->type === 'group') {
                foreach ($matches as $match) {
                    if ($match->team1 && $match->team2) {
                        // Use team name if available, otherwise use player names
                        $team1Name = !empty($match->team1->name) 
                            ? $match->team1->name 
                            : $match->team1->player_1 . ' / ' . $match->team1->player_2;
                        
                        $team2Name = !empty($match->team2->name) 
                            ? $match->team2->name 
                            : $match->team2->player_1 . ' / ' . $match->team2->player_2;
                        
                        $courtName = $match->court ? $match->court->name : '';
                        
                        $date = '';
                        $time = '';
                        if ($match->scheduled_time) {
                            $scheduledTime = \Carbon\Carbon::parse($match->scheduled_time);
                            $date = $scheduledTime->format('Y-m-d');
                            $time = $scheduledTime->format('H:i');
                        }
                        
                        $data[] = [$team1Name, $team2Name, $courtName, $date, $time];
                    }
                }
            } else {
                // Knockout phase - export with templates or actual teams
                foreach ($matches as $match) {
                    // Show template or actual team name
                    $team1Name = '';
                    if ($match->team1_id && $match->team1) {
                        $team1Name = !empty($match->team1->name) 
                            ? $match->team1->name 
                            : $match->team1->player_1 . ' / ' . $match->team1->player_2;
                    } elseif ($match->team1_template) {
                        $team1Name = $this->formatTemplateForExport($match->team1_template);
                    }
                    
                    $team2Name = '';
                    if ($match->team2_id && $match->team2) {
                        $team2Name = !empty($match->team2->name) 
                            ? $match->team2->name 
                            : $match->team2->player_1 . ' / ' . $match->team2->player_2;
                    } elseif ($match->team2_template) {
                        $team2Name = $this->formatTemplateForExport($match->team2_template);
                    }
                    
                    $courtName = $match->court ? $match->court->name : '';
                    
                    $date = '';
                    $time = '';
                    if ($match->scheduled_time) {
                        $scheduledTime = \Carbon\Carbon::parse($match->scheduled_time);
                        $date = $scheduledTime->format('Y-m-d');
                        $time = $scheduledTime->format('H:i');
                    }
                    
                    $data[] = [$team1Name, $team2Name, $courtName, $date, $time];
                }
                
                // Add example rows if no matches exist
                if (count($data) === 1) {
                    $data[] = ['1st Group A', '2nd Group B', 'Court 1', '2026-02-01', '09:00'];
                    $data[] = ['2nd Group A', '1st Group B', 'Court 2', '2026-02-01', '10:00'];
                    $data[] = ['Winner Match 1', 'Winner Match 2', 'Court 1', '2026-02-02', '14:00'];
                }
            }
        } else {
            // Add example rows if no phase specified
            $data[] = ['Team A', 'Team B', 'Court 1', '2026-01-30', '09:00'];
            $data[] = ['1st Group A', '2nd Group B', 'Court 1', '2026-02-01', '09:00'];
            $data[] = ['Winner Match 1', 'Winner Match 2', 'Court 1', '2026-02-02', '14:00'];
        }

        return Excel::download(new class($data) implements \Maatwebsite\Excel\Concerns\FromArray {
            private $data;
            
            public function __construct($data) {
                $this->data = $data;
            }
            
            public function array(): array {
                return $this->data;
            }
        }, 'match-schedule-template.xlsx');
    }
    
    /**
     * Format template for Excel export (human-readable)
     */
    private function formatTemplateForExport(string $template): string
    {
        // "1st_group_A" -> "1st Group A"
        if (preg_match('/^(\d+)(st|nd|rd|th)_group_([a-z])/i', $template, $matches)) {
            $rank = $matches[1];
            $suffix = $matches[2];
            $group = strtoupper($matches[3]);
            return "{$rank}{$suffix} Group {$group}";
        }
        
        // "winner_match_1" or similar -> "Winner Match 1"
        if (preg_match('/^winner_match_(.+)/i', $template, $matches)) {
            $matchRef = strtoupper($matches[1]);
            return "Winner Match {$matchRef}";
        }
        
        return $template;
    }

    /**
     * Parse team name into a template format
     * Supports: "1st Group A", "Group A 1st", "2nd Group B", "Winner Match 1", "Winner QF1", team names
     */
    private function parseTeamTemplate(string $teamName): ?string
    {
        $teamName = trim($teamName);
        
        // Check if it's a ranking + group format: "1st Group A", "2nd Group B", etc.
        if (preg_match('/^(\d+)(st|nd|rd|th)?\s+group\s+([a-z])/i', $teamName, $matches)) {
            $rank = $matches[1];
            $group = strtoupper($matches[3]);
            $suffix = $rank === '1' ? 'st' : ($rank === '2' ? 'nd' : ($rank === '3' ? 'rd' : 'th'));
            return "{$rank}{$suffix}_group_{$group}";
        }
        
        // Check if it's group + ranking format: "Group A 1st", "Group B 2nd", etc.
        if (preg_match('/^group\s+([a-z])\s+(\d+)(st|nd|rd|th)?/i', $teamName, $matches)) {
            $group = strtoupper($matches[1]);
            $rank = $matches[2];
            $suffix = $rank === '1' ? 'st' : ($rank === '2' ? 'nd' : ($rank === '3' ? 'rd' : 'th'));
            return "{$rank}{$suffix}_group_{$group}";
        }
        
        // Check if it's already in template format: "1st_group_A", "2nd_group_B"
        if (preg_match('/^(\d+)(st|nd|rd|th)_group_([a-z])/i', $teamName, $matches)) {
            return strtolower($teamName);
        }
        
        // Check if it's a winner format: "Winner Match 1", "Winner QF1", "Winner SF1", etc.
        if (preg_match('/^winner\s+(match\s+)?(\d+|qf\d+|sf\d+|f\d+)/i', $teamName, $matches)) {
            $matchRef = strtolower($matches[2]);
            return "winner_match_{$matchRef}";
        }
        
        // Check if it's a winner of specific teams: "Winner (A1 vs B2)"
        if (preg_match('/^winner\s+\((.+)\s+vs\s+(.+)\)/i', $teamName)) {
            // Return as-is, will be handled differently
            return "winner_teams_{$teamName}";
        }
        
        // Otherwise, treat as a team name
        return "team_{$teamName}";
    }
    
    /**
     * Find or create a knockout match based on templates
     */
    private function findOrCreateKnockoutMatch($phase, $category, $team1Name, $team2Name, $team1Template, $team2Template, &$maxMatchOrder, &$created)
    {
        // Try to find existing match by templates
        $match = GameMatch::where('phase_id', $phase->id)
            ->where(function ($query) use ($team1Template, $team2Template) {
                $query->where(function ($q) use ($team1Template, $team2Template) {
                    $q->where('team1_template', $team1Template)
                      ->where('team2_template', $team2Template);
                })->orWhere(function ($q) use ($team1Template, $team2Template) {
                    $q->where('team1_template', $team2Template)
                      ->where('team2_template', $team1Template);
                });
            })
            ->first();
        
        if ($match) {
            return $match;
        }
        
        // Create new knockout match
        $maxMatchOrder++;
        
        $match = GameMatch::create([
            'category_id' => $category->id,
            'phase_id' => $phase->id,
            'team1_template' => $team1Template,
            'team2_template' => $team2Template,
            'phase' => 'knockout',
            'status' => 'scheduled',
            'match_order' => $maxMatchOrder,
        ]);
        
        $match->wasRecentlyCreated = true;
        $created++;
        
        return $match;
    }
    
    /**
     * Parse schedule data (court, date, time) from row
     */
    private function parseScheduleData($courtName, $courts, $date, $time, $rowNumber, &$errors): array
    {
        $updateData = [];
        
        // Find court (if provided)
        if (!empty($courtName)) {
            $court = $courts->first(function ($c) use ($courtName) {
                // Exact match
                if (strcasecmp(trim($c->name), $courtName) === 0) {
                    return true;
                }
                // Try matching "1" to "Court 1", "2" to "Court 2", etc.
                if (is_numeric($courtName)) {
                    if (strcasecmp(trim($c->name), "Court {$courtName}") === 0) {
                        return true;
                    }
                }
                return false;
            });

            if ($court) {
                $updateData['court_id'] = $court->id;
            } else {
                $availableCourts = $courts->pluck('name')->take(5)->implode(', ');
                $errors[] = "Row {$rowNumber}: Court not found: '{$courtName}'. Available courts: {$availableCourts}";
            }
        }
        
        // Parse date and time
        if (!empty($date) && !empty($time)) {
            try {
                // Handle Excel date/time formats
                if (is_numeric($date)) {
                    // Excel serial date
                    $dateObj = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($date);
                    $dateStr = $dateObj->format('Y-m-d');
                } else {
                    // Try to parse date string
                    $dateStr = null;
                    
                    // Try DD-MM-YYYY or DD/MM/YYYY format first
                    if (preg_match('/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/', $date, $matches)) {
                        $day = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
                        $month = str_pad($matches[2], 2, '0', STR_PAD_LEFT);
                        $year = $matches[3];
                        $dateStr = "{$year}-{$month}-{$day}";
                    } 
                    // Try YYYY-MM-DD or YYYY/MM/DD format
                    else if (preg_match('/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/', $date, $matches)) {
                        $year = $matches[1];
                        $month = str_pad($matches[2], 2, '0', STR_PAD_LEFT);
                        $day = str_pad($matches[3], 2, '0', STR_PAD_LEFT);
                        $dateStr = "{$year}-{$month}-{$day}";
                    } else {
                        // Fallback to strtotime
                        $timestamp = strtotime($date);
                        if ($timestamp !== false) {
                            $dateStr = date('Y-m-d', $timestamp);
                        }
                    }
                    
                    if (!$dateStr) {
                        $errors[] = "Row {$rowNumber}: Invalid date format: '{$date}'. Use DD-MM-YYYY or YYYY-MM-DD";
                        return $updateData;
                    }
                }

                if (is_numeric($time)) {
                    // Excel serial time
                    $timeObj = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($time);
                    $timeStr = $timeObj->format('H:i:s');
                } else {
                    // Parse time string (HH:MM or HH:MM:SS)
                    if (preg_match('/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/', $time, $matches)) {
                        $hour = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
                        $minute = str_pad($matches[2], 2, '0', STR_PAD_LEFT);
                        $second = isset($matches[3]) ? str_pad($matches[3], 2, '0', STR_PAD_LEFT) : '00';
                        $timeStr = "{$hour}:{$minute}:{$second}";
                    } else {
                        $errors[] = "Row {$rowNumber}: Invalid time format: '{$time}'. Use HH:MM (e.g., 09:00, 14:30)";
                        return $updateData;
                    }
                }

                $updateData['scheduled_time'] = $dateStr . ' ' . $timeStr;
            } catch (\Exception $e) {
                $errors[] = "Row {$rowNumber}: Error parsing date/time: " . $e->getMessage();
            }
        }
        
        return $updateData;
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
            'status' => 'nullable|in:scheduled,upcoming,in_progress,completed,cancelled',
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

    /**
     * Show referee control page
     */
    public function referee(Category $category, GameMatch $match): Response
    {
        $category->load('event');
        $match->load(['team1', 'team2', 'court', 'group', 'tournamentPhase']);

        return Inertia::render('Matches/Referee', [
            'category' => $category,
            'match' => $match,
        ]);
    }

    /**
     * Show score monitor page for a specific court
     */
    public function courtMonitor(\App\Models\Court $court): Response
    {
        // Only get matches that are upcoming or in_progress
        // Don't show scheduled matches - those show default view
        $match = \App\Models\GameMatch::where('court_id', $court->id)
            ->whereIn('status', ['upcoming', 'in_progress'])
            ->with(['team1', 'team2', 'court', 'group', 'category.event', 'tournamentPhase'])
            ->orderBy('updated_at', 'desc')
            ->first();

        $court->load('event');

        // If there's a match, use its category, otherwise use a default
        $category = $match ? $match->category : null;

        return Inertia::render('Matches/Monitor', [
            'category' => $category,
            'match' => $match, // Will be null if no upcoming/in_progress match
            'court' => $court, // Pass court for fallback display
        ]);
    }

    /**
     * Prepare match for starting (change to upcoming status)
     */
    public function startPrep(Category $category, GameMatch $match): \Illuminate\Http\JsonResponse
    {
        // Check if match has a court assigned
        if (!$match->court_id) {
            return response()->json([
                'error' => 'Please assign a court before starting this match.'
            ], 422);
        }

        // Check if the court already has an active/upcoming match
        $activeMatch = GameMatch::where('court_id', $match->court_id)
            ->where('id', '!=', $match->id)
            ->where(function($query) {
                $query->where('status', 'upcoming')
                      ->orWhere('status', 'in_progress')
                      ->orWhere(function($q) {
                          $q->where('status', 'scheduled')
                            ->whereNotNull('warmup_started_at')
                            ->whereNull('match_ended_at');
                      });
            })
            ->with(['team1', 'team2', 'court'])
            ->first();

        if ($activeMatch) {
            $matchInfo = "{$activeMatch->team1->player_1}-{$activeMatch->team1->player_2} vs {$activeMatch->team2->player_1}-{$activeMatch->team2->player_2}";
            return response()->json([
                'error' => "Court {$activeMatch->court->name} is currently occupied by: {$matchInfo}. Please reset that match first or choose a different court."
            ], 422);
        }

        // Mark match as upcoming
        $match->update([
            'status' => 'upcoming',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Match is now ready to start. Court ' . $match->court->name . ' has been reserved.'
        ]);
    }

    /**
     * Start warm-up timer
     */
    public function warmupStart(Category $category, GameMatch $match): RedirectResponse
    {
        // Check if match has a court assigned
        if (!$match->court_id) {
            return back()->with('error', 'Please assign a court before starting warm-up.');
        }

        // Check if the court already has an active match
        $activeMatch = GameMatch::where('court_id', $match->court_id)
            ->where('id', '!=', $match->id)
            ->whereIn('status', ['upcoming', 'in_progress'])
            ->whereNull('match_ended_at')
            ->first();

        if ($activeMatch) {
            return back()->with('error', 'Court ' . $match->court->name . ' is currently occupied by another match. Please reset that match first or choose a different court.');
        }

        $match->update([
            'warmup_started_at' => now(),
            'status' => 'in_progress',
        ]);

        return back();
    }

    /**
     * Reset warm-up timer
     */
    public function warmupReset(Category $category, GameMatch $match): RedirectResponse
    {
        $match->update([
            'warmup_started_at' => null,
            'warmup_ended_at' => null,
            'warmup_skipped' => false,
        ]);

        return back();
    }

    /**
     * Skip warm-up
     */
    public function warmupSkip(Category $category, GameMatch $match): RedirectResponse
    {
        $match->update([
            'warmup_skipped' => true,
            'warmup_started_at' => $match->warmup_started_at ?? now(),
            'warmup_ended_at' => now(),
        ]);

        return back();
    }

    /**
     * End warm-up (automatic or manual)
     */
    public function warmupEnd(Category $category, GameMatch $match): RedirectResponse
    {
        $match->update([
            'warmup_ended_at' => now(),
        ]);

        return back();
    }

    /**
     * Start the actual match
     */
    public function startMatch(Category $category, GameMatch $match): RedirectResponse
    {
        // Check if match has a court assigned
        if (!$match->court_id) {
            return back()->with('error', 'Please assign a court before starting the match.');
        }

        // Check if the court already has an active match
        $activeMatch = GameMatch::where('court_id', $match->court_id)
            ->where('id', '!=', $match->id)
            ->where('status', 'in_progress')
            ->first();

        if ($activeMatch) {
            return back()->with('error', 'Court ' . $match->court->name . ' already has an active match. Please complete or cancel it first.');
        }

        $match->update([
            'match_started_at' => now(),
            'status' => 'in_progress',
            'current_game_team1_points' => '0',
            'current_game_team2_points' => '0',
            'current_game_advantages' => 0,
            'team1_score' => 0,
            'team2_score' => 0,
            'current_server_team_id' => $match->team1_id, // Team 1 serves first
            'score_details' => ['games' => []],
            'is_tiebreaker' => false,
        ]);

        return back();
    }

    /**
     * Score a point for a team
     */
    public function scorePoint(Request $request, Category $category, GameMatch $match): RedirectResponse
    {
        $team = $request->input('team'); // 'team1' or 'team2'
        
        // Get scoring configuration from the match's phase
        $phase = $match->tournamentPhase;
        if (!$phase) {
            return back()->with('error', 'Match phase not found.');
        }

        $config = [
            'games_target' => $phase->games_target,
            'scoring_type' => $phase->scoring_type,
            'advantage_limit' => $phase->advantage_limit,
            'tiebreaker_points' => $phase->tiebreaker_points,
            'tiebreaker_two_point_difference' => $phase->tiebreaker_two_point_difference,
        ];

        // Determine if we should enter tie-breaker mode
        $tieScore = $config['games_target'] - 1; // For first to 4: 3-3, for first to 6: 5-5
        $shouldEnterTiebreaker = !$match->is_tiebreaker && 
                                 $match->team1_score == $tieScore && 
                                 $match->team2_score == $tieScore;

        if ($shouldEnterTiebreaker) {
            // Enter tie-breaker mode
            $match->update([
                'is_tiebreaker' => true,
                'current_game_team1_points' => '0',
                'current_game_team2_points' => '0',
                'current_game_advantages' => 0,
            ]);
            // Reload to get updated state
            $match->refresh();
        }

        // Check if we're in tie-breaker mode
        if ($match->is_tiebreaker) {
            return $this->scoreTiebreakerPoint($match, $team, $config);
        }

        // Regular game scoring (tennis points: 0, 15, 30, 40, AD)
        // Ensure points are valid strings (handle null, empty string, or 0)
        $team1Points = $match->current_game_team1_points ?: '0';
        $team2Points = $match->current_game_team2_points ?: '0';
        
        \Log::info('Score point attempt', [
            'team' => $team,
            'current_team1_points' => $team1Points,
            'current_team2_points' => $team2Points,
            'raw_team1' => $match->current_game_team1_points,
            'raw_team2' => $match->current_game_team2_points,
        ]);
        
        // Point progression: 0 -> 15 -> 30 -> 40
        $pointProgression = ['0' => '15', '15' => '30', '30' => '40'];
        
        // Track if game was won (to avoid overwriting reset points)
        $gameWon = false;

        if ($team === 'team1') {
            // Check if game is won
            if ($team1Points === '40') {
                if ($team2Points === '40') {
                    // Deuce situation
                    if ($config['scoring_type'] === 'no_ad') {
                        // Golden point - team 1 wins
                        $this->teamWinsGame($match, 'team1', $config['games_target']);
                        $gameWon = true;
                    } else if ($config['scoring_type'] === 'traditional') {
                        // Check if golden point (after 2 advantages)
                        if ($match->current_game_advantages >= 2) {
                            // Golden point - team 1 wins
                            $this->teamWinsGame($match, 'team1', $config['games_target']);
                            $gameWon = true;
                        } else {
                            // Go to advantage
                            $team1Points = 'AD';
                            $team2Points = '40';
                        }
                    } else if ($config['scoring_type'] === 'advantage_limit') {
                        // Check advantage limit (max 2)
                        if ($match->current_game_advantages >= 2) {
                            // Golden point - team 1 wins
                            $this->teamWinsGame($match, 'team1', $config['games_target']);
                            $gameWon = true;
                        } else {
                            // Go to advantage
                            $team1Points = 'AD';
                            $team2Points = '40';
                        }
                    }
                } else if ($team2Points === 'AD') {
                    // Back to deuce - don't reset advantages (accumulate for golden point)
                    $team1Points = '40';
                    $team2Points = '40';
                } else {
                    // Team 1 wins game
                    $this->teamWinsGame($match, 'team1', $config['games_target']);
                    $gameWon = true;
                }
            } else if ($team1Points === 'AD') {
                // Team 1 wins game
                $this->teamWinsGame($match, 'team1', $config['games_target']);
                $gameWon = true;
            } else {
                // Progress point
                if (isset($pointProgression[$team1Points])) {
                    $team1Points = $pointProgression[$team1Points];
                } else {
                    \Log::error('Invalid point value for team1', ['points' => $team1Points]);
                    return back()->with('error', 'Invalid point value: ' . $team1Points);
                }
            }
        } else {
            // Team 2 scores
            if ($team2Points === '40') {
                if ($team1Points === '40') {
                    // Deuce situation
                    if ($config['scoring_type'] === 'no_ad') {
                        // Golden point - team 2 wins
                        $this->teamWinsGame($match, 'team2', $config['games_target']);
                        $gameWon = true;
                    } else if ($config['scoring_type'] === 'traditional') {
                        // Check if golden point (after 2 advantages)
                        if ($match->current_game_advantages >= 2) {
                            // Golden point - team 2 wins
                            $this->teamWinsGame($match, 'team2', $config['games_target']);
                            $gameWon = true;
                        } else {
                            // Go to advantage
                            $team2Points = 'AD';
                            $team1Points = '40';
                        }
                    } else if ($config['scoring_type'] === 'advantage_limit') {
                        // Check advantage limit (max 2)
                        if ($match->current_game_advantages >= 2) {
                            // Golden point - team 2 wins
                            $this->teamWinsGame($match, 'team2', $config['games_target']);
                            $gameWon = true;
                        } else {
                            // Go to advantage
                            $team2Points = 'AD';
                            $team1Points = '40';
                        }
                    }
                } else if ($team1Points === 'AD') {
                    // Back to deuce - don't reset advantages (accumulate for golden point)
                    $team1Points = '40';
                    $team2Points = '40';
                } else {
                    // Team 2 wins game
                    $this->teamWinsGame($match, 'team2', $config['games_target']);
                    $gameWon = true;
                }
            } else if ($team2Points === 'AD') {
                // Team 2 wins game
                $this->teamWinsGame($match, 'team2', $config['games_target']);
                $gameWon = true;
            } else {
                // Progress point
                if (isset($pointProgression[$team2Points])) {
                    $team2Points = $pointProgression[$team2Points];
                } else {
                    \Log::error('Invalid point value for team2', ['points' => $team2Points]);
                    return back()->with('error', 'Invalid point value: ' . $team2Points);
                }
            }
        }

        // Update current game points ONLY if game was not won
        // (teamWinsGame already resets points to 0-0)
        \Log::info('Before update check', [
            'gameWon' => $gameWon,
            'match_status' => $match->status,
            'will_update' => !$gameWon && in_array($match->status, ['in_progress', 'upcoming']),
        ]);
        
        if (!$gameWon && in_array($match->status, ['in_progress', 'upcoming'])) {
            // Detect if we just went to advantage (from 40-40 to AD-40 or 40-AD)
            $oldPoints = [
                $match->current_game_team1_points ?: '0', 
                $match->current_game_team2_points ?: '0'
            ];
            $newPoints = [$team1Points, $team2Points];
            
            // Increment advantage counter if we just went from deuce to advantage
            if (in_array('AD', $newPoints) && !in_array('AD', $oldPoints) && 
                $oldPoints[0] === '40' && $oldPoints[1] === '40') {
                $match->current_game_advantages++;
            }
            
            $match->update([
                'current_game_team1_points' => $team1Points,
                'current_game_team2_points' => $team2Points,
                'current_game_advantages' => $match->current_game_advantages,
            ]);
        }

        return back();
    }

    /**
     * Score a point in tie-breaker mode
     */
    private function scoreTiebreakerPoint(GameMatch $match, string $team, array $config): RedirectResponse
    {
        $team1Points = (int)($match->current_game_team1_points ?: 0);
        $team2Points = (int)($match->current_game_team2_points ?: 0);

        // Increment points
        if ($team === 'team1') {
            $team1Points++;
        } else {
            $team2Points++;
        }

        // Check if tie-breaker is won
        $targetPoints = $config['tiebreaker_points'];
        $requireTwoPointDiff = $config['tiebreaker_two_point_difference'];
        $tiebreakerWon = false;
        $winner = null;

        if ($requireTwoPointDiff) {
            // Must reach target points AND have 2-point lead
            if ($team1Points >= $targetPoints && $team1Points - $team2Points >= 2) {
                $tiebreakerWon = true;
                $winner = 'team1';
            } else if ($team2Points >= $targetPoints && $team2Points - $team1Points >= 2) {
                $tiebreakerWon = true;
                $winner = 'team2';
            }
        } else {
            // First to reach target points wins
            if ($team1Points >= $targetPoints) {
                $tiebreakerWon = true;
                $winner = 'team1';
            } else if ($team2Points >= $targetPoints) {
                $tiebreakerWon = true;
                $winner = 'team2';
            }
        }

        if ($tiebreakerWon) {
            // Team wins the tie-breaker, which means they win the match
            $this->teamWinsTiebreaker($match, $winner, $config['games_target']);
        } else {
            // Update tie-breaker points
            $match->update([
                'current_game_team1_points' => (string)$team1Points,
                'current_game_team2_points' => (string)$team2Points,
            ]);
        }

        return back();
    }

    /**
     * Helper method to handle team winning a game
     */
    private function teamWinsGame(GameMatch $match, string $team, int $gamesTarget)
    {
        $team1Score = $match->team1_score;
        $team2Score = $match->team2_score;

        // Increment game score
        if ($team === 'team1') {
            $team1Score++;
        } else {
            $team2Score++;
        }

        // Store game result in score_details
        $scoreDetails = $match->score_details ?? ['games' => []];
        $scoreDetails['games'][] = [
            'team1' => $team1Score,
            'team2' => $team2Score,
        ];

        // Check if match is won - team reaches games_target
        $matchWon = false;
        $winnerId = null;

        // Auto-complete match when a team reaches the target
        if ($team1Score >= $gamesTarget && $team1Score > $team2Score) {
            $matchWon = true;
            $winnerId = $match->team1_id;
        } else if ($team2Score >= $gamesTarget && $team2Score > $team1Score) {
            $matchWon = true;
            $winnerId = $match->team2_id;
        }


        if ($matchWon) {
            $match->update([
                'team1_score' => $team1Score,
                'team2_score' => $team2Score,
                'winner_id' => $winnerId,
                'status' => 'completed',
                'match_ended_at' => now(),
                'score_details' => $scoreDetails,
            ]);
        } else {
            // Start new game or continue
            $match->update([
                'team1_score' => $team1Score,
                'team2_score' => $team2Score,
                'current_game_team1_points' => '0',
                'current_game_team2_points' => '0',
                'current_game_advantages' => 0,
                'score_details' => $scoreDetails,
                // Switch server
                'current_server_team_id' => $match->current_server_team_id === $match->team1_id 
                    ? $match->team2_id 
                    : $match->team1_id,
            ]);
        }
    }

    /**
     * Helper method to handle team winning a tie-breaker
     */
    private function teamWinsTiebreaker(GameMatch $match, string $team, int $gamesTarget)
    {
        $team1Score = $match->team1_score;
        $team2Score = $match->team2_score;

        // Increment game score (tie-breaker counts as one game)
        if ($team === 'team1') {
            $team1Score++;
        } else {
            $team2Score++;
        }

        // Store game result in score_details
        $scoreDetails = $match->score_details ?? ['games' => []];
        $scoreDetails['games'][] = [
            'team1' => $team1Score,
            'team2' => $team2Score,
            'tiebreaker' => true,
            'tiebreaker_score' => [
                'team1' => $match->current_game_team1_points,
                'team2' => $match->current_game_team2_points,
            ],
        ];

        // Tie-breaker winner wins the match
        $winnerId = $team === 'team1' ? $match->team1_id : $match->team2_id;

        $match->update([
            'team1_score' => $team1Score,
            'team2_score' => $team2Score,
            'winner_id' => $winnerId,
            'status' => 'completed',
            'match_ended_at' => now(),
            'score_details' => $scoreDetails,
            'is_tiebreaker' => false,
        ]);
    }

    /**
     * Undo last point
     */
    public function undoPoint(Request $request, Category $category, GameMatch $match): RedirectResponse
    {
        $team = $request->input('team');
        
        \Log::info('Undo point requested', [
            'team' => $team,
            'current_team1_points' => $match->current_game_team1_points,
            'current_team2_points' => $match->current_game_team2_points,
            'team1_score' => $match->team1_score,
            'team2_score' => $match->team2_score,
        ]);
        
        // Check if we need to undo a game win
        // A new game just started if both points are 0 or null, AND at least one team has games
        $isNewGame = (empty($match->current_game_team1_points) || $match->current_game_team1_points === '0') && 
                     (empty($match->current_game_team2_points) || $match->current_game_team2_points === '0');
        
        $hasGames = ($match->team1_score > 0 || $match->team2_score > 0);
        
        if ($isNewGame && $hasGames) {
            \Log::info('Attempting to undo game win');
            
            // We need to undo the last game win
            $scoreDetails = $match->score_details ?? ['games' => []];
            
            // Decrement the game score for the team that won
            $team1Score = $match->team1_score ?? 0;
            $team2Score = $match->team2_score ?? 0;
            
            if ($team === 'team1' && $team1Score > 0) {
                $team1Score--;
            } elseif ($team === 'team2' && $team2Score > 0) {
                $team2Score--;
            } else {
                return back()->with('error', 'Cannot undo - no games to undo for this team.');
            }
            
            // Remove the last game from history
            if (!empty($scoreDetails['games'])) {
                array_pop($scoreDetails['games']);
            }
            
            // Restore to the game-winning point state (40-30 in favor of the team that won)
            $team1Points = $team === 'team1' ? '40' : '30';
            $team2Points = $team === 'team2' ? '40' : '30';
            
            $match->update([
                'team1_score' => $team1Score,
                'team2_score' => $team2Score,
                'current_game_team1_points' => $team1Points,
                'current_game_team2_points' => $team2Points,
                'current_game_advantages' => 0,
                'score_details' => $scoreDetails,
                'status' => 'in_progress', // In case match was completed
                'winner_id' => null, // Clear winner if match was completed
                'match_ended_at' => null,
            ]);
            
            \Log::info('Game win undone successfully', [
                'new_team1_score' => $team1Score,
                'new_team2_score' => $team2Score,
                'restored_points' => "$team1Points-$team2Points",
            ]);
            
            return back()->with('success', 'Game win has been undone. Score restored to ' . $team1Score . '-' . $team2Score . ', points: ' . $team1Points . '-' . $team2Points);
        }
        
        // Normal point undo within a game
        $team1Points = $match->current_game_team1_points ?? '0';
        $team2Points = $match->current_game_team2_points ?? '0';
        
        $pointRegression = ['15' => '0', '30' => '15', '40' => '30', 'AD' => '40'];

        if ($team === 'team1') {
            if (isset($pointRegression[$team1Points])) {
                $team1Points = $pointRegression[$team1Points];
            } else {
                return back()->with('error', 'Cannot undo point - team already at 0.');
            }
        } else {
            if (isset($pointRegression[$team2Points])) {
                $team2Points = $pointRegression[$team2Points];
            } else {
                return back()->with('error', 'Cannot undo point - team already at 0.');
            }
        }
        
        $match->update([
            'current_game_team1_points' => $team1Points,
            'current_game_team2_points' => $team2Points,
        ]);

        return back();
    }

    /**
     * Manually adjust game score
     */
    public function adjustGameScore(Request $request, Category $category, GameMatch $match): RedirectResponse
    {
        $validated = $request->validate([
            'team' => 'required|in:team1,team2',
            'score' => 'required|integer|min:0',
        ]);

        $team = $validated['team'];
        $newScore = $validated['score'];

        // Update the game score
        $match->update([
            $team . '_score' => $newScore,
        ]);

        \Log::info('Game score manually adjusted', [
            'team' => $team,
            'new_score' => $newScore,
            'match_id' => $match->id,
        ]);

        return back()->with('success', 'Game score updated successfully.');
    }

    /**
     * Manually adjust current game points
     */
    public function adjustCurrentPoints(Request $request, Category $category, GameMatch $match): RedirectResponse
    {
        $validated = $request->validate([
            'team' => 'required|in:team1,team2',
            'points' => 'required|in:0,15,30,40,AD',
        ]);

        $team = $validated['team'];
        $newPoints = $validated['points'];

        // Update the current game points
        $field = 'current_game_' . $team . '_points';
        $match->update([
            $field => $newPoints,
        ]);

        \Log::info('Current game points manually adjusted', [
            'team' => $team,
            'new_points' => $newPoints,
            'match_id' => $match->id,
        ]);

        return back()->with('success', 'Current game points updated successfully.');
    }

    /**
     * Reset match to scheduled state (undo start)
     */
    public function resetMatch(Category $category, GameMatch $match): RedirectResponse
    {
        // Only allow resetting if match hasn't been completed
        if ($match->status === 'completed') {
            return back()->with('error', 'Cannot reset a completed match. Please delete it instead.');
        }

        $wasUpcoming = $match->status === 'upcoming';
        $wasStarted = $match->match_started_at !== null || $match->warmup_started_at !== null;

        // Reset all match state
        $match->update([
            'status' => 'scheduled',
            'warmup_started_at' => null,
            'warmup_ended_at' => null,
            'warmup_skipped' => false,
            'match_started_at' => null,
            'match_ended_at' => null,
            'team1_score' => null,
            'team2_score' => null,
            'winner_id' => null,
            'score_details' => null,
            'current_game_team1_points' => null,
            'current_game_team2_points' => null,
            'current_game_advantages' => 0,
            'current_server_team_id' => null,
            'is_tiebreaker' => false,
        ]);

        $message = $wasUpcoming && !$wasStarted
            ? 'Match has been reset. Court is now available for other matches.'
            : 'Match has been reset. All progress cleared. Court is now available for other matches.';

        return redirect()->route('categories.matches.index', $category)
            ->with('success', $message);
    }

    /**
     * Manually complete a match (for best of 3/4)
     */
    public function completeMatch(Category $category, GameMatch $match): RedirectResponse
    {
        if ($match->status === 'completed') {
            return back()->with('error', 'Match is already completed.');
        }

        if (!$match->match_started_at) {
            return back()->with('error', 'Cannot complete a match that hasn\'t started.');
        }

        // Determine winner based on current score
        $winnerId = null;
        $team1Score = $match->team1_score ?? 0;
        $team2Score = $match->team2_score ?? 0;

        if ($team1Score > $team2Score) {
            $winnerId = $match->team1_id;
        } else if ($team2Score > $team1Score) {
            $winnerId = $match->team2_id;
        }
        // else it's a draw (winnerId remains null)

        $match->update([
            'status' => 'completed',
            'match_ended_at' => now(),
            'winner_id' => $winnerId,
        ]);

        \Log::info('Match manually completed', [
            'match_id' => $match->id,
            'team1_score' => $team1Score,
            'team2_score' => $team2Score,
            'winner_id' => $winnerId,
        ]);

        return back()->with('success', 'Match completed successfully.');
    }
}
