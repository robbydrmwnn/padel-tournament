import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Users, Plus, FileDown, Upload, ChevronRight, CheckCircle, XCircle, AlertTriangle, Mail, Phone, Trophy, Trash2 } from 'lucide-react';

export default function Index({ category, participants }) {
    const { flash } = usePage().props;
    const [showImport, setShowImport] = useState(false);
    const isIndividual = category.participant_mode === 'individual';
    const { data, setData, post, processing, errors, reset } = useForm({ file: null });

    const handleFileChange = (e) => setData('file', e.target.files[0]);

    const handleImport = (e) => {
        e.preventDefault();
        post(route('categories.participants.import', category.id), {
            onSuccess: () => { reset(); setShowImport(false); },
        });
    };

    return (
        <AuthenticatedLayout header="Participants">
            <Head title={`Participants - ${category.name}`} />

            <div className="py-12 bg-neutral-100 min-h-screen">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-6">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 text-sm font-ffdin text-zinc-500">
                        <Link href={route('events.index')} className="hover:text-black transition-colors">Events</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <Link href={route('events.show', category.event.id)} className="hover:text-black transition-colors">{category.event.name}</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <Link href={route('events.categories.show', [category.event.id, category.id])} className="hover:text-black transition-colors">{category.name}</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-black font-bold">Participants</span>
                    </nav>

                    {/* Header Banner */}
                    <div className="bg-black rounded-2xl p-8 shadow-lg border border-zinc-700">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div>
                                <h1 className="text-4xl font-bold font-ffdin text-white mb-2 tracking-wide">Participants</h1>
                                <p className="text-xl font-ffdin text-zinc-400">{category.name}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowImport(!showImport)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-700 px-5 py-3 text-sm font-ffdin font-bold text-white shadow-lg hover:bg-zinc-600 transition-all border border-zinc-600"
                                >
                                    <Upload className="h-4 w-4" />
                                    {showImport ? 'Hide Import' : 'Import Excel'}
                                </button>
                                <Link
                                    href={route('categories.participants.create', category.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-ffdin font-bold text-black shadow-lg hover:bg-zinc-100 transition-all"
                                >
                                    <Plus className="h-4 w-4" />
                                    {isIndividual ? 'Add Player' : 'Add Participant'}
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="flex items-center gap-2 bg-zinc-900 rounded-xl border border-zinc-700 text-white px-6 py-4 font-ffdin font-bold shadow-lg">
                            <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" /> {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="flex items-center gap-2 bg-red-600 rounded-xl border border-red-800 text-white px-6 py-4 font-ffdin font-bold shadow-lg">
                            <XCircle className="h-5 w-5 flex-shrink-0" /> {flash.error}
                        </div>
                    )}
                    {flash?.warning && (
                        <div className="flex items-center gap-2 bg-accent rounded-xl border border-accent-600 text-black px-6 py-4 font-ffdin font-bold shadow-lg">
                            <AlertTriangle className="h-5 w-5 flex-shrink-0" /> {flash.warning}
                        </div>
                    )}

                    {/* Import Section */}
                    {showImport && (
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-zinc-200">
                            <h3 className="flex items-center gap-3 text-2xl font-bold font-ffdin text-black mb-6">
                                <Upload className="h-6 w-6 text-zinc-400" />
                                Import Participants from Excel
                            </h3>

                            <div className="mb-6 bg-zinc-50 rounded-xl p-6 border border-zinc-200">
                                <p className="text-base font-ffdin font-bold text-black mb-3">Instructions:</p>
                                <ol className="text-base font-ffdin text-zinc-700 list-decimal list-inside space-y-2 mb-4">
                                    <li>Download the Excel template below</li>
                                    <li>Fill in participant details ({isIndividual ? 'player_1 is required' : 'player_1 and player_2 are required'})</li>
                                    <li>Optional: Specify a group name — groups will be created automatically</li>
                                    <li>Save and upload the file</li>
                                </ol>
                                <a
                                    href={route('categories.participants.template', category.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-ffdin font-bold text-white shadow hover:bg-zinc-800 transition-all"
                                >
                                    <FileDown className="h-4 w-4" />
                                    Download Excel Template
                                </a>
                            </div>

                            <form onSubmit={handleImport} className="space-y-4">
                                <div>
                                    <label htmlFor="file" className="block text-sm font-ffdin font-bold text-zinc-700 mb-3 uppercase tracking-wider">
                                        Upload Excel File
                                    </label>
                                    <input
                                        id="file"
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileChange}
                                        className="block w-full text-base font-ffdin text-black
                                            file:mr-4 file:py-3 file:px-6
                                            file:rounded-xl file:border file:border-zinc-300
                                            file:text-sm file:font-ffdin file:font-bold
                                            file:bg-zinc-100 file:text-black
                                            hover:file:bg-zinc-200 file:transition-all"
                                        required
                                    />
                                    {errors.file && <p className="mt-2 text-sm font-ffdin font-bold text-red-600">{errors.file}</p>}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={processing || !data.file}
                                        className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-ffdin font-bold text-white shadow hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Upload className="h-4 w-4" />
                                        {processing ? 'Importing...' : 'Import Participants'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowImport(false); reset(); }}
                                        className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-ffdin font-bold text-black shadow hover:bg-zinc-50 transition-all border border-zinc-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Participants List */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-zinc-200">
                        {participants.length === 0 ? (
                            <div className="text-center py-16">
                                <Users className="h-16 w-16 mx-auto mb-6 text-zinc-300" />
                                <h3 className="text-3xl font-bold font-ffdin text-black mb-4">No Participants Yet</h3>
                                <p className="text-xl font-ffdin text-zinc-500 mb-8">Add your first participant to get started!</p>
                                <Link
                                    href={route('categories.participants.create', category.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-black px-8 py-4 text-lg font-ffdin font-bold text-white shadow-lg hover:bg-zinc-800 transition-all"
                                >
                                    <Plus className="h-5 w-5" />
                                    {isIndividual ? 'Add First Player' : 'Add First Participant'}
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold font-ffdin text-black mb-6">
                                    All Participants ({participants.length})
                                </h3>

                                <div className="grid gap-4">
                                    {participants.map((participant) => (
                                        <div
                                            key={participant.id}
                                            className="bg-zinc-50 rounded-xl p-6 border border-zinc-200 hover:border-black transition-all"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-4 mb-3">
                                                        <Users className="h-8 w-8 text-zinc-400 flex-shrink-0" />
                                                        <div>
                                                            <h4 className="text-xl font-bold font-ffdin text-black mb-1">
                                                                {isIndividual ? participant.player_1 : `${participant.player_1} — ${participant.player_2}`}
                                                            </h4>
                                                            {!isIndividual && participant.name && (
                                                                <p className="text-base font-ffdin text-zinc-500">Team: {participant.name}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                                        {participant.email && (
                                                            <div className="bg-white rounded-lg p-3 border border-zinc-200">
                                                                <p className="flex items-center gap-1 text-xs font-ffdin font-bold text-zinc-500 mb-1 uppercase tracking-wider">
                                                                    <Mail className="h-3 w-3" /> Email
                                                                </p>
                                                                <p className="text-sm font-ffdin text-black">{participant.email}</p>
                                                            </div>
                                                        )}
                                                        {participant.phone && (
                                                            <div className="bg-white rounded-lg p-3 border border-zinc-200">
                                                                <p className="flex items-center gap-1 text-xs font-ffdin font-bold text-zinc-500 mb-1 uppercase tracking-wider">
                                                                    <Phone className="h-3 w-3" /> Phone
                                                                </p>
                                                                <p className="text-sm font-ffdin text-black">{participant.phone}</p>
                                                            </div>
                                                        )}
                                                        <div className="bg-white rounded-lg p-3 border border-zinc-200">
                                                            <p className="flex items-center gap-1 text-xs font-ffdin font-bold text-zinc-500 mb-1 uppercase tracking-wider">
                                                                <Trophy className="h-3 w-3" /> Group
                                                            </p>
                                                            <p className="text-sm font-ffdin text-black">
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
                                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-ffdin font-bold text-white bg-black rounded-xl hover:bg-zinc-800 transition-all"
                                                    >
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={route('categories.participants.edit', [category.id, participant.id])}
                                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-ffdin font-bold text-black bg-white rounded-xl hover:bg-zinc-100 transition-all border border-zinc-300"
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
