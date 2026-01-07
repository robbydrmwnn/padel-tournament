import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { formatDate } from '@/Utils/dateFormatter';
import axios from 'axios';

export default function Index({ category, matches, courts }) {
    const { flash } = usePage().props;
    const handleCourtChange = (matchId, courtId) => {
        router.patch(route('categories.matches.update', [category.id, matchId]), {
            court_id: courtId,
        }, {
            preserveScroll: true,
        });
    };

    const handleScheduledTimeChange = (matchId, scheduledTime) => {
        router.patch(route('categories.matches.update', [category.id, matchId]), {
            scheduled_time: scheduledTime,
        }, {
            preserveScroll: true,
        });
    };

    const handleResetMatch = (matchId) => {
        if (confirm('Reset this match?\n\n• Clears all scores and progress\n• Returns match to scheduled state\n• Frees up the court for other matches\n\nContinue?')) {
            router.post(route('categories.matches.reset', [category.id, matchId]));
        }
    };

    const handleGenerateMatches = () => {
        if (confirm('Generate matches for all groups? This will delete existing group phase matches.')) {
            router.post(route('categories.matches.generate', category.id));
        }
    };

    const handleStartMatch = async (matchId) => {
        const match = matches.find(m => m.id === matchId);
        
        // Check if court is assigned first
        if (!match.court_id) {
            alert('❌ Please assign a court before starting this match.');
            return;
        }
        
        try {
            // Use axios to call the validation endpoint (Inertia includes axios)
            const response = await axios.post(route('categories.matches.startPrep', [category.id, matchId]));
            
            if (response.data.success) {
                // Success - refresh page and then open referee page
                router.reload({
                    only: ['matches'],
                    onSuccess: () => {
                        router.visit(route('categories.matches.referee', [category.id, matchId]));
                    }
                });
            }
            
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                // Show specific error from server
                alert('❌ ' + error.response.data.error);
            } else {
                alert('❌ An error occurred. Please try again.');
            }
            console.error(error);
        }
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
            scheduled: 'bg-neutral-100 text-dark',
            upcoming: 'bg-primary-100 text-primary-800',
            in_progress: 'bg-accent-100 text-accent-800',
            completed: 'bg-success-100 text-success-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-neutral-100 text-dark';
    };

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
                            Matches - Group Phase
                        </h2>
                    </div>
                    <button
                        onClick={handleGenerateMatches}
                        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-gotham font-semibold font-gotham text-white shadow-sm hover:bg-primary-600"
                    >
                        Generate Matches
                    </button>
                </div>
            }
        >
            <Head title={`Matches - ${category.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="bg-success-50 border border-success-200 text-success-800 px-4 py-3 rounded relative">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative">
                            {flash.error}
                        </div>
                    )}
                    {flash?.warning && (
                        <div className="bg-accent-50 border border-accent-200 text-accent-800 px-4 py-3 rounded relative">
                            {flash.warning}
                        </div>
                    )}

                    {matches.length === 0 ? (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-12 text-center">
                                <p className="text-neutral-600 mb-4">No matches generated yet.</p>
                                <p className="text-sm text-gray-400 mb-6">
                                    Make sure you have set up groups and assigned participants before generating matches.
                                </p>
                                <button
                                    onClick={handleGenerateMatches}
                                    className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-gotham font-semibold font-gotham text-white shadow-sm hover:bg-primary-600"
                                >
                                    Generate Matches
                                </button>
                            </div>
                        </div>
                    ) : (
                        Object.entries(matchesByGroup).map(([groupName, groupMatches]) => (
                            <div key={groupName} className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-bold font-raverist text-dark mb-4">{groupName}</h3>
                                    
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-neutral-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Team 1</th>
                                                    <th className="px-4 py-3 text-center text-xs font-medium text-neutral-600 uppercase">VS</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Team 2</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Court</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Date & Time</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Status</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {groupMatches.map((match) => (
                                                    <tr key={match.id}>
                                                        <td className="px-4 py-3 text-sm text-dark">
                                                            {match.team1?.player_1} - {match.team1?.player_2}
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-sm font-medium text-neutral-600">
                                                            VS
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-dark">
                                                            {match.team2?.player_1} - {match.team2?.player_2}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <select
                                                                value={match.court_id || ''}
                                                                onChange={(e) => handleCourtChange(match.id, e.target.value)}
                                                                className="block w-full text-sm rounded border-neutral-300 focus:border-primary focus:ring-primary"
                                                            >
                                                                <option value="">Select Court</option>
                                                                {courts.map((court) => (
                                                                    <option key={court.id} value={court.id}>
                                                                        Court {court.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <input
                                                                type="datetime-local"
                                                                value={match.scheduled_time ? new Date(match.scheduled_time).toISOString().slice(0, 16) : ''}
                                                                onChange={(e) => handleScheduledTimeChange(match.id, e.target.value)}
                                                                className="block w-full text-sm rounded border-neutral-300 focus:border-primary focus:ring-primary"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(match.status)}`}>
                                                                {match.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleStartMatch(match.id)}
                                                                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-success rounded hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    disabled={match.status === 'completed' || match.status === 'cancelled'}
                                                                >
                                                                    {match.status === 'in_progress' || match.status === 'upcoming' ? 'Open' : 'Start'}
                                                                </button>
                                                                {(match.status === 'upcoming' || match.status === 'in_progress') && (
                                                                    <button
                                                                        onClick={() => handleResetMatch(match.id)}
                                                                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-orange-600 rounded hover:bg-orange-700"
                                                                        title="Reset match to scheduled"
                                                                    >
                                                                        Reset
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDeleteMatch(match.id)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
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


