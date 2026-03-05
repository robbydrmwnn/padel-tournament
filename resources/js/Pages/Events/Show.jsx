import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { formatDate } from '@/Utils/dateFormatter';
import { useState } from 'react';
import { Scale, Building2, LayoutGrid, Pencil, Plus, Users, BarChart2, X, Calendar, MapPin, Activity } from 'lucide-react';

export default function Show({ event }) {
    const [showRefereeModal, setShowRefereeModal] = useState(false);

    const handleCourtSelect = (courtId) => {
        router.visit(route('events.courts.matches', [event.id, courtId]));
    };

    return (
        <AuthenticatedLayout header={event.name}>
            <Head title={event.name} />

            <div className="py-12 bg-neutral-100 min-h-screen">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-6">
                    {/* Header Banner */}
                    <div className="bg-black rounded-2xl p-8 shadow-lg border border-zinc-700">
                        <div className="flex justify-between items-center">
                            <div className="flex-1">
                                <h1 className="text-4xl font-bold font-ffdin text-white mb-2">{event.name}</h1>
                                <p className="text-xl font-ffdin text-zinc-400">{event.description || 'Tournament Event'}</p>
                            </div>
                            <div className="flex gap-3 flex-wrap justify-end">
                                <button
                                    onClick={() => setShowRefereeModal(true)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-ffdin font-bold text-black shadow-lg hover:bg-accent-400 transition-all"
                                >
                                    <Scale className="h-4 w-4" />
                                    Referee
                                </button>
                                <Link
                                    href={route('events.courts.index', event.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-700 px-5 py-3 text-sm font-ffdin font-bold text-white shadow-lg hover:bg-zinc-600 transition-all"
                                >
                                    <Building2 className="h-4 w-4" />
                                    Courts
                                </Link>
                                <Link
                                    href={route('events.categories.index', event.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-5 py-3 text-sm font-ffdin font-bold text-white shadow-lg hover:bg-zinc-700 transition-all border border-zinc-600"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                    Categories
                                </Link>
                                <Link
                                    href={route('events.edit', event.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-ffdin font-bold text-black shadow-lg hover:bg-zinc-100 transition-all border border-zinc-300"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Event Details Card */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-zinc-200">
                        <h3 className="text-2xl font-bold font-ffdin text-black mb-6">Event Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                                <dt className="flex items-center gap-1.5 text-xs font-ffdin font-bold text-zinc-500 mb-2 uppercase tracking-wider">
                                    <Calendar className="h-3.5 w-3.5" /> Start Date
                                </dt>
                                <dd className="text-lg font-ffdin text-black">{formatDate(event.start_date)}</dd>
                            </div>

                            <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                                <dt className="flex items-center gap-1.5 text-xs font-ffdin font-bold text-zinc-500 mb-2 uppercase tracking-wider">
                                    <Calendar className="h-3.5 w-3.5" /> End Date
                                </dt>
                                <dd className="text-lg font-ffdin text-black">{formatDate(event.end_date)}</dd>
                            </div>

                            <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                                <dt className="flex items-center gap-1.5 text-xs font-ffdin font-bold text-zinc-500 mb-2 uppercase tracking-wider">
                                    <MapPin className="h-3.5 w-3.5" /> Location
                                </dt>
                                <dd className="text-lg font-ffdin text-black">{event.location || 'Not specified'}</dd>
                            </div>

                            <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                                <dt className="flex items-center gap-1.5 text-xs font-ffdin font-bold text-zinc-500 mb-2 uppercase tracking-wider">
                                    <Activity className="h-3.5 w-3.5" /> Status
                                </dt>
                                <dd className="text-lg font-ffdin text-black">{event.status.charAt(0).toUpperCase() + event.status.slice(1)}</dd>
                            </div>
                        </div>
                    </div>

                    {/* Categories Section */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-zinc-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold font-ffdin text-black">Categories</h3>
                            <Link
                                href={route('events.categories.create', event.id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-ffdin font-bold text-white shadow-lg hover:bg-zinc-800 transition-all"
                            >
                                <Plus className="h-4 w-4" />
                                Add Category
                            </Link>
                        </div>

                        {event.categories && event.categories.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {event.categories.map((category) => (
                                    <Link
                                        key={category.id}
                                        href={route('events.categories.show', [event.id, category.id])}
                                        className="bg-zinc-50 rounded-xl p-4 hover:bg-black hover:text-white transition-all border border-zinc-200 hover:border-black group"
                                    >
                                        <h4 className="text-lg font-bold font-ffdin text-black group-hover:text-white mb-2">{category.name}</h4>
                                        <div className="space-y-1">
                                            <p className="flex items-center gap-1.5 text-sm font-ffdin text-zinc-600 group-hover:text-zinc-300">
                                                <Users className="h-3.5 w-3.5" />
                                                {category.participants_count || 0} participants
                                            </p>
                                            <p className="flex items-center gap-1.5 text-sm font-ffdin text-zinc-600 group-hover:text-zinc-300">
                                                <BarChart2 className="h-3.5 w-3.5" />
                                                {category.groups_count || 0} groups
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-zinc-50 rounded-xl border border-zinc-100">
                                <LayoutGrid className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
                                <p className="text-lg font-ffdin text-zinc-500">No categories yet. Create your first category!</p>
                            </div>
                        )}
                    </div>

                    {/* Courts Section */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-zinc-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold font-ffdin text-black">Courts</h3>
                            <Link
                                href={route('events.courts.index', event.id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-ffdin font-bold text-white shadow-lg hover:bg-zinc-800 transition-all"
                            >
                                <Building2 className="h-4 w-4" />
                                Manage Courts
                            </Link>
                        </div>

                        {event.courts && event.courts.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {event.courts.map((court) => (
                                    <div
                                        key={court.id}
                                        className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 text-center"
                                    >
                                        <Building2 className="h-8 w-8 mx-auto mb-2 text-zinc-400" />
                                        <p className="text-lg font-bold font-ffdin text-black">Court {court.name}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-zinc-50 rounded-xl border border-zinc-100">
                                <Building2 className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
                                <p className="text-lg font-ffdin text-zinc-500">No courts yet. Set up courts for this event!</p>
                            </div>
                        )}
                    </div>

                    {/* Referee Modal */}
                    {showRefereeModal && (
                        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-y-auto">
                            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full my-8 shadow-2xl border border-zinc-200">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="flex items-center gap-3 text-3xl font-bold font-ffdin text-black">
                                        <Scale className="h-7 w-7" />
                                        Referee Menu
                                    </h3>
                                    <button
                                        onClick={() => setShowRefereeModal(false)}
                                        className="inline-flex items-center gap-1 px-4 py-2 text-sm font-ffdin font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all"
                                    >
                                        <X className="h-4 w-4" /> Close
                                    </button>
                                </div>

                                {event.courts && event.courts.length > 0 ? (
                                    <div>
                                        <h4 className="text-lg font-bold font-ffdin text-black mb-3">Select Court</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                            {event.courts.map((court) => (
                                                <button
                                                    key={court.id}
                                                    onClick={() => handleCourtSelect(court.id)}
                                                    className="flex flex-col items-center px-4 py-4 rounded-xl font-ffdin font-bold transition-all border bg-zinc-50 text-black border-zinc-200 hover:bg-black hover:text-white hover:border-black hover:scale-105"
                                                >
                                                    <Building2 className="h-8 w-8 mb-2" />
                                                    <div className="text-base">Court {court.name}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-zinc-50 rounded-xl border border-zinc-100">
                                        <Building2 className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
                                        <p className="text-lg font-ffdin text-zinc-500 mb-4">
                                            No courts configured for this event yet.
                                        </p>
                                        <Link
                                            href={route('events.courts.index', event.id)}
                                            className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-ffdin font-bold text-white shadow-lg hover:bg-zinc-800 transition-all"
                                        >
                                            <Building2 className="h-4 w-4" />
                                            Set up Courts
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
