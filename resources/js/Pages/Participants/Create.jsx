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
                    <nav className="text-sm text-neutral-600 mb-1">
                        <Link href={route('events.index')} className="hover:text-dark">Events</Link>
                        {' / '}
                        <Link href={route('events.show', category.event.id)} className="hover:text-dark">
                            {category.event.name}
                        </Link>
                        {' / '}
                        <Link href={route('events.categories.show', [category.event.id, category.id])} className="hover:text-dark">
                            {category.name}
                        </Link>
                    </nav>
                    <h2 className="text-xl font-bold font-raverist leading-tight text-dark">
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
                                <label htmlFor="player_1" className="block text-sm font-medium text-dark">
                                    Player 1 *
                                </label>
                                <input
                                    id="player_1"
                                    type="text"
                                    value={data.player_1}
                                    onChange={(e) => setData('player_1', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
                                    required
                                />
                                {errors.player_1 && <p className="mt-1 text-sm text-red-600">{errors.player_1}</p>}
                            </div>

                            <div>
                                <label htmlFor="player_2" className="block text-sm font-medium text-dark">
                                    Player 2 *
                                </label>
                                <input
                                    id="player_2"
                                    type="text"
                                    value={data.player_2}
                                    onChange={(e) => setData('player_2', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
                                    required
                                />
                                {errors.player_2 && <p className="mt-1 text-sm text-red-600">{errors.player_2}</p>}
                            </div>

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-dark">
                                    Team Name (Optional)
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-dark">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-dark">
                                    Phone
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
                                />
                                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                            </div>

                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-dark">
                                    Notes
                                </label>
                                <textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
                                />
                                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                            </div>

                            <div className="flex justify-end gap-3">
                                <Link
                                    href={route('categories.participants.index', category.id)}
                                    className="px-4 py-2 text-sm font-medium text-dark bg-white border border-neutral-300 rounded-md shadow-sm hover:bg-neutral-50"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-600 disabled:opacity-50"
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

