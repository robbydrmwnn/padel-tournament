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
            $table->foreignId('side1_player1_id')
                ->nullable()
                ->constrained('participants')
                ->nullOnDelete()
                ->after('team2_template');
            $table->foreignId('side1_player2_id')
                ->nullable()
                ->constrained('participants')
                ->nullOnDelete()
                ->after('side1_player1_id');
            $table->foreignId('side2_player1_id')
                ->nullable()
                ->constrained('participants')
                ->nullOnDelete()
                ->after('side1_player2_id');
            $table->foreignId('side2_player2_id')
                ->nullable()
                ->constrained('participants')
                ->nullOnDelete()
                ->after('side2_player1_id');

            $table->unsignedTinyInteger('winner_side')
                ->nullable()
                ->after('winner_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->dropConstrainedForeignId('side1_player1_id');
            $table->dropConstrainedForeignId('side1_player2_id');
            $table->dropConstrainedForeignId('side2_player1_id');
            $table->dropConstrainedForeignId('side2_player2_id');
            $table->dropColumn('winner_side');
        });
    }
};

