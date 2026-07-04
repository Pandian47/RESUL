import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
/** Fixed line-height for overlay editor — must match _communication.scss $personalization-editor-line-height */
export const PERSONALIZATION_EDITOR_LINE_HEIGHT = '30px';

const PERSONALIZATION_REGEX = /\{\{([^}]*)\}\}|\{([^{}]*)\}|\[\[([^\]]*)\]\]/g;
const DOUBLE_BRACE_REGEX = /\{\{([^}]*)\}\}/g;
// Matches {content} only — negative lookbehind/ahead prevents matching {{content}}
const SINGLE_BRACE_REGEX = /(?<!\{)\{([^{}]*)\}(?!\})/g;

/**
 * Generates the innerHTML for the highlight backdrop div.
 *
 * CRITICAL — visual chip styling lives in _communication.scss (`.personalization-highlight`).
 * The mark uses `background-clip: content-box` with equal padding + negative margin so
 * the blue chip has a transparent gap next to braces without changing inline width.
 *
 * Do NOT add characters (&nbsp;, spaces) or extra DOM nodes here; anything not present
 * in the textarea value shifts line-breaks and misaligns the caret.
 */
export function getHighlightedHTML(text) {
    if (!text) return '';
    const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    // Group 1 = inner content of {{...}}, Group 2 = inner content of {...}, Group 3 = inner content of [[...]]
    // Only the inner content gets the highlight; delimiters stay as plain text.
    const highlighted = escaped.replace(
        PERSONALIZATION_REGEX,
        (match, doubleBraceContent, singleBraceContent, doubleSquareContent) => {
            if (doubleBraceContent !== undefined) {
                return `{{<mark class="personalization-highlight">${doubleBraceContent}</mark>}}`;
            }
            if (singleBraceContent !== undefined) {
                return `{<mark class="personalization-highlight">${singleBraceContent}</mark>}`;
            }
            if (doubleSquareContent !== undefined) {
                return `[[<mark class="personalization-highlight">${doubleSquareContent}</mark>]]`;
            }
            return match;
        },
    );

    return highlighted.replace(/\n/g, '<br>');
}

/**
 * Returns an array of range descriptors for every placeholder in `text`.
 *
 * @param {string} text
 * @param {'double'|'single'} braceType
 *   'double' (default) — matches {{...}} placeholders (WhatsApp / RCS)
 *   'single'           — matches {... } placeholders (SMS)
 *
 * Each descriptor:
 *   innerStart — index immediately after the opening delimiter(s)
 *   innerEnd   — max caret index inside inner content (after the last inner character)
 *   fullStart  — index of the first opening brace
 *   fullEnd    — index one past the last closing brace
 */
function collectPlaceholderRanges(text, regex, braceSize) {
    const ranges = [];
    const re = new RegExp(regex.source, 'g');
    let match;
    while ((match = re.exec(text)) !== null) {
        const innerContent = match[1] ?? '';
        ranges.push({
            fullStart: match.index,
            fullEnd: match.index + match[0].length,
            innerStart: match.index + braceSize,
            innerEnd: match.index + braceSize + innerContent.length,
        });
    }
    return ranges;
}

export function getPlaceholderRanges(text, braceType = 'double') {
    if (!text) return [];
    if (braceType === 'single') {
        return collectPlaceholderRanges(text, SINGLE_BRACE_REGEX, 1);
    }
    const ranges = [
        ...collectPlaceholderRanges(text, DOUBLE_BRACE_REGEX, 2),
        ...collectPlaceholderRanges(text, SINGLE_BRACE_REGEX, 1),
    ];
    ranges.sort((a, b) => a.fullStart - b.fullStart);
    return ranges.filter((range, index) => {
        if (index === 0) return true;
        return range.fullStart >= ranges[index - 1].fullEnd;
    });
}

const PERSONALIZATION_TOKEN_REGEX = /\[\[[^\]]*\]\]/;
const OFFER_CODE_TOKEN_REGEX = /\[(?:TEXT_|URL_|BAR_|QR_)?OFFER_CODE_[^\]]*\]/i;
const SMART_LINK_URL_REGEX = /https?:\/\/|resu\.io/i;
const TEMPLATE_PLACEHOLDER_INNER = /^#var#$/i;

export function isDefaultPlaceholder(innerContent = '') {
    const trimmed = (innerContent ?? '').trim();
    if (!trimmed) return true;
    if (/^\d+$/.test(trimmed)) return true;
    if (TEMPLATE_PLACEHOLDER_INNER.test(trimmed)) return true;
    return false;
}

