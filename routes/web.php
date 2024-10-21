<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\GameContoller;

Route::middleware('auth')->group(function () {
    Route::get('/', [GameContoller::class,'index'])->name('dashboard');
    Route::get('/playground', [GameContoller::class,'playground'])->name('game.playground');
    Route::get('/leaderboard', [GameContoller::class,'leaderboard'])->name('game.leaderboard');
    Route::post('/start', [GameContoller::class,'initiateGame'])->name('game.start');
    Route::post('/stop', [GameContoller::class,'endGame'])->name('game.stop');
    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
