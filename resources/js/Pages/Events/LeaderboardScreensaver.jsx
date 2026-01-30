import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { formatDateTime } from '@/Utils/dateFormatter';

export default function LeaderboardScreensaver({ event, categoriesData, court1, court2, court1Match, court2Match }) {
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Auto-refresh data every 5 seconds to get latest match states
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['categoriesData'], preserveScroll: true, preserveState: true });
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

    // Auto-rotation logic - only cycle through categories for group leaderboard
    useEffect(() => {
        if (categoriesData.length === 0) return;
        
        // Show each category for 10 seconds, then move to next
        const timer = setTimeout(() => {
            setCurrentCategoryIndex((prevIndex) => 
                prevIndex < categoriesData.length - 1 ? prevIndex + 1 : 0
            );
        }, 10000);

        return () => clearTimeout(timer);
    }, [currentCategoryIndex, categoriesData.length]);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Get current view title for header
    const getCurrentTitle = () => {
        if (categoriesData.length === 0 || !categoriesData[currentCategoryIndex]) {
            return { main: 'No Categories Available', sub: '' };
        }
        const { category, currentPhase } = categoriesData[currentCategoryIndex];
        return { 
            main: category.name, 
            sub: currentPhase ? currentPhase.name : 'No active phase' 
        };
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

        const { category, currentPhase, leaderboardData } = categoriesData[currentCategoryIndex];

        if (!currentPhase) {
            return (
                <div className="text-center">
                    <p className="text-4xl font-gotham text-neutral-300">No active phase</p>
                </div>
            );
        }

        // Check if knockout phase
        if (leaderboardData.type === 'knockout') {
            return (
                <div>
                    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                        {leaderboardData.matches && leaderboardData.matches.length > 0 ? (
                            leaderboardData.matches.map((match) => (
                                <div key={match.id} className="bg-neutral-900/80 backdrop-blur-sm rounded-xl p-6 border-4 border-accent">
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <p className="text-3xl font-bold font-raverist text-white">
                                                {match.team1.player_1} / {match.team1.player_2}
                                            </p>
                                        </div>
                                        <div className="text-5xl font-bold text-white mx-8">
                                            {match.team1_score || 0}
                                        </div>
                                        <div className="text-3xl font-bold text-accent mx-4">VS</div>
                                        <div className="text-5xl font-bold text-white mx-8">
                                            {match.team2_score || 0}
                                        </div>
                                        <div className="flex-1 text-right">
                                            <p className="text-3xl font-bold font-raverist text-white">
                                                {match.team2.player_1} / {match.team2.player_2}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-3xl font-gotham text-neutral-300 text-center">No completed matches yet</p>
                        )}
                    </div>
                </div>
            );
        }

        // Group phase leaderboard
        return (
            <div>
                {leaderboardData.length === 0 ? (
                    <p className="text-4xl font-gotham text-neutral-300 text-center">No groups available</p>
                ) : (
                    <div className="grid grid-cols-2 gap-3 h-full auto-rows-fr">
                        {leaderboardData.map((groupData) => (
                            <div key={groupData.group.id} className="bg-neutral-900/80 backdrop-blur-sm rounded-xl border-4 border-accent overflow-hidden flex flex-col h-full">
                                <div className="bg-primary px-3 py-2 border-b-4 border-accent flex-shrink-0">
                                    <h3 className="text-2xl font-bold font-raverist text-white leading-tight">
                                        Group {groupData.group.name}
                                    </h3>
                                </div>
                                <div className="p-2 flex-1 flex flex-col">
                                    {groupData.standings.length === 0 ? (
                                        <p className="text-neutral-400 font-gotham text-center py-4">No standings yet</p>
                                    ) : (
                                        <table className="w-full h-full">
                                            <thead>
                                                <tr className="border-b-2 border-neutral-700">
                                                    <th className="text-left py-2 px-2 font-gotham font-bold text-neutral-300 text-base">Rank</th>
                                                    <th className="text-left py-2 px-2 font-gotham font-bold text-neutral-300 text-base">Team</th>
                                                    <th className="text-center py-2 px-2 font-gotham font-bold text-neutral-300 text-base">W</th>
                                                    <th className="text-center py-2 px-2 font-gotham font-bold text-neutral-300 text-base">L</th>
                                                    <th className="text-center py-2 px-2 font-gotham font-bold text-neutral-300 text-base">GW</th>
                                                    <th className="text-center py-2 px-2 font-gotham font-bold text-neutral-300 text-base">GL</th>
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
                                                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-2">
                                                                <div className="text-lg font-gotham font-bold text-white truncate leading-tight">
                                                                    {standing.participant.player_1} / {standing.participant.player_2}
                                                                </div>
                                                            </td>
                                                            <td className="text-center py-3 px-2 text-xl font-gotham font-bold text-success">{standing.won}</td>
                                                            <td className="text-center py-3 px-2 text-xl font-gotham font-bold text-red-500">{standing.lost}</td>
                                                            <td className="text-center py-3 px-2 text-xl font-gotham font-bold text-white">{standing.games_won}</td>
                                                            <td className="text-center py-3 px-2 text-xl font-gotham font-bold text-neutral-400">{standing.games_lost}</td>
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
                )}
            </div>
        );
    };

    return (
        <>
            <Head title={`${event.name} - Leaderboard`} />

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
                        <img src="/logo/logo.jpeg" alt="Logo" className="h-12 object-contain flex-shrink-0" />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden p-4">
                    <div className="max-w-7xl mx-auto h-full">
                        {renderLeaderboardView()}
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
                                        currentCategoryIndex === index
                                            ? 'bg-accent'
                                            : 'bg-neutral-500'
                                    }`}
                                />
                            ))}
                        </div>
                        <p className="text-2xl text-accent font-gotham font-bold">{formatTime(currentTime)}</p>
                    </div>
                </div>
            </div>
        </>
    );
}
