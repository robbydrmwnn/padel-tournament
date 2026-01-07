# Excel Import Guide for Participants

## Overview
You can now import multiple participants at once using Excel files (.xlsx, .xls, or .csv).

## How to Use

### 1. Access Import Feature
1. Navigate to any Category
2. Click on "Participants"
3. Click the **"Import Excel"** button at the top right

### 2. Download Template
1. Click **"Download Excel Template"** 
2. This will download a pre-formatted Excel file with:
   - Proper column headers
   - Sample data showing the format
   - Styled headers for easy identification

### 3. Fill in Your Data

The Excel template contains these columns:

| Column Name | Required | Description | Example |
|------------|----------|-------------|---------|
| **player_1** | ✅ Yes | First player's name | John Doe |
| **player_2** | ✅ Yes | Second player's name | Jane Smith |
| **team_name** | ❌ No | Optional team name | Team Alpha |
| **email** | ❌ No | Contact email | john@example.com |
| **phone** | ❌ No | Contact phone | +1234567890 |
| **notes** | ❌ No | Additional notes | Sample team |

**Important:**
- `player_1` and `player_2` are **required** for each row
- Empty rows will be skipped automatically
- Keep the header row (first row) as is
- You can add as many rows as needed

### 4. Upload and Import
1. Click "Choose File" and select your filled Excel file
2. Click **"Import Participants"**
3. Wait for the import to complete

### 5. View Results
After import:
- ✅ **Success:** Green message showing successful import
- ⚠️ **Partial Success:** Yellow message with errors for specific rows
- ❌ **Error:** Red message if import completely failed

## Excel Format Example

```
| player_1   | player_2    | team_name  | email            | phone        | notes        |
|------------|-------------|------------|------------------|--------------|--------------|
| John Doe   | Jane Smith  | Team Alpha | john@example.com | +1234567890  | Sample team  |
| Mike Brown | Sarah Davis | Team Beta  | mike@example.com | +9876543210  |              |
| Tom Wilson | Amy Clark   |            | tom@example.com  |              | New players  |
```

## Validation Rules

The import validates each row:
- **player_1:** Required, max 255 characters
- **player_2:** Required, max 255 characters  
- **team_name:** Optional, max 255 characters
- **email:** Optional, must be valid email format, max 255 characters
- **phone:** Optional, max 255 characters
- **notes:** Optional, any length

## Error Handling

If there are validation errors:
1. The import will continue for valid rows
2. Invalid rows will be skipped
3. You'll see a detailed error message showing which rows failed
4. Fix the errors in your Excel file
5. Re-import (existing participants won't be duplicated)

## Tips

1. **Large Imports:** You can import hundreds of participants at once
2. **File Size:** Maximum file size is 2MB
3. **Supported Formats:** .xlsx, .xls, .csv
4. **UTF-8 Encoding:** Ensure your file uses UTF-8 for special characters
5. **Test First:** Try importing 2-3 rows first to verify format
6. **Backup:** The import doesn't delete existing data, only adds new participants

## Technical Details

**Implementation:**
- Uses Laravel Excel (maatwebsite/excel) package
- Powered by PhpSpreadsheet
- Row-by-row validation with error collection
- Transaction-safe (all or nothing per row)

**Performance:**
- Optimized for batch imports
- Can handle files with 1000+ rows
- Progress shown during import

## Troubleshooting

### Import Button Doesn't Work
- Check file format (.xlsx, .xls, or .csv)
- Verify file size is under 2MB
- Try using the template file as base

### "Invalid Email" Error
- Make sure email format is correct: name@domain.com
- Leave email column empty if not needed

### Missing Participants After Import
- Check for validation errors in the message
- Verify required fields (player_1, player_2) are filled
- Look at the partial success warning for details

### Template Download Not Working
- Check you have proper permissions
- Try refreshing the page
- Contact administrator if issue persists

## Support

For additional help:
1. Download the template to see correct format
2. Start with a small test file (2-3 rows)
3. Check error messages for specific issues
4. Verify all required fields are filled

---

**Last Updated:** 2026-01-06
**Version:** 1.0


