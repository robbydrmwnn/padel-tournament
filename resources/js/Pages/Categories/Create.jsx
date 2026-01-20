import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ event }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        max_participants: '',
        teams_advance_per_group: 2,
        group_best_of_games: 3,
        group_scoring_type: 'no_ad',
        group_advantage_limit: '',
        knockout_best_of_games: 3,
        knockout_scoring_type: 'no_ad',
        knockout_advantage_limit: '',
        warmup_minutes: 5,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('events.categories.store', event.id));
    };

    return (
        <AuthenticatedLayout header="Create Category">
            <Head title="Create Category" />

            <div className="py-12 bg-dark min-h-screen">
                <div className="mx-auto max-w-3xl px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="text-sm font-gotham text-neutral-400 mb-6">
                        <Link href={route('events.index')} className="hover:text-white transition-colors">Events</Link>
                        {' / '}
                        <Link href={route('events.show', event.id)} className="hover:text-white transition-colors">{event.name}</Link>
                        {' / '}
                        <span className="text-white font-bold">Create Category</span>
                    </nav>

                    {/* Header Banner */}
                    <div className="bg-success rounded-2xl p-8 mb-8 shadow-lg border-4 border-accent">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">🎯</div>
                            <div>
                                <h1 className="text-3xl font-bold font-raverist text-white mb-1">Create New Category</h1>
                                <p className="text-lg font-gotham text-neutral-200">Set up a new category for {event.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-primary">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-base font-gotham font-bold text-dark mb-2">
                                    📝 Category Name *
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                    placeholder="Enter category name..."
                                    required
                                />
                                {errors.name && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-base font-gotham font-bold text-dark mb-2">
                                    📋 Description
                                </label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                    placeholder="Describe your category..."
                                />
                                {errors.description && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.description}</p>}
                            </div>

                            <div>
                                <label htmlFor="max_participants" className="block text-base font-gotham font-bold text-dark mb-2">
                                    👥 Maximum Participants
                                </label>
                                <input
                                    id="max_participants"
                                    type="number"
                                    min="1"
                                    value={data.max_participants}
                                    onChange={(e) => setData('max_participants', e.target.value)}
                                    className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                    placeholder="Enter maximum participants..."
                                />
                                {errors.max_participants && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.max_participants}</p>}
                            </div>

                            <div>
                                <label htmlFor="teams_advance_per_group" className="block text-base font-gotham font-bold text-dark mb-2">
                                    🚀 Teams Advancing Per Group *
                                </label>
                                <input
                                    id="teams_advance_per_group"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={data.teams_advance_per_group}
                                    onChange={(e) => setData('teams_advance_per_group', e.target.value)}
                                    className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                    required
                                />
                                <p className="mt-2 text-sm font-gotham text-neutral-600">
                                    💡 Number of teams that will advance from each group to the knockout stage
                                </p>
                                {errors.teams_advance_per_group && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.teams_advance_per_group}</p>}
                            </div>

                            {/* Group Phase Scoring Settings */}
                            <div className="border-t-2 border-neutral-200 pt-6">
                                <h3 className="text-xl font-gotham font-bold text-dark mb-4 flex items-center gap-2">
                                    🏐 Group Phase Scoring Settings
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="group_best_of_games" className="block text-base font-gotham font-bold text-dark mb-2">
                                            🎲 Best of Games *
                                        </label>
                                        <select
                                            id="group_best_of_games"
                                            value={data.group_best_of_games}
                                            onChange={(e) => setData('group_best_of_games', e.target.value)}
                                            className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                            required
                                        >
                                            <option value="3">Best of 3 (first to 2)</option>
                                            <option value="4">Best of 4 (can draw 2-2)</option>
                                            <option value="5">Best of 5 (first to 3)</option>
                                        </select>
                                        {errors.group_best_of_games && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.group_best_of_games}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="group_scoring_type" className="block text-base font-gotham font-bold text-dark mb-2">
                                            📊 Scoring Type *
                                        </label>
                                        <select
                                            id="group_scoring_type"
                                            value={data.group_scoring_type}
                                            onChange={(e) => setData('group_scoring_type', e.target.value)}
                                            className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                            required
                                        >
                                            <option value="no_ad">No-Ad (Golden Point at 40-40)</option>
                                            <option value="traditional">Traditional (Deuce/Advantage)</option>
                                            <option value="advantage_limit">Advantage Limit</option>
                                        </select>
                                        <p className="mt-2 text-sm font-gotham text-neutral-600">
                                            {data.group_scoring_type === 'no_ad' && '💡 At 40-40, one decisive point (receiver chooses side)'}
                                            {data.group_scoring_type === 'traditional' && '💡 Traditional tennis scoring with unlimited deuces'}
                                            {data.group_scoring_type === 'advantage_limit' && '💡 After X advantages, go to golden point'}
                                        </p>
                                        {errors.group_scoring_type && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.group_scoring_type}</p>}
                                    </div>

                                    {data.group_scoring_type === 'advantage_limit' && (
                                        <div>
                                            <label htmlFor="group_advantage_limit" className="block text-base font-gotham font-bold text-dark mb-2">
                                                🔢 Advantage Limit *
                                            </label>
                                            <input
                                                id="group_advantage_limit"
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={data.group_advantage_limit}
                                                onChange={(e) => setData('group_advantage_limit', e.target.value)}
                                                className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                                required
                                            />
                                            <p className="mt-2 text-sm font-gotham text-neutral-600">
                                                💡 Number of advantages before going to golden point
                                            </p>
                                            {errors.group_advantage_limit && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.group_advantage_limit}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Knockout Phase Scoring Settings */}
                            <div className="border-t-2 border-neutral-200 pt-6">
                                <h3 className="text-xl font-gotham font-bold text-dark mb-4 flex items-center gap-2">
                                    🏆 Knockout Phase Scoring Settings
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="knockout_best_of_games" className="block text-base font-gotham font-bold text-dark mb-2">
                                            🎲 Best of Games *
                                        </label>
                                        <select
                                            id="knockout_best_of_games"
                                            value={data.knockout_best_of_games}
                                            onChange={(e) => setData('knockout_best_of_games', e.target.value)}
                                            className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                            required
                                        >
                                            <option value="3">Best of 3 (first to 2)</option>
                                            <option value="5">Best of 5 (first to 3)</option>
                                        </select>
                                        <p className="mt-2 text-sm font-gotham text-neutral-600">
                                            💡 Knockout phase cannot end in a draw
                                        </p>
                                        {errors.knockout_best_of_games && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.knockout_best_of_games}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="knockout_scoring_type" className="block text-base font-gotham font-bold text-dark mb-2">
                                            📊 Scoring Type *
                                        </label>
                                        <select
                                            id="knockout_scoring_type"
                                            value={data.knockout_scoring_type}
                                            onChange={(e) => setData('knockout_scoring_type', e.target.value)}
                                            className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                            required
                                        >
                                            <option value="no_ad">No-Ad (Golden Point at 40-40)</option>
                                            <option value="traditional">Traditional (Deuce/Advantage)</option>
                                            <option value="advantage_limit">Advantage Limit</option>
                                        </select>
                                        {errors.knockout_scoring_type && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.knockout_scoring_type}</p>}
                                    </div>

                                    {data.knockout_scoring_type === 'advantage_limit' && (
                                        <div>
                                            <label htmlFor="knockout_advantage_limit" className="block text-base font-gotham font-bold text-dark mb-2">
                                                🔢 Advantage Limit *
                                            </label>
                                            <input
                                                id="knockout_advantage_limit"
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={data.knockout_advantage_limit}
                                                onChange={(e) => setData('knockout_advantage_limit', e.target.value)}
                                                className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                                required
                                            />
                                            <p className="mt-2 text-sm font-gotham text-neutral-600">
                                                💡 Number of advantages before going to golden point
                                            </p>
                                            {errors.knockout_advantage_limit && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.knockout_advantage_limit}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Warm-up Timer */}
                            <div className="border-t-2 border-neutral-200 pt-6">
                                <h3 className="text-xl font-gotham font-bold text-dark mb-4 flex items-center gap-2">
                                    ⚙️ Match Settings
                                </h3>
                                
                                <div>
                                    <label htmlFor="warmup_minutes" className="block text-base font-gotham font-bold text-dark mb-2">
                                        ⏱️ Warm-up Duration (minutes) *
                                    </label>
                                    <input
                                        id="warmup_minutes"
                                        type="number"
                                        min="0"
                                        max="30"
                                        value={data.warmup_minutes}
                                        onChange={(e) => setData('warmup_minutes', e.target.value)}
                                        className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3"
                                        required
                                    />
                                    <p className="mt-2 text-sm font-gotham text-neutral-600">
                                        💡 Duration of the warm-up period before each match
                                    </p>
                                    {errors.warmup_minutes && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.warmup_minutes}</p>}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Link
                                    href={route('events.categories.index', event.id)}
                                    className="flex-1 text-center px-6 py-3 text-base font-gotham font-bold text-dark bg-white border-2 border-neutral-400 rounded-xl shadow-lg hover:bg-neutral-100 transition-all"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 px-6 py-3 text-base font-gotham font-bold text-white bg-success border-2 border-dark rounded-xl shadow-lg hover:bg-success-600 disabled:opacity-50 transition-all"
                                >
                                    {processing ? '⏳ Creating...' : '✅ Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

