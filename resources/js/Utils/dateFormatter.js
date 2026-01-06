export const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Handle various date formats from Laravel
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;
    
    // Format: "5 January 2026"
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC' // Prevent timezone issues with date-only values
    });
};

export const formatDateShort = (dateString) => {
    if (!dateString) return '';
    
    // Handle various date formats from Laravel
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;
    
    // Format: "5 Jan 2026"
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC' // Prevent timezone issues with date-only values
    });
};

