import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ event, category }) {
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
                            {category.name}
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={route('categories.participants.index', category.id)}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                        >
                            Manage Participants
                        </Link>
                        <Link
                            href={route('categories.groups.index', category.id)}
                            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                        >
                            Manage Groups
                        </Link>
                        <Link
                            href={route('categories.matches.index', category.id)}
                            className="inline-flex items-center rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500"
                        >
                            Manage Matches
                        </Link>
                        <Link
                            href={route('events.categories.edit', [event.id, category.id])}
                            className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            Edit
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={category.name} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Category Details */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Details</h3>
                            
                            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {category.description || 'No description provided'}
                                    </dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Maximum Participants</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {category.max_participants || 'Unlimited'}
                                    </dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Current Participants</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {category.participants?.length || 0}
                                    </dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Groups</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {category.groups?.length || 0}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Groups */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Groups</h3>
                                <Link
                                    href={route('categories.groups.index', category.id)}
                                    className="text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                    Manage Groups →
                                </Link>
                            </div>
                            
                            {category.groups && category.groups.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {category.groups.map((group) => (
                                        <div
                                            key={group.id}
                                            className="border border-gray-200 rounded-lg p-4"
                                        >
                                            <h4 className="text-base font-semibold text-gray-900 mb-2">
                                                {group.name}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {group.participants?.length || 0} participants
                                            </p>
                                            {group.participants && group.participants.length > 0 && (
                                                <ul className="mt-2 space-y-1">
                                                    {group.participants.map((participant) => (
                                                        <li key={participant.id} className="text-sm text-gray-600">
                                                            • {participant.player_1} - {participant.player_2}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">
                                    No groups set up yet. Create groups to organize participants!
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Participants */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Participants</h3>
                                <Link
                                    href={route('categories.participants.create', category.id)}
                                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                                >
                                    Add Participant
                                </Link>
                            </div>
                            
                            {category.participants && category.participants.length > 0 ? (
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
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {category.participants.map((participant) => (
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
                                                        <Link
                                                            href={route('categories.participants.edit', [category.id, participant.id])}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Edit
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">
                                    No participants yet. Add participants to get started!
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

