import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { formatDateShort } from '@/Utils/dateFormatter';

export default function Index({ events }) {
    const getStatusColor = (status) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800',
            active: 'bg-green-100 text-green-800',
            completed: 'bg-blue-100 text-blue-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Events
                    </h2>
                    <Link
                        href={route('events.create')}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
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
                                    <p className="text-gray-500">No events found. Create your first event!</p>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {events.map((event) => (
                                        <div
                                            key={event.id}
                                            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-lg font-semibold text-gray-900">
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
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {event.description}
                                                </p>
                                            )}
                                            
                                            <div className="text-sm text-gray-500 space-y-1 mb-4">
                                                <p>📅 {formatDateShort(event.start_date)} - {formatDateShort(event.end_date)}</p>
                                                {event.location && <p>📍 {event.location}</p>}
                                                <p>📋 {event.categories_count} {event.categories_count === 1 ? 'category' : 'categories'}</p>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <Link
                                                    href={route('events.show', event.id)}
                                                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    href={route('events.edit', event.id)}
                                                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
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

