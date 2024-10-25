import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function Dashboard({ user, leaderboard }) {
    console.log(leaderboard);
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Tik Tak Toe
                </h2>
            }
        >
            <Head title="Dashboard"/>

            <div className="w-full flex flex-col justify-center items-center">
                <h1 className="font-bold text-xl mt-4 mb-4">Hello {user.data.name}, let's start playing</h1>
                <table className="w-96 shadow-lg border border-gray-300 overflow-hidden">
                    <thead>
                        <tr className="border border-gray-300">
                            <th className="py-2 px-4 text-start">Rank</th>
                            <th className="py-2 px-4 text-start">Player</th>
                            <th className="py-2 px-4 text-start">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.data.map((player, i) => {
                            i++;
                            return (
                                <tr key={player.id}>
                                    <td className="py-2 px-4 text-start">{i}</td>
                                    <td className={player.winner.id == user.data.id ? 'py-2 px-4 text-start underline' : 'py-2 px-4 text-start no-underline'}>{player.winner.name}</td>
                                    <td className='py-2 px-4 text-start'>{player.score}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
};