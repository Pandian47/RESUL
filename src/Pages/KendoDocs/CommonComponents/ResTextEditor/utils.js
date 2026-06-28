/**
 * ResTextEditor - Utilities
 */
import { EditorTools } from '@progress/kendo-react-editor';
import { VARIANT_PRESETS } from './config';
import InsertLinkTool from './InsertLinkTool';
import FormatBlockTool from './FormatBlockTool';

const {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Subscript,
    Superscript,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    OrderedList,
    UnorderedList,
    Unlink,
    InsertImage,
    FontName,
    FontSize,
    ForeColor,
    BackColor,
} = EditorTools;

/**
 * Merge variant preset with optional feature overrides.
 */
export const resolveEditorFeatures = (variant = 'standard', featuresOverride) => {
    const preset = VARIANT_PRESETS[variant] || VARIANT_PRESETS.standard;
    return { ...preset, ...(featuresOverride || {}) };
};

/**
 * Build Kendo toolbar groups from resolved feature flags.
 */
export const buildToolbar = (resolvedFeatures, options = {}) => {
    const { imageUploadComponent = null, customToolbarActions = [] } = options;
    const groups = [];

    if (resolvedFeatures.formatBlock) {
        groups.push(FormatBlockTool);
    }

    const formatGroup = [];
    if (resolvedFeatures.bold) formatGroup.push(Bold);
    if (resolvedFeatures.italic) formatGroup.push(Italic);
    if (resolvedFeatures.underline) formatGroup.push(Underline);
    if (resolvedFeatures.strikethrough) formatGroup.push(Strikethrough);
    if (resolvedFeatures.subscript) formatGroup.push(Subscript);
    if (resolvedFeatures.superscript) formatGroup.push(Superscript);
    if (formatGroup.length) groups.push(formatGroup);

    const styleGroup = [];
    if (resolvedFeatures.fontFamily) styleGroup.push(FontName);
    if (resolvedFeatures.fontSize) styleGroup.push(FontSize);
    if (resolvedFeatures.foreColor) styleGroup.push(ForeColor);
    if (resolvedFeatures.backColor) styleGroup.push(BackColor);
    if (styleGroup.length) groups.push(styleGroup);

    const linkGroup = [];
    if (resolvedFeatures.hyperlink) linkGroup.push(InsertLinkTool);
    if (resolvedFeatures.hyperlink) linkGroup.push(Unlink);
    if (resolvedFeatures.image) {
        linkGroup.push(imageUploadComponent || InsertImage);
    }
    if (linkGroup.length) groups.push(linkGroup);

    const listGroup = [];
    if (resolvedFeatures.orderedList) listGroup.push(OrderedList);
    if (resolvedFeatures.unorderedList) listGroup.push(UnorderedList);
    if (listGroup.length) groups.push(listGroup);

    const alignGroup = [];
    if (resolvedFeatures.alignment) {
        alignGroup.push(AlignLeft, AlignCenter, AlignRight, AlignJustify);
    }
    if (alignGroup.length) groups.push(alignGroup);

    if (customToolbarActions?.length) {
        groups.push(customToolbarActions);
    }

    return groups;
};

/**
 * Strip HTML tags for character counting.
 */
export const getPlainTextLength = (html = '') => {
    if (!html) return 0;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent || '').trim().length;
};
