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
});

require __DIR__.'/auth.php';
