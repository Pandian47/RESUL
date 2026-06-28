import { SMS_MESSAGE_PLACEHOLDER } from 'Constants/GlobalConstant/Placeholders';
import { useMemo, useRef } from 'react';
import { Controller } from 'react-hook-form';

import EmojiPicker from 'Components/EmojiPicker';
import { MAX_LENGTH500 } from 'Constants/GlobalConstant/Regex';

function adjustUtf16ToCodeUnitBoundary(str, i) {
    if (i <= 0 || i >= str.length) return Math.max(0, Math.min(i, str.length));
    let pos = i;
    const c = str.charCodeAt(pos);
    if (c >= 0xdc00 && c <= 0xdfff) {
        pos -= 1;
    }
    return Math.max(0, pos);
}

function snapUtf16ToGraphemeBoundary(str, utf16Offset, segmenter) {
    const n = str.length;
    let pos = Math.max(0, Math.min(utf16Offset, n));
    if (!str || pos === 0 || pos === n) return pos;
    if (!segmenter) return adjustUtf16ToCodeUnitBoundary(str, pos);

    for (const { segment, index } of segmenter.segment(str)) {
        const endIdx = index + segment.length;
        if (pos <= index) return index;
        if (pos < endIdx) {
            const distStart = pos - index;
            const distEnd = endIdx - pos;
            return distStart <= distEnd ? index : endIdx;
        }
    }
    return n;
}

function countGraphemes(str, segmenter) {
    const s = str ?? '';
    if (!s) return 0;
    if (segmenter) {
        let n = 0;
        for (const _ of segmenter.segment(s)) n += 1;
        return n;
    }
    return Array.from(s).length;
}

function sliceToMaxGraphemes(str, max, segmenter) {
    if (str == null || max == null) return str ?? '';
    if (max < 0) return '';
    if (segmenter) {
        let count = 0;
        let endIndex = 0;
        for (const { segment, index } of segmenter.segment(str)) {
            if (count >= max) break;
            endIndex = index + segment.length;
            count += 1;
        }
        return str.slice(0, endIndex);
    }
    const chars = Array.from(str);
    if (chars.length <= max) return str;
    return chars.slice(0, max).join('');
}

const TextEditor = ({
    name,
    control,
    rules = {},
    disabled = false,
    maxLength = MAX_LENGTH500,
    rows = 5,
    resize,
}) => {
    const cursorRef = useRef(null);
    const textareaRef = useRef(null);

    const segmenter = useMemo(() => {
        if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
            try {
                return new Intl.Segmenter(undefined, { granularity: 'grapheme' });
            } catch {
                return null;
            }
        }
        return null;
    }, []);

    const handleSelectionChange = (e) => {
        cursorRef.current = {
            start: e.target.selectionStart,
            end: e.target.selectionEnd,
        };
    };

    const insertAtCursor = (content, currentValue, onChange) => {
        const text = currentValue || '';
        let splitStart;
        let splitEnd;
        if (!cursorRef.current) {
            splitStart = text.length;
            splitEnd = text.length;
        } else {
            let { start, end } = cursorRef.current;
            if (start > end) [start, end] = [end, start];
            splitStart = snapUtf16ToGraphemeBoundary(text, start, segmenter);
            splitEnd = snapUtf16ToGraphemeBoundary(text, end, segmenter);
            if (splitStart > splitEnd) [splitStart, splitEnd] = [splitEnd, splitStart];
        }

        const before = text.slice(0, splitStart);
        const after = text.slice(splitEnd);
        const finalValue = before + content + after;
        const clipped = sliceToMaxGraphemes(finalValue, maxLength, segmenter);
        if (countGraphemes(clipped, segmenter) <= maxLength) {
            onChange(clipped);
            const caretAfterInsert = splitStart + content.length;
            const caret = Math.min(caretAfterInsert, clipped.length);
            requestAnimationFrame(() => {
                const ta = textareaRef.current;
                if (ta) {
                    ta.focus();
                    const safeCaret = snapUtf16ToGraphemeBoundary(clipped, caret, segmenter);
                    ta.setSelectionRange(safeCaret, safeCaret);
                    cursorRef.current = { start: safeCaret, end: safeCaret };
                }
            });
        }
    };

    const captureSelectionIfFocused = () => {
        const ta = textareaRef.current;
        if (ta && document.activeElement === ta) {
            cursorRef.current = {
                start: ta.selectionStart,
                end: ta.selectionEnd,
            };
        }
    };

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState: { error } }) => {
                const rawValue = field.value || '';
                const charCount = countGraphemes(rawValue, segmenter);

                const setRefs = (el) => {
                    textareaRef.current = el;
                    field.ref(el);
                };

                return (
                    <div className="rs-input-wrapper">
                        <div className="rs-textarea-component-wrapper position-relative">
                            <div className="rstcw-top-icons">
                                <ul
                                    className={`float-left ${
                                        disabled ? 'click-off pe-none' : ''
                                    }`}
                                >
                                    <li className="emoji-top">
                                        <EmojiPicker
                                            onOpen={captureSelectionIfFocused}
                                            onEmojiSelect={(e) => {
                                                const ta = textareaRef.current;
                                                if (ta && document.activeElement === ta) {
                                                    cursorRef.current = {
                                                        start: ta.selectionStart,
                                                        end: ta.selectionEnd,
                                                    };
                                                }
                                                insertAtCursor(e.native, field.value, field.onChange);
                                            }}
                                            isTextEditor
                                        />
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <textarea
                                    value={rawValue}
                                    name={field.name}
                                    ref={setRefs}
                                    onBlur={field.onBlur}
                                    rows={rows}
                                    disabled={disabled}
                                    className={`form-control rs-textarea${
                                        error ? ' rs-input-error' : ''
                                    }`}
                                    style={{
                                        fontFamily:
                                            'system-ui, "Segoe UI", "Segoe UI Emoji", "Segoe UI Symbol", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
                                        ...(resize != null ? { resize } : {}),
                                    }}
                                    placeholder={SMS_MESSAGE_PLACEHOLDER}
                                    onKeyUp={handleSelectionChange}
                                    onClick={handleSelectionChange}
                                    onSelect={handleSelectionChange}
                                    onChange={(e) => {
                                        const el = e.target;
                                        const next = sliceToMaxGraphemes(el.value, maxLength, segmenter);
                                        field.onChange(next);
                                        let caret = Math.min(el.selectionStart, next.length);
                                        caret = snapUtf16ToGraphemeBoundary(next, caret, segmenter);
                                        requestAnimationFrame(() => {
                                            const ta = textareaRef.current;
                                            if (ta) {
                                                ta.setSelectionRange(caret, caret);
                                                cursorRef.current = {
                                                    start: caret,
                                                    end: caret,
                                                };
                                            }
                                        });
                                    }}
                                />
                            </div>
                        </div>
                        {error?.message ? (
                            <div className="text-danger mt5 small" role="alert">
                                {error.message}
                            </div>
                        ) : null}
                        <div className="text-end mt5">
                            <small className="color-slate">
                                {charCount} / {maxLength}
                            </small>
                        </div>
                    </div>
                );
            }}
        />
    );
};

export default TextEditor;