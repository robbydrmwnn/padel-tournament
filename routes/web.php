<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ParticipantController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\CourtController;
use App\Http\Controllers\MatchController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Public score monitor per court (no authentication required)
Route::get('courts/{court}/monitor', [MatchController::class, 'courtMonitor'])
    ->name('courts.monitor');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Events resource routes
    Route::resource('events', EventController::class);
    
    // Courts management
    Route::get('events/{event}/courts', [CourtController::class, 'index'])
        ->name('events.courts.index');
    Route::post('events/{event}/courts/setup', [CourtController::class, 'setup'])
        ->name('events.courts.setup');
    Route::patch('events/{event}/courts/{court}', [CourtController::class, 'update'])
        ->name('events.courts.update');
    Route::delete('events/{event}/courts/{court}', [CourtController::class, 'destroy'])
        ->name('events.courts.destroy');
    
    // Categories nested under events
    Route::resource('events.categories', CategoryController::class)
        ->except(['index', 'show']);
    Route::get('events/{event}/categories', [CategoryController::class, 'index'])
        ->name('events.categories.index');
    Route::get('events/{event}/categories/{category}', [CategoryController::class, 'show'])
        ->name('events.categories.show');
    
    // Participants nested under categories
    // Custom routes must come BEFORE resource routes to avoid conflicts
    Route::get('categories/{category}/participants/template', [ParticipantController::class, 'downloadTemplate'])
        ->name('categories.participants.template');
    Route::post('categories/{category}/participants/import', [ParticipantController::class, 'import'])
        ->name('categories.participants.import');
    Route::resource('categories.participants', ParticipantController::class);
    
    // Groups management
    Route::get('categories/{category}/groups', [GroupController::class, 'index'])
        ->name('categories.groups.index');
    Route::post('categories/{category}/groups/setup', [GroupController::class, 'setup'])
        ->name('categories.groups.setup');
    Route::post('categories/{category}/groups/{group}/assign', [GroupController::class, 'assignParticipant'])
        ->name('categories.groups.assign');
    Route::delete('categories/{category}/groups/{group}/participants/{participant}', [GroupController::class, 'removeParticipant'])
        ->name('categories.groups.remove-participant');
    Route::patch('categories/{category}/groups/{group}', [GroupController::class, 'update'])
        ->name('categories.groups.update');
    Route::delete('categories/{category}/groups/{group}', [GroupController::class, 'destroy'])
        ->name('categories.groups.destroy');
    
    // Matches management
    Route::get('categories/{category}/matches', [MatchController::class, 'index'])
        ->name('categories.matches.index');
    Route::post('categories/{category}/matches/generate', [MatchController::class, 'generate'])
        ->name('categories.matches.generate');
    Route::patch('categories/{category}/matches/{match}', [MatchController::class, 'update'])
        ->name('categories.matches.update');
    Route::delete('categories/{category}/matches/{match}', [MatchController::class, 'destroy'])
        ->name('categories.matches.destroy');
    
    // Match control - Referee
    Route::get('categories/{category}/matches/{match}/referee', [MatchController::class, 'referee'])
        ->name('categories.matches.referee');
    
    // Match preparation (reserve court and mark as upcoming)
    Route::post('categories/{category}/matches/{match}/start-prep', [MatchController::class, 'startPrep'])
        ->name('categories.matches.startPrep');
    
    // Warm-up control
    Route::post('categories/{category}/matches/{match}/warmup/start', [MatchController::class, 'warmupStart'])
        ->name('categories.matches.warmup.start');
    Route::post('categories/{category}/matches/{match}/warmup/reset', [MatchController::class, 'warmupReset'])
        ->name('categories.matches.warmup.reset');
    Route::post('categories/{category}/matches/{match}/warmup/skip', [MatchController::class, 'warmupSkip'])
        ->name('categories.matches.warmup.skip');
    Route::post('categories/{category}/matches/{match}/warmup/end', [MatchController::class, 'warmupEnd'])
        ->name('categories.matches.warmup.end');
    
    // Match scoring
    Route::post('categories/{category}/matches/{match}/start', [MatchController::class, 'startMatch'])
        ->name('categories.matches.start');
    Route::post('categories/{category}/matches/{match}/score', [MatchController::class, 'scorePoint'])
        ->name('categories.matches.score');
    Route::post('categories/{category}/matches/{match}/undo', [MatchController::class, 'undoPoint'])
        ->name('categories.matches.undo');
    Route::post('categories/{category}/matches/{match}/reset', [MatchController::class, 'resetMatch'])
        ->name('categories.matches.reset');
});

require __DIR__.'/auth.php';
