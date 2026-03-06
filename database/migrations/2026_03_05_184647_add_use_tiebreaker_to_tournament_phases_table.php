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
        Schema::table('tournament_phases', function (Blueprint $table) {
            $table->boolean('use_tiebreaker')->default(true)->after('games_target');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tournament_phases', function (Blueprint $table) {
            $table->dropColumn('use_tiebreaker');
        });
    }
};
