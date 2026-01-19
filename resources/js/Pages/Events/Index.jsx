import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { formatDateShort } from '@/Utils/dateFormatter';

export default function Index({ events }) {
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

    return (
        <AuthenticatedLayout header="Events">
            <Head title="Events" />

            <div className="py-12 bg-dark min-h-screen">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Header Banner */}
                    <div className="bg-primary rounded-2xl p-8 mb-8 shadow-lg border-4 border-success">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-bold font-raverist text-white mb-2">Tournament Events</h1>
                                <p className="text-xl font-gotham text-neutral-200">Manage and organize your padel tournaments</p>
                            </div>
                            <Link
                                href={route('events.create')}
                                className="inline-flex items-center gap-2 rounded-xl bg-success px-6 py-3 text-lg font-gotham font-bold text-white shadow-lg hover:bg-success-600 transition-all border-2 border-dark hover:scale-105"
                            >
                                <span className="text-2xl">➕</span>
                                Create Event
                            </Link>
                        </div>
                    </div>

                    {/* Events Grid */}
                    {events.length === 0 ? (
                        <div className="bg-white rounded-2xl p-16 text-center shadow-lg border-4 border-neutral-300">
                            <div className="text-8xl mb-6">🏆</div>
                            <h3 className="text-3xl font-bold font-raverist text-dark mb-4">No Events Yet</h3>
                            <p className="text-xl font-gotham text-neutral-600 mb-8">Create your first tournament event to get started!</p>
                            <Link
                                href={route('events.create')}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-gotham font-bold text-white shadow-lg hover:bg-primary-600 transition-all border-4 border-dark"
                            >
                                <span className="text-2xl">➕</span>
                                Create First Event
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {events.map((event) => (
                                <div
                                    key={event.id}
                                    className="bg-white rounded-2xl p-6 shadow-lg border-4 border-primary hover:border-success transition-all hover:shadow-2xl group"
                                >
                                    {/* Status Badge */}
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-4 py-2 text-sm font-gotham font-bold rounded-xl border-2 ${getStatusColor(event.status)}`}>
                                            {getStatusIcon(event.status)} {event.status.toUpperCase()}
                                        </span>
                                    </div>
                                    
                                    {/* Event Name */}
                                    <h3 className="text-2xl font-bold font-raverist text-primary mb-3 group-hover:text-success transition-colors">
                                        {event.name}
                                    </h3>
                                    
                                    {/* Description */}
                                    {event.description && (
                                        <p className="text-base font-gotham text-neutral-700 mb-4 line-clamp-2">
                                            {event.description}
                                        </p>
                                    )}
                                    
                                    {/* Event Details */}
                                    <div className="bg-neutral-100 rounded-xl p-4 mb-4 space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-gotham text-dark">
                                            <span className="text-xl">📅</span>
                                            <span>{formatDateShort(event.start_date)} - {formatDateShort(event.end_date)}</span>
                                        </div>
                                        {event.location && (
                                            <div className="flex items-center gap-2 text-sm font-gotham text-dark">
                                                <span className="text-xl">📍</span>
                                                <span>{event.location}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm font-gotham text-dark">
                                            <span className="text-xl">📋</span>
                                            <span>{event.categories_count} {event.categories_count === 1 ? 'Category' : 'Categories'}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <Link
                                            href={route('events.show', event.id)}
                                            className="flex-1 text-center px-4 py-3 text-sm font-gotham font-bold text-white bg-primary rounded-xl hover:bg-primary-600 transition-all border-2 border-dark"
                                        >
                                            View
                                        </Link>
                                        <Link
                                            href={route('events.edit', event.id)}
                                            className="flex-1 text-center px-4 py-3 text-sm font-gotham font-bold text-dark bg-white rounded-xl hover:bg-neutral-100 transition-all border-2 border-neutral-400"
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