/**
 * Classifies inner placeholder content.
 * @returns {'template'|'personalization'|'smartlink'}
 */
export function getPlaceholderContentType(innerContent = '') {
    const trimmed = (innerContent ?? '').trim();
    if (!trimmed || TEMPLATE_PLACEHOLDER_INNER.test(trimmed)) {
        return 'template';
    }
    if (PERSONALIZATION_TOKEN_REGEX.test(innerContent) || OFFER_CODE_TOKEN_REGEX.test(innerContent)) {
        return 'personalization';
    }
    if (
        SMART_LINK_URL_REGEX.test(innerContent) ||
        (/[/.]/.test(trimmed) && !/\s/.test(trimmed) && trimmed.length > 6)
    ) {
        return 'smartlink';
    }
    return 'personalization';
}

export function getPlaceholderInnerContent(text, range) {
    return text.slice(range.innerStart, range.innerEnd);
}

export function isInsidePlaceholderInner(text, selStart, selEnd, braceType = 'double') {
    const ranges = getPlaceholderRanges(text, braceType);
    return ranges.some((r) => selStart >= r.innerStart && selEnd <= r.innerEnd);
}

/**
 * Caret may sit inside any placeholder inner zone (including smart links).
 * Smart-link zones are read-only for keyboard input but accept toolbar targeting.
 */
export function isCaretAllowedPosition(text, selStart, selEnd, braceType = 'double') {
    const ranges = getPlaceholderRanges(text, braceType);
    if (ranges.length === 0) return true;

    return ranges.some((r) => selStart >= r.innerStart && selEnd <= r.innerEnd);
}

/**
 * Returns the placeholder range containing the selection, if any.
 */
export function getPlaceholderRangeAtSelection(text, selStart, selEnd, braceType = 'double') {
    const ranges = getPlaceholderRanges(text, braceType);
    return (
        ranges.find((r) => selStart >= r.innerStart && selEnd <= r.innerEnd) ??
        ranges.find((r) => selStart >= r.fullStart && selEnd <= r.fullEnd) ??
        null
    );
}

/**
 * Keyboard typing and deletion are allowed inside personalization/template placeholders.
 */
export function isKeyboardEditablePosition(text, selStart, selEnd, braceType = 'double') {
    const ranges = getPlaceholderRanges(text, braceType);
    if (ranges.length === 0) return true;

    const range = ranges.find((r) => selStart >= r.innerStart && selEnd <= r.innerEnd);
    if (!range) return false;

    const innerContent = getPlaceholderInnerContent(text, range);
    const type = getPlaceholderContentType(innerContent);
    if (type !== 'personalization' && type !== 'template') {
        return false;
    }

    if (isDefaultPlaceholder(innerContent)) {
        return true;
    }

    // Identify read-only ranges (tokens and delimiters) that must be protected.
    const readOnlyTokens = [];
    const pipeIdx = innerContent.indexOf('|');
    // Note: The pipe '|' fallback operator itself is not added to readOnlyTokens
    // to allow users to edit and delete the fallback separator/operator.

    const limit = pipeIdx !== -1 ? pipeIdx : innerContent.length;
    const zoneText = innerContent.slice(0, limit);
    const tokenRegexes = [
        /\[\[[^\]]*\]\]/g,
        /\[(?:TEXT_|URL_|BAR_|QR_)?OFFER_CODE_[^\]]*\]/ig
    ];
    for (const regex of tokenRegexes) {
        let match;
        while ((match = regex.exec(zoneText)) !== null) {
            const start = range.innerStart + match.index;
            const end = start + match[0].length;
            readOnlyTokens.push({ start, end });
        }
    }

    // A modification is blocked if the selection range overlaps/touches any read-only token
    const isBlocked = readOnlyTokens.some(
        (token) => selStart < token.end && selEnd > token.start,
    );

    return !isBlocked;
}

/**
 * Intercepts when the user types the pipe `|` operator on a selected personalization token.
 * Appends the pipe operator immediately after the token and places the cursor right after it.
 * Returns true if handled (and thus default behavior should be prevented), false otherwise.
 */
