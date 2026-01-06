import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ category }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        player_1: '',
        player_2: '',
        email: '',
        phone: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('categories.participants.store', category.id));
    };

    return (
        <AuthenticatedLayout
            header={
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
                        Add Participant
                    </h2>
                </div>
            }
        >
            <Head title="Add Participant" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 space-y-6">
                            <div>
                                <label htmlFor="player_1" className="block text-sm font-medium text-gray-700">
                                    Player 1 *
                                </label>
                                <input
                                    id="player_1"
                                    type="text"
                                    value={data.player_1}
                                    onChange={(e) => setData('player_1', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                                {errors.player_1 && <p className="mt-1 text-sm text-red-600">{errors.player_1}</p>}
                            </div>

                            <div>
                                <label htmlFor="player_2" className="block text-sm font-medium text-gray-700">
                                    Player 2 *
                                </label>
                                <input
                                    id="player_2"
                                    type="text"
                                    value={data.player_2}
                                    onChange={(e) => setData('player_2', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                                {errors.player_2 && <p className="mt-1 text-sm text-red-600">{errors.player_2}</p>}
                            </div>

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Team Name (Optional)
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Phone
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                            </div>

                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                    Notes
                                </label>
                                <textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                            </div>

                            <div className="flex justify-end gap-3">
                                <Link
                                    href={route('categories.participants.index', category.id)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Add Participant
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

