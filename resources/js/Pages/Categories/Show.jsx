import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ event, category }) {
    const totalGroups = category.phases?.reduce((sum, phase) => sum + (phase.groups?.length || 0), 0) || 0;
    const totalMatches = category.phases?.reduce((sum, phase) => sum + (phase.matches?.length || 0), 0) || 0;
    const completedMatches = category.phases?.reduce((sum, phase) => 
        sum + (phase.matches?.filter(m => m.status === 'completed').length || 0), 0
    ) || 0;

    return (
        <AuthenticatedLayout header={category.name}>
            <Head title={category.name} />

            <div className="py-12 bg-dark min-h-screen">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="text-sm font-gotham text-neutral-400 mb-6">
                        <Link href={route('events.index')} className="hover:text-white transition-colors">Events</Link>
                        {' / '}
                        <Link href={route('events.show', event.id)} className="hover:text-white transition-colors">{event.name}</Link>
                        {' / '}
                        <span className="text-white font-bold">{category.name}</span>
                    </nav>

                    {/* Header Banner */}
                    <div className="bg-success rounded-2xl p-8 mb-8 shadow-lg border-4 border-accent">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div>
                                <h1 className="text-4xl font-bold font-raverist text-white mb-2">{category.name}</h1>
                                <p className="text-xl font-gotham text-neutral-200">{event.name}</p>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <Link
                                    href={route('categories.participants.index', category.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-gotham font-bold text-primary shadow-lg hover:bg-neutral-100 transition-all border-2 border-accent"
                                >
                                    <span className="text-xl">👥</span>
                                    Participants
                                </Link>
                                <Link
                                    href={route('categories.groups.index', category.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-gotham font-bold text-white shadow-lg hover:bg-primary-600 transition-all border-2 border-dark"
                                >
                                    <span className="text-xl">🏆</span>
                                    Groups & Phases
                                </Link>
                                <Link
                                    href={route('categories.matches.index', category.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-gotham font-bold text-dark shadow-lg hover:bg-accent-700 transition-all border-2 border-dark"
                                >
                                    <span className="text-xl">🎾</span>
                                    Matches
                                </Link>
                                <Link
                                    href={route('events.categories.leaderboard', [event.id, category.id])}
                                    className="inline-flex items-center gap-2 rounded-xl bg-success px-5 py-3 text-sm font-gotham font-bold text-white shadow-lg hover:bg-success-700 transition-all border-2 border-dark"
                                >
                                    <span className="text-xl">📊</span>
                                    Leaderboard
                                </Link>
                                <Link
                                    href={route('events.categories.edit', [event.id, category.id])}
                                    className="inline-flex items-center gap-2 rounded-xl bg-neutral-800 px-5 py-3 text-sm font-gotham font-bold text-white shadow-lg hover:bg-neutral-700 transition-all border-2 border-neutral-600"
                                >
                                    <span className="text-xl">✏️</span>
                                    Edit
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Category Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border-4 border-primary">
                            <dt className="text-sm font-gotham font-bold text-neutral-600 mb-2">👥 PARTICIPANTS</dt>
                            <dd className="text-4xl font-bold font-raverist text-primary">{category.participants?.length || 0}</dd>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-6 shadow-lg border-4 border-success">
                            <dt className="text-sm font-gotham font-bold text-neutral-600 mb-2">🏆 PHASES</dt>
                            <dd className="text-4xl font-bold font-raverist text-success">{category.phases?.length || 0}</dd>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-6 shadow-lg border-4 border-accent">
                            <dt className="text-sm font-gotham font-bold text-neutral-600 mb-2">📊 GROUPS</dt>
                            <dd className="text-4xl font-bold font-raverist text-dark">{totalGroups}</dd>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-6 shadow-lg border-4 border-primary">
                            <dt className="text-sm font-gotham font-bold text-neutral-600 mb-2">🎾 MATCHES</dt>
                            <dd className="text-4xl font-bold font-raverist text-primary">{completedMatches}/{totalMatches}</dd>
                        </div>
                    </div>

                    {/* Tournament Structure */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-success mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold font-raverist text-success">Tournament Structure</h3>
                            <Link
                                href={route('events.categories.edit', [event.id, category.id])}
                                className="inline-flex items-center gap-2 text-success hover:text-success-700 font-gotham font-bold transition-colors"
                            >
                                Configure Phases →
                            </Link>
                        </div>
                        
                        {category.phases && category.phases.length > 0 ? (
                            <div className="space-y-4">
                                {category.phases.map((phase, index) => (
                                    <div
                                        key={phase.id}
                                        className={`rounded-xl p-6 border-2 transition-all ${
                                            phase.is_completed 
                                                ? 'bg-neutral-100 border-neutral-300' 
                                                : 'bg-primary-50 border-primary'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between flex-wrap gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="text-3xl">{phase.type === 'group' ? '🏆' : '⚔️'}</span>
                                                    <div>
                                                        <h4 className="text-xl font-bold font-raverist text-dark flex items-center gap-2">
                                                            {index + 1}. {phase.name}
                                                            {phase.is_completed && (
                                                                <span className="text-xs bg-success text-white px-3 py-1 rounded-full">✓ Completed</span>
                                                            )}
                                                            {!phase.is_completed && index === 0 && (
                                                                <span className="text-xs bg-accent text-dark px-3 py-1 rounded-full">▶ Current</span>
                                                            )}
                                                            {phase.is_final_phase && (
                                                                <span className="text-xs bg-primary text-white px-3 py-1 rounded-full">🏁 Final</span>
                                                            )}
                                                        </h4>
                                                        <p className="text-sm font-gotham text-neutral-600">
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
                                                            <div className="bg-white rounded-lg p-3 border border-neutral-200">
                                                                <p className="text-xs font-gotham font-bold text-neutral-600">Groups</p>
                                                                <p className="text-2xl font-bold font-raverist text-success">{phase.groups?.length || 0}</p>
                                                            </div>
                                                            <div className="bg-white rounded-lg p-3 border border-neutral-200">
                                                                <p className="text-xs font-gotham font-bold text-neutral-600">Teams Advance</p>
                                                                <p className="text-2xl font-bold font-raverist text-primary">Top {phase.teams_advance_per_group}</p>
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="bg-white rounded-lg p-3 border border-neutral-200">
                                                        <p className="text-xs font-gotham font-bold text-neutral-600">Matches</p>
                                                        <p className="text-2xl font-bold font-raverist text-dark">{phase.matches?.length || 0}</p>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-3 border border-neutral-200">
                                                        <p className="text-xs font-gotham font-bold text-neutral-600">Completed</p>
                                                        <p className="text-2xl font-bold font-raverist text-success">
                                                            {phase.matches?.filter(m => m.status === 'completed').length || 0}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <Link
                                                    href={route('categories.groups.index', category.id)}
                                                    className="px-4 py-2 text-sm font-gotham font-bold text-primary bg-primary-100 rounded-lg hover:bg-primary-200 transition-all border border-primary"
                                                >
                                                    📊 Groups
                                                </Link>
                                                <Link
                                                    href={route('categories.matches.index', category.id)}
                                                    className="px-4 py-2 text-sm font-gotham font-bold text-success bg-success-100 rounded-lg hover:bg-success-200 transition-all border border-success"
                                                >
                                                    🎾 Matches
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-neutral-100 rounded-xl">
                                <div className="text-6xl mb-4">🏆</div>
                                <p className="text-lg font-gotham text-neutral-600 mb-4">No tournament phases configured yet</p>
                                <Link
                                    href={route('events.categories.edit', [event.id, category.id])}
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-gotham font-bold text-white shadow-lg hover:bg-primary-600 transition-all border-2 border-dark"
                                >
                                    <span className="text-xl">⚙️</span>
                                    Configure Tournament
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* Participants Preview */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-primary">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold font-raverist text-primary">Participants</h3>
                                <Link
                                    href={route('categories.participants.index', category.id)}
                                    className="inline-flex items-center gap-2 text-primary hover:text-primary-700 font-gotham font-bold transition-colors"
                                >
                                    View All →
                                </Link>
                            </div>
                            
                            {category.participants && category.participants.length > 0 ? (
                                <>
                                    <div className="space-y-2 mb-4">
                                        {category.participants.slice(0, 5).map((participant) => (
                                            <div
                                                key={participant.id}
                                                className="bg-neutral-100 rounded-lg p-3 flex items-center gap-3 border border-neutral-200"
                                            >
                                                <span className="text-2xl">👥</span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-gotham font-bold text-dark">
                                                        {participant.player_1} / {participant.player_2}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {category.participants.length > 5 && (
                                        <p className="text-sm font-gotham text-neutral-600 text-center">
                                            and {category.participants.length - 5} more...
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8 bg-neutral-100 rounded-xl">
                                    <div className="text-5xl mb-3">👥</div>
                                    <p className="text-sm font-gotham text-neutral-600 mb-4">No participants yet</p>
                                    <Link
                                        href={route('categories.participants.create', category.id)}
                                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-gotham font-bold text-white hover:bg-primary-600 transition-all"
                                    >
                                        ➕ Add Participants
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-accent">
                            <h3 className="text-2xl font-bold font-raverist text-dark mb-6">Tournament Progress</h3>
                            
                            <div className="space-y-4">
                                {totalMatches > 0 && (
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-gotham font-bold text-neutral-600">Match Completion</span>
                                            <span className="text-sm font-gotham font-bold text-dark">
                                                {Math.round((completedMatches / totalMatches) * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-neutral-200 rounded-full h-3">
                                            <div 
                                                className="bg-success rounded-full h-3 transition-all"
                                                style={{ width: `${(completedMatches / totalMatches) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-success-100 rounded-lg p-4 border border-success">
                                        <p className="text-xs font-gotham font-bold text-neutral-600 mb-1">Completed</p>
                                        <p className="text-3xl font-bold font-raverist text-success">{completedMatches}</p>
                                    </div>
                                    <div className="bg-accent-100 rounded-lg p-4 border border-accent">
                                        <p className="text-xs font-gotham font-bold text-neutral-600 mb-1">Remaining</p>
                                        <p className="text-3xl font-bold font-raverist text-dark">{totalMatches - completedMatches}</p>
                                    </div>
                                </div>

                                {category.phases && category.phases.length > 0 && (
                                    <div className="bg-primary-100 rounded-lg p-4 border border-primary">
                                        <p className="text-xs font-gotham font-bold text-neutral-600 mb-2">Current Phase</p>
                                        <p className="text-lg font-bold font-raverist text-primary">
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
