import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { formatDateShort } from '@/Utils/dateFormatter';

export default function Index({ events }) {
    const getStatusColor = (status) => {
        const colors = {
            draft: 'bg-neutral-200 text-dark',
            active: 'bg-success-100 text-success-800',
            completed: 'bg-primary-100 text-primary-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-neutral-200 text-dark';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <span>Events</span>
                    <Link
                        href={route('events.create')}
                        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-gotham font-semibold font-gotham text-white shadow-sm hover:bg-primary-600 transition-colors"
                    >
                        Create Event
                    </Link>
                </div>
            }
        >
            <Head title="Events" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {events.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-neutral-600">No events found. Create your first event!</p>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {events.map((event) => (
                                        <div
                                            key={event.id}
                                            className="border border-neutral-300 rounded-lg p-6 hover:shadow-lg hover:border-primary transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-lg font-bold text-primary font-raverist">
                                                    {event.name}
                                                </h3>
                                                <span
                                                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                                        event.status
                                                    )}`}
                                                >
                                                    {event.status}
                                                </span>
                                            </div>
                                            
                                            {event.description && (
                                                <p className="text-sm text-neutral-700 mb-3 line-clamp-2">
                                                    {event.description}
                                                </p>
                                            )}
                                            
                                            <div className="text-sm text-neutral-600 space-y-1 mb-4">
                                                <p>📅 {formatDateShort(event.start_date)} - {formatDateShort(event.end_date)}</p>
                                                {event.location && <p>📍 {event.location}</p>}
                                                <p>📋 {event.categories_count} {event.categories_count === 1 ? 'category' : 'categories'}</p>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <Link
                                                    href={route('events.show', event.id)}
                                                    className="flex-1 text-center px-3 py-2 text-sm font-medium font-gotham text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    href={route('events.edit', event.id)}
                                                    className="flex-1 text-center px-3 py-2 text-sm font-medium font-gotham text-dark border border-neutral-400 rounded hover:bg-neutral-100 transition-colors"
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

