import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Pencil, ChevronRight, Save, Loader, Trash2 } from 'lucide-react';

export default function Edit({ event }) {
    const { data, setData, patch, delete: destroy, processing, errors } = useForm({
        name: event.name,
        description: event.description || '',
        start_date: event.start_date,
        end_date: event.end_date,
        location: event.location || '',
        status: event.status,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('events.update', event.id));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this event? This will also delete all categories, participants, and groups associated with it.')) {
            destroy(route('events.destroy', event.id));
        }
    };

    return (
        <AuthenticatedLayout header="Edit Event">
            <Head title="Edit Event" />

            <div className="py-12 bg-neutral-100 min-h-screen">
                <div className="mx-auto max-w-3xl px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 text-sm font-ffdin text-zinc-500 mb-6">
                        <Link href={route('events.index')} className="hover:text-black transition-colors">Events</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-black font-bold">Edit Event</span>
                    </nav>

                    {/* Header Banner */}
                    <div className="bg-black rounded-2xl p-8 mb-8 shadow-lg border border-zinc-700">
                        <div className="flex items-center gap-4">
                            <Pencil className="h-10 w-10 text-accent flex-shrink-0" />
                            <div>
                                <h1 className="text-3xl font-bold font-ffdin text-white mb-1 tracking-wide">Edit Event</h1>
                                <p className="text-lg font-ffdin text-zinc-400">Update your padel tournament details</p>
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

                            <div className="flex flex-col gap-4 pt-4">
                                <div className="flex gap-4">
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
                                        {processing ? <><Loader className="h-4 w-4 animate-spin" /> Updating...</> : <><Save className="h-4 w-4" /> Update Event</>}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 text-base font-ffdin font-bold text-white bg-red-600 border border-red-700 rounded-xl shadow hover:bg-red-700 transition-all"
                                >
                                    <Trash2 className="h-4 w-4" /> Delete Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