function tryInsertPipeAfterSelectedToken(ta, braceType = 'double') {
    const text = ta.value;
    const selStart = ta.selectionStart;
    const selEnd = ta.selectionEnd;

    const ranges = getPlaceholderRanges(text, braceType);
    const range = ranges.find((r) => selStart >= r.innerStart && selEnd <= r.innerEnd);
    if (!range) return false;

    const innerContent = getPlaceholderInnerContent(text, range);
    const pipeIdx = innerContent.indexOf('|');

    // Find personalization tokens in the zone before the pipe (or whole innerContent if no pipe)
    const limit = pipeIdx !== -1 ? pipeIdx : innerContent.length;
    const zoneText = innerContent.slice(0, limit);
    const tokenRegexes = [
        /\[\[[^\]]*\]\]/g,
        /\[(?:TEXT_|URL_|BAR_|QR_)?OFFER_CODE_[^\]]*\]/ig
    ];

    const tokens = [];
    for (const regex of tokenRegexes) {
        let match;
        while ((match = regex.exec(zoneText)) !== null) {
            const start = range.innerStart + match.index;
            const end = start + match[0].length;
            tokens.push({ start, end });
        }
    }

    // Check if selection overlaps/touches any personalization token
    const matchedToken = tokens.find(
        (token) => selStart < token.end && selEnd > token.start
    );

    if (matchedToken) {
        if (pipeIdx === -1) {
            const newValue = text.slice(0, matchedToken.end) + ' | ' + text.slice(matchedToken.end);
            const cursorPosition = matchedToken.end + 3; // Position cursor after the ' | '
            setNativeTextareaValue(ta, newValue);
            ta.setSelectionRange(cursorPosition, cursorPosition);
        } else {
            // If pipe exists, place cursor after the existing pipe and space
            const absolutePipePos = range.innerStart + pipeIdx;
            const hasSpaceAfterPipe = text.charAt(absolutePipePos + 1) === ' ';
            const cursorPosition = absolutePipePos + (hasSpaceAfterPipe ? 2 : 1);
            ta.setSelectionRange(cursorPosition, cursorPosition);
        }
        return true;
    }

    return false;
}

export function findPlaceholderRangeForInsert(text, selStart, selEnd, braceType = 'double') {
    const ranges = getPlaceholderRanges(text, braceType);
    if (!ranges.length) return -1;

    let idx = ranges.findIndex((r) => selStart >= r.innerStart && selEnd <= r.innerEnd);
    if (idx >= 0) return idx;

    idx = ranges.findIndex((r) => selStart >= r.fullStart && selEnd <= r.fullEnd);
    if (idx >= 0) return idx;

    let best = 0;
    let minDist = Infinity;
    ranges.forEach((r, i) => {
        const dist =
            selStart < r.fullStart
                ? r.fullStart - selStart
                : selStart > r.fullEnd
                    ? selStart - r.fullEnd
                    : 0;
        if (dist < minDist) {
            minDist = dist;
            best = i;
        }
    });
    return best;
}

/** Replaces entire inner content of a placeholder on first keyboard insert. */
export function buildPersonalizationReplaceOnType(text, range, insertedText) {
    const newValue =
        text.slice(0, range.innerStart) + insertedText + text.slice(range.innerEnd);
    return {
        value: newValue,
        newCursorPosition: range.innerStart + insertedText.length,
    };
}

const KEYBOARD_INSERT_INPUT_TYPES = new Set([
    'insertText',
    'insertCompositionText',
    'insertFromPaste',
    'insertFromDrop',
    'insertReplacementText',
]);

function isKeyboardInsertInputType(inputType) {
    return KEYBOARD_INSERT_INPUT_TYPES.has(inputType) || inputType?.startsWith('insert');
}

/** Updates a React-controlled textarea value and notifies RSTextarea / react-hook-form. */
function setNativeTextareaValue(ta, value) {
    const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
    )?.set;
    if (setter) {
        setter.call(ta, value);
    } else {
        ta.value = value;
    }
    ta.dispatchEvent(new Event('input', { bubbles: true }));
}

/** Replaces all inner content of a placeholder (smart link / personalization toolbar inserts). */
export function replacePlaceholderInner(text, rangeIndex, newContent, braceType = 'double') {
    const ranges = getPlaceholderRanges(text, braceType);
    const range = ranges[rangeIndex];
    if (!range) return null;

    const value = text.slice(0, range.innerStart) + newContent + text.slice(range.innerEnd);
    const newRanges = getPlaceholderRanges(value, braceType);
    const newRange = newRanges[rangeIndex];
    const newCursorPosition = newRange
        ? Math.min(newRange.innerStart + newContent.length, newRange.innerEnd)
        : range.innerStart + newContent.length;

    return { value, newCursorPosition };
}

