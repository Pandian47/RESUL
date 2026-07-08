import { EMOJI_REPRESENTATION } from 'Constants/GlobalConstant/Regex';

/** Coerce null/undefined to string without throwing. */
export function toSafeString(value, fallback = '') {
    if (value == null) return String(fallback);
    return String(value);
}

/** Lowercase coercion safe for lookup keys (ids, names). */
export function toSafeLowerCase(value, fallback = '') {
    return toSafeString(value, fallback).toLowerCase();
}

/**
 * Cleans API/display strings before truncation or rendering.
 * - Strips ASCII control chars (0–31, 127)
 * - Strips known malformed UTF-8 byte sequences (e.g. \x1F\x93)
 * - Collapses runs of asterisks to a single *
 * - Trims leading/trailing whitespace
 */
export function sanitizeDisplayText(value) {
    if (value == null || value === '') return value ?? '';

    return String(value)
        .replace(/\x1F\x93/g, '')
        .replace(/[\x00-\x1F\x7F]/g, '')
        .replace(/[*]{2,}/g, '*')
        .trim();
}

/** Dropdown/multiselect rows with blank labels should not render as empty list items. */
export function hasDropdownDisplayLabel(item, field) {
    if (item == null) return false;
    if (field) {
        const label = item && typeof item === 'object' ? item[field] : item;
        return label != null && String(label).trim() !== '';
    }
    if (typeof item === 'string') return item.trim() !== '';
    return true;
}

export function normalizeDisplayText(value) {
    if (typeof value !== 'string') return value;

    return value
        .replace(/├óΓé¼Γäó/g, "'")
        .replace(/├óΓé¼╦£/g, "'")
        .replace(/├óΓé¼┼ô/g, '"')
        .replace(/├óΓé¼┬¥/g, '"')
        .replace(/├óΓé¼ΓÇ£/g, '-')
        .replace(/├óΓé¼ΓÇ¥/g, '-')
        .replace(/├óΓé¼┬ª/g, '...')
        .replace(/ΓÇª/g, '...')
        .replace(/\u2026/g, '...')
        .replace(/├é /g, ' ')
        .replace(/├é/g, '')
        .replace(/^├óΓé¼(?=[A-Za-z0-9])/g, '')
        .trim();
}

export function maskEmailBeforeAt(email = '') {
    if (typeof email !== 'string' || !email.includes('@')) return email;
    const [localPart, domainPart] = email.split('@');
    if (!domainPart) return email;
    const maskKeepingFirstChar = (value = '') => {
        if (!value) return value;
        if (value.length === 1) return '*';
        return `${value[0]}${'*'.repeat(value.length - 1)}`;
    };

    const domainParts = domainPart.split('.');
    const topLevelDomain = domainParts.pop() || '';
    const maskedDomain = domainParts.map((part) => maskKeepingFirstChar(part)).join('.');
    const maskedLocalPart = maskKeepingFirstChar(localPart);

    return topLevelDomain ? `${maskedLocalPart}@${maskedDomain}.${topLevelDomain}` : `${maskedLocalPart}@${maskedDomain}`;
}

/**
 * Round-trips raw email/EDM HTML through the browser's HTML parser before handing it to
 * html-react-parser, so malformed markup (e.g. stray quote attributes) gets repaired, and
 * lowercase inline event handlers (onerror, onclick, ...) become the camelCase React expects.
 */
export function sanitizeEmailHtmlForPreview(html) {
    if (!html) return html;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.innerHTML
        .replace(/onerror/g, 'onError')
        .replace(/onload/g, 'onLoad')
        .replace(/onclick/g, 'onClick')
        .replace(/onmouseover/g, 'onMouseOver')
        .replace(/onmouseout/g, 'onMouseOut')
        .replace(/javascript:/g, '#');
}

