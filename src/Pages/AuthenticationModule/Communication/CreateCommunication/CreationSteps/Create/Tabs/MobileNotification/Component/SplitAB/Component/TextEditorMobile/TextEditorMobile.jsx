import { useCallback, useEffect, useRef, useState } from 'react';
import { EditorTools, EditorUtils, ProseMirror } from '@progress/kendo-react-editor';
import { convert } from 'html-to-text';

import ResTextEditor from 'Pages/KendoDocs/CommonComponents/ResTextEditor';

import TimerIcon from '../TimerIcon/TimerIcon';
import ImageUpload from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Component/ImageUpload/ImageUpload';
import { useDispatch, useSelector } from 'react-redux';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { useFormContext, useWatch } from 'react-hook-form';
import { uploadMobilePush } from 'Reducers/communication/createCommunication/Create/request';
import { getSessionId } from 'Reducers/globalState/selector';
import Personalize from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Component/Personalize';
import { debounce } from 'Utils/modules/lodashReplacements';
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
            channelType={'mpush'}
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
    handleTextLength = () => {},
    disableMaxLengthWarning = false,
    onPasteError,
    // editable,
    // setEditable,
    ...rest
}) => {
    const { control, setValue, watch, trigger, setError } = useFormContext();
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
    const [showMaxLengthWarning, setShowMaxLengthWarning] = useState(false);
    const [pasteErrorMessage, setPasteErrorMessage] = useState('');

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
    const styles = `
    .k-content > p {
        margin:0;
    }`;
    const onMount = (event) => {
        const iframeDocument = event.dom.ownerDocument;
        const style = iframeDocument.createElement('style');
        style.appendChild(iframeDocument.createTextNode(styles));
        iframeDocument.head.appendChild(style);
        const state = event.viewProps.state;
        // Create a plugin to handle paste events
        const createPastePlugin = () => {
            return new Plugin({
                key: new PluginKey('pasteHandler'),
                props: {
                    handlePaste: (view, event, slice) => {
                                                const pastedText = event.clipboardData.getData('text/plain');
                                                
                        // Get current content from the editor view
                        const currentContent = view.state.doc.textContent;
                        const currentTextLength = currentContent?.length || 0;
                        const pastedTextLength = pastedText?.length || 0;
                        const newLength = currentTextLength + pastedTextLength;
                        
                                                
                        if (newLength > 350) {
                                                        if (!disableMaxLengthWarning) {
                                if (onPasteError) {
                                    onPasteError('Maximum limit exceeded');
                                } else {
                                    setPasteErrorMessage('Maximum limit exceeded');
                                    // Set error in react-hook-form
                                    setError(editorTextName, {
                                        type: 'custom',
                                        message: 'Maximum limit exceeded'
                                    });
                                }
                            } else {
                                setShowMaxLengthWarning(true);
                            }
                            return true; // Prevent the default paste behavior
                        }
                        
                        return false; // Allow normal paste behavior
                    }
                }
            });
        };

        const plugins = [
            ...state.plugins,
           // placeholder('{Your content goes here...}'),
            new Plugin({
                key: new PluginKey('readonly'),
                props: {
                    editable: () => editableToggle.current,
                },
                filterTransaction: (tr, _st) => editableToggle.current || !tr.docChanged,
            }),
            inputRule(state.schema.nodes),
            createPastePlugin(), // Add our paste handler plugin
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
        const iconBackground = document.getElementsByClassName('k-i-background');
        const iconForegroundcolor = document.getElementsByClassName('k-i-foreground-color');

        [...iconBackground].forEach((x) => {
            const element = [...x.classList];
            if (!element.includes('icon-rs-colorpicker-bg-medium')) {
                x.className += ' icon-rs-colorpicker-bg-medium icon-md';
            }
        });
        [...iconForegroundcolor].forEach((x) => {
            const element = [...x.classList];
            if (!element.includes('icon-rs-colorpicker-text-medium')) {
                x.className += ' icon-rs-colorpicker-text-medium icon-md';
            }
        });

        [...iconTextBold].forEach((x) => {
            const element = [...x.classList];
            if (!element.includes(' icon-rs-editor-bold-medium')) {
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
    const debouncedChangeHandler = useCallback(
        debounce((e) => {
            const maxLength = 350;
            const htmlContent = e?.html || '';
            const options = { wordwrap: false };
            const plainText = convert(htmlContent, options) || '';
            const textLength = htmlContent?.replace(/<[^>]+>/g, '')?.length || 0;
    
            if (textLength <= maxLength) {
                onChange(htmlContent);
                handleTextLength(textLength);
            } else {
                const truncatedText = plainText.slice(0, maxLength);
                const sanitizedHtml = `<p>${truncatedText}</p>`;
    
                onChange(sanitizedHtml);
                handleTextLength(maxLength);
            }
    
            setValue(editorTextLengthName, Math.min(textLength, maxLength));
        }, 300),
        [onChange, handleTextLength, setValue, editorTextLengthName]
    );
    

    useEffect(() => {
        return () => {
            debouncedChangeHandler.cancel();
        };
    }, [debouncedChangeHandler]);

    // useEffect(() => {
    //     if (view.current && editable) {
    //         view.current.updateState(view.current.state);
    //     }
    // }, [editable]);

    const [value, setValues] = useState(
        EditorUtils.createDocument(
            new ProseMirror.Schema({ nodes: EditorUtils.nodes, marks: EditorUtils.marks }),
            editValue
        )
    );
    const handleChange = (event) => {
        //debugger
        const htmlContent = event?.html;
        const textLength = htmlContent?.replace(/<[^>]+>/g, '')?.length || 0;
        if(textLength <= 350){
            setValues(event.value);
            debouncedChangeHandler(event)
        }
    };
        useEffect(() => {
                const applyFontToIframe = (iframe) => {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (!iframeDoc) return;
            
                    const styleTag = iframeDoc.createElement('style');
                    styleTag.innerHTML = `
                        body {
                            font-family: 'MuktaRegular', 'Mukta', sans-serif;
                        }
                    `;
                    iframeDoc.head.appendChild(styleTag);
                };
                const allFrameElList = document.querySelectorAll('.k-iframe');
                allFrameElList.forEach((iframe) => {
                    if (iframe.contentDocument?.readyState === 'complete') {
                        applyFontToIframe(iframe);
                    } else {
                        iframe.addEventListener('load', () => applyFontToIframe(iframe));
                    }
                });
            }, []);
    return (
        <>
            <ResTextEditor
                nativeControl
                value={value}
                ref={editableRef}
                onChange={handleChange}
                tools={tools}
                height={200}
                features={{ foreColor: true, backColor: true }}
                onMount={onMount}
                {...rest}
            />
            {showMaxLengthWarning && !disableMaxLengthWarning && !onPasteError && (
                <RSConfirmationModal
                    show={showMaxLengthWarning}
                    header="Content Too Long"
                    text={`The pasted content exceeds the maximum length of 350 characters. Please paste a shorter text or type manually.`}
                    primaryButtonText="OK"
                    handleClose={() => setShowMaxLengthWarning(false)}
                    handleConfirm={() => setShowMaxLengthWarning(false)}
                    secondaryButton={false}
                />
            )}
        </>
    );
};

export default TextEditorMobile;
