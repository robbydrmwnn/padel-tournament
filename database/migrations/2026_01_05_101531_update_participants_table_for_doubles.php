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
        Schema::table('participants', function (Blueprint $table) {
            $table->string('name')->nullable()->change();
            $table->string('player_1')->after('category_id')->default('');
            $table->string('player_2')->after('player_1')->default('');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('participants', function (Blueprint $table) {
            $table->string('name')->nullable(false)->change();
            $table->dropColumn(['player_1', 'player_2']);
        });
    }
};