/**
 * Builds inserted text at the current selection when it lies in an editable placeholder zone.
 * Returns null when insertion is not allowed.
 */
export function buildInsertAtEditableCursor(text, content, selStart, selEnd, braceType = 'double') {
    if (!isCaretAllowedPosition(text, selStart, selEnd, braceType)) {
        return null;
    }
    const ranges = getPlaceholderRanges(text, braceType);
    const hasPlaceholders = ranges.length > 0;
    const start = text.slice(0, selStart);
    const end = text.slice(selEnd);
    // Do not pad with spaces inside template placeholders — that pushes the caret past innerEnd.
    const spaceBefore = !hasPlaceholders && start.length > 0 ? ' ' : '';
    const spaceAfter = !hasPlaceholders && end.length > 0 ? ' ' : '';
    const inserted = start + spaceBefore + content + spaceAfter + end;
    let newCursorPosition = selStart + spaceBefore.length + content.length;

    if (hasPlaceholders) {
        const rangeIndex = ranges.findIndex(
            (r) => selStart >= r.innerStart && selEnd <= r.innerEnd,
        );
        const newRanges = getPlaceholderRanges(inserted, braceType);
        if (rangeIndex >= 0 && newRanges[rangeIndex]) {
            const { innerStart, innerEnd } = newRanges[rangeIndex];
            newCursorPosition = Math.min(Math.max(innerStart, newCursorPosition), innerEnd);
        }
    }

    return { value: inserted, newCursorPosition };
}

/**
 * Toolbar / emoji inserts into template placeholders.
 * Smart links and personalization tokens always replace the full inner content.
 */
export function buildProgrammaticInsert(
    text,
    content,
    selStart,
    selEnd,
    braceType = 'double',
    { isEmoji = false, isSmartLink = false } = {},
) {
    const ranges = getPlaceholderRanges(text, braceType);
    if (!ranges.length) {
        return buildInsertAtEditableCursor(text, content, selStart, selEnd, braceType);
    }

    const rangeIndex = findPlaceholderRangeForInsert(text, selStart, selEnd, braceType);
    if (rangeIndex < 0) return null;

    const range = ranges[rangeIndex];
    const inner = getPlaceholderInnerContent(text, range);
    const contentType = getPlaceholderContentType(inner);

    if (isSmartLink) {
        return replacePlaceholderInner(text, rangeIndex, content, braceType);
    }

    if (!isEmoji) {
        return replacePlaceholderInner(text, rangeIndex, content, braceType);
    }

    if (contentType === 'smartlink') {
        return null;
    }

    if (contentType === 'template') {
        return replacePlaceholderInner(text, rangeIndex, content, braceType);
    }

    const insertStart =
        selStart >= range.innerStart && selEnd <= range.innerEnd ? selStart : range.innerStart;
    const insertEnd =
        selStart >= range.innerStart && selEnd <= range.innerEnd ? selEnd : range.innerEnd;

    return buildInsertAtEditableCursor(text, content, insertStart, insertEnd, braceType);
}

function canInsertAtSelection(text, selStart, selEnd, braceType, { allowSmartLinkZone = true } = {}) {
    const ranges = getPlaceholderRanges(text, braceType);
    if (ranges.length === 0) {
        return true;
    }
    const rangeIndex = findPlaceholderRangeForInsert(text, selStart, selEnd, braceType);
    if (rangeIndex < 0) {
        return false;
    }
    if (allowSmartLinkZone) {
        return true;
    }
    const range = ranges[rangeIndex];
    return getPlaceholderContentType(getPlaceholderInnerContent(text, range)) !== 'smartlink';
}

/**
 * Returns true when a personalization / static toolbar insert is allowed at the selection.
 * Includes smart-link placeholders (insert replaces the link).
 */
export function canInsertPersonalizationIntoTextarea(textarea, braceType = 'double') {
    if (!textarea || document.activeElement !== textarea) {
        return false;
    }
    return canInsertAtSelection(
        textarea.value,
        textarea.selectionStart,
        textarea.selectionEnd,
        braceType,
        { allowSmartLinkZone: true },
    );
}

/**
 * Returns true when a smart-link toolbar insert is allowed at the selection.
 * Not allowed when the placeholder already contains a smart link.
 */
