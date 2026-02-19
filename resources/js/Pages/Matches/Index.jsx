import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

export default function Index({ category, phases, currentPhase, courts, participants }) {
    const { flash } = usePage().props;
    const [selectedPhaseId, setSelectedPhaseId] = useState(currentPhase?.id || phases[0]?.id);
    const [showKnockoutModal, setShowKnockoutModal] = useState(false);
    const [importingSchedule, setImportingSchedule] = useState(false);
    
    const isIndividual = category.participant_mode === 'individual';
    const participantOptions = participants || [];
    
    const selectedPhase = phases.find(p => p.id === selectedPhaseId);
    const matches = selectedPhase?.matches || [];
    // Find the previous phase (highest order less than current phase's order)
    const previousPhase = selectedPhase 
        ? phases
            .filter(p => p.order < selectedPhase.order)
            .sort((a, b) => b.order - a.order)[0]
        : null;

    // Knockout match setup form
    const { data: knockoutData, setData: setKnockoutData, post: postKnockout, processing: knockoutProcessing } = useForm({
        phase_id: selectedPhaseId,
        matches: [],
    });
    
    const handleCourtChange = (matchId, courtId) => {
        router.patch(route('categories.matches.update', [category.id, matchId]), {
            court_id: courtId,
        }, {
            preserveScroll: true,
        });
    };

    const handleScheduledTimeChange = (matchId, scheduledTime) => {
        if (scheduledTime) {
            router.patch(route('categories.matches.update', [category.id, matchId]), {
                scheduled_time: scheduledTime,
            }, {
                preserveScroll: true,
            });
        }
    };

    const handleIndividualPlayersChange = (match, updates) => {
        const payload = {
            side1_player1_id: updates.side1_player1_id ?? match.side1_player1_id ?? '',
            side1_player2_id: updates.side1_player2_id ?? match.side1_player2_id ?? '',
            side2_player1_id: updates.side2_player1_id ?? match.side2_player1_id ?? '',
            side2_player2_id: updates.side2_player2_id ?? match.side2_player2_id ?? '',
        };

        router.patch(route('categories.matches.update', [category.id, match.id]), payload, {
            preserveScroll: true,
        });
    };

    const handleResetMatch = (matchId) => {
        if (confirm('Reset this match?\n\n• Clears all scores and progress\n• Returns match to scheduled state\n• Frees up the court for other matches\n\nContinue?')) {
            router.post(route('categories.matches.reset', [category.id, matchId]));
        }
    };

    const handleGenerateMatches = () => {
        if (selectedPhase.type === 'group') {
            if (isIndividual) {
                alert('Individuals mode does not support auto-generating matches.\n\nUse “Import Schedule” to create matches with 4 players per match, then tweak players in the match list.');
                return;
            }
            if (confirm(`Generate matches for all groups in ${selectedPhase.name}? This will delete existing matches for this phase.`)) {
                router.post(route('categories.matches.generate', category.id), {
                    phase_id: selectedPhaseId,
                });
            }
        } else {
            // Initialize with empty matches for knockout
            setKnockoutData({
                phase_id: selectedPhaseId,
                matches: [],
            });
            setShowKnockoutModal(true);
        }
    };

    const handleResolveMatches = (force = false) => {
        const message = force 
            ? `RE-RESOLVE and OVERRIDE participants for ${selectedPhase.name}?\n\nThis will replace any currently assigned teams with fresh results from ${previousPhase.name}.\n\nContinue?`
            : `Resolve match participants for ${selectedPhase.name} based on ${previousPhase.name} results?`;
        
        if (confirm(message)) {
            router.post(route('phases.resolve-matches', { category: category.id, phase: selectedPhaseId }), { force }, {
                preserveScroll: true,
                onError: (errors) => {
                    console.error('Resolve matches error:', errors);
                    alert('Error resolving matches. Check console for details.');
                },
            });
        }
    };

    const handleRenumberMatches = () => {
        if (confirm(`Renumber all matches in ${selectedPhase.name}?\n\nThis will reset match numbers to 1, 2, 3... based on current order.\nUse this if "Winner Match X" templates aren't finding the right matches.`)) {
            router.post(route('phases.renumber-matches', { category: category.id, phase: selectedPhaseId }), {}, {
                preserveScroll: true,
            });
        }
    };

    const handleStartMatch = async (matchId) => {
        const match = matches.find(m => m.id === matchId);
        
        if (!match.court_id) {
            alert('❌ Please assign a court before starting this match.');
            return;
        }
        
        if (isIndividual) {
            const missingPlayers = !match.side1_player1_id || !match.side1_player2_id || !match.side2_player1_id || !match.side2_player2_id;
            if (missingPlayers) {
                alert('❌ All 4 players must be assigned before starting the match.');
                return;
            }
        } else {
            if (!match.team1_id || !match.team2_id) {
                alert('❌ Both teams must be assigned before starting the match. Please resolve participants first.');
                return;
            }
        }
        
        // If match is already started (in_progress or upcoming), just open it
        if (match.status === 'in_progress' || match.status === 'upcoming') {
            router.visit(route('categories.matches.referee', [category.id, matchId]));
            return;
        }
        
        // Otherwise, start the match prep
        try {
            const response = await axios.post(route('categories.matches.startPrep', [category.id, matchId]));
            
            if (response.data.success) {
                router.reload({
                    only: ['phases'],
                    onSuccess: () => {
                        router.visit(route('categories.matches.referee', [category.id, matchId]));
                    }
                });
            }
            
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                alert('❌ ' + error.response.data.error);
            } else {
                alert('❌ An error occurred. Please try again.');
            }
            console.error(error);
        }
    };

    const handleDeleteMatch = (matchId) => {
        if (confirm('Are you sure you want to delete this match?')) {
            router.delete(route('categories.matches.destroy', [category.id, matchId]));
        }
    };

    const handleImportSchedule = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            alert('❌ Please upload a valid Excel file (.xlsx or .xls)');
            event.target.value = '';
            return;
        }

        if (confirm(`Import match schedule from "${file.name}"?\n\nThis will update match schedules based on team names, court assignments, and times in the Excel file.`)) {
            setImportingSchedule(true);
            
            const formData = new FormData();
            formData.append('schedule_file', file);
            formData.append('phase_id', selectedPhaseId);

            try {
                const response = await axios.post(
                    route('categories.matches.import-schedule', category.id),
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );

                if (response.data.success) {
                    // Show success message with details
                    const parts = [];
                    if (response.data.created > 0) {
                        parts.push(`Created ${response.data.created} new match(es)`);
                    }
                    if (response.data.updated > 0) {
                        parts.push(`Updated ${response.data.updated} match(es)`);
                    }
                    
                    const message = parts.length > 0 ? parts.join(' and ') : (response.data.message || 'Import completed');
                    
                    if (response.data.errors && response.data.errors.length > 0) {
                        // Show partial success with errors
                        const errorList = response.data.errors.slice(0, 5).join('\n');
                        const moreErrors = response.data.errors.length > 5 ? `\n... and ${response.data.errors.length - 5} more errors` : '';
                        alert(`✅ ${message}\n\n⚠️ Some rows had errors:\n${errorList}${moreErrors}`);
                    }
                    
                    router.reload({
                        only: ['phases'],
                        onFinish: () => {
                            setImportingSchedule(false);
                            event.target.value = '';
                        }
                    });
                }
            } catch (error) {
                setImportingSchedule(false);
                event.target.value = '';
                
                if (error.response && error.response.data && error.response.data.error) {
                    alert('❌ Import Failed\n\n' + error.response.data.error);
                } else if (error.response && error.response.data && error.response.data.message) {
                    alert('❌ Import Failed\n\n' + error.response.data.message);
                } else {
                    alert('❌ An error occurred while importing the schedule.\n\nPlease check:\n• File format (.xlsx or .xls)\n• Column headers: Team 1, Team 2, Court, Date, Time\n• Team names match exactly\n• Court names exist\n• Date format: DD-MM-YYYY or YYYY-MM-DD\n• Time format: HH:MM (24-hour)');
                }
                console.error('Import error:', error);
            }
        } else {
            event.target.value = '';
        }
    };

    // Knockout match builder
    const addKnockoutMatch = () => {
        const defaultTemplate = templateOptions.length > 0 ? templateOptions[0].value : '1st_group_A';
        const defaultTemplate2 = templateOptions.length > 1 ? templateOptions[1].value : '2nd_group_A';
        
        setKnockoutData('matches', [...knockoutData.matches, {
            team1_template: defaultTemplate,
            team2_template: defaultTemplate2,
        }]);
    };

    const removeKnockoutMatch = (index) => {
        const newMatches = knockoutData.matches.filter((_, i) => i !== index);
        setKnockoutData('matches', newMatches);
    };

    const updateKnockoutMatch = (index, field, value) => {
        const newMatches = [...knockoutData.matches];
        newMatches[index][field] = value;
        setKnockoutData('matches', newMatches);
    };

    const handleSubmitKnockoutMatches = (e) => {
        e.preventDefault();
        
        if (knockoutData.matches.length === 0) {
            alert('Please add at least one match before submitting.');
            return;
        }
        
        postKnockout(route('categories.matches.create-knockout', category.id), {
            onSuccess: () => {
                setShowKnockoutModal(false);
                setKnockoutData({
                    phase_id: selectedPhaseId,
                    matches: [],
                });
            },
            onError: (errors) => {
                console.error('Knockout match creation errors:', errors);
                alert('Error creating matches. Please check the form and try again.');
            },
        });
    };

    // Generate template options based on previous phase
    const getTemplateOptions = () => {
        if (!previousPhase || previousPhase.type !== 'group') return [];
        
        const options = [];
        const groups = previousPhase.groups || [];
        const teamsPerGroup = previousPhase.teams_advance_per_group || 2;
        
        for (let rank = 1; rank <= teamsPerGroup; rank++) {
            const rankSuffix = rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th';
            for (const group of groups) {
                const groupLetter = group.name.replace('Group ', '');
                options.push({
                    value: `${rank}${rankSuffix}_group_${groupLetter}`,
                    label: `${rank}${rankSuffix} ${group.name}`
                });
            }
        }
        
        return options;
    };

    const templateOptions = getTemplateOptions();

    // Group matches by group (for group phases)
    const matchesByGroup = matches.reduce((acc, match) => {
        if (selectedPhase?.type === 'group') {
            const groupName = match.group?.name || 'Ungrouped';
            if (!acc[groupName]) {
                acc[groupName] = [];
            }
            acc[groupName].push(match);
        }
        return acc;
    }, {});

    // Sort matches within each group by scheduled time, then by court name
    if (selectedPhase?.type === 'group') {
        Object.keys(matchesByGroup).forEach(groupName => {
            matchesByGroup[groupName].sort((a, b) => {
                if (a.scheduled_time && b.scheduled_time) {
                    const timeCompare = new Date(a.scheduled_time) - new Date(b.scheduled_time);
                    if (timeCompare !== 0) return timeCompare;
                } else if (a.scheduled_time) {
                    return -1;
                } else if (b.scheduled_time) {
                    return 1;
                }
                
                const courtA = a.court?.name || '';
                const courtB = b.court?.name || '';
                return courtA.localeCompare(courtB, undefined, { numeric: true });
            });
        });
    }

    const getStatusColor = (status) => {
        const colors = {
            scheduled: 'bg-neutral-400 text-white border-neutral-600',
            upcoming: 'bg-primary text-white border-primary-700',
            in_progress: 'bg-accent text-dark border-accent-700',
            completed: 'bg-success text-white border-success-700',
            cancelled: 'bg-red-600 text-white border-red-800',
        };
        return colors[status] || 'bg-neutral-400 text-white border-neutral-600';
    };

    const getStatusIcon = (status) => {
        const icons = {
            scheduled: '📅',
            upcoming: '⏰',
            in_progress: '🎾',
            completed: '✅',
            cancelled: '❌',
        };
        return icons[status] || '📋';
    };

    const hasUnresolvedMatches = isIndividual
        ? matches.some(m => !m.side1_player1_id || !m.side1_player2_id || !m.side2_player1_id || !m.side2_player2_id)
        : matches.some(m => !m.team1_id || !m.team2_id);

    return (
        <AuthenticatedLayout header="Match Management">
            <Head title={`Matches - ${category.name}`} />

            <div className="py-12 bg-dark min-h-screen">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-6">
                    {/* Breadcrumb */}
                    <nav className="text-sm font-gotham text-neutral-400">
                        <Link href={route('events.index')} className="hover:text-white transition-colors">Events</Link>
                        {' / '}
                        <Link href={route('events.show', category.event.id)} className="hover:text-white transition-colors">
                            {category.event.name}
                        </Link>
                        {' / '}
                        <Link href={route('events.categories.show', [category.event.id, category.id])} className="hover:text-white transition-colors">
                            {category.name}
                        </Link>
                        {' / '}
                        <span className="text-white font-bold">Matches</span>
                    </nav>

                    {/* Header Banner */}
                    <div className="bg-success rounded-2xl p-8 shadow-lg border-4 border-accent">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-bold font-raverist text-white mb-2">Match Management</h1>
                                <p className="text-xl font-gotham text-white">{category.name}</p>
                            </div>
                            <div className="flex gap-3">
                                {selectedPhase && hasUnresolvedMatches && previousPhase && (
                                    <button
                                        onClick={() => handleResolveMatches(false)}
                                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-lg font-gotham font-bold text-white shadow-lg hover:bg-primary-600 transition-all border-2 border-accent hover:scale-105"
                                    >
                                        <span className="text-2xl">🔄</span>
                                        Resolve Participants
                                    </button>
                                )}
                                {selectedPhase && previousPhase && matches.some(m => m.team1_id || m.team2_id) && matches.some(m => m.team1_template || m.team2_template) && (
                                    <button
                                        onClick={() => handleResolveMatches(true)}
                                        className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-lg font-gotham font-bold text-white shadow-lg hover:bg-orange-600 transition-all border-2 border-orange-700 hover:scale-105"
                                        title="Re-resolve and override existing team assignments"
                                    >
                                        <span className="text-2xl">🔃</span>
                                        Re-resolve
                                    </button>
                                )}
                                {selectedPhase && (
                                    <>
                                        <a
                                            href={route('categories.matches.schedule-template', {
                                                category: category.id,
                                                phase_id: selectedPhaseId
                                            })}
                                            className="inline-flex items-center gap-2 rounded-xl bg-neutral-200 px-6 py-3 text-lg font-gotham font-bold text-dark shadow-lg hover:bg-neutral-300 transition-all border-2 border-neutral-400 hover:scale-105"
                                            title="Download Excel template with current matches"
                                        >
                                            <span className="text-2xl">📄</span>
                                            {matches.length > 0 ? 'Export Schedule' : 'Template'}
                                        </a>
                                        <label className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-lg font-gotham font-bold shadow-lg transition-all border-2 ${
                                            importingSchedule
                                                ? 'bg-neutral-300 text-neutral-500 border-neutral-400 cursor-not-allowed'
                                                : 'bg-accent text-dark border-dark hover:bg-accent-600 hover:scale-105 cursor-pointer'
                                        }`}>
                                            <span className="text-2xl">📁</span>
                                            {importingSchedule ? 'Importing...' : 'Import Schedule'}
                                            <input
                                                type="file"
                                                accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                                onChange={handleImportSchedule}
                                                disabled={importingSchedule}
                                                className="hidden"
                                            />
                                        </label>
                                    </>
                                )}
                                {selectedPhase && (
                                    <>
                                        <button
                                            onClick={handleGenerateMatches}
                                            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-lg font-gotham font-bold text-success shadow-lg hover:bg-white-600 transition-all border-2 border-accent hover:scale-105"
                                        >
                                            <span className="text-2xl">⚙️</span>
                                            {selectedPhase.type === 'group' ? 'Generate Matches' : 'Setup Matches'}
                                        </button>
                                        {selectedPhase.type === 'knockout' && matches.length > 0 && (
                                            <button
                                                onClick={handleRenumberMatches}
                                                className="inline-flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-3 text-sm font-gotham font-bold text-neutral-700 shadow hover:bg-neutral-200 transition-all border border-neutral-400 hover:scale-105"
                                                title="Fix match numbering if 'Winner Match X' templates aren't working correctly"
                                            >
                                                <span className="text-lg">#️⃣</span>
                                                Renumber
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="bg-success rounded-xl border-4 border-success-700 text-white px-6 py-4 font-gotham font-bold shadow-lg">
                            ✅ {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="bg-red-600 rounded-xl border-4 border-red-800 text-white px-6 py-4 font-gotham font-bold shadow-lg">
                            ❌ {flash.error}
                        </div>
                    )}
                    {flash?.info && (
                        <div className="bg-primary rounded-xl border-4 border-primary-700 text-white px-6 py-4 font-gotham font-bold shadow-lg">
                            ℹ️ {flash.info}
                        </div>
                    )}

                    {/* Phase Resolution Debug Info */}
                    {selectedPhase && selectedPhase.type === 'knockout' && (
                        <div className="bg-yellow-50 rounded-xl border-2 border-yellow-400 px-6 py-4 font-gotham text-sm">
                            <div className="font-bold text-yellow-800 mb-2">🔍 Resolution Debug Info:</div>
                            <div className="text-yellow-900 space-y-1">
                                <p><strong>Current Phase:</strong> {selectedPhase.name} (order: {selectedPhase.order})</p>
                                <p><strong>Previous Phase (for Winner Match X):</strong> {previousPhase ? `${previousPhase.name} (order: ${previousPhase.order}, type: ${previousPhase.type})` : 'None'}</p>
                                
                                {/* Phase Order Editor */}
                                <div className="mt-3 p-3 bg-red-100 rounded-lg border border-red-400">
                                    <p className="font-bold text-red-800 mb-2">🚨 FIX PHASE ORDER:</p>
                                    <p className="text-xs text-red-700 mb-2">
                                        Current: {phases.sort((a,b) => a.order - b.order).map(p => `${p.name}=#${p.order}`).join(' → ')}
                                    </p>
                                    <p className="text-xs text-green-700 mb-3 font-bold">
                                        Should be: Group Phase=#1 → Quarter Finals=#2 → Semi Finals=#3 → Finals=#4
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {phases.map(p => (
                                            <div key={p.id} className={`flex items-center gap-1 px-2 py-1 rounded border ${p.id === selectedPhase.id ? 'bg-yellow-200 border-yellow-500' : 'bg-white border-gray-300'}`}>
                                                <span className="text-xs font-bold">{p.name}:</span>
                                                <select
                                                    value={p.order}
                                                    onChange={(e) => {
                                                        router.post(route('phases.update-order', { category: category.id, phase: p.id }), { order: parseInt(e.target.value) }, { preserveScroll: true });
                                                    }}
                                                    className="text-xs border-2 border-red-400 rounded px-1 py-0.5 font-bold"
                                                >
                                                    {[1, 2, 3, 4, 5, 6].map(n => (
                                                        <option key={n} value={n}>#{n}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {previousPhase && previousPhase.type === 'group' && (
                                    <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800">
                                        <strong>⚠️ WARNING:</strong> Previous phase is a Group phase! For "Winner Match X" templates, 
                                        the previous phase should be a knockout phase (like Quarter Finals).
                                        <br/>Fix the phase order above!
                                    </div>
                                )}

                                {matches.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-yellow-300">
                                        <p className="font-bold text-yellow-800">Stored Templates in {selectedPhase.name}:</p>
                                        <ul className="text-xs mt-1 space-y-0.5">
                                            {matches.slice(0, 4).map((m, i) => (
                                                <li key={m.id}>
                                                    Match #{m.match_order}: <code className="bg-yellow-100 px-1">{m.team1_template || '(no template)'}</code> vs <code className="bg-yellow-100 px-1">{m.team2_template || '(no template)'}</code>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Import Schedule Info */}
                    {selectedPhase && (
                        <div className="bg-primary-50 rounded-2xl p-6 shadow-lg border-2 border-primary">
                            <h3 className="text-lg font-bold font-raverist text-primary mb-3">📊 Schedule Import Guide</h3>
                            <div className="font-gotham text-sm text-dark space-y-2">
                                {selectedPhase.type === 'group' ? (
                                    <>
                                        <div>
                                            <p className="font-bold mb-1">Two Ways to Use Import:</p>
                                            <div className="ml-2 space-y-2">
                                                <div>
                                                    <p className="font-semibold text-success">Option 1: Update Existing Matches</p>
                                                    <ol className="list-decimal list-inside space-y-1 ml-2 text-xs">
                                                        <li>Click "Generate Matches" to create round-robin matches</li>
                                                        <li>Click "Export Schedule" to download</li>
                                                        <li>Edit court, date, and time in Excel</li>
                                                        <li>Click "Import Schedule" to update</li>
                                                    </ol>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-primary">Option 2: Create Custom Matches</p>
                                                    <ol className="list-decimal list-inside space-y-1 ml-2 text-xs">
                                                        <li>Download the template (or create your own Excel)</li>
                                                        <li>Add rows with team pairs, court, date, and time</li>
                                                        <li>Click "Import Schedule" - new matches will be created automatically!</li>
                                                    </ol>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-neutral-600 bg-white rounded p-2 border border-neutral-300">
                                            <p className="font-bold mb-1">Format Requirements:</p>
                                            <ul className="space-y-0.5">
                                                <li>• <strong>Team names:</strong> Team name OR "Player1 / Player2" (case-insensitive)</li>
                                                <li>• <strong>Court:</strong> Court name or number (e.g., "Court 1" or "1")</li>
                                                <li>• <strong>Date:</strong> DD-MM-YYYY or YYYY-MM-DD (e.g., "31-01-2026")</li>
                                                <li>• <strong>Time:</strong> HH:MM in 24-hour format (e.g., "09:00", "14:30")</li>
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <p className="font-bold mb-1">Knockout Stage Import:</p>
                                            <div className="ml-2 space-y-1 text-xs">
                                                <p>Create matches using templates that auto-resolve based on previous results:</p>
                                                <div className="bg-success-50 rounded p-2 mt-2 border border-success-200">
                                                    <p className="font-semibold text-success-800 mb-1">Quarter Finals (from Group Stage):</p>
                                                    <p className="font-mono text-xs">1st Group A, 2nd Group B, Court 1, 31-01-2026, 09:00</p>
                                                    <p className="font-mono text-xs">2nd Group A, 1st Group B, Court 2, 31-01-2026, 10:00</p>
                                                </div>
                                                <div className="bg-primary-50 rounded p-2 mt-2 border border-primary-200">
                                                    <p className="font-semibold text-primary-800 mb-1">Semi Finals (from Quarter Finals):</p>
                                                    <p className="font-mono text-xs">Winner Match 1, Winner Match 2, Court 1, 01-02-2026, 14:00</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-neutral-600 bg-white rounded p-2 border border-neutral-300">
                                            <p className="font-bold mb-1">Template Formats:</p>
                                            <ul className="space-y-0.5">
                                                <li>• <strong>Group rankings:</strong> "1st Group A", "Group B 2nd"</li>
                                                <li>• <strong>Match winners:</strong> "Winner Match 1", "Winner QF1"</li>
                                                <li>• <strong>Court:</strong> Court name or number (e.g., "Court 1" or "1")</li>
                                                <li>• <strong>Date/Time:</strong> Same as group phase format</li>
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Phase Selector */}
                    {phases.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 shadow-lg border-4 border-primary">
                            <h3 className="text-xl font-bold font-raverist text-dark mb-4">Tournament Phases</h3>
                            <div className="flex gap-3 flex-wrap">
                                {phases.map((phase, index) => (
                                    <button
                                        key={phase.id}
                                        onClick={() => setSelectedPhaseId(phase.id)}
                                        className={`px-6 py-3 rounded-xl font-gotham font-bold transition-all border-2 ${
                                            phase.id === selectedPhaseId
                                                ? 'bg-primary text-white border-primary-700 scale-105'
                                                : 'bg-neutral-100 text-dark border-neutral-300 hover:bg-neutral-200'
                                        }`}
                                    >
                                        <span className="text-lg mr-2">{phase.type === 'group' ? '🏆' : '⚔️'}</span>
                                        {index + 1}. {phase.name}
                                        {phase.matches && phase.matches.length > 0 && (
                                            <span className="ml-2 text-xs bg-success text-white px-2 py-1 rounded-full">
                                                {phase.matches.length} matches
                                            </span>
                                        )}
                                        {phase.id === currentPhase?.id && (
                                            <span className="ml-2 text-xs bg-accent text-dark px-2 py-1 rounded-full">Current</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Knockout Match Builder Modal */}
                    {showKnockoutModal && selectedPhase?.type === 'knockout' && (
                        <div className="fixed inset-0 bg-dark bg-opacity-90 flex items-center justify-center z-50 overflow-y-auto">
                            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full my-8 shadow-2xl border-4 border-success">
                                <h3 className="text-2xl font-bold font-raverist text-success mb-4">
                                    Setup Matches for {selectedPhase.name}
                                </h3>
                                
                                {previousPhase && previousPhase.type === 'group' ? (
                                    <div className="bg-primary-100 rounded-xl p-4 mb-6 border-2 border-primary">
                                        <p className="text-base font-gotham text-dark mb-2">
                                            ℹ️ Define match pairings using rankings from <strong>{previousPhase.name}</strong>. 
                                        </p>
                                        <p className="text-sm font-gotham text-dark">
                                            Example: <strong>1st Group A vs 2nd Group B</strong> means the 1st place team from Group A 
                                            plays against the 2nd place team from Group B.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-accent-100 rounded-xl p-4 mb-6 border-2 border-accent">
                                        <p className="text-base font-gotham text-dark">
                                            ⚠️ No group phase found before this phase. You can create matches, but you'll need to manually assign participants later.
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmitKnockoutMatches}>
                                    <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                                        {knockoutData.matches.map((match, index) => (
                                            <div key={index} className="bg-neutral-50 rounded-xl p-4 border-2 border-neutral-200">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h4 className="font-gotham font-bold text-dark">Match {index + 1}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeKnockoutMatch(index)}
                                                        className="ml-auto px-3 py-1 text-xs font-gotham font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-gotham font-bold text-dark mb-1">
                                                            Team 1
                                                        </label>
                                                        <select
                                                            value={match.team1_template}
                                                            onChange={(e) => updateKnockoutMatch(index, 'team1_template', e.target.value)}
                                                            className="block w-full font-gotham rounded-lg border-2 border-neutral-300 focus:border-primary focus:ring-primary"
                                                            required
                                                        >
                                                            {templateOptions.map((opt) => (
                                                                <option key={opt.value} value={opt.value}>
                                                                    {opt.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-gotham font-bold text-dark mb-1">
                                                            Team 2
                                                        </label>
                                                        <select
                                                            value={match.team2_template}
                                                            onChange={(e) => updateKnockoutMatch(index, 'team2_template', e.target.value)}
                                                            className="block w-full font-gotham rounded-lg border-2 border-neutral-300 focus:border-primary focus:ring-primary"
                                                            required
                                                        >
                                                            {templateOptions.map((opt) => (
                                                                <option key={opt.value} value={opt.value}>
                                                                    {opt.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addKnockoutMatch}
                                        className="w-full mb-6 px-6 py-3 text-sm font-gotham font-bold text-primary bg-primary-100 border-2 border-primary rounded-xl hover:bg-primary-200 transition-all"
                                    >
                                        ➕ Add Match
                                    </button>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowKnockoutModal(false);
                                                setKnockoutData('matches', []);
                                            }}
                                            className="flex-1 px-6 py-3 text-sm font-gotham font-bold text-dark bg-white border-2 border-neutral-400 rounded-xl hover:bg-neutral-100 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={knockoutProcessing || knockoutData.matches.length === 0}
                                            className="flex-1 px-6 py-3 text-sm font-gotham font-bold text-white bg-success rounded-xl hover:bg-success-600 disabled:opacity-50 transition-all border-2 border-dark"
                                        >
                                            {knockoutProcessing ? 'Creating...' : `Create ${knockoutData.matches.length} Match${knockoutData.matches.length !== 1 ? 'es' : ''}`}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Matches Content */}
                    {!selectedPhase ? (
                        <div className="bg-white rounded-2xl p-16 text-center shadow-lg border-4 border-accent">
                            <div className="text-8xl mb-6">🎾</div>
                            <h3 className="text-3xl font-bold font-raverist text-dark mb-4">No Phases Configured</h3>
                            <p className="text-xl font-gotham text-neutral-600">
                                Please configure tournament phases in category settings.
                            </p>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="bg-white rounded-2xl p-16 text-center shadow-lg border-4 border-accent">
                            <div className="text-8xl mb-6">🎾</div>
                            <h3 className="text-3xl font-bold font-raverist text-dark mb-4">No Matches for {selectedPhase.name}</h3>
                            <p className="text-xl font-gotham text-neutral-600 mb-4">
                                {selectedPhase.type === 'group' 
                                    ? 'Make sure you have set up groups and assigned participants before generating matches.'
                                    : 'Set up knockout matches using the button above.'}
                            </p>
                            <button
                                onClick={handleGenerateMatches}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-gotham font-bold text-white shadow-lg hover:bg-primary-600 transition-all border-4 border-dark"
                            >
                                <span className="text-2xl">⚙️</span>
                                {selectedPhase.type === 'group' ? 'Generate Matches Now' : 'Setup Matches Now'}
                            </button>
                        </div>
                    ) : selectedPhase.type === 'group' ? (
                        // Group phase matches - organized by group
                        Object.entries(matchesByGroup).sort((a, b) => {
                            // Sort by group name (handles both letter and number formats)
                            return a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' });
                        }).map(([groupName, groupMatches]) => (
                            <div key={groupName} className="bg-white rounded-2xl p-8 shadow-lg border-4 border-success">
                                <h3 className="text-2xl font-bold font-raverist text-success mb-6 flex items-center gap-3">
                                    <span className="text-3xl">🏆</span>
                                    Group {groupName}
                                </h3>
                                
                                <div className="space-y-1.5">
                                    {groupMatches.map((match) => (
                                        <div key={match.id} className="bg-neutral-100 rounded-lg p-2.5 border border-neutral-300 hover:border-primary transition-all">
                                            <div className="flex items-center gap-2">
                                                {/* Teams - Compact */}
                                                <div className="flex-1 flex items-center gap-2">
                                                    {isIndividual ? (
                                                        <>
                                                            <div className="flex items-center gap-1">
                                                                <select
                                                                    value={match.side1_player1_id || ''}
                                                                    onChange={(e) => handleIndividualPlayersChange(match, { side1_player1_id: e.target.value })}
                                                                    className="font-gotham text-xs rounded border border-primary focus:border-primary focus:ring-primary py-1 px-1.5 w-32 bg-white"
                                                                >
                                                                    <option value="">P1</option>
                                                                    {participantOptions.map((p) => (
                                                                        <option key={p.id} value={p.id}>{p.player_1}</option>
                                                                    ))}
                                                                </select>
                                                                <select
                                                                    value={match.side1_player2_id || ''}
                                                                    onChange={(e) => handleIndividualPlayersChange(match, { side1_player2_id: e.target.value })}
                                                                    className="font-gotham text-xs rounded border border-primary focus:border-primary focus:ring-primary py-1 px-1.5 w-32 bg-white"
                                                                >
                                                                    <option value="">P2</option>
                                                                    {participantOptions.map((p) => (
                                                                        <option key={p.id} value={p.id}>{p.player_1}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <span className="text-sm font-bold font-raverist text-neutral-600">vs</span>
                                                            <div className="flex items-center gap-1">
                                                                <select
                                                                    value={match.side2_player1_id || ''}
                                                                    onChange={(e) => handleIndividualPlayersChange(match, { side2_player1_id: e.target.value })}
                                                                    className="font-gotham text-xs rounded border border-success focus:border-primary focus:ring-primary py-1 px-1.5 w-32 bg-white"
                                                                >
                                                                    <option value="">P1</option>
                                                                    {participantOptions.map((p) => (
                                                                        <option key={p.id} value={p.id}>{p.player_1}</option>
                                                                    ))}
                                                                </select>
                                                                <select
                                                                    value={match.side2_player2_id || ''}
                                                                    onChange={(e) => handleIndividualPlayersChange(match, { side2_player2_id: e.target.value })}
                                                                    className="font-gotham text-xs rounded border border-success focus:border-primary focus:ring-primary py-1 px-1.5 w-32 bg-white"
                                                                >
                                                                    <option value="">P2</option>
                                                                    {participantOptions.map((p) => (
                                                                        <option key={p.id} value={p.id}>{p.player_1}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="font-gotham text-xs text-dark bg-white px-2 py-1.5 rounded border border-primary min-w-[150px]">
                                                                <span className="font-bold">{match.team1?.player_1}</span> / {match.team1?.player_2}
                                                            </div>
                                                            <span className="text-sm font-bold font-raverist text-neutral-600">vs</span>
                                                            <div className="font-gotham text-xs text-dark bg-white px-2 py-1.5 rounded border border-success min-w-[150px]">
                                                                <span className="font-bold">{match.team2?.player_1}</span> / {match.team2?.player_2}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                
                                                {/* Status Badge */}
                                                <span className={`px-2 py-1 text-xs font-gotham font-bold rounded border ${getStatusColor(match.status)} whitespace-nowrap`}>
                                                    {getStatusIcon(match.status)} {match.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                                
                                                {/* Court Select */}
                                                <select
                                                    value={match.court_id || ''}
                                                    onChange={(e) => handleCourtChange(match.id, e.target.value)}
                                                    className="font-gotham text-xs rounded border border-neutral-300 focus:border-primary focus:ring-primary py-1 px-1.5 w-24"
                                                >
                                                    <option value="">Court</option>
                                                    {courts.map((court) => (
                                                        <option key={court.id} value={court.id}>
                                                            {court.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                
                                                {/* Time Input */}
                                                <input
                                                    type="datetime-local"
                                                    defaultValue={match.scheduled_time ? new Date(match.scheduled_time).toISOString().slice(0, 16) : ''}
                                                    onBlur={(e) => handleScheduledTimeChange(match.id, e.target.value)}
                                                    className="font-gotham text-xs rounded border border-neutral-300 focus:border-primary focus:ring-primary py-1 px-1.5 w-36"
                                                />
                                                
                                                {/* Actions */}
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleStartMatch(match.id)}
                                                        className="px-2 py-1 text-sm font-gotham font-bold text-white bg-success rounded hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-dark"
                                                        disabled={match.status === 'completed' || match.status === 'cancelled' || !match.court_id}
                                                        title={
                                                            !match.court_id 
                                                                ? 'Assign court first' 
                                                                : (match.status === 'in_progress' || match.status === 'upcoming' ? 'Open Match' : 'Start Match')
                                                        }
                                                    >
                                                        🎾
                                                    </button>
                                                    
                                                    {(match.status === 'upcoming' || match.status === 'in_progress') && (
                                                        <button
                                                            onClick={() => handleResetMatch(match.id)}
                                                            className="px-2 py-1 text-sm font-gotham font-bold text-white bg-orange-600 rounded hover:bg-orange-700 transition-all border border-dark"
                                                            title="Reset match"
                                                        >
                                                            🔄
                                                        </button>
                                                    )}
                                                    
                                                    <button
                                                        onClick={() => handleDeleteMatch(match.id)}
                                                        className="px-2 py-1 text-sm font-gotham font-bold text-white bg-red-600 rounded hover:bg-red-700 transition-all border border-dark"
                                                        title="Delete match"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        // Knockout phase matches - flat list
                        <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-primary">
                            <h3 className="text-2xl font-bold font-raverist text-primary mb-6 flex items-center gap-3">
                                <span className="text-3xl">⚔️</span>
                                {selectedPhase.name}
                            </h3>
                            
                            <div className="space-y-1.5">
                                {matches.map((match, index) => (
                                    <div key={match.id} className="bg-neutral-100 rounded-lg p-2.5 border border-neutral-300 hover:border-primary transition-all">
                                        <div className="flex items-center gap-2">
                                            {/* Match Number - Use match_order for template reference */}
                                            <span className="font-gotham font-bold text-sm text-dark bg-primary-100 px-3 py-1.5 rounded border border-primary" title={`Use "Winner Match ${match.match_order}" in next phase`}>
                                                #{match.match_order || index + 1}
                                            </span>
                                            
                                            {/* Teams */}
                                            <div className="flex-1 flex items-center gap-2">
                                                {match.team1_id ? (
                                                    <div className="font-gotham text-xs text-dark bg-white px-2 py-1.5 rounded border border-primary min-w-[150px]">
                                                        <span className="font-bold">{match.team1?.player_1}</span> / {match.team1?.player_2}
                                                    </div>
                                                ) : (
                                                    <div className="font-gotham text-xs text-neutral-500 bg-neutral-200 px-2 py-1.5 rounded border border-neutral-400 min-w-[150px]">
                                                        {match.team1_template?.replace(/_/g, ' ')}
                                                    </div>
                                                )}
                                                <span className="text-sm font-bold font-raverist text-neutral-600">vs</span>
                                                {match.team2_id ? (
                                                    <div className="font-gotham text-xs text-dark bg-white px-2 py-1.5 rounded border border-success min-w-[150px]">
                                                        <span className="font-bold">{match.team2?.player_1}</span> / {match.team2?.player_2}
                                                    </div>
                                                ) : (
                                                    <div className="font-gotham text-xs text-neutral-500 bg-neutral-200 px-2 py-1.5 rounded border border-neutral-400 min-w-[150px]">
                                                        {match.team2_template?.replace(/_/g, ' ')}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Status Badge */}
                                            <span className={`px-2 py-1 text-xs font-gotham font-bold rounded border ${getStatusColor(match.status)} whitespace-nowrap`}>
                                                {getStatusIcon(match.status)} {match.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                            
                                            {/* Court Select */}
                                            <select
                                                value={match.court_id || ''}
                                                onChange={(e) => handleCourtChange(match.id, e.target.value)}
                                                className="font-gotham text-xs rounded border border-neutral-300 focus:border-primary focus:ring-primary py-1 px-1.5 w-24"
                                            >
                                                <option value="">Court</option>
                                                {courts.map((court) => (
                                                    <option key={court.id} value={court.id}>
                                                        {court.name}
                                                    </option>
                                                ))}
                                            </select>
                                            
                                            {/* Time Input */}
                                            <input
                                                type="datetime-local"
                                                defaultValue={match.scheduled_time ? new Date(match.scheduled_time).toISOString().slice(0, 16) : ''}
                                                onBlur={(e) => handleScheduledTimeChange(match.id, e.target.value)}
                                                className="font-gotham text-xs rounded border border-neutral-300 focus:border-primary focus:ring-primary py-1 px-1.5 w-36"
                                            />
                                            
                                            {/* Actions */}
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleStartMatch(match.id)}
                                                    className="px-2 py-1 text-sm font-gotham font-bold text-white bg-success rounded hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-dark"
                                                    disabled={match.status === 'completed' || match.status === 'cancelled' || !match.court_id || !match.team1_id || !match.team2_id}
                                                    title={
                                                        !match.court_id 
                                                            ? 'Assign court first'
                                                            : !match.team1_id || !match.team2_id
                                                                ? 'Resolve participants first'
                                                                : (match.status === 'in_progress' || match.status === 'upcoming' ? 'Open Match' : 'Start Match')
                                                    }
                                                >
                                                    🎾
                                                </button>
                                                
                                                {(match.status === 'upcoming' || match.status === 'in_progress') && (
                                                    <button
                                                        onClick={() => handleResetMatch(match.id)}
                                                        className="px-2 py-1 text-sm font-gotham font-bold text-white bg-orange-600 rounded hover:bg-orange-700 transition-all border border-dark"
                                                        title="Reset match"
                                                    >
                                                        🔄
                                                    </button>
                                                )}
                                                
                                                <button
                                                    onClick={() => handleDeleteMatch(match.id)}
                                                    className="px-2 py-1 text-sm font-gotham font-bold text-white bg-red-600 rounded hover:bg-red-700 transition-all border border-dark"
                                                    title="Delete match"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
