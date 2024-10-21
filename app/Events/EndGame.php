<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EndGame implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    public $gameId;
    public $peerId;

    /**
     * Create a new event instance.
     */
    public function __construct($gameId, $peerId)
    {
        $this->gameId = $gameId;
        $this->peerId = $peerId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('game.' . $this->gameId),
        ];
    }
}
