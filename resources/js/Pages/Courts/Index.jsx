import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ event, courts }) {
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [editingCourt, setEditingCourt] = useState(null);
    
    const { data: setupData, setData: setSetupData, post: postSetup, processing: setupProcessing } = useForm({
        number_of_courts: courts.length || 4,
    });

    const { data: editData, setData: setEditData, patch: patchEdit } = useForm({
        name: '',
    });

    const handleSetupCourts = (e) => {
        e.preventDefault();
        postSetup(route('events.courts.setup', event.id), {
            onSuccess: () => {
                setShowSetupModal(false);
            },
        });
    };

    const handleUpdateCourt = (courtId) => {
        patchEdit(route('events.courts.update', [event.id, courtId]), {
            onSuccess: () => {
                setEditingCourt(null);
            },
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

            <div className="py-12 bg-dark min-h-screen">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="text-sm font-gotham text-neutral-400 mb-6">
                        <Link href={route('events.index')} className="hover:text-white transition-colors">Events</Link>
                        {' / '}
                        <Link href={route('events.show', event.id)} className="hover:text-white transition-colors">{event.name}</Link>
                        {' / '}
                        <span className="text-white font-bold">Courts</span>
                    </nav>

                    {/* Header Banner */}
                    <div className="bg-success rounded-2xl p-8 mb-8 shadow-lg border-4 border-accent">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-bold font-raverist text-white mb-2">Courts Management</h1>
                                <p className="text-xl font-gotham text-white">{event.name}</p>
                            </div>
                            <button
                                onClick={() => setShowSetupModal(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-lg font-gotham font-bold text-success shadow-lg hover:bg-neutral-100 transition-all border-2 border-accent hover:scale-105"
                            >
                                <span className="text-2xl">⚙️</span>
                                Setup Courts
                            </button>
                        </div>
                    </div>

                    {/* Setup Modal */}
                    {showSetupModal && (
                        <div className="fixed inset-0 bg-dark bg-opacity-90 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border-4 border-success">
                                <h3 className="text-2xl font-bold font-raverist text-success mb-4">Setup Courts</h3>
                                <div className="bg-accent-100 rounded-xl p-4 mb-6 border-2 border-accent">
                                    <p className="text-base font-gotham text-dark">
                                        ⚠️ Creating new courts will delete all existing courts.
                                    </p>
                                </div>
                                <form onSubmit={handleSetupCourts}>
                                    <div className="mb-6">
                                        <label htmlFor="number_of_courts" className="block text-base font-gotham font-bold text-dark mb-2">
                                            Number of Courts
                                        </label>
                                        <input
                                            id="number_of_courts"
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={setupData.number_of_courts}
                                            onChange={(e) => setSetupData('number_of_courts', e.target.value)}
                                            className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-success focus:ring-success text-lg p-3"
                                            required
                                        />
                                        <p className="mt-2 text-sm font-gotham text-neutral-600">
                                            Courts will be named 1, 2, 3... by default (editable)
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowSetupModal(false)}
                                            className="flex-1 px-6 py-3 text-sm font-gotham font-bold text-dark bg-white border-2 border-neutral-400 rounded-xl hover:bg-neutral-100 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={setupProcessing}
                                            className="flex-1 px-6 py-3 text-sm font-gotham font-bold text-white bg-success rounded-xl hover:bg-success-600 disabled:opacity-50 transition-all border-2 border-dark"
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
                        <div className="bg-white rounded-2xl p-16 text-center shadow-lg border-4 border-success">
                            <div className="text-8xl mb-6">🏟️</div>
                            <h3 className="text-3xl font-bold font-raverist text-dark mb-4">No Courts Set Up</h3>
                            <p className="text-xl font-gotham text-neutral-600 mb-8">Set up courts to start organizing matches!</p>
                            <button
                                onClick={() => setShowSetupModal(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-success px-8 py-4 text-lg font-gotham font-bold text-white shadow-lg hover:bg-success-600 transition-all border-4 border-dark"
                            >
                                <span className="text-2xl">⚙️</span>
                                Setup Courts Now
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-success">
                            <h3 className="text-2xl font-bold font-raverist text-success mb-6">
                                All Courts ({courts.length})
                            </h3>
                            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {courts.map((court) => (
                                    <div key={court.id} className="bg-neutral-100 rounded-xl p-6 border-2 border-success hover:border-primary transition-all group">
                                        <div className="text-center mb-3">
                                            <div className="text-5xl mb-3">🎾</div>
                                            <p className="text-sm font-gotham font-bold text-neutral-600 mb-2">COURT</p>
                                        </div>
                                        
                                        {editingCourt === court.id ? (
                                            <input
                                                type="text"
                                                value={editData.name}
                                                onChange={(e) => setEditData('name', e.target.value)}
                                                onBlur={() => handleUpdateCourt(court.id)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleUpdateCourt(court.id);
                                                    }
                                                }}
                                                className="text-3xl font-bold font-raverist text-center text-success border-2 border-success rounded-xl px-3 py-2 w-full"
                                                autoFocus
                                            />
                                        ) : (
                                            <h3
                                                className="text-3xl font-bold font-raverist text-center text-success cursor-pointer hover:text-primary transition-colors mb-2"
                                                onClick={() => {
                                                    setEditingCourt(court.id);
                                                    setEditData('name', court.name);
                                                }}
                                            >
                                                {court.name}
                                            </h3>
                                        )}
                                        
                                        <p className="text-xs font-gotham text-center text-neutral-600 mb-3">
                                            Click to edit name
                                        </p>
                                        
                                        <button
                                            onClick={() => handleDeleteCourt(court.id)}
                                            className="w-full px-4 py-2 text-sm font-gotham font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all border-2 border-dark"
                                        >
                                            🗑️ Delete
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
