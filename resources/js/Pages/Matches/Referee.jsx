import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Referee({ category, match }) {
    const { flash } = usePage().props;
    const [warmupTime, setWarmupTime] = useState(0);
    const [isWarmupRunning, setIsWarmupRunning] = useState(false);
    const [warmupCompleted, setWarmupCompleted] = useState(false);
    
    // Get scoring configuration from match's phase
    const phase = match.tournament_phase;
    const scoringConfig = phase ? {
        gamesTarget: phase.games_target,
        scoringType: phase.scoring_type,
        advantageLimit: phase.advantage_limit,
        tiebreakerPoints: phase.tiebreaker_points,
        tiebreakerTwoPointDiff: phase.tiebreaker_two_point_difference,
    } : {
        gamesTarget: 4,
        scoringType: 'no_ad',
        advantageLimit: null,
        tiebreakerPoints: 7,
        tiebreakerTwoPointDiff: true,
    };

    // Initialize warmup state
    useEffect(() => {
        if (match.warmup_started_at && !match.warmup_ended_at && !match.warmup_skipped) {
            const elapsed = Math.floor((Date.now() - new Date(match.warmup_started_at).getTime()) / 1000);
            const remaining = Math.max(0, (category.warmup_minutes * 60) - elapsed);
            setWarmupTime(remaining);
            setIsWarmupRunning(true);
        } else if (match.warmup_ended_at || match.warmup_skipped) {
            setWarmupCompleted(true);
        } else {
            setWarmupTime(category.warmup_minutes * 60);
        }
    }, [match, category.warmup_minutes]);

    // Warmup timer countdown
    useEffect(() => {
        let interval;
        if (isWarmupRunning && warmupTime > 0) {
            interval = setInterval(() => {
                setWarmupTime((prev) => {
                    if (prev <= 1) {
                        setIsWarmupRunning(false);
                        setWarmupCompleted(true);
                        handleWarmupEnd();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isWarmupRunning, warmupTime]);

    // Auto-refresh match data during active play to ensure scores are current
    // Pause auto-refresh when there's a pending game winner so referee can click confirm
    useEffect(() => {
        if (match.status === 'in_progress' && match.match_started_at && !match.pending_game_winner) {
            const interval = setInterval(() => {
                router.reload({ only: ['match', 'category'], preserveScroll: true, preserveState: true });
            }, 3000); // Refresh every 3 seconds
            return () => clearInterval(interval);
        }
    }, [match.status, match.match_started_at, match.pending_game_winner]);

    const handleStartWarmup = () => {
        router.post(route('categories.matches.warmup.start', [category.id, match.id]), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsWarmupRunning(true);
            },
        });
    };


    const handleResetWarmup = () => {
        if (confirm('Reset warm-up timer?')) {
            setWarmupTime(category.warmup_minutes * 60);
            setIsWarmupRunning(false);
            router.post(route('categories.matches.warmup.reset', [category.id, match.id]), {}, {
                preserveScroll: true,
            });
        }
    };

    const handleSkipWarmup = () => {
        if (confirm('Skip warm-up and start match?')) {
            router.post(route('categories.matches.warmup.skip', [category.id, match.id]), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    setWarmupCompleted(true);
                    setIsWarmupRunning(false);
                },
            });
        }
    };

    const handleWarmupEnd = () => {
        router.post(route('categories.matches.warmup.end', [category.id, match.id]), {}, {
            preserveScroll: true,
        });
    };

    const handleStartMatch = () => {
        router.post(route('categories.matches.start', [category.id, match.id]), {}, {
            preserveScroll: true,
        });
    };

    const handleScorePoint = (team) => {
        // Prevent scoring if a game has been won but not confirmed
        if (match.pending_game_winner) {
            alert('Game won! Please confirm the game win first.');
            return;
        }
        
        // Prevent scoring if a set has been won
        if (winningTeam) {
            alert('Set completed! Please proceed to next set or complete the match.');
            return;
        }
        
        router.post(route('categories.matches.score', [category.id, match.id]), {
            team: team,
        }, {
            preserveScroll: true,
        });
    };

    const handleUndoPoint = (team) => {
        const teamName = team === 'team1' 
            ? `${match.team1.player_1}-${match.team1.player_2}` 
            : `${match.team2.player_1}-${match.team2.player_2}`;
        
        // Check if we're at 0-0 in current game (would undo a game win)
        const isGameWinUndo = (match.current_game_team1_points === '0' || !match.current_game_team1_points) && 
                              (match.current_game_team2_points === '0' || !match.current_game_team2_points) &&
                              (match.team1_score > 0 || match.team2_score > 0);
        
        const message = isGameWinUndo
            ? `⚠️ UNDO GAME WIN?\n\nThis will undo the last game won by ${teamName}.\n\nGame score will be reversed and the last game point will be restored.\n\nContinue?`
            : `Undo last point for ${teamName}?`;
        
        if (confirm(message)) {
            router.post(route('categories.matches.undo', [category.id, match.id]), {
                team: team,
            }, {
                preserveScroll: true,
            });
        }
    };

    const handleAdjustGameScore = (team, adjustment) => {
        const currentScore = team === 'team1' ? match.team1_score : match.team2_score;
        const newScore = Math.max(0, currentScore + adjustment);
        
        if (confirm(`${adjustment > 0 ? 'Add' : 'Remove'} 1 game ${adjustment > 0 ? 'to' : 'from'} ${team === 'team1' ? 'Team 1' : 'Team 2'}?\n\nNew score will be: ${newScore}`)) {
            router.post(route('categories.matches.adjust-game-score', [category.id, match.id]), {
                team: team,
                score: newScore,
            }, {
                preserveScroll: true,
            });
        }
    };

    const handleSetCurrentPoints = (team) => {
        const pointOptions = ['0', '15', '30', '40', 'AD'];
        const currentPoints = team === 'team1' ? match.current_game_team1_points : match.current_game_team2_points;
        
        const newPoints = prompt(
            `Set current game points for ${team === 'team1' ? 'Team 1' : 'Team 2'}\n\nCurrent: ${currentPoints || '0'}\n\nEnter: 0, 15, 30, 40, or AD`,
            currentPoints || '0'
        );
        
        if (newPoints !== null && pointOptions.includes(newPoints.toUpperCase())) {
            router.post(route('categories.matches.adjust-current-points', [category.id, match.id]), {
                team: team,
                points: newPoints.toUpperCase(),
            }, {
                preserveScroll: true,
            });
        } else if (newPoints !== null) {
            alert('Invalid points! Please enter: 0, 15, 30, 40, or AD');
        }
    };

    const handleResetMatch = () => {
        if (confirm('⚠️ RESET MATCH?\n\nThis will completely reset the match to scheduled state:\n• All scores will be cleared\n• Warm-up will be reset\n• Match status will return to scheduled\n• Court will become available for other matches\n\nThis action is useful if you started the wrong match by mistake.\n\nAre you sure?')) {
            router.post(route('categories.matches.reset', [category.id, match.id]));
        }
    };

    const handleCompleteMatch = () => {
        const team1Score = match.team1_score || 0;
        const team2Score = match.team2_score || 0;
        
        let winnerText = '';
        if (team1Score > team2Score) {
            winnerText = `Winner: Team 1 (${match.team1.player_1} - ${match.team1.player_2})`;
        } else if (team2Score > team1Score) {
            winnerText = `Winner: Team 2 (${match.team2.player_1} - ${match.team2.player_2})`;
        } else {
            winnerText = 'Result: Draw';
        }
        
        if (confirm(`Complete Match?\n\nFinal Score: ${team1Score} - ${team2Score}\n${winnerText}\n\nThis will mark the match as completed and free the court.\n\nAre you sure?`)) {
            router.post(route('categories.matches.complete', [category.id, match.id]));
        }
    };

    const handleNextSet = () => {
        if (confirm('Start Next Set?\n\nCurrent scores will be recorded and a new set will begin.\n\nAre you sure?')) {
            router.post(route('categories.matches.next-set', [category.id, match.id]), {}, {
                preserveScroll: true,
            });
        }
    };

    const handleConfirmGameWin = () => {
        router.post(route('categories.matches.confirm-game-win', [category.id, match.id]), {}, {
            preserveScroll: true,
        });
    };

    const handleUndoGameWin = () => {
        if (confirm('Undo game win confirmation?\n\nThis will revert to the game-winning point state.')) {
            router.post(route('categories.matches.undo', [category.id, match.id]), {
                team: match.pending_game_winner,
            }, {
                preserveScroll: true,
            });
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getPointDisplay = (points, team) => {
        // Check if this team won the game (pending confirmation)
        if (match.pending_game_winner === team) {
            return 'WIN';
        }
        // If in tie-breaker mode, display numerical points
        if (match.is_tiebreaker) {
            return points || '0';
        }
        // Otherwise, display tennis scoring
        if (points === 'AD') return 'AD';
        return points || '0';
    };

    const isMatchStarted = match.match_started_at !== null;

    // Check if a team has won (fulfilled winning condition)
    const getWinningTeam = () => {
        if (match.status === 'completed') return null;
        
        const gamesTarget = scoringConfig.gamesTarget;
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
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold font-raverist text-dark">
                            🎾 Referee - Court {match.court?.name || 'TBA'}
                        </h2>
                        <p className="text-xs text-neutral-600">
                            {category.event.name} • {category.name}
                            {phase && <> • <span className="font-bold text-primary">{phase.name}</span></>}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {match.court_id && (
                            <Link
                                href={route('courts.monitor', match.court_id)}
                                target="_blank"
                                className="inline-flex items-center rounded-md bg-accent px-3 py-1 text-xs font-gotham font-semibold text-dark shadow-sm hover:bg-accent-700"
                            >
                                📺 Monitor
                            </Link>
                        )}
                        <Link
                            href={route('categories.matches.index', category.id)}
                            className="inline-flex items-center rounded-md bg-neutral-200 px-3 py-1 text-xs font-gotham font-semibold text-dark shadow-sm hover:bg-neutral-300"
                        >
                            ← Back
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Referee Control" />

            <div className="h-[calc(100vh-8rem)] overflow-hidden">
                <div className="mx-auto max-w-6xl px-4 py-2 h-full flex flex-col gap-2">
                    {/* Flash Messages */}
                    {(flash?.success || flash?.error || flash?.warning) && (
                        <div className="flex-shrink-0">
                            {flash?.success && (
                                <div className="bg-success-50 border border-success-200 text-success-800 px-2 py-1 rounded text-xs">
                                    {flash.success}
                                </div>
                            )}
                            {flash?.error && (
                                <div className="bg-red-50 border border-red-200 text-red-800 px-2 py-1 rounded text-xs">
                                    {flash.error}
                                </div>
                            )}
                            {flash?.warning && (
                                <div className="bg-accent-50 border border-accent-200 text-accent-800 px-2 py-1 rounded text-xs">
                                    {flash.warning}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Match Info - Compact */}
                    <div className="flex-shrink-0 bg-white shadow-sm rounded-lg p-2 border-2 border-primary">
                        <div className="flex justify-between items-center">
                            <div className="flex-1">
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    <div>
                                        <p className="text-xl font-semibold text-primary">Team 1: {match.team1.player_1} - {match.team1.player_2}</p>
                                    </div>
                                    <div>
                                        <p className="text-xl font-semibold text-primary">Team 2: {match.team2.player_1} - {match.team2.player_2}</p>
                                    </div>
                                </div>
                                {(match.scheduled_time) && (
                                    <div className="flex items-center gap-2 text-xl">
                                        <span className="font-semibold text-primary">📅 Schedule:</span>
                                            <span className="text-neutral-700">
                                                {(() => {
                                                    // Parse the datetime string directly without timezone conversion
                                                    const dateTimeStr = match.scheduled_time.replace('T', ' ').split('.')[0];
                                                    const [datePart, timePart] = dateTimeStr.split(' ');
                                                    const [year, month, day] = datePart.split('-');
                                                    const [hours, minutes] = timePart.split(':');
                                                    return `${day}-${month}-${year} ${hours}:${minutes}`;
                                                })()}
                                            </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {match.status === 'in_progress' && match.match_started_at && (
                                    <button
                                        onClick={handleCompleteMatch}
                                        className="inline-flex items-center rounded-md bg-success px-3 py-1 text-xs font-gotham font-semibold text-white shadow-sm hover:bg-success-700"
                                        title="Complete Match"
                                    >
                                        ✅ Complete
                                    </button>
                                )}
                                {(match.status === 'upcoming' || match.status === 'in_progress') && (
                                    <button
                                        onClick={handleResetMatch}
                                        className="inline-flex items-center rounded-md bg-red-600 px-2 py-1 text-xs font-gotham font-semibold text-white shadow-sm hover:bg-red-700"
                                        title="Reset Match"
                                    >
                                        🔄
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Warm-up Control - Compact */}
                    {!warmupCompleted && (
                        <div className="flex-shrink-0 bg-white shadow-sm rounded-lg p-2 border-2 border-accent">
                            <div className="flex items-center justify-between gap-3">
                                <div className="text-2xl font-bold text-primary">
                                    ⏱️ {formatTime(warmupTime)}
                                </div>
                                <div className="flex gap-2">
                                    {!match.warmup_started_at ? (
                                        <button
                                            onClick={handleStartWarmup}
                                            className="px-3 py-1 text-sm font-medium text-white bg-success rounded-lg hover:bg-success-700"
                                        >
                                            ▶ Start
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleResetWarmup}
                                                className="px-2 py-1 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700"
                                            >
                                                Restart 🔄
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={handleSkipWarmup}
                                        className="px-3 py-1 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-600"
                                    >
                                        ⏭ Skip
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Match Control - Compact */}
                    {warmupCompleted && (
                        <>
                            {!isMatchStarted ? (
                                <div className="flex-1 flex items-center justify-center bg-white shadow-sm rounded-lg border-4 border-success">
                                    <button
                                        onClick={handleStartMatch}
                                        className="px-16 py-10 text-4xl font-bold text-white bg-success rounded-lg hover:bg-success-700 shadow-xl"
                                    >
                                        🎾 START MATCH
                                    </button>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                                    {/* Set Won - Action Required */}
                                    {winningTeam && (
                                        <div className="bg-accent shadow-xl rounded-lg p-6 border-4 border-success animate-pulse">
                                            <div className="text-center mb-4">
                                                <p className="text-3xl font-bold text-dark mb-2">
                                                    🏆 SET WON! 🏆
                                                </p>
                                                <p className="text-xl font-bold text-dark">
                                                    {winningTeam === 'team1' 
                                                        ? `${match.team1.player_1} - ${match.team1.player_2}`
                                                        : `${match.team2.player_1} - ${match.team2.player_2}`
                                                    }
                                                </p>
                                                <p className="text-2xl font-bold text-dark mt-2">
                                                    Score: {match.team1_score || 0} - {match.team2_score || 0}
                                                </p>
                                            </div>
                                            <div className="flex gap-4 justify-center">
                                                <button
                                                    onClick={handleCompleteMatch}
                                                    className="px-8 py-4 text-xl font-bold text-white bg-success rounded-lg hover:bg-success-700 shadow-lg"
                                                >
                                                    ✅ Complete Match
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Score Display & Controls - All in One */}
                                    <div className={`bg-white shadow-sm rounded-lg p-3 border-4 border-primary flex flex-col ${winningTeam ? 'opacity-50 pointer-events-none' : ''}`}>
                                        {/* Scoring Info */}
                                        <div className="text-center mb-2">
                                            {match.is_tiebreaker ? (
                                                <div className="text-base font-bold text-red-600 mb-2">
                                                    🔥 TIE-BREAKER 🔥
                                                    <div className="text-sm text-neutral-600 font-normal mt-1">
                                                        First to {scoringConfig.tiebreakerPoints}{scoringConfig.tiebreakerTwoPointDiff && ', win by 2'}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-neutral-600">
                                                    First to {scoringConfig.gamesTarget} games • 
                                                    {scoringConfig.scoringType === 'no_ad' && ' No-Ad'}
                                                    {scoringConfig.scoringType === 'traditional' && ' Traditional'}
                                                    {scoringConfig.scoringType === 'advantage_limit' && ` Max ${scoringConfig.advantageLimit} Adv`}
                                                    <div className="mt-1">
                                                        Tie-breaker at {scoringConfig.gamesTarget - 1}-{scoringConfig.gamesTarget - 1}
                                                    </div>
                                                </div>
                                            )}
                                            {!match.is_tiebreaker && match.current_game_advantages > 0 && !match.pending_game_winner && scoringConfig.scoringType !== 'no_ad' && (
                                                <div className="mt-1 text-sm font-bold text-primary">
                                                    Advantages: {match.current_game_advantages}
                                                    {scoringConfig.scoringType === 'advantage_limit' && ` / ${scoringConfig.advantageLimit}`}
                                                    {scoringConfig.scoringType === 'traditional' && ' (Unlimited)'}
                                                </div>
                                            )}
                                            {!match.is_tiebreaker && 
                                             scoringConfig.scoringType === 'advantage_limit' && 
                                             match.current_game_advantages >= scoringConfig.advantageLimit && 
                                             match.current_game_team1_points === '40' && 
                                             match.current_game_team2_points === '40' && 
                                             !match.pending_game_winner && (
                                                <div className="mt-1">
                                                    <span className="inline-block px-4 py-2 text-base font-bold text-white bg-red-600 rounded-lg animate-pulse">
                                                        ⚡ STAR POINT ⚡
                                                    </span>
                                                </div>
                                            )}
                                            {match.pending_game_winner && (
                                                <div className="mt-1 text-base font-bold text-success">
                                                    🎾 Game Won - Confirm to Continue
                                                </div>
                                            )}
                                        </div>

                                        {/* Team 1 */}
                                        <div className="flex-1 border-4 border-success rounded-lg p-4 bg-success-50 mb-2">
                                            <div className="flex items-center gap-4 h-full">
                                                <div className="flex-1">
                                                    <p className="text-sm text-neutral-600 mb-1">Team 1</p>
                                                    <p className="text-lg font-bold">{match.team1.player_1} - {match.team1.player_2}</p>
                                                    {winningTeam === 'team1' && (
                                                        <div className="mt-1">
                                                            <span className="inline-block px-3 py-1 text-sm font-bold text-white bg-accent rounded-lg border-2 border-success animate-pulse">
                                                                🏆 WINNER
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-center min-w-[140px]">
                                                    <p className="text-sm text-neutral-600 mb-1">Games</p>
                                                    <div className="h-[120px] flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleAdjustGameScore('team1', -1)}
                                                            className="px-2 py-1 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700"
                                                            disabled={match.team1_score === 0}
                                                        >
                                                            −
                                                        </button>
                                                        <p className="text-7xl font-bold text-dark leading-none">{match.team1_score || 0}</p>
                                                        <button
                                                            onClick={() => handleAdjustGameScore('team1', 1)}
                                                            className="px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-center min-w-[140px]">
                                                    <div className="flex items-center justify-center gap-1 mb-1">
                                                        <p className="text-sm text-neutral-600">Points</p>
                                                        <button
                                                            onClick={() => handleSetCurrentPoints('team1')}
                                                            className="px-1 py-0 text-xs text-blue-600 hover:text-blue-800"
                                                            title="Set points"
                                                        >
                                                            ✏️
                                                        </button>
                                                    </div>
                                                    <div className="h-[120px] flex items-center justify-center">
                                                        {(() => {
                                                            const displayValue = getPointDisplay(match.current_game_team1_points, 'team1');
                                                            const isNumeric = !isNaN(displayValue);
                                                            const isWin = displayValue === 'WIN';
                                                            return (
                                                                <p className={`font-bold leading-none ${!isNumeric ? `text-6xl ${isWin ? 'text-accent animate-pulse' : 'text-primary'}` : 'text-7xl text-primary'}`}>
                                                                    {displayValue}
                                                                </p>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {match.pending_game_winner === 'team1' ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={handleConfirmGameWin}
                                                                className="px-5 py-6 text-3xl font-bold text-white bg-primary rounded-lg hover:bg-primary-600 shadow-lg min-w-[160px]"
                                                            >
                                                                ✅ Confirm
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={handleUndoGameWin}
                                                                className="px-4 py-2 text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                                                            >
                                                                ↶ Undo
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleScorePoint('team1')}
                                                                className="px-10 py-8 text-3xl font-bold text-white bg-success rounded-lg hover:bg-success-700 shadow-lg min-w-[160px]"
                                                            >
                                                                + POINT
                                                            </button>
                                                            <button
                                                                onClick={() => handleUndoPoint('team1')}
                                                                className="px-4 py-2 text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                                                            >
                                                                ↶ Undo
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* VS Divider */}
                                        <div className="text-center text-2xl font-bold text-gray-400">VS</div>

                                        {/* Team 2 */}
                                        <div className="flex-1 border-4 border-primary rounded-lg p-4 bg-primary-50">
                                            <div className="flex items-center gap-4 h-full">
                                                <div className="flex-1">
                                                    <p className="text-sm text-neutral-600 mb-1">Team 2</p>
                                                    <p className="text-lg font-bold">{match.team2.player_1} - {match.team2.player_2}</p>
                                                    {winningTeam === 'team2' && (
                                                        <div className="mt-1">
                                                            <span className="inline-block px-3 py-1 text-sm font-bold text-white bg-accent rounded-lg border-2 border-primary animate-pulse">
                                                                🏆 WINNER
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-center min-w-[140px]">
                                                    <p className="text-sm text-neutral-600 mb-1">Games</p>
                                                    <div className="h-[120px] flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleAdjustGameScore('team2', -1)}
                                                            className="px-2 py-1 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700"
                                                            disabled={match.team2_score === 0}
                                                        >
                                                            −
                                                        </button>
                                                        <p className="text-7xl font-bold text-dark leading-none">{match.team2_score || 0}</p>
                                                        <button
                                                            onClick={() => handleAdjustGameScore('team2', 1)}
                                                            className="px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-center min-w-[140px]">
                                                    <div className="flex items-center justify-center gap-1 mb-1">
                                                        <p className="text-sm text-neutral-600">Points</p>
                                                        <button
                                                            onClick={() => handleSetCurrentPoints('team2')}
                                                            className="px-1 py-0 text-xs text-blue-600 hover:text-blue-800"
                                                            title="Set points"
                                                        >
                                                            ✏️
                                                        </button>
                                                    </div>
                                                    <div className="h-[120px] flex items-center justify-center">
                                                        {(() => {
                                                            const displayValue = getPointDisplay(match.current_game_team2_points, 'team2');
                                                            const isNumeric = !isNaN(displayValue);
                                                            const isWin = displayValue === 'WIN';
                                                            return (
                                                                <p className={`font-bold leading-none ${!isNumeric ? `text-6xl ${isWin ? 'text-accent animate-pulse' : 'text-primary'}` : 'text-7xl text-primary'}`}>
                                                                    {displayValue}
                                                                </p>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {match.pending_game_winner === 'team2' ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={handleConfirmGameWin}
                                                                className="px-5 py-6 text-3xl font-bold text-white bg-primary rounded-lg hover:bg-primary-600 shadow-lg min-w-[160px]"
                                                            >
                                                                ✅ Confirm
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={handleUndoGameWin}
                                                                className="px-4 py-2 text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                                                            >
                                                                ↶ Undo
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleScorePoint('team2')}
                                                                className="px-10 py-8 text-3xl font-bold text-white bg-success rounded-lg hover:bg-success-700 shadow-lg min-w-[160px]"
                                                            >
                                                                + POINT
                                                            </button>
                                                            <button
                                                                onClick={() => handleUndoPoint('team2')}
                                                                className="px-4 py-2 text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                                                            >
                                                                ↶ Undo
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

