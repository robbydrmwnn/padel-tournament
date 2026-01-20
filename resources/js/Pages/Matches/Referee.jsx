import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Referee({ category, match }) {
    const { flash } = usePage().props;
    const [warmupTime, setWarmupTime] = useState(0);
    const [isWarmupRunning, setIsWarmupRunning] = useState(false);
    const [warmupCompleted, setWarmupCompleted] = useState(false);
    
    // Get scoring configuration based on match phase
    const scoringConfig = match.phase === 'group' ? {
        bestOfGames: category.group_best_of_games,
        scoringType: category.group_scoring_type,
        advantageLimit: category.group_advantage_limit,
    } : {
        bestOfGames: category.knockout_best_of_games,
        scoringType: category.knockout_scoring_type,
        advantageLimit: category.knockout_advantage_limit,
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

    const handleStartWarmup = () => {
        router.post(route('categories.matches.warmup.start', [category.id, match.id]), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsWarmupRunning(true);
            },
        });
    };

    const handlePauseWarmup = () => {
        setIsWarmupRunning(false);
    };

    const handleResumeWarmup = () => {
        setIsWarmupRunning(true);
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

    const handleResetMatch = () => {
        if (confirm('⚠️ RESET MATCH?\n\nThis will completely reset the match to scheduled state:\n• All scores will be cleared\n• Warm-up will be reset\n• Match status will return to scheduled\n• Court will become available for other matches\n\nThis action is useful if you started the wrong match by mistake.\n\nAre you sure?')) {
            router.post(route('categories.matches.reset', [category.id, match.id]));
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getPointDisplay = (points) => {
        if (points === 'AD') return 'AD';
        return points || '0';
    };

    const isMatchStarted = match.match_started_at !== null;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <nav className="text-sm text-neutral-600 mb-1">
                        <Link href={route('events.index')} className="hover:text-dark">Events</Link>
                        {' / '}
                        <Link href={route('events.show', category.event.id)} className="hover:text-dark">
                            {category.event.name}
                        </Link>
                        {' / '}
                        <Link href={route('events.categories.show', [category.event.id, category.id])} className="hover:text-dark">
                            {category.name}
                        </Link>
                        {' / '}
                        <Link href={route('categories.matches.index', category.id)} className="hover:text-dark">
                            Matches
                        </Link>
                    </nav>
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold font-raverist leading-tight text-dark">
                            Referee Control
                        </h2>
                        {match.court_id && (
                            <Link
                                href={route('courts.monitor', match.court_id)}
                                target="_blank"
                                className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-gotham font-semibold font-gotham text-dark shadow-sm hover:bg-accent-700"
                            >
                                Open Court {match.court?.name} Monitor
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Referee Control" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="bg-success-50 border border-success-200 text-success-800 px-4 py-3 rounded relative">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative">
                            {flash.error}
                        </div>
                    )}
                    {flash?.warning && (
                        <div className="bg-accent-50 border border-accent-200 text-accent-800 px-4 py-3 rounded relative">
                            {flash.warning}
                        </div>
                    )}

                    {/* Match Info */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold font-raverist text-dark">Match Information</h3>
                                {(match.status === 'upcoming' || match.status === 'in_progress') && (
                                    <button
                                        onClick={handleResetMatch}
                                        className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-gotham font-semibold font-gotham text-white shadow-sm hover:bg-red-700"
                                    >
                                        🔄 Reset Match
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-neutral-600">Team 1</p>
                                    <p className="text-lg font-medium">{match.team1.player_1} - {match.team1.player_2}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-600">Team 2</p>
                                    <p className="text-lg font-medium">{match.team2.player_1} - {match.team2.player_2}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-600">Court</p>
                                    <p className="text-base">{match.court ? `Court ${match.court.name}` : 'Not assigned'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-600">Phase</p>
                                    <p className="text-base capitalize">{match.phase}</p>
                                </div>
                            </div>
                            {(match.status === 'upcoming' || match.status === 'in_progress') && (
                                <div className="mt-4 p-3 bg-accent-50 border border-accent-200 rounded-lg">
                                    <p className="text-sm text-accent-800">
                                        <strong>Note:</strong> Need to clear this match? Use the "Reset Match" button above to free up the court for a different match.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Warm-up Control */}
                    {!warmupCompleted && (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-bold font-raverist text-dark mb-4">Warm-up Timer</h3>
                                
                                <div className="text-center mb-6">
                                    <div className="text-6xl font-bold text-primary mb-4">
                                        {formatTime(warmupTime)}
                                    </div>
                                    <p className="text-sm text-neutral-600">
                                        {category.warmup_minutes} minute{category.warmup_minutes !== 1 ? 's' : ''} warm-up period
                                    </p>
                                </div>

                                <div className="flex justify-center gap-3">
                                    {!match.warmup_started_at ? (
                                        <button
                                            onClick={handleStartWarmup}
                                            className="px-6 py-3 text-base font-medium text-white bg-success rounded-lg hover:bg-success-700"
                                        >
                                            Start Warm-up
                                        </button>
                                    ) : (
                                        <>
                                            {isWarmupRunning ? (
                                                <button
                                                    onClick={handlePauseWarmup}
                                                    className="px-6 py-3 text-base font-medium text-dark bg-accent rounded-lg hover:bg-accent-700"
                                                >
                                                    Pause
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleResumeWarmup}
                                                    className="px-6 py-3 text-base font-medium text-white bg-success rounded-lg hover:bg-success-700"
                                                >
                                                    Resume
                                                </button>
                                            )}
                                            <button
                                                onClick={handleResetWarmup}
                                                className="px-6 py-3 text-base font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700"
                                            >
                                                Reset
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={handleSkipWarmup}
                                        className="px-6 py-3 text-base font-medium text-white bg-primary rounded-lg hover:bg-primary-600"
                                    >
                                        Skip Warm-up
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Match Control */}
                    {warmupCompleted && (
                        <>
                            {!isMatchStarted ? (
                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6 text-center">
                                        <h3 className="text-lg font-bold font-raverist text-dark mb-4">Ready to Start Match</h3>
                                        <button
                                            onClick={handleStartMatch}
                                            className="px-8 py-4 text-lg font-medium text-white bg-success rounded-lg hover:bg-success-700"
                                        >
                                            Start Match
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Current Score Display */}
                                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                        <div className="p-6">
                                            <h3 className="text-lg font-bold font-raverist text-dark mb-4">Current Score</h3>
                                            
                                            {/* Games Won */}
                                            <div className="grid grid-cols-3 gap-4 mb-6">
                                                <div className="text-center">
                                                    <p className="text-sm text-neutral-600 mb-2">Team 1</p>
                                                    <p className="text-4xl font-bold text-dark">{match.team1_score || 0}</p>
                                                    <p className="text-xs text-neutral-600 mt-1">Games</p>
                                                </div>
                                                <div className="flex items-center justify-center">
                                                    <span className="text-2xl text-gray-400">-</span>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-neutral-600 mb-2">Team 2</p>
                                                    <p className="text-4xl font-bold text-dark">{match.team2_score || 0}</p>
                                                    <p className="text-xs text-neutral-600 mt-1">Games</p>
                                                </div>
                                            </div>

                                            {/* Current Game Points */}
                                            <div className="border-t pt-6">
                                                <p className="text-sm text-neutral-600 text-center mb-4">Current Game</p>
                                                <div className="grid grid-cols-3 gap-4 mb-6">
                                                    <div className="text-center">
                                                        <p className="text-5xl font-bold text-primary">
                                                            {getPointDisplay(match.current_game_team1_points)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center justify-center">
                                                        <span className="text-2xl text-gray-400">-</span>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-5xl font-bold text-primary">
                                                            {getPointDisplay(match.current_game_team2_points)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Scoring Config Info */}
                                                <div className="text-center text-sm text-neutral-600 mb-4">
                                                    Best of {scoringConfig.bestOfGames} • 
                                                    {scoringConfig.scoringType === 'no_ad' && ' No-Ad (Golden Point)'}
                                                    {scoringConfig.scoringType === 'traditional' && ' Traditional'}
                                                    {scoringConfig.scoringType === 'advantage_limit' && ` Max ${scoringConfig.advantageLimit} Advantages`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Score Input Controls */}
                                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                        <div className="p-6">
                                            <h3 className="text-lg font-bold font-raverist text-dark mb-4">Score Controls</h3>
                                            
                                            <div className="grid grid-cols-2 gap-6">
                                                {/* Team 1 Controls */}
                                                <div className="border-2 border-primary-200 rounded-lg p-6 bg-primary-50">
                                                    <h4 className="text-center font-semibold text-dark mb-4">
                                                        {match.team1.player_1} - {match.team1.player_2}
                                                    </h4>
                                                    <div className="space-y-3">
                                                        <button
                                                            onClick={() => handleScorePoint('team1')}
                                                            className="w-full px-6 py-4 text-lg font-medium text-white bg-success rounded-lg hover:bg-success-700"
                                                        >
                                                            + Point
                                                        </button>
                                                        <button
                                                            onClick={() => handleUndoPoint('team1')}
                                                            className="w-full px-6 py-4 text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                                                        >
                                                            - Undo Point
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Team 2 Controls */}
                                                <div className="border-2 border-accent-200 rounded-lg p-6 bg-accent-50">
                                                    <h4 className="text-center font-semibold text-dark mb-4">
                                                        {match.team2.player_1} - {match.team2.player_2}
                                                    </h4>
                                                    <div className="space-y-3">
                                                        <button
                                                            onClick={() => handleScorePoint('team2')}
                                                            className="w-full px-6 py-4 text-lg font-medium text-white bg-success rounded-lg hover:bg-success-700"
                                                        >
                                                            + Point
                                                        </button>
                                                        <button
                                                            onClick={() => handleUndoPoint('team2')}
                                                            className="w-full px-6 py-4 text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                                                        >
                                                            - Undo Point
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