export function canInsertSmartLinkIntoTextarea(textarea, braceType = 'double') {
    if (!textarea || document.activeElement !== textarea) {
        return false;
    }
    return canInsertAtSelection(
        textarea.value,
        textarea.selectionStart,
        textarea.selectionEnd,
        braceType,
        { allowSmartLinkZone: true },
    );
}

/** Validates a saved selection (e.g. after toolbar focus) for personalization insert. */
export function canInsertPersonalizationAt(text, selStart, selEnd, braceType = 'double') {
    return canInsertAtSelection(text, selStart, selEnd, braceType, { allowSmartLinkZone: true });
}

/** Validates a saved selection for smart-link insert (not on an existing smart link). */
export function canInsertSmartLinkAt(text, selStart, selEnd, braceType = 'double') {
    return canInsertAtSelection(text, selStart, selEnd, braceType, { allowSmartLinkZone: true });
}

/** Returns true when an emoji may be inserted at a selection (not inside a smart-link placeholder). */
export function canInsertEmojiAt(text, selStart, selEnd, braceType = 'double') {
    const ranges = getPlaceholderRanges(text, braceType);
    if (ranges.length === 0) {
        return true;
    }

    const range = ranges.find((r) => selStart >= r.innerStart && selEnd <= r.innerEnd);
    if (!range) {
        return isCaretAllowedPosition(text, selStart, selEnd, braceType);
    }

    if (getPlaceholderContentType(getPlaceholderInnerContent(text, range)) === 'smartlink') {
        return false;
    }

    // Do not allow emoji insertion if keyboard editing is blocked at this position (e.g. inside read-only tokens)
    return isKeyboardEditablePosition(text, selStart, selEnd, braceType);
}

/** Returns true when an emoji may be inserted (not inside a smart-link placeholder). */
export function canInsertEmojiIntoTextarea(textarea, braceType = 'double') {
    if (!textarea || document.activeElement !== textarea) {
        return false;
    }
    return canInsertEmojiAt(
        textarea.value,
        textarea.selectionStart,
        textarea.selectionEnd,
        braceType,
    );
}

/**
 * Hook that restricts a textarea to editing only the inner content of
 * placeholders. All static text outside the delimiters is read-only.
 *
 * Uses native addEventListener on the editor container div so handlers fire
 * at element level with zero React delegation overhead — no typing latency.
 *
 * @param {'double'|'single'} braceType
 *   'double' (default) — {{...}} for WhatsApp / RCS
 *   'single'           — {...}  for SMS
 *
 * Usage:
 *   const { editorRef } = useRestrictedPlaceholderEdit();          // WA / RCS
 *   const { editorRef } = useRestrictedPlaceholderEdit('single');  // SMS
 *
 *   <div ref={editorRef} className="rs-textarea-editor ...">
 *     <div ref={backdropRef} ... />
 *     <RSTextarea ... />
 *   </div>
 *
 * Constraints enforced:
 *   • Personalization zones     — first keystroke replaces all inner text; then normal typing
 *   • Smart-link zones          — read-only for keyboard; toolbar personalization replaces link
 *   • Static template text      — read-only
 *   • Toolbar inserts           — replace full placeholder inner content
 *   • Navigation & copy         — always allowed
 *   • Click outside placeholder — textarea blurs; no caret snap or refocus
 */
