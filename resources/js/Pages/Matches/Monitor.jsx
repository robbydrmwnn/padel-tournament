import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { formatDateTime } from '@/Utils/dateFormatter';

export default function Monitor({ category, match, court, autoRefresh = true }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [warmupTime, setWarmupTime] = useState(0);

    // Initialize warmup time
    useEffect(() => {
        if (match && category && match.warmup_started_at && !match.warmup_ended_at && !match.warmup_skipped) {
            const elapsed = Math.floor((Date.now() - new Date(match.warmup_started_at).getTime()) / 1000);
            const remaining = Math.max(0, (category.warmup_minutes * 60) - elapsed);
            setWarmupTime(remaining);
        }
    }, [match, category]);

    // Warmup countdown timer
    useEffect(() => {
        if (match && match.warmup_started_at && !match.warmup_ended_at && !match.warmup_skipped && warmupTime > 0) {
            const interval = setInterval(() => {
                setWarmupTime((prev) => Math.max(0, prev - 1));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [match, warmupTime]);

    // Auto-refresh to get latest match state and score
    // Using Inertia's router.reload() to prevent font flickering
    useEffect(() => {
        if (autoRefresh) {
            // Poll more frequently during active match, less frequently when waiting for match
            const pollInterval = match && match.status === 'in_progress' ? 200 : 1000;
            
            const interval = setInterval(() => {
                router.reload({ only: ['match', 'category', 'court'], preserveScroll: true, preserveState: true });
            }, pollInterval);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, match?.status]);

    // Update clock every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const getPointDisplay = (points, team) => {
        // Check if this team won the game (pending confirmation)
        if (match && match.pending_game_winner === team) {
            return 'WIN';
        }
        // If in tie-breaker mode, display numerical points
        if (match && match.is_tiebreaker) {
            return points || '0';
        }
        // Otherwise, display tennis scoring
        if (points === 'AD') return 'AD';
        return points || '0';
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatWarmupTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getMatchStatus = () => {
        if (!match) return 'No Match Scheduled';
        if (match.status === 'scheduled' && !match.warmup_started_at) {
            return 'Scheduled';
        }
        if (match.warmup_started_at && !match.warmup_ended_at && !match.warmup_skipped) {
            return 'Warm-up';
        }
        if (match.status === 'in_progress') {
            // Check if a set has been won
            if (winningTeam) {
                return 'Set Complete';
            }
            return ''; // Hide status text during match
        }
        if (match.status === 'completed') {
            return 'Match Complete';
        }
        return match.status;
    };

    const isMatchStarted = match && match.match_started_at !== null;
    const isWarmup = match && match.warmup_started_at && !match.warmup_ended_at && !match.warmup_skipped;

    // Check if a team has won (fulfilled winning condition)
    const getWinningTeam = () => {
        if (!match || match.status === 'completed') return null;
        
        const gamesTarget = match.tournament_phase?.games_target || 4;
        
        const team1Score = match.team1_score || 0;
        const team2Score = match.team2_score || 0;
        
        if (team1Score >= gamesTarget && team1Score > team2Score) {
            return 'team1';
        } else if (team2Score >= gamesTarget && team2Score > team1Score) {
            return 'team2';
        }
        
        return null;
    };

    const winningTeam = getWinningTeam();

    return (
        <>
            <Head title={`Match Monitor - Court ${match?.court?.name || court?.name || ''}`} />

            <div className="h-screen overflow-hidden bg-dark text-white flex flex-col">
                {/* Header */}
                <div className="bg-primary py-2 px-4 shadow-2xl border-b-4 border-accent flex-shrink-0">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-4xl font-bold font-raverist text-white leading-tight">{category?.event?.name || court?.event?.name || 'Tournament'}</h1>
                        {match && (
                            <div>
                                <p className="text-2xl text-white font-gotham font-bold mt-1 leading-tight">{category?.name}</p>
                                {match.tournament_phase && (
                                    <p className="text-3xl text-accent font-gotham font-bold mt-2 leading-tight">
                                        {match.tournament_phase.name}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden flex flex-col justify-center max-w-7xl mx-auto w-full px-6 py-2">
                    {/* Status Badge */}
                    {getMatchStatus() && (
                        <div className="text-center mb-2">
                            <span className="inline-block px-8 py-2 text-4xl font-bold font-raverist bg-primary text-white rounded-xl shadow-2xl border-4 border-accent">
                                {getMatchStatus()}
                            </span>
                        </div>
                    )}

                    {!match ? (
                        /* No Match Display */
                        <div className="space-y-4">
                            <div className="bg-neutral-900 rounded-2xl p-10 shadow-2xl border-4 border-accent text-center">
                                <div className="text-8xl mb-6">🎾</div>
                                <h2 className="text-7xl font-bold font-raverist text-white mb-6">COURT {court?.name || 'AVAILABLE'}</h2>
                                <p className="text-5xl font-gotham text-accent font-bold mb-8">Ready for Action</p>
                                <div className="mt-8 pt-8 border-t-4 border-accent">
                                    <p className="text-4xl font-gotham text-white font-bold mb-3">No Active Match</p>
                                    <p className="text-3xl font-gotham text-gray-400 font-bold">Waiting for next match assignment...</p>
                                </div>
                            </div>
                            {court?.event && (
                                <div className="bg-primary rounded-xl p-5 shadow-xl border-4 border-accent text-center">
                                    <p className="text-4xl font-bold font-raverist text-white mb-2">{court.event.name}</p>
                                    {court.event.location && <p className="text-2xl font-gotham text-white font-bold">{court.event.location}</p>}
                                </div>
                            )}
                        </div>
                    ) : (
                    <>
                    {/* Scoreboard - Vertical Layout */}
                    <div className={`bg-neutral-900 rounded-2xl ${isWarmup ? 'p-3' : 'p-4'} shadow-2xl border-4 border-accent`}>
                        {/* Team 1 */}
                        <div className={`bg-success rounded-xl ${isWarmup ? 'p-3 mb-2' : 'p-5 mb-3'} border-4 border-accent`}>
                            <div className="flex items-center gap-6">
                                <div className="flex-1">
                                    <h2 className={`${isWarmup ? 'text-5xl' : 'text-7xl'} font-bold font-raverist text-white leading-tight`}>
                                        {match.team1.player_1} <br/> {match.team1.player_2}
                                    </h2>
                                    {winningTeam === 'team1' && (
                                        <div className="mt-2">
                                            <span className="inline-block px-4 py-2 text-3xl font-bold font-raverist bg-accent text-dark rounded-lg border-2 border-dark animate-pulse">
                                                🏆 WINNER
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-5 flex-shrink-0">
                                    {/* Games Won */}
                                    <div className={`text-center bg-dark rounded-lg border-4 border-accent flex items-center justify-center ${isWarmup ? 'w-[150px] h-[120px]' : 'w-[200px] h-[180px]'}`}>
                                        <div className={`${isWarmup ? 'text-7xl' : 'text-9xl'} font-bold leading-none text-white`}>
                                            {match.team1_score || 0}
                                        </div>
                                    </div>
                                    {/* Current Game Points */}
                                    {isMatchStarted && !isWarmup ? (
                                        <div className="text-center bg-dark rounded-lg border-4 border-accent w-[200px] h-[180px] flex items-center justify-center">
                                            {(() => {
                                                const displayValue = getPointDisplay(match.current_game_team1_points, 'team1');
                                                const isNumeric = !isNaN(displayValue);
                                                const isWin = displayValue === 'WIN';
                                                return (
                                                    <div className={`font-bold leading-none ${!isNumeric ? `text-7xl ${isWin ? 'text-accent animate-pulse' : 'text-white'}` : 'text-9xl text-white'}`}>
                                                        {displayValue}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    ) : isWarmup ? (
                                        <div className="w-[150px]"></div>
                                    ) : (
                                        <div className="w-[200px]"></div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* VS Divider */}
                        <div className={`text-center ${isWarmup ? 'my-1' : 'my-2'}`}>
                            <span className={`${isWarmup ? 'text-4xl' : 'text-6xl'} font-bold font-raverist text-accent`}>VS</span>
                        </div>

                        {/* Team 2 */}
                        <div className={`bg-primary rounded-xl ${isWarmup ? 'p-3' : 'p-5'} border-4 border-accent`}>
                            <div className="flex items-center gap-6">
                                <div className="flex-1">
                                    <h2 className={`${isWarmup ? 'text-5xl' : 'text-7xl'} font-bold font-raverist text-white leading-tight`}>
                                        {match.team2.player_1} <br/> {match.team2.player_2}
                                    </h2>
                                    {winningTeam === 'team2' && (
                                        <div className="mt-2">
                                            <span className="inline-block px-4 py-2 text-3xl font-bold font-raverist bg-accent text-dark rounded-lg border-2 border-dark animate-pulse">
                                                🏆 WINNER
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-5 flex-shrink-0">
                                    {/* Games Won */}
                                    <div className={`text-center bg-dark rounded-lg border-4 border-accent flex items-center justify-center ${isWarmup ? 'w-[150px] h-[120px]' : 'w-[200px] h-[180px]'}`}>
                                        <div className={`${isWarmup ? 'text-7xl' : 'text-9xl'} font-bold leading-none text-white`}>
                                            {match.team2_score || 0}
                                        </div>
                                    </div>
                                    {/* Current Game Points */}
                                    {isMatchStarted && !isWarmup ? (
                                        <div className="text-center bg-dark rounded-lg border-4 border-accent w-[200px] h-[180px] flex items-center justify-center">
                                            {(() => {
                                                const displayValue = getPointDisplay(match.current_game_team2_points, 'team2');
                                                const isNumeric = !isNaN(displayValue);
                                                const isWin = displayValue === 'WIN';
                                                return (
                                                    <div className={`font-bold leading-none ${!isNumeric ? `text-7xl ${isWin ? 'text-accent animate-pulse' : 'text-white'}` : 'text-9xl text-white'}`}>
                                                        {displayValue}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    ) : isWarmup ? (
                                        <div className="w-[150px]"></div>
                                    ) : (
                                        <div className="w-[200px]"></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AD Counter and Golden Point Status */}
                    {isMatchStarted && !isWarmup && match.is_tiebreaker ? (
                        <div className="text-center mt-2">
                            <div className="inline-block bg-red-600 px-6 py-2 rounded-xl border-4 border-accent shadow-2xl animate-pulse">
                                <p className="text-4xl font-bold font-raverist text-white">
                                    🔥 TIE-BREAKER 🔥
                                </p>
                                <p className="text-2xl font-gotham text-white mt-1">
                                    {match.tournament_phase 
                                        ? `First to ${match.tournament_phase.tiebreaker_points}${match.tournament_phase.tiebreaker_two_point_difference ? ', win by 2' : ''}`
                                        : 'First to 7'
                                    }
                                </p>
                            </div>
                        </div>
                    ) : isMatchStarted && !isWarmup && match.current_game_advantages >= 2 && 
                     match.current_game_team1_points === '40' && 
                     match.current_game_team2_points === '40' ? (
                        <div className="text-center mt-2">
                            <div className="inline-block bg-red-600 px-6 py-2 rounded-xl border-4 border-accent shadow-2xl animate-pulse">
                                <p className="text-4xl font-bold font-raverist text-white">
                                    ⚡ STAR POINT ⚡
                                </p>
                            </div>
                        </div>
                    ) : isMatchStarted && !isWarmup && match.current_game_advantages > 0 && !match.pending_game_winner && (
                        <div className="text-center mt-2">
                            <div className="inline-block bg-primary px-4 py-1 rounded-lg border-2 border-accent">
                                <p className="text-2xl font-bold font-gotham text-white">
                                    AD: {match.current_game_advantages}/2
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Warm-up Message */}
                    {isWarmup && (
                        <div className="bg-primary rounded-xl p-4 shadow-2xl text-center mt-2 border-4 border-accent">
                            <p className="text-4xl font-bold font-raverist text-white mb-2">⏱️ WARM-UP IN PROGRESS</p>
                            <div className="text-7xl font-bold font-gotham text-accent">
                                {formatWarmupTime(warmupTime)}
                            </div>
                        </div>
                    )}

                    {/* Match Complete */}
                    {match.status === 'completed' && (
                        <div className={`${match.winner_id ? 'bg-success' : 'bg-primary'} rounded-xl p-4 shadow-2xl text-center mt-2 border-4 border-accent`}>
                            <p className="text-3xl font-bold font-raverist mb-2 text-white">
                                {match.winner_id ? '🏆 WINNER 🏆' : '🤝 MATCH DRAW 🤝'}
                            </p>
                            {match.winner_id ? (
                                <p className="text-5xl font-bold font-raverist text-white leading-tight mb-3">
                                    {match.winner_id === match.team1_id 
                                        ? `${match.team1.player_1} / ${match.team1.player_2}`
                                        : `${match.team2.player_1} / ${match.team2.player_2}`
                                    }
                                </p>
                            ) : null}
                            <p className="text-4xl font-bold font-gotham text-white">
                                Final Score: {match.team1_score || 0} - {match.team2_score || 0}
                            </p>
                        </div>
                    )}

                    {/* Scheduled Message */}
                    {match.status === 'scheduled' && !match.warmup_started_at && (
                        <div className="bg-neutral-900 rounded-xl p-4 shadow-2xl text-center mt-2 border-4 border-accent">
                            <p className="text-3xl font-bold font-raverist mb-2 text-accent">📅 UPCOMING MATCH</p>
                            {match.scheduled_time && (
                                <p className="text-2xl text-white font-gotham font-bold">
                                    Scheduled: {formatDateTime(match.scheduled_time)}
                                </p>
                            )}
                        </div>
                    )}
                    </>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-primary py-3 px-6 border-t-4 border-accent flex-shrink-0">
                    <div className="max-w-7xl mx-auto">
                        {match && category && (
                            <div className="flex justify-between items-center">
                                <p className="text-xl font-gotham font-bold text-white">
                                    Court {match?.court?.name || court?.name || 'TBA'} • {formatTime(currentTime)}
                                </p>
                                <p className="text-2xl font-gotham font-bold text-white">
                                    {match.is_tiebreaker ? (
                                        <>🔥 TIE-BREAKER</>
                                    ) : match.tournament_phase ? (
                                        <>📊 First to {match.tournament_phase.games_target} Games • {match.tournament_phase.scoring_type === 'no_ad' ? 'No-Ad' : match.tournament_phase.scoring_type === 'traditional' ? 'Traditional' : 'Advantage Limit'}</>
                                    ) : (
                                        <>📊 Match in Progress</>
                                    )}
                                </p>
                            </div>
                        )}
                        {!match && (
                            <div className="flex justify-between items-center">
                                <p className="text-xl font-gotham font-bold text-white">
                                    Court {court?.name || 'TBA'} • {formatTime(currentTime)}
                                </p>
                                <p className="text-2xl font-gotham font-bold text-white">
                                    🎾 Court ready for next match
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}


