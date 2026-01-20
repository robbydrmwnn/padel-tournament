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
        // SQLite doesn't support modifying enums, so we'll just add a comment
        // The validation will be handled at the application level
        // For MySQL/PostgreSQL, you would use ALTER TABLE
        
        // No schema change needed - Laravel/Eloquent will handle the new status value
        // Just ensure the model validation includes 'upcoming'
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Nothing to reverse
    }
};
