import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ category, groups, participants }) {
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    
    const { data: setupData, setData: setSetupData, post: postSetup, processing: setupProcessing } = useForm({
        number_of_groups: groups.length || 4,
    });

    const { data: assignData, setData: setAssignData, post: postAssign, reset: resetAssign } = useForm({
        participant_id: '',
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
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
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
                            Group Management
                        </h2>
                    </div>
                    <button
                        onClick={() => setShowSetupModal(true)}
                        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-gotham font-semibold font-gotham text-white shadow-sm hover:bg-primary-600"
                    >
                        Setup Groups
                    </button>
                </div>
            }
        >
            <Head title={`Groups - ${category.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Setup Modal */}
                    {showSetupModal && (
                        <div className="fixed inset-0 bg-neutral-500 bg-opacity-75 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                                <h3 className="text-lg font-bold font-raverist mb-4">Setup Groups</h3>
                                <p className="text-sm text-neutral-700 mb-4">
                                    Creating new groups will delete all existing groups and their participant assignments.
                                </p>
                                <form onSubmit={handleSetupGroups}>
                                    <div className="mb-4">
                                        <label htmlFor="number_of_groups" className="block text-sm font-medium text-dark">
                                            Number of Groups
                                        </label>
                                        <input
                                            id="number_of_groups"
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={setupData.number_of_groups}
                                            onChange={(e) => setSetupData('number_of_groups', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowSetupModal(false)}
                                            className="px-4 py-2 text-sm font-medium text-dark bg-white border border-neutral-300 rounded-md hover:bg-neutral-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={setupProcessing}
                                            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-600 disabled:opacity-50"
                                        >
                                            Create Groups
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Unassigned Participants */}
                    {unassignedParticipants.length > 0 && (
                        <div className="overflow-hidden bg-accent-50 border border-accent-200 shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-bold font-raverist text-accent-900 mb-3">
                                    Unassigned Participants ({unassignedParticipants.length})
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {unassignedParticipants.map((participant) => (
                                        <span
                                            key={participant.id}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-100 text-accent-800"
                                        >
                                            {participant.player_1} - {participant.player_2}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Groups */}
                    {groups.length === 0 ? (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-12 text-center">
                                <p className="text-neutral-600 mb-4">No groups set up yet.</p>
                                <button
                                    onClick={() => setShowSetupModal(true)}
                                    className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-gotham font-semibold font-gotham text-white shadow-sm hover:bg-primary-600"
                                >
                                    Setup Groups
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {groups.map((group) => (
                                <div key={group.id} className="overflow-hidden bg-white border border-neutral-200 shadow-sm sm:rounded-lg">
                                    <div className="p-4 bg-neutral-50 border-b border-neutral-200">
                                        <div className="flex justify-between items-center">
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
                                                    className="text-base font-semibold text-dark border-neutral-300 rounded px-2 py-1"
                                                    autoFocus
                                                />
                                            ) : (
                                                <h3
                                                    className="text-base font-semibold text-dark cursor-pointer"
                                                    onClick={() => {
                                                        setEditingGroup(group.id);
                                                        setEditData('name', group.name);
                                                    }}
                                                >
                                                    {group.name}
                                                </h3>
                                            )}
                                            <button
                                                onClick={() => handleDeleteGroup(group.id)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        <p className="text-sm text-neutral-600 mt-1">
                                            {group.participants.length} participant(s)
                                        </p>
                                    </div>
                                    
                                    <div className="p-4">
                                        {/* Participants in Group */}
                                        {group.participants.length > 0 && (
                                            <ul className="space-y-2 mb-4">
                                                {group.participants.map((participant) => (
                                                    <li
                                                        key={participant.id}
                                                        className="flex justify-between items-center text-sm"
                                                    >
                                                        <span className="text-dark">{participant.player_1} - {participant.player_2}</span>
                                                        <button
                                                            onClick={() => handleRemoveParticipant(group.id, participant.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            ✕
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        
                                        {/* Assign Participant */}
                                        {participants.length > 0 && (
                                            <div>
                                                <select
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            handleAssignParticipant(group.id, e.target.value);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                    className="block w-full text-sm rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
                                                >
                                                    <option value="">Add participant...</option>
                                                    {participants.map((participant) => (
                                                        <option key={participant.id} value={participant.id}>
                                                            {participant.player_1} - {participant.player_2}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Participants Link */}
                    {participants.length === 0 && (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6 text-center">
                                <p className="text-neutral-600 mb-4">
                                    No participants in this category yet.
                                </p>
                                <Link
                                    href={route('categories.participants.create', category.id)}
                                    className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-gotham font-semibold font-gotham text-white shadow-sm hover:bg-primary-600"
                                >
                                    Add Participants
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

