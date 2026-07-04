/**
 * ResTextEditor - Consolidated Rich Text Editor Component
 *
 * Replaces TextEditor, RSKendoTextEditor patterns with a single props-driven API.
 * Toolbar features are controlled via variant presets, a features object, or explicit toolbar config.
 *
 * @example
 * <ResTextEditor
 *   defaultContent="<p>Hello</p>"
 *   variant="standard"
 *   onChange={(html) => console.log(html)}
 * />
 *
 * @example
 * // Inject a host-app upload tool
 * import CustomImageUpload from 'platform-specific-path';
 * <ResTextEditor imageUploadComponent={CustomImageUpload} />
 *
 * @example
 * // Or handle upload via callback (built-in file picker tool)
 * <ResTextEditor onImageUpload={({ view, file }) => insertImage(view, file)} />
 *
 * @example
 * <ResTextEditor
 *   variant="full"
 *   customToolbarActions={[Personalize, SmartLink]}
 * />
 */
import { useRef, useState, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { isNil as _isNil } from 'Utils/modules/lodashReplacements';
import { Editor, EditorUtils } from '@progress/kendo-react-editor';

import { EDITOR_CONFIG, editorClass, getToolbarIconConfig } from './config';
import { buildToolbar, resolveEditorFeatures, getPlainTextLength } from './utils';
import { createImageUploadTool } from './createImageUploadTool';
import { createInsertImageTool } from './createInsertImageTool';
import InsertLinkTool from './InsertLinkTool';
import FormatBlockTool from './FormatBlockTool';
import {
    useEditorIconReplacements,
    useCustomToolbarTooltips,
    useHyperlinkDialogEnhancements,
    useRemoveKendoButtonTitles,
    useIframeContentStyles,
    useResponsiveToolbar,
} from './hooks';

import './restexteditor.scss';

// ============================================================================
// ResTextEditor Component
// ============================================================================

const ResTextEditor = forwardRef(({
    value,
    defaultContent = '',
    onChange = () => {},
    onBlur = () => {},
    onFocus = () => {},
    variant = 'standard',
    features,
    toolbar,
    tools,
    placeholder = '',
    disabled = false,
    readOnly = false,
    height = 200,
    contentStyle,
    className = '',
    editorClassName = '',
    characterCount = false,
    maxLength,
    showHtmlPreview = false,
    imageUploadComponent,
    onImageUpload,
    customToolbarActions = [],
    validationError = '',
    required = false,
    responsiveToolbar = true,
    nativeControl = false,
    ...rest
}, ref) => {
    const wrapperRef = useRef(null);
    const editorRef = useRef(null);
    useImperativeHandle(ref, () => editorRef.current);
    const [internalHtml, setInternalHtml] = useState(defaultContent);
    const onMount = useIframeContentStyles();

    const isControlled = !_isNil(value);
    const currentHtml = isControlled ? value : internalHtml;

    const resolvedFeatures = useMemo(
        () => resolveEditorFeatures(variant, features),
        [variant, features],
    );

    const resolvedImageUploadTool = useMemo(() => {
        if (imageUploadComponent) return imageUploadComponent;
        if (typeof onImageUpload === 'function') {
            return createImageUploadTool(onImageUpload);
        }
        // Default: open the built-in InsertImageModal (URL + alt/title/size fields)
        return createInsertImageTool({ type: 'media' });
    }, [imageUploadComponent, onImageUpload]);

    const resolvedToolbar = useMemo(() => {
        const explicitToolbar = toolbar || tools;
        if (explicitToolbar) return explicitToolbar;

        return buildToolbar(resolvedFeatures, {
            imageUploadComponent: resolvedImageUploadTool,
            customToolbarActions,
        });
    }, [toolbar, tools, resolvedFeatures, resolvedImageUploadTool, customToolbarActions]);

    const includeColorTools =
        variant === 'full' || resolvedFeatures.foreColor || resolvedFeatures.backColor;
    const toolbarIconConfig = useMemo(
        () => getToolbarIconConfig(includeColorTools),
        [includeColorTools],
    );

    useEditorIconReplacements(wrapperRef, toolbarIconConfig);
    useCustomToolbarTooltips(wrapperRef);
    useHyperlinkDialogEnhancements();
    useRemoveKendoButtonTitles(wrapperRef);
    useResponsiveToolbar(
        responsiveToolbar && !className.includes('kendo-text-format'),
        EDITOR_CONFIG.className,
    );

    useEffect(() => {
        if (nativeControl || _isNil(value) || typeof value !== 'string') return;
        if (editorRef.current?.view) {
            EditorUtils.setHtml(editorRef.current.view, value);
        }
    }, [value, nativeControl]);

    const handleChange = useCallback(
        (e) => {
            const html = e.html ?? '';
            if (!isControlled) setInternalHtml(html);
            onChange(html, e);
        },
        [isControlled, onChange],
    );

    const handleBlur = useCallback(
        (e) => {
            const html = EditorUtils.getHtml(e.target.view.state);
            onBlur(html, e);
        },
        [onBlur],
    );

    const plainLength = useMemo(() => getPlainTextLength(currentHtml), [currentHtml]);
    const isOverLimit = maxLength != null && plainLength > maxLength;

    const mergedContentStyle = useMemo(
        () => ({
            height,
            ...contentStyle,
        }),
        [height, contentStyle],
    );

    const wrapperClasses = [
        EDITOR_CONFIG.className,
        className,
        disabled ? editorClass('disabled') : '',
        readOnly ? editorClass('readonly') : '',
        validationError || isOverLimit ? editorClass('error') : '',
        required ? editorClass('required') : '',
        disabled || readOnly ? 'click-off' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div ref={wrapperRef} className={wrapperClasses}>
            {placeholder && (
                <label className={`${editorClass('label')} ${validationError ? 'color-primary-red' : ''}`}>
                    {validationError || placeholder}
                </label>
            )}

            <Editor
                ref={editorRef}
                tools={resolvedToolbar}
                {...(nativeControl
                    ? { value, onChange }
                    : { defaultContent: isControlled ? value : defaultContent, onChange: handleChange })}
                contentStyle={mergedContentStyle}
                className={editorClassName}
                onBlur={handleBlur}
                onFocus={onFocus}
                onMount={onMount}
                {...rest}
            />

            {(characterCount || maxLength != null) && (
                <div className={editorClass('char-count')}>
                    <small className={isOverLimit ? 'color-primary-red' : ''}>
                        {plainLength}
                        {maxLength != null ? ` / ${maxLength}` : ' characters'}
                    </small>
                </div>
            )}

            {validationError && !placeholder && (
                <p className={`${editorClass('error-msg')} color-primary-red`}>{validationError}</p>
            )}

            {showHtmlPreview && (
                <div className={editorClass('html-preview')}>
                    <div className={editorClass('html-preview-header')}>HTML Preview</div>
                    <pre className={editorClass('html-preview-body')}>{currentHtml || ''}</pre>
                </div>
            )}
        </div>
    );
});

ResTextEditor.propTypes = {
    value: PropTypes.string,
    defaultContent: PropTypes.string,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    variant: PropTypes.oneOf(['basic', 'standard', 'full']),
    features: PropTypes.object,
    toolbar: PropTypes.array,
    tools: PropTypes.array,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    contentStyle: PropTypes.object,
    className: PropTypes.string,
    editorClassName: PropTypes.string,
    characterCount: PropTypes.bool,
    maxLength: PropTypes.number,
    showHtmlPreview: PropTypes.bool,
    imageUploadComponent: PropTypes.elementType,
    onImageUpload: PropTypes.func,
    customToolbarActions: PropTypes.array,
    validationError: PropTypes.string,
    required: PropTypes.bool,
    responsiveToolbar: PropTypes.bool,
    nativeControl: PropTypes.bool,
};

ResTextEditor.displayName = EDITOR_CONFIG.componentName;

export default ResTextEditor;
export { EDITOR_CONFIG, editorClass, createImageUploadTool, createInsertImageTool, InsertLinkTool, FormatBlockTool };
