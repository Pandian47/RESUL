import { AUDIENCE_CHART_COLORS as C } from 'Pages/AuthenticationModule/Audience/audienceChartColors';
import { AUDIENCE_GLYPH as G } from 'Pages/AuthenticationModule/Audience/audienceGlyphs';
export const selectProfileIcon = (key) => {
    key = String(key ?? '').toLowerCase();
    if (key.includes('mail')) {
        return [G.email_medium, C.ch_email];
    }
    if (key.includes('mobile') || key === 'sms') {
        return [G.mobile_sms_medium, C.ch_sms];
    }
    if (key.includes('name')) {
        return [G.user_medium, C.ch_male];
    }
    if (key.includes('zip')) {
        return [G.zip_medium, C.ch_zip_code];
    }
    if (key.includes('facebook')) {
        return [G.social_facebook_medium, C.ch_facebook];
    }
    if (
        key.includes('city') ||
        key.includes('country') ||
        key.includes('state') ||
        key.includes('location') ||
        key.includes('address')
    ) {
        return ['', C.ch_country];
    }
    if (key.includes('amount')) {
        return [G.dollar_medium, '#fe5758'];
    }
    if (key.includes('age')) {
        return [G.age_medium, C.ch_age];
    }
    if (key.includes('gender')) {
        return ['icons', C.ch_gender];
    }
    if (key.includes('linkedin')) {
        return ['icons', ''];
    }
    if (key.includes('instagram')) {
        return [G.social_instagram_medium, ''];
    }
    if (key.includes('twitter')) {
        return [G.social_twitter_medium, C.ch_twitter];
    }
    if (key.includes('mobilenotifcation')) {
        return [G.mobile_notification_medium, C.ch_mobile_push];
    }
    if (key.includes('webnotifcation')) {
        return [G.web_notification_medium, C.ch_web_push];
    }
    return [G.custom_attributes_large, C.ch_others];
};
