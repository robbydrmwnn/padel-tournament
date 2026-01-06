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
        Schema::create('matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->foreignId('group_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('team1_id')->constrained('participants')->onDelete('cascade');
            $table->foreignId('team2_id')->constrained('participants')->onDelete('cascade');
            $table->foreignId('court_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('phase', ['group', 'knockout'])->default('group');
            $table->integer('round')->nullable(); // For knockout: 1=final, 2=semi, 3=quarter, etc
            $table->dateTime('scheduled_time')->nullable();
            $table->integer('team1_score')->nullable();
            $table->integer('team2_score')->nullable();
            $table->foreignId('winner_id')->nullable()->constrained('participants')->onDelete('set null');
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
