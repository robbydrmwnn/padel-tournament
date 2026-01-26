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
            // Group Phase Tie-breaker Settings
            $table->integer('group_tiebreaker_points')->default(7); // Points to win tie-breaker
            $table->boolean('group_tiebreaker_two_point_difference')->default(true); // Require 2 point difference
            
            // Knockout Phase Tie-breaker Settings
            $table->integer('knockout_tiebreaker_points')->default(7); // Points to win tie-breaker
            $table->boolean('knockout_tiebreaker_two_point_difference')->default(true); // Require 2 point difference
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn([
                'group_tiebreaker_points',
                'group_tiebreaker_two_point_difference',
                'knockout_tiebreaker_points',
                'knockout_tiebreaker_two_point_difference',
            ]);
        });
    }
};
