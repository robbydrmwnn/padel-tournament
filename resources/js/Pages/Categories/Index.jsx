import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ event, categories }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <nav className="text-sm text-gray-500 mb-1">
                            <Link href={route('events.index')} className="hover:text-gray-700">Events</Link>
                            {' / '}
                            <Link href={route('events.show', event.id)} className="hover:text-gray-700">{event.name}</Link>
                        </nav>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Categories
                        </h2>
                    </div>
                    <Link
                        href={route('events.categories.create', event.id)}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        Create Category
                    </Link>
                </div>
            }
        >
            <Head title={`Categories - ${event.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {categories.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">No categories found. Create your first category!</p>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {categories.map((category) => (
                                        <div
                                            key={category.id}
                                            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                        >
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {category.name}
                                            </h3>
                                            
                                            {category.description && (
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {category.description}
                                                </p>
                                            )}
                                            
                                            <div className="text-sm text-gray-500 space-y-1 mb-4">
                                                <p>👥 {category.participants_count} participants</p>
                                                {category.max_participants && (
                                                    <p>📊 Max: {category.max_participants} participants</p>
                                                )}
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <Link
                                                    href={route('events.categories.show', [event.id, category.id])}
                                                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    href={route('events.categories.edit', [event.id, category.id])}
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


