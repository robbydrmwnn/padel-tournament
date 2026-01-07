import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ event, category }) {
    const { data, setData, patch, delete: destroy, processing, errors } = useForm({
        name: category.name,
        description: category.description || '',
        max_participants: category.max_participants || '',
        teams_advance_per_group: category.teams_advance_per_group || 2,
        group_best_of_games: category.group_best_of_games || 3,
        group_scoring_type: category.group_scoring_type || 'no_ad',
        group_advantage_limit: category.group_advantage_limit || '',
        knockout_best_of_games: category.knockout_best_of_games || 3,
        knockout_scoring_type: category.knockout_scoring_type || 'no_ad',
        knockout_advantage_limit: category.knockout_advantage_limit || '',
        warmup_minutes: category.warmup_minutes || 5,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('events.categories.update', [event.id, category.id]));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this category? This will also delete all participants and groups associated with it.')) {
            destroy(route('events.categories.destroy', [event.id, category.id]));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <nav className="text-sm text-neutral-600 mb-1">
                        <Link href={route('events.index')} className="hover:text-dark">Events</Link>
                        {' / '}
                        <Link href={route('events.show', event.id)} className="hover:text-dark">{event.name}</Link>
                    </nav>
                    <h2 className="text-xl font-bold font-raverist leading-tight text-dark">
                        Edit Category
                    </h2>
                </div>
            }
        >
            <Head title="Edit Category" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-dark">
                                    Category Name *
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
                                    required
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-dark">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            </div>

                            <div>
                                <label htmlFor="max_participants" className="block text-sm font-medium text-dark">
                                    Maximum Participants
                                </label>
                                <input
                                    id="max_participants"
                                    type="number"
                                    min="1"
                                    value={data.max_participants}
                                    onChange={(e) => setData('max_participants', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
                                />
                                {errors.max_participants && <p className="mt-1 text-sm text-red-600">{errors.max_participants}</p>}
                            </div>

                            <div>
                                <label htmlFor="teams_advance_per_group" className="block text-sm font-medium text-dark">
                                    Teams Advancing Per Group *
                                </label>
                                <input
                                    id="teams_advance_per_group"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={data.teams_advance_per_group}
                                    onChange={(e) => setData('teams_advance_per_group', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
                                    required
                                />
                                <p className="mt-1 text-xs text-neutral-600">
                                    Number of teams that will advance from each group to the knockout stage
                                </p>
                                {errors.teams_advance_per_group && <p className="mt-1 text-sm text-red-600">{errors.teams_advance_per_group}</p>}
                            </div>

                            {/* Group Phase Scoring Settings */}
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-medium text-dark mb-4">Group Phase Scoring Settings</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="group_best_of_games" className="block text-sm font-medium text-dark">
                                            Best of Games *
                                        </label>
                                        <select
                                            id="group_best_of_games"
                                            value={data.group_best_of_games}
                                            onChange={(e) => setData('group_best_of_games', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
                                            required
                                        >
                                            <option value="3">Best of 3 (first to 2)</option>
                                            <option value="4">Best of 4 (can draw 2-2)</option>
                                            <option value="5">Best of 5 (first to 3)</option>
                                        </select>
                                        {errors.group_best_of_games && <p className="mt-1 text-sm text-red-600">{errors.group_best_of_games}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="group_scoring_type" className="block text-sm font-medium text-dark">
                                            Scoring Type *
                                        </label>
                                        <select
                                            id="group_scoring_type"
                                            value={data.group_scoring_type}
                                            onChange={(e) => setData('group_scoring_type', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
                                            required
                                        >
                                            <option value="no_ad">No-Ad (Golden Point at 40-40)</option>
                                            <option value="traditional">Traditional (Deuce/Advantage)</option>
                                            <option value="advantage_limit">Advantage Limit</option>
                                        </select>
                                        <p className="mt-1 text-xs text-neutral-600">
                                            {data.group_scoring_type === 'no_ad' && 'At 40-40, one decisive point (receiver chooses side)'}
                                            {data.group_scoring_type === 'traditional' && 'Traditional tennis scoring with unlimited deuces'}
                                            {data.group_scoring_type === 'advantage_limit' && 'After X advantages, go to golden point'}
                                        </p>
                                        {errors.group_scoring_type && <p className="mt-1 text-sm text-red-600">{errors.group_scoring_type}</p>}
                                    </div>

                                    {data.group_scoring_type === 'advantage_limit' && (
                                        <div>
                                            <label htmlFor="group_advantage_limit" className="block text-sm font-medium text-dark">
                                                Advantage Limit *
                                            </label>
                                            <input
                                                id="group_advantage_limit"
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={data.group_advantage_limit}
                                                onChange={(e) => setData('group_advantage_limit', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
                                                required
                                            />
                                            <p className="mt-1 text-xs text-neutral-600">
                                                Number of advantages before going to golden point
                                            </p>
                                            {errors.group_advantage_limit && <p className="mt-1 text-sm text-red-600">{errors.group_advantage_limit}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Knockout Phase Scoring Settings */}
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-medium text-dark mb-4">Knockout Phase Scoring Settings</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="knockout_best_of_games" className="block text-sm font-medium text-dark">
                                            Best of Games *
                                        </label>
                                        <select
                                            id="knockout_best_of_games"
                                            value={data.knockout_best_of_games}
                                            onChange={(e) => setData('knockout_best_of_games', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
                                            required
                                        >
                                            <option value="3">Best of 3 (first to 2)</option>
                                            <option value="5">Best of 5 (first to 3)</option>
                                        </select>
                                        <p className="mt-1 text-xs text-neutral-600">
                                            Knockout phase cannot end in a draw
                                        </p>
                                        {errors.knockout_best_of_games && <p className="mt-1 text-sm text-red-600">{errors.knockout_best_of_games}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="knockout_scoring_type" className="block text-sm font-medium text-dark">
                                            Scoring Type *
                                        </label>
                                        <select
                                            id="knockout_scoring_type"
                                            value={data.knockout_scoring_type}
                                            onChange={(e) => setData('knockout_scoring_type', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
                                            required
                                        >
                                            <option value="no_ad">No-Ad (Golden Point at 40-40)</option>
                                            <option value="traditional">Traditional (Deuce/Advantage)</option>
                                            <option value="advantage_limit">Advantage Limit</option>
                                        </select>
                                        {errors.knockout_scoring_type && <p className="mt-1 text-sm text-red-600">{errors.knockout_scoring_type}</p>}
                                    </div>

                                    {data.knockout_scoring_type === 'advantage_limit' && (
                                        <div>
                                            <label htmlFor="knockout_advantage_limit" className="block text-sm font-medium text-dark">
                                                Advantage Limit *
                                            </label>
                                            <input
                                                id="knockout_advantage_limit"
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={data.knockout_advantage_limit}
                                                onChange={(e) => setData('knockout_advantage_limit', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
                                                required
                                            />
                                            <p className="mt-1 text-xs text-neutral-600">
                                                Number of advantages before going to golden point
                                            </p>
                                            {errors.knockout_advantage_limit && <p className="mt-1 text-sm text-red-600">{errors.knockout_advantage_limit}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Warm-up Timer */}
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-medium text-dark mb-4">Match Settings</h3>
                                
                                <div>
                                    <label htmlFor="warmup_minutes" className="block text-sm font-medium text-dark">
                                        Warm-up Duration (minutes) *
                                    </label>
                                    <input
                                        id="warmup_minutes"
                                        type="number"
                                        min="0"
                                        max="30"
                                        value={data.warmup_minutes}
                                        onChange={(e) => setData('warmup_minutes', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
                                        required
                                    />
                                    <p className="mt-1 text-xs text-neutral-600">
                                        Duration of the warm-up period before each match
                                    </p>
                                    {errors.warmup_minutes && <p className="mt-1 text-sm text-red-600">{errors.warmup_minutes}</p>}
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700"
                                >
                                    Delete Category
                                </button>
                                
                                <div className="flex gap-3">
                                    <Link
                                        href={route('events.categories.index', event.id)}
                                        className="px-4 py-2 text-sm font-medium text-dark bg-white border border-neutral-300 rounded-md shadow-sm hover:bg-neutral-50"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-600 disabled:opacity-50"
                                    >
                                        Update Category
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

