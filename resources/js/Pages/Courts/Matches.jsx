import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';

export default function Matches({ event, court, matches = [] }) {
    // Convert UTC datetime to local datetime string for datetime-local input
    const toLocalDateTimeString = (utcDateString) => {
        if (!utcDateString) return '';
        const date = new Date(utcDateString);
        // Adjust for timezone offset to get local time
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().slice(0, 16);
    };

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

    const handleStartMatch = async (categoryId, matchId) => {
        const match = matches.find(m => m.id === matchId);
        
        if (!match.court_id) {
            alert('❌ Please assign a court before starting this match.');
            return;
        }
        
        if (!match.team1_id || !match.team2_id) {
            alert('❌ Both teams must be assigned before starting the match. Please resolve participants first.');
            return;
        }
        
        // If match is already started (in_progress or upcoming), just open it
        if (match.status === 'in_progress' || match.status === 'upcoming') {
            router.visit(route('categories.matches.referee', [categoryId, matchId]));
            return;
        }
        
        // Otherwise, start the match prep
        try {
            const response = await axios.post(route('categories.matches.startPrep', [categoryId, matchId]));
            
            if (response.data.success) {
                router.reload({
                    onSuccess: () => {
                        router.visit(route('categories.matches.referee', [categoryId, matchId]));
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

    const handleResetMatch = (categoryId, matchId) => {
        if (confirm('Reset this match?\n\n• Clears all scores and progress\n• Returns match to scheduled state\n• Frees up the court for other matches\n\nContinue?')) {
            router.post(route('categories.matches.reset', [categoryId, matchId]));
        }
    };

    return (
        <AuthenticatedLayout header={`Court ${court.name} - Matches`}>
            <Head title={`Court ${court.name} - Matches`} />

            <div className="py-12 bg-dark min-h-screen">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-6">
                    {/* Breadcrumb */}
                    <nav className="text-sm font-gotham text-neutral-400">
                        <Link href={route('events.index')} className="hover:text-white transition-colors">Events</Link>
                        {' / '}
                        <Link href={route('events.show', event.id)} className="hover:text-white transition-colors">
                            {event.name}
                        </Link>
                        {' / '}
                        <span className="text-white font-bold">Court {court.name} Matches</span>
                    </nav>

                    {/* Header Banner */}
                    <div className="bg-success rounded-2xl p-8 shadow-lg border-4 border-accent">
                        <div className="flex justify-between items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-3">
                                    <span className="text-5xl">🎾</span>
                                    <div>
                                        <h1 className="text-4xl font-bold font-raverist text-white">Court {court.name}</h1>
                                        <p className="text-xl font-gotham text-neutral-200">{event.name}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Link
                                    href={route('events.show', event.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-gotham font-bold text-primary shadow-lg hover:bg-neutral-100 transition-all border-2 border-accent"
                                >
                                    <span className="text-xl">←</span>
                                    Back to Event
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Court Selection - Show all courts for easy switching */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border-4 border-primary">
                        <h3 className="text-xl font-bold font-raverist text-dark mb-4">Switch Court</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {event.courts.map((c) => (
                                <Link
                                    key={c.id}
                                    href={route('events.courts.matches', [event.id, c.id])}
                                    className={`px-4 py-3 rounded-xl font-gotham font-bold transition-all border-2 text-center ${
                                        c.id === court.id
                                            ? 'bg-accent text-dark border-dark scale-105'
                                            : 'bg-neutral-100 text-dark border-neutral-300 hover:bg-neutral-200'
                                    }`}
                                >
                                    <div className="text-2xl mb-1">🎾</div>
                                    <div className="text-sm">{c.name}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Matches List */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-success">
                        <h3 className="text-2xl font-bold font-raverist text-success mb-6 flex items-center gap-3">
                            <span className="text-3xl">📋</span>
                            Matches ({matches.length})
                        </h3>
                        
                        {matches.length > 0 ? (
                            <div className="space-y-1.5">
                                {matches.map((match) => (
                                    <div key={match.id} className="bg-neutral-100 rounded-lg p-2.5 border border-neutral-300 hover:border-primary transition-all">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            {/* Category & Phase Badges */}
                                            <div className="flex gap-1.5">
                                                <span className="font-gotham text-xs bg-primary text-white px-2 py-0.5 rounded border border-primary-700 font-bold">
                                                    {match.category?.name}
                                                </span>
                                                {match.tournament_phase && (
                                                    <span className="font-gotham text-xs bg-success text-white px-2 py-0.5 rounded border border-success-700 font-bold">
                                                        {match.tournament_phase.name}
                                                    </span>
                                                )}
                                                {match.group && (
                                                    <span className="font-gotham text-xs bg-neutral-600 text-white px-2 py-0.5 rounded border border-neutral-800 font-bold">
                                                        {match.group.name}
                                                    </span>
                                                )}
                                            </div>
                                        {/* </div>
                                        
                                        <div className="flex items-center gap-2"> */}
                                            {/* Teams - Compact */}
                                            <div className="flex-1 flex items-center gap-2">
                                                {match.team1_id ? (
                                                    <div className="font-gotham text-xs text-dark bg-white px-2 py-1.5 rounded border border-primary min-w-[150px]">
                                                        <span className="font-bold">{match.team1?.player_1}</span> / {match.team1?.player_2}
                                                    </div>
                                                ) : (
                                                    <div className="font-gotham text-xs text-neutral-500 bg-neutral-200 px-2 py-1.5 rounded border border-neutral-400 min-w-[150px]">
                                                        {match.team1_template?.replace(/_/g, ' ') || 'TBD'}
                                                    </div>
                                                )}
                                                <span className="text-sm font-bold font-raverist text-neutral-600">vs</span>
                                                {match.team2_id ? (
                                                    <div className="font-gotham text-xs text-dark bg-white px-2 py-1.5 rounded border border-success min-w-[150px]">
                                                        <span className="font-bold">{match.team2?.player_1}</span> / {match.team2?.player_2}
                                                    </div>
                                                ) : (
                                                    <div className="font-gotham text-xs text-neutral-500 bg-neutral-200 px-2 py-1.5 rounded border border-neutral-400 min-w-[150px]">
                                                        {match.team2_template?.replace(/_/g, ' ') || 'TBD'}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Status Badge */}
                                            <span className={`px-2 py-1 text-xs font-gotham font-bold rounded border ${getStatusColor(match.status)} whitespace-nowrap`}>
                                                {getStatusIcon(match.status)} {match.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                            
                                            {/* Time Input - Shows local time */}
                                            <input
                                                type="datetime-local"
                                                defaultValue={match.scheduled_time ? new Date(match.scheduled_time).toISOString().slice(0, 16) : ''}
                                                readOnly
                                                className="font-gotham text-xs rounded border border-neutral-300 bg-neutral-50 py-1 px-1.5 w-36"
                                            />
                                            
                                            {/* Actions */}
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleStartMatch(match.category_id, match.id)}
                                                    className="px-2 py-1 text-sm font-gotham font-bold text-white bg-success rounded hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-dark"
                                                    disabled={match.status === 'completed' || match.status === 'cancelled' || !match.court_id || !match.team1_id || !match.team2_id}
                                                    title={
                                                        !match.court_id 
                                                            ? 'Assign court first'
                                                            : !match.team1_id || !match.team2_id
                                                                ? 'Resolve participants first'
                                                                : (match.status === 'in_progress' || match.status === 'upcoming' ? 'Open Match' : 'Start Match')
                                                    }
                                                >
                                                    🎾
                                                </button>
                                                
                                                {(match.status === 'upcoming' || match.status === 'in_progress') && (
                                                    <button
                                                        onClick={() => handleResetMatch(match.category_id, match.id)}
                                                        className="px-2 py-1 text-sm font-gotham font-bold text-white bg-orange-600 rounded hover:bg-orange-700 transition-all border border-dark"
                                                        title="Reset match"
                                                    >
                                                        🔄
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-neutral-100 rounded-xl">
                                <div className="text-8xl mb-4">📋</div>
                                <h4 className="text-2xl font-bold font-raverist text-dark mb-2">No Matches Scheduled</h4>
                                <p className="text-lg font-gotham text-neutral-600">
                                    No matches have been scheduled for this court yet.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
