import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

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

            <div className="py-12 bg-dark min-h-screen">
                <div className="mx-auto max-w-3xl px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="text-sm font-gotham text-neutral-400 mb-6">
                        <Link href={route('events.index')} className="hover:text-white transition-colors">Events</Link>
                        {' / '}
                        <span className="text-white font-bold">Create Event</span>
                    </nav>

                    {/* Header Banner */}
                    <div className="bg-primary rounded-2xl p-8 mb-8 shadow-lg border-4 border-success">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">🏆</div>
                            <div>
                                <h1 className="text-3xl font-bold font-raverist text-white mb-1">Create New Event</h1>
                                <p className="text-lg font-gotham text-neutral-200">Set up a new padel tournament</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-primary">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-base font-gotham font-bold text-dark mb-2">
                                    📝 Event Name *
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                    placeholder="Enter event name..."
                                    required
                                />
                                {errors.name && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-base font-gotham font-bold text-dark mb-2">
                                    📋 Description
                                </label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                    placeholder="Describe your event..."
                                />
                                {errors.description && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="start_date" className="block text-base font-gotham font-bold text-dark mb-2">
                                        📅 Start Date *
                                    </label>
                                    <input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                        required
                                    />
                                    {errors.start_date && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.start_date}</p>}
                                </div>

                                <div>
                                    <label htmlFor="end_date" className="block text-base font-gotham font-bold text-dark mb-2">
                                        📅 End Date *
                                    </label>
                                    <input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                        required
                                    />
                                    {errors.end_date && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.end_date}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="location" className="block text-base font-gotham font-bold text-dark mb-2">
                                    📍 Location
                                </label>
                                <input
                                    id="location"
                                    type="text"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                    placeholder="Event location..."
                                />
                                {errors.location && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.location}</p>}
                            </div>

                            <div>
                                <label htmlFor="status" className="block text-base font-gotham font-bold text-dark mb-2">
                                    📊 Status *
                                </label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                    required
                                >
                                    <option value="draft">📝 Draft</option>
                                    <option value="active">🔴 Active</option>
                                    <option value="completed">✅ Completed</option>
                                    <option value="cancelled">❌ Cancelled</option>
                                </select>
                                {errors.status && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.status}</p>}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Link
                                    href={route('events.index')}
                                    className="flex-1 text-center px-6 py-3 text-base font-gotham font-bold text-dark bg-white border-2 border-neutral-400 rounded-xl shadow-lg hover:bg-neutral-100 transition-all"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 px-6 py-3 text-base font-gotham font-bold text-white bg-success border-2 border-dark rounded-xl shadow-lg hover:bg-success-600 disabled:opacity-50 transition-all"
                                >
                                    {processing ? '⏳ Creating...' : '✅ Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
