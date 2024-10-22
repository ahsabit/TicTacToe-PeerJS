<?php

namespace App\Http\Controllers;

use App\Events\EndGame;
use App\Events\InitiateGame;
use App\Http\Resources\GameResource;
use App\Http\Resources\UserResource;
use App\Models\Game;
use App\Models\LeaderBoard;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GameContoller extends Controller
{
    public function index()
    {
        $user = Auth::user();
        return Inertia::render("Dashboard",[
            "user" => new UserResource($user)
        ]);
    }

    public function playground()
    {
        // Get the current authenticated user
        $user = Auth::user();
        $game = null;
        $isNew = false;
    
        // Find if the user already has a game or needs to join one
        $usersGame = Game::where('player_one', $user->id)->first();
        $playedGame = Game::where('player_two', $user->id)->first();
        $needsPlayer = Game::whereNull('player_two')->first();
    
        // If the user is already in a game, retrieve it, otherwise look for a game to join
        if ($usersGame || $playedGame) {
            $game = $usersGame ?? $playedGame;  // Assign the first non-null game
        } else {
            if ($needsPlayer) {
                // Join the first available game needing a second player
                $needsPlayer->update(['player_two' => $user->id]);
                $game = $needsPlayer;
            } else {
                // Create a new game if no game needs a second player
                $newGame = Game::create([
                    'level' => 1,
                    'player_one' => $user->id,
                ]);
                $game = $newGame;
                $isNew = true;
            }
        }
    
        // Render the Inertia Playground component with user, game, and isNew data
        return Inertia::render("Playground", [
            "user" => new UserResource($user),
            "game" => new GameResource($game),
            "isNew" => $isNew
        ]);
    }

    public function leaderboard()
    {
        $leaderboard = LeaderBoard::all();
        return Inertia::render("Leaderboard", [
            "leaderboard"=> $leaderboard
        ]);
    }

    public function initiateGame(Request $request)
    {
        broadcast(new InitiateGame($request->gameId, $request->peerId))->toOthers();
        return response()->json(['status' => 'success', 'message'=> 'Game initiation request sent']);
    }

    public function endGame(Request $request)
    {
        broadcast(new EndGame($request->gameId, $request->peerId))->toOthers();
        return response()->json(['status'=> 'success', 'message'=> 'Game ending request sent']);
    }
}
