import { Head } from '@inertiajs/react';
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
    useEffect(() => {
        const interval = setInterval(() => {
            window.location.reload();
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

            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
                {/* Header */}
                <div className="bg-black bg-opacity-30 backdrop-blur-sm p-6 shadow-lg">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">{court.event.name}</h1>
                            {match && (
                                <p className="text-xl text-gray-200">
                                    {match.category.name} - {match.phase === 'group' ? `Group ${match.group?.name}` : 'Knockout'}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-bold">Court {court.name}</p>
                            <p className="text-lg text-gray-200">{formatTime(currentTime)}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-6 py-12">
                    {!match ? (
                        /* Default View - No Match Scheduled */
                        <div className="space-y-8">
                            {/* Main Message */}
                            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-16 shadow-2xl text-center">
                                <div className="mb-8">
                                    <div className="text-9xl mb-6">🎾</div>
                                    <p className="text-6xl font-bold mb-4">Court {court.name}</p>
                                    <p className="text-3xl text-gray-200">Ready for Action</p>
                                </div>
                                
                                <div className="mt-12 pt-8 border-t border-white border-opacity-20">
                                    <p className="text-2xl text-gray-300 mb-4">No active match</p>
                                    <p className="text-xl text-gray-400">Waiting for next match assignment...</p>
                                </div>
                            </div>

                            {/* Event Info Card */}
                            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                                <div className="text-center">
                                    <p className="text-3xl font-bold mb-2">{court.event.name}</p>
                                    <p className="text-xl text-gray-300">{court.event.location}</p>
                                    {court.event.start_date && (
                                        <p className="text-lg text-gray-400 mt-4">
                                            {new Date(court.event.start_date).toLocaleDateString()} - {new Date(court.event.end_date).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-blue-500 bg-opacity-20 backdrop-blur-sm rounded-2xl p-8 shadow-xl text-center">
                                <p className="text-2xl font-semibold mb-4">ℹ️ Information</p>
                                <div className="space-y-2 text-lg text-gray-200">
                                    <p>• This screen will automatically update when a match is assigned</p>
                                    <p>• Score will be displayed in real-time during matches</p>
                                    <p>• No manual refresh needed</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Status Badge */}
                            <div className="text-center mb-8">
                                <span className="inline-block px-6 py-3 text-2xl font-semibold bg-white bg-opacity-20 backdrop-blur-sm rounded-full">
                                    {getMatchStatus()}
                                </span>
                            </div>

                            {/* Team Names and Games Score */}
                            <div className="grid grid-cols-3 gap-8 items-center mb-12">
                                {/* Team 1 */}
                                <div className="text-right">
                                    <h2 className="text-4xl font-bold mb-2">
                                        {match.team1.player_1}
                                    </h2>
                                    <h2 className="text-4xl font-bold mb-2">
                                        {match.team1.player_2}
                                    </h2>
                                </div>

                                {/* Games Score */}
                                <div className="text-center">
                                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
                                        <p className="text-2xl text-gray-300 mb-4">GAMES</p>
                                        <div className="flex justify-center items-center gap-8">
                                            <div className={`text-8xl font-bold ${match.team1_score > match.team2_score ? 'text-yellow-400' : 'text-white'}`}>
                                                {match.team1_score || 0}
                                            </div>
                                            <div className="text-6xl text-gray-400">-</div>
                                            <div className={`text-8xl font-bold ${match.team2_score > match.team1_score ? 'text-yellow-400' : 'text-white'}`}>
                                                {match.team2_score || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Team 2 */}
                                <div className="text-left">
                                    <h2 className="text-4xl font-bold mb-2">
                                        {match.team2.player_1}
                                    </h2>
                                    <h2 className="text-4xl font-bold mb-2">
                                        {match.team2.player_2}
                                    </h2>
                                </div>
                            </div>

                            {/* Current Game Score */}
                            {isMatchStarted && !isWarmup && (
                                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
                                    <p className="text-3xl text-center text-gray-300 mb-6">CURRENT GAME</p>
                                    <div className="flex justify-center items-center gap-12">
                                        <div className="text-center">
                                            <div className="text-9xl font-bold text-green-400">
                                                {getPointDisplay(match.current_game_team1_points)}
                                            </div>
                                        </div>
                                        <div className="text-7xl text-gray-500">:</div>
                                        <div className="text-center">
                                            <div className="text-9xl font-bold text-blue-400">
                                                {getPointDisplay(match.current_game_team2_points)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Warm-up Message with Countdown */}
                            {isWarmup && (
                                <div className="bg-yellow-500 bg-opacity-20 backdrop-blur-sm rounded-3xl p-12 shadow-2xl text-center">
                                    <p className="text-5xl font-bold mb-6">⏱️ WARM-UP IN PROGRESS</p>
                                    
                                    {/* Countdown Timer */}
                                    <div className="my-8">
                                        <div className="text-9xl font-bold text-yellow-300 mb-4">
                                            {formatCountdown(warmupTimeRemaining)}
                                        </div>
                                        <p className="text-3xl text-gray-200">
                                            {warmupTimeRemaining > 0 ? 'Time Remaining' : 'Warm-up Complete'}
                                        </p>
                                    </div>
                                    
                                    {warmupTimeRemaining === 0 && (
                                        <p className="text-2xl text-yellow-300 mt-4 animate-pulse">
                                            🎾 Ready to Start Match
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Match Complete */}
                            {match.status === 'completed' && match.winner_id && (
                                <div className="bg-green-500 bg-opacity-20 backdrop-blur-sm rounded-3xl p-12 shadow-2xl text-center mt-8">
                                    <p className="text-4xl font-bold mb-4">🏆 WINNER</p>
                                    <p className="text-5xl font-bold">
                                        {match.winner_id === match.team1_id 
                                            ? `${match.team1.player_1} - ${match.team1.player_2}`
                                            : `${match.team2.player_1} - ${match.team2.player_2}`
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Upcoming/Scheduled Message */}
                            {(match.status === 'upcoming' || match.status === 'scheduled') && !match.warmup_started_at && (
                                <div className="bg-blue-500 bg-opacity-20 backdrop-blur-sm rounded-3xl p-12 shadow-2xl text-center">
                                    <p className="text-4xl font-bold mb-4">📅 UPCOMING MATCH</p>
                                    {match.scheduled_time && (
                                        <p className="text-2xl text-gray-200">
                                            Scheduled: {new Date(match.scheduled_time).toLocaleString()}
                                        </p>
                                    )}
                                    {match.status === 'upcoming' && (
                                        <p className="text-xl text-yellow-300 mt-4">
                                            🔒 Court Reserved - Waiting for warm-up to start
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-30 backdrop-blur-sm p-4">
                    <div className="max-w-7xl mx-auto text-center text-gray-300">
                        {match && (
                            <p className="text-lg">
                                Scoring: {match.phase === 'group' 
                                    ? `Best of ${match.category.group_best_of_games} • ${match.category.group_scoring_type === 'no_ad' ? 'No-Ad' : match.category.group_scoring_type === 'traditional' ? 'Traditional' : 'Advantage Limit'}`
                                    : `Best of ${match.category.knockout_best_of_games} • ${match.category.knockout_scoring_type === 'no_ad' ? 'No-Ad' : match.category.knockout_scoring_type === 'traditional' ? 'Traditional' : 'Advantage Limit'}`
                                }
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