export function useRestrictedPlaceholderEdit(braceType = 'double', onInsertionAllowedChange) {
    const editorRef = useRef(null);
    const insertionAllowedRef = useRef(false);
    const suppressBlurCheckRef = useRef(false);
    /** After the first replace in a focus session, further keys append normally. */
    const personalizationReplaceCompletedRef = useRef(false);

    const onInsertionAllowedChangeRef = useRef(onInsertionAllowedChange);
    useEffect(() => {
        onInsertionAllowedChangeRef.current = onInsertionAllowedChange;
    }, [onInsertionAllowedChange]);

    const setInsertionAllowed = useCallback((value) => {
        if (insertionAllowedRef.current !== value) {
            insertionAllowedRef.current = value;
            onInsertionAllowedChangeRef.current?.(value);
        }
    }, []);

    useEffect(() => {
        const container = editorRef.current;
        if (!container) return;

        const syncInsertionAllowed = (ta) => {
            setInsertionAllowed(canInsertPersonalizationIntoTextarea(ta, braceType));
        };

        const resetPersonalizationReplaceSession = () => {
            personalizationReplaceCompletedRef.current = false;
        };

        /** Re-arm replace-on-type when the user clicks into placeholder content. */
        const beginPersonalizationReplaceSession = (ta) => {
            const text = ta.value;
            const range = getPlaceholderRangeAtSelection(
                text,
                ta.selectionStart,
                ta.selectionEnd,
                braceType,
            );
            if (!range) return;

            const inner = getPlaceholderInnerContent(text, range);
            if (isDefaultPlaceholder(inner)) {
                personalizationReplaceCompletedRef.current = false;
            } else {
                personalizationReplaceCompletedRef.current = true;
            }
        };

        const applyTextareaValue = (ta, newValue, cursorPosition) => {
            setNativeTextareaValue(ta, newValue);
            ta.setSelectionRange(cursorPosition, cursorPosition);
        };

        const tryApplyPersonalizationReplaceOnInsert = (ta, insertedText) => {
            if (!insertedText || personalizationReplaceCompletedRef.current) {
                return false;
            }
            const text = ta.value;
            const { selectionStart, selectionEnd } = ta;
            if (!isKeyboardEditablePosition(text, selectionStart, selectionEnd, braceType)) {
                return false;
            }
            const range = getPlaceholderRangeAtSelection(
                text,
                selectionStart,
                selectionEnd,
                braceType,
            );
            if (!range) return false;

            const innerContent = getPlaceholderInnerContent(text, range);
            if (!isDefaultPlaceholder(innerContent)) {
                return false;
            }

            if (insertedText.trim() === '') {
                personalizationReplaceCompletedRef.current = true;
                return false;
            }

            const { value, newCursorPosition } = buildPersonalizationReplaceOnType(
                text,
                range,
                insertedText,
            );
            applyTextareaValue(ta, value, newCursorPosition);
            personalizationReplaceCompletedRef.current = true;
            return true;
        };

        const blurIfOutsideEditable = (ta) => {
            if (suppressBlurCheckRef.current) {
                return;
            }
            const ranges = getPlaceholderRanges(ta.value, braceType);
            if (ranges.length === 0) {
                syncInsertionAllowed(ta);
                return;
            }
            if (!isCaretAllowedPosition(ta.value, ta.selectionStart, ta.selectionEnd, braceType)) {
                setInsertionAllowed(false);
                ta.blur();
            } else {
                syncInsertionAllowed(ta);
            }
        };

        const handleTextareaInteraction = (e) => {
            if (!e.target.matches('textarea')) return;
            const ta = e.target;
            beginPersonalizationReplaceSession(ta);
            requestAnimationFrame(() => blurIfOutsideEditable(ta));
        };

        const handleTextareaMouseDown = (e) => {
            if (!e.target.matches('textarea')) return;
            const ta = e.target;
            queueMicrotask(() => beginPersonalizationReplaceSession(ta));
        };

        const handleKeyUpCheck = (e) => {
            if (!e.target.matches('textarea')) return;
            if (
                e.key.startsWith('Arrow') ||
                ['Home', 'End', 'PageUp', 'PageDown'].includes(e.key)
            ) {
                requestAnimationFrame(() => blurIfOutsideEditable(e.target));
            }
        };

        const handleFocusOut = (e) => {
            if (!e.target.matches('textarea')) return;
            const wrapper =
                container.closest('.rs-textarea-component-wrapper') ??
                container.parentElement;
            if (e.relatedTarget && wrapper?.contains(e.relatedTarget)) {
                return;
            }
            resetPersonalizationReplaceSession();
            setInsertionAllowed(false);
        };

        const handleFocusIn = (e) => {
            if (!e.target.matches('textarea')) return;
            const ta = e.target;
            beginPersonalizationReplaceSession(ta);
            requestAnimationFrame(() => blurIfOutsideEditable(ta));
        };

        const handleBeforeInput = (e) => {
            if (!e.target.matches('textarea')) return;
            if (e.inputType === 'historyUndo' || e.inputType === 'historyRedo') return;

            const ta = e.target;
            const text = ta.value;
            let checkStart = ta.selectionStart;
            let checkEnd = ta.selectionEnd;

            const insertedText = e.data ?? e.dataTransfer?.getData('text') ?? '';

            // Block curly braces only when caret is inside an existing placeholder
            if (/[{}]/.test(insertedText)) {
                if (isInsidePlaceholderInner(text, ta.selectionStart, ta.selectionEnd, braceType)) {
                    e.preventDefault();
                    return;
                }
            }

            // Intercept pipe character typed/inserted on a personalization selection
            if (insertedText === '|') {
                if (tryInsertPipeAfterSelectedToken(ta, braceType)) {
                    e.preventDefault();
                    return;
                }
            }

            if (isKeyboardInsertInputType(e.inputType)) {
                if (tryApplyPersonalizationReplaceOnInsert(ta, insertedText)) {
                    e.preventDefault();
                    return;
                }
            }

            // Extend the checked range by one for deletion operations so the
            // boundary test catches attempts to eat into the delimiter itself.
            if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteWordBackward') {
                checkStart = checkStart === checkEnd ? Math.max(0, checkStart - 1) : checkStart;
            } else if (e.inputType === 'deleteContentForward' || e.inputType === 'deleteWordForward') {
                checkEnd = checkStart === checkEnd ? checkEnd + 1 : checkEnd;
            }

            if (!isKeyboardEditablePosition(text, checkStart, checkEnd, braceType)) {
                e.preventDefault();
            }
        };

        // Secondary guard — defence-in-depth for environments where beforeinput
        // may not cancel reliably (some Android soft keyboards). Also handles
        // Ctrl+X / Ctrl+V and Backspace / Delete delimiter-boundary checks.
        const handleKeyDown = (e) => {
            if (!e.target.matches('textarea')) return;

            const ta = e.target;
            const text = ta.value;
            const selStart = ta.selectionStart;
            const selEnd = ta.selectionEnd;

            // Always allow navigation and modifier-only keys
            if (
                e.key.startsWith('Arrow') ||
                ['Home', 'End', 'PageUp', 'PageDown', 'Escape',
                    'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key) ||
                e.key.startsWith('F')
            ) return;

            // Ctrl / Cmd shortcuts
            if (e.ctrlKey || e.metaKey) {
                const k = e.key.toLowerCase();
                if (['a', 'c', 'z', 'y'].includes(k)) return; // copy, select-all, undo, redo
                if ((k === 'x' || k === 'v') && !isKeyboardEditablePosition(text, selStart, selEnd, braceType)) {
                    e.preventDefault();
                }
                return;
            }

            // Intercept pipe character typed/inserted on a personalization selection
            if (e.key === '|') {
                if (tryInsertPipeAfterSelectedToken(ta, braceType)) {
                    e.preventDefault();
                    return;
                }
            }

            if (isKeyboardEditablePosition(text, selStart, selEnd, braceType)) {
                if (e.key === '{' || e.key === '}') {
                    if (isInsidePlaceholderInner(text, selStart, selEnd, braceType)) {
                        e.preventDefault();
                        return;
                    }
                    return; // allow it in free text
                }
                if (e.key === 'Backspace') {
                    const checkStart = selStart === selEnd ? Math.max(0, selStart - 1) : selStart;
                    if (!isKeyboardEditablePosition(text, checkStart, selEnd, braceType)) {
                        e.preventDefault();
                    }
                    return;
                }
                if (e.key === 'Delete') {
                    const checkEnd = selStart === selEnd ? selEnd + 1 : selEnd;
                    if (!isKeyboardEditablePosition(text, selStart, checkEnd, braceType)) {
                        e.preventDefault();
                    }
                    return;
                }
                return;
            }

            e.preventDefault();
        };

        container.addEventListener('beforeinput', handleBeforeInput);
        container.addEventListener('keydown', handleKeyDown);
        container.addEventListener('mousedown', handleTextareaMouseDown);
        container.addEventListener('click', handleTextareaInteraction);
        container.addEventListener('mouseup', handleTextareaInteraction);
        container.addEventListener('focusin', handleFocusIn);
        container.addEventListener('focusout', handleFocusOut);
        container.addEventListener('keyup', handleKeyUpCheck);

        return () => {
            container.removeEventListener('beforeinput', handleBeforeInput);
            container.removeEventListener('keydown', handleKeyDown);
            container.removeEventListener('mousedown', handleTextareaMouseDown);
            container.removeEventListener('click', handleTextareaInteraction);
            container.removeEventListener('mouseup', handleTextareaInteraction);
            container.removeEventListener('focusin', handleFocusIn);
            container.removeEventListener('focusout', handleFocusOut);
            container.removeEventListener('keyup', handleKeyUpCheck);
        };
        // braceType is a string primitive passed at call-site; it never changes
        // after mount so empty deps is intentional and safe (no stale closure).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isInsertionAllowed = useCallback(
        () => insertionAllowedRef.current,
        [],
    );

    const getEditorTextarea = useCallback(() => {
        return editorRef.current?.querySelector('textarea.form-control') ?? null;
    }, []);

    /**
     * Restores focus and caret after programmatic inserts (emoji, personalization).
     * Waits for the DOM value to catch up with react-hook-form before validating position.
     */
    const restoreTextareaSelection = useCallback((ta, cursorPosition) => {
        if (!ta) return;

        const applySelection = () => {
            const value = ta.value;
            let pos = cursorPosition;
            const ranges = getPlaceholderRanges(value, braceType);

            if (ranges.length > 0) {
                const containing = ranges.find((r) => pos >= r.fullStart && pos <= r.fullEnd);
                if (containing) {
                    pos = Math.min(Math.max(containing.innerStart, pos), containing.innerEnd);
                } else if (!isCaretAllowedPosition(value, pos, pos, braceType)) {
                    return;
                }
            }

            suppressBlurCheckRef.current = true;
            ta.focus({ preventScroll: true });
            ta.setSelectionRange(pos, pos);
            setInsertionAllowed(canInsertPersonalizationIntoTextarea(ta, braceType));
            requestAnimationFrame(() => {
                suppressBlurCheckRef.current = false;
            });
        };

        requestAnimationFrame(() => {
            requestAnimationFrame(applySelection);
        });
    }, [braceType]);

    return { editorRef, isInsertionAllowed, getEditorTextarea, restoreTextareaSelection };
}

/**
 * Hook that wires up the personalization highlight backdrop for a textarea editor.
 *
 * Usage in JSX (inside the `.rs-textarea-editor` wrapper):
 *   const { backdropRef, syncBackdropScroll } = usePersonalizationHighlight();
 *
 *   <div ref={backdropRef} className="personalization-backdrop" aria-hidden="true"
 *        dangerouslySetInnerHTML={{ __html: getHighlightedHTML(editorText) }} />
 *   <RSTextarea ... onScroll={syncBackdropScroll} />
 */
export function usePersonalizationHighlight() {
    const backdropRef = useRef(null);

    const syncBackdropScroll = useCallback((e) => {
        if (backdropRef.current) {
            backdropRef.current.scrollTop = e.target.scrollTop;
        }
    }, []);

    const applyBackdropStyles = useCallback(() => {
        if (!backdropRef.current) return;
        const editor = backdropRef.current.closest('.rs-textarea-editor');
        if (!editor) return;
        const textarea = editor.querySelector('textarea.form-control');
        if (!textarea) return;

        const cs = window.getComputedStyle(textarea);
        const editorRect = editor.getBoundingClientRect();
        const taRect = textarea.getBoundingClientRect();
        const bd = backdropRef.current;

        bd.style.position = 'absolute';
        bd.style.top = `${taRect.top - editorRect.top}px`;
        bd.style.left = `${taRect.left - editorRect.left}px`;
        bd.style.width = `${textarea.clientWidth}px`;
        bd.style.height = `${textarea.clientHeight}px`;
        bd.style.fontFamily = cs.fontFamily;
        bd.style.fontSize = cs.fontSize;
        bd.style.lineHeight = PERSONALIZATION_EDITOR_LINE_HEIGHT;
        bd.style.letterSpacing = cs.letterSpacing;
        bd.style.wordSpacing = cs.wordSpacing;
        bd.style.padding = cs.padding;
        bd.style.boxSizing = cs.boxSizing;
        bd.style.overflow = 'hidden';
        bd.style.visibility = 'visible';
        bd.style.pointerEvents = 'none';
        bd.style.zIndex = 0;
    }, []);

    useLayoutEffect(() => {
        if (!backdropRef.current) return;
        const editor = backdropRef.current.closest('.rs-textarea-editor');
        if (!editor) return;

        editor.style.position = 'relative';

        applyBackdropStyles();

        const handleResize = () => applyBackdropStyles();
        window.addEventListener('resize', handleResize);

        let resizeObserver;
        const textarea = editor.querySelector('textarea.form-control');
        if (textarea && typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => applyBackdropStyles());
            resizeObserver.observe(textarea);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (resizeObserver) resizeObserver.disconnect();
        };
    }, [applyBackdropStyles]);

    return { backdropRef, syncBackdropScroll };
}
