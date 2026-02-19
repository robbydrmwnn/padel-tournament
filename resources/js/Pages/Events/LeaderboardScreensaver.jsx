import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { formatDateTime } from '@/Utils/dateFormatter';

export default function LeaderboardScreensaver({ event, categoriesData, courtsWithMatches = [] }) {
    const [currentView, setCurrentView] = useState('leaderboard'); // 'leaderboard', 'monitors', 'schedule'
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const scheduleScrollRef = useRef(null);
    const leaderboardScrollRef = useRef(null);

    // Auto-refresh data every 5 seconds to get latest match states
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['categoriesData', 'courtsWithMatches'], preserveScroll: true, preserveState: true });        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Update clock every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Shared auto-scroll logic: scrolls container to bottom, pauses, then resets to top
    const runAutoScroll = (scrollContainerRef, scrollSpeed = 1) => {
        if (!scrollContainerRef?.current) return () => {};

        const scrollContainer = scrollContainerRef.current;
        let scrollPosition = 0;
        let animationFrameId;
        let pauseTimeout;

        const autoScroll = () => {
            if (!scrollContainerRef?.current) return;

            const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;

            if (maxScroll <= 0) return;

            if (scrollPosition >= maxScroll) {
                pauseTimeout = setTimeout(() => {
                    scrollPosition = 0;
                    scrollContainer.scrollTop = 0;
                    animationFrameId = requestAnimationFrame(autoScroll);
                }, 2000);
                return;
            }

            scrollPosition += scrollSpeed;
            scrollContainer.scrollTop = scrollPosition;
            animationFrameId = requestAnimationFrame(autoScroll);
        };

        const startTimeout = setTimeout(() => {
            animationFrameId = requestAnimationFrame(autoScroll);
        }, 1000);

        return () => {
            cancelAnimationFrame(animationFrameId);
            clearTimeout(startTimeout);
            clearTimeout(pauseTimeout);
        };
    };

    // Auto-scroll for schedule view
    useEffect(() => {
        if (currentView !== 'schedule' || !scheduleScrollRef.current) return;
        return runAutoScroll(scheduleScrollRef);
    }, [currentView]);

    // Auto-scroll for leaderboard group view (when many participants)
    useEffect(() => {
        if (currentView !== 'leaderboard' || !leaderboardScrollRef.current) return;
        return runAutoScroll(leaderboardScrollRef);
    }, [currentView, currentCategoryIndex]);

    // Auto-rotation logic - only cycle through categories for group leaderboard
    useEffect(() => {
        let timer;

        if (currentView === 'leaderboard') {
            // Show each category for 10 seconds
            timer = setTimeout(() => {
                if (currentCategoryIndex < categoriesData.length - 1) {
                    setCurrentCategoryIndex(currentCategoryIndex + 1);
                } else {
                    // Move to monitors view
                    setCurrentView('monitors');
                    setCurrentCategoryIndex(0);
                }
            }, 40000);
        } else if (currentView === 'monitors') {
            // Show monitors for 5 seconds
            timer = setTimeout(() => {
                setCurrentView('schedule');
            }, 5000);
        } else if (currentView === 'schedule') {
            // Show schedule for 10 seconds
            timer = setTimeout(() => {
                // Go back to leaderboard
                setCurrentView('leaderboard');
                setCurrentCategoryIndex(0);
            }, 60000);
        }

        return () => clearTimeout(timer);
    }, [currentView, currentCategoryIndex, categoriesData.length]);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const getPointDisplay = (points, isPendingWinner, isTiebreaker) => {
        if (isPendingWinner) return 'WIN';
        if (isTiebreaker) return points || '0';
        if (points === 'AD') return 'AD';
        return points || '0';
    };

    // Get current view title for header
    const getCurrentTitle = () => {
        if (currentView === 'monitors') {
            return { main: '🎾 Live Matches', sub: '' };
        } else if (currentView === 'schedule') {
            return { main: '📅 Schedule', sub: '' };
        } else if (currentView === 'leaderboard') {
            if (categoriesData.length === 0 || !categoriesData[currentCategoryIndex]) {
                return { main: 'No Categories Available', sub: '' };
            }
            const { category, currentPhase } = categoriesData[currentCategoryIndex];
            return { 
                main: category.name, 
                sub: currentPhase ? currentPhase.name : 'No active phase' 
            };
        }
        return { main: '', sub: '' };
    };

    // Render leaderboard view for current category
    const renderLeaderboardView = () => {
        if (categoriesData.length === 0 || !categoriesData[currentCategoryIndex]) {
            return (
                <div className="text-center">
                    <p className="text-4xl font-gotham text-neutral-300">Please configure categories and phases</p>
                </div>
            );
        }

        const { category, currentPhase, leaderboardData, scheduleData } = categoriesData[currentCategoryIndex];
        const isIndividual = category.participant_mode === 'individual';

        if (!currentPhase) {
            return (
                <div className="text-center">
                    <p className="text-4xl font-gotham text-neutral-300">No active phase</p>
                </div>
            );
        }

        // Check if knockout phase (leaderboardData is an object with type property)
        if (leaderboardData && leaderboardData.type === 'knockout') {
            // Use scheduleData to show all matches (scheduled, in_progress, completed)
            const knockoutMatches = scheduleData || [];
            
            return (
                <div className="h-full flex items-center justify-center">
                    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto w-full">
                        {knockoutMatches.length > 0 ? (
                            knockoutMatches.map((match) => (
                                <div key={match.id} className={`backdrop-blur-sm rounded-xl p-6 border-4 ${
                                    match.status === 'completed' 
                                        ? 'bg-neutral-800/60 border-neutral-600' 
                                        : match.status === 'in_progress'
                                        ? 'bg-success/30 border-success'
                                        : 'bg-neutral-900/80 border-accent'
                                }`}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <p className={`text-3xl font-bold font-raverist ${
                                                match.status === 'completed' && match.winner_id === match.team1_id 
                                                    ? 'text-accent' 
                                                    : 'text-white'
                                            }`}>
                                                {match.team1?.player_1 || match.team1_template || 'TBD'} / {match.team1?.player_2 || ''}
                                            </p>
                                        </div>
                                        <div className={`text-5xl font-bold mx-8 ${
                                            match.status === 'completed' && match.winner_id === match.team1_id 
                                                ? 'text-accent' 
                                                : 'text-white'
                                        }`}>
                                            {match.status === 'scheduled' ? '-' : match.team1_score || 0}
                                        </div>
                                        <div className="text-3xl font-bold text-accent mx-4">
                                            {match.status === 'in_progress' ? '🔴 LIVE' : 'VS'}
                                        </div>
                                        <div className={`text-5xl font-bold mx-8 ${
                                            match.status === 'completed' && match.winner_id === match.team2_id 
                                                ? 'text-accent' 
                                                : 'text-white'
                                        }`}>
                                            {match.status === 'scheduled' ? '-' : match.team2_score || 0}
                                        </div>
                                        <div className="flex-1 text-right">
                                            <p className={`text-3xl font-bold font-raverist ${
                                                match.status === 'completed' && match.winner_id === match.team2_id 
                                                    ? 'text-accent' 
                                                    : 'text-white'
                                            }`}>
                                                {match.team2?.player_1 || match.team2_template || 'TBD'} / {match.team2?.player_2 || ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-3xl font-gotham text-neutral-300 text-center">No matches scheduled</p>
                        )}
                    </div>
                </div>
            );
        }

        // Group phase leaderboard (leaderboardData is an array)
        return (
            <div className="flex justify-center items-start">
                {!Array.isArray(leaderboardData) || leaderboardData.length === 0 ? (
                    <p className="text-4xl font-gotham text-neutral-300 text-center">No groups available</p>
                ) : (
                    <div className="max-h-[calc(100vh-200px)] rounded-xl overflow-hidden border-4 border-accent">
                        <div
                            ref={leaderboardScrollRef}
                            className="h-full max-h-[calc(100vh-200px)] overflow-y-auto schedule-scroll"
                            style={{
                                scrollbarWidth: 'none',
                            }}
                        >
                            <div className="grid grid-cols-2 gap-3 auto-rows-fr min-h-0">
                            {leaderboardData.map((groupData) => (
                                <div key={groupData.group.id} className="bg-neutral-900/80 backdrop-blur-sm rounded-xl overflow-hidden flex flex-col min-h-0 min-w-70">
                                {/* <div className="bg-primary px-3 py-2 border-b-4 border-accent flex-shrink-0">
                                    <h3 className="text-2xl font-bold font-raverist text-white leading-tight">
                                        Group {groupData.group.name}
                                    </h3>
                                </div> */}
                                <div className="p-2 flex-1 flex flex-col">
                                    {groupData.standings.length === 0 ? (
                                        <p className="text-neutral-400 font-gotham text-center py-4">No standings yet</p>
                                    ) : (
                                        <table className="w-full h-full">
                                            <thead>
                                                <tr className="border-b-2 border-neutral-700">
                                                    <th className="text-left py-2 px-2 font-gotham font-bold text-neutral-300 text-base">Rank</th>
                                                    <th className="text-left py-2 px-2 font-gotham font-bold text-neutral-300 text-base">{isIndividual ? 'Player' : 'Team'}</th>
                                                    <th className="text-center py-2 px-2 font-gotham font-bold text-neutral-300 text-base">W</th>
                                                    <th className="text-center py-2 px-2 font-gotham font-bold text-neutral-300 text-base">L</th>
                                                    <th className="text-center py-2 px-2 font-gotham font-bold text-neutral-300 text-base">GW</th>
                                                    <th className="text-center py-2 px-2 font-gotham font-bold text-neutral-300 text-base">GL</th>
                                                    <th className="text-center py-2 px-2 font-gotham font-bold text-neutral-300 text-base">DF</th>
                                                    <th className="text-center py-2 px-2 font-gotham font-bold text-neutral-300 text-base">Pts</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {groupData.standings.map((standing, index) => {
                                                    const points = standing.won * 2;
                                                    return (
                                                        <tr key={standing.participant.id} className={`border-b border-neutral-800 ${
                                                            index === 0 ? 'bg-accent/20' : index === 1 ? 'bg-success/10' : ''
                                                        }`}>
                                                            <td className="py-3 px-2">
                                                                <span className={`text-2xl font-bold font-raverist ${
                                                                    index === 0 ? 'text-accent' : index === 1 ? 'text-success' : 'text-white'
                                                                }`}>
                                                                    {/* {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`} */}
                                                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : `#${index + 1}`}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-2">
                                                                <div className="text-lg font-gotham font-bold text-white truncate leading-tight">
                                                                    {isIndividual
                                                                        ? standing.participant.player_1
                                                                        : `${standing.participant.player_1} / ${standing.participant.player_2}`
                                                                    }
                                                                </div>
                                                            </td>
                                                            <td className="text-center py-3 px-2 text-xl font-gotham font-bold text-success">{standing.won}</td>
                                                            <td className="text-center py-3 px-2 text-xl font-gotham font-bold text-red-500">{standing.lost}</td>
                                                            <td className="text-center py-3 px-2 text-xl font-gotham font-bold text-white">{standing.games_won}</td>
                                                            <td className="text-center py-3 px-2 text-xl font-gotham font-bold text-neutral-400">{standing.games_lost}</td>
                                                            <td className="text-center py-3 px-2 text-xl font-gotham font-bold text-neutral-400">{(standing.games_won - standing.games_lost)}</td>
                                                            <td className="text-center py-3 px-2 text-2xl font-gotham font-bold text-accent">{points}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Render monitors view (Court 1 and Court 2)
    const renderMonitorsView = () => {
        const renderCourtMonitor = (court, match) => {
            const isIndividual = match?.category?.participant_mode === 'individual';
            const hasTeams = !!(match && match.team1 && match.team2);
            const hasSides = !!(match && match.side1_player1_id && match.side1_player2_id && match.side2_player1_id && match.side2_player2_id);

            if (!match || (isIndividual ? !hasSides : !hasTeams)) {
                return (
                    <div className="bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-4 border-accent text-center">
                        <div className="text-6xl mb-4">🎾</div>
                        <h2 className="text-5xl font-bold font-raverist text-white mb-4">COURT {court?.name || 'N/A'}</h2>
                        <p className="text-3xl font-gotham text-accent font-bold">No Active Match</p>
                    </div>
                );
            }

            const isMatchStarted = match.match_started_at !== null;
            const winningTeam = (() => {
                if (!match || match.status === 'completed') return null;
                const gamesTarget = match.tournament_phase?.games_target || 4;
                const team1Score = match.team1_score || 0;
                const team2Score = match.team2_score || 0;
                if (team1Score >= gamesTarget && team1Score > team2Score) return 'team1';
                if (team2Score >= gamesTarget && team2Score > team1Score) return 'team2';
                return null;
            })();

            return (
                <div className="bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border-4 border-accent">
                    <div className="text-center mb-3">
                        <p className="text-2xl font-bold font-raverist text-white">COURT {court?.name || 'N/A'}</p>
                        {/* <p className="text-2xl font-gotham text-accent">{match.category?.name}</p> */}
                        {/* {match.tournament_phase && (
                            <p className="text-xl font-gotham text-neutral-300">{match.tournament_phase.name}</p>
                        )} */}
                    </div>

                    {/* Team 1 */}
                    <div className="bg-success/85 backdrop-blur-sm rounded-xl p-3 mb-2 border-4 border-accent">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="text-2xl font-bold font-raverist text-white leading-tight">
                                    <div className="truncate">{isIndividual ? (match.side1_player1?.player_1 || '') : match.team1.player_1}</div>
                                    <div className="truncate">{isIndividual ? (match.side1_player2?.player_1 || '') : match.team1.player_2}</div>
                                </div>
                                {winningTeam === 'team1' && (
                                    <span className="inline-block px-3 py-1 text-xl font-bold font-raverist bg-accent text-dark rounded-lg animate-pulse mt-1">
                                        🏆 WINNER
                                    </span>
                                )}
                            </div>
                            {/* <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="text-center bg-dark/90 rounded-lg border-4 border-accent w-[100px] h-[80px] flex items-center justify-center">
                                    <div className="text-5xl font-bold text-white">{match.team1_score || 0}</div>
                                </div>
                                {isMatchStarted && (
                                    <div className="text-center bg-dark/90 rounded-lg border-4 border-accent w-[100px] h-[80px] flex items-center justify-center">
                                        <div className={`font-bold ${match.is_tiebreaker || !isNaN(match.current_game_team1_points) ? 'text-5xl' : 'text-4xl'} text-white`}>
                                            {getPointDisplay(match.current_game_team1_points, match.pending_game_winner === 'team1', match.is_tiebreaker)}
                                        </div>
                                    </div>
                                )}
                            </div> */}
                        </div>
                    </div>

                    {/* VS */}
                    <div className="text-center my-1">
                        <span className="text-3xl font-bold font-raverist text-accent">VS</span>
                    </div>

                    {/* Team 2 */}
                    <div className="bg-primary/85 backdrop-blur-sm rounded-xl p-3 border-4 border-accent">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="text-2xl font-bold font-raverist text-white leading-tight">
                                    <div className="truncate">{isIndividual ? (match.side2_player1?.player_1 || '') : match.team2.player_1}</div>
                                    <div className="truncate">{isIndividual ? (match.side2_player2?.player_1 || '') : match.team2.player_2}</div>
                                </div>
                                {winningTeam === 'team2' && (
                                    <span className="inline-block px-3 py-1 text-xl font-bold font-raverist bg-accent text-dark rounded-lg animate-pulse mt-1">
                                        🏆 WINNER
                                    </span>
                                )}
                            </div>
                            {/* <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="text-center bg-dark/90 rounded-lg border-4 border-accent w-[100px] h-[80px] flex items-center justify-center">
                                    <div className="text-5xl font-bold text-white">{match.team2_score || 0}</div>
                                </div>
                                {isMatchStarted && (
                                    <div className="text-center bg-dark/90 rounded-lg border-4 border-accent w-[100px] h-[80px] flex items-center justify-center">
                                        <div className={`font-bold ${match.is_tiebreaker || !isNaN(match.current_game_team2_points) ? 'text-5xl' : 'text-4xl'} text-white`}>
                                            {getPointDisplay(match.current_game_team2_points, match.pending_game_winner === 'team2', match.is_tiebreaker)}
                                        </div>
                                    </div>
                                )}
                            </div> */}
                        </div>
                    </div>
                </div>
            );
        };

        const gridCols = courtsWithMatches.length <= 2 ? 2 : courtsWithMatches.length <= 4 ? 2 : 3;
        return (
            <div className="h-full flex items-center justify-center overflow-auto p-4">
                <div
                    className="grid gap-4 md:gap-6 w-full max-w-7xl"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {courtsWithMatches.map(({ court, match }, index) => (
                        <div key={court?.id ?? `court-${index}`}>
                            {renderCourtMonitor(court, match)}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render schedule view
    const renderScheduleView = () => {
        const allSchedules = [];
        categoriesData.forEach(({ category, currentPhase, scheduleData }) => {
            if (scheduleData && scheduleData.length > 0) {
                const isIndividual = category.participant_mode === 'individual';
                scheduleData.forEach((match) => {
                    allSchedules.push({
                        ...match,
                        categoryName: category.name,
                        phaseName: currentPhase?.name,
                        isIndividual,
                    });
                });
            }
        });

        // Sort by scheduled time (ascending - earliest first)
        allSchedules.sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time));

        return (
            <div>
                {allSchedules.length === 0 ? (
                    <p className="text-4xl font-gotham text-neutral-300 text-center">No matches</p>
                ) : (
                    <div 
                        ref={scheduleScrollRef}
                        className="max-h-[calc(100vh-200px)] overflow-y-auto space-y-1 schedule-scroll"
                        style={{
                            scrollbarWidth: 'none',
                        }}
                    >
                        {allSchedules.map((match) => (
                            <div key={match.id} className={`backdrop-blur-sm rounded-lg px-3 py-2 border-2 ${
                                match.status === 'completed' 
                                    ? 'bg-neutral-800/60 border-neutral-600' 
                                    : match.status === 'in_progress'
                                    ? 'bg-success/30 border-success'
                                    : 'bg-neutral-900/80 border-neutral-600'
                            }`}>
                                <div className="flex items-center gap-2">
                                    {/* Time & Court */}
                                    <div className="flex-shrink-0" style={{ width: '140px' }}>
                                        <p className="text-sm font-gotham font-bold text-white leading-tight">
                                            {match.scheduled_time ? match.scheduled_time.substring(11, 16) : 'TBA'} • Court {match.court?.name || '?'}
                                        </p>
                                    </div>

                                    {/* Category */}
                                    {/* <div className="flex-shrink-0" style={{ width: '140px' }}>
                                        <p className="text-sm font-gotham font-bold text-white truncate leading-tight">
                                            {match.categoryName}
                                        </p>
                                    </div> */}

                                    {/* Teams & Score - support both camelCase and snake_case (Laravel serialization) */}
                                    <div className="flex-1 flex items-center gap-2 min-w-0">
                                        <p className="text-base font-gotham font-bold text-white text-right flex-1 min-w-0 truncate">
                                            {match.isIndividual
                                                ? `${(match.side1Player1 || match.side1_player1)?.player_1 || ''} / ${(match.side1Player2 || match.side1_player2)?.player_1 || ''}`
                                                : (() => {
                                                    const t1 = match.team1 || match.team_1;
                                                    return `${t1?.player_1 || ''} / ${t1?.player_2 || ''}`;
                                                })()
                                            }
                                        </p>
                                        
                                        {match.status === 'completed' ? (
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <span className={`text-xl font-bold font-gotham ${
                                                    match.winner_id === match.team1_id ? 'text-accent' : 'text-neutral-400'
                                                }`}>
                                                    {match.team1_score || 0}
                                                </span>
                                                <span className="text-sm font-bold text-neutral-500">-</span>
                                                <span className={`text-xl font-bold font-gotham ${
                                                    match.winner_id === match.team2_id ? 'text-accent' : 'text-neutral-400'
                                                }`}>
                                                    {match.team2_score || 0}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-base font-bold text-accent flex-shrink-0">VS</span>
                                        )}
                                        
                                        <p className="text-base font-gotham font-bold text-white flex-1 min-w-0 truncate">
                                            {match.isIndividual
                                                ? `${(match.side2Player1 || match.side2_player1)?.player_1 || ''} / ${(match.side2Player2 || match.side2_player2)?.player_1 || ''}`
                                                : (() => {
                                                    const t2 = match.team2 || match.team_2;
                                                    return `${t2?.player_1 || ''} / ${t2?.player_2 || ''}`;
                                                })()
                                            }
                                        </p>
                                    </div>

                                    {/* Status */}
                                    <div className="flex-shrink-0" style={{ width: '50px' }}>
                                        <div className="text-right">
                                            {match.status === 'in_progress' && (
                                                <span className="px-2 py-1 bg-success text-white rounded text-xs font-bold">
                                                    LIVE
                                                </span>
                                            )}
                                            {match.status === 'completed' && (
                                                <span className="text-xs font-gotham text-neutral-500">
                                                    FT
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <Head title={`${event.name} - Leaderboard`} />
            <style>{`
                /* Hide scrollbar but keep scroll (leaderboard) */
                .scrollbar-hidden {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .scrollbar-hidden::-webkit-scrollbar {
                    display: none;
                }
                /* Custom scrollbar styling (schedule) */
                .schedule-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .schedule-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .schedule-scroll::-webkit-scrollbar-thumb {
                    background: rgba(255, 193, 7, 0.5);
                    border-radius: 3px;
                }
                .schedule-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 193, 7, 0.7);
                }
            `}</style>

            <div className="h-screen overflow-hidden text-white flex flex-col" 
                 style={{
                     backgroundImage: 'url(/images/blue.png)',
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     backgroundRepeat: 'no-repeat'
                 }}>
                {/* Header */}
                <div className="bg-primary/90 backdrop-blur-sm py-2 px-6 shadow-2xl border-b-4 border-accent flex-shrink-0">
                    <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <p className="text-5xl text-white font-gotham font-bold leading-tight truncate">{getCurrentTitle().main}</p>
                            {getCurrentTitle().sub && (
                                <p className="text-xl text-accent font-gotham font-bold leading-tight truncate">{getCurrentTitle().sub}</p>
                            )}
                        </div>
                        {/* <img src="/logo/logo.jpeg" alt="Logo" className="h-12 object-contain flex-shrink-0" /> */}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden p-4">
                    <div className="max-w-7xl mx-auto h-full">
                        {currentView === 'leaderboard' && renderLeaderboardView()}
                        {currentView === 'monitors' && renderMonitorsView()}
                        {currentView === 'schedule' && renderScheduleView()}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-primary/90 backdrop-blur-sm py-2 px-6 border-t-4 border-accent flex-shrink-0">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <p className="text-xl text-white font-gotham font-bold">{event.name}</p>
                        <div className="flex gap-2">
                            {categoriesData.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2.5 h-2.5 rounded-full ${
                                        currentView === 'leaderboard' && currentCategoryIndex === index
                                            ? 'bg-accent'
                                            : 'bg-neutral-500'
                                    }`}
                                />
                            ))}
                                                    <div
                                className={`w-2.5 h-2.5 rounded-full ${
                                    currentView === 'monitors' ? 'bg-accent' : 'bg-neutral-500'
                                }`}
                            />
                            <div
                                className={`w-2.5 h-2.5 rounded-full ${
                                    currentView === 'schedule' ? 'bg-accent' : 'bg-neutral-500'
                                }`}
                            />
                        </div>
                        <p className="text-2xl text-accent font-gotham font-bold">{formatTime(currentTime)}</p>
                    </div>
                </div>
            </div>
        </>
    );
}
