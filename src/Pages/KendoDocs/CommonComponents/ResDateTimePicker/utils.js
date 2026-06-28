export const getDateTimePickerFormat = ({ is12Hour, dateFormat }) => {
    // 24-hour shows seconds (HH:mm:ss); 12-hour shows the AM/PM marker (hh:mm a)
    const timeSuffix = is12Hour ? ':hh:mm a' : ':HH:mm:ss';
    return `${dateFormat}${timeSuffix}`;
};

export const normalizeDateFormat = (dateFormat) => {
    if (!dateFormat) return 'MM-dd-yyyy';
    const lower = dateFormat.toLowerCase();
    if (lower.includes('mmm')) {
        return lower.replace(/mmm/g, 'MMM');
    }
    return lower.replace(/mm/g, 'MM');
};
