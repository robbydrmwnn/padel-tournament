import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ category, participant }) {
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
                            {participant.player_1} - {participant.player_2}
                        </h2>
                    </div>
                    <Link
                        href={route('categories.participants.edit', [category.id, participant.id])}
                        className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        Edit
                    </Link>
                </div>
            }
        >
            <Head title={participant.name} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Participant Details</h3>
                            
                            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Player 1</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{participant.player_1}</dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Player 2</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{participant.player_2}</dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Team Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {participant.name || 'Not provided'}
                                    </dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {participant.email || 'Not provided'}
                                    </dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {participant.phone || 'Not provided'}
                                    </dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Group Assignment</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {participant.groups && participant.groups.length > 0
                                            ? participant.groups.map(g => g.name).join(', ')
                                            : 'Not assigned to any group'}
                                    </dd>
                                </div>
                                
                                {participant.notes && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Notes</dt>
                                        <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                                            {participant.notes}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

