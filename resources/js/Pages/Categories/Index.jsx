import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ event, categories }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <nav className="text-sm text-neutral-600 mb-1">
                            <Link href={route('events.index')} className="hover:text-dark">Events</Link>
                            {' / '}
                            <Link href={route('events.show', event.id)} className="hover:text-dark">{event.name}</Link>
                        </nav>
                        <h2 className="text-xl font-bold font-raverist leading-tight text-dark">
                            Categories
                        </h2>
                    </div>
                    <Link
                        href={route('events.categories.create', event.id)}
                        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-gotham font-semibold font-gotham text-white shadow-sm hover:bg-primary-600"
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
                                    <p className="text-neutral-600">No categories found. Create your first category!</p>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {categories.map((category) => (
                                        <div
                                            key={category.id}
                                            className="border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                        >
                                            <h3 className="text-lg font-bold font-raverist text-dark mb-2">
                                                {category.name}
                                            </h3>
                                            
                                            {category.description && (
                                                <p className="text-sm text-neutral-700 mb-3 line-clamp-2">
                                                    {category.description}
                                                </p>
                                            )}
                                            
                                            <div className="text-sm text-neutral-600 space-y-1 mb-4">
                                                <p>👥 {category.participants_count} participants</p>
                                                {category.max_participants && (
                                                    <p>📊 Max: {category.max_participants} participants</p>
                                                )}
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <Link
                                                    href={route('events.categories.show', [event.id, category.id])}
                                                    className="flex-1 text-center px-3 py-2 text-sm font-medium font-gotham text-primary border border-primary rounded hover:bg-primary-50"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    href={route('events.categories.edit', [event.id, category.id])}
                                                    className="flex-1 text-center px-3 py-2 text-sm font-medium font-gotham text-dark border border-neutral-300 rounded hover:bg-neutral-50"
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


