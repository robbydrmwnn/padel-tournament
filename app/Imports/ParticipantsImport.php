<?php

namespace App\Imports;

use App\Models\Category;
use App\Models\Participant;
use App\Models\Group;
use App\Models\TournamentPhase;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Validators\Failure;

class ParticipantsImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure
{
    protected $categoryId;
    protected $failures = [];
    protected $firstPhase = null;
    protected string $participantMode = 'team';

    public function __construct($categoryId)
    {
        $this->categoryId = $categoryId;
        $this->participantMode = Category::whereKey($categoryId)->value('participant_mode') ?? 'team';
        // Get the first phase (group stage) for this category
        $this->firstPhase = TournamentPhase::where('category_id', $categoryId)
            ->orderBy('order')
            ->first();
    }

    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        $player1 = $row['player_1'] ?? $row['player'] ?? null;
        $player2 = $row['player_2'] ?? null;

        // Skip empty rows
        if ($this->participantMode === 'individual') {
            if (empty($player1)) {
                return null;
            }
        } else {
            if (empty($player1) || empty($player2)) {
                return null;
            }
        }

        if (empty($player1)) {
            return null;
        }

        $participant = new Participant([
            'category_id' => $this->categoryId,
            'name' => $this->participantMode === 'individual' ? null : ($row['team_name'] ?? null),
            'player_1' => $player1,
            'player_2' => $this->participantMode === 'individual' ? null : $player2,
            'email' => $row['email'] ?? null,
            'phone' => isset($row['phone']) ? (string)$row['phone'] : null,
            'notes' => $row['notes'] ?? null,
        ]);

        // Save participant first to get the ID
        $participant->save();

        // Handle group assignment if provided
        if (!empty($row['group'])) {
            $groupName = trim($row['group']);
            
            // Find or create the group by name in this category with updateOrCreate
            $group = Group::updateOrCreate(
                [
                    'category_id' => $this->categoryId,
                    'name' => $groupName,
                ],
                [
                    'phase_id' => $this->firstPhase ? $this->firstPhase->id : null,
                    'order' => Group::where('category_id', $this->categoryId)
                        ->where('name', $groupName)
                        ->value('order') ?? (Group::where('category_id', $this->categoryId)->max('order') + 1)
                ]
            );

            // Attach participant to the group (sync to avoid duplicates)
            $participant->groups()->syncWithoutDetaching([$group->id]);
        }

        return $participant;
    }

    /**
     * Validation rules for each row
     */
    public function rules(): array
    {
        if ($this->participantMode === 'individual') {
            return [
                'player_1' => 'required|max:255',
                'player_2' => 'nullable|max:255',
                'team_name' => 'nullable|max:255',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable', // Accept both string and numeric
                'notes' => 'nullable',
                'group' => 'nullable|max:255',
            ];
        }

        return [
            'player_1' => 'required|max:255',
            'player_2' => 'required|max:255',
            'team_name' => 'nullable|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable', // Accept both string and numeric
            'notes' => 'nullable',
            'group' => 'nullable|max:255',
        ];
    }

    /**
     * Handle validation failures
     */
    public function onFailure(Failure ...$failures)
    {
        $this->failures = array_merge($this->failures, $failures);
    }

    /**
     * Get all validation failures
     */
    public function getFailures()
    {
        return $this->failures;
    }
}
