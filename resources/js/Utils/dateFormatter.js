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

export const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    
    // Handle various datetime formats from Laravel
    const date = new Date(dateTimeString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return dateTimeString;
    
    // Format: "31/01/2026, 12:40" in local timezone
    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

export const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    
    // Handle various datetime formats from Laravel
    const date = new Date(dateTimeString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return dateTimeString;
    
    // Format: "12:40" in local timezone
    return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

