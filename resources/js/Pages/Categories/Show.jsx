import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ event, category }) {
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
                                    Groups
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

                    {/* Category Details Card */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-primary mb-6">
                        <h3 className="text-2xl font-bold font-raverist text-primary mb-6">Category Details</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-neutral-100 rounded-xl p-4">
                                <dt className="text-sm font-gotham font-bold text-neutral-600 mb-2">📝 DESCRIPTION</dt>
                                <dd className="text-base font-gotham text-dark">{category.description || 'No description provided'}</dd>
                            </div>
                            
                            <div className="bg-neutral-100 rounded-xl p-4">
                                <dt className="text-sm font-gotham font-bold text-neutral-600 mb-2">📊 MAX PARTICIPANTS</dt>
                                <dd className="text-base font-gotham text-dark">{category.max_participants || 'Unlimited'}</dd>
                            </div>
                            
                            <div className="bg-success rounded-xl p-4">
                                <dt className="text-sm font-gotham font-bold text-white mb-2">👥 CURRENT PARTICIPANTS</dt>
                                <dd className="text-3xl font-bold font-raverist text-white">{category.participants?.length || 0}</dd>
                            </div>
                            
                            <div className="bg-primary rounded-xl p-4">
                                <dt className="text-sm font-gotham font-bold text-white mb-2">🏆 GROUPS</dt>
                                <dd className="text-3xl font-bold font-raverist text-white">{category.groups?.length || 0}</dd>
                            </div>
                        </div>
                    </div>

                    {/* Groups Section */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-success mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold font-raverist text-success">Groups</h3>
                            <Link
                                href={route('categories.groups.index', category.id)}
                                className="inline-flex items-center gap-2 text-success hover:text-success-700 font-gotham font-bold transition-colors"
                            >
                                Manage Groups →
                            </Link>
                        </div>
                        
                        {category.groups && category.groups.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {category.groups.map((group) => (
                                    <div
                                        key={group.id}
                                        className="bg-neutral-100 rounded-xl p-6 border-2 border-success hover:bg-success hover:text-white transition-all group"
                                    >
                                        <h4 className="text-xl font-bold font-raverist text-success group-hover:text-white mb-2">{group.name}</h4>
                                        <p className="text-sm font-gotham text-neutral-700 group-hover:text-white">
                                            {group.participants?.length || 0} participants
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-neutral-100 rounded-xl">
                                <div className="text-6xl mb-4">🏆</div>
                                <p className="text-lg font-gotham text-neutral-600">No groups created yet</p>
                            </div>
                        )}
                    </div>

                    {/* Participants Section */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-primary">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold font-raverist text-primary">Participants</h3>
                            <Link
                                href={route('categories.participants.index', category.id)}
                                className="inline-flex items-center gap-2 text-primary hover:text-primary-700 font-gotham font-bold transition-colors"
                            >
                                Manage Participants →
                            </Link>
                        </div>
                        
                        {category.participants && category.participants.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {category.participants.slice(0, 8).map((participant) => (
                                    <div
                                        key={participant.id}
                                        className="bg-neutral-100 rounded-xl p-4 text-center border-2 border-primary hover:bg-primary hover:text-white transition-all group"
                                    >
                                        <div className="text-4xl mb-2">👤</div>
                                        <p className="text-base font-gotham font-bold text-primary group-hover:text-white">{participant.name}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-neutral-100 rounded-xl">
                                <div className="text-6xl mb-4">👥</div>
                                <p className="text-lg font-gotham text-neutral-600">No participants added yet</p>
                            </div>
                        )}
                        
                        {category.participants && category.participants.length > 8 && (
                            <div className="text-center mt-6">
                                <Link
                                    href={route('categories.participants.index', category.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-gotham font-bold text-white shadow-lg hover:bg-primary-600 transition-all border-2 border-dark"
                                >
                                    View All {category.participants.length} Participants →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
