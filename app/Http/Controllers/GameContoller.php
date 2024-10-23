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
        $user = Auth::user();
        $game = null;
        $isNew = false;
        $usersGame = Game::where('player_one', $user->id)->first();
        $playedGame = Game::where('player_two', $user->id)->first();
        $needsPlayer = Game::whereNull('player_two')->first();
        if ($usersGame || $playedGame) {
            $game = $usersGame ?? $playedGame;
        } else {
            if ($needsPlayer) {
                $needsPlayer->update(['player_two' => $user->id]);
                $game = $needsPlayer;
            } else {
                $newGame = Game::create([
                    'level' => 1,
                    'player_one' => $user->id,
                ]);
                $game = $newGame;
                $isNew = true;
            }
        }
        return Inertia::render("Playground", [
            "user" => new UserResource($user),
            "game" => new GameResource($game),
            "isNew" => $isNew,
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
        broadcast(new InitiateGame($request->gameId, $request->peerId, $request->player))->toOthers();
        return response()->json(['status' => 'success', 'message'=> 'Game initiation request sent']);
    }

    public function endGame(Request $request)
    {
        broadcast(new EndGame($request->gameId, $request->peerId))->toOthers();
        return response()->json(['status'=> 'success', 'message'=> 'Game ending request sent']);
    }
}
