export const LOADER_TYPE = Object.freeze({
    FIELD: 'field',
    GLOBAL: 'global',
    NONE: 'none',
});

export const DEFAULT_LOADER_CONFIG = Object.freeze({
    create: 'field',
    edit: 'global',
});

/** Create + edit both use field-level loaders (Preferences forms, modals, etc.). */
export const FIELD_BOTH_LOADER_CONFIG = Object.freeze({
    create: 'field',
    edit: 'field',
});

export const FIELD_LOADER_CONFIG = Object.freeze({
    create: 'field',
    edit: 'global',
});

export const NONE_LOADER_CONFIG = Object.freeze({
    create: 'none',
    edit: 'none',
});
