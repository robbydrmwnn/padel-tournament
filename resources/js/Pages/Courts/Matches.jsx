import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { Building2, ChevronRight, ArrowLeft, ClipboardList, Play, RotateCcw, Calendar, CheckCircle, XCircle, Clock, Timer } from 'lucide-react';

export default function Matches({ event, court, matches = [] }) {
    const toLocalDateTimeString = (utcDateString) => {
        if (!utcDateString) return '';
        const date = new Date(utcDateString);
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().slice(0, 16);
    };

    const getStatusStyle = (status) => {
        const styles = {
            scheduled: 'bg-zinc-200 text-zinc-700 border-zinc-300',
            upcoming: 'bg-black text-white border-zinc-700',
            in_progress: 'bg-accent text-black border-accent-600',
            completed: 'bg-zinc-600 text-white border-zinc-700',
            cancelled: 'bg-red-600 text-white border-red-800',
        };
        return styles[status] || 'bg-zinc-200 text-zinc-700 border-zinc-300';
    };

    const StatusIcon = ({ status, className = 'h-3 w-3' }) => {
        const icons = {
            scheduled: <Calendar className={className} />,
            upcoming: <Clock className={className} />,
            in_progress: <Timer className={className} />,
            completed: <CheckCircle className={className} />,
            cancelled: <XCircle className={className} />,
        };
        return icons[status] || <Clock className={className} />;
    };

    const handleStartMatch = async (categoryId, matchId) => {
        const match = matches.find(m => m.id === matchId);

        if (!match.court_id) {
            alert('Please assign a court before starting this match.');
            return;
        }

        const isIndividual = match?.category?.participant_mode === 'individual';
        if (isIndividual) {
            const missingPlayers = !match.side1_player1_id || !match.side1_player2_id || !match.side2_player1_id || !match.side2_player2_id;
            if (missingPlayers) {
                alert('All 4 players must be assigned before starting the match.');
                return;
            }
        } else {
            if (!match.team1_id || !match.team2_id) {
                alert('Both teams must be assigned before starting the match. Please resolve participants first.');
                return;
            }
        }

        if (match.status === 'in_progress' || match.status === 'upcoming') {
            router.visit(route('categories.matches.referee', [categoryId, matchId]));
            return;
        }

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
                alert(error.response.data.error);
            } else {
                alert('An error occurred. Please try again.');
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

            <div className="py-12 bg-neutral-100 min-h-screen">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-6">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 text-sm font-ffdin text-zinc-500">
                        <Link href={route('events.index')} className="hover:text-black transition-colors">Events</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <Link href={route('events.show', event.id)} className="hover:text-black transition-colors">{event.name}</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-black font-bold">Court {court.name} Matches</span>
                    </nav>

                    {/* Header Banner */}
                    <div className="bg-black rounded-2xl p-8 shadow-lg border border-zinc-700">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Building2 className="h-10 w-10 text-zinc-400" />
                                <div>
                                    <h1 className="text-4xl font-bold font-ffdin text-white tracking-wide">Court {court.name}</h1>
                                    <p className="text-xl font-ffdin text-zinc-400">{event.name}</p>
                                </div>
                            </div>
                            <Link
                                href={route('events.show', event.id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-5 py-3 text-sm font-ffdin font-bold text-white shadow-lg hover:bg-zinc-700 transition-all border border-zinc-600"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Event
                            </Link>
                        </div>
                    </div>

                    {/* Court Selection */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-zinc-200">
                        <h3 className="text-xl font-bold font-ffdin text-black mb-4">Switch Court</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {event.courts.map((c) => (
                                <Link
                                    key={c.id}
                                    href={route('events.courts.matches', [event.id, c.id])}
                                    className={`flex flex-col items-center px-4 py-3 rounded-xl font-ffdin font-bold transition-all border text-center ${
                                        c.id === court.id
                                            ? 'bg-black text-white border-zinc-700 scale-105'
                                            : 'bg-zinc-50 text-black border-zinc-200 hover:bg-zinc-100'
                                    }`}
                                >
                                    <Building2 className="h-5 w-5 mb-1 opacity-70" />
                                    <div className="text-sm">{c.name}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Matches List */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-zinc-200">
                        <h3 className="text-2xl font-bold font-ffdin text-black mb-6 flex items-center gap-3">
                            <ClipboardList className="h-6 w-6 text-zinc-400" />
                            Matches ({matches.length})
                        </h3>

                        {matches.length > 0 ? (
                            <div className="space-y-1.5">
                                {matches.map((match) => {
                                    const isIndividual = match?.category?.participant_mode === 'individual';
                                    const side1Label = isIndividual
                                        ? `${match.side1_player1?.player_1 || ''} / ${match.side1_player2?.player_1 || ''}`.trim()
                                        : null;
                                    const side2Label = isIndividual
                                        ? `${match.side2_player1?.player_1 || ''} / ${match.side2_player2?.player_1 || ''}`.trim()
                                        : null;

                                    const hasSides = !!(match.side1_player1_id && match.side1_player2_id && match.side2_player1_id && match.side2_player2_id);
                                    const hasTeams = !!(match.team1_id && match.team2_id);
                                    const canStart = isIndividual ? hasSides : hasTeams;

                                    return (
                                        <div key={match.id} className="bg-zinc-50 rounded-lg p-2.5 border border-zinc-200 hover:border-black transition-all">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                {/* Category & Group Badges */}
                                                <div className="flex gap-1.5">
                                                    <span className="font-ffdin text-xs bg-black text-white px-2 py-0.5 rounded font-bold">
                                                        {match.category?.name}
                                                    </span>
                                                    {match.group && (
                                                        <span className="font-ffdin text-xs bg-zinc-600 text-white px-2 py-0.5 rounded font-bold">
                                                            {match.group.name}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Teams */}
                                                <div className="flex-1 flex items-center gap-2">
                                                    {isIndividual ? (
                                                        <div className="font-ffdin text-xs text-black bg-white px-2 py-1.5 rounded border border-zinc-300 min-w-[150px]">
                                                            <span className="font-bold">{hasSides ? side1Label : 'TBD'}</span>
                                                        </div>
                                                    ) : match.team1_id ? (
                                                        <div className="font-ffdin text-xs text-black bg-white px-2 py-1.5 rounded border border-zinc-300 min-w-[150px]">
                                                            <span className="font-bold">{match.team1?.player_1}</span> / {match.team1?.player_2}
                                                        </div>
                                                    ) : (
                                                        <div className="font-ffdin text-xs text-zinc-500 bg-zinc-100 px-2 py-1.5 rounded border border-zinc-300 min-w-[150px]">
                                                            {match.team1_template?.replace(/_/g, ' ') || 'TBD'}
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-bold font-ffdin text-zinc-500">vs</span>
                                                    {isIndividual ? (
                                                        <div className="font-ffdin text-xs text-black bg-white px-2 py-1.5 rounded border border-zinc-300 min-w-[150px]">
                                                            <span className="font-bold">{hasSides ? side2Label : 'TBD'}</span>
                                                        </div>
                                                    ) : match.team2_id ? (
                                                        <div className="font-ffdin text-xs text-black bg-white px-2 py-1.5 rounded border border-zinc-300 min-w-[150px]">
                                                            <span className="font-bold">{match.team2?.player_1}</span> / {match.team2?.player_2}
                                                        </div>
                                                    ) : (
                                                        <div className="font-ffdin text-xs text-zinc-500 bg-zinc-100 px-2 py-1.5 rounded border border-zinc-300 min-w-[150px]">
                                                            {match.team2_template?.replace(/_/g, ' ') || 'TBD'}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Score when completed */}
                                                {match.status === 'completed' && (
                                                    <span className="px-2 py-1 text-sm font-ffdin font-bold rounded border border-zinc-300 bg-white text-black whitespace-nowrap">
                                                        {match.team1_score ?? 0} – {match.team2_score ?? 0}
                                                    </span>
                                                )}

                                                {/* Status Badge */}
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-ffdin font-bold rounded border ${getStatusStyle(match.status)} whitespace-nowrap`}>
                                                    <StatusIcon status={match.status} />
                                                    {match.status.replace('_', ' ').toUpperCase()}
                                                </span>

                                                {/* Time */}
                                                <input
                                                    type="datetime-local"
                                                    defaultValue={match.scheduled_time ? new Date(match.scheduled_time).toISOString().slice(0, 16) : ''}
                                                    readOnly
                                                    className="font-ffdin text-xs rounded border border-zinc-300 bg-zinc-50 py-1 px-1.5 w-36"
                                                />

                                                {/* Actions */}
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleStartMatch(match.category_id, match.id)}
                                                        className="p-1.5 text-white bg-black rounded hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                                        disabled={match.status === 'completed' || match.status === 'cancelled' || !match.court_id || !canStart}
                                                        title={
                                                            !match.court_id
                                                                ? 'Assign court first'
                                                                : !canStart
                                                                    ? (isIndividual ? 'Assign all 4 players first' : 'Resolve participants first')
                                                                    : (match.status === 'in_progress' || match.status === 'upcoming' ? 'Open Match' : 'Start Match')
                                                        }
                                                    >
                                                        <Play className="h-4 w-4" />
                                                    </button>

                                                    {(match.status === 'upcoming' || match.status === 'in_progress') && (
                                                        <button
                                                            onClick={() => handleResetMatch(match.category_id, match.id)}
                                                            className="p-1.5 text-white bg-orange-600 rounded hover:bg-orange-700 transition-all"
                                                            title="Reset match"
                                                        >
                                                            <RotateCcw className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-zinc-50 rounded-xl border border-zinc-100">
                                <ClipboardList className="h-16 w-16 mx-auto mb-4 text-zinc-300" />
                                <h4 className="text-2xl font-bold font-ffdin text-black mb-2">No Matches Scheduled</h4>
                                <p className="text-lg font-ffdin text-zinc-500">
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
