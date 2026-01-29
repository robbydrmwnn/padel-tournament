import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { formatDate } from '@/Utils/dateFormatter';
import { useState } from 'react';

export default function Show({ event }) {
    const [showRefereeModal, setShowRefereeModal] = useState(false);
    const getStatusColor = (status) => {
        const colors = {
            draft: 'bg-neutral-400 text-white border-neutral-600',
            active: 'bg-success text-white border-success-700',
            completed: 'bg-primary text-white border-primary-700',
            cancelled: 'bg-red-600 text-white border-red-800',
        };
        return colors[status] || 'bg-neutral-400 text-white border-neutral-600';
    };

    const getStatusIcon = (status) => {
        const icons = {
            draft: '📝',
            active: '🔴',
            completed: '✅',
            cancelled: '❌',
        };
        return icons[status] || '📋';
    };

    const handleCourtSelect = (courtId) => {
        router.visit(route('events.courts.matches', [event.id, courtId]));
    };

    return (
        <AuthenticatedLayout header={event.name}>
            <Head title={event.name} />

            <div className="py-12 bg-dark min-h-screen">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-6">
                    {/* Header Banner */}
                    <div className="bg-success rounded-2xl p-8 shadow-lg border-4 border-accent">
                        <div className="flex justify-between items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-3">
                                    <h1 className="text-4xl font-bold font-raverist text-white">{event.name}</h1>
                                    {/* <span className={`px-4 py-2 text-sm font-gotham font-bold rounded-xl border-2 ${getStatusColor(event.status)}`}>
                                        {getStatusIcon(event.status)} {event.status.toUpperCase()}
                                    </span> */}
                                </div>
                                <p className="text-xl font-gotham text-neutral-200">{event.description || 'Tournament Event'}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRefereeModal(true)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-gotham font-bold text-dark shadow-lg hover:bg-accent-600 transition-all border-2 border-dark"
                                >
                                    <span className="text-xl">👨‍⚖️</span>
                                    Referee
                                </button>
                                <Link
                                    href={route('events.courts.index', event.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-gotham font-bold text-white shadow-lg hover:bg-primary-600 transition-all border-2 border-neutral-600"
                                >
                                    <span className="text-xl">🏟️</span>
                                    Courts
                                </Link>
                                <Link
                                    href={route('events.categories.index', event.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-gotham font-bold text-primary shadow-lg hover:bg-neutral-600 transition-all border-2 border-accent"
                                >
                                    <span className="text-xl">📋</span>
                                    Categories
                                </Link>
                                <Link
                                    href={route('events.edit', event.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-neutral-800 px-5 py-3 text-sm font-gotham font-bold text-white shadow-lg hover:bg-neutral-700 transition-all border-2 border-neutral-600"
                                >
                                    <span className="text-xl">✏️</span>
                                    Edit
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Event Details Card */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-primary">
                        <h3 className="text-2xl font-bold font-raverist text-primary mb-6">Event Details</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-neutral-100 rounded-xl p-4">
                                <dt className="text-sm font-gotham font-bold text-neutral-600 mb-2">📅 START DATE</dt>
                                <dd className="text-lg font-gotham text-dark">{formatDate(event.start_date)}</dd>
                            </div>
                            
                            <div className="bg-neutral-100 rounded-xl p-4">
                                <dt className="text-sm font-gotham font-bold text-neutral-600 mb-2">📅 END DATE</dt>
                                <dd className="text-lg font-gotham text-dark">{formatDate(event.end_date)}</dd>
                            </div>
                            
                            <div className="bg-neutral-100 rounded-xl p-4">
                                <dt className="text-sm font-gotham font-bold text-neutral-600 mb-2">📍 LOCATION</dt>
                                <dd className="text-lg font-gotham text-dark">{event.location || 'Not specified'}</dd>
                            </div>
                            
                            <div className="bg-neutral-100 rounded-xl p-4">
                                <dt className="text-sm font-gotham font-bold text-neutral-600 mb-2">📊 STATUS</dt>
                                <dd className="text-lg font-gotham text-dark">{event.status.charAt(0).toUpperCase() + event.status.slice(1)}</dd>
                            </div>
                        </div>
                    </div>

                    {/* Categories Section */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-success">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold font-raverist text-success">Categories</h3>
                            <Link
                                href={route('events.categories.create', event.id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-success px-5 py-3 text-sm font-gotham font-bold text-white shadow-lg hover:bg-success-600 transition-all border-2 border-accent"
                            >
                                <span className="text-xl">➕</span>
                                Add Category
                            </Link>
                        </div>
                        
                        {event.categories && event.categories.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {event.categories.map((category) => (
                                    <Link
                                        key={category.id}
                                        href={route('events.categories.show', [event.id, category.id])}
                                        className="bg-neutral-100 rounded-xl p-4 hover:bg-success hover:text-white transition-all border-2 border-neutral-300 hover:border-success group"
                                    >
                                        <h4 className="text-lg font-bold font-raverist text-success group-hover:text-white mb-2">{category.name}</h4>
                                        <div className="space-y-1">
                                            <p className="text-sm font-gotham text-neutral-700 group-hover:text-white">
                                                👥 {category.participants_count || 0} participants
                                            </p>
                                            <p className="text-sm font-gotham text-neutral-700 group-hover:text-white">
                                                📊 {category.groups_count || 0} groups
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-neutral-100 rounded-xl">
                                <div className="text-6xl mb-4">📋</div>
                                <p className="text-lg font-gotham text-neutral-600">No categories yet. Create your first category!</p>
                            </div>
                        )}
                    </div>

                    {/* Courts Section */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-accent">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold font-raverist text-accent-900">Courts</h3>
                            <Link
                                href={route('events.courts.index', event.id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-gotham font-bold text-white shadow-lg hover:bg-primary-600 transition-all border-2 border-dark"
                            >
                                <span className="text-xl">🏟️</span>
                                Manage Courts
                            </Link>
                        </div>
                        
                        {event.courts && event.courts.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {event.courts.map((court) => (
                                    <div
                                        key={court.id}
                                        className="bg-neutral-100 rounded-xl p-4 border-2 border-neutral-300 text-center"
                                    >
                                        <div className="text-3xl mb-2">🎾</div>
                                        <p className="text-lg font-bold font-raverist text-dark">Court {court.name}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-neutral-100 rounded-xl">
                                <div className="text-6xl mb-4">🏟️</div>
                                <p className="text-lg font-gotham text-neutral-600">No courts yet. Set up courts for this event!</p>
                            </div>
                        )}
                    </div>

                    {/* Referee Modal */}
                    {showRefereeModal && (
                        <div className="fixed inset-0 bg-dark bg-opacity-90 flex items-center justify-center z-50 overflow-y-auto">
                            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full my-8 shadow-2xl border-4 border-accent">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-3xl font-bold font-raverist text-accent-900">
                                        👨‍⚖️ Referee Menu
                                    </h3>
                                    <button
                                        onClick={() => setShowRefereeModal(false)}
                                        className="px-4 py-2 text-sm font-gotham font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all"
                                    >
                                        ✕ Close
                                    </button>
                                </div>

                                {/* Court Selection */}
                                {event.courts && event.courts.length > 0 ? (
                                    <div>
                                        <h4 className="text-lg font-bold font-raverist text-dark mb-3">Select Court</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                            {event.courts.map((court) => (
                                                <button
                                                    key={court.id}
                                                    onClick={() => handleCourtSelect(court.id)}
                                                    className="px-4 py-4 rounded-xl font-gotham font-bold transition-all border-2 bg-neutral-100 text-dark border-neutral-300 hover:bg-accent hover:text-dark hover:border-dark hover:scale-105"
                                                >
                                                    <div className="text-3xl mb-2">🎾</div>
                                                    <div className="text-base">Court {court.name}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-neutral-50 rounded-xl">
                                        <div className="text-6xl mb-4">🏟️</div>
                                        <p className="text-lg font-gotham text-neutral-600 mb-4">
                                            No courts configured for this event yet.
                                        </p>
                                        <Link
                                            href={route('events.courts.index', event.id)}
                                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-gotham font-bold text-white shadow-lg hover:bg-primary-600 transition-all border-2 border-dark"
                                        >
                                            <span className="text-xl">🏟️</span>
                                            Set up Courts
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
