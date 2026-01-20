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
        if (scheduledTime) {
            router.patch(route('categories.matches.update', [category.id, matchId]), {
                scheduled_time: scheduledTime,
            }, {
                preserveScroll: true,
            });
        }
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

    // Sort matches within each group by scheduled time, then by court name
    Object.keys(matchesByGroup).forEach(groupName => {
        matchesByGroup[groupName].sort((a, b) => {
            // First, sort by scheduled time
            if (a.scheduled_time && b.scheduled_time) {
                const timeCompare = new Date(a.scheduled_time) - new Date(b.scheduled_time);
                if (timeCompare !== 0) return timeCompare;
            } else if (a.scheduled_time) {
                return -1; // a has time, b doesn't - a comes first
            } else if (b.scheduled_time) {
                return 1; // b has time, a doesn't - b comes first
            }
            
            // If times are equal (or both null), sort by court name
            const courtA = a.court?.name || '';
            const courtB = b.court?.name || '';
            return courtA.localeCompare(courtB, undefined, { numeric: true });
        });
    });

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
                    <div className="bg-success rounded-2xl p-8 shadow-lg border-4 border-accent">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-bold font-raverist text-white mb-2">Match Management</h1>
                                <p className="text-xl font-gotham text-white">{category.name} - Group Phase</p>
                            </div>
                            <button
                                onClick={handleGenerateMatches}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-lg font-gotham font-bold text-success shadow-lg hover:bg-white-600 transition-all border-2 border-accent hover:scale-105"
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
                                
                                <div className="space-y-1.5">
                                    {groupMatches.map((match) => (
                                        <div key={match.id} className="bg-neutral-100 rounded-lg p-2.5 border border-neutral-300 hover:border-primary transition-all">
                                            <div className="flex items-center gap-2">
                                                {/* Teams - Compact */}
                                                <div className="flex-1 flex items-center gap-2">
                                                    <div className="font-gotham text-xs text-dark bg-white px-2 py-1.5 rounded border border-primary min-w-[150px]">
                                                        <span className="font-bold">{match.team1?.player_1}</span> / {match.team1?.player_2}
                                                    </div>
                                                    <span className="text-sm font-bold font-raverist text-neutral-600">vs</span>
                                                    <div className="font-gotham text-xs text-dark bg-white px-2 py-1.5 rounded border border-success min-w-[150px]">
                                                        <span className="font-bold">{match.team2?.player_1}</span> / {match.team2?.player_2}
                                                    </div>
                                                </div>
                                                
                                                {/* Status Badge */}
                                                <span className={`px-2 py-1 text-xs font-gotham font-bold rounded border ${getStatusColor(match.status)} whitespace-nowrap`}>
                                                    {getStatusIcon(match.status)} {match.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                                
                                                {/* Court Select */}
                                                <select
                                                    value={match.court_id || ''}
                                                    onChange={(e) => handleCourtChange(match.id, e.target.value)}
                                                    className="font-gotham text-xs rounded border border-neutral-300 focus:border-primary focus:ring-primary py-1 px-1.5 w-24"
                                                >
                                                    <option value="">Court</option>
                                                    {courts.map((court) => (
                                                        <option key={court.id} value={court.id}>
                                                            {court.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                
                                                {/* Time Input */}
                                                <input
                                                    type="datetime-local"
                                                    defaultValue={match.scheduled_time ? new Date(match.scheduled_time).toISOString().slice(0, 16) : ''}
                                                    onBlur={(e) => handleScheduledTimeChange(match.id, e.target.value)}
                                                    className="font-gotham text-xs rounded border border-neutral-300 focus:border-primary focus:ring-primary py-1 px-1.5 w-36"
                                                />
                                                
                                                {/* Actions - Ultra Compact */}
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleStartMatch(match.id)}
                                                        className="px-2 py-1 text-sm font-gotham font-bold text-white bg-success rounded hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-dark"
                                                        disabled={match.status === 'completed' || match.status === 'cancelled' || !match.court_id}
                                                        title={
                                                            !match.court_id 
                                                                ? 'Assign court first' 
                                                                : (match.status === 'in_progress' || match.status === 'upcoming' ? 'Open Match' : 'Start Match')
                                                        }
                                                    >
                                                        🎾
                                                    </button>
                                                    
                                                    {(match.status === 'upcoming' || match.status === 'in_progress') && (
                                                        <button
                                                            onClick={() => handleResetMatch(match.id)}
                                                            className="px-2 py-1 text-sm font-gotham font-bold text-white bg-orange-600 rounded hover:bg-orange-700 transition-all border border-dark"
                                                            title="Reset match"
                                                        >
                                                            🔄
                                                        </button>
                                                    )}
                                                    
                                                    <button
                                                        onClick={() => handleDeleteMatch(match.id)}
                                                        className="px-2 py-1 text-sm font-gotham font-bold text-white bg-red-600 rounded hover:bg-red-700 transition-all border border-dark"
                                                        title="Delete match"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
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
