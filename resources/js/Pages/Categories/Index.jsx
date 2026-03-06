import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Plus, ClipboardList, Users, BarChart2, ChevronRight } from 'lucide-react';

export default function Index({ event, categories }) {
    return (
        <AuthenticatedLayout header={`Categories - ${event.name}`}>
            <Head title={`Categories - ${event.name}`} />

            <div className="py-12 bg-neutral-100 min-h-screen">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 text-sm font-ffdin text-zinc-500 mb-6">
                        <Link href={route('events.index')} className="hover:text-black transition-colors">Events</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <Link href={route('events.show', event.id)} className="hover:text-black transition-colors">{event.name}</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-black font-bold">Categories</span>
                    </nav>

                    {/* Header Banner */}
                    <div className="bg-black rounded-2xl p-8 mb-8 shadow-lg border border-zinc-700">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-bold font-ffdin text-white mb-2 tracking-wide">Categories</h1>
                                <p className="text-xl font-ffdin text-zinc-400">{event.name}</p>
                            </div>
                            <Link
                                href={route('events.categories.create', event.id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-ffdin font-bold text-black shadow-lg hover:bg-accent-400 transition-all hover:scale-105"
                            >
                                <Plus className="h-4 w-4" />
                                Create Category
                            </Link>
                        </div>
                    </div>

                    {/* Categories Grid */}
                    {categories.length === 0 ? (
                        <div className="bg-white rounded-2xl p-16 text-center shadow-lg border border-zinc-200">
                            <ClipboardList className="h-16 w-16 mx-auto mb-6 text-zinc-300" />
                            <h3 className="text-3xl font-bold font-ffdin text-black mb-4">No Categories Yet</h3>
                            <p className="text-xl font-ffdin text-zinc-500 mb-8">Create your first category to organize participants!</p>
                            <Link
                                href={route('events.categories.create', event.id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-black px-8 py-4 text-lg font-ffdin font-bold text-white shadow-lg hover:bg-zinc-800 transition-all"
                            >
                                <Plus className="h-5 w-5" />
                                Create First Category
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="bg-white rounded-2xl p-6 shadow-lg border border-zinc-200 hover:border-black transition-all hover:shadow-2xl group"
                                >
                                    {/* Category Name */}
                                    <h3 className="text-2xl font-bold font-ffdin text-black mb-3 group-hover:text-zinc-600 transition-colors">
                                        {category.name}
                                    </h3>

                                    {/* Description */}
                                    {category.description && (
                                        <p className="text-base font-ffdin text-zinc-600 mb-4 line-clamp-2">
                                            {category.description}
                                        </p>
                                    )}

                                    {/* Stats */}
                                    <div className="bg-zinc-50 rounded-xl p-4 mb-4 space-y-2 border border-zinc-100">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 text-sm font-ffdin font-bold text-zinc-500">
                                                <Users className="h-3.5 w-3.5" /> Participants
                                            </span>
                                            <span className="text-2xl font-bold font-ffdin text-black">{category.participants_count || 0}</span>
                                        </div>
                                        {category.max_participants && (
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-1.5 text-sm font-ffdin font-bold text-zinc-500">
                                                    <BarChart2 className="h-3.5 w-3.5" /> Capacity
                                                </span>
                                                <span className="text-lg font-ffdin text-black">{category.max_participants}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 mb-2">
                                        <Link
                                            href={route('events.categories.show', [event.id, category.id])}
                                            className="flex-1 text-center px-4 py-3 text-sm font-ffdin font-bold text-white bg-black rounded-xl hover:bg-zinc-800 transition-all"
                                        >
                                            View
                                        </Link>
                                        <Link
                                            href={route('events.categories.edit', [event.id, category.id])}
                                            className="flex-1 text-center px-4 py-3 text-sm font-ffdin font-bold text-black bg-white rounded-xl hover:bg-zinc-50 transition-all border border-zinc-300"
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                    <Link
                                        href={route('events.categories.leaderboard', [event.id, category.id])}
                                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-ffdin font-bold text-black bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-all border border-zinc-200"
                                    >
                                        <BarChart2 className="h-4 w-4" /> Leaderboard
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
