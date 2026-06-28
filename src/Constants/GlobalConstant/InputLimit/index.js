//INPUT LIMITS
const MAX_SMART_LINKS = 19;
/** Stable `id` for Smart Link `RSBootstrapdown` default toggle (must not be a React node — breaks row selection). */
const SMARTLINK_BOOTSTRAP_DROPDOWN_DEFAULT_ID = '__rs_smartlink_dd_default__';
const MAX_EMAIL = 100;
const MIN_EMAIL = 10;
const MIN_PASSWORD = 6;
const MAX_PASSWORD = 15;

// REGISTRATION
const MAX_LOGIN_OTP = 6;
const MAX_FIRST_NAME = 50;
const MAX_LAST_NAME = MAX_FIRST_NAME;
const MAX_PHONE = 18;
const MAX_TITLE = 5;

export {
    MAX_SMART_LINKS,
    SMARTLINK_BOOTSTRAP_DROPDOWN_DEFAULT_ID,
    MAX_EMAIL,
    MAX_PASSWORD,
    MIN_EMAIL,
    MIN_PASSWORD,
    MAX_LOGIN_OTP,
    MAX_TITLE,
    MAX_PHONE,
    MAX_LAST_NAME,
};
