import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { formatDate } from '@/Utils/dateFormatter';

export default function Show({ event }) {
    const getStatusColor = (status) => {
        const colors = {
            draft: 'bg-neutral-100 text-dark',
            active: 'bg-success-100 text-success-800',
            completed: 'bg-primary-100 text-primary-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-neutral-100 text-dark';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold font-raverist leading-tight text-dark">
                        {event.name}
                    </h2>
                    <div className="flex gap-2">
                        <Link
                            href={route('events.courts.index', event.id)}
                            className="inline-flex items-center rounded-md bg-success px-4 py-2 text-sm font-gotham font-semibold font-gotham text-white shadow-sm hover:bg-success-600"
                        >
                            Manage Courts
                        </Link>
                        <Link
                            href={route('events.categories.index', event.id)}
                            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-gotham font-semibold font-gotham text-white shadow-sm hover:bg-primary-600"
                        >
                            Manage Categories
                        </Link>
                        <Link
                            href={route('events.edit', event.id)}
                            className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-gotham font-semibold text-dark shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-neutral-50"
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
                                    <h3 className="text-lg font-bold font-raverist text-dark mb-2">Event Details</h3>
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
                                    <dt className="text-sm font-medium text-neutral-600">Description</dt>
                                    <dd className="mt-1 text-sm text-dark">
                                        {event.description || 'No description provided'}
                                    </dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-neutral-600">Location</dt>
                                    <dd className="mt-1 text-sm text-dark">
                                        {event.location || 'Not specified'}
                                    </dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-neutral-600">Start Date</dt>
                                    <dd className="mt-1 text-sm text-dark">{formatDate(event.start_date)}</dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-neutral-600">End Date</dt>
                                    <dd className="mt-1 text-sm text-dark">{formatDate(event.end_date)}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold font-raverist text-dark">Categories</h3>
                                <Link
                                    href={route('events.categories.create', event.id)}
                                    className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold font-gotham text-white shadow-sm hover:bg-primary-600"
                                >
                                    Add Category
                                </Link>
                            </div>
                            
                            {event.categories && event.categories.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {event.categories.map((category) => (
                                        <div
                                            key={category.id}
                                            className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            <h4 className="text-base font-semibold text-dark mb-2">
                                                {category.name}
                                            </h4>
                                            {category.description && (
                                                <p className="text-sm text-neutral-700 mb-3">
                                                    {category.description}
                                                </p>
                                            )}
                                            <div className="text-sm text-neutral-600 mb-3">
                                                <p>👥 {category.participants?.length || 0} participants</p>
                                                <p>📊 {category.groups?.length || 0} groups</p>
                                            </div>
                                            <Link
                                                href={route('events.categories.show', [event.id, category.id])}
                                                className="block text-center px-3 py-2 text-sm font-medium font-gotham text-primary border border-primary rounded hover:bg-primary-50"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-neutral-600 py-8">
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

