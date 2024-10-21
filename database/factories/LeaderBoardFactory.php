<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LeaderBoard>
 */
class LeaderBoardFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            "winner_name" => fake()->name(),
            "winner_id" => fake()->id(),
            "score" => fake()->numberBetween(0, 100),
        ];
    }
}
