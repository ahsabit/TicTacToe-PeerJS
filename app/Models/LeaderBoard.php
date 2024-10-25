<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaderBoard extends Model
{
    /** @use HasFactory<\Database\Factories\LeaderBoardFactory> */
    use HasFactory;
    protected $fillable = ['winner_name', 'winner_id', 'score'];

    public function winner()
    {
        return $this->belongsTo(User::class, "winner_id");
    }
}
