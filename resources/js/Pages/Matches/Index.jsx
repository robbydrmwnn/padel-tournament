import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import { ChevronRight, RefreshCw, ArrowUpDown, FileDown, Upload, Settings, Trophy, Swords, Play, RotateCcw, Trash2, Plus, Calendar, CheckCircle, XCircle, Clock, Timer, Hash, AlertCircle, Info } from 'lucide-react';

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
    const [knockoutProcessing, setKnockoutProcessing] = useState(false);
    const { data: knockoutData, setData: setKnockoutData } = useForm({
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

    const handleTeamChange = (matchId, field, participantId) => {
        router.patch(route('categories.matches.update', [category.id, matchId]), {
            [field]: participantId || null,
        }, {
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

    // Determine default slot type based on available options
    const getDefaultSlotType = () => {
        if (groupRankOptions.length > 0) return 'group_rank';
        if (winnerMatchOptions.length > 0) return 'winner_match';
        return 'tbd';
    };

    const getDefaultTemplate = (type, optionIndex = 0) => {
        if (type === 'group_rank') return groupRankOptions[optionIndex]?.value || null;
        if (type === 'winner_match') return winnerMatchOptions[optionIndex]?.value || null;
        return null;
    };

    // Knockout match builder
    const addKnockoutMatch = () => {
        const defaultType = getDefaultSlotType();
        setKnockoutData('matches', [...knockoutData.matches, {
            team1_type: defaultType,
            team1_template: getDefaultTemplate(defaultType, 0),
            team2_type: defaultType,
            team2_template: getDefaultTemplate(defaultType, 1) ?? getDefaultTemplate(defaultType, 0),
        }]);
    };

    const removeKnockoutMatch = (index) => {
        const newMatches = knockoutData.matches.filter((_, i) => i !== index);
        setKnockoutData('matches', newMatches);
    };

    const updateKnockoutMatch = (index, field, value) => {
        const newMatches = [...knockoutData.matches];
        newMatches[index][field] = value;
        // When the type changes, reset the template to the first option of the new type
        if (field === 'team1_type') {
            newMatches[index].team1_template = getDefaultTemplate(value, 0);
        }
        if (field === 'team2_type') {
            newMatches[index].team2_template = getDefaultTemplate(value, 0);
        }
        setKnockoutData('matches', newMatches);
    };

    const handleSubmitKnockoutMatches = (e) => {
        e.preventDefault();
        
        if (knockoutData.matches.length === 0) {
            alert('Please add at least one match before submitting.');
            return;
        }
        
        // Build payload: strip type fields, send null template for TBD slots
        const payload = {
            phase_id: knockoutData.phase_id,
            matches: knockoutData.matches.map(m => ({
                team1_template: m.team1_type === 'tbd' ? null : (m.team1_template || null),
                team2_template: m.team2_type === 'tbd' ? null : (m.team2_template || null),
            })),
        };

        setKnockoutProcessing(true);
        router.post(route('categories.matches.create-knockout', category.id), payload, {
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
            onFinish: () => setKnockoutProcessing(false),
        });
    };

    // Generate template options based on previous phase
    const getTemplateOptions = () => {
        if (!previousPhase) return { groupRankOptions: [], winnerMatchOptions: [] };
        
        const groupRankOptions = [];
        const winnerMatchOptions = [];

        if (previousPhase.type === 'group') {
            const groups = previousPhase.groups || [];
            const teamsPerGroup = previousPhase.teams_advance_per_group || 2;
            for (let rank = 1; rank <= teamsPerGroup; rank++) {
                const rankSuffix = rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th';
                for (const group of groups) {
                    const groupLetter = group.name.replace('Group ', '');
                    groupRankOptions.push({
                        value: `${rank}${rankSuffix}_group_${groupLetter}`,
                        label: `${rank}${rankSuffix} ${group.name}`
                    });
                }
            }
        }

        if (previousPhase.type === 'knockout') {
            const matchCount = (previousPhase.matches || []).length;
            for (let i = 1; i <= matchCount; i++) {
                winnerMatchOptions.push({
                    value: `winner_match_${i}`,
                    label: `Winner Match ${i}`
                });
            }
        }

        return { groupRankOptions, winnerMatchOptions };
    };

    const { groupRankOptions, winnerMatchOptions } = getTemplateOptions();
    // Flat list kept for backwards compat with any remaining references
    const templateOptions = [...groupRankOptions, ...winnerMatchOptions];

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
            scheduled: 'bg-zinc-200 text-zinc-700 border-zinc-300',
            upcoming: 'bg-black text-white border-zinc-700',
            in_progress: 'bg-accent text-black border-accent-600',
            completed: 'bg-zinc-600 text-white border-zinc-700',
            cancelled: 'bg-red-600 text-white border-red-800',
        };
        return colors[status] || 'bg-zinc-200 text-zinc-700 border-zinc-300';
    };

    const StatusIcon = ({ status, className = 'h-3 w-3' }) => {
        const icons = {
            scheduled: <Calendar className={className} />,
            upcoming: <Clock className={className} />,
            in_progress: <Timer className={className} />,
            completed: <CheckCircle className={className} />,
            cancelled: <XCircle className={className} />,
        };
        return icons[status] || <Clock className={className} />;
    };

    // Slot type options available for the current phase setup
    const availableSlotTypes = [
        ...(groupRankOptions.length > 0 ? [{ id: 'group_rank', label: 'Group Rank' }] : []),
        ...(winnerMatchOptions.length > 0 ? [{ id: 'winner_match', label: 'Winner Match' }] : []),
        { id: 'tbd', label: 'TBD' },
    ];

    const renderTeamSlot = (match, index, teamNum) => {
        const typeField = `team${teamNum}_type`;
        const templateField = `team${teamNum}_template`;
        const slotType = match[typeField] || 'tbd';
        const slotTemplate = match[templateField];

        return (
            <div>
                <label className="block text-sm font-ffdin font-bold text-black mb-1">Team {teamNum}</label>
                {availableSlotTypes.length > 1 && (
                    <div className="flex gap-1 mb-2">
                        {availableSlotTypes.map(t => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => updateKnockoutMatch(index, typeField, t.id)}
                                className={`px-2.5 py-1 text-xs font-ffdin font-bold rounded-lg border transition-all ${
                                    slotType === t.id
                                        ? 'bg-black text-white border-zinc-700'
                                        : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-100'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                )}
                {slotType === 'group_rank' && (
                    <select
                        value={slotTemplate || ''}
                        onChange={(e) => updateKnockoutMatch(index, templateField, e.target.value)}
                        className="block w-full font-ffdin text-sm rounded-lg border border-zinc-300 focus:border-black focus:ring-black"
                    >
                        {groupRankOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                )}
                {slotType === 'winner_match' && (
                    <select
                        value={slotTemplate || ''}
                        onChange={(e) => updateKnockoutMatch(index, templateField, e.target.value)}
                        className="block w-full font-ffdin text-sm rounded-lg border border-zinc-300 focus:border-black focus:ring-black"
                    >
                        {winnerMatchOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                )}
                {slotType === 'tbd' && (
                    <div className="font-ffdin text-sm text-zinc-500 bg-zinc-100 border border-dashed border-zinc-400 rounded-lg px-3 py-2">
                        TBD — assign on the day
                    </div>
                )}
            </div>
        );
    };

    const hasUnresolvedMatches = isIndividual
        ? matches.some(m => !m.side1_player1_id || !m.side1_player2_id || !m.side2_player1_id || !m.side2_player2_id)
        : matches.some(m => !m.team1_id || !m.team2_id);

    return (
        <AuthenticatedLayout header="Match Management">
            <Head title={`Matches - ${category.name}`} />

            <div className="py-12 bg-neutral-100 min-h-screen">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-6">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 text-sm font-ffdin text-zinc-500">
                        <Link href={route('events.index')} className="hover:text-black transition-colors">Events</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <Link href={route('events.show', category.event.id)} className="hover:text-black transition-colors">
                            {category.event.name}
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <Link href={route('events.categories.show', [category.event.id, category.id])} className="hover:text-black transition-colors">
                            {category.name}
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-black font-bold">Matches</span>
                    </nav>

                    {/* Header Banner */}
                    <div className="bg-black rounded-2xl p-8 shadow-lg border border-zinc-700">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div>
                                <h1 className="text-4xl font-bold font-ffdin text-white mb-2 tracking-wide">Match Management</h1>
                                <p className="text-xl font-ffdin text-zinc-400">{category.name}</p>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                {selectedPhase && hasUnresolvedMatches && previousPhase && (
                                    <button
                                        onClick={() => handleResolveMatches(false)}
                                        className="inline-flex items-center gap-2 rounded-xl bg-zinc-700 px-5 py-2.5 text-sm font-ffdin font-bold text-white shadow-lg hover:bg-zinc-600 transition-all border border-zinc-600"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Resolve Participants
                                    </button>
                                )}
                                {selectedPhase && previousPhase && matches.some(m => m.team1_id || m.team2_id) && matches.some(m => m.team1_template || m.team2_template) && (
                                    <button
                                        onClick={() => handleResolveMatches(true)}
                                        className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-ffdin font-bold text-white shadow-lg hover:bg-orange-700 transition-all"
                                        title="Re-resolve and override existing team assignments"
                                    >
                                        <ArrowUpDown className="h-4 w-4" />
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
                                            className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-5 py-2.5 text-sm font-ffdin font-bold text-white shadow-lg hover:bg-zinc-700 transition-all border border-zinc-600"
                                            title="Download Excel template with current matches"
                                        >
                                            <FileDown className="h-4 w-4" />
                                            {matches.length > 0 ? 'Export Schedule' : 'Template'}
                                        </a>
                                        <label className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-ffdin font-bold shadow-lg transition-all border ${
                                            importingSchedule
                                                ? 'bg-zinc-700 text-zinc-400 border-zinc-600 cursor-not-allowed'
                                                : 'bg-accent text-black border-accent-600 hover:bg-accent-400 cursor-pointer'
                                        }`}>
                                            <Upload className="h-4 w-4" />
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
                                            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-ffdin font-bold text-black shadow-lg hover:bg-zinc-100 transition-all"
                                        >
                                            <Settings className="h-4 w-4" />
                                            {selectedPhase.type === 'group' ? 'Generate Matches' : 'Setup Matches'}
                                        </button>
                                        {selectedPhase.type === 'knockout' && matches.length > 0 && (
                                            <button
                                                onClick={handleRenumberMatches}
                                                className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-ffdin font-bold text-white shadow hover:bg-zinc-700 transition-all border border-zinc-600"
                                                title="Fix match numbering if 'Winner Match X' templates aren't working correctly"
                                            >
                                                <Hash className="h-4 w-4" />
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
                        <div className="flex items-center gap-2 bg-zinc-900 rounded-xl border border-zinc-700 text-white px-6 py-4 font-ffdin font-bold shadow-lg">
                            <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" /> {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="flex items-center gap-2 bg-red-600 rounded-xl border border-red-800 text-white px-6 py-4 font-ffdin font-bold shadow-lg">
                            <XCircle className="h-5 w-5 flex-shrink-0" /> {flash.error}
                        </div>
                    )}
                    {flash?.info && (
                        <div className="flex items-center gap-2 bg-zinc-800 rounded-xl border border-zinc-600 text-white px-6 py-4 font-ffdin font-bold shadow-lg">
                            <Info className="h-5 w-5 flex-shrink-0" /> {flash.info}
                        </div>
                    )}


                    {/* Import Schedule Info */}
                    {selectedPhase && (
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-zinc-200">
                            <h3 className="flex items-center gap-2 text-lg font-bold font-ffdin text-black mb-3">
                                <Info className="h-5 w-5 text-zinc-400" /> Schedule Import Guide
                            </h3>
                            <div className="font-ffdin text-sm text-black space-y-2">
                                {isIndividual && selectedPhase.type === 'group' ? (
                                    <>
                                        <div>
                                            <p className="font-bold mb-1">Individuals (Americano) – 4 players per match</p>
                                            <div className="ml-2 space-y-2">
                                                <p className="text-xs">Each row in the Excel is one match: <strong>Side 1</strong> (two players) vs <strong>Side 2</strong> (two players). Player names must match exactly the names in Participants (one name per participant).</p>
                                                <ol className="list-decimal list-inside space-y-1 ml-2 text-xs">
                                                    <li>Click &quot;Template&quot; or &quot;Export Schedule&quot; to download the Excel</li>
                                                    <li>Fill in columns: <strong>Side 1 Player 1</strong>, <strong>Side 1 Player 2</strong>, <strong>Side 2 Player 1</strong>, <strong>Side 2 Player 2</strong>, Court, Date, Time</li>
                                                    <li>Use exact player names as in the Participants list (one name per participant)</li>
                                                    <li>Click &quot;Import Schedule&quot; – matches will be created or updated</li>
                                                </ol>
                                            </div>
                                        </div>
                                        <div className="text-xs text-neutral-600 bg-white rounded p-2 border border-neutral-300">
                                            <p className="font-bold mb-1">Required columns (order can vary):</p>
                                            <ul className="space-y-0.5">
                                                <li>• <strong>Side 1 Player 1</strong>, <strong>Side 1 Player 2</strong> – first pair</li>
                                                <li>• <strong>Side 2 Player 1</strong>, <strong>Side 2 Player 2</strong> – second pair</li>
                                                <li>• <strong>Court:</strong> Court name or number (e.g., &quot;Court 1&quot; or &quot;1&quot;)</li>
                                                <li>• <strong>Date:</strong> DD-MM-YYYY or YYYY-MM-DD (e.g., &quot;31-01-2026&quot;)</li>
                                                <li>• <strong>Time:</strong> HH:MM 24-hour (e.g., &quot;09:00&quot;, &quot;14:30&quot;)</li>
                                            </ul>
                                        </div>
                                    </>
                                ) : selectedPhase.type === 'group' ? (
                                    <>
                                        <div>
                                            <p className="font-bold mb-1">Two Ways to Use Import:</p>
                                            <div className="ml-2 space-y-2">
                                                <div>
                                                    <p className="font-semibold text-black">Option 1: Update Existing Matches</p>
                                                    <ol className="list-decimal list-inside space-y-1 ml-2 text-xs">
                                                        <li>Click "Generate Matches" to create round-robin matches</li>
                                                        <li>Click "Export Schedule" to download</li>
                                                        <li>Edit court, date, and time in Excel</li>
                                                        <li>Click "Import Schedule" to update</li>
                                                    </ol>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-zinc-700">Option 2: Create Custom Matches</p>
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
                                                <div className="bg-zinc-100 rounded p-2 mt-2 border border-zinc-300">
                                                    <p className="font-semibold text-zinc-800 mb-1">Quarter Finals (from Group Stage):</p>
                                                    <p className="font-mono text-xs">1st Group A, 2nd Group B, Court 1, 31-01-2026, 09:00</p>
                                                    <p className="font-mono text-xs">2nd Group A, 1st Group B, Court 2, 31-01-2026, 10:00</p>
                                                </div>
                                                <div className="bg-zinc-100 rounded p-2 mt-2 border border-zinc-300">
                                                    <p className="font-semibold text-zinc-800 mb-1">Semi Finals (from Quarter Finals):</p>
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
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-zinc-200">
                            <h3 className="text-xl font-bold font-ffdin text-black mb-4">Tournament Phases</h3>
                            <div className="flex gap-3 flex-wrap">
                                {phases.map((phase, index) => (
                                    <button
                                        key={phase.id}
                                        onClick={() => setSelectedPhaseId(phase.id)}
                                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-ffdin font-bold transition-all border ${
                                            phase.id === selectedPhaseId
                                                ? 'bg-black text-white border-zinc-700 scale-105'
                                                : 'bg-zinc-100 text-black border-zinc-300 hover:bg-zinc-200'
                                        }`}
                                    >
                                        {phase.type === 'group'
                                            ? <Trophy className="h-4 w-4" />
                                            : <Swords className="h-4 w-4" />
                                        }
                                        {index + 1}. {phase.name}
                                        {phase.matches && phase.matches.length > 0 && (
                                            <span className="ml-1 text-xs bg-zinc-600 text-white px-2 py-0.5 rounded-full">
                                                {phase.matches.length}
                                            </span>
                                        )}
                                        {phase.id === currentPhase?.id && (
                                            <span className="ml-1 text-xs bg-accent text-black px-2 py-0.5 rounded-full">Current</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Knockout Match Builder Modal */}
                    {showKnockoutModal && selectedPhase?.type === 'knockout' && (
                        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-y-auto">
                            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full my-8 shadow-2xl border border-zinc-200">
                                <h3 className="text-2xl font-bold font-ffdin text-black mb-4">
                                    Setup Matches for {selectedPhase.name}
                                </h3>

                                {previousPhase && previousPhase.type === 'group' ? (
                                    <div className="flex items-start gap-2 bg-zinc-50 rounded-xl p-4 mb-6 border border-zinc-200">
                                        <Info className="h-5 w-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-base font-ffdin text-black mb-2">
                                                Define match pairings using rankings from <strong>{previousPhase.name}</strong>, or set a slot to <strong>TBD</strong> to assign the team on the day.
                                            </p>
                                            <p className="text-sm font-ffdin text-zinc-600">
                                                Example: <strong>1st Group A vs 2nd Group B</strong> means the 1st place team from Group A
                                                plays against the 2nd place team from Group B.
                                            </p>
                                        </div>
                                    </div>
                                ) : previousPhase && previousPhase.type === 'knockout' ? (
                                    <div className="flex items-start gap-2 bg-zinc-50 rounded-xl p-4 mb-6 border border-zinc-200">
                                        <Info className="h-5 w-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-base font-ffdin text-black mb-2">
                                                Use <strong>Winner Match</strong> to auto-resolve teams from <strong>{previousPhase.name}</strong> results, or set a slot to <strong>TBD</strong> to assign on the day.
                                            </p>
                                            <p className="text-sm font-ffdin text-zinc-600">
                                                Example: <strong>Winner Match 1 vs Winner Match 2</strong> will be resolved once those matches complete.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-2 bg-zinc-50 rounded-xl p-4 mb-6 border border-zinc-300">
                                        <AlertCircle className="h-5 w-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-base font-ffdin text-black">
                                            No previous phase found. Matches will be created with TBD slots — assign teams on the day from the match list.
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmitKnockoutMatches}>
                                    <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                                        {knockoutData.matches.map((match, index) => (
                                            <div key={index} className="bg-zinc-50 rounded-xl p-4 border border-zinc-200">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h4 className="font-ffdin font-bold text-black">Match {index + 1}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeKnockoutMatch(index)}
                                                        className="ml-auto px-3 py-1 text-xs font-ffdin font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {renderTeamSlot(match, index, 1)}
                                                    {renderTeamSlot(match, index, 2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addKnockoutMatch}
                                        className="inline-flex items-center gap-2 w-full justify-center mb-6 px-6 py-3 text-sm font-ffdin font-bold text-black bg-zinc-100 border border-zinc-300 rounded-xl hover:bg-zinc-200 transition-all"
                                    >
                                        <Plus className="h-4 w-4" /> Add Match
                                    </button>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowKnockoutModal(false);
                                                setKnockoutData('matches', []);
                                            }}
                                            className="flex-1 px-6 py-3 text-sm font-ffdin font-bold text-black bg-white border border-zinc-300 rounded-xl hover:bg-zinc-50 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={knockoutProcessing || knockoutData.matches.length === 0}
                                            className="flex-1 px-6 py-3 text-sm font-ffdin font-bold text-white bg-black rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-all"
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
                        <div className="bg-white rounded-2xl p-16 text-center shadow-lg border border-zinc-200">
                            <Swords className="h-16 w-16 mx-auto mb-6 text-zinc-300" />
                            <h3 className="text-3xl font-bold font-ffdin text-black mb-4">No Phases Configured</h3>
                            <p className="text-xl font-ffdin text-zinc-500">
                                Please configure tournament phases in category settings.
                            </p>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="bg-white rounded-2xl p-16 text-center shadow-lg border border-zinc-200">
                            <Swords className="h-16 w-16 mx-auto mb-6 text-zinc-300" />
                            <h3 className="text-3xl font-bold font-ffdin text-black mb-4">No Matches for {selectedPhase.name}</h3>
                            <p className="text-xl font-ffdin text-zinc-500 mb-4">
                                {selectedPhase.type === 'group'
                                    ? 'Make sure you have set up groups and assigned participants before generating matches.'
                                    : 'Set up knockout matches using the button above.'}
                            </p>
                            <button
                                onClick={handleGenerateMatches}
                                className="inline-flex items-center gap-2 rounded-xl bg-black px-8 py-4 text-lg font-ffdin font-bold text-white shadow-lg hover:bg-zinc-800 transition-all"
                            >
                                <Settings className="h-5 w-5" />
                                {selectedPhase.type === 'group' ? 'Generate Matches Now' : 'Setup Matches Now'}
                            </button>
                        </div>
                    ) : selectedPhase.type === 'group' ? (
                        // Group phase matches - organized by group
                        Object.entries(matchesByGroup).sort((a, b) => {
                            return a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' });
                        }).map(([groupName, groupMatches]) => (
                            <div key={groupName} className="bg-white rounded-2xl p-8 shadow-lg border border-zinc-200">
                                <h3 className="text-2xl font-bold font-ffdin text-black mb-6 flex items-center gap-3">
                                    <Trophy className="h-6 w-6 text-zinc-400" />
                                    Group {groupName}
                                </h3>
                                
                                <div className="space-y-1.5">
                                    {groupMatches.map((match) => (
                                        <div key={match.id} className="bg-zinc-50 rounded-lg p-2.5 border border-zinc-200 hover:border-black transition-all">
                                            <div className="flex items-center gap-2">
                                                {/* Teams - Compact */}
                                                <div className="flex-1 flex items-center gap-2">
                                                    {isIndividual ? (
                                                        <>
                                                            <div className="flex items-center gap-1">
                                                                <select
                                                                    value={match.side1_player1_id || ''}
                                                                    onChange={(e) => handleIndividualPlayersChange(match, { side1_player1_id: e.target.value })}
                                                                    className="font-ffdin text-xs rounded border border-zinc-300 focus:border-black focus:ring-black py-1 px-1.5 w-32 bg-white"
                                                                >
                                                                    <option value="">P1</option>
                                                                    {participantOptions.map((p) => (
                                                                        <option key={p.id} value={p.id}>{p.player_1}</option>
                                                                    ))}
                                                                </select>
                                                                <select
                                                                    value={match.side1_player2_id || ''}
                                                                    onChange={(e) => handleIndividualPlayersChange(match, { side1_player2_id: e.target.value })}
                                                                    className="font-ffdin text-xs rounded border border-zinc-300 focus:border-black focus:ring-black py-1 px-1.5 w-32 bg-white"
                                                                >
                                                                    <option value="">P2</option>
                                                                    {participantOptions.map((p) => (
                                                                        <option key={p.id} value={p.id}>{p.player_1}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <span className="text-sm font-bold font-ffdin text-zinc-500">vs</span>
                                                            <div className="flex items-center gap-1">
                                                                <select
                                                                    value={match.side2_player1_id || ''}
                                                                    onChange={(e) => handleIndividualPlayersChange(match, { side2_player1_id: e.target.value })}
                                                                    className="font-ffdin text-xs rounded border border-zinc-300 focus:border-black focus:ring-black py-1 px-1.5 w-32 bg-white"
                                                                >
                                                                    <option value="">P1</option>
                                                                    {participantOptions.map((p) => (
                                                                        <option key={p.id} value={p.id}>{p.player_1}</option>
                                                                    ))}
                                                                </select>
                                                                <select
                                                                    value={match.side2_player2_id || ''}
                                                                    onChange={(e) => handleIndividualPlayersChange(match, { side2_player2_id: e.target.value })}
                                                                    className="font-ffdin text-xs rounded border border-zinc-300 focus:border-black focus:ring-black py-1 px-1.5 w-32 bg-white"
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
                                                            <div className="font-ffdin text-xs text-black bg-white px-2 py-1.5 rounded border border-zinc-300 min-w-[150px]">
                                                                <span className="font-bold">{match.team1?.player_1}</span> / {match.team1?.player_2}
                                                            </div>
                                                            <span className="text-sm font-bold font-ffdin text-zinc-500">vs</span>
                                                            <div className="font-ffdin text-xs text-black bg-white px-2 py-1.5 rounded border border-zinc-300 min-w-[150px]">
                                                                <span className="font-bold">{match.team2?.player_1}</span> / {match.team2?.player_2}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                
                                                {/* Status Badge */}
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-ffdin font-bold rounded border ${getStatusColor(match.status)} whitespace-nowrap`}>
                                                    <StatusIcon status={match.status} />
                                                    {match.status.replace('_', ' ').toUpperCase()}
                                                </span>

                                                {/* Court Select */}
                                                <select
                                                    value={match.court_id || ''}
                                                    onChange={(e) => handleCourtChange(match.id, e.target.value)}
                                                    className="font-ffdin text-xs rounded border border-zinc-300 focus:border-black focus:ring-black py-1 px-1.5 w-24"
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
                                                    className="font-ffdin text-xs rounded border border-zinc-300 focus:border-black focus:ring-black py-1 px-1.5 w-36"
                                                />

                                                {/* Actions */}
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleStartMatch(match.id)}
                                                        className="p-1.5 text-white bg-black rounded hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                                        disabled={match.status === 'completed' || match.status === 'cancelled' || !match.court_id}
                                                        title={
                                                            !match.court_id
                                                                ? 'Assign court first'
                                                                : (match.status === 'in_progress' || match.status === 'upcoming' ? 'Open Match' : 'Start Match')
                                                        }
                                                    >
                                                        <Play className="h-4 w-4" />
                                                    </button>

                                                    {(match.status === 'upcoming' || match.status === 'in_progress') && (
                                                        <button
                                                            onClick={() => handleResetMatch(match.id)}
                                                            className="p-1.5 text-white bg-orange-600 rounded hover:bg-orange-700 transition-all"
                                                            title="Reset match"
                                                        >
                                                            <RotateCcw className="h-4 w-4" />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleDeleteMatch(match.id)}
                                                        className="p-1.5 text-white bg-red-600 rounded hover:bg-red-700 transition-all"
                                                        title="Delete match"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-zinc-200">
                            <h3 className="text-2xl font-bold font-ffdin text-black mb-6 flex items-center gap-3">
                                <Swords className="h-6 w-6 text-zinc-400" />
                                {selectedPhase.name}
                            </h3>
                            
                            <div className="space-y-1.5">
                                {matches.map((match, index) => (
                                        <div key={match.id} className="bg-zinc-50 rounded-lg p-2.5 border border-zinc-200 hover:border-black transition-all">
                                            <div className="flex items-center gap-2">
                                                {/* Match Number - Use match_order for template reference */}
                                            <span className="font-ffdin font-bold text-sm text-black bg-zinc-100 px-3 py-1.5 rounded border border-zinc-300" title={`Use "Winner Match ${match.match_order}" in next phase`}>
                                                #{match.match_order || index + 1}
                                            </span>
                                            
                                            {/* Teams */}
                                            <div className="flex-1 flex items-center gap-2">
                                                {match.team1_id ? (
                                                    <div className="font-ffdin text-xs text-black bg-white px-2 py-1.5 rounded border border-zinc-300 min-w-[150px]">
                                                        <span className="font-bold">{match.team1?.player_1}</span> / {match.team1?.player_2}
                                                    </div>
                                                ) : match.team1_template ? (
                                                    <div className="font-ffdin text-xs text-zinc-500 bg-zinc-100 px-2 py-1.5 rounded border border-zinc-300 min-w-[150px]">
                                                        {match.team1_template.replace(/_/g, ' ')}
                                                    </div>
                                                ) : (
                                                    <select
                                                        value=""
                                                        onChange={(e) => handleTeamChange(match.id, 'team1_id', e.target.value)}
                                                        className="font-ffdin text-xs rounded border border-dashed border-zinc-400 focus:border-black focus:ring-black py-1 px-1.5 min-w-[150px] bg-white text-zinc-500"
                                                    >
                                                        <option value="">Assign Team 1</option>
                                                        {participantOptions.map((p) => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.player_1} / {p.player_2}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                                <span className="text-sm font-bold font-ffdin text-zinc-500">vs</span>
                                                {match.team2_id ? (
                                                    <div className="font-ffdin text-xs text-black bg-white px-2 py-1.5 rounded border border-zinc-300 min-w-[150px]">
                                                        <span className="font-bold">{match.team2?.player_1}</span> / {match.team2?.player_2}
                                                    </div>
                                                ) : match.team2_template ? (
                                                    <div className="font-ffdin text-xs text-zinc-500 bg-zinc-100 px-2 py-1.5 rounded border border-zinc-300 min-w-[150px]">
                                                        {match.team2_template.replace(/_/g, ' ')}
                                                    </div>
                                                ) : (
                                                    <select
                                                        value=""
                                                        onChange={(e) => handleTeamChange(match.id, 'team2_id', e.target.value)}
                                                        className="font-ffdin text-xs rounded border border-dashed border-zinc-400 focus:border-black focus:ring-black py-1 px-1.5 min-w-[150px] bg-white text-zinc-500"
                                                    >
                                                        <option value="">Assign Team 2</option>
                                                        {participantOptions.map((p) => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.player_1} / {p.player_2}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                            
                                            {/* Status Badge */}
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-ffdin font-bold rounded border ${getStatusColor(match.status)} whitespace-nowrap`}>
                                                <StatusIcon status={match.status} />
                                                {match.status.replace('_', ' ').toUpperCase()}
                                            </span>

                                            {/* Court Select */}
                                            <select
                                                value={match.court_id || ''}
                                                onChange={(e) => handleCourtChange(match.id, e.target.value)}
                                                className="font-ffdin text-xs rounded border border-zinc-300 focus:border-black focus:ring-black py-1 px-1.5 w-24"
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
                                                className="font-ffdin text-xs rounded border border-zinc-300 focus:border-black focus:ring-black py-1 px-1.5 w-36"
                                            />

                                            {/* Actions */}
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleStartMatch(match.id)}
                                                    className="p-1.5 text-white bg-black rounded hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                                    disabled={match.status === 'completed' || match.status === 'cancelled' || !match.court_id || !match.team1_id || !match.team2_id}
                                                    title={
                                                        !match.court_id
                                                            ? 'Assign court first'
                                                            : !match.team1_id || !match.team2_id
                                                                ? (!match.team1_template && !match.team1_id) || (!match.team2_template && !match.team2_id)
                                                                    ? 'Assign TBD team(s) first'
                                                                    : 'Resolve participants first'
                                                                : (match.status === 'in_progress' || match.status === 'upcoming' ? 'Open Match' : 'Start Match')
                                                    }
                                                >
                                                    <Play className="h-4 w-4" />
                                                </button>

                                                {(match.status === 'upcoming' || match.status === 'in_progress') && (
                                                    <button
                                                        onClick={() => handleResetMatch(match.id)}
                                                        className="p-1.5 text-white bg-orange-600 rounded hover:bg-orange-700 transition-all"
                                                        title="Reset match"
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleDeleteMatch(match.id)}
                                                    className="p-1.5 text-white bg-red-600 rounded hover:bg-red-700 transition-all"
                                                    title="Delete match"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
