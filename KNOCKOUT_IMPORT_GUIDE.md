# Knockout Stage Import Guide

## Overview
The import feature supports automatic setup of knockout stages (Quarter Finals, Semi Finals, Finals) with templates that automatically resolve participants based on previous stage results.

## Your Tournament Structure
```
Group Stage (16 participants, 4 groups)
    ↓
Quarter Finals (8 teams: top 2 from each group)
    ↓
Semi Finals (4 teams: winners of QF)
    ↓
Final (2 teams: winners of SF)
```

## Excel Format Examples

### Quarter Finals (From Group Stage)

Create matches using group rankings:

```excel
Team 1        | Team 2        | Court   | Date       | Time
1st Group A   | 2nd Group B   | Court 1 | 01-02-2026 | 09:00
2nd Group A   | 1st Group B   | Court 2 | 01-02-2026 | 10:00
1st Group C   | 2nd Group D   | Court 1 | 01-02-2026 | 11:00
2nd Group C   | 1st Group D   | Court 2 | 01-02-2026 | 12:00
```

**What this does:**
- Creates 4 matches for Quarter Finals
- Each match has a template that says "get 1st place team from Group A" vs "get 2nd place team from Group B"
- When group stage completes, click "Resolve Participants" to fill in actual team names
- Court, date, and time are set immediately

### Semi Finals (From Quarter Finals)

Create matches using match winners:

```excel
Team 1          | Team 2          | Court   | Date       | Time
Winner Match 1  | Winner Match 2  | Court 1 | 08-02-2026 | 14:00
Winner Match 3  | Winner Match 4  | Court 2 | 08-02-2026 | 15:00
```

**What this does:**
- Creates 2 matches for Semi Finals
- "Winner Match 1" means the winner of the first Quarter Final match
- "Winner Match 2" means the winner of the second Quarter Final match
- After Quarter Finals complete, click "Resolve Participants" to fill in winners

### Final (From Semi Finals)

```excel
Team 1          | Team 2          | Court   | Date       | Time
Winner Match 1  | Winner Match 2  | Court 1 | 15-02-2026 | 16:00
```

## Template Format Options

### For Group Rankings
All these formats work (case-insensitive):
- `1st Group A`
- `Group A 1st`
- `2nd Group B`
- `Group B 2nd`
- `1st_group_A` (technical format, also accepted)

### For Match Winners
All these formats work:
- `Winner Match 1` (uses match order number)
- `Winner QF1` (Quarter Final 1)
- `Winner SF1` (Semi Final 1)
- `Winner Match 2`

## Step-by-Step Workflow

### Setup Quarter Finals

1. Navigate to Quarter Finals phase
2. Click "Template" or "Export Schedule"
3. Create Excel file:

```excel
Team 1        | Team 2        | Court | Date       | Time
1st Group A   | 2nd Group B   | 1     | 01-02-2026 | 09:00
2nd Group A   | 1st Group B   | 2     | 01-02-2026 | 10:00
1st Group C   | 2nd Group D   | 1     | 01-02-2026 | 11:00
2nd Group C   | 1st Group D   | 2     | 01-02-2026 | 12:00
```

4. Click "Import Schedule"
5. ✅ 4 matches created with templates!

### After Group Stage Completes

1. Go to Quarter Finals
2. Click "Resolve Participants" button
3. System automatically fills in:
   - 1st Group A → Actual team name (e.g., "Team Alpha")
   - 2nd Group B → Actual team name (e.g., "Team Beta")
4. Matches are now ready to play!

### Setup Semi Finals

1. Navigate to Semi Finals phase
2. Create Excel file:

```excel
Team 1          | Team 2          | Court | Date       | Time
Winner Match 1  | Winner Match 2  | 1     | 08-02-2026 | 14:00
Winner Match 3  | Winner Match 4  | 2     | 08-02-2026 | 15:00
```

3. Click "Import Schedule"
4. ✅ 2 matches created with winner templates!

### After Quarter Finals Complete

1. Go to Semi Finals
2. Click "Resolve Participants"
3. Winners from QF automatically fill in
4. Matches ready to play!

### Setup Final

Same process - use `Winner Match 1` and `Winner Match 2` for the two Semi Final matches.

## Important Notes

### Match Order Numbering
- Matches are numbered based on their `match_order` field
- "Match 1" = first match in that phase (by match_order)
- "Match 2" = second match in that phase
- When importing, matches are created in the order they appear in your Excel

### Court Assignment
- Can use court name: "Court 1", "Court 2"
- Can use court number: "1", "2"
- Both work!

### Date/Time Format
- Date: DD-MM-YYYY (e.g., 01-02-2026) or YYYY-MM-DD (e.g., 2026-02-01)
- Time: HH:MM in 24-hour format (e.g., 09:00, 14:30)

### Resolving Participants
- After previous stage completes, use "Resolve Participants" button
- This fills in actual team names based on templates
- You can also click it during/after matches to update progressively

## Complete Example: Your Tournament

### Quarter Finals Excel
```
Team 1        Team 2        Court  Date        Time
1st Group A   2nd Group B   1      01-02-2026  09:00
2nd Group A   1st Group B   1      01-02-2026  10:30
1st Group C   2nd Group D   2      01-02-2026  09:00
2nd Group C   1st Group D   2      01-02-2026  10:30
```

### Semi Finals Excel
```
Team 1         Team 2         Court  Date        Time
Winner Match 1 Winner Match 2 1      08-02-2026  14:00
Winner Match 3 Winner Match 4 1      08-02-2026  15:30
```

### Final Excel
```
Team 1         Team 2         Court  Date        Time
Winner Match 1 Winner Match 2 1      15-02-2026  16:00
```

## Troubleshooting

### "Invalid team template"
- Check spelling: "1st Group A" not "1 Group A"
- Check format: Use "1st", "2nd", "3rd", "4th"
- Group names must match: if groups are A, B, C, D, use those exact letters

### "Failed to create knockout match"
- Make sure the phase type is "knockout" not "group"
- Check that teams are valid (for direct team names)

### "Winner Match X" doesn't work
- Make sure previous phase has matches
- Match numbers start at 1
- Numbers refer to match_order in the previous phase

## Benefits of This System

✅ **Set up entire tournament at once** - One Excel import per stage
✅ **Automatic resolution** - Click one button to fill in winners
✅ **Flexible scheduling** - Set all dates/times/courts upfront
✅ **No manual entry** - No need to use the knockout match builder UI
✅ **Easy to modify** - Just re-import Excel if schedule changes

## Tips

1. **Create all stages first** - Set up QF, SF, Final phases in category settings
2. **Import in order** - Do Quarter Finals, then Semi Finals, then Final
3. **Don't resolve too early** - Wait until previous stage completes
4. **Export to verify** - After import, click "Export Schedule" to see what was created
5. **Test with one match** - Try importing one QF match first to verify format
