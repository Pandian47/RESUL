/**
 * Design tokens for ResGrid list cards and detail channels.
 * Keep hex values in sync with src/Styles/abstarct/_variables.scss
 */

/** Communication status — $draft, $scheduled, $inprogress, … */
export const COMMUNICATION_STATUS_COLORS = {
    draft: '#b8b8b8',
    scheduled: '#f58332',
    inprogress: '#26ade0',
    play: '#99cc03',
    completed: '#379904',
    multiStatus: '#9b5faa',
    pause: '#a3cccc',
    alert: '#e5c553',
    stop: '#ef4c4e',
    archive: '#999999',
    extraction: '#69bec1',
    reject: '#f05455',
};

/** Channel / touchpoint — $email, $sms, $web-push, … */
export const CHANNEL_COLORS = {
    email: '#ff7415',
    sms: '#e5bc38',
    webPush: '#6db734',
    mobilePush: '#99cc03',
    whatsapp: '#25d366',
    vms: '#1877f2',
    web: '#6db734',
    rcs: '#f26b21',
    line: '#00c300',
    facebook: '#2d65f6',
    notification: '#f05455',
};

export default { COMMUNICATION_STATUS_COLORS, CHANNEL_COLORS };
