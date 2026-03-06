import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Users, Trophy, BarChart2, Swords, Pencil, Plus, CheckCircle, ChevronRight, Settings } from 'lucide-react';

export default function Show({ event, category }) {
    const totalGroups = category.phases?.reduce((sum, phase) => sum + (phase.groups?.length || 0), 0) || 0;
    const totalMatches = category.phases?.reduce((sum, phase) => sum + (phase.matches?.length || 0), 0) || 0;
    const completedMatches = category.phases?.reduce((sum, phase) =>
        sum + (phase.matches?.filter(m => m.status === 'completed').length || 0), 0
    ) || 0;

    return (
        <AuthenticatedLayout header={category.name}>
            <Head title={category.name} />

            <div className="py-12 bg-neutral-100 min-h-screen">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 text-sm font-ffdin text-zinc-500 mb-6">
                        <Link href={route('events.index')} className="hover:text-black transition-colors">Events</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <Link href={route('events.show', event.id)} className="hover:text-black transition-colors">{event.name}</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-black font-bold">{category.name}</span>
                    </nav>

                    {/* Header Banner */}
                    <div className="bg-black rounded-2xl p-8 mb-8 shadow-lg border border-zinc-700">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div>
                                <h1 className="text-4xl font-bold font-ffdin text-white mb-2">{category.name}</h1>
                                <p className="text-xl font-ffdin text-zinc-400">{event.name}</p>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <Link
                                    href={route('categories.participants.index', category.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-5 py-3 text-sm font-ffdin font-bold text-white shadow-lg hover:bg-zinc-700 transition-all border border-zinc-600"
                                >
                                    <Users className="h-4 w-4" />
                                    Participants
                                </Link>
                                <Link
                                    href={route('categories.groups.index', category.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-700 px-5 py-3 text-sm font-ffdin font-bold text-white shadow-lg hover:bg-zinc-600 transition-all"
                                >
                                    <Trophy className="h-4 w-4" />
                                    Groups & Phases
                                </Link>
                                <Link
                                    href={route('categories.matches.index', category.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-ffdin font-bold text-black shadow-lg hover:bg-accent-400 transition-all"
                                >
                                    <Swords className="h-4 w-4" />
                                    Matches
                                </Link>
                                <Link
                                    href={route('events.categories.leaderboard', [event.id, category.id])}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-ffdin font-bold text-black shadow-lg hover:bg-zinc-100 transition-all border border-zinc-300"
                                >
                                    <BarChart2 className="h-4 w-4" />
                                    Leaderboard
                                </Link>
                                <Link
                                    href={route('events.categories.edit', [event.id, category.id])}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-ffdin font-bold text-black shadow-lg hover:bg-zinc-100 transition-all border border-zinc-300"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Category Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-zinc-200">
                            <dt className="flex items-center gap-1.5 text-xs font-ffdin font-bold text-zinc-500 mb-2 uppercase tracking-wider">
                                <Users className="h-3.5 w-3.5" /> Participants
                            </dt>
                            <dd className="text-4xl font-bold font-ffdin text-black">{category.participants?.length || 0}</dd>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-zinc-200">
                            <dt className="flex items-center gap-1.5 text-xs font-ffdin font-bold text-zinc-500 mb-2 uppercase tracking-wider">
                                <Trophy className="h-3.5 w-3.5" /> Phases
                            </dt>
                            <dd className="text-4xl font-bold font-ffdin text-black">{category.phases?.length || 0}</dd>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-zinc-200">
                            <dt className="flex items-center gap-1.5 text-xs font-ffdin font-bold text-zinc-500 mb-2 uppercase tracking-wider">
                                <BarChart2 className="h-3.5 w-3.5" /> Groups
                            </dt>
                            <dd className="text-4xl font-bold font-ffdin text-black">{totalGroups}</dd>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-zinc-200">
                            <dt className="flex items-center gap-1.5 text-xs font-ffdin font-bold text-zinc-500 mb-2 uppercase tracking-wider">
                                <Swords className="h-3.5 w-3.5" /> Matches
                            </dt>
                            <dd className="text-4xl font-bold font-ffdin text-black">{completedMatches}/{totalMatches}</dd>
                        </div>
                    </div>

                    {/* Tournament Structure */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-zinc-200 mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold font-ffdin text-black">Tournament Structure</h3>
                            <Link
                                href={route('events.categories.edit', [event.id, category.id])}
                                className="inline-flex items-center gap-1 text-zinc-500 hover:text-black font-ffdin font-bold transition-colors text-sm"
                            >
                                Configure Phases <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {category.phases && category.phases.length > 0 ? (
                            <div className="space-y-4">
                                {category.phases.map((phase, index) => (
                                    <div
                                        key={phase.id}
                                        className={`rounded-xl p-6 border transition-all ${
                                            phase.is_completed
                                                ? 'bg-zinc-50 border-zinc-200'
                                                : 'bg-white border-zinc-300'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between flex-wrap gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    {phase.type === 'group'
                                                        ? <Trophy className="h-6 w-6 text-zinc-400" />
                                                        : <Swords className="h-6 w-6 text-zinc-400" />
                                                    }
                                                    <div>
                                                        <h4 className="text-xl font-bold font-ffdin text-black flex items-center gap-2">
                                                            {index + 1}. {phase.name}
                                                            {phase.is_completed && (
                                                                <span className="inline-flex items-center gap-1 text-xs bg-zinc-200 text-zinc-700 px-3 py-1 rounded-full">
                                                                    <CheckCircle className="h-3 w-3" /> Completed
                                                                </span>
                                                            )}
                                                            {!phase.is_completed && index === 0 && (
                                                                <span className="text-xs bg-accent text-black px-3 py-1 rounded-full font-bold">Current</span>
                                                            )}
                                                            {phase.is_final_phase && (
                                                                <span className="text-xs bg-black text-white px-3 py-1 rounded-full">Final</span>
                                                            )}
                                                        </h4>
                                                        <p className="text-sm font-ffdin text-zinc-500">
                                                            {phase.type === 'group' ? 'Group Stage' : 'Knockout Stage'} •
                                                            First to {phase.games_target} games •
                                                            {phase.scoring_type === 'no_ad' ? 'No-Advantage' :
                                                             phase.scoring_type === 'traditional' ? 'Unlimited Advantage' :
                                                             `Limited Advantage (${phase.advantage_limit})`}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {phase.type === 'group' && (
                                                        <>
                                                            <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                                                                <p className="text-xs font-ffdin font-bold text-zinc-500">Groups</p>
                                                                <p className="text-2xl font-bold font-ffdin text-black">{phase.groups?.length || 0}</p>
                                                            </div>
                                                            <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                                                                <p className="text-xs font-ffdin font-bold text-zinc-500">Teams Advance</p>
                                                                <p className="text-2xl font-bold font-ffdin text-black">Top {phase.teams_advance_per_group}</p>
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                                                        <p className="text-xs font-ffdin font-bold text-zinc-500">Matches</p>
                                                        <p className="text-2xl font-bold font-ffdin text-black">{phase.matches?.length || 0}</p>
                                                    </div>
                                                    <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                                                        <p className="text-xs font-ffdin font-bold text-zinc-500">Completed</p>
                                                        <p className="text-2xl font-bold font-ffdin text-black">
                                                            {phase.matches?.filter(m => m.status === 'completed').length || 0}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Link
                                                    href={route('categories.groups.index', category.id)}
                                                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-ffdin font-bold text-black bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-all border border-zinc-300"
                                                >
                                                    <BarChart2 className="h-3.5 w-3.5" /> Groups
                                                </Link>
                                                <Link
                                                    href={route('categories.matches.index', category.id)}
                                                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-ffdin font-bold text-white bg-black rounded-lg hover:bg-zinc-800 transition-all"
                                                >
                                                    <Swords className="h-3.5 w-3.5" /> Matches
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-zinc-50 rounded-xl border border-zinc-100">
                                <Trophy className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
                                <p className="text-lg font-ffdin text-zinc-500 mb-4">No tournament phases configured yet</p>
                                <Link
                                    href={route('events.categories.edit', [event.id, category.id])}
                                    className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-ffdin font-bold text-white shadow-lg hover:bg-zinc-800 transition-all"
                                >
                                    <Settings className="h-4 w-4" />
                                    Configure Tournament
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* Participants Preview */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-zinc-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold font-ffdin text-black">Participants</h3>
                                <Link
                                    href={route('categories.participants.index', category.id)}
                                    className="inline-flex items-center gap-1 text-zinc-500 hover:text-black font-ffdin font-bold transition-colors text-sm"
                                >
                                    View All <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>

                            {category.participants && category.participants.length > 0 ? (
                                <>
                                    <div className="space-y-2 mb-4">
                                        {category.participants.slice(0, 5).map((participant) => (
                                            <div
                                                key={participant.id}
                                                className="bg-zinc-50 rounded-lg p-3 flex items-center gap-3 border border-zinc-100"
                                            >
                                                <Users className="h-5 w-5 flex-shrink-0 text-zinc-400" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-ffdin font-bold text-black">
                                                        {participant.player_1} / {participant.player_2}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {category.participants.length > 5 && (
                                        <p className="text-sm font-ffdin text-zinc-500 text-center">
                                            and {category.participants.length - 5} more...
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8 bg-zinc-50 rounded-xl border border-zinc-100">
                                    <Users className="h-10 w-10 mx-auto mb-3 text-zinc-300" />
                                    <p className="text-sm font-ffdin text-zinc-500 mb-4">No participants yet</p>
                                    <Link
                                        href={route('categories.participants.create', category.id)}
                                        className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-ffdin font-bold text-white hover:bg-zinc-800 transition-all"
                                    >
                                        <Plus className="h-4 w-4" /> Add Participants
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-zinc-200">
                            <h3 className="text-2xl font-bold font-ffdin text-black mb-6">Tournament Progress</h3>

                            <div className="space-y-4">
                                {totalMatches > 0 && (
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-ffdin font-bold text-zinc-500">Match Completion</span>
                                            <span className="text-sm font-ffdin font-bold text-black">
                                                {Math.round((completedMatches / totalMatches) * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-zinc-200 rounded-full h-2">
                                            <div
                                                className="bg-black rounded-full h-2 transition-all"
                                                style={{ width: `${(completedMatches / totalMatches) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200">
                                        <p className="text-xs font-ffdin font-bold text-zinc-500 mb-1">Completed</p>
                                        <p className="text-3xl font-bold font-ffdin text-black">{completedMatches}</p>
                                    </div>
                                    <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200">
                                        <p className="text-xs font-ffdin font-bold text-zinc-500 mb-1">Remaining</p>
                                        <p className="text-3xl font-bold font-ffdin text-black">{totalMatches - completedMatches}</p>
                                    </div>
                                </div>

                                {category.phases && category.phases.length > 0 && (
                                    <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200">
                                        <p className="text-xs font-ffdin font-bold text-zinc-500 mb-2">Current Phase</p>
                                        <p className="text-lg font-bold font-ffdin text-black">
                                            {category.phases.find(p => !p.is_completed)?.name || category.phases[category.phases.length - 1]?.name || 'Not Started'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
