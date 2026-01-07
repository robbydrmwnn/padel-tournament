import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function CourtMonitor({ court, match }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [warmupTimeRemaining, setWarmupTimeRemaining] = useState(0);

    // Calculate initial warmup time remaining
    useEffect(() => {
        if (match && match.warmup_started_at && !match.warmup_ended_at && !match.warmup_skipped) {
            const warmupDuration = match.category.warmup_minutes * 60; // in seconds
            const startedAt = new Date(match.warmup_started_at).getTime();
            const now = Date.now();
            const elapsed = Math.floor((now - startedAt) / 1000);
            const remaining = Math.max(0, warmupDuration - elapsed);
            setWarmupTimeRemaining(remaining);
        }
    }, [match]);

    // Auto-refresh every 2 seconds to get latest match/score
    // Using Inertia's router.reload() instead of window.location.reload()
    // This prevents full page reloads and font flickering
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['match', 'court'], preserveScroll: true, preserveState: true });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Update clock and warmup timer every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
            
            // Update warmup countdown
            if (match && match.warmup_started_at && !match.warmup_ended_at && !match.warmup_skipped) {
                setWarmupTimeRemaining(prev => Math.max(0, prev - 1));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [match]);

    const getPointDisplay = (points) => {
        if (points === 'AD') return 'AD';
        return points || '0';
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatCountdown = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getMatchStatus = () => {
        if (!match) return 'No Match Scheduled';
        if (match.status === 'upcoming' && !match.warmup_started_at) {
            return 'Upcoming Match';
        }
        if (match.status === 'scheduled' && !match.warmup_started_at) {
            return 'Scheduled';
        }
        if (match.warmup_started_at && !match.warmup_ended_at && !match.warmup_skipped) {
            return 'Warm-up';
        }
        if (match.status === 'in_progress') {
            return 'In Progress';
        }
        if (match.status === 'completed') {
            return 'Match Complete';
        }
        return match.status;
    };

    const isMatchStarted = match && match.match_started_at !== null;
    const isWarmup = match && match.warmup_started_at && !match.warmup_ended_at && !match.warmup_skipped;

    return (
        <>
            <Head title={`Court ${court.name} Monitor`} />

            <div className="h-screen w-screen overflow-hidden bg-dark flex flex-col">
                {/* Header Bar */}
                <div className="bg-primary shadow-2xl border-b-4 border-accent">
                    <div className="max-w-[1920px] mx-auto px-8 py-6">
                        <div className="flex justify-between items-center">
                            {/* Left: Event & Category Info */}
                            <div className="flex items-center gap-6">
                                <img src="/logo/logo.jpeg" alt="Logo" className="h-16 w-auto object-contain" />
                                <div>
                                    <h1 className="text-3xl font-bold font-raverist text-white">{court.event.name}</h1>
                                    {match && (
                                        <p className="text-lg font-gotham text-neutral-200">
                                            {match.category.name} • {match.phase === 'group' ? `Group ${match.group?.name}` : 'Knockout Phase'}
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            {/* Right: Court & Time */}
                            <div className="text-right">
                                <p className="text-5xl font-bold font-raverist text-accent">COURT {court.name}</p>
                                <p className="text-2xl font-gotham text-white mt-1">{formatTime(currentTime)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-[1920px] mx-auto px-8 py-8 h-full flex items-center">
                    {!match ? (
                        /* Default View - No Match Scheduled */
                        <div className="space-y-6 w-full">
                            {/* Main Message */}
                            <div className="bg-neutral-900 rounded-3xl p-12 shadow-2xl text-center border-4 border-primary">
                                <div className="text-8xl mb-6">🎾</div>
                                <h2 className="text-6xl font-bold font-raverist text-white mb-3">COURT {court.name}</h2>
                                <p className="text-3xl font-gotham text-accent mb-8">Ready for Action</p>
                                
                                <div className="mt-8 pt-6 border-t-2 border-neutral-700">
                                    <p className="text-3xl font-gotham text-neutral-400 mb-4">No Active Match</p>
                                    <p className="text-2xl font-gotham text-neutral-500">Waiting for next match assignment...</p>
                                </div>
                            </div>

                            {/* Event Info Card */}
                            <div className="bg-primary rounded-2xl p-8 shadow-xl border-2 border-accent">
                                <div className="text-center">
                                    <p className="text-4xl font-bold font-raverist text-white mb-2">{court.event.name}</p>
                                    <p className="text-2xl font-gotham text-neutral-200">{court.event.location}</p>
                                    {court.event.start_date && (
                                        <p className="text-xl font-gotham text-neutral-300 mt-4">
                                            {new Date(court.event.start_date).toLocaleDateString()} - {new Date(court.event.end_date).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-neutral-900 rounded-2xl p-8 shadow-xl border-2 border-success text-center">
                                <p className="text-3xl font-bold font-raverist text-accent mb-6">ℹ️ INFORMATION</p>
                                <div className="space-y-3 text-xl font-gotham text-neutral-300">
                                    <p>• This screen will automatically update when a match is assigned</p>
                                    <p>• Scores are displayed in real-time during matches</p>
                                    <p>• No manual refresh needed</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full space-y-6">
                            {/* Status Badge */}
                            <div className="text-center mb-6">
                                <span className="inline-block px-10 py-4 text-3xl font-bold font-raverist bg-accent text-dark rounded-2xl shadow-2xl border-4 border-dark">
                                    {getMatchStatus().toUpperCase()}
                                </span>
                            </div>

                            {/* Team Names and Games Score */}
                            <div className="grid grid-cols-[1fr_auto_1fr] gap-8 items-center mb-6">
                                {/* Team 1 Card */}
                                <div className="bg-success rounded-3xl p-6 shadow-2xl border-4 border-dark text-right">
                                    <p className="text-xl font-gotham text-white opacity-80 mb-3">TEAM 1</p>
                                    <h2 className="text-4xl font-bold font-raverist text-white mb-2">
                                        {match.team1.player_1}
                                    </h2>
                                    <h2 className="text-4xl font-bold font-raverist text-white">
                                        {match.team1.player_2}
                                    </h2>
                                </div>

                                {/* Games Score - Centerpiece */}
                                <div className="bg-neutral-900 rounded-3xl p-8 shadow-2xl border-4 border-accent min-w-[350px]">
                                    <p className="text-2xl font-gotham text-accent text-center mb-4">GAMES WON</p>
                                    <div className="flex justify-center items-center gap-8">
                                        <div className={`text-8xl font-bold font-raverist transition-colors ${match.team1_score > match.team2_score ? 'text-accent' : 'text-white'}`}>
                                            {match.team1_score || 0}
                                        </div>
                                        <div className="text-6xl font-bold font-raverist text-neutral-600">-</div>
                                        <div className={`text-8xl font-bold font-raverist transition-colors ${match.team2_score > match.team1_score ? 'text-accent' : 'text-white'}`}>
                                            {match.team2_score || 0}
                                        </div>
                                    </div>
                                </div>

                                {/* Team 2 Card */}
                                <div className="bg-primary rounded-3xl p-6 shadow-2xl border-4 border-dark text-left">
                                    <p className="text-xl font-gotham text-white opacity-80 mb-3">TEAM 2</p>
                                    <h2 className="text-4xl font-bold font-raverist text-white mb-2">
                                        {match.team2.player_1}
                                    </h2>
                                    <h2 className="text-4xl font-bold font-raverist text-white">
                                        {match.team2.player_2}
                                    </h2>
                                </div>
                            </div>

                            {/* Current Game Score */}
                            {isMatchStarted && !isWarmup && (
                                <div className="bg-neutral-900 rounded-3xl p-10 shadow-2xl border-4 border-accent">
                                    <p className="text-3xl font-bold font-raverist text-accent text-center mb-6">CURRENT GAME</p>
                                    <div className="flex justify-center items-center gap-12">
                                        {/* Team 1 Points */}
                                        <div className="text-center bg-success bg-opacity-20 rounded-2xl p-6 border-4 border-success min-w-[250px]">
                                            <p className="text-xl font-gotham text-success mb-3">TEAM 1</p>
                                            <div className="text-[120px] font-bold font-raverist text-success leading-none">
                                                {getPointDisplay(match.current_game_team1_points)}
                                            </div>
                                        </div>
                                        
                                        {/* Separator */}
                                        <div className="text-7xl font-bold font-raverist text-accent">:</div>
                                        
                                        {/* Team 2 Points */}
                                        <div className="text-center bg-primary bg-opacity-20 rounded-2xl p-6 border-4 border-primary min-w-[250px]">
                                            <p className="text-xl font-gotham text-primary mb-3">TEAM 2</p>
                                            <div className="text-[120px] font-bold font-raverist text-primary leading-none">
                                                {getPointDisplay(match.current_game_team2_points)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Warm-up Message with Countdown */}
                            {isWarmup && (
                                <div className="bg-accent rounded-3xl p-10 shadow-2xl text-center border-4 border-dark">
                                    <p className="text-4xl font-bold font-raverist text-dark mb-6">⏱️ WARM-UP IN PROGRESS</p>
                                    
                                    {/* Countdown Timer */}
                                    <div className="my-8 bg-dark bg-opacity-30 rounded-2xl p-8">
                                        <div className="text-[140px] font-bold font-raverist text-dark leading-none">
                                            {formatCountdown(warmupTimeRemaining)}
                                        </div>
                                        <p className="text-3xl font-gotham text-dark mt-4">
                                            {warmupTimeRemaining > 0 ? 'TIME REMAINING' : 'WARM-UP COMPLETE'}
                                        </p>
                                    </div>
                                    
                                    {warmupTimeRemaining === 0 && (
                                        <p className="text-2xl font-bold font-gotham text-dark mt-4 animate-pulse">
                                            🎾 READY TO START MATCH
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Match Complete */}
                            {match.status === 'completed' && match.winner_id && (
                                <div className="bg-success rounded-3xl p-10 shadow-2xl text-center border-4 border-accent">
                                    <div className="text-7xl mb-6">🏆</div>
                                    <p className="text-4xl font-bold font-raverist text-white mb-6">MATCH WINNER</p>
                                    <div className="bg-white bg-opacity-20 rounded-2xl p-6">
                                        <p className="text-5xl font-bold font-raverist text-accent">
                                            {match.winner_id === match.team1_id 
                                                ? `${match.team1.player_1}`
                                                : `${match.team2.player_1}`
                                            }
                                        </p>
                                        <p className="text-5xl font-bold font-raverist text-accent">
                                            {match.winner_id === match.team1_id 
                                                ? `${match.team1.player_2}`
                                                : `${match.team2.player_2}`
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Upcoming/Scheduled Message */}
                            {(match.status === 'upcoming' || match.status === 'scheduled') && !match.warmup_started_at && (
                                <div className="bg-neutral-900 rounded-3xl p-10 shadow-2xl text-center border-4 border-primary">
                                    <p className="text-4xl font-bold font-raverist text-accent mb-6">📅 UPCOMING MATCH</p>
                                    {match.scheduled_time && (
                                        <p className="text-2xl font-gotham text-white mb-4">
                                            Scheduled: {new Date(match.scheduled_time).toLocaleString()}
                                        </p>
                                    )}
                                    {match.status === 'upcoming' && (
                                        <p className="text-xl font-gotham text-accent mt-4">
                                            🔒 Court Reserved - Waiting for warm-up to start
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-primary shadow-2xl border-t-4 border-accent flex-shrink-0">
                    <div className="max-w-[1920px] mx-auto px-8 py-4">
                        <div className="text-center">
                            {match && (
                                <p className="text-xl font-gotham text-white">
                                    <span className="font-bold text-accent">SCORING:</span> {match.phase === 'group' 
                                        ? `Best of ${match.category.group_best_of_games} Games • ${match.category.group_scoring_type === 'no_ad' ? 'No-Ad Scoring' : match.category.group_scoring_type === 'traditional' ? 'Traditional' : 'Advantage Limit'}`
                                        : `Best of ${match.category.knockout_best_of_games} Games • ${match.category.knockout_scoring_type === 'no_ad' ? 'No-Ad Scoring' : match.category.knockout_scoring_type === 'traditional' ? 'Traditional' : 'Advantage Limit'}`
                                    }
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

