import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { formatDateTime } from '@/Utils/dateFormatter';

export default function Monitor({ category, match, court, autoRefresh = true }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [warmupTime, setWarmupTime] = useState(0);
    const isIndividual = category?.participant_mode === 'individual';

    const side1Name1 = isIndividual ? match?.side1Player1?.player_1 : match?.team1?.player_1;
    const side1Name2 = isIndividual ? match?.side1Player2?.player_1 : match?.team1?.player_2;
    const side2Name1 = isIndividual ? match?.side2Player1?.player_1 : match?.team2?.player_1;
    const side2Name2 = isIndividual ? match?.side2Player2?.player_1 : match?.team2?.player_2;

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
    useEffect(() => {
        if (autoRefresh) {
            const pollInterval = 1000;
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
        if (match && match.pending_game_winner === team) {
            return 'WIN';
        }
        if (match && match.is_tiebreaker) {
            return points || '0';
        }
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
            if (winningTeam) {
                return '';
            }
            return '';
        }
        if (match.status === 'completed') {
            return 'Match Complete';
        }
        return match.status;
    };

    const isMatchStarted = match && match.match_started_at !== null;
    const isWarmup = match && match.warmup_started_at && !match.warmup_ended_at && !match.warmup_skipped;

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

    const getAdvantageLimit = () => {
        if (!match?.tournament_phase) return null;
        const scoringType = match.tournament_phase.scoring_type;
        if (scoringType === 'traditional') return null;
        if (scoringType === 'no_ad') return 0;
        if (scoringType === 'advantage_limit') {
            return match.tournament_phase.advantage_limit || 2;
        }
        return null;
    };

    const advantageLimit = getAdvantageLimit();

    const isStarPoint = () => {
        if (!match || !isMatchStarted || isWarmup) return false;
        if (advantageLimit === null) return false;
        if (advantageLimit === 0) return false;
        return match.current_game_advantages >= advantageLimit &&
               match.current_game_team1_points === '40' &&
               match.current_game_team2_points === '40';
    };

    return (
        <>
            <Head title={`Match Monitor - Court ${match?.court?.name || court?.name || ''}`} />

            <div className="h-screen overflow-hidden text-white flex flex-col relative"
                 style={{
                     backgroundImage: 'url(/images/blue.png)',
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     backgroundRepeat: 'no-repeat'
                 }}>
                {/* Header */}
                <div className="bg-black/80 backdrop-blur-sm py-4 px-6 shadow-2xl border-b-4 border-accent flex-shrink-0">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        {match ? (
                            <>
                                {match.tournament_phase && (
                                    <p className="text-5xl text-white font-ffdin font-bold leading-tight">
                                        {match.tournament_phase.name}
                                    </p>
                                )}
                                <div className="flex items-center gap-6">
                                    <p className="text-6xl text-accent font-ffdin font-bold leading-tight">{category?.name}</p>
                                    {/* <img src="/logo/logo-black.jpg" alt="Gonuts Cup" className="h-20 object-contain" /> */}
                                </div>
                            </>
                        ) : (
                            <p className="text-6xl text-white font-ffdin font-bold leading-tight mx-auto">
                                {court?.event?.name || 'Court Ready'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden flex flex-col justify-center max-w-7xl mx-auto w-full px-2 py-2">
                    {/* Status Badge */}
                    {getMatchStatus() && (
                        <div className="text-center mb-2">
                            <span className="inline-block px-8 py-2 text-4xl font-bold font-ffdin bg-black/80 backdrop-blur-sm text-white rounded-xl shadow-2xl border-4 border-accent">
                                {getMatchStatus()}
                            </span>
                        </div>
                    )}

                    {!match ? (
                        /* No Match Display */
                        <div className="space-y-4">
                            <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-10 shadow-2xl border-4 border-accent text-center">
                                <div className="text-8xl mb-6">🎾</div>
                                <h2 className="text-7xl font-bold font-ffdin text-white mb-6">COURT {court?.name || 'AVAILABLE'}</h2>
                                <p className="text-5xl font-ffdin text-accent font-bold mb-8">Ready for Action</p>
                                <div className="mt-8 pt-8 border-t-4 border-accent">
                                    <p className="text-4xl font-ffdin text-white font-bold mb-3">No Active Match</p>
                                    <p className="text-3xl font-ffdin text-zinc-400 font-bold">Waiting for next match assignment...</p>
                                </div>
                            </div>
                            {court?.event && (
                                <div className="bg-black/80 backdrop-blur-sm rounded-xl p-5 shadow-xl border-4 border-accent text-center">
                                    <p className="text-4xl font-bold font-ffdin text-white mb-2">{court.event.name}</p>
                                    {court.event.location && <p className="text-2xl font-ffdin text-white font-bold">{court.event.location}</p>}
                                </div>
                            )}
                        </div>
                    ) : (
                    <>
                    {/* Scoreboard - Vertical Layout */}
                    <div className={`bg-black/80 backdrop-blur-sm rounded-2xl ${isWarmup ? 'p-3' : 'p-4'} shadow-2xl border-4 border-accent`}>
                        {/* Team 1 */}
                        <div className={`bg-black/85 backdrop-blur-sm rounded-xl ${isWarmup ? 'p-3 mb-2' : 'p-5 mb-3'} border-4 border-accent`}>
                            <div className="flex items-center gap-6">
                                <div className="flex-1 min-w-0">
                                    <div className={`${isWarmup ? 'text-5xl' : 'text-7xl'} font-bold font-ffdin text-white leading-tight`}>
                                        <div className="truncate">{side1Name1}</div>
                                        <div className="truncate">{side1Name2}</div>
                                    </div>
                                    {winningTeam === 'team1' && (
                                        <div className="mt-2">
                                            <span className="inline-block px-4 py-2 text-3xl font-bold font-ffdin bg-accent/95 backdrop-blur-sm text-black rounded-lg border-2 border-black animate-pulse shadow-2xl">
                                                🏆 WINNER
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-5 flex-shrink-0">
                                    {/* Games Won */}
                                    <div className={`text-center bg-zinc-900/90 backdrop-blur-sm rounded-lg border-4 border-accent flex items-center justify-center ${isWarmup ? 'w-[150px] h-[120px]' : 'w-[200px] h-[180px]'}`}>
                                        <div className={`${isWarmup ? 'text-7xl' : 'text-9xl'} font-bold leading-none text-white`}>
                                            {match.team1_score || 0}
                                        </div>
                                    </div>
                                    {/* Current Game Points */}
                                    {isMatchStarted && !isWarmup ? (
                                        <div className="text-center bg-zinc-900/90 backdrop-blur-sm rounded-lg border-4 border-accent w-[200px] h-[180px] flex items-center justify-center">
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
                            <span className={`${isWarmup ? 'text-4xl' : 'text-6xl'} font-bold font-ffdin text-accent`}>VS</span>
                        </div>

                        {/* Team 2 */}
                        <div className={`bg-zinc-900/85 backdrop-blur-sm rounded-xl ${isWarmup ? 'p-3' : 'p-5'} border-4 border-accent`}>
                            <div className="flex items-center gap-6">
                                <div className="flex-1 min-w-0">
                                    <div className={`${isWarmup ? 'text-5xl' : 'text-7xl'} font-bold font-ffdin text-white leading-tight`}>
                                        <div className="truncate">{side2Name1}</div>
                                        <div className="truncate">{side2Name2}</div>
                                    </div>
                                    {winningTeam === 'team2' && (
                                        <div className="mt-2">
                                            <span className="inline-block px-4 py-2 text-3xl font-bold font-ffdin bg-accent/95 backdrop-blur-sm text-black rounded-lg border-2 border-black animate-pulse shadow-2xl">
                                                🏆 WINNER
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-5 flex-shrink-0">
                                    {/* Games Won */}
                                    <div className={`text-center bg-zinc-900/90 backdrop-blur-sm rounded-lg border-4 border-accent flex items-center justify-center ${isWarmup ? 'w-[150px] h-[120px]' : 'w-[200px] h-[180px]'}`}>
                                        <div className={`${isWarmup ? 'text-7xl' : 'text-9xl'} font-bold leading-none text-white`}>
                                            {match.team2_score || 0}
                                        </div>
                                    </div>
                                    {/* Current Game Points */}
                                    {isMatchStarted && !isWarmup ? (
                                        <div className="text-center bg-zinc-900/90 backdrop-blur-sm rounded-lg border-4 border-accent w-[200px] h-[180px] flex items-center justify-center">
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
                            <div className="inline-block bg-red-600/95 backdrop-blur-sm px-6 py-2 rounded-xl border-4 border-accent shadow-2xl animate-pulse">
                                <p className="text-4xl font-bold font-ffdin text-white">
                                    🔥 TIE-BREAKER 🔥
                                </p>
                                <p className="text-2xl font-ffdin text-white mt-1">
                                    {match.tournament_phase
                                        ? `First to ${match.tournament_phase.tiebreaker_points}${match.tournament_phase.tiebreaker_two_point_difference ? ', win by 2' : ''}`
                                        : 'First to 7'
                                    }
                                </p>
                            </div>
                        </div>
                    ) : isStarPoint() ? (
                        <div className="text-center mt-2">
                            <div className="inline-block bg-red-600/95 backdrop-blur-sm px-6 py-2 rounded-xl border-4 border-accent shadow-2xl animate-pulse">
                                <p className="text-4xl font-bold font-ffdin text-white">
                                    ⚡ STAR POINT ⚡
                                </p>
                            </div>
                        </div>
                    ) : isMatchStarted && !isWarmup && match.current_game_advantages > 0 && !match.pending_game_winner && advantageLimit !== null && advantageLimit !== 0 && (
                        <div className="text-center mt-2">
                            <div className="inline-block bg-black/80 backdrop-blur-sm px-4 py-1 rounded-lg border-2 border-accent">
                                <p className="text-2xl font-bold font-ffdin text-white">
                                    AD: {match.current_game_advantages}/{advantageLimit}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Warm-up Message */}
                    {isWarmup && (
                        <div className="bg-black/80 backdrop-blur-sm rounded-xl p-4 shadow-2xl text-center mt-2 border-4 border-accent">
                            <p className="text-4xl font-bold font-ffdin text-white mb-2">⏱️ WARM-UP IN PROGRESS</p>
                            <div className="text-7xl font-bold font-ffdin text-accent">
                                {formatWarmupTime(warmupTime)}
                            </div>
                        </div>
                    )}

                    {/* Match Complete */}
                    {match.status === 'completed' && (
                        <div className="bg-black/90 backdrop-blur-sm rounded-xl p-4 shadow-2xl text-center mt-2 border-4 border-accent">
                            <p className="text-3xl font-bold font-ffdin mb-2 text-white">
                                {match.winner_id ? '🏆 WINNER 🏆' : '🤝 MATCH DRAW 🤝'}
                            </p>
                            {match.winner_id ? (
                                <p className="text-5xl font-bold font-ffdin text-accent leading-tight mb-3">
                                    {match.winner_id === match.team1_id
                                        ? `${side1Name1 || ''} / ${side1Name2 || ''}`
                                        : `${side2Name1 || ''} / ${side2Name2 || ''}`
                                    }
                                </p>
                            ) : null}
                            <p className="text-4xl font-bold font-ffdin text-white">
                                Final Score: {match.team1_score || 0} - {match.team2_score || 0}
                            </p>
                        </div>
                    )}

                    {/* Scheduled Message */}
                    {match.status === 'scheduled' && !match.warmup_started_at && (
                        <div className="bg-black/80 backdrop-blur-sm rounded-xl p-4 shadow-2xl text-center mt-2 border-4 border-accent">
                            <p className="text-3xl font-bold font-ffdin mb-2 text-accent">UPCOMING MATCH</p>
                            {match.scheduled_time && (
                                <p className="text-2xl text-white font-ffdin font-bold">
                                    Scheduled: {formatDateTime(match.scheduled_time)}
                                </p>
                            )}
                        </div>
                    )}
                    </>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-black/80 backdrop-blur-sm py-3 px-2 border-t-4 border-accent flex-shrink-0">
                    <div className="max-w-7xl mx-auto">
                        {match && category && (
                            <div className="flex justify-between items-center">
                                <p className="text-xl font-ffdin font-bold text-white">
                                    Court {match?.court?.name || court?.name || 'TBA'} • {formatTime(currentTime)}
                                </p>
                                <p className="text-2xl font-ffdin font-bold text-white">
                                    {match.is_tiebreaker ? (
                                        <>🔥 TIE-BREAKER</>
                                    ) : match.tournament_phase ? (
                                        <>First to {match.tournament_phase.games_target} Games • {match.tournament_phase.scoring_type === 'no_ad' ? 'No-Ad' : match.tournament_phase.scoring_type === 'traditional' ? 'Traditional' : 'Advantage Limit'}</>
                                    ) : (
                                        <>Match in Progress</>
                                    )}
                                </p>
                            </div>
                        )}
                        {!match && (
                            <div className="flex justify-between items-center">
                                <p className="text-xl font-ffdin font-bold text-white">
                                    Court {court?.name || 'TBA'} • {formatTime(currentTime)}
                                </p>
                                <p className="text-2xl font-ffdin font-bold text-white">
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
