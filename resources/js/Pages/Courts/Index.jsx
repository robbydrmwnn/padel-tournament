import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Building2, Settings, ChevronRight, Trash2, AlertTriangle } from 'lucide-react';

export default function Index({ event, courts }) {
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [editingCourt, setEditingCourt] = useState(null);

    const { data: setupData, setData: setSetupData, post: postSetup, processing: setupProcessing } = useForm({
        number_of_courts: courts.length || 4,
    });

    const { data: editData, setData: setEditData, patch: patchEdit } = useForm({ name: '' });

    const handleSetupCourts = (e) => {
        e.preventDefault();
        postSetup(route('events.courts.setup', event.id), {
            onSuccess: () => setShowSetupModal(false),
        });
    };

    const handleUpdateCourt = (courtId) => {
        patchEdit(route('events.courts.update', [event.id, courtId]), {
            onSuccess: () => setEditingCourt(null),
        });
    };

    const handleDeleteCourt = (courtId) => {
        if (confirm('Are you sure you want to delete this court?')) {
            router.delete(route('events.courts.destroy', [event.id, courtId]));
        }
    };

    return (
        <AuthenticatedLayout header="Courts Management">
            <Head title={`Courts - ${event.name}`} />

            <div className="py-12 bg-neutral-100 min-h-screen">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 text-sm font-ffdin text-zinc-500 mb-6">
                        <Link href={route('events.index')} className="hover:text-black transition-colors">Events</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <Link href={route('events.show', event.id)} className="hover:text-black transition-colors">{event.name}</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-black font-bold">Courts</span>
                    </nav>

                    {/* Header Banner */}
                    <div className="bg-black rounded-2xl p-8 mb-8 shadow-lg border border-zinc-700">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-bold font-ffdin text-white mb-2 tracking-wide">Courts Management</h1>
                                <p className="text-xl font-ffdin text-zinc-400">{event.name}</p>
                            </div>
                            <button
                                onClick={() => setShowSetupModal(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-ffdin font-bold text-black shadow-lg hover:bg-zinc-100 transition-all hover:scale-105"
                            >
                                <Settings className="h-4 w-4" />
                                Setup Courts
                            </button>
                        </div>
                    </div>

                    {/* Setup Modal */}
                    {showSetupModal && (
                        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-zinc-200">
                                <h3 className="text-2xl font-bold font-ffdin text-black mb-4">Setup Courts</h3>
                                <div className="flex items-start gap-2 bg-zinc-50 rounded-xl p-4 mb-6 border border-zinc-200">
                                    <AlertTriangle className="h-5 w-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-base font-ffdin text-black">
                                        Creating new courts will delete all existing courts.
                                    </p>
                                </div>
                                <form onSubmit={handleSetupCourts}>
                                    <div className="mb-6">
                                        <label htmlFor="number_of_courts" className="block text-sm font-ffdin font-bold text-zinc-700 mb-2 uppercase tracking-wider">
                                            Number of Courts
                                        </label>
                                        <input
                                            id="number_of_courts"
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={setupData.number_of_courts}
                                            onChange={(e) => setSetupData('number_of_courts', e.target.value)}
                                            className="block w-full font-ffdin rounded-xl border border-zinc-300 shadow-sm focus:border-black focus:ring-black text-lg p-3"
                                            required
                                        />
                                        <p className="mt-2 text-sm font-ffdin text-zinc-500">
                                            Courts will be named 1, 2, 3... by default (editable)
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowSetupModal(false)}
                                            className="flex-1 px-6 py-3 text-sm font-ffdin font-bold text-black bg-white border border-zinc-300 rounded-xl hover:bg-zinc-50 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={setupProcessing}
                                            className="flex-1 px-6 py-3 text-sm font-ffdin font-bold text-white bg-black rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-all"
                                        >
                                            {setupProcessing ? 'Creating...' : 'Create Courts'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Courts List */}
                    {courts.length === 0 ? (
                        <div className="bg-white rounded-2xl p-16 text-center shadow-lg border border-zinc-200">
                            <Building2 className="h-16 w-16 mx-auto mb-6 text-zinc-300" />
                            <h3 className="text-3xl font-bold font-ffdin text-black mb-4">No Courts Set Up</h3>
                            <p className="text-xl font-ffdin text-zinc-500 mb-8">Set up courts to start organizing matches!</p>
                            <button
                                onClick={() => setShowSetupModal(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-black px-8 py-4 text-lg font-ffdin font-bold text-white shadow-lg hover:bg-zinc-800 transition-all"
                            >
                                <Settings className="h-5 w-5" />
                                Setup Courts Now
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-zinc-200">
                            <h3 className="text-2xl font-bold font-ffdin text-black mb-6">
                                All Courts ({courts.length})
                            </h3>
                            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {courts.map((court) => (
                                    <div key={court.id} className="bg-zinc-50 rounded-xl p-6 border border-zinc-200 hover:border-black transition-all group">
                                        <div className="text-center mb-3">
                                            <Building2 className="h-10 w-10 mx-auto mb-3 text-zinc-400" />
                                            <p className="text-xs font-ffdin font-bold text-zinc-500 mb-2 uppercase tracking-wider">Court</p>
                                        </div>

                                        {editingCourt === court.id ? (
                                            <input
                                                type="text"
                                                value={editData.name}
                                                onChange={(e) => setEditData('name', e.target.value)}
                                                onBlur={() => handleUpdateCourt(court.id)}
                                                onKeyPress={(e) => { if (e.key === 'Enter') handleUpdateCourt(court.id); }}
                                                className="text-3xl font-bold font-ffdin text-center text-black border border-zinc-300 rounded-xl px-3 py-2 w-full"
                                                autoFocus
                                            />
                                        ) : (
                                            <h3
                                                className="text-3xl font-bold font-ffdin text-center text-black cursor-pointer hover:text-zinc-600 transition-colors mb-2"
                                                onClick={() => { setEditingCourt(court.id); setEditData('name', court.name); }}
                                            >
                                                {court.name}
                                            </h3>
                                        )}

                                        <p className="text-xs font-ffdin text-center text-zinc-400 mb-3">
                                            Click to edit name
                                        </p>

                                        <button
                                            onClick={() => handleDeleteCourt(court.id)}
                                            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-ffdin font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" /> Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
