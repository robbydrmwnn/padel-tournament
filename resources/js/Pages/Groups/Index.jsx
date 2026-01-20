import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ category, groups, participants }) {
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    
    const { data: setupData, setData: setSetupData, post: postSetup, processing: setupProcessing } = useForm({
        number_of_groups: groups.length || 4,
    });

    const { data: editData, setData: setEditData, patch: patchEdit } = useForm({
        name: '',
    });

    const handleSetupGroups = (e) => {
        e.preventDefault();
        postSetup(route('categories.groups.setup', category.id), {
            onSuccess: () => {
                setShowSetupModal(false);
            },
        });
    };

    const handleAssignParticipant = (groupId, participantId) => {
        router.post(route('categories.groups.assign', [category.id, groupId]), {
            participant_id: participantId,
        });
    };

    const handleRemoveParticipant = (groupId, participantId) => {
        if (confirm('Are you sure you want to remove this participant from the group?')) {
            router.delete(route('categories.groups.remove-participant', [category.id, groupId, participantId]));
        }
    };

    const handleUpdateGroup = (groupId) => {
        patchEdit(route('categories.groups.update', [category.id, groupId]), {
            onSuccess: () => {
                setEditingGroup(null);
            },
        });
    };

    const handleDeleteGroup = (groupId) => {
        if (confirm('Are you sure you want to delete this group?')) {
            router.delete(route('categories.groups.destroy', [category.id, groupId]));
        }
    };

    const getUnassignedParticipants = () => {
        const assignedIds = groups.flatMap(g => g.participants.map(p => p.id));
        return participants.filter(p => !assignedIds.includes(p.id));
    };

    const unassignedParticipants = getUnassignedParticipants();

    return (
        <AuthenticatedLayout header="Group Management">
            <Head title={`Groups - ${category.name}`} />

            <div className="py-12 bg-dark min-h-screen">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-6">
                    {/* Breadcrumb */}
                    <nav className="text-sm font-gotham text-neutral-400">
                        <Link href={route('events.index')} className="hover:text-white transition-colors">Events</Link>
                        {' / '}
                        <Link href={route('events.show', category.event.id)} className="hover:text-white transition-colors">
                            {category.event.name}
                        </Link>
                        {' / '}
                        <Link href={route('events.categories.show', [category.event.id, category.id])} className="hover:text-white transition-colors">
                            {category.name}
                        </Link>
                        {' / '}
                        <span className="text-white font-bold">Groups</span>
                    </nav>

                    {/* Header Banner */}
                    <div className="bg-success rounded-2xl p-8 shadow-lg border-4 border-accent">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-bold font-raverist text-white mb-2">Group Management</h1>
                                <p className="text-xl font-gotham text-neutral-200">{category.name}</p>
                            </div>
                            <button
                                onClick={() => setShowSetupModal(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-lg font-gotham font-bold text-success shadow-lg hover:bg-white-600 transition-all border-2 border-accent hover:scale-105"
                            >
                                <span className="text-2xl">⚙️</span>
                                Setup Groups
                            </button>
                        </div>
                    </div>

                    {/* Setup Modal */}
                    {showSetupModal && (
                        <div className="fixed inset-0 bg-dark bg-opacity-90 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border-4 border-success">
                                <h3 className="text-2xl font-bold font-raverist text-success mb-4">Setup Groups</h3>
                                <div className="bg-accent-100 rounded-xl p-4 mb-6 border-2 border-accent">
                                    <p className="text-base font-gotham text-dark">
                                        ⚠️ Creating new groups will delete all existing groups and their participant assignments.
                                    </p>
                                </div>
                                <form onSubmit={handleSetupGroups}>
                                    <div className="mb-6">
                                        <label htmlFor="number_of_groups" className="block text-base font-gotham font-bold text-dark mb-2">
                                            Number of Groups
                                        </label>
                                        <input
                                            id="number_of_groups"
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={setupData.number_of_groups}
                                            onChange={(e) => setSetupData('number_of_groups', e.target.value)}
                                            className="block w-full font-gotham rounded-xl border-2 border-neutral-300 shadow-sm focus:border-success focus:ring-success text-lg p-3"
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowSetupModal(false)}
                                            className="flex-1 px-6 py-3 text-sm font-gotham font-bold text-dark bg-white border-2 border-neutral-400 rounded-xl hover:bg-neutral-100 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={setupProcessing}
                                            className="flex-1 px-6 py-3 text-sm font-gotham font-bold text-white bg-success rounded-xl hover:bg-success-600 disabled:opacity-50 transition-all border-2 border-dark"
                                        >
                                            {setupProcessing ? 'Creating...' : 'Create Groups'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Unassigned Participants */}
                    {unassignedParticipants.length > 0 && (
                        <div className="bg-accent rounded-2xl p-6 shadow-lg border-4 border-accent-700">
                            <h3 className="text-2xl font-bold font-raverist text-dark mb-4">
                                ⚠️ Unassigned Participants ({unassignedParticipants.length})
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {unassignedParticipants.map((participant) => (
                                    <span
                                        key={participant.id}
                                        className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-gotham font-bold bg-white text-dark border-2 border-dark"
                                    >
                                        👥 {participant.player_1} - {participant.player_2}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Groups */}
                    {groups.length === 0 ? (
                        <div className="bg-white rounded-2xl p-16 text-center shadow-lg border-4 border-success">
                            <div className="text-8xl mb-6">🏆</div>
                            <h3 className="text-3xl font-bold font-raverist text-dark mb-4">No Groups Set Up</h3>
                            <p className="text-xl font-gotham text-neutral-600 mb-8">Create groups to organize participants!</p>
                            <button
                                onClick={() => setShowSetupModal(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-success px-8 py-4 text-lg font-gotham font-bold text-white shadow-lg hover:bg-success-600 transition-all border-4 border-dark"
                            >
                                <span className="text-2xl">⚙️</span>
                                Setup Groups Now
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {groups.map((group) => (
                                <div key={group.id} className="bg-white rounded-2xl shadow-lg border-4 border-success hover:border-primary transition-all">
                                    <div className="p-6 bg-success rounded-t-xl border-b-4 border-success-700">
                                        <div className="flex justify-between items-center mb-2">
                                            {editingGroup === group.id ? (
                                                <input
                                                    type="text"
                                                    value={editData.name}
                                                    onChange={(e) => setEditData('name', e.target.value)}
                                                    onBlur={() => handleUpdateGroup(group.id)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleUpdateGroup(group.id);
                                                        }
                                                    }}
                                                    className="text-xl font-bold font-raverist text-dark border-2 border-white rounded-xl px-3 py-2 flex-1"
                                                    autoFocus
                                                />
                                            ) : (
                                                <h3
                                                    className="text-xl font-bold font-raverist text-white cursor-pointer hover:text-accent transition-colors"
                                                    onClick={() => {
                                                        setEditingGroup(group.id);
                                                        setEditData('name', group.name);
                                                    }}
                                                >
                                                    🏆 {group.name}
                                                </h3>
                                            )}
                                            <button
                                                onClick={() => handleDeleteGroup(group.id)}
                                                className="ml-3 px-3 py-1 text-xs font-gotham font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all border-2 border-dark"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                        <p className="text-sm font-gotham text-white">
                                            {group.participants.length} participant(s)
                                        </p>
                                    </div>
                                    
                                    <div className="p-6">
                                        {/* Participants in Group */}
                                        {group.participants.length > 0 ? (
                                            <ul className="space-y-2 mb-4">
                                                {group.participants.map((participant) => (
                                                    <li
                                                        key={participant.id}
                                                        className="flex justify-between items-center bg-neutral-100 rounded-lg p-3 border-2 border-neutral-300"
                                                    >
                                                        <span className="text-sm font-gotham text-dark">👥 {participant.player_1} - {participant.player_2}</span>
                                                        <button
                                                            onClick={() => handleRemoveParticipant(group.id, participant.id)}
                                                            className="px-2 py-1 text-xs font-gotham font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all"
                                                        >
                                                            ✕
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm font-gotham text-neutral-600 text-center py-4 mb-4">
                                                No participants assigned yet
                                            </p>
                                        )}
                                        
                                        {/* Assign Participant */}
                                        {participants.length > 0 && (
                                            <select
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        handleAssignParticipant(group.id, e.target.value);
                                                        e.target.value = '';
                                                    }
                                                }}
                                                className="block w-full font-gotham rounded-xl border-2 border-success shadow-sm focus:border-primary focus:ring-primary"
                                            >
                                                <option value="">➕ Add participant...</option>
                                                {participants.map((participant) => (
                                                    <option key={participant.id} value={participant.id}>
                                                        {participant.player_1} - {participant.player_2}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Participants Link */}
                    {participants.length === 0 && (
                        <div className="bg-white rounded-2xl p-12 text-center shadow-lg border-4 border-accent">
                            <div className="text-6xl mb-4">👥</div>
                            <h3 className="text-2xl font-bold font-raverist text-dark mb-4">No Participants Yet</h3>
                            <p className="text-lg font-gotham text-neutral-600 mb-6">
                                Add participants to this category before creating groups
                            </p>
                            <Link
                                href={route('categories.participants.create', category.id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-gotham font-bold text-white shadow-lg hover:bg-primary-600 transition-all border-4 border-dark"
                            >
                                <span className="text-2xl">➕</span>
                                Add Participants
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
