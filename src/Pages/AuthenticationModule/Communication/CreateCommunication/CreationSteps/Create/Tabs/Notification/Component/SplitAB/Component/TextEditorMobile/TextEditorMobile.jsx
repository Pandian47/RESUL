import { colorpicker_bg_medium, colorpicker_text_medium, user_question_mark_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import { EditorTools, ProseMirror } from '@progress/kendo-react-editor';
import { convert } from 'html-to-text';

import ResTextEditor from 'Pages/KendoDocs/CommonComponents/ResTextEditor';

import TimerIcon from '../TimerIcon/TimerIcon';
import ImageUpload from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Component/ImageUpload/ImageUpload';
import { useDispatch, useSelector } from 'react-redux';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import RSColorPicker from 'Components/ColorPicker';
import { useFormContext, useWatch } from 'react-hook-form';
import { uploadMobilePush } from 'Reducers/communication/createCommunication/Create/request';
import { getSessionId } from 'Reducers/globalState/selector';
import Personalize from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Component/Personalize';
const { Plugin, PluginKey, Decoration, DecorationSet, InputRule, inputRules } = ProseMirror;
export function placeholder(emptyMessage) {
    return new Plugin({
        key: new PluginKey('placeholder'),
        props: {
            decorations: (state) => {
                const { doc } = state;
                const empty = doc.textContent === '' && doc.childCount <= 1 && doc.content.size <= 2;
                if (!empty) {
                    return DecorationSet.empty;
                }
                const decorations = [];
                const decAttrs = {
                    class: 'placeholder',
                    'data-placeholder': emptyMessage,
                };
                doc.descendants((node, pos) => {
                    decorations.push(Decoration.node(pos, pos + node.nodeSize, decAttrs));
                });
                return DecorationSet.create(doc, decorations);
            },
        },
    });
}

export const styles = `p.placeholder:first-child:before {
        content: attr(data-placeholder);
        float: left;
        color: rgb(0, 0, 0, 0.5);
        cursor: text;
        height: 0;
    }`;

const { Bold, Italic, Underline, Strikethrough, FormatBlock, ForeColor, BackColor } = EditorTools;

const personalizationMobile = ({ handleChange }) => {
    const { personalization } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { control, setValue, watch, trigger } = useFormContext();
    const splitTest = useWatch({
        name: 'splitTest',
        control,
    });

    const { notification } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const editorTextName = splitTest ? `${notification?.mobile?.fieldNameIndex}.editorText` : 'editorText';

    const [editorText] = watch([editorTextName]);

    return (
        <RSBootstrapdown
            data={personalization}
            isObject
            fieldKey="personalizationKey"
            flatIcon
            defaultItem={{
                attributeName: '',
                dataAttributeId: 0,
                fallbackAttributeName: null,
                personalizationKey: <i className={`${user_question_mark_medium} icon-md`} />,
            }}
            showUpdate={false}
            className="no_caret"
            onSelect={({ personalizationKey }) => {
                const text = editorText || '';

                setValue(editorTextName, text + personalizationKey);

                trigger(editorTextName);
            }}
        />
    );
};

const backgroundColorMobile = ({ isSplit, fieldName }) => {
    const customizationName = isSplit ? `${fieldName}.customization` : 'customization';

    const { setValue } = useFormContext();
    return (
        <RSColorPicker
            icon={colorpicker_bg_medium}
            onSelect={(color) => setValue(`${customizationName}.background`, color)}
            initColor={customizationName?.background}
        />
    );
};

const textColorMobile = ({ isSplit, fieldName }) => {
    const customizationName = isSplit ? `${fieldName}.customization` : 'customization';

    const { setValue } = useFormContext();

    return (
        <RSColorPicker
            icon={colorpicker_text_medium}
            onSelect={(color) => setValue(`${customizationName}.background`, color)}
            initColor={customizationName?.background}
        />
    );
};

const ImageUploadMobile = () => {
    const dispatch = useDispatch();
    const { parentClientId, ...payload } = useSelector((state) => getSessionId(state));
    const { control, setValue, watch, trigger } = useFormContext();
    const splitTest = useWatch({
        name: 'splitTest',
        control,
    });
    const { notification } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const fieldName = `${notification?.mobile?.fieldNameIndex}`;
    // console.log('Field name ::::::::::::::::::::::: ');
    return (
        <ImageUpload
            contentType={'img'}
            isSplit={splitTest}
            fieldName={fieldName}
            channelType={'wpush'}
            isbase64={true}
            handleImageData={async (base64Image, fileName) => {
                // console.log('File name ::: ', base64Image, fileName, fieldName);
                if (fileName !== '' && base64Image !== '') {
                    let payloadData = {
                        base64Image,
                        imageFormat: fileName.split('.')?.[1],
                        contentLength: 123,
                        ...payload,
                    };

                    let { data, status } = await dispatch(uploadMobilePush({ payload: payloadData }));

                    if (status) {
                        if (splitTest) {
                            setValue(`${fieldName}.browserImage`, data);
                            setValue(`${fieldName}.previewImage`, data);
                        } else {
                            setValue('browserImage', data);
                            setValue(`previewImage`, data);
                        }
                    }
                }
            }}
        />
    );
};

const handleContentChange = (editorText, editorTextName, editorTextValue, smartLinkData, setValue, trigger) => {
    const text = editorText || '';
    if (editorTextValue.current === undefined) {
        setValue(editorTextName, text + smartLinkData);
    } else {
        var start = text.slice(0, editorTextValue?.current?.startPoistion);
        var end = text.slice(editorTextValue?.current?.endPosition);
        setValue(editorTextName, start + ' ' + smartLinkData + ' ' + end);
    }
    trigger(editorTextName);
};

const TextEditorMobile = ({
    isSplit,
    tools = [
        [Personalize, TimerIcon],
        [Bold, Italic, Underline, Strikethrough],
        [ForeColor, BackColor, ImageUploadMobile],
    ],
    onBlurHandler = () => {},
    onChange = () => {},
    fieldName,
    editValue,
    handleTextLength,
    // editable,
    // setEditable,
    onBlur = () => {},
    ...rest
}) => {
    const { control, setValue, watch, trigger } = useFormContext();
    const splitTest = useWatch({
        name: 'splitTest',
        control,
    });
    const editorTextName = splitTest ? `${fieldName}.editorText` : 'editorText';
    const editorTextLengthName = splitTest ? `${fieldName}.editorTextLength` : 'editorTextLength';
    const emojiTextName = splitTest ? `${fieldName}.emojiTextName` : 'emojiTextName';

    const editableRef = useRef();
    const editableToggle = useRef(true);
    const view = useRef(null);
    const [ab, setAb] = useState('');

    const [editorText, emojiText] = watch([editorTextName, emojiTextName]);
    const [editable, setEditable] = useState(false);
    useEffect(() => {
        if (view.current && editable) {
            view.current.updateState(view.current.state);
        }
    }, [editable]);

    const inputRule = (nodes) => {
        return inputRules({
            rules: [
                new InputRule(/^.{0,350}$/, (data, match, start, end) => {
                                        setAb(match?.[0]);
                    editableToggle.current = match?.[0];
                }),
            ],
        });
    };
    const onMount = (event) => {
        const state = event.viewProps.state;
        const plugins = [
            ...state.plugins,
          //  placeholder('{Your content goes here...}'),
            new Plugin({
                key: new PluginKey('readonly'),
                props: {
                    editable: () => editableToggle.current,
                },
                filterTransaction: (tr, _st) => editableToggle.current || !tr.docChanged,
            }),
            inputRule(state.schema.nodes),
            // new Plugin({
            //     key: new PluginKey('readonly'),
            //     props: {
            //         editable: () => editableToggle.current,
            //     },
            //     filterTransaction: (tr, _st) => editableToggle.current || !tr.docChanged,
            // }),
        ];
        const editorDocument = event.dom.ownerDocument;
        const styleElement = editorDocument && editorDocument.querySelector('style');
        if (styleElement) {
            styleElement.appendChild(editorDocument.createTextNode(styles));
        }
        return new ProseMirror.EditorView(
            {
                mount: event.dom,
            },
            {
                ...event.viewProps,
                state: ProseMirror.EditorState.create({
                    doc: state.doc,
                    plugins,
                }),
            },
        );
    };

    useEffect(() => {
        var html = editorText;
        var div = document.createElement('div');
        div.innerHTML = html;
        var text = div.textContent || div.innerText || '';
        // setAb(text);
        // editableRef.current = editorText;
    }, [editorText]);

    useEffect(() => {
        const iconTextBold = document.getElementsByClassName('k-i-bold');
        const iconTextitalic = document.getElementsByClassName('k-i-italic');
        const iconTextStrikethrough = document.getElementsByClassName('k-i-strikethrough');
        const iconTextSubscript = document.getElementsByClassName('k-i-subscript');
        const iconTextSuperscript = document.getElementsByClassName('k-i-superscript');
        const iconTextUnderline = document.getElementsByClassName('k-i-underline');
        const iconTextHyperlink = document.getElementsByClassName('k-i-link-horizontal');
        const iconTextLinkblink = document.getElementsByClassName('k-i-link-horizontal');
        const iconTextRemovehyperlink = document.getElementsByClassName('k-i-unlink-horizontal');
        const iconTextOrderedlist = document.getElementsByClassName('k-i-list-ordered');
        const iconTextUnorderedlist = document.getElementsByClassName('k-i-list-unordered');
        const iconTextAligntextleft = document.getElementsByClassName('k-i-align-left');
        const iconTextCentertext = document.getElementsByClassName('k-i-align-center');
        const iconTextAligntextright = document.getElementsByClassName('k-i-align-right');
        const iconTextJustify = document.getElementsByClassName('k-i-align-justify');

        [...iconTextBold].forEach((x) => {
            const element = [...x.classList];
            if (!element.includes('icon-rs-editor-bold-medium')) {
                x.className += ' icon-rs-editor-bold-medium icon-md';
            }
        });
        [...iconTextitalic].forEach((x) => {
            const element = [...x.classList];
            if (!element.includes('icon-rs-editor-italic-medium')) {
                x.className += ' icon-rs-editor-italic-medium icon-md';
            }
        });
        [...iconTextStrikethrough].forEach((x) => {
            const element = [...x.classList];
            if (!element.includes('icon-rs-editor-strikethrough-medium')) {
                x.className += ' icon-rs-editor-strikethrough-medium icon-md';
            }
        });
        [...iconTextSubscript].forEach((x) => {
            const element = [...x.classList];
            if (!element.includes('icon-rs-editor-sup-script-medium')) {
                x.className += ' icon-rs-editor-sup-script-medium icon-md';
            }
        });
        [...iconTextSuperscript].forEach((x) => {
            const element = [...x.classList];
            if (!element.includes('icon-rs-editor-super-script-medium')) {
                x.className += ' icon-rs-editor-super-script-medium icon-md';
            }
        });
        [...iconTextUnderline].forEach((x) => {
            const element = [...x.classList];
            if (!element.includes('icon-rs-editor-underline-medium')) {
                x.className += ' icon-rs-editor-underline-medium icon-md';
            }
        });
        [...iconTextHyperlink].forEach((x) => {
            const element = [...x.classList];
            if (!element.includes('icon-rs-editor-link-medium')) {
                x.className += ' icon-rs-editor-link-medium icon-md';
            }
        });
        [...iconTextLinkblink].forEach((x) => {
            const element = [...x.classList];
            if (!element.includes('icon-rs-editor-link-blink-medium')) {
                x.className += ' icon-rs-editor-link-blink-medium icon-md';
            }
        });
        [...iconTextRemovehyperlink].forEach((x) => {
            const element = [...x.classList];
            if (!element.includes('icon-rs-editor-remove-link-medium')) {
                x.className += ' icon-rs-editor-remove-link-medium icon-md';
            }
        });
        [...iconTextOrderedlist].forEach((x) => {
            const element = [...x.classList];
            if (!element.includes('icon-rs-editor-unoredred-numbers-list-medium')) {
                x.className += ' icon-rs-editor-unoredred-numbers-list-medium icon-md';
            }
        });
        [...iconTextUnorderedlist].forEach((x) => {
            const element = [...x.classList];
            if (!element.includes('icon-rs-editor-unoredred-list-medium')) {
                x.className += ' icon-rs-editor-unoredred-list-medium icon-md';
            }
        });
        [...iconTextAligntextleft].forEach((x) => {
            const element = [...x.classList];
            if (!element.includes('icon-rs-editor-align-left-medium')) {
                x.className += ' icon-rs-editor-align-left-medium icon-md';
            }
        });
        [...iconTextCentertext].forEach((x) => {
            const element = [...x.classList];
            if (!element.includes('icon-rs-editor-align-center-medium-medium')) {
                x.className += ' icon-rs-editor-align-center-medium icon-md';
            }
        });
        [...iconTextAligntextright].forEach((x) => {
            const element = [...x.classList];
            if (!element.includes('icon-rs-editor-align-right-medium')) {
                x.className += ' icon-rs-editor-align-right-medium icon-md';
            }
        });
        [...iconTextJustify].forEach((x) => {
            const element = [...x.classList];
            if (!element.includes('icon-rs-editor-align-justify-medium')) {
                x.className += ' icon-rs-editor-align-justify-medium icon-md';
            }
        });
    }, []);
    const handleToggleEdit = () => {
        setEditable(!editable);
        editableToggle.current = !editable;
    };

    return (
        <ResTextEditor
            tools={tools}
            height={200}
            defaultContent={editValue || ''}
            ref={editableRef}
            features={{ foreColor: true, backColor: true }}
            onChange={(html, e) => {
                const options = { wordwrap: false };
                const plainTextContent = convert(html, options);
                const textLength = plainTextContent?.length;

                if (textLength <= 350) {
                    onChange(html);
                    handleTextLength(textLength);
                } else {
                    e?.preventDefault?.();
                }
                setValue(editorTextLengthName, textLength);
            }}
            onMount={onMount}
            onPasteHtml={(e) => {
                const options = { wordwrap: false };
                const plainTextContent = convert(e.pastedHtml, options);
                return plainTextContent;
            }}
            onBlur={onBlur}
            {...rest}
        />
    );
};

export default TextEditorMobile;
