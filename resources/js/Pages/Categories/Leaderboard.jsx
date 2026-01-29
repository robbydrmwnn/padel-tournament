import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Leaderboard({ event, category, leaderboardData }) {
    return (
        <AuthenticatedLayout header={`${category.name} - Leaderboard`}>
            <Head title={`${category.name} - Leaderboard`} />

            <div className="py-12 bg-dark min-h-screen">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="text-sm font-gotham text-neutral-400 mb-6">
                        <Link href={route('events.index')} className="hover:text-white transition-colors">Events</Link>
                        {' / '}
                        <Link href={route('events.show', event.id)} className="hover:text-white transition-colors">{event.name}</Link>
                        {' / '}
                        <Link href={route('events.categories.show', [event.id, category.id])} className="hover:text-white transition-colors">{category.name}</Link>
                        {' / '}
                        <span className="text-white font-bold">Leaderboard</span>
                    </nav>

                    {/* Header Banner */}
                    <div className="bg-primary rounded-2xl p-8 mb-8 shadow-lg border-4 border-accent">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div>
                                <h1 className="text-4xl font-bold font-raverist text-white mb-2">📊 {category.name} Leaderboard</h1>
                                <p className="text-xl font-gotham text-neutral-200">{event.name}</p>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <Link
                                    href={route('events.categories.show', [event.id, category.id])}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-gotham font-bold text-primary shadow-lg hover:bg-neutral-100 transition-all border-2 border-accent"
                                >
                                    ← Back to Category
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard by Groups */}
                    {leaderboardData.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center shadow-lg border-2 border-neutral-300">
                            <p className="text-2xl font-gotham text-neutral-500">📋 No groups or matches found yet.</p>
                            <p className="text-sm font-gotham text-neutral-400 mt-2">Create groups and complete some matches to see the leaderboard!</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {leaderboardData.map((groupData, index) => (
                                <div key={groupData.group.id} className="bg-white rounded-2xl shadow-lg border-4 border-primary overflow-hidden">
                                    {/* Group Header */}
                                    <div className="bg-primary px-6 py-4 border-b-4 border-accent">
                                        <h2 className="text-2xl font-bold font-raverist text-white">
                                            🏆 Group {groupData.group.name}
                                        </h2>
                                    </div>

                                    {/* Standings Table */}
                                    {groupData.standings.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <p className="text-neutral-500 font-gotham">No participants or completed matches in this group yet.</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-neutral-300">
                                                <thead className="bg-neutral-100">
                                                    <tr>
                                                        <th scope="col" className="py-4 px-6 text-left text-xs font-gotham font-bold text-neutral-700 uppercase tracking-wider">
                                                            Rank
                                                        </th>
                                                        <th scope="col" className="py-4 px-6 text-left text-xs font-gotham font-bold text-neutral-700 uppercase tracking-wider">
                                                            Team
                                                        </th>
                                                        <th scope="col" className="py-4 px-6 text-center text-xs font-gotham font-bold text-neutral-700 uppercase tracking-wider">
                                                            Won
                                                        </th>
                                                        <th scope="col" className="py-4 px-6 text-center text-xs font-gotham font-bold text-neutral-700 uppercase tracking-wider">
                                                            Lost
                                                        </th>
                                                        <th scope="col" className="py-4 px-6 text-center text-xs font-gotham font-bold text-neutral-700 uppercase tracking-wider">
                                                            Games Won
                                                        </th>
                                                        <th scope="col" className="py-4 px-6 text-center text-xs font-gotham font-bold text-neutral-700 uppercase tracking-wider">
                                                            Games Lost
                                                        </th>
                                                        <th scope="col" className="py-4 px-6 text-center text-xs font-gotham font-bold text-neutral-700 uppercase tracking-wider">
                                                            Game Diff
                                                        </th>
                                                        <th scope="col" className="py-4 px-6 text-center text-xs font-gotham font-bold text-neutral-700 uppercase tracking-wider">
                                                            Points
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-neutral-200">
                                                    {groupData.standings.map((standing, standingIndex) => {
                                                        const points = standing.won * 2;
                                                        return (
                                                            <tr 
                                                                key={standing.participant.id}
                                                                className={`${
                                                                    standingIndex === 0 ? 'bg-accent bg-opacity-20' : 
                                                                    standingIndex === 1 ? 'bg-success bg-opacity-10' : 
                                                                    'hover:bg-neutral-50'
                                                                } transition-colors`}
                                                            >
                                                                <td className="py-4 px-6 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <span className={`text-2xl font-bold font-raverist ${
                                                                            standingIndex === 0 ? 'text-accent' : 
                                                                            standingIndex === 1 ? 'text-success' : 
                                                                            standingIndex === 2 ? 'text-primary' : 
                                                                            'text-neutral-600'
                                                                        }`}>
                                                                            {standingIndex === 0 ? '🥇' : standingIndex === 1 ? '🥈' : standingIndex === 2 ? '🥉' : `#${standingIndex + 1}`}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-4 px-6">
                                                                    <div className="text-sm font-gotham font-bold text-dark">
                                                                        {standing.participant.player_1} / {standing.participant.player_2}
                                                                    </div>
                                                                    <div className="text-xs font-gotham text-neutral-500">
                                                                        {standing.participant.name}
                                                                    </div>
                                                                </td>
                                                                <td className="py-4 px-6 text-center">
                                                                    <span className="text-sm font-gotham font-bold text-success">{standing.won}</span>
                                                                </td>
                                                                <td className="py-4 px-6 text-center">
                                                                    <span className="text-sm font-gotham font-bold text-red-600">{standing.lost}</span>
                                                                </td>
                                                                <td className="py-4 px-6 text-center">
                                                                    <span className="text-sm font-gotham font-bold text-primary">{standing.games_won}</span>
                                                                </td>
                                                                <td className="py-4 px-6 text-center">
                                                                    <span className="text-sm font-gotham font-bold text-red-500">{standing.games_lost}</span>
                                                                </td>
                                                                <td className="py-4 px-6 text-center">
                                                                    <span className={`text-sm font-gotham font-bold ${
                                                                        standing.game_diff > 0 ? 'text-success' : 
                                                                        standing.game_diff < 0 ? 'text-red-600' : 
                                                                        'text-neutral-600'
                                                                    }`}>
                                                                        {standing.game_diff > 0 ? '+' : ''}{standing.game_diff}
                                                                    </span>
                                                                </td>
                                                                <td className="py-4 px-6 text-center">
                                                                    <span className="text-lg font-gotham font-bold text-primary">{points}</span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Legend */}
                    <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border-2 border-neutral-300">
                        <h3 className="text-lg font-bold font-raverist text-dark mb-4">📖 Ranking System</h3>
                        <div className="text-sm font-gotham">
                            <p className="text-neutral-700 mb-2"><strong>Points Calculation:</strong> Win × 2</p>
                            <p className="text-neutral-700 mb-2 mt-4"><strong>Ranking Order:</strong></p>
                            <ol className="list-decimal list-inside text-neutral-700 ml-2 space-y-1">
                                <li>Points (highest wins)</li>
                                <li>Game difference (highest wins)</li>
                                <li>Games won (highest wins)</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

