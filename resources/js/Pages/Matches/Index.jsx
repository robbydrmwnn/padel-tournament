import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { formatDate } from '@/Utils/dateFormatter';

export default function Index({ category, matches, courts }) {
    const [editingMatch, setEditingMatch] = useState(null);
    
    const { data: editData, setData: setEditData, patch: patchEdit, processing } = useForm({
        court_id: '',
        scheduled_time: '',
        team1_score: '',
        team2_score: '',
        status: 'scheduled',
        notes: '',
    });

    const handleGenerateMatches = () => {
        if (confirm('Generate matches for all groups? This will delete existing group phase matches.')) {
            router.post(route('categories.matches.generate', category.id));
        }
    };

    const handleEditMatch = (match) => {
        setEditingMatch(match.id);
        setEditData({
            court_id: match.court_id || '',
            scheduled_time: match.scheduled_time ? new Date(match.scheduled_time).toISOString().slice(0, 16) : '',
            team1_score: match.team1_score ?? '',
            team2_score: match.team2_score ?? '',
            status: match.status,
            notes: match.notes || '',
        });
    };

    const handleSaveMatch = (matchId) => {
        patchEdit(route('categories.matches.update', [category.id, matchId]), {
            onSuccess: () => {
                setEditingMatch(null);
            },
        });
    };

    const handleDeleteMatch = (matchId) => {
        if (confirm('Are you sure you want to delete this match?')) {
            router.delete(route('categories.matches.destroy', [category.id, matchId]));
        }
    };

    // Group matches by group
    const matchesByGroup = matches.reduce((acc, match) => {
        const groupName = match.group?.name || 'Ungrouped';
        if (!acc[groupName]) {
            acc[groupName] = [];
        }
        acc[groupName].push(match);
        return acc;
    }, {});

    const getStatusColor = (status) => {
        const colors = {
            scheduled: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

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
                            Matches - Group Phase
                        </h2>
                    </div>
                    <button
                        onClick={handleGenerateMatches}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        Generate Matches
                    </button>
                </div>
            }
        >
            <Head title={`Matches - ${category.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {matches.length === 0 ? (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-12 text-center">
                                <p className="text-gray-500 mb-4">No matches generated yet.</p>
                                <p className="text-sm text-gray-400 mb-6">
                                    Make sure you have set up groups and assigned participants before generating matches.
                                </p>
                                <button
                                    onClick={handleGenerateMatches}
                                    className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                                >
                                    Generate Matches
                                </button>
                            </div>
                        </div>
                    ) : (
                        Object.entries(matchesByGroup).map(([groupName, groupMatches]) => (
                            <div key={groupName} className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{groupName}</h3>
                                    
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team 1</th>
                                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">VS</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team 2</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Court</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {groupMatches.map((match) => (
                                                    editingMatch === match.id ? (
                                                        <tr key={match.id} className="bg-blue-50">
                                                            <td colSpan="8" className="px-4 py-4">
                                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Court</label>
                                                                        <select
                                                                            value={editData.court_id}
                                                                            onChange={(e) => setEditData('court_id', e.target.value)}
                                                                            className="block w-full text-sm rounded-md border-gray-300"
                                                                        >
                                                                            <option value="">Select Court</option>
                                                                            {courts.map((court) => (
                                                                                <option key={court.id} value={court.id}>
                                                                                    Court {court.name}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Scheduled Time</label>
                                                                        <input
                                                                            type="datetime-local"
                                                                            value={editData.scheduled_time}
                                                                            onChange={(e) => setEditData('scheduled_time', e.target.value)}
                                                                            className="block w-full text-sm rounded-md border-gray-300"
                                                                        />
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                            {match.team1?.player_1} - {match.team1?.player_2} Score
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            value={editData.team1_score}
                                                                            onChange={(e) => setEditData('team1_score', e.target.value)}
                                                                            className="block w-full text-sm rounded-md border-gray-300"
                                                                            placeholder="Score"
                                                                        />
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                            {match.team2?.player_1} - {match.team2?.player_2} Score
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            value={editData.team2_score}
                                                                            onChange={(e) => setEditData('team2_score', e.target.value)}
                                                                            className="block w-full text-sm rounded-md border-gray-300"
                                                                            placeholder="Score"
                                                                        />
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                                                        <select
                                                                            value={editData.status}
                                                                            onChange={(e) => setEditData('status', e.target.value)}
                                                                            className="block w-full text-sm rounded-md border-gray-300"
                                                                        >
                                                                            <option value="scheduled">Scheduled</option>
                                                                            <option value="in_progress">In Progress</option>
                                                                            <option value="completed">Completed</option>
                                                                            <option value="cancelled">Cancelled</option>
                                                                        </select>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                                                                        <input
                                                                            type="text"
                                                                            value={editData.notes}
                                                                            onChange={(e) => setEditData('notes', e.target.value)}
                                                                            className="block w-full text-sm rounded-md border-gray-300"
                                                                            placeholder="Notes"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={() => setEditingMatch(null)}
                                                                        className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleSaveMatch(match.id)}
                                                                        disabled={processing}
                                                                        className="px-3 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        <tr key={match.id}>
                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                {match.team1?.player_1} - {match.team1?.player_2}
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                                                                VS
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                {match.team2?.player_1} - {match.team2?.player_2}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                                {match.court ? `Court ${match.court.name}` : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                                {match.scheduled_time ? formatDate(match.scheduled_time) : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                                {match.team1_score !== null && match.team2_score !== null 
                                                                    ? `${match.team1_score} - ${match.team2_score}`
                                                                    : '-'}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(match.status)}`}>
                                                                    {match.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm">
                                                                <button
                                                                    onClick={() => handleEditMatch(match)}
                                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteMatch(match.id)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}


