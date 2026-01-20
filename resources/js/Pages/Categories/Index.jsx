import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ event, categories }) {
    return (
        <AuthenticatedLayout header={`Categories - ${event.name}`}>
            <Head title={`Categories - ${event.name}`} />

            <div className="py-12 bg-dark min-h-screen">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="text-sm font-gotham text-neutral-400 mb-6">
                        <Link href={route('events.index')} className="hover:text-white transition-colors">Events</Link>
                        {' / '}
                        <Link href={route('events.show', event.id)} className="hover:text-white transition-colors">{event.name}</Link>
                        {' / '}
                        <span className="text-white font-bold">Categories</span>
                    </nav>

                    {/* Header Banner */}
                    <div className="bg-success rounded-2xl p-8 mb-8 shadow-lg border-4 border-accent">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-bold font-raverist text-white mb-2">Categories</h1>
                                <p className="text-xl font-gotham text-white">{event.name}</p>
                            </div>
                            <Link
                                href={route('events.categories.create', event.id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-lg font-gotham font-bold text-success shadow-lg hover:bg-neutral-100 transition-all border-2 border-accent hover:scale-105"
                            >
                                <span className="text-2xl">➕</span>
                                Create Category
                            </Link>
                        </div>
                    </div>

                    {/* Categories Grid */}
                    {categories.length === 0 ? (
                        <div className="bg-white rounded-2xl p-16 text-center shadow-lg border-4 border-success">
                            <div className="text-8xl mb-6">📋</div>
                            <h3 className="text-3xl font-bold font-raverist text-dark mb-4">No Categories Yet</h3>
                            <p className="text-xl font-gotham text-neutral-600 mb-8">Create your first category to organize participants!</p>
                            <Link
                                href={route('events.categories.create', event.id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-success px-8 py-4 text-lg font-gotham font-bold text-white shadow-lg hover:bg-success-600 transition-all border-4 border-dark"
                            >
                                <span className="text-2xl">➕</span>
                                Create First Category
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="bg-white rounded-2xl p-6 shadow-lg border-4 border-success hover:border-primary transition-all hover:shadow-2xl group"
                                >
                                    {/* Category Name */}
                                    <h3 className="text-2xl font-bold font-raverist text-success mb-3 group-hover:text-primary transition-colors">
                                        {category.name}
                                    </h3>
                                    
                                    {/* Description */}
                                    {category.description && (
                                        <p className="text-base font-gotham text-neutral-700 mb-4 line-clamp-2">
                                            {category.description}
                                        </p>
                                    )}
                                    
                                    {/* Stats */}
                                    <div className="bg-neutral-100 rounded-xl p-4 mb-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-gotham font-bold text-neutral-600">👥 PARTICIPANTS</span>
                                            <span className="text-2xl font-bold font-raverist text-success">{category.participants_count || 0}</span>
                                        </div>
                                        {category.max_participants && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-gotham font-bold text-neutral-600">📊 CAPACITY</span>
                                                <span className="text-lg font-gotham text-dark">{category.max_participants}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex gap-2 mb-2">
                                        <Link
                                            href={route('events.categories.show', [event.id, category.id])}
                                            className="flex-1 text-center px-4 py-3 text-sm font-gotham font-bold text-white bg-success rounded-xl hover:bg-success-600 transition-all border-2 border-dark"
                                        >
                                            View
                                        </Link>
                                        <Link
                                            href={route('events.categories.edit', [event.id, category.id])}
                                            className="flex-1 text-center px-4 py-3 text-sm font-gotham font-bold text-dark bg-white rounded-xl hover:bg-neutral-100 transition-all border-2 border-neutral-400"
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                    <Link
                                        href={route('events.categories.leaderboard', [event.id, category.id])}
                                        className="block text-center px-4 py-3 text-sm font-gotham font-bold text-white bg-primary rounded-xl hover:bg-primary-600 transition-all border-2 border-dark"
                                    >
                                        📊 Leaderboard
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
