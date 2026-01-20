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
        Schema::table('categories', function (Blueprint $table) {
            // Group Phase Scoring Settings
            $table->integer('group_best_of_games')->default(3); // 3, 4, or 5 games
            $table->enum('group_scoring_type', ['traditional', 'no_ad', 'advantage_limit'])->default('no_ad');
            $table->integer('group_advantage_limit')->nullable(); // How many advantages before golden point
            
            // Knockout Phase Scoring Settings
            $table->integer('knockout_best_of_games')->default(3); // 3, 4, or 5 games
            $table->enum('knockout_scoring_type', ['traditional', 'no_ad', 'advantage_limit'])->default('no_ad');
            $table->integer('knockout_advantage_limit')->nullable();
            
            // Warm-up Timer
            $table->integer('warmup_minutes')->default(5); // Minutes for warm-up
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn([
                'group_best_of_games',
                'group_scoring_type',
                'group_advantage_limit',
                'knockout_best_of_games',
                'knockout_scoring_type',
                'knockout_advantage_limit',
                'warmup_minutes',
            ]);
        });
    }
};
