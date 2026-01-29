# Match Schedule Import Guide

## Overview
The Match Schedule Import feature allows you to:
- **Update existing matches** - Modify court assignments, dates, and times
- **Create new matches** - Automatically create matches that don't exist yet

This gives you complete flexibility to manage your tournament schedule using Excel.

## Two Ways to Use

### Method 1: Update Existing Matches (Recommended for Round-Robin)
Best for: Standard round-robin group play where every team plays every other team

1. Click **"Generate Matches"** to create all round-robin matches
2. Click **"Export Schedule"** to download current matches
3. Edit court, date, and time in Excel
4. Click **"Import Schedule"** to update

### Method 2: Create Custom Match Schedule (Flexible)
Best for: Custom match scheduling or partial schedules

1. Click **"Export Schedule"** or download the template
2. Add/edit rows with any team pairings you want
3. Click **"Import Schedule"** - matches will be created or updated automatically!

**Note**: Matches that already exist will be updated. New pairings will create new matches.

## How to Use

### Step 1: Get Your Template
1. Navigate to the Matches page for your category
2. Select the group phase you want to manage
3. Click the **"Export Schedule"** button (or "Template" if no matches exist)

### Step 2: Edit the Excel File
Open the downloaded Excel file and modify the schedule as needed:

#### Required Columns
- **Team 1**: First team identifier (see formats below)
- **Team 2**: Second team identifier (see formats below)
- **Court**: Court name or number (e.g., "Court 1", "1")
- **Date**: Match date (format: DD-MM-YYYY or YYYY-MM-DD, e.g., "31-01-2026" or "2026-01-30")
- **Time**: Match time (format: HH:MM, e.g., "09:00", "14:30")

#### Team Name Formats (Flexible)
You can use any of these formats for team names:
- **Team Name**: If participants have a team name (e.g., "Team A", "Eagles")
- **Player Names**: "Player1 / Player2" (e.g., "John Doe / Jane Smith")
- **Player Names (no space)**: "Player1/Player2" (e.g., "John Doe/Jane Smith")
- **Player Names (dash)**: "Player1 - Player2" (e.g., "John Doe - Jane Smith")

#### Important Notes
- **Team names are case-insensitive** (e.g., "team a" matches "Team A")
- **Court matching is flexible**: Use "1" or "Court 1" - both work
- **Date formats supported**: DD-MM-YYYY (31-01-2026) or YYYY-MM-DD (2026-01-30)
- **Time format**: HH:MM in 24-hour format (e.g., 09:00, 14:30, 18:45)
- Do not modify the header row
- Empty rows will be skipped

#### Example Excel Content

**Using Short Team Names (Perfect for your case!):**
```
Team 1 | Team 2 | Court | Date       | Time
A1     | A2     | 1     | 31-01-2026 | 12:40
A1     | A3     | 2     | 31-01-2026 | 13:30
A2     | A3     | 1     | 31-01-2026 | 14:20
```
✅ This will now work! If matches don't exist, they'll be created automatically.

**Using Full Team Names:**
```
Team 1    | Team 2    | Court   | Date       | Time
Team A    | Team B    | Court 1 | 31-01-2026 | 09:00
Eagles    | Hawks     | Court 2 | 31-01-2026 | 10:00
```

**Using Player Names:**
```
Team 1                  | Team 2                  | Court   | Date       | Time
John Doe / Jane Smith   | Bob Lee / Alice Wong    | Court 1 | 2026-01-30 | 09:00
Mike Chen / Sara Jones  | Tom Brown / Lisa White  | Court 2 | 2026-01-30 | 10:00
```

### Step 3: Import the Modified Schedule
1. Click the **"Import Schedule"** button
2. Select your modified Excel file
3. Review the confirmation dialog
4. Click OK to proceed with the import

## What the Import Does

### ✅ Creates or Updates
- **New matches**: If a match between two teams doesn't exist, it will be created
- **Court assignments**: Sets or updates the court for each match
- **Scheduled times**: Sets or updates the date and time for each match

### ❌ Does NOT Change
- **Match results**: Won't modify scores or completed matches
- **Team rosters**: Won't change player names in existing teams
- **Phase structure**: Won't create new phases or groups

## Error Handling
If there are errors during import, you'll see a message indicating:
- How many matches were successfully updated
- A list of errors (e.g., team not found, court not found, invalid date format)

Common errors:
- **"Team not found: [Team Name]"**: Team name doesn't match any participant in this category.
  - Solution: Check spelling, or use "Export Schedule" to see exact team names
  - The error message will show examples of valid team names
- **"Court not found: [Court Name]"**: Court name doesn't exist in your event.
  - Solution: Check Court Management, or use court number (1, 2, etc.)
  - The error message will show available court names
- **"Invalid date/time format"**: Date or time is not in the correct format.
  - Date must be: DD-MM-YYYY (e.g., 31-01-2026) or YYYY-MM-DD (e.g., 2026-01-30)
  - Time must be: HH:MM in 24-hour format (e.g., 09:00, 14:30)
- **"Failed to create match"**: Usually means teams are in different groups or invalid data.

## Tips
1. **For custom schedules**: Just create your Excel with team names, court, date, and time - matches will be created automatically!
2. **For team names**: Export once to see exact names (or use participant team names like "A1", "A2", etc.)
3. **Start simple**: Test with a few matches first to verify team names are correct
4. **Set up courts first**: Ensure all courts exist in Court Management before importing
5. **Use 24-hour time**: Format times as 14:00 instead of 2:00 PM
6. **Keep backups**: Save your Excel file before importing in case you need to make changes

## Troubleshooting

### Team names don't match
- Export the current schedule to see the exact format
- Team names can be:
  - The team name field (e.g., "Team A")
  - Player names: "FirstName LastName / FirstName LastName"
  - Case doesn't matter: "team a" matches "Team A"
- Check for typos or extra spaces

### Dates aren't being imported
- Use YYYY-MM-DD format (e.g., 2026-01-30)
- Excel may auto-format dates - check the cell format is "Text" or "Date"

### Times aren't being imported
- Use HH:MM format in 24-hour time (e.g., 09:00, 14:30)
- Don't include seconds or AM/PM
- Check cell format is "Text" or "Time"

## Technical Details
- Supported file formats: .xlsx, .xls
- Maximum file size: Depends on server configuration (typically 2-10MB)
- The import uses Laravel Excel (Maatwebsite/Excel) with PhpSpreadsheet
- All updates are performed in a database transaction for safety
