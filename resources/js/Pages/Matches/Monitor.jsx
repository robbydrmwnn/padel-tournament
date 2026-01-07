import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Monitor({ category, match, autoRefresh = true }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Auto-refresh every 2 seconds to get latest score
    useEffect(() => {
        if (autoRefresh && match.status === 'in_progress') {
            const interval = setInterval(() => {
                window.location.reload();
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, match.status]);

    // Update clock every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const getPointDisplay = (points) => {
        if (points === 'AD') return 'AD';
        return points || '0';
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const getMatchStatus = () => {
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

    const isMatchStarted = match.match_started_at !== null;
    const isWarmup = match.warmup_started_at && !match.warmup_ended_at && !match.warmup_skipped;

    return (
        <>
            <Head title={`Match Monitor - Court ${match.court?.name || ''}`} />

            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
                {/* Header */}
                <div className="bg-black bg-opacity-30 backdrop-blur-sm p-6 shadow-lg">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">{category.event.name}</h1>
                            <p className="text-xl text-gray-200">{category.name} - {match.phase === 'group' ? `Group ${match.group?.name}` : 'Knockout'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-semibold">Court {match.court?.name || 'TBA'}</p>
                            <p className="text-lg text-gray-200">{formatTime(currentTime)}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-6 py-12">
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
                            <p className="text-3xl text-gray-300">
                                {match.team1.player_2}
                            </p>
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
                            <p className="text-3xl text-gray-300">
                                {match.team2.player_2}
                            </p>
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

                    {/* Warm-up Message */}
                    {isWarmup && (
                        <div className="bg-yellow-500 bg-opacity-20 backdrop-blur-sm rounded-3xl p-12 shadow-2xl text-center">
                            <p className="text-5xl font-bold mb-4">⏱️ WARM-UP IN PROGRESS</p>
                            <p className="text-2xl text-gray-200">Match will start shortly</p>
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

                    {/* Scheduled Message */}
                    {match.status === 'scheduled' && !match.warmup_started_at && (
                        <div className="bg-blue-500 bg-opacity-20 backdrop-blur-sm rounded-3xl p-12 shadow-2xl text-center">
                            <p className="text-4xl font-bold mb-4">📅 UPCOMING MATCH</p>
                            {match.scheduled_time && (
                                <p className="text-2xl text-gray-200">
                                    Scheduled: {new Date(match.scheduled_time).toLocaleString()}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-30 backdrop-blur-sm p-4">
                    <div className="max-w-7xl mx-auto text-center text-gray-300">
                        <p className="text-lg">
                            Scoring: {match.phase === 'group' 
                                ? `Best of ${category.group_best_of_games} • ${category.group_scoring_type === 'no_ad' ? 'No-Ad' : category.group_scoring_type === 'traditional' ? 'Traditional' : 'Advantage Limit'}`
                                : `Best of ${category.knockout_best_of_games} • ${category.knockout_scoring_type === 'no_ad' ? 'No-Ad' : category.knockout_scoring_type === 'traditional' ? 'Traditional' : 'Advantage Limit'}`
                            }
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}


