<?php

namespace App\Http\Controllers;

use App\Events\EndGame;
use App\Events\InitiateGame;
use App\Http\Resources\GameResource;
use App\Http\Resources\LeaderBoardResource;
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
        $user = Auth::user();
        $leaderboard = LeaderBoard::orderBy('score', 'desc')->get();
        return Inertia::render("Leaderboard", [
            "user"=> new UserResource($user),
            "leaderboard"=> LeaderBoardResource::collection($leaderboard)
        ]);
    }

    public function initiateGame(Request $request)
    {
        broadcast(new InitiateGame($request->gameId, $request->peerId, $request->player))->toOthers();
        return response()->json(['status' => 'success', 'message'=> 'Game initiation request sent']);
    }

    public function endGame(Request $request)
    {
        $game = Game::find($request->gameId);
        if ($game) {
            $game->delete();
        }
        broadcast(new EndGame($request->gameId))->toOthers();
        return response()->json(['status'=> 'success', 'message'=> 'Game ending request sent']);
    }

    public function score(Request $request)
    {
        $user = $request->user();
        $winner = LeaderBoard::where('winner_id', $user->id)->first();
        if ($winner) {
            $score = $winner->score + $request->score;
            $winner->update(['score' => $score]);
        } else {
            LeaderBoard::create([
                'winner_name' => $user->name,
                'winner_id' => $user->id,
                'score' => $request->score
            ]);
        }
        return response()->json(['status'=> 'success','message'=> 'Score was updated']);
    }
}
