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
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <nav className="text-sm text-gray-500 mb-1">
                            <Link href={route('events.index')} className="hover:text-gray-700">Events</Link>
                            {' / '}
                            <Link href={route('events.show', event.id)} className="hover:text-gray-700">{event.name}</Link>
                        </nav>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Courts Management
                        </h2>
                    </div>
                    <button
                        onClick={() => setShowSetupModal(true)}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        Setup Courts
                    </button>
                </div>
            }
        >
            <Head title={`Courts - ${event.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Setup Modal */}
                    {showSetupModal && (
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                                <h3 className="text-lg font-semibold mb-4">Setup Courts</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Creating new courts will delete all existing courts.
                                </p>
                                <form onSubmit={handleSetupCourts}>
                                    <div className="mb-4">
                                        <label htmlFor="number_of_courts" className="block text-sm font-medium text-gray-700">
                                            Number of Courts
                                        </label>
                                        <input
                                            id="number_of_courts"
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={setupData.number_of_courts}
                                            onChange={(e) => setSetupData('number_of_courts', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Courts will be named 1, 2, 3... by default (editable)
                                        </p>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowSetupModal(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={setupProcessing}
                                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            Create Courts
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Courts List */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {courts.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 mb-4">No courts set up yet.</p>
                                    <button
                                        onClick={() => setShowSetupModal(true)}
                                        className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                                    >
                                        Setup Courts
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                                    {courts.map((court) => (
                                        <div key={court.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-500">Court</span>
                                                <button
                                                    onClick={() => handleDeleteCourt(court.id)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    Delete
                                                </button>
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
                                                    className="text-2xl font-bold text-center text-gray-900 border-gray-300 rounded px-2 py-1 w-full"
                                                    autoFocus
                                                />
                                            ) : (
                                                <h3
                                                    className="text-2xl font-bold text-center text-gray-900 cursor-pointer hover:text-indigo-600"
                                                    onClick={() => {
                                                        setEditingCourt(court.id);
                                                        setEditData('name', court.name);
                                                    }}
                                                >
                                                    {court.name}
                                                </h3>
                                            )}
                                            <p className="text-xs text-center text-gray-500 mt-2">
                                                Click to edit name
                                            </p>
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


