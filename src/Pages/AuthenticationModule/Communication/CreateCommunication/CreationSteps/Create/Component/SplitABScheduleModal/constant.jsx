function diff_weeks(dt2, dt1) {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60 * 60 * 24 * 7;
    return Math.abs(Math.round(diff));
}

function diff_hours(dt2, dt1) {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60 * 60;
    return Math.abs(Math.round(diff));
}

function diff_days(dt2, dt1) {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60 * 60 * 24;
    return Math.abs(Math.round(diff));
}

function diff_months(d1, d2) {
    let months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}

export const findTimeDiffernce = (type, sceduleDate, endDate) => {
    switch (type) {
        case 'Hour(s)':
            return diff_hours(sceduleDate, endDate);
        case 'Day(s)':
            return diff_days(sceduleDate, endDate);
        case 'Week(s)':
            return diff_weeks(sceduleDate, endDate);
        case 'Month(s)':
            return diff_months(sceduleDate, endDate);
        default:
            return diff_hours(sceduleDate, endDate);
    }
};
