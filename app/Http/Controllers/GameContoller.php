<?php

namespace App\Http\Controllers;

use App\Events\EndGame;
use App\Events\InitiateGame;
use App\Http\Resources\GameResource;
use App\Http\Resources\UserClientResource;
use App\Models\Game;
use App\Models\LeaderBoard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GameContoller extends Controller
{
    public function index()
    {
        $user = Auth::user();
        return Inertia::render("Dashboard",[
            "user" => new UserClientResource($user)
        ]);
    }

    public function playground()
    {
        //first see if any game needs one player.
        $user = Auth::user();
        $game = null;
        $isNew = false;

        $usersGame = Game::where('player_one', $user->id)->get();
        $playedGame = Game::where('player_two', $user->id)->get();
        $needsPlayer = Game::whereNull('player_two')->get();
        //if the there is any available game going on then join that
        if ($usersGame->count() > 0 || $playedGame->count() > 0) {
            $game = $usersGame->count() > 0 ? $usersGame[0] : $playedGame[0];
        }else{
            if ($needsPlayer->count() > 0) {
                // join $needPlayer[0]
                $needsPlayer[0]->update(['player_two' => $user->id]);
                $game = $needsPlayer[0];
            }else{
                $newGame = Game::create([
                            'level' => 1,
                            'player_one' => $user->id,
                        ]);
                $game = $newGame;
                $isNew = true;
            }
        }
        //else create a new game
        return Inertia::render("Playground", [
            "user" => new UserClientResource($user),
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
