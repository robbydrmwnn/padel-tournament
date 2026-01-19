import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
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
        
        if (!match.court_id) {
            alert('❌ Please assign a court before starting this match.');
            return;
        }
        
        try {
            const response = await axios.post(route('categories.matches.startPrep', [category.id, matchId]));
            
            if (response.data.success) {
                router.reload({
                    only: ['matches'],
                    onSuccess: () => {
                        router.visit(route('categories.matches.referee', [category.id, matchId]));
                    }
                });
            }
            
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
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
            scheduled: 'bg-neutral-400 text-white border-neutral-600',
            upcoming: 'bg-primary text-white border-primary-700',
            in_progress: 'bg-accent text-dark border-accent-700',
            completed: 'bg-success text-white border-success-700',
            cancelled: 'bg-red-600 text-white border-red-800',
        };
        return colors[status] || 'bg-neutral-400 text-white border-neutral-600';
    };

    const getStatusIcon = (status) => {
        const icons = {
            scheduled: '📅',
            upcoming: '⏰',
            in_progress: '🎾',
            completed: '✅',
            cancelled: '❌',
        };
        return icons[status] || '📋';
    };

    return (
        <AuthenticatedLayout header="Matches - Group Phase">
            <Head title={`Matches - ${category.name}`} />

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
                        <span className="text-white font-bold">Matches</span>
                    </nav>

                    {/* Header Banner */}
                    <div className="bg-accent rounded-2xl p-8 shadow-lg border-4 border-primary">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-bold font-raverist text-dark mb-2">Match Management</h1>
                                <p className="text-xl font-gotham text-dark">{category.name} - Group Phase</p>
                            </div>
                            <button
                                onClick={handleGenerateMatches}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-lg font-gotham font-bold text-white shadow-lg hover:bg-primary-600 transition-all border-2 border-dark hover:scale-105"
                            >
                                <span className="text-2xl">⚙️</span>
                                Generate Matches
                            </button>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="bg-success rounded-xl border-4 border-success-700 text-white px-6 py-4 font-gotham font-bold shadow-lg">
                            ✅ {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="bg-red-600 rounded-xl border-4 border-red-800 text-white px-6 py-4 font-gotham font-bold shadow-lg">
                            ❌ {flash.error}
                        </div>
                    )}
                    {flash?.warning && (
                        <div className="bg-accent rounded-xl border-4 border-accent-700 text-dark px-6 py-4 font-gotham font-bold shadow-lg">
                            ⚠️ {flash.warning}
                        </div>
                    )}

                    {/* Matches Content */}
                    {matches.length === 0 ? (
                        <div className="bg-white rounded-2xl p-16 text-center shadow-lg border-4 border-accent">
                            <div className="text-8xl mb-6">🎾</div>
                            <h3 className="text-3xl font-bold font-raverist text-dark mb-4">No Matches Generated</h3>
                            <p className="text-xl font-gotham text-neutral-600 mb-4">
                                Make sure you have set up groups and assigned participants before generating matches.
                            </p>
                            <button
                                onClick={handleGenerateMatches}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-gotham font-bold text-white shadow-lg hover:bg-primary-600 transition-all border-4 border-dark"
                            >
                                <span className="text-2xl">⚙️</span>
                                Generate Matches Now
                            </button>
                        </div>
                    ) : (
                        Object.entries(matchesByGroup).map(([groupName, groupMatches]) => (
                            <div key={groupName} className="bg-white rounded-2xl p-8 shadow-lg border-4 border-success">
                                <h3 className="text-2xl font-bold font-raverist text-success mb-6 flex items-center gap-3">
                                    <span className="text-3xl">🏆</span>
                                    {groupName}
                                </h3>
                                
                                <div className="space-y-4">
                                    {groupMatches.map((match) => (
                                        <div key={match.id} className="bg-neutral-100 rounded-xl p-6 border-2 border-neutral-300 hover:border-primary transition-all">
                                            {/* Match Header */}
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex-1">
                                                    {/* Teams */}
                                                    <div className="flex items-center gap-4 mb-3">
                                                        <div className="flex-1 bg-white rounded-lg p-3 border-2 border-primary">
                                                            <div className="text-sm font-gotham font-bold text-primary mb-1">TEAM 1</div>
                                                            <div className="font-gotham text-dark">{match.team1?.player_1} - {match.team1?.player_2}</div>
                                                        </div>
                                                        <div className="text-2xl font-bold font-raverist text-neutral-600">VS</div>
                                                        <div className="flex-1 bg-white rounded-lg p-3 border-2 border-success">
                                                            <div className="text-sm font-gotham font-bold text-success mb-1">TEAM 2</div>
                                                            <div className="font-gotham text-dark">{match.team2?.player_1} - {match.team2?.player_2}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Status Badge */}
                                                <div className="ml-4">
                                                    <span className={`px-4 py-2 text-sm font-gotham font-bold rounded-xl border-2 ${getStatusColor(match.status)}`}>
                                                        {getStatusIcon(match.status)} {match.status.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Match Details */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-sm font-gotham font-bold text-neutral-600 mb-2">🏟️ COURT</label>
                                                    <select
                                                        value={match.court_id || ''}
                                                        onChange={(e) => handleCourtChange(match.id, e.target.value)}
                                                        className="block w-full font-gotham rounded-lg border-2 border-neutral-300 focus:border-primary focus:ring-primary"
                                                    >
                                                        <option value="">Select Court</option>
                                                        {courts.map((court) => (
                                                            <option key={court.id} value={court.id}>
                                                                Court {court.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-gotham font-bold text-neutral-600 mb-2">📅 SCHEDULED TIME</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={match.scheduled_time ? new Date(match.scheduled_time).toISOString().slice(0, 16) : ''}
                                                        onChange={(e) => handleScheduledTimeChange(match.id, e.target.value)}
                                                        className="block w-full font-gotham rounded-lg border-2 border-neutral-300 focus:border-primary focus:ring-primary"
                                                    />
                                                </div>
                                            </div>
                                            
                                            {/* Actions */}
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleStartMatch(match.id)}
                                                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-gotham font-bold text-white bg-success rounded-xl hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-dark"
                                                    disabled={match.status === 'completed' || match.status === 'cancelled'}
                                                >
                                                    <span className="text-lg">🎾</span>
                                                    {match.status === 'in_progress' || match.status === 'upcoming' ? 'Open Match' : 'Start Match'}
                                                </button>
                                                
                                                {(match.status === 'upcoming' || match.status === 'in_progress') && (
                                                    <button
                                                        onClick={() => handleResetMatch(match.id)}
                                                        className="inline-flex items-center gap-2 px-5 py-3 text-sm font-gotham font-bold text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-all border-2 border-dark"
                                                        title="Reset match to scheduled"
                                                    >
                                                        <span className="text-lg">🔄</span>
                                                        Reset
                                                    </button>
                                                )}
                                                
                                                <button
                                                    onClick={() => handleDeleteMatch(match.id)}
                                                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-gotham font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all border-2 border-dark"
                                                >
                                                    <span className="text-lg">🗑️</span>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
