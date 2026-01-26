import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Create({ event }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        max_participants: '',
        warmup_minutes: 5,
        phases: [
            {
                name: 'Group Stage',
                type: 'group',
                number_of_groups: 4,
                teams_advance_per_group: 2,
                games_target: 4,
                scoring_type: 'no_ad',
                advantage_limit: '',
                tiebreaker_points: 7,
                tiebreaker_two_point_difference: true,
            },
            {
                name: 'Knockout Stage',
                type: 'knockout',
                number_of_groups: null,
                teams_advance_per_group: null,
                games_target: 6,
                scoring_type: 'no_ad',
                advantage_limit: '',
                tiebreaker_points: 7,
                tiebreaker_two_point_difference: true,
            },
        ],
    });

    const addPhase = () => {
        setData('phases', [...data.phases, {
            name: `Phase ${data.phases.length + 1}`,
            type: 'group',
            number_of_groups: 2,
            teams_advance_per_group: 2,
            games_target: 4,
            scoring_type: 'no_ad',
            advantage_limit: '',
            tiebreaker_points: 7,
            tiebreaker_two_point_difference: true,
        }]);
    };

    const removePhase = (index) => {
        const newPhases = data.phases.filter((_, i) => i !== index);
        setData('phases', newPhases);
    };

    const updatePhase = (index, field, value) => {
        const newPhases = [...data.phases];
        newPhases[index] = { ...newPhases[index], [field]: value };
        setData('phases', newPhases);
    };

    const movePhaseUp = (index) => {
        if (index === 0) return;
        const newPhases = [...data.phases];
        [newPhases[index - 1], newPhases[index]] = [newPhases[index], newPhases[index - 1]];
        setData('phases', newPhases);
    };

    const movePhaseDown = (index) => {
        if (index === data.phases.length - 1) return;
        const newPhases = [...data.phases];
        [newPhases[index], newPhases[index + 1]] = [newPhases[index + 1], newPhases[index]];
        setData('phases', newPhases);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('events.categories.store', event.id));
    };

    return (
        <AuthenticatedLayout header="Create Category">
            <Head title="Create Category" />

            <div className="py-12 bg-dark min-h-screen">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
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
                            {/* Basic Info */}
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

                            <div className="grid grid-cols-2 gap-6">
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
                                    {errors.warmup_minutes && <p className="mt-2 text-sm font-gotham font-bold text-red-600">❌ {errors.warmup_minutes}</p>}
                                </div>
                            </div>

                            {/* Tournament Phases */}
                            <div className="border-t-2 border-neutral-200 pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-gotham font-bold text-dark flex items-center gap-2">
                                        🏆 Tournament Phases
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={addPhase}
                                        className="px-4 py-2 text-sm font-gotham font-bold text-white bg-primary rounded-lg hover:bg-primary-600"
                                    >
                                        ➕ Add Phase
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {data.phases.map((phase, index) => (
                                        <div key={index} className="bg-neutral-50 rounded-xl p-6 border-2 border-neutral-200">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="text-lg font-gotham font-bold text-dark">
                                                    Phase {index + 1}
                                                    {index === data.phases.length - 1 && (
                                                        <span className="ml-2 text-sm text-white bg-primary px-3 py-1 rounded-full">
                                                            🏁 Final Phase
                                                        </span>
                                                    )}
                                                </h4>
                                                <div className="flex gap-2">
                                                    {index > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => movePhaseUp(index)}
                                                            className="px-2 py-1 text-xs font-gotham font-bold text-dark bg-neutral-200 rounded hover:bg-neutral-300"
                                                            title="Move up"
                                                        >
                                                            ↑
                                                        </button>
                                                    )}
                                                    {index < data.phases.length - 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => movePhaseDown(index)}
                                                            className="px-2 py-1 text-xs font-gotham font-bold text-dark bg-neutral-200 rounded hover:bg-neutral-300"
                                                            title="Move down"
                                                        >
                                                            ↓
                                                        </button>
                                                    )}
                                                    {data.phases.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removePhase(index)}
                                                            className="px-2 py-1 text-xs font-gotham font-bold text-white bg-red-600 rounded hover:bg-red-700"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-gotham font-bold text-dark mb-2">
                                                        Phase Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={phase.name}
                                                        onChange={(e) => updatePhase(index, 'name', e.target.value)}
                                                        className="block w-full font-gotham rounded-lg border-2 border-neutral-300 text-sm p-2"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-gotham font-bold text-dark mb-2">
                                                        Phase Type *
                                                    </label>
                                                    <select
                                                        value={phase.type}
                                                        onChange={(e) => updatePhase(index, 'type', e.target.value)}
                                                        className="block w-full font-gotham rounded-lg border-2 border-neutral-300 text-sm p-2"
                                                        required
                                                    >
                                                        <option value="group">Group Phase</option>
                                                        <option value="knockout">Knockout Phase</option>
                                                    </select>
                                                </div>

                                                {phase.type === 'group' && (
                                                    <>
                                                        <div>
                                                            <label className="block text-sm font-gotham font-bold text-dark mb-2">
                                                                Number of Groups *
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={phase.number_of_groups}
                                                                onChange={(e) => updatePhase(index, 'number_of_groups', parseInt(e.target.value))}
                                                                className="block w-full font-gotham rounded-lg border-2 border-neutral-300 text-sm p-2"
                                                                required
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-gotham font-bold text-dark mb-2">
                                                                Teams Advancing Per Group *
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={phase.teams_advance_per_group}
                                                                onChange={(e) => updatePhase(index, 'teams_advance_per_group', parseInt(e.target.value))}
                                                                className="block w-full font-gotham rounded-lg border-2 border-neutral-300 text-sm p-2"
                                                                required
                                                            />
                                                        </div>
                                                    </>
                                                )}

                                                <div>
                                                    <label className="block text-sm font-gotham font-bold text-dark mb-2">
                                                        First to X Games *
                                                    </label>
                                                    <select
                                                        value={phase.games_target}
                                                        onChange={(e) => updatePhase(index, 'games_target', parseInt(e.target.value))}
                                                        className="block w-full font-gotham rounded-lg border-2 border-neutral-300 text-sm p-2"
                                                        required
                                                    >
                                                        <option value="4">First to 4</option>
                                                        <option value="6">First to 6</option>
                                                        <option value="8">First to 8</option>
                                                        <option value="10">First to 10</option>
                                                        <option value="12">First to 12</option>
                                                    </select>
                                                </div>
                                                <div></div>

                                                <div>
                                                    <label className="block text-sm font-gotham font-bold text-dark mb-2">
                                                        Scoring Type *
                                                    </label>
                                                    <select
                                                        value={phase.scoring_type}
                                                        onChange={(e) => updatePhase(index, 'scoring_type', e.target.value)}
                                                        className="block w-full font-gotham rounded-lg border-2 border-neutral-300 text-sm p-2"
                                                        required
                                                    >
                                                        <option value="no_ad">No-Advantage</option>
                                                        <option value="traditional">Unlimited Advantage</option>
                                                        <option value="advantage_limit">Limited Advantage</option>
                                                    </select>
                                                </div>

                                                {phase.scoring_type === 'advantage_limit' && (
                                                    <div>
                                                        <label className="block text-sm font-gotham font-bold text-dark mb-2">
                                                            Advantage Limit *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="10"
                                                            value={phase.advantage_limit}
                                                            onChange={(e) => updatePhase(index, 'advantage_limit', parseInt(e.target.value))}
                                                            className="block w-full font-gotham rounded-lg border-2 border-neutral-300 text-sm p-2"
                                                            required
                                                        />
                                                    </div>
                                                )}
                                                {phase.scoring_type !== 'advantage_limit' && <div></div>}

                                                <div>
                                                    <label className="block text-sm font-gotham font-bold text-dark mb-2">
                                                        Tie-breaker Points *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="5"
                                                        max="15"
                                                        value={phase.tiebreaker_points}
                                                        onChange={(e) => updatePhase(index, 'tiebreaker_points', parseInt(e.target.value))}
                                                        className="block w-full font-gotham rounded-lg border-2 border-neutral-300 text-sm p-2"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-gotham font-bold text-dark mb-2">
                                                        Require 2-Point Difference *
                                                    </label>
                                                    <select
                                                        value={phase.tiebreaker_two_point_difference}
                                                        onChange={(e) => updatePhase(index, 'tiebreaker_two_point_difference', e.target.value === 'true')}
                                                        className="block w-full font-gotham rounded-lg border-2 border-neutral-300 text-sm p-2"
                                                        required
                                                    >
                                                        <option value="true">Yes</option>
                                                        <option value="false">No</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
