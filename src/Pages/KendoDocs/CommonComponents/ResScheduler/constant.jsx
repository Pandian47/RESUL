// ResScheduler local constants — kept here so the component is self-contained
// and has no dependency on the global platform placeholder / error files.

// ── Labels / UI text ─────────────────────────────────────────────────────────
export const LABEL_SCHEDULE = 'Schedule';
export const LABEL_TIME_ZONE = 'Time zone';
export const LABEL_SELECT_SCHEDULE = 'Select date and time';
export const LABEL_SELECT_TIMEZONE = 'Select time zone';
export const LABEL_DAYLIGHT_SAVING = 'Daylight saving';
export const LABEL_USE_SEND_TIME_OPTIMIZATION = 'Use send time optimization';
export const LABEL_EDIT = 'Edit';
export const LABEL_CANCEL = 'Cancel';
export const LABEL_PROCEED = 'I agree & Proceed';

// ── Validation messages ───────────────────────────────────────────────────────
export const ERROR_SELECT_SCHEDULE = 'Select date and time';
export const ERROR_SELECT_TIMEZONE = 'Select time zone';

// ── Longer descriptive strings ────────────────────────────────────────────────
export const TEXT_ARE_YOU_SURE_REMOVE_SCHEDULED =
    'Are you sure you want to remove the scheduled time? If you have a multilevel channel, it will be deleted.';

export const TEXT_RESUL_AI_DETERMINE =
    "RESUL will optimize delivery time based on your audience's time propensities.";

export const TEXT_SEND_TIME_OPTIMIZATION = 'The send time optimization (STO)';

export const TEXT_THIS_COMMUNICATION_WILL_BE_SENT =
    'This communication will be sent within 24 hours from the scheduled time based on individual audience time propensities.';

export const TEXT_THIS_FEATURE_IS_NOT_RECOMMENDED =
    'This feature is not recommended for time-sensitive communications.';

export const TEXT_IF_QUIET_TIME =
    'If "Quiet Time" is enabled, send time optimization will be overulled. The communication will be sent once the period ends.';

// ── Icon class names ──────────────────────────────────────────────────────────
export const ICON_CIRCLE_QUESTION_MARK = 'icon-rs-circle-question-mark-mini';
export const ICON_PENCIL_EDIT = 'icon-rs-pencil-edit-mini';
export const ICON_CIRCLE_ARROW_RIGHT = 'icon-rs-circle-arrow-right-mini';
