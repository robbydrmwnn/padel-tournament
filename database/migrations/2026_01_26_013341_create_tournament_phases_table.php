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
        Schema::create('tournament_phases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('name'); // e.g., "Group Stage 1", "Semi Finals", "Finals"
            $table->enum('type', ['group', 'knockout']); // Type of phase
            $table->integer('order')->default(0); // Order of execution (1, 2, 3...)
            $table->integer('number_of_groups')->nullable(); // Only for group phases
            $table->integer('teams_advance_per_group')->nullable(); // Only for group phases
            
            // Scoring configuration for this phase
            $table->integer('games_target'); // First to X games (4, 6, 8, 10, 12)
            $table->enum('scoring_type', ['traditional', 'no_ad', 'advantage_limit'])->default('no_ad');
            $table->integer('advantage_limit')->nullable();
            $table->integer('tiebreaker_points')->default(7);
            $table->boolean('tiebreaker_two_point_difference')->default(true);
            
            $table->boolean('is_completed')->default(false);
            $table->boolean('is_final_phase')->default(false); // True if tournament ends after this phase
            $table->timestamps();
            
            $table->index(['category_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tournament_phases');
    }
};
