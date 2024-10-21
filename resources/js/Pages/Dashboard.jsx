// user will come and click on the button to start a game (random matchmaking);
// then they will be redirected to playground

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

export default function Dashboard({ user }) {
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
                <h1 className="font-bold text-xl mt-20 mb-4">Hello {user.data.name}, let's start playing</h1>
                <Link href={route('game.playground')} className="py-3 px-6 bg-black text-white font-semibold rounded">Start</Link>
            </div>
        </AuthenticatedLayout>
    );
};