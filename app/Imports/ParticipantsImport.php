<?php

namespace App\Imports;

use App\Models\Participant;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Validators\Failure;

class ParticipantsImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure
{
    protected $categoryId;
    protected $failures = [];

    public function __construct($categoryId)
    {
        $this->categoryId = $categoryId;
    }

    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // Skip empty rows
        if (empty($row['player_1']) || empty($row['player_2'])) {
            return null;
        }

        return new Participant([
            'category_id' => $this->categoryId,
            'name' => $row['team_name'] ?? null,
            'player_1' => $row['player_1'],
            'player_2' => $row['player_2'],
            'email' => $row['email'] ?? null,
            'phone' => isset($row['phone']) ? (string)$row['phone'] : null,
            'notes' => $row['notes'] ?? null,
        ]);
    }

    /**
     * Validation rules for each row
     */
    public function rules(): array
    {
        return [
            'player_1' => 'required|max:255',
            'player_2' => 'required|max:255',
            'team_name' => 'nullable|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable', // Accept both string and numeric
            'notes' => 'nullable',
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
