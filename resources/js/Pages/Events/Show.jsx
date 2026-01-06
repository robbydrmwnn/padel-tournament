import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { formatDate } from '@/Utils/dateFormatter';

export default function Show({ event }) {
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
                        {event.name}
                    </h2>
                    <div className="flex gap-2">
                        <Link
                            href={route('events.courts.index', event.id)}
                            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                        >
                            Manage Courts
                        </Link>
                        <Link
                            href={route('events.categories.index', event.id)}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                        >
                            Manage Categories
                        </Link>
                        <Link
                            href={route('events.edit', event.id)}
                            className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            Edit Event
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={event.name} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Event Details */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Details</h3>
                                </div>
                                <span
                                    className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                                        event.status
                                    )}`}
                                >
                                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                </span>
                            </div>
                            
                            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {event.description || 'No description provided'}
                                    </dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {event.location || 'Not specified'}
                                    </dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{formatDate(event.start_date)}</dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">End Date</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{formatDate(event.end_date)}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                                <Link
                                    href={route('events.categories.create', event.id)}
                                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                                >
                                    Add Category
                                </Link>
                            </div>
                            
                            {event.categories && event.categories.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {event.categories.map((category) => (
                                        <div
                                            key={category.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            <h4 className="text-base font-semibold text-gray-900 mb-2">
                                                {category.name}
                                            </h4>
                                            {category.description && (
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {category.description}
                                                </p>
                                            )}
                                            <div className="text-sm text-gray-500 mb-3">
                                                <p>👥 {category.participants?.length || 0} participants</p>
                                                <p>📊 {category.groups?.length || 0} groups</p>
                                            </div>
                                            <Link
                                                href={route('events.categories.show', [event.id, category.id])}
                                                className="block text-center px-3 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">
                                    No categories yet. Add your first category to get started!
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

