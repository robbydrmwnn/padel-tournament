<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Category;
use App\Models\TournamentPhase;
use App\Models\Group;
use App\Models\GameMatch;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For each existing category, create default phases based on current settings
        $categories = Category::all();
        
        foreach ($categories as $category) {
            // Create Group Phase (if groups exist)
            $hasGroups = $category->groups()->count() > 0;
            
            if ($hasGroups) {
                $groupPhase = TournamentPhase::create([
                    'category_id' => $category->id,
                    'name' => 'Group Stage',
                    'type' => 'group',
                    'order' => 1,
                    'number_of_groups' => $category->groups()->count(),
                    'teams_advance_per_group' => $category->teams_advance_per_group ?? 2,
                    'games_target' => $category->group_best_of_games ?? 4,
                    'scoring_type' => $category->group_scoring_type ?? 'no_ad',
                    'advantage_limit' => $category->group_advantage_limit,
                    'tiebreaker_points' => $category->group_tiebreaker_points ?? 7,
                    'tiebreaker_two_point_difference' => $category->group_tiebreaker_two_point_difference ?? true,
                    'is_completed' => $category->group_phase_completed ?? false,
                    'is_final_phase' => false,
                ]);
                
                // Link existing groups to this phase
                $category->groups()->update(['phase_id' => $groupPhase->id]);
                
                // Link existing group matches to this phase
                GameMatch::where('category_id', $category->id)
                    ->where('phase', 'group')
                    ->update(['phase_id' => $groupPhase->id]);
            }
            
            // Create Knockout Phase (as second phase)
            $knockoutPhase = TournamentPhase::create([
                'category_id' => $category->id,
                'name' => 'Knockout Stage',
                'type' => 'knockout',
                'order' => $hasGroups ? 2 : 1,
                'number_of_groups' => null,
                'teams_advance_per_group' => null,
                'games_target' => $category->knockout_best_of_games ?? 6,
                'scoring_type' => $category->knockout_scoring_type ?? 'no_ad',
                'advantage_limit' => $category->knockout_advantage_limit,
                'tiebreaker_points' => $category->knockout_tiebreaker_points ?? 7,
                'tiebreaker_two_point_difference' => $category->knockout_tiebreaker_two_point_difference ?? true,
                'is_completed' => false,
                'is_final_phase' => true,
            ]);
            
            // Link existing knockout matches to this phase
            GameMatch::where('category_id', $category->id)
                ->where('phase', 'knockout')
                ->update(['phase_id' => $knockoutPhase->id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove phase_id from groups and matches
        Group::query()->update(['phase_id' => null]);
        GameMatch::query()->update(['phase_id' => null]);
        
        // Delete all tournament phases
        TournamentPhase::query()->delete();
    }
};
