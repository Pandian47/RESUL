import { normalizeDisplayText, sanitizeDisplayText } from './stringUtils';

/** ASCII ellipsis — avoids UTF-8 mojibake (e.g. ΓÇª) from corrupted … literals in source files */
export const TRUNCATE_ELLIPSIS = '...';

/** Sanitize API text, fix mojibake ellipsis — run before truncateTitle / truncateString. */
export function prepareTextForTruncate(value) {
    if (value == null || value === '') return value ?? '';
    return normalizeDisplayText(sanitizeDisplayText(value));
}

/**
 * Truncate by grapheme count; total visible length (including ellipsis) never exceeds maxLength.
 */
export function truncateString(content, maxLength = 15) {
    if (content == null || content === '') return content ?? '';
    if (maxLength <= 0) return prepareTextForTruncate(content);

    const text = prepareTextForTruncate(content);
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const graphemes = Array.from(segmenter.segment(text), (s) => s.segment);

    if (graphemes.length <= maxLength) {
        return text;
    }

    const cutLength = Math.max(0, maxLength - TRUNCATE_ELLIPSIS.length);
    return graphemes.slice(0, cutLength).join('') + TRUNCATE_ELLIPSIS;
}

const TruncatedTextWithCopy = ({ text, maxLength = 15, className = '' }) => {
    if (!text || maxLength <= 0) return null;

    const truncatedText = truncateString(text, maxLength);

    const handleCopy = (e) => {
        e.clipboardData.setData('text/plain', text);
        e.preventDefault();
    };

    return (
        <span style={{ cursor: 'text' }} className={className} onCopy={handleCopy}>
            {truncatedText}
        </span>
    );
};

export function truncateTitle(content, number = 15, className = '') {
    if (content == null || content === '') return content ?? '';
    if (number <= 0) return prepareTextForTruncate(content);

    const text = prepareTextForTruncate(content);
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const graphemes = Array.from(segmenter.segment(text), (s) => s.segment);

    if (graphemes.length <= number) {
        return text;
    }

    return <TruncatedTextWithCopy text={text} maxLength={number} className={className} />;
}
