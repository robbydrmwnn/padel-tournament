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
        Schema::table('groups', function (Blueprint $table) {
            $table->foreignId('phase_id')->nullable()->after('category_id')->constrained('tournament_phases')->onDelete('cascade');
            $table->index('phase_id');
        });
        
        Schema::table('matches', function (Blueprint $table) {
            $table->foreignId('phase_id')->nullable()->after('category_id')->constrained('tournament_phases')->onDelete('cascade');
            // Keep the old 'phase' column for now (will be 'group' or 'knockout')
            // But phase_id will be the primary reference
            $table->index('phase_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->dropForeign(['phase_id']);
            $table->dropColumn('phase_id');
        });
        
        Schema::table('groups', function (Blueprint $table) {
            $table->dropForeign(['phase_id']);
            $table->dropColumn('phase_id');
        });
    }
};
