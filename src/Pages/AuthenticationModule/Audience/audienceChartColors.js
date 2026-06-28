/**
 * Chart color tokens for the audience chunk — no colorsVariable barrel import (prod TDZ).
 * Mirrors Constants/GlobalConstant/Colors/colorsVariable.jsx values used in audience.
 */
export const AUDIENCE_CHART_COLORS = Object.freeze({
    ch_primary_green: '#5ba529',
    ch_secondary_green: '#99cc03',
    ch_clockchart1: '#98cc03',
    ch_clockchart2: '#b6d759',
    ch_primary_blue: '#0000ff',
    ch_dark_green: '#51a33c',
    ch_others: '#cccccc',
    ch_color1: '#19b3e2',
    ch_color2: '#8ecc16',
    ch_color3: '#f98638',
    ch_color4: '#f9c532',
    ch_color5: '#ff4d4d',
    ch_color6: '#16b5b5',
    ch_color7: '#ea1a9b',
    ch_color8: '#a51ad3',
    ch_color9: '#b5b1b5',
    insight_clock_neutral: '#e8e8ea',
    ch_email: '#ff7415',
    ch_sms: '#e5bc38',
    ch_web_push: '#6db734',
    ch_mobile_push: '#99cc03',
    ch_twitter: '#1D9BF0',
    ch_facebook: '#2d65f6',
    ch_zip_code: '#2a79c2',
    ch_gender: '#8921f7',
    ch_male: '#00acde',
    ch_female: '#c72079',
    ch_age: '#d982b7',
    ch_country: '#79b244',
});

export const AUDIENCE_OVERVIEW_CHART_COLORS = [
    AUDIENCE_CHART_COLORS.ch_color1,
    AUDIENCE_CHART_COLORS.ch_color2,
    AUDIENCE_CHART_COLORS.ch_color3,
    AUDIENCE_CHART_COLORS.ch_color4,
    AUDIENCE_CHART_COLORS.ch_color5,
    AUDIENCE_CHART_COLORS.ch_color6,
    AUDIENCE_CHART_COLORS.ch_color7,
    AUDIENCE_CHART_COLORS.ch_color8,
    AUDIENCE_CHART_COLORS.ch_color9,
];

export const INSIGHT_CLOCK_RANK_COLORS = [
    AUDIENCE_CHART_COLORS.ch_primary_green,
    AUDIENCE_CHART_COLORS.ch_secondary_green,
    AUDIENCE_CHART_COLORS.ch_clockchart1,
    AUDIENCE_CHART_COLORS.ch_clockchart2,
    AUDIENCE_CHART_COLORS.insight_clock_neutral,
];

const INSIGHT_LABEL_COLOR_MAP = Object.freeze({
    email: AUDIENCE_CHART_COLORS.ch_email,
    sms: AUDIENCE_CHART_COLORS.ch_sms,
    mobile: AUDIENCE_CHART_COLORS.ch_sms,
    webpush: AUDIENCE_CHART_COLORS.ch_web_push,
    'web push': AUDIENCE_CHART_COLORS.ch_web_push,
    'mobile push': AUDIENCE_CHART_COLORS.ch_mobile_push,
    whatsapp: AUDIENCE_CHART_COLORS.ch_mobile_push,
    facebook: AUDIENCE_CHART_COLORS.ch_facebook,
    x: AUDIENCE_CHART_COLORS.ch_twitter,
    twitter: AUDIENCE_CHART_COLORS.ch_twitter,
    male: AUDIENCE_CHART_COLORS.ch_male,
    female: AUDIENCE_CHART_COLORS.ch_female,
    gender: AUDIENCE_CHART_COLORS.ch_gender,
    age: AUDIENCE_CHART_COLORS.ch_age,
    country: AUDIENCE_CHART_COLORS.ch_country,
    'zip code': AUDIENCE_CHART_COLORS.ch_zip_code,
    zip: AUDIENCE_CHART_COLORS.ch_zip_code,
    others: AUDIENCE_CHART_COLORS.ch_others,
    unknown: AUDIENCE_CHART_COLORS.ch_others,
    'total delivered': AUDIENCE_CHART_COLORS.ch_color1,
    undelivered: AUDIENCE_CHART_COLORS.ch_color2,
    rejected: AUDIENCE_CHART_COLORS.ch_color3,
});

/** Audience insight series colors — no Constants/Charts/commonFunction import (prod TDZ). */
export const getAudienceInsightPalette = (values = []) => {
    const items = values.map((v) => ({ name: String(v?.label ?? v?.name ?? '') }));
    const tempColors = [];
    const absentIndexes = [];

    items.forEach((item, index) => {
        const key = item.name.toLowerCase();
        let color;
        if (item.name === 'Total delivered') {
            color = AUDIENCE_CHART_COLORS.ch_color1;
        } else if (item.name === 'Undelivered') {
            color = AUDIENCE_CHART_COLORS.ch_color2;
        } else if (item.name === 'Rejected') {
            color = AUDIENCE_CHART_COLORS.ch_color3;
        } else {
            color = INSIGHT_LABEL_COLOR_MAP[key];
        }
        if (color) tempColors.push(color);
        else absentIndexes.push(index);
    });

    if (absentIndexes.length) {
        const palette = [...AUDIENCE_OVERVIEW_CHART_COLORS];
        for (let i = 0; i < palette.length; i++) {
            if (tempColors.length === items.length) break;
            if (!tempColors.includes(palette[i])) {
                const insertAt = absentIndexes.shift();
                if (insertAt === undefined) break;
                tempColors.splice(insertAt, 0, palette[i]);
            }
        }
    }

    return tempColors;
};
