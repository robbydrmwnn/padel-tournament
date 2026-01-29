import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ category, participants }) {
    const { flash } = usePage().props;
    const [showImport, setShowImport] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null,
    });

    const handleFileChange = (e) => {
        setData('file', e.target.files[0]);
    };

    const handleImport = (e) => {
        e.preventDefault();
        post(route('categories.participants.import', category.id), {
            onSuccess: () => {
                reset();
                setShowImport(false);
            },
        });
    };

    return (
        <AuthenticatedLayout header="Participants">
            <Head title={`Participants - ${category.name}`} />

            <div className="py-12 bg-dark min-h-screen">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-6">
                    {/* Breadcrumb */}
                    <nav className="text-sm font-gotham text-neutral-400">
                        <Link href={route('events.index')} className="hover:text-white transition-colors">Events</Link>
                        {' / '}
                        <Link href={route('events.show', category.event.id)} className="hover:text-white transition-colors">
                            {category.event.name}
                        </Link>
                        {' / '}
                        <Link href={route('events.categories.show', [category.event.id, category.id])} className="hover:text-white transition-colors">
                            {category.name}
                        </Link>
                        {' / '}
                        <span className="text-white font-bold">Participants</span>
                    </nav>

                    {/* Header Banner */}
                    <div className="bg-success rounded-2xl p-8 shadow-lg border-4 border-accent">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-bold font-raverist text-white mb-2">Participants</h1>
                                <p className="text-xl font-gotham text-neutral-200">{category.name}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowImport(!showImport)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-gotham font-bold text-white shadow-lg hover:bg-primary-600 transition-all border-2 border-dark"
                                >
                                    <span className="text-xl">{showImport ? '✖️' : '📊'}</span>
                                    {showImport ? 'Hide Import' : 'Import Excel'}
                                </button>
                                <Link
                                    href={route('categories.participants.create', category.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-gotham font-bold text-primary shadow-lg hover:bg-neutral-100 transition-all border-2 border-accent"
                                >
                                    <span className="text-xl">➕</span>
                                    Add Participant
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="bg-success rounded-xl border-4 border-success-700 text-white px-6 py-4 font-gotham font-bold shadow-lg">
                            ✅ {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="bg-red-600 rounded-xl border-4 border-red-800 text-white px-6 py-4 font-gotham font-bold shadow-lg">
                            ❌ {flash.error}
                        </div>
                    )}
                    {flash?.warning && (
                        <div className="bg-accent rounded-xl border-4 border-accent-700 text-dark px-6 py-4 font-gotham font-bold shadow-lg">
                            ⚠️ {flash.warning}
                        </div>
                    )}

                    {/* Import Section */}
                    {showImport && (
                        <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-success">
                            <h3 className="text-2xl font-bold font-raverist text-success mb-6 flex items-center gap-3">
                                <span className="text-3xl">📊</span>
                                Import Participants from Excel
                            </h3>
                            
                            <div className="mb-6 bg-primary-100 rounded-xl p-6 border-2 border-primary">
                                <p className="text-base font-gotham font-bold text-primary mb-3">
                                    📋 Instructions:
                                </p>
                                <ol className="text-base font-gotham text-dark list-decimal list-inside space-y-2 mb-4">
                                    <li>Download the Excel template below</li>
                                    <li>Fill in participant details (player_1 and player_2 are required)</li>
                                    <li>Optional: Specify a group name - groups will be created automatically if they don't exist</li>
                                    <li>Save and upload the file</li>
                                </ol>
                                <a
                                    href={route('categories.participants.template', category.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-gotham font-bold text-white shadow-lg hover:bg-primary-600 transition-all border-2 border-dark"
                                >
                                    <span className="text-xl">📥</span>
                                    Download Excel Template
                                </a>
                            </div>

                            <form onSubmit={handleImport} className="space-y-4">
                                <div>
                                    <label htmlFor="file" className="block text-base font-gotham font-bold text-dark mb-3">
                                        Upload Excel File
                                    </label>
                                    <input
                                        id="file"
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileChange}
                                        className="block w-full text-base font-gotham text-dark
                                            file:mr-4 file:py-3 file:px-6
                                            file:rounded-xl file:border-2 file:border-dark
                                            file:text-sm file:font-gotham file:font-bold
                                            file:bg-neutral-100 file:text-dark
                                            hover:file:bg-neutral-200 file:transition-all"
                                        required
                                    />
                                    {errors.file && (
                                        <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.file}</p>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={processing || !data.file}
                                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-gotham font-bold text-white shadow-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-dark"
                                    >
                                        <span className="text-xl">⬆️</span>
                                        {processing ? 'Importing...' : 'Import Participants'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowImport(false);
                                            reset();
                                        }}
                                        className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-gotham font-bold text-dark shadow-lg hover:bg-neutral-100 transition-all border-2 border-neutral-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Participants List */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-primary">
                        {participants.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-8xl mb-6">👥</div>
                                <h3 className="text-3xl font-bold font-raverist text-dark mb-4">No Participants Yet</h3>
                                <p className="text-xl font-gotham text-neutral-600 mb-8">Add your first participant to get started!</p>
                                <Link
                                    href={route('categories.participants.create', category.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-gotham font-bold text-white shadow-lg hover:bg-primary-600 transition-all border-4 border-dark"
                                >
                                    <span className="text-2xl">➕</span>
                                    Add First Participant
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold font-raverist text-primary mb-6">
                                    All Participants ({participants.length})
                                </h3>
                                
                                <div className="grid gap-4">
                                    {participants.map((participant) => (
                                        <div
                                            key={participant.id}
                                            className="bg-neutral-100 rounded-xl p-6 border-2 border-neutral-300 hover:border-primary transition-all"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-4 mb-3">
                                                        <div className="text-4xl">👤👤</div>
                                                        <div>
                                                            <h4 className="text-xl font-bold font-raverist text-primary mb-1">
                                                                {participant.player_1} - {participant.player_2}
                                                            </h4>
                                                            {participant.name && (
                                                                <p className="text-base font-gotham text-neutral-600">Team: {participant.name}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                                        {participant.email && (
                                                            <div className="bg-white rounded-lg p-3 border-2 border-neutral-300">
                                                                <p className="text-xs font-gotham font-bold text-neutral-600 mb-1">📧 EMAIL</p>
                                                                <p className="text-sm font-gotham text-dark">{participant.email}</p>
                                                            </div>
                                                        )}
                                                        {participant.phone && (
                                                            <div className="bg-white rounded-lg p-3 border-2 border-neutral-300">
                                                                <p className="text-xs font-gotham font-bold text-neutral-600 mb-1">📱 PHONE</p>
                                                                <p className="text-sm font-gotham text-dark">{participant.phone}</p>
                                                            </div>
                                                        )}
                                                        <div className="bg-white rounded-lg p-3 border-2 border-neutral-300">
                                                            <p className="text-xs font-gotham font-bold text-neutral-600 mb-1">🏆 GROUP</p>
                                                            <p className="text-sm font-gotham text-dark">
                                                                {participant.groups && participant.groups.length > 0
                                                                    ? participant.groups.map(g => g.name).join(', ')
                                                                    : 'Not assigned'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex gap-2 ml-4">
                                                    <Link
                                                        href={route('categories.participants.show', [category.id, participant.id])}
                                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-gotham font-bold text-white bg-primary rounded-xl hover:bg-primary-600 transition-all border-2 border-dark"
                                                    >
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={route('categories.participants.edit', [category.id, participant.id])}
                                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-gotham font-bold text-dark bg-white rounded-xl hover:bg-neutral-100 transition-all border-2 border-neutral-400"
                                                    >
                                                        Edit
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
