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
            // Template fields for dynamic participant assignment
            // e.g., "1st_group_A" or "2nd_group_B" or "winner_match_5"
            $table->string('team1_template')->nullable()->after('team1_id');
            $table->string('team2_template')->nullable()->after('team2_id');
            
            // Make team IDs nullable since they might be assigned dynamically
            $table->foreignId('team1_id')->nullable()->change();
            $table->foreignId('team2_id')->nullable()->change();
            
            // Match order within a phase
            $table->integer('match_order')->nullable()->after('phase_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->dropColumn(['team1_template', 'team2_template', 'match_order']);
        });
    }
};
