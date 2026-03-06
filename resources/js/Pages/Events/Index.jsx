import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { formatDateShort } from '@/Utils/dateFormatter';
import { Plus, Calendar, MapPin, LayoutGrid, CheckCircle, XCircle, Clock, Ban, Trophy } from 'lucide-react';

export default function Index({ events }) {
    const getStatusStyle = (status) => {
        const styles = {
            draft: 'bg-zinc-200 text-zinc-700 border-zinc-300',
            active: 'bg-black text-white border-zinc-700',
            completed: 'bg-zinc-600 text-white border-zinc-700',
            cancelled: 'bg-red-600 text-white border-red-800',
        };
        return styles[status] || 'bg-zinc-200 text-zinc-700 border-zinc-300';
    };

    const StatusIcon = ({ status, className = 'h-3.5 w-3.5' }) => {
        const icons = {
            draft: <Clock className={className} />,
            active: <CheckCircle className={className} />,
            completed: <Trophy className={className} />,
            cancelled: <Ban className={className} />,
        };
        return icons[status] || <LayoutGrid className={className} />;
    };

    return (
        <AuthenticatedLayout header="Events">
            <Head title="Events" />

            <div className="py-12 bg-neutral-100 min-h-screen">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Header Banner */}
                    <div className="bg-black rounded-2xl p-8 mb-8 shadow-lg border border-zinc-700">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-bold font-ffdin text-white mb-2 tracking-wide">Tournament Events</h1>
                                <p className="text-xl font-ffdin text-zinc-400">Manage and organize your padel tournaments</p>
                            </div>
                            <Link
                                href={route('events.create')}
                                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-lg font-ffdin font-bold text-black shadow-lg hover:bg-accent-400 transition-all border border-accent-600 hover:scale-105"
                            >
                                <Plus className="h-5 w-5" />
                                Create Event
                            </Link>
                        </div>
                    </div>

                    {/* Events Grid */}
                    {events.length === 0 ? (
                        <div className="bg-white rounded-2xl p-16 text-center shadow-lg border border-zinc-200">
                            <Trophy className="h-16 w-16 mx-auto mb-6 text-zinc-300" />
                            <h3 className="text-3xl font-bold font-ffdin text-black mb-4">No Events Yet</h3>
                            <p className="text-xl font-ffdin text-zinc-500 mb-8">Create your first tournament event to get started!</p>
                            <Link
                                href={route('events.create')}
                                className="inline-flex items-center gap-2 rounded-xl bg-black px-8 py-4 text-lg font-ffdin font-bold text-white shadow-lg hover:bg-zinc-800 transition-all"
                            >
                                <Plus className="h-5 w-5" />
                                Create First Event
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {events.map((event) => (
                                <div
                                    key={event.id}
                                    className="bg-white rounded-2xl p-6 shadow-lg border border-zinc-200 hover:border-black transition-all hover:shadow-2xl group"
                                >
                                    {/* Status Badge */}
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-ffdin font-bold rounded-lg border ${getStatusStyle(event.status)}`}>
                                            <StatusIcon status={event.status} className="h-3 w-3" />
                                            {event.status.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Event Name */}
                                    <h3 className="text-2xl font-bold font-ffdin text-black mb-3 group-hover:text-zinc-600 transition-colors">
                                        {event.name}
                                    </h3>

                                    {/* Description */}
                                    {event.description && (
                                        <p className="text-base font-ffdin text-zinc-600 mb-4 line-clamp-2">
                                            {event.description}
                                        </p>
                                    )}

                                    {/* Event Details */}
                                    <div className="bg-zinc-50 rounded-xl p-4 mb-4 space-y-2 border border-zinc-100">
                                        <div className="flex items-center gap-2 text-sm font-ffdin text-zinc-700">
                                            <Calendar className="h-4 w-4 flex-shrink-0 text-zinc-400" />
                                            <span>{formatDateShort(event.start_date)} – {formatDateShort(event.end_date)}</span>
                                        </div>
                                        {event.location && (
                                            <div className="flex items-center gap-2 text-sm font-ffdin text-zinc-700">
                                                <MapPin className="h-4 w-4 flex-shrink-0 text-zinc-400" />
                                                <span>{event.location}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm font-ffdin text-zinc-700">
                                            <LayoutGrid className="h-4 w-4 flex-shrink-0 text-zinc-400" />
                                            <span>{event.categories_count} {event.categories_count === 1 ? 'Category' : 'Categories'}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <Link
                                            href={route('events.show', event.id)}
                                            className="flex-1 text-center px-4 py-3 text-sm font-ffdin font-bold text-white bg-black rounded-xl hover:bg-zinc-800 transition-all"
                                        >
                                            View
                                        </Link>
                                        <Link
                                            href={route('events.edit', event.id)}
                                            className="flex-1 text-center px-4 py-3 text-sm font-ffdin font-bold text-black bg-white rounded-xl hover:bg-zinc-50 transition-all border border-zinc-300"
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
