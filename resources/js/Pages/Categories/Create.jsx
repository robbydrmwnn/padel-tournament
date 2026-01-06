import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ event }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        max_participants: '',
        teams_advance_per_group: 2,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('events.categories.store', event.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <nav className="text-sm text-gray-500 mb-1">
                        <Link href={route('events.index')} className="hover:text-gray-700">Events</Link>
                        {' / '}
                        <Link href={route('events.show', event.id)} className="hover:text-gray-700">{event.name}</Link>
                    </nav>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Create Category
                    </h2>
                </div>
            }
        >
            <Head title="Create Category" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Category Name *
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            </div>

                            <div>
                                <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700">
                                    Maximum Participants
                                </label>
                                <input
                                    id="max_participants"
                                    type="number"
                                    min="1"
                                    value={data.max_participants}
                                    onChange={(e) => setData('max_participants', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.max_participants && <p className="mt-1 text-sm text-red-600">{errors.max_participants}</p>}
                            </div>

                            <div>
                                <label htmlFor="teams_advance_per_group" className="block text-sm font-medium text-gray-700">
                                    Teams Advancing Per Group *
                                </label>
                                <input
                                    id="teams_advance_per_group"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={data.teams_advance_per_group}
                                    onChange={(e) => setData('teams_advance_per_group', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Number of teams that will advance from each group to the knockout stage
                                </p>
                                {errors.teams_advance_per_group && <p className="mt-1 text-sm text-red-600">{errors.teams_advance_per_group}</p>}
                            </div>

                            <div className="flex justify-end gap-3">
                                <Link
                                    href={route('events.categories.index', event.id)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Create Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

