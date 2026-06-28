import { memo } from 'react';
import { Controller } from 'react-hook-form';
import _get from 'lodash/get';
import PropTypes from 'prop-types';
import { EditorTools } from '@progress/kendo-react-editor';

import ResTextEditor from 'Pages/KendoDocs/CommonComponents/ResTextEditor';
import ImageUpload from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs/Email/Component/ImageUpload/ImageUpload';

const {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    OrderedList,
    UnorderedList,
    Link,
    Unlink,
} = EditorTools;

const DEFAULT_TOOLS = [
    [Bold, Italic, Underline, Strikethrough],
    [Link, Unlink, ImageUpload],
    [OrderedList, UnorderedList],
    [AlignLeft, AlignCenter, AlignRight, AlignJustify],
];

const RSKendoTextEditor = ({
    control,
    name,
    defaultValue = '',
    rules = {},
    onChangeData = () => {},
    required,
    isOfferEditor = false,
    tools = DEFAULT_TOOLS,
    placeholder = '',
    className = '',
    customError = '',
    resTextEditorClassName = '',
    ...rest
}) => {
    const handleEditorClick = (event) => {
        const targetParent = event.target.closest("[title='Insert hyperlink']");
        if (targetParent) {
            setTimeout(() => {
                const fadeElement = document.querySelector('.fade.rs-modal.modal.show');
                if (fadeElement) {
                    fadeElement.style.display = 'none';
                }
            }, 300);
        }

        const button = event.target.closest('.k-button');
        const closeButton = event.target.closest('.k-i-x');

        if (button || closeButton) {
            const buttonText = button?.textContent?.trim?.() || '';
            if (buttonText === 'Cancel' || buttonText === 'Insert' || closeButton) {
                const fadeElement = document.querySelector('.fade.rs-modal.modal.show');
                if (fadeElement) {
                    fadeElement.style.display = 'block';
                }
            }
        }
    };

    return (
        <Controller
            control={control}
            name={name}
            defaultValue={defaultValue}
            rules={{
                validate: (value) =>
                    value === '<p></p>' ? 'Enter message' : customError ? customError : true,
                ...rules,
            }}
            render={({ field: { onChange, onBlur, value, ref, name: fieldName, ...restField }, fieldState: { error } }) => {
                const hasError = _get(error, 'message', '')?.length > 0;
                const initialHtml = value !== undefined && value !== null ? value : defaultValue;

                return (
                    <div
                        className={`${hasError ? 'errorContainer' : ''} rs-input-placeholder-wrapper rs-input-wrapper rs-input-wrapper-required ${className} kendo-text-editor`}
                        onClick={handleEditorClick}
                    >
                        <label>{hasError ? _get(error, 'message', '') : placeholder}</label>
                        <ResTextEditor
                            tools={tools}
                            value={initialHtml}
                            onChange={(html) => {
                                onChange(html);
                                onChangeData(html);
                            }}
                            onBlur={onBlur}
                            height={630}
                            className={` ${resTextEditorClassName} ${isOfferEditor ? 'offer-editor-wrap' : ''} `}
                            editorClassName="errorContainer"
                            responsiveToolbar={isOfferEditor}
                            required={required}
                            name={fieldName}
                            ref={ref}
                            {...restField}
                            {...rest}
                        />
                        {required && <div className="border-bottom-required" />}
                    </div>
                );
            }}
        />
    );
};

RSKendoTextEditor.propTypes = {
    control: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    defaultValue: PropTypes.string,
    rules: PropTypes.object,
    tools: PropTypes.array,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    className: PropTypes.string,
    customError: PropTypes.string,
    isOfferEditor: PropTypes.bool,
    onChangeData: PropTypes.func,
    resTextEditorClassName: PropTypes.string,
};

export default memo(RSKendoTextEditor);
