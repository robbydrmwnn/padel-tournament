import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { formatDateTime } from '@/Utils/dateFormatter';

export default function LeaderboardScreensaver({ event, categoriesData, courtsWithMatches = [] }) {
    const [currentView, setCurrentView] = useState('leaderboard');
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const scheduleScrollRef = useRef(null);
    const leaderboardScrollRef = useRef(null);

    // Auto-refresh data every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['categoriesData', 'courtsWithMatches'], preserveScroll: true, preserveState: true });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Update clock every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

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

    useEffect(() => {
        if (currentView !== 'schedule' || !scheduleScrollRef.current) return;
        return runAutoScroll(scheduleScrollRef);
    }, [currentView]);

    useEffect(() => {
        if (currentView !== 'leaderboard' || !leaderboardScrollRef.current) return;
        return runAutoScroll(leaderboardScrollRef);
    }, [currentView, currentCategoryIndex]);

    useEffect(() => {
        let timer;
        if (currentView === 'leaderboard') {
            timer = setTimeout(() => {
                if (currentCategoryIndex < categoriesData.length - 1) {
                    setCurrentCategoryIndex(currentCategoryIndex + 1);
                } else {
                    setCurrentView('monitors');
                    setCurrentCategoryIndex(0);
                }
            }, 4000);
        } else if (currentView === 'monitors') {
            timer = setTimeout(() => {
                setCurrentView('schedule');
            }, 4000);
        } else if (currentView === 'schedule') {
            timer = setTimeout(() => {
                setCurrentView('leaderboard');
                setCurrentCategoryIndex(0);
            }, 20000);
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

    const getCurrentTitle = () => {
        if (currentView === 'monitors') {
            return { main: 'Live Matches', sub: '' };
        } else if (currentView === 'schedule') {
            return { main: 'Schedule', sub: '' };
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

    const limitWords = (name, count = 2) =>
        (name || '').split(' ').slice(0, count).join(' ');

    const getCategoryColor = (categoryName) => {
        const name = (categoryName || '').toLowerCase().trim();
        if (name === 'women beginner') return '#ff8ccf';
        if (name === 'women upper beginner') return '#a864f9';
        if (name === 'women lower bronze') return '#d49c35';
        if (name === 'men bronze') return '#bff280';
        return '#D4AF37';
    };

    const currentCategoryColor = currentView === 'leaderboard' && categoriesData[currentCategoryIndex]
        ? getCategoryColor(categoriesData[currentCategoryIndex].category.name)
        : currentView === 'monitors'
        ? '#ffffff'
        : '#D4AF37';

    const renderLeaderboardView = () => {
        if (categoriesData.length === 0 || !categoriesData[currentCategoryIndex]) {
            return (
                <div className="text-center">
                    <p className="text-4xl font-ffdin text-zinc-400">Please configure categories and phases</p>
                </div>
            );
        }

        const { category, currentPhase, leaderboardData, scheduleData, knockoutPhases } = categoriesData[currentCategoryIndex];
        const isIndividual = category.participant_mode === 'individual';

        if (!currentPhase) {
            return (
                <div className="text-center">
                    <p className="text-4xl font-ffdin text-zinc-400">No active phase</p>
                </div>
            );
        }

        if (leaderboardData && leaderboardData.type === 'knockout') {
            const color = getCategoryColor(category.name);
            const phases = knockoutPhases || [];

            if (phases.length === 0) {
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-3xl font-ffdin text-zinc-400">No knockout matches yet</p>
                    </div>
                );
            }

            // ── Match Card ──────────────────────────────────────────────────────────
            const MatchCard = ({ match, reversed = false }) => {
                if (!match) {
                    return <div className="flex-1 rounded-xl border-2 border-zinc-800 bg-black/40 min-h-[60px]" />;
                }
                const isLive      = match.status === 'in_progress';
                const isDone      = match.status === 'completed';
                const isScheduled = match.status === 'scheduled' || match.status === 'upcoming';

                const team1Name = match.team1 ? `${limitWords(match.team1.player_1)} / ${limitWords(match.team1.player_2)}` : '';
                const team2Name = match.team2 ? `${limitWords(match.team2.player_1)} / ${limitWords(match.team2.player_2)}` : '';

                const team1Won = isDone && match.winner_id === match.team1_id;
                const team2Won = isDone && match.winner_id === match.team2_id;

                const borderColor = isLive ? color : isDone ? '#52525b' : color + '80';
                const borderWidth = isLive ? '3px' : '2px';

                const TeamRow = ({ name, score, isWinner, align = 'left' }) => (
                    <div className={`flex items-center gap-2 py-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
                        <span className={`flex-1 font-ffdin font-bold truncate text-sm leading-tight ${
                            isWinner ? 'text-white' : isDone ? 'text-zinc-500' : 'text-zinc-200'
                        }`} style={isWinner ? { color } : {}}>
                            {name}
                        </span>
                        {!isScheduled && (
                            <span className={`font-ffdin font-bold text-lg flex-shrink-0 w-6 text-center ${
                                isWinner ? 'text-white' : 'text-zinc-500'
                            }`} style={isWinner ? { color } : {}}>
                                {score ?? 0}
                            </span>
                        )}
                    </div>
                );

                return (
                    <div
                        className="rounded-xl px-3 py-2 bg-black/80 backdrop-blur-sm relative"
                        style={{ border: `${borderWidth} solid ${borderColor}` }}
                    >
                        {isLive && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-ffdin font-bold text-black"
                                style={{ backgroundColor: color }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse inline-block" />
                                LIVE
                            </span>
                        )}
                        <TeamRow
                            name={team1Name}
                            score={match.team1_score}
                            isWinner={team1Won}
                            align={reversed ? 'right' : 'left'}
                        />
                        <div className="border-t border-zinc-800 my-0.5" />
                        <TeamRow
                            name={team2Name}
                            score={match.team2_score}
                            isWinner={team2Won}
                            align={reversed ? 'right' : 'left'}
                        />
                    </div>
                );
            };

            // ── SVG Connector ────────────────────────────────────────────────────────
            // fromCount: matches in the outer round (e.g. 2 QF matches)
            // toCount:   matches in the inner round (e.g. 1 SF match)
            // dir: 'ltr' = outer is on the left, lines run rightward
            //      'rtl' = outer is on the right, lines run leftward
            const BracketConnector = ({ fromCount, toCount, dir = 'ltr' }) => {
                const H = 100;
                const W = 100;
                const startX = dir === 'ltr' ? 0 : W;   // outer match side
                const endX   = dir === 'ltr' ? W : 0;   // inner / next side
                const midX   = W * 0.5;

                const paths = [];

                if (fromCount === toCount) {
                    // 1:1 case — just straight horizontal lines
                    for (let j = 0; j < toCount; j++) {
                        const y = ((2 * j + 1) / (2 * toCount)) * H;
                        paths.push(
                            <line key={`h-${j}`} x1={startX} y1={y} x2={endX} y2={y}
                                stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                        );
                    }
                } else {
                    // N:M case — group fromCount matches into toCount buckets
                    const ratio = fromCount / toCount; // typically 2
                    for (let j = 0; j < toCount; j++) {
                        const yMid = ((2 * j + 1) / (2 * toCount)) * H;
                        const firstIdx = j * ratio;
                        const lastIdx  = j * ratio + ratio - 1;
                        const yFirst = ((2 * firstIdx + 1) / (2 * fromCount)) * H;
                        const yLast  = ((2 * lastIdx  + 1) / (2 * fromCount)) * H;

                        // horizontal stubs from each outer match to midX
                        for (let i = 0; i < ratio; i++) {
                            const matchIdx = j * ratio + i;
                            const yMatch = ((2 * matchIdx + 1) / (2 * fromCount)) * H;
                            paths.push(
                                <line key={`h-in-${j}-${i}`}
                                    x1={startX} y1={yMatch} x2={midX} y2={yMatch}
                                    stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
                            );
                        }
                        // vertical join at midX
                        paths.push(
                            <line key={`v-${j}`}
                                x1={midX} y1={yFirst} x2={midX} y2={yLast}
                                stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
                        );
                        // horizontal from midX to inner side
                        paths.push(
                            <line key={`h-out-${j}`}
                                x1={midX} y1={yMid} x2={endX} y2={yMid}
                                stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                        );
                    }
                }

                return (
                    <svg
                        viewBox={`0 0 ${W} ${H}`}
                        preserveAspectRatio="none"
                        className="w-10 flex-shrink-0 h-full"
                        style={{ minWidth: '2.5rem' }}
                    >
                        {paths}
                    </svg>
                );
            };

            // ── Half bracket renderer ─────────────────────────────────────────────
            // For LTR: rounds = [QF_left, SF_left] — outermost first, visual left→right
            // For RTL: rounds = [SF_right, QF_right] — innermost first, visual left→right (center→edge)
            const renderHalf = (rounds, dir) => {
                const isRtl = dir === 'rtl';
                const cols = [];

                rounds.forEach((round, ri) => {
                    const nextRound = rounds[ri + 1];

                    // Match column
                    cols.push(
                        <div
                            key={`round-${round.phase.id}`}
                            className="flex flex-col justify-around flex-1 gap-2"
                            style={{ minWidth: '150px', maxWidth: '230px' }}
                        >
                            <div className="text-center mb-1">
                                <span className="text-xs font-ffdin font-bold uppercase tracking-widest text-zinc-500">
                                    {round.phase.name}
                                </span>
                            </div>
                            {round.matches.map((match) => (
                                <div key={match.id} className="flex-1 flex flex-col justify-center">
                                    <MatchCard match={match} reversed={isRtl} />
                                </div>
                            ))}
                        </div>
                    );

                    if (nextRound) {
                        // LTR: current round is outer (fromCount), nextRound is inner (toCount)
                        // RTL: current round is inner (toCount), nextRound is outer (fromCount)
                        const fromCount = isRtl ? nextRound.matches.length : round.matches.length;
                        const toCount   = isRtl ? round.matches.length    : nextRound.matches.length;
                        cols.push(
                            <BracketConnector
                                key={`conn-${round.phase.id}`}
                                fromCount={fromCount}
                                toCount={toCount}
                                dir={dir}
                            />
                        );
                    }
                });

                return cols;
            };

            // ── Split phases into halves ─────────────────────────────────────────
            const finalPhase  = phases[phases.length - 1];
            const outerPhases = phases.slice(0, -1); // everything before Final: QF, SF, ...

            // Split each outer phase's matches: first half → left, second half → right
            const leftRounds  = outerPhases.map(p => {
                const half = Math.ceil(p.matches.length / 2);
                return { phase: p, matches: p.matches.slice(0, half) };
            });
            const rightRounds = outerPhases.map(p => {
                const half = Math.ceil(p.matches.length / 2);
                return { phase: p, matches: p.matches.slice(half) };
            });

            const finalMatches    = finalPhase.matches;
            // The innermost half-round (closest to Final, e.g. SF half)
            const leftInnerCount  = leftRounds.length  > 0 ? leftRounds[leftRounds.length - 1].matches.length  : 0;
            const rightInnerCount = rightRounds.length > 0 ? rightRounds[rightRounds.length - 1].matches.length : 0;

            return (
                <div className="h-full flex items-center justify-center overflow-hidden px-2">
                    <div className="flex items-stretch w-full h-full gap-0">

                        {/* Left half: QF_left → connector → SF_left → connector → Final */}
                        {leftRounds.length > 0 && (
                            <>
                                {/* LTR: outermost first [QF_left, SF_left, ...] */}
                                {renderHalf(leftRounds, 'ltr')}
                                {/* Final connector from left inner to Final */}
                                <BracketConnector
                                    fromCount={leftInnerCount}
                                    toCount={Math.max(finalMatches.length, 1)}
                                    dir="ltr"
                                />
                            </>
                        )}

                        {/* Final column — center */}
                        <div
                            className="flex flex-col justify-around flex-shrink-0 gap-2"
                            style={{ minWidth: '190px', maxWidth: '260px' }}
                        >
                            <div className="text-center mb-1">
                                <span className="text-sm font-ffdin font-bold uppercase tracking-widest" style={{ color }}>
                                    {finalPhase.name}
                                </span>
                            </div>
                            {finalMatches.length > 0 ? finalMatches.map(match => (
                                <div key={match.id} className="flex-1 flex flex-col justify-center">
                                    <MatchCard match={match} />
                                </div>
                            )) : (
                                <div className="flex-1 flex flex-col justify-center">
                                    <MatchCard match={null} />
                                </div>
                            )}
                        </div>

                        {/* Right half: Final → connector → SF_right → connector → QF_right */}
                        {rightRounds.length > 0 && (
                            <>
                                {/* Final connector from Final to right inner */}
                                <BracketConnector
                                    fromCount={rightInnerCount}
                                    toCount={Math.max(finalMatches.length, 1)}
                                    dir="rtl"
                                />
                                {/* RTL: innermost first [SF_right, QF_right, ...] */}
                                {renderHalf([...rightRounds].reverse(), 'rtl')}
                            </>
                        )}
                    </div>
                </div>
            );
        }

        const cols = Math.ceil(leaderboardData.length / 2);

        return (
            <div className="flex justify-center items-center h-full w-full">
                {!Array.isArray(leaderboardData) || leaderboardData.length === 0 ? (
                    <p className="text-4xl font-ffdin text-zinc-400 text-center">No groups available</p>
                ) : (
                    <div
                        className="grid grid-rows-2 gap-3"
                        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                    >
                        {leaderboardData.map((groupData) => (
                            <div key={groupData.group.id} className="bg-black/80 backdrop-blur-sm border-4 rounded-xl overflow-hidden flex flex-col" style={{ borderColor: getCategoryColor(category.name) }}>
                                <div className="px-3 py-2 border-b-2 border-zinc-700">
                                    <p className="text-lg font-ffdin font-bold uppercase tracking-widest" style={{ color: getCategoryColor(category.name) }}>Group {groupData.group.name}</p>
                                </div>
                                <div className="p-2 flex-1 flex flex-col">
                                    {groupData.standings.length === 0 ? (
                                        <p className="text-zinc-500 font-ffdin text-center py-4">No standings yet</p>
                                    ) : (
                                        <table className="w-full h-full">
                                            <thead>
                                                <tr className="border-b-2 border-zinc-700">
                                                    <th className="text-left py-2 px-2 font-ffdin font-bold text-zinc-600 text-base">Rank</th>
                                                    <th className="text-left py-2 px-2 font-ffdin font-bold text-zinc-600 text-base">{isIndividual ? 'Player' : 'Team'}</th>
                                                    <th className="text-center py-2 px-2 font-ffdin font-bold text-zinc-600 text-base">W</th>
                                                    <th className="text-center py-2 px-2 font-ffdin font-bold text-zinc-600 text-base">L</th>
                                                    <th className="text-center py-2 px-2 font-ffdin font-bold text-zinc-600 text-base">GW</th>
                                                    <th className="text-center py-2 px-2 font-ffdin font-bold text-zinc-600 text-base">GL</th>
                                                    <th className="text-center py-2 px-2 font-ffdin font-bold text-zinc-600 text-base">GD</th>
                                                    <th className="text-center py-2 px-2 font-ffdin font-bold text-zinc-600 text-base">%</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {groupData.standings.map((standing, index) => {
                                                    const points = standing.won * 2;
                                                    return (
                                                        <tr key={standing.participant.id} className={`border-b border-zinc-800 ${
                                                            index === 0 ? 'bg-accent/20' : index === 1 ? 'bg-zinc-700/20' : ''
                                                        }`}>
                                                            <td className="py-3 px-2">
                                                                <span className='text-2xl font-bold font-ffdin text-white'>
                                                                    {index + 1}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-2">
                                                                <div className="text-lg font-ffdin font-bold text-white truncate leading-tight">
                                                                    {isIndividual
                                                                        ? limitWords(standing.participant.player_1)
                                                                        : `${limitWords(standing.participant.player_1)} / ${limitWords(standing.participant.player_2)}`
                                                                    }
                                                                </div>
                                                            </td>
                                                            <td className="text-center py-3 px-2 text-xl font-ffdin font-bold text-accent">{standing.won}</td>
                                                            <td className="text-center py-3 px-2 text-xl font-ffdin font-bold text-red-500">{standing.lost}</td>
                                                            <td className="text-center py-3 px-2 text-xl font-ffdin font-bold text-white">{standing.games_won}</td>
                                                            <td className="text-center py-3 px-2 text-xl font-ffdin font-bold text-zinc-400">{standing.games_lost}</td>
                                                            <td className="text-center py-3 px-2 text-xl font-ffdin font-bold text-zinc-400">{(standing.games_won - standing.games_lost)}</td>
                                                            <td className="text-center py-3 px-2 text-2xl font-ffdin font-bold text-accent">{points}</td>
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
                )}
            </div>
        );
    };

    const renderMonitorsView = () => {
        const renderCourtMonitor = (court, match) => {
            const isIndividual = match?.category?.participant_mode === 'individual';
            const hasTeams = !!(match && match.team1 && match.team2);
            const hasSides = !!(match && match.side1_player1_id && match.side1_player2_id && match.side2_player1_id && match.side2_player2_id);

            const matchColor = getCategoryColor(match?.category?.name);

            if (!match || (isIndividual ? !hasSides : !hasTeams)) {
                return (
                    <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-4 text-center" style={{ borderColor: matchColor }}>
                        <div className="text-6xl mb-4">🎾</div>
                        <h2 className="text-5xl font-bold font-ffdin text-white mb-4">COURT {court?.name || 'N/A'}</h2>
                        <p className="text-3xl font-ffdin font-bold" style={{ color: matchColor }}>No Active Match</p>
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
                <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border-2" style={{ borderColor: matchColor }}>
                    <div className="text-center mb-3">
                        <p className="text-2xl font-bold font-ffdin text-white">COURT {court?.name || 'N/A'}</p>
                    </div>

                    {/* Team 1 */}
                    <div className="bg-black/85 backdrop-blur-sm rounded-xl p-3 mb-2">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="text-2xl font-bold font-ffdin text-white leading-tight">
                                    <div className="truncate">{isIndividual ? (match.side1_player1?.player_1 || '') : match.team1.player_1}</div>
                                    <div className="truncate">{isIndividual ? (match.side1_player2?.player_1 || '') : match.team1.player_2}</div>
                                </div>
                                {winningTeam === 'team1' && (
                                    <span className="inline-block px-3 py-1 text-xl font-bold font-ffdin text-black rounded-lg animate-pulse mt-1" style={{ backgroundColor: matchColor }}>
                                        🏆 WINNER
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="text-center bg-dark/90 rounded-lg border-2 w-[100px] h-[80px] flex items-center justify-center" style={{ borderColor: matchColor }}>
                                    <div className="text-5xl font-bold text-white">{match.team1_score || 0}</div>
                                </div>
                                {isMatchStarted && (
                                    <div className="text-center bg-dark/90 rounded-lg border-2 w-[100px] h-[80px] flex items-center justify-center" style={{ borderColor: matchColor }}>
                                        <div className={`font-bold ${match.is_tiebreaker || !isNaN(match.current_game_team1_points) ? 'text-5xl' : 'text-4xl'} text-white`}>
                                            {getPointDisplay(match.current_game_team1_points, match.pending_game_winner === 'team1', match.is_tiebreaker)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* VS */}
                    <div className="text-center my-1">
                        <span className="text-3xl font-bold font-ffdin" style={{ color: matchColor }}>VS</span>
                    </div>

                    {/* Team 2 */}
                    <div className="bg-zinc-900/85 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="text-2xl font-bold font-ffdin text-white leading-tight">
                                    <div className="truncate">{isIndividual ? (match.side2_player1?.player_1 || '') : match.team2.player_1}</div>
                                    <div className="truncate">{isIndividual ? (match.side2_player2?.player_1 || '') : match.team2.player_2}</div>
                                </div>
                                {winningTeam === 'team2' && (
                                    <span className="inline-block px-3 py-1 text-xl font-bold font-ffdin text-black rounded-lg animate-pulse mt-1" style={{ backgroundColor: matchColor }}>
                                        🏆 WINNER
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="text-center bg-dark/90 rounded-lg border-2 w-[100px] h-[80px] flex items-center justify-center" style={{ borderColor: matchColor }}>
                                    <div className="text-5xl font-bold text-white">{match.team2_score || 0}</div>
                                </div>
                                {isMatchStarted && (
                                    <div className="text-center bg-dark/90 rounded-lg border-2 w-[100px] h-[80px] flex items-center justify-center" style={{ borderColor: matchColor }}>
                                        <div className={`font-bold ${match.is_tiebreaker || !isNaN(match.current_game_team2_points) ? 'text-5xl' : 'text-4xl'} text-white`}>
                                            {getPointDisplay(match.current_game_team2_points, match.pending_game_winner === 'team2', match.is_tiebreaker)}
                                        </div>
                                    </div>
                                )}
                            </div>
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

    const renderScheduleView = () => {
        const courtMap = new Map();
        categoriesData.forEach(({ category, currentPhase, scheduleData }) => {
            if (!scheduleData?.length) return;
            const isIndividual = category.participant_mode === 'individual';
            scheduleData.forEach((match) => {
                const courtId = match.court?.id ?? 'unknown';
                const courtName = match.court?.name ?? '?';
                if (!courtMap.has(courtId)) courtMap.set(courtId, { courtName, matches: [] });
                courtMap.get(courtId).matches.push({ ...match, isIndividual, categoryName: category.name });
            });
        });

        courtMap.forEach(({ matches }) =>
            matches.sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time))
        );

        const courts = Array.from(courtMap.values()).sort((a, b) =>
            a.courtName.localeCompare(b.courtName, undefined, { numeric: true })
        );

        if (courts.length === 0) {
            return (
                <div className="flex justify-center items-center h-full">
                    <p className="text-4xl font-ffdin text-zinc-400 text-center">No matches</p>
                </div>
            );
        }

        const cols = Math.ceil(courts.length / 2);

        const renderMatchRow = (match) => {
            const team1Name = match.isIndividual
                ? `${(match.side1Player1 || match.side1_player1)?.player_1 || ''} / ${(match.side1Player2 || match.side1_player2)?.player_1 || ''}`
                : (() => { const t = match.team1 || match.team_1; return `${t?.player_1 || ''} / ${t?.player_2 || ''}`; })();
            const team2Name = match.isIndividual
                ? `${(match.side2Player1 || match.side2_player1)?.player_1 || ''} / ${(match.side2Player2 || match.side2_player2)?.player_1 || ''}`
                : (() => { const t = match.team2 || match.team_2; return `${t?.player_1 || ''} / ${t?.player_2 || ''}`; })();

            return (
                <div key={match.id} className={`rounded-lg px-3 py-2 border-l-4 mb-1 ${
                    match.status === 'completed'
                        ? 'bg-zinc-800/60 border-zinc-600'
                        : match.status === 'in_progress'
                        ? 'bg-zinc-700/40 border-white'
                        : 'bg-black/60 border-zinc-600'
                }`}>
                    <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xl font-ffdin font-bold text-zinc-400">
                            {match.scheduled_time ? match.scheduled_time.substring(11, 16) : 'TBA'}
                        </span>
                        <span className="text-xl font-ffdin font-bold uppercase tracking-wide flex-1 px-2 truncate" style={{ color: getCategoryColor(match.categoryName) }}>
                            {match.categoryName}
                        </span>
                        <p className={`text-xl font-ffdin font-bold flex-1 min-w-0 truncate ${
                            match.status === 'completed' && match.winner_id === (match.team1_id)
                                ? 'text-white' : 'text-zinc-300'
                        }`}>{limitWords(team1Name.split(' / ')[0])} / {limitWords(team1Name.split(' / ')[1])}</p>
                        {match.status === 'completed' ? (
                            <div className="flex items-center gap-1 flex-shrink-0 text-xl font-bold font-ffdin">
                                <span className={match.winner_id === match.team1_id ? 'text-white' : 'text-zinc-500'}>{match.team1_score || 0}</span>
                                <span className="text-zinc-600">-</span>
                                <span className={match.winner_id === match.team2_id ? 'text-white' : 'text-zinc-500'}>{match.team2_score || 0}</span>
                            </div>
                        ) : (
                            <span className="text-xl font-bold text-zinc-400 flex-shrink-0">VS</span>
                        )}
                        <p className={`text-xl font-ffdin font-bold flex-1 min-w-0 truncate text-right ${
                            match.status === 'completed' && match.winner_id === match.team2_id
                                ? 'text-white' : 'text-zinc-300'
                        }`}>{limitWords(team2Name.split(' / ')[0])} / {limitWords(team2Name.split(' / ')[1])}</p>
                    </div>
                </div>
            );
        };

        return (
            <div className="flex justify-center items-center h-full w-full">
                <div
                    className="grid grid-rows-2 gap-3 w-full h-full"
                    style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                    {courts.map(({ courtName, matches }) => (
                        <div key={courtName} className="bg-black/80 backdrop-blur-sm border-2 border-white/30 rounded-xl overflow-hidden flex flex-col">
                            <div className="px-3 py-2 border-b-2 border-white/20 flex-shrink-0">
                                <p className="text-lg font-ffdin font-bold text-white uppercase tracking-widest">Court {courtName}</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 schedule-scroll" style={{ scrollbarWidth: 'none' }}>
                                {matches.map(renderMatchRow)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <Head title={`${event.name} - Leaderboard`} />
            <style>{`
                .scrollbar-hidden {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .scrollbar-hidden::-webkit-scrollbar {
                    display: none;
                }
                .schedule-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .schedule-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .schedule-scroll::-webkit-scrollbar-thumb {
                    background: rgba(212, 175, 55, 0.5);
                    border-radius: 3px;
                }
                .schedule-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(212, 175, 55, 0.7);
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
                <div className="bg-black/90 backdrop-blur-sm py-2 px-6 shadow-2xl border-b-4 flex-shrink-0" style={{ borderBottomColor: currentCategoryColor }}>
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <p className="text-5xl text-white font-ffdin font-bold leading-tight truncate">{getCurrentTitle().main}</p>
                            {getCurrentTitle().sub && (
                                <p className="text-xl font-ffdin font-bold leading-tight truncate" style={{ color: currentCategoryColor }}>{getCurrentTitle().sub}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden p-4">
                    <div className="h-full">
                        {currentView === 'leaderboard' && renderLeaderboardView()}
                        {currentView === 'monitors' && renderMonitorsView()}
                        {currentView === 'schedule' && renderScheduleView()}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-black/90 backdrop-blur-sm py-2 px-6 border-t-4 flex-shrink-0" style={{ borderTopColor: currentCategoryColor }}>
                    <div className="flex justify-between items-center">
                        <p className="text-xl text-white font-ffdin font-bold">{event.name}</p>
                        <div className="flex gap-2">
                            {categoriesData.map((catData, index) => (
                                <div
                                    key={index}
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{
                                        backgroundColor: currentView === 'leaderboard' && currentCategoryIndex === index
                                            ? getCategoryColor(catData.category.name)
                                            : '#52525b'
                                    }}
                                />
                            ))}
                            <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: currentView === 'monitors' ? currentCategoryColor : '#52525b' }}
                            />
                            <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: currentView === 'schedule' ? currentCategoryColor : '#52525b' }}
                            />
                        </div>
                        <p className="text-2xl font-ffdin font-bold" style={{ color: currentCategoryColor }}>{formatTime(currentTime)}</p>
                    </div>
                </div>
            </div>
        </>
    );
}
