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
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <nav className="text-sm text-gray-500 mb-1">
                            <Link href={route('events.index')} className="hover:text-gray-700">Events</Link>
                            {' / '}
                            <Link href={route('events.show', category.event.id)} className="hover:text-gray-700">
                                {category.event.name}
                            </Link>
                            {' / '}
                            <Link href={route('events.categories.show', [category.event.id, category.id])} className="hover:text-gray-700">
                                {category.name}
                            </Link>
                        </nav>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Participants
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowImport(!showImport)}
                            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                        >
                            {showImport ? 'Hide' : 'Import Excel'}
                        </button>
                        <Link
                            href={route('categories.participants.create', category.id)}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                        >
                            Add Participant
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Participants - ${category.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded relative">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative">
                            {flash.error}
                        </div>
                    )}
                    {flash?.warning && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative">
                            {flash.warning}
                        </div>
                    )}

                    {/* Import Section */}
                    {showImport && (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Participants from Excel</h3>
                                
                                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800 mb-2">
                                        <strong>Instructions:</strong>
                                    </p>
                                    <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                                        <li>Download the Excel template below</li>
                                        <li>Fill in participant details (player_1 and player_2 are required)</li>
                                        <li>Save and upload the file</li>
                                    </ol>
                                    <div className="mt-3">
                                        <a
                                            href={route('categories.participants.template', category.id)}
                                            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                                        >
                                            📥 Download Excel Template
                                        </a>
                                    </div>
                                </div>

                                <form onSubmit={handleImport} className="space-y-4">
                                    <div>
                                        <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                                            Upload Excel File
                                        </label>
                                        <input
                                            id="file"
                                            type="file"
                                            accept=".xlsx,.xls,.csv"
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-md file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-indigo-50 file:text-indigo-700
                                                hover:file:bg-indigo-100"
                                            required
                                        />
                                        {errors.file && (
                                            <p className="mt-1 text-sm text-red-600">{errors.file}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            disabled={processing || !data.file}
                                            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processing ? 'Importing...' : 'Import Participants'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowImport(false);
                                                reset();
                                            }}
                                            className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Participants Table */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {participants.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">No participants found. Add your first participant!</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Players
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Team Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Phone
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Group
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {participants.map((participant) => (
                                                <tr key={participant.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {participant.player_1} - {participant.player_2}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {participant.name || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {participant.email || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {participant.phone || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {participant.groups && participant.groups.length > 0
                                                            ? participant.groups.map(g => g.name).join(', ')
                                                            : 'Not assigned'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <Link
                                                            href={route('categories.participants.edit', [category.id, participant.id])}
                                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <Link
                                                            href={route('categories.participants.show', [category.id, participant.id])}
                                                            className="text-gray-600 hover:text-gray-900"
                                                        >
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

