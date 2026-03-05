import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Trophy, ChevronRight, Plus, Loader } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        status: 'draft',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('events.store'));
    };

    return (
        <AuthenticatedLayout header="Create Event">
            <Head title="Create Event" />

            <div className="py-12 bg-neutral-100 min-h-screen">
                <div className="mx-auto max-w-3xl px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 text-sm font-ffdin text-zinc-500 mb-6">
                        <Link href={route('events.index')} className="hover:text-black transition-colors">Events</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-black font-bold">Create Event</span>
                    </nav>

                    {/* Header Banner */}
                    <div className="bg-black rounded-2xl p-8 mb-8 shadow-lg border border-zinc-700">
                        <div className="flex items-center gap-4">
                            <Trophy className="h-10 w-10 text-accent flex-shrink-0" />
                            <div>
                                <h1 className="text-3xl font-bold font-ffdin text-white mb-1 tracking-wide">Create New Event</h1>
                                <p className="text-lg font-ffdin text-zinc-400">Set up a new padel tournament</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-zinc-200">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-ffdin font-bold text-zinc-700 mb-2 uppercase tracking-wider">
                                    Event Name *
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="block w-full font-ffdin rounded-xl border border-zinc-300 shadow-sm focus:border-black focus:ring-black text-base p-3"
                                    placeholder="Enter event name..."
                                    required
                                />
                                {errors.name && <p className="mt-2 text-sm font-ffdin font-bold text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-ffdin font-bold text-zinc-700 mb-2 uppercase tracking-wider">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    className="block w-full font-ffdin rounded-xl border border-zinc-300 shadow-sm focus:border-black focus:ring-black text-base p-3"
                                    placeholder="Describe your event..."
                                />
                                {errors.description && <p className="mt-2 text-sm font-ffdin font-bold text-red-600">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="start_date" className="block text-sm font-ffdin font-bold text-zinc-700 mb-2 uppercase tracking-wider">
                                        Start Date *
                                    </label>
                                    <input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="block w-full font-ffdin rounded-xl border border-zinc-300 shadow-sm focus:border-black focus:ring-black text-base p-3"
                                        required
                                    />
                                    {errors.start_date && <p className="mt-2 text-sm font-ffdin font-bold text-red-600">{errors.start_date}</p>}
                                </div>

                                <div>
                                    <label htmlFor="end_date" className="block text-sm font-ffdin font-bold text-zinc-700 mb-2 uppercase tracking-wider">
                                        End Date *
                                    </label>
                                    <input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className="block w-full font-ffdin rounded-xl border border-zinc-300 shadow-sm focus:border-black focus:ring-black text-base p-3"
                                        required
                                    />
                                    {errors.end_date && <p className="mt-2 text-sm font-ffdin font-bold text-red-600">{errors.end_date}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="location" className="block text-sm font-ffdin font-bold text-zinc-700 mb-2 uppercase tracking-wider">
                                    Location
                                </label>
                                <input
                                    id="location"
                                    type="text"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    className="block w-full font-ffdin rounded-xl border border-zinc-300 shadow-sm focus:border-black focus:ring-black text-base p-3"
                                    placeholder="Event location..."
                                />
                                {errors.location && <p className="mt-2 text-sm font-ffdin font-bold text-red-600">{errors.location}</p>}
                            </div>

                            <div>
                                <label htmlFor="status" className="block text-sm font-ffdin font-bold text-zinc-700 mb-2 uppercase tracking-wider">
                                    Status *
                                </label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="block w-full font-ffdin rounded-xl border border-zinc-300 shadow-sm focus:border-black focus:ring-black text-base p-3"
                                    required
                                >
                                    <option value="draft">Draft</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                {errors.status && <p className="mt-2 text-sm font-ffdin font-bold text-red-600">{errors.status}</p>}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Link
                                    href={route('events.index')}
                                    className="flex-1 text-center px-6 py-3 text-base font-ffdin font-bold text-black bg-white border border-zinc-300 rounded-xl shadow hover:bg-zinc-50 transition-all"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-ffdin font-bold text-white bg-black border border-zinc-700 rounded-xl shadow hover:bg-zinc-800 disabled:opacity-50 transition-all"
                                >
                                    {processing ? <><Loader className="h-4 w-4 animate-spin" /> Creating...</> : <><Plus className="h-4 w-4" /> Create Event</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
