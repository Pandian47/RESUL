
export const getDatepickerFormat = ({ timeFormat, dateFormat }) => {
    // / //if Time changes to 12 hrs format change HH to hh in the date format
    timeFormat = timeFormat === 1 ? ':HH:mm a' : ':hh:mm a';
    // dateFormat = _map(dateFormat.split('-'), (format) => (format !== 'MM' ? format.toLowerCase() : format)).join('-');
    // dateFormat = dateFormat.toLowerCase().replace('mm', 'MM');
    return `${dateFormat}${timeFormat}`;
};
