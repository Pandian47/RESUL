/**
 * ResTextEditor - Configuration
 * Dynamic naming configuration for the consolidated Text Editor component.
 *
 * Changing `prefix` or `componentName` here will automatically update:
 * - Component export name
 * - CSS class names
 * - Documentation route
 */

import {
    editor_super_script_medium,
    editor_sup_script_medium,
} from 'Constants/GlobalConstant/Glyphicons';

const EDITOR_NAME_CONFIG = {
    prefix: 'res',
    componentName: 'texteditor',
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const generateComponentName = ({ prefix, componentName }) =>
    `${capitalize(prefix)}${capitalize(componentName)}`;

const generateClassName = ({ prefix, componentName }) =>
    `${prefix.toLowerCase()}${componentName.toLowerCase()}`;

const generateDocRoute = ({ prefix, componentName }) =>
    `/docs/components/${prefix.toLowerCase()}${componentName.toLowerCase()}`;

export const editorClass = (modifier) => {
    const base = generateClassName(EDITOR_NAME_CONFIG);
    return modifier ? `${base}--${modifier}` : base;
};

export const EDITOR_CONFIG = {
    name: EDITOR_NAME_CONFIG,
    componentName: generateComponentName(EDITOR_NAME_CONFIG),
    className: generateClassName(EDITOR_NAME_CONFIG),
    docRoute: generateDocRoute(EDITOR_NAME_CONFIG),
    scssFileName: `${generateClassName(EDITOR_NAME_CONFIG)}.scss`,
};

export default EDITOR_CONFIG;

// ---------------------------------------------------------------------------
// Variant presets — toolbar feature sets
// ---------------------------------------------------------------------------

export const VARIANT_PRESETS = {
    basic: {
        bold: true,
        italic: true,
        underline: true,
        strikethrough: false,
        subscript: false,
        superscript: false,
        formatBlock: false,
        fontFamily: false,
        fontSize: false,
        foreColor: false,
        backColor: false,
        alignment: true,
        orderedList: true,
        unorderedList: true,
        hyperlink: true,
        image: false,
        emoji: false,
        personalization: false,
        smartLinks: false,
    },
    standard: {
        bold: true,
        italic: true,
        underline: true,
        strikethrough: true,
        subscript: false,
        superscript: false,
        formatBlock: false,
        fontFamily: false,
        fontSize: false,
        foreColor: false,
        backColor: false,
        alignment: true,
        orderedList: true,
        unorderedList: true,
        hyperlink: true,
        image: true,
        emoji: false,
        personalization: false,
        smartLinks: false,
    },
    full: {
        bold: true,
        italic: true,
        underline: true,
        strikethrough: true,
        subscript: true,
        superscript: true,
        formatBlock: true,
        fontFamily: true,
        fontSize: true,
        foreColor: true,
        backColor: true,
        alignment: true,
        orderedList: true,
        unorderedList: true,
        hyperlink: true,
        image: true,
        emoji: true,
        personalization: true,
        smartLinks: true,
    },
};

// ---------------------------------------------------------------------------
// Toolbar icon configuration (Kendo class → custom icon + tooltip)
// ---------------------------------------------------------------------------

// Kendo Editor toolbar icons: v15 may use k-svg-i-*; most app builds still render k-i-*.
// legacyClassName = class Kendo actually puts on the icon node (matches TextEditor / RSKendoTextEditor).
export const TOOLBAR_ICON_CONFIG = [
    { className: 'k-svg-i-bold', legacyClassName: 'k-i-bold', tooltipText: 'Bold', iconClass: 'icon-rs-editor-bold-medium' },
    { className: 'k-svg-i-italic', legacyClassName: 'k-i-italic', tooltipText: 'Italic', iconClass: 'icon-rs-editor-italic-medium' },
    { className: 'k-svg-i-underline', legacyClassName: 'k-i-underline', tooltipText: 'Underline', iconClass: 'icon-rs-editor-underline-medium' },
    { className: 'k-svg-i-strikethrough', legacyClassName: 'k-i-strikethrough', tooltipText: 'Strikethrough', iconClass: 'icon-rs-editor-strikethrough-medium' },
    { className: 'k-svg-i-sub-script', legacyClassName: 'k-i-subscript', buttonTitle: 'Subscript', tooltipText: 'Subscript', iconClass: editor_sup_script_medium },
    { className: 'k-svg-i-sup-script', legacyClassName: 'k-i-superscript', buttonTitle: 'Superscript', tooltipText: 'Superscript', iconClass: editor_super_script_medium },
    { className: 'k-svg-i-align-left', legacyClassName: 'k-i-align-left', tooltipText: 'Align left', iconClass: 'icon-rs-editor-align-left-medium' },
    { className: 'k-svg-i-align-center', legacyClassName: 'k-i-align-center', tooltipText: 'Align center', iconClass: 'icon-rs-editor-align-center-medium' },
    { className: 'k-svg-i-align-right', legacyClassName: 'k-i-align-right', tooltipText: 'Align right', iconClass: 'icon-rs-editor-align-right-medium' },
    { className: 'k-svg-i-align-justify', legacyClassName: 'k-i-align-justify', tooltipText: 'Justify', iconClass: 'icon-rs-editor-align-justify-medium' },
    { className: 'k-svg-i-list-ordered', legacyClassName: 'k-i-list-ordered', tooltipText: 'Ordered list', iconClass: 'icon-rs-editor-unoredred-numbers-list-medium' },
    { className: 'k-svg-i-list-unordered', legacyClassName: 'k-i-list-unordered', tooltipText: 'Unordered list', iconClass: 'icon-rs-editor-unoredred-list-medium' },
    { className: 'k-svg-i-link', legacyClassName: 'k-i-link-horizontal', tooltipText: 'Insert links', iconClass: 'icon-rs-editor-link-medium' },
    { className: 'k-svg-i-unlink', legacyClassName: 'k-i-unlink-horizontal', tooltipText: 'Remove link', iconClass: 'icon-rs-editor-remove-link-medium' },
    { className: 'k-svg-i-image', legacyClassName: 'k-i-image', tooltipText: 'Insert image', iconClass: 'icon-rs-editor-image-medium' },
];

/** Only used when ForeColor / BackColor tools are enabled (variant full or explicit features). */
export const COLOR_TOOLBAR_ICON_CONFIG = [
    { className: 'k-svg-i-foreground-color', legacyClassName: 'k-i-foreground-color', tooltipText: 'Text color', iconClass: 'icon-rs-editor-text-color-medium' },
    { className: 'k-svg-i-background', legacyClassName: 'k-i-background', tooltipText: 'Background color', iconClass: 'icon-rs-editor-background-color-medium' },
];

export const getToolbarIconConfig = (includeColorTools = false) =>
    includeColorTools ? [...TOOLBAR_ICON_CONFIG, ...COLOR_TOOLBAR_ICON_CONFIG] : TOOLBAR_ICON_CONFIG;

// ---------------------------------------------------------------------------
// Props metadata (for documentation page auto-generation)
// ---------------------------------------------------------------------------

export const PROPS_METADATA = [
    { name: 'value', type: 'String', default: '""', description: 'Controlled HTML content' },
    { name: 'defaultContent', type: 'String', default: '""', description: 'Initial HTML content (uncontrolled)' },
    { name: 'onChange', type: 'Function', default: '() => {}', description: 'Callback when editor content changes; receives HTML string' },
    { name: 'onBlur', type: 'Function', default: '() => {}', description: 'Callback on blur; receives HTML string' },
    { name: 'onFocus', type: 'Function', default: '() => {}', description: 'Callback when editor receives focus' },
    { name: 'variant', type: 'String', default: '"standard"', description: 'Toolbar preset: "basic", "standard", or "full"' },
    { name: 'features', type: 'Object', default: 'undefined', description: 'Feature flags to override variant preset toolbar items' },
    { name: 'toolbar', type: 'Array', default: 'undefined', description: 'Explicit Kendo toolbar configuration (overrides variant/features)' },
    { name: 'tools', type: 'Array', default: 'undefined', description: 'Alias for toolbar' },
    { name: 'placeholder', type: 'String', default: '""', description: 'Placeholder label shown above the editor' },
    { name: 'disabled', type: 'Boolean', default: 'false', description: 'Disables the editor' },
    { name: 'readOnly', type: 'Boolean', default: 'false', description: 'Read-only mode' },
    { name: 'height', type: 'Number|String', default: '200', description: 'Editor content area height' },
    { name: 'contentStyle', type: 'Object', default: '{ height: 200 }', description: 'Inline styles for the editor content area' },
    { name: 'className', type: 'String', default: '""', description: 'Additional CSS class on the wrapper' },
    { name: 'editorClassName', type: 'String', default: '""', description: 'CSS class applied directly to the Kendo Editor element' },
    { name: 'characterCount', type: 'Boolean', default: 'false', description: 'Show character count below the editor' },
    { name: 'maxLength', type: 'Number', default: 'undefined', description: 'Maximum character count (plain text length)' },
    { name: 'showHtmlPreview', type: 'Boolean', default: 'false', description: 'Show read-only HTML preview panel below the editor' },
    { name: 'imageUploadComponent', type: 'Component', default: 'undefined', description: 'Custom Kendo Editor toolbar tool for image upload (injected by the host app)' },
    { name: 'onImageUpload', type: 'Function', default: 'undefined', description: 'Callback when user selects an image: ({ view, file, files }) => void. Used to build a default upload tool when imageUploadComponent is not provided' },
    { name: 'customToolbarActions', type: 'Array', default: '[]', description: 'Custom toolbar tool components (Personalize, SmartLink, Emoji, etc.)' },
    { name: 'validationError', type: 'String', default: '""', description: 'Validation error message displayed below the editor' },
    { name: 'required', type: 'Boolean', default: 'false', description: 'Shows required indicator on the wrapper' },
    { name: 'responsiveToolbar', type: 'Boolean', default: 'true', description: 'Allow toolbar items to wrap on smaller viewports' },
];

export const FEATURE_MATRIX = [
    { feature: 'Rich Text Formatting', supported: true },
    { feature: 'Bold', supported: true },
    { feature: 'Italic', supported: true },
    { feature: 'Underline', supported: true },
    { feature: 'Strikethrough', supported: true },
    { feature: 'Font Family', supported: true },
    { feature: 'Font Size', supported: true },
    { feature: 'Text Color', supported: true },
    { feature: 'Background Color', supported: true },
    { feature: 'Text Alignment', supported: true },
    { feature: 'Ordered List', supported: true },
    { feature: 'Unordered List', supported: true },
    { feature: 'Hyperlink', supported: true },
    { feature: 'Image Upload', supported: true },
    { feature: 'Emoji Support', supported: true },
    { feature: 'Personalization Tags', supported: true },
    { feature: 'Smart Links', supported: true },
    { feature: 'Character Count', supported: true },
    { feature: 'Placeholder Support', supported: true },
    { feature: 'HTML Preview', supported: true },
    { feature: 'Read Only Mode', supported: true },
    { feature: 'Disabled State', supported: true },
    { feature: 'Validation Support', supported: true },
    { feature: 'Toolbar Customization', supported: true },
    { feature: 'Content Change Events', supported: true },
    { feature: 'Custom Toolbar Actions', supported: true },
    { feature: 'Responsive Layout', supported: true },
];
