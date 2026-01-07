<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            // Warm-up tracking
            $table->timestamp('warmup_started_at')->nullable();
            $table->timestamp('warmup_ended_at')->nullable();
            $table->boolean('warmup_skipped')->default(false);
            
            // Match timing
            $table->timestamp('match_started_at')->nullable();
            $table->timestamp('match_ended_at')->nullable();
            
            // Live scoring state (JSON to store game-by-game scores)
            $table->json('score_details')->nullable(); 
            // Structure: { games: [{team1: 6, team2: 4}, {team1: 3, team2: 6}], current_game: {team1_points: 30, team2_points: 40, advantages: 0} }
            
            // Current game state
            $table->string('current_game_team1_points')->nullable(); // "0", "15", "30", "40", "AD"
            $table->string('current_game_team2_points')->nullable();
            $table->integer('current_game_advantages')->default(0); // Track number of deuces
            
            // Serving
            $table->foreignId('current_server_team_id')->nullable()->constrained('participants')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->dropColumn([
                'warmup_started_at',
                'warmup_ended_at',
                'warmup_skipped',
                'match_started_at',
                'match_ended_at',
                'score_details',
                'current_game_team1_points',
                'current_game_team2_points',
                'current_game_advantages',
                'current_server_team_id',
            ]);
        });
    }
};
