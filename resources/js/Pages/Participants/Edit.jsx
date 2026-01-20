import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ category, participant }) {
    const { data, setData, patch, delete: destroy, processing, errors } = useForm({
        name: participant.name || '',
        player_1: participant.player_1,
        player_2: participant.player_2,
        email: participant.email || '',
        phone: participant.phone || '',
        notes: participant.notes || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('categories.participants.update', [category.id, participant.id]));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this participant?')) {
            destroy(route('categories.participants.destroy', [category.id, participant.id]));
        }
    };

    return (
        <AuthenticatedLayout header="Edit Participant">
            <Head title="Edit Participant" />

            <div className="py-12 bg-dark min-h-screen">
                <div className="mx-auto max-w-3xl px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="text-sm font-gotham text-neutral-400 mb-6">
                        <Link href={route('events.index')} className="hover:text-white transition-colors">Events</Link>
                        {' / '}
                        <Link href={route('events.show', category.event.id)} className="hover:text-white transition-colors">{category.event.name}</Link>
                        {' / '}
                        <Link href={route('events.categories.show', [category.event.id, category.id])} className="hover:text-white transition-colors">{category.name}</Link>
                        {' / '}
                        <span className="text-white font-bold">Edit Participant</span>
                    </nav>

                    {/* Header Banner */}
                    <div className="bg-success rounded-2xl p-8 mb-8 shadow-lg border-4 border-accent">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">✏️</div>
                            <div>
                                <h1 className="text-3xl font-bold font-raverist text-white mb-1">Edit Participant</h1>
                                <p className="text-lg font-gotham text-neutral-200">Update participant details for {category.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-primary">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label htmlFor="player_1" className="block text-base font-gotham font-bold text-dark mb-2">
                                    🎾 Player 1 *
                                </label>
                                <input
                                    id="player_1"
                                    type="text"
                                    value={data.player_1}
                                    onChange={(e) => setData('player_1', e.target.value)}
                                    className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                    placeholder="Enter first player name..."
                                    required
                                />
                                {errors.player_1 && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.player_1}</p>}
                            </div>

                            <div>
                                <label htmlFor="player_2" className="block text-base font-gotham font-bold text-dark mb-2">
                                    🎾 Player 2 *
                                </label>
                                <input
                                    id="player_2"
                                    type="text"
                                    value={data.player_2}
                                    onChange={(e) => setData('player_2', e.target.value)}
                                    className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                    placeholder="Enter second player name..."
                                    required
                                />
                                {errors.player_2 && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.player_2}</p>}
                            </div>

                            <div>
                                <label htmlFor="name" className="block text-base font-gotham font-bold text-dark mb-2">
                                    🏆 Team Name (Optional)
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                    placeholder="Enter team name (optional)..."
                                />
                                {errors.name && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="email" className="block text-base font-gotham font-bold text-dark mb-2">
                                        📧 Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                        placeholder="email@example.com"
                                    />
                                    {errors.email && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.email}</p>}
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-base font-gotham font-bold text-dark mb-2">
                                        📱 Phone
                                    </label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                        placeholder="+1 234 567 8900"
                                    />
                                    {errors.phone && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.phone}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="notes" className="block text-base font-gotham font-bold text-dark mb-2">
                                    📝 Notes
                                </label>
                                <textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={4}
                                    className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                    placeholder="Any additional notes..."
                                />
                                {errors.notes && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.notes}</p>}
                            </div>

                            <div className="flex flex-col gap-4 pt-4">
                                <div className="flex gap-4">
                                    <Link
                                        href={route('categories.participants.index', category.id)}
                                        className="flex-1 text-center px-6 py-3 text-base font-gotham font-bold text-dark bg-white border-2 border-neutral-400 rounded-xl shadow-lg hover:bg-neutral-100 transition-all"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 px-6 py-3 text-base font-gotham font-bold text-white bg-success border-2 border-dark rounded-xl shadow-lg hover:bg-success-600 disabled:opacity-50 transition-all"
                                    >
                                        {processing ? '⏳ Updating...' : '✅ Update Participant'}
                                    </button>
                                </div>
                                
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="w-full px-6 py-3 text-base font-gotham font-bold text-white bg-red-600 border-2 border-dark rounded-xl shadow-lg hover:bg-red-700 transition-all"
                                >
                                    🗑️ Delete Participant
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