export function removeTags(str) {
    if (str === null || str === '') return false;
    else str = str.toString();
    return str.replace(/(<([^>]+)>)/gi, '');
}
export function textFormatter(text) {
    if (!text || typeof text !== 'string') return '';

    // Handle empty string or whitespace-only strings
    if (text?.trim()?.length === 0) return text;

    try {
        let formatted = text;

        formatted = formatted?.replace(/^"|"$/g, '');
        formatted = formatted?.replace(/\\n/g, '\n');
        formatted = formatted?.replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) => {
            return String.fromCharCode(parseInt(grp, 16));
        });

        // Preserve HTML tags
        const htmlTags = [];
        let tagIndex = 0;
        formatted =
            formatted?.replace(/<(\/?)(\w+)([^>]*)>/g, (match) => {
                const placeholder = `ΓùåΓùåHTML${tagIndex}ΓùåΓùå`;
                htmlTags?.push({ placeholder, html: match });
                tagIndex++;
                return placeholder;
            }) || formatted;

        // Preserve personalization placeholders (text between square brackets)
        const personalizationPlaceholders = [];
        let personalizationIndex = 0;
        formatted =
            formatted?.replace(/\[([^\]]+)\]/g, (match) => {
                const placeholder = `ΓùåΓùåPERSONAL${personalizationIndex}ΓùåΓùå`;
                personalizationPlaceholders?.push({ placeholder, personalization: match });
                personalizationIndex++;
                return placeholder;
            }) || formatted;

        // Monospace / code (```text```)
        formatted = formatted?.replace(/```([\s\S]*?)```/g, '<code>$1</code>') || formatted;

        // Bold (*text*)
        formatted = formatted?.replace(/\*([^\*\n]+)\*/g, '<strong>$1</strong>') || formatted;

        // Italic (_text_) - matches single underscores with non-empty content between them
        // Must have at least one non-whitespace character
        formatted = formatted?.replace(/(^|[^_])_(\S[^_\n]*?)_($|[^_])/g, '$1<em>$2</em>$3') || formatted;

        // Strikethrough (~text~)
        formatted = formatted?.replace(/~([^~\n]+)~/g, '<s>$1</s>') || formatted;

        // Restore personalization placeholders
        personalizationPlaceholders?.forEach(({ placeholder, personalization }) => {
            if (formatted && placeholder && personalization) {
                formatted =
                    formatted?.replace(
                        new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                        personalization,
                    ) || formatted;
            }
        });

        // Restore HTML tags
        htmlTags?.forEach(({ placeholder, html }) => {
            if (formatted && placeholder && html) {
                formatted =
                    formatted?.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), html) ||
                    formatted;
            }
        });
        formatted = formatted.replace(/\n/g, '<br />');

        return formatted || text;
    } catch (error) {
        // Return original text if any error occurs
        return text;
    }
}


/** Converts API/DB field keys (camelCase, snake_case) to display title text. */
export function toTitleCase(fieldName) {
    if (!fieldName || typeof fieldName !== 'string') return fieldName;
    const normalized = fieldName.replace(/_/g, ' ');
    const result = normalized.replace(/([A-Z]+)([A-Z][a-z])|([a-z])([A-Z])/g, '$1$3 $2$4');

    const words = result.split(' ');

    const formattedWords = words.map((word, index) => {
        const isAbbreviation = /^[A-Z]{2,}$/.test(word);

        if (isAbbreviation) {
            return word.toUpperCase();
        }

        if (index === 0) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }

        return word.toLowerCase();
    });

    return formattedWords.join(' ');
}

export function formatFieldToTitle(fieldName) {
    const result = fieldName.replace(/([A-Z]+)([A-Z][a-z])|([a-z])([A-Z])/g, '$1$3 $2$4');

    const words = result.split(' ');

    const formattedWords = words.map((word, index) => {
        const isAbbreviation = /^[A-Z]{2,}$/.test(word);

        if (isAbbreviation) {
            return word.toUpperCase();
        }

        if (index === 0) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }

        return word.toLowerCase();
    });

    return formattedWords.join(' ');
}

export const stripEmojis = (text) => {
    if (typeof text !== 'string') return text;
    return text.replace(EMOJI_REPRESENTATION, '');
};

/** Parse JSON without throwing; returns fallback when input is empty or invalid. */
export function safeParseJSON(value, fallback = null) {
    if (value == null || value === '') return fallback;
    if (typeof value === 'object') return value;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

export const getListTypeName = (id) => {
    switch (String(id)) {
        case '1': return 'Ad-hoc List';
        case '2': return 'Match List';
        case '3': return 'Seed List';
        case '4': return 'Suppression List';
        case '5': return 'Target List';
        default: return 'NA';
    }
};
