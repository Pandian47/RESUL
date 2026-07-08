import { statusIdCheck } from 'Utils/modules/campaignUtils';
import { getChannelId } from 'Utils/modules/communicationChannels';
import { MAX_LENGTH60 } from 'Constants/GlobalConstant/Regex';
import { ENTER_EDITOR_TEXT, ENTER_TITLE_TEXT } from 'Constants/GlobalConstant/ValidationMessage';
import { ANDROID, ENTER_LESS_THAN_350_CHARACTERS, IOS, PREVIEW, TITLE_TEXT } from 'Constants/GlobalConstant/Placeholders';
import { colorpicker_bg_medium, colorpicker_text_medium, editor_color_picker_medium, editor_timer_medium, user_question_mark_edge_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useFormContext, useWatch } from 'react-hook-form';
import { get as _get } from 'Utils/modules/lodashReplacements';

import RSTabber from 'Components/RSTabber';
import NotificationProvider from '../../context';
import RSEmojiPickerInput from 'Components/EmojiPickerInput';
import ImageUpload from '../../../../Component/ImageUpload/ImageUpload';
import EmojiPicker from 'Components/EmojiPicker';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import Preview from './Component/Preview/Preview';
import RSColorPicker from 'Components/ColorPicker';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';

import { EditorTools, EditorUtils } from '@progress/kendo-react-editor';

import { getSmartUrlDetailByChannel } from 'Reducers/communication/createCommunication/smartlink/request';
import useQueryParams from 'Hooks/useQueryParams';
import { uploadMobilePush, uploadWebPush } from 'Reducers/communication/createCommunication/Create/request';
import { getSmartLinksList } from 'Reducers/communication/createCommunication/smartlink/selectors';
import TimerModal from './Component/TimerModal/TimerModal';
import RSTooltip from 'Components/RSTooltip';
import TextEditorMobile from '../SplitAB/Component/TextEditorMobile/TextEditorMobile';
import Personalize from '../../../../Component/Personalize';
import InsertOffer from '../../../../Component/InsertOffer';
import { handlePersonalization } from '../../../../constant';
import { CustomForeColor } from './constant';
const { Bold, Italic, Underline, Strikethrough, FormatBlock, ForeColor, BackColor } = EditorTools;

const ImageUploadMobile = () => {
    const dispatch = useDispatch();
    const { parentClientId, ...payload } = useSelector((state) => getSessionId(state));
    const { control, setValue, watch, trigger } = useFormContext();
    const [showTooltip, setShowTooltip] = useState(false);
    const [suppressTooltip, setSuppressTooltip] = useState(false);
    const splitTest = useWatch({
        name: 'splitTest',
        control,
    });
    const { notification } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const fieldName = `${notification?.mobile?.fieldNameIndex}`;
    const [deliveryType, layoutPosition] = watch(['deliveryType', 'layoutPosition']);
    // console.log('Field name ::::::::::::::::::::::: ');
    return (
        <div
            onMouseEnter={() => {
                if (!suppressTooltip) {
                    setShowTooltip(true);
                }
            }}
            onMouseLeave={() => {
                setShowTooltip(false);
            }}
            onClick={() => {
                setShowTooltip(false);
                setSuppressTooltip(true);
                setTimeout(() => {
                    setSuppressTooltip(false);
                }, 500);
            }}
        >
            <RSTooltip text="Upload image" show={showTooltip} className="lh0">
                <ImageUpload
                    contentType={'img'}
                    isSplit={splitTest || layoutPosition?.id === 4}
                    fieldName={fieldName}
                    isbase64={true}
                    isCustomFormat
                    channelType={'mpush'}
                    isNotificationUpload={true}
                    isAlertPush={deliveryType?.id === 1}
                    setShowTooltip={setShowTooltip}
                    handleImageData={async (base64Image, fileName, contentLength) => {
                        // console.log('File name ::: ', base64Image, fileName, fieldName);
                        if (fileName !== '' && base64Image !== '') {
                            setSuppressTooltip(true);
                            let payloadData = {
                                base64Image,
                                imageFormat: fileName.split('.')?.[1],
                                contentLength,
                                ...payload,
                            };

                            let { data, status, message } = await dispatch(uploadMobilePush({ payload: payloadData }));

                            if (status) {
                                if (splitTest || layoutPosition?.id === 4) {
                                    setValue(`${fieldName}.browserImage`, data);
                                    setValue(`${fieldName}.previewImage`, data);
                                    setValue(`${fieldName}.uploadImage`, data);
                                    return { status: true, message: message };
                                } else {
                                    setValue('browserImage', data);
                                    setValue(`previewImage`, data);
                                    setValue(`uploadImage`, data);
                                    setShowTooltip(false);
                                    setTimeout(() => {
                                        setSuppressTooltip(false);
                                    }, 1000);
                                    return { status: true, message: message };
                                }
                            } else {
                                setSuppressTooltip(false);
                                return { status: false, message: message };
                            }
                        }
                    }}
                />
            </RSTooltip>
        </div>
    );
};

const EmojiPickerMobile = memo((props) => {
    const { view, onEditorMaxLen, maxLength = 350 } = props;
    const { control, setValue, watch, trigger, getValues } = useFormContext();
    const splitTest = useWatch({
        name: 'splitTest',
        control,
    });

    const { notification } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const editorTextName = splitTest ? `${notification?.mobile?.fieldNameIndex}.editorText` : 'editorText';
    const emojiTextName = splitTest ? `${notification?.mobile?.fieldNameIndex}.emojiTextName` : 'emojiTextName';

    const [editorText] = watch([editorTextName]);
    return (
        <EmojiPicker
            wrapperClass="text_editor_icon"
            onEmojiSelect={(e) => {
                const text = editorText || '';
                // let inputValue = EditorUtils.getHtml(e.target.view.state);
                // console.log(
                //     'Check details ::::::::::::::::::::::::::::: []]]]]]]]]]]]]]][[[[[[[[[[[[ ',
                //     e.native,
                //     props,
                // );
                const state = view.state;
                const tr = state.tr;
                const markType = state.schema.marks.style;
                const mark = markType.create({ class: 'emoji' });
                const currentText = state.doc.textContent || '';
                const currentLength = currentText.length;
                const contentText = ' ' + e?.native + ' ';
                const content = state.schema.text(contentText);
                if (currentLength + contentText?.length > maxLength) {
                    if (onEditorMaxLen) {
                        onEditorMaxLen(true)
                        setTimeout(() => {
                            onEditorMaxLen(false)
                        }, 3000)
                    }
                    return;
                }
                tr.addStoredMark(mark);
                tr.replaceSelectionWith(content, true);
                view.dispatch(tr);
                // let temp = !!getValues(emojiTextName) ? [getValues(emojiTextName), e?.native]?.flat() : [e?.native];
                // // setValue(emojiTextName, temp);
                // // setValue(editorTextName, text + e?.native);

                // trigger(editorTextName);
            }}
            isTextEditor={true}
        />
    );
});
const Create = ({ isSplit, fieldName }) => {
    const mobileNotificationEditorMaxLength = 350;
    const inputRef = useRef();
    const location = useQueryParams('/communication');
    const { notification } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);

    const { type } = useContext(NotificationProvider);
    const [timer, setTimer] = useState(false);
    const [editorTextLenghtMobile, setEditorTextLengthMobile] = useState(0);
    const [pasteErrorMessage, setPasteErrorMessage] = useState('');
    const [maxLengthError, setMaxLengthError] = useState('');
    const [editorMaxLenError, setEditorMaxLenError] = useState(false);
    // const [editable, setEditable] = useState(false);
    const [mobileStyles, setMobileStyles] = useState({
        boldClick: false,
        italicClick: false,
        underlineClick: false,
        strikeClick: false,
    });
    const [selectedPreviewTab, setSelectedPreviewTab] = useState('andriod')
    const { personalization, listTypeWisePersonlization } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const smartLinks = useSelector((state) => getSmartLinksList(state));
    const { parentClientId, ...payload } = useSelector((state) => getSessionId(state));
    const dispatch = useDispatch();
    const campaign = {
        campaignId: _get(location, 'campaignId', 0),
        campaignType: _get(location, 'campaignType', 'S'),
    };
    const splitObj = {
        0: 'A',
        1: 'B',
        2: 'C',
        3: 'D',
        4: 'E',
    };

    const {
        control,
        setValue,
        watch,
        trigger,
        setFocus,
        resetField,
        clearErrors,
        getValues,
        formState: { errors },
        setError,
    } = useFormContext();

    const titleName = isSplit ? `${fieldName}.title.text` : 'title.text';
    const colorPickerName = isSplit ? `${fieldName}.title.fontColor` : 'title.fontColor';
    const editorTextName = isSplit ? `${fieldName}.editorText` : 'editorText';
    const previewImageName = isSplit ? `${fieldName}.previewImage` : 'previewImage';
    const previewVideoName = isSplit ? `${fieldName}.previewImage_video` : 'previewImage_video';

    const uploadImageName = isSplit ? `${fieldName}.uploadImage` : 'uploadImage';

    const titleTextName = isSplit ? `${fieldName}.title` : 'title';
    const interactivityName = isSplit ? `${fieldName}.interactivity` : 'interactivity';
    const buttonTextName = isSplit ? `${fieldName}.buttonText` : 'buttonText';
    const customizationName = isSplit ? `${fieldName}.customization` : 'customization';
    const subtitleTextName = isSplit ? `${fieldName}.subtitleText` : 'subtitleText';
    const timerEnabledName = isSplit ? `${fieldName}.timerEnabled` : 'timerEnabled';
    const timerName = isSplit ? `${fieldName}.timer` : 'timer';
    const remainingTimeName = isSplit ? `${fieldName}.remainingTime` : 'remainingTime';
    const timerTextColorName = isSplit ? `${fieldName}.timerTextColor` : 'timerTextColor';
    const timerBgColorName = isSplit ? `${fieldName}.timerBgColor` : 'timerBgColor';
    const editorTextLengthName = isSplit ? `${fieldName}.editorTextLength` : 'editorTextLength';

    const [
        previewImage,
        previewVideo,
        title,
        editorText,
        interactivity,
        customization,
        splitTest,
        currentSplitTab,
        channelType,
        deliveryType,
        layoutPosition,
        timerEnabled,
        subtitle,
        remainingTime,
        timerBgColor,
        timerTextColor,
        editorTextLength,
        mobileApp,
    ] = watch([
        previewImageName,
        previewVideoName,
        titleTextName,
        editorTextName,
        interactivityName,
        customizationName,
        'splitTest',
        'currentSplitTab',
        'channelType',
        'deliveryType',
        'layoutPosition',
        timerEnabledName,
        subtitleTextName,
        remainingTimeName,
        timerBgColorName,
        timerTextColorName,
        editorTextLengthName,
        'mobileApp',
    ]);
    // console.log('Customization :::: ', customization);
    const buttonText = useWatch({
        name: buttonTextName,
        control,
    });

    const handleSelectionChange = (e) => {
        inputRef.current = {
            startPoistion: e.target.selectionStart,
            endPosition: e.target.selectionEnd,
        };
    };

    const handleChange = async (smartLinkData, type) => {
        // console.log('DAta ::::::::::::: ', smartLinkData, channelType, type, smartLinkData?.length);
        if (type === 'dynamic') {
            let goalValue = 0,
                blastValue = 1,
                parentClientValue = 0,
                actionValue = 0;
            if (smartLinkData?.id?.substr(smartLinkData?.id?.length - 1) === '1') {
                goalValue = 1;
            } else if (smartLinkData?.id?.substr(smartLinkData?.id?.length - 1) === '2') {
                goalValue = 2;
            } else if (smartLinkData?.id?.substr(smartLinkData?.id?.length - 1) === '3') {
                goalValue = 3;
            } else if (smartLinkData?.id?.substr(smartLinkData?.id?.length - 1) === '4') {
                goalValue = 4;
            } else if (smartLinkData?.id?.substr(smartLinkData?.id?.length - 1) === '5') {
                goalValue = 5;
            } else {
                goalValue = 0;
            }
            if (campaign?.campaignType === 'S') {
                blastValue = 1;
                parentClientValue = 0;
                actionValue = 1;
            } else if (campaign?.campaignType === 'T') {
                blastValue = 1;
                parentClientValue = 0;
                actionValue = 1;
            } else {
                blastValue = 0;
                parentClientValue = 0;
                actionValue = 0;
            }
            const channelPayload = {
                ...payload,
                campaignId: campaign?.campaignId,
                blastType: splitTest ? splitObj?.[currentSplitTab] : '',
                channelId: getChannelId(channelType)?.id,
                goalNo: goalValue,
                blastNo: blastValue,
                parentChannelDetailId: parentClientValue,
                actionId: actionValue,
                subSegmentId: 0
            };

            const { status, data } = await dispatch(getSmartUrlDetailByChannel({ payload: channelPayload }));
            if (status) {
                const { urlName, smartCode, blastSC } = data || {};
                const text = editorText || '';
                const smartURL = urlName + smartCode + blastSC;
                let finalValue;

                if (inputRef?.current === undefined) {
                    finalValue = text?.length > 0 ? text + ' ' + smartURL : smartURL;
                } else {
                    const start = text?.slice(0, inputRef?.current?.startPoistion);
                    const end = text?.slice(inputRef?.current?.endPosition);
                    const spaceBefore = start?.length > 0 ? ' ' : '';
                    const spaceAfter = end?.length > 0 ? ' ' : '';
                    finalValue = start + spaceBefore + smartURL + spaceAfter + end;
                }

                if (finalValue?.length <= mobileNotificationEditorMaxLength) {
                    setValue(editorTextName, finalValue);
                    setMaxLengthError('');
                    if (inputRef?.current !== undefined) {
                        const newCursorPosition = inputRef?.current?.startPoistion + finalValue?.length - text?.length;
                        inputRef.current = {
                            startPoistion: newCursorPosition,
                            endPosition: newCursorPosition,
                        };
                    }
                    trigger(editorTextName);
                } else {
                    setError('editorText', {
                        type: 'custom',
                        message: `Max. ${mobileNotificationEditorMaxLength}`,
                    });
                    setMaxLengthError(`Max. ${mobileNotificationEditorMaxLength}`);
                    return;
                }
            }
        } else {
            const text = editorText || '';
            let finalValue;

            if (inputRef?.current === undefined) {
                finalValue = text?.length > 0 ? text + ' ' + smartLinkData : smartLinkData;
            } else {
                const start = text?.slice(0, inputRef?.current?.startPoistion);
                const end = text?.slice(inputRef?.current?.endPosition);
                const spaceBefore = start?.length > 0 ? ' ' : '';
                const spaceAfter = end?.length > 0 ? ' ' : '';
                finalValue = start + spaceBefore + smartLinkData + spaceAfter + end;
            }

            if (finalValue?.length <= mobileNotificationEditorMaxLength) {
                setValue(editorTextName, finalValue);
                setMaxLengthError('');
                if (inputRef?.current !== undefined) {
                    const newCursorPosition = inputRef?.current?.startPoistion + finalValue?.length - text?.length;
                    inputRef.current = {
                        startPoistion: newCursorPosition,
                        endPosition: newCursorPosition,
                    };
                }
                trigger(editorTextName);
            } else {
                setError('editorText', {
                    type: 'custom',
                    message: `Max. ${mobileNotificationEditorMaxLength}`,
                });
                setMaxLengthError(`Max. ${mobileNotificationEditorMaxLength}`);
                return;
            }
        }
    };


    const previewProps = {
        previewImage,
        previewVideo,
        title,
        subtitle,
        editorText,
        interactivity,
        buttonText,
        customization,
        // style: mobileStyles,
        remainingTime,
        timerBgColor,
        timerTextColor,
        style: notification?.mobile?.styles,
        mobileApp,
    };

    const handleImageData = async (base64Image, fileName) => {
        // console.log('File name ::: ', base64Image, fileName);
        // debugger;
        if (fileName !== '' && base64Image !== '') {
            let payloadData = { base64Image, imageFormat: fileName.split('.')?.[1], contentLength: 123, ...payload };

            let { data, status } = await dispatch(uploadWebPush({ payload: payloadData }));

            let format = fileName.split('.')?.pop();

            if (status) {
                if (isSplit) {
                    if (['mp4', 'mp3'].includes(format)) setValue(`${fieldName}.previewImage_video`, data);
                    else {
                        setValue(`${fieldName}.browserImage`, data);
                        setValue(`${fieldName}.previewImage`, data);

                        setValue(`${fieldName}.uploadImage`, data);
                    }
                } else {
                    if (['mp4', 'mp3'].includes(format)) setValue(`previewImage_video`, data);
                    else {
                        setValue('browserImage', data);
                        setValue('previewImage', data);
                        setValue(`uploadImage`, data);
                    }
                }
                // handleChange(data, 'browseImage');
            }
        }
    };

    useEffect(() => {
        if (location?.statusId) statusIdCheck(location?.statusId) && setFocus(titleName);
    }, [location]);

    // useEffect(() => {
    //     debugger;
    //     setValue(`${customizationName}.color`, notification?.[type]?.styles?.color);
    //     setValue(`${customizationName}.background`, notification?.[type]?.styles?.background);
    // }, [notification, type]);
    const TextColorPicker = (props) => {
        const { view } = props;
        // const { notification } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
        // const dispatch = useDispatch();

        const opacityToHex = (opacity) => {
            const alpha = Math.round(opacity * 255);
            return alpha.toString(16).padStart(2, '0').toUpperCase();
        };

        const getCurrentColorValue = () => {
            const currentValue = customization?.color || '';
            if (typeof currentValue === 'string' && currentValue.length === 9) {
                return currentValue.substring(0, 7); // Extract color part
            }
            return currentValue;
        };

        return (
            <RSColorPicker
                wrapperClass="text_editor_icon nwp"
                icon={colorpicker_text_medium}
                isOpacity={true}
                onSelect={(e) => {
                    let colorValue;
                    if (typeof e === 'object' && e.color && e.opacity !== undefined) {
                        // Handle opacity - convert to hex and append to color
                        const hexOpacity = opacityToHex(e.opacity);
                        colorValue = `${e.color}${hexOpacity}`;
                    } else {
                        // Handle simple color selection without opacity
                        colorValue = e;
                    }

                    // Apply to editor with hex+opacity format
                    if (view) {
                        EditorUtils.applyInlineStyle(view, {
                            style: 'color',
                            value: colorValue,
                        });
                    }
                    // Also save to form state
                    setValue(`${customizationName}.color`, colorValue);
                }}
                tooltipText={'Text color'}
                isToolTip={true}
                colorValue={getCurrentColorValue()}
            />
        );
    };

    const TimerPicker = (props) => {
        // return <TimerIcon wrapperClass="text_editor_icon" />;
        const { control, setValue, resetField } = useFormContext();
        // const [timerValue, setTimer] = useState(false);

        const timerEnabledName = isSplit ? `${fieldName}.timerEnabled` : 'timerEnabled';
        const timerName = isSplit ? `${fieldName}.timer` : 'timer';
        const remainingTimeName = isSplit ? `${fieldName}.remainingTime` : 'remainingTime';
        const timerTextColorName = isSplit ? `${fieldName}.timerTextColor` : 'timerTextColor';
        const timerBgColorName = isSplit ? `${fieldName}.timerBgColor` : 'timerBgColor';
        // console.log('Sjow :::: ', timerValue);
        return (
            <div className={'text_editor_icon border-0'}>
                <RSTooltip text={'Add timer'} position="top" className="lh0">
                    <i
                        // title="Add timer"
                        className={`${editor_timer_medium} icon-md `}
                        onClick={() => {
                            // debugger;
                            setTimer(true);
                            setValue(timerEnabledName, true);
                        }}
                    />
                </RSTooltip>
                {/* <TimerModal
                    show={timerValue}
                    isSplit={isSplit}
                    handleClose={(status) => {
                        setTimer(false);
                        setValue(timerEnabledName, status);
                        if (!status) {
                            resetField(timerName);
                            resetField(remainingTimeName);
                            resetField(timerBgColorName);
                            resetField(timerTextColorName);
                        }
                    }}
                    fieldName={fieldName}
                /> */}
            </div>
        );
    };

    const BackgroundColorPicker = (props) => {
        const { view } = props;
        const opacityToHex = (opacity) => {
            const alpha = Math.round(opacity * 255);
            return alpha.toString(16).padStart(2, '0').toUpperCase();
        };

        const getCurrentBackgroundColorValue = () => {
            const currentValue = customization?.background || '';
            if (typeof currentValue === 'string' && currentValue.toLowerCase() === 'transparent') {
                return 'transparent';
            }
            if (typeof currentValue === 'string' && currentValue.length === 9) {
                return currentValue.substring(0, 7);
            }
            return currentValue;
        };

        const resolveBackgroundColor = (value) => {
            if (typeof value === 'string') {
                return value.toLowerCase() === 'transparent' ? 'transparent' : value;
            }

            if (typeof value === 'object' && value?.color !== undefined) {
                if (typeof value.color === 'string' && value.color.toLowerCase() === 'transparent') {
                    return 'transparent';
                }
                if (value.opacity !== undefined) {
                    return `${value.color}${opacityToHex(value.opacity)}`;
                }
                return value.color;
            }

            return value;
        };

        return (
            <RSColorPicker
                wrapperClass="text_editor_icon"
                icon={editor_color_picker_medium}
                onSelect={(e) => {
                    setValue(`${customizationName}.background`, resolveBackgroundColor(e));
                }}
                isOpacity={true}
                isToolTip={true}
                tooltipText={'Background color'}
                colorValue={getCurrentBackgroundColorValue()}
            />
        );
    };
    const backgroundColor = customization?.background ?? null;
    useEffect(() => {
        if (backgroundColor !== null && backgroundColor !== undefined) {
            setEditorContentBackground(backgroundColor);
        }
    }, [backgroundColor]);
    // console.log('TExt change ============= >>>>> ', editorTextLength);
    useEffect(() => {
        const currentCustomization = getValues(customizationName);
        if (!currentCustomization) {
            setValue(`${customizationName}.background`, null);
            setValue(`${customizationName}.color`, null);
        }
    }, [customizationName]);
    useEffect(() => {
        const textLength = editorText?.replace(/<[^>]+>/g, '')?.length || 0;
        setEditorTextLengthMobile(textLength)
    }, [editorText])
    const handleEditorTextLengthForMobile = (val) => {
        setEditorTextLengthMobile(val);
    };
    useEffect(() => {
        const iconConfig = [
            { className: 'k-i-bold', tooltipText: 'Bold' },
            { className: 'k-i-italic', tooltipText: 'Italic' },
            { className: 'k-i-strikethrough', tooltipText: 'Strikethrough' },
            { className: 'k-i-underline', tooltipText: 'Underline' },
        ];

        iconConfig.forEach(({ className, tooltipText }) => {
            const icons = document.getElementsByClassName(className);

            [...icons].forEach((x) => {
                const existingTooltip = x.querySelector('.tooltip');

                if (!existingTooltip) {
                    const tooltip = document.createElement('div');
                    tooltip.setAttribute('role', 'tooltip');
                    tooltip.classList.add('tooltip', 'bs-tooltip-top');
                    tooltip.innerHTML = `
                        <div class="tooltip-arrow" style="position: absolute; left: 0; transform: translate(17px, 0px);"></div>
                        <div class="tooltip-inner">${tooltipText}</div>`;

                    x.addEventListener('mouseover', () => {
                        tooltip.classList.add('fade', 'show');
                        tooltip.style.cssText =
                            'position: absolute; inset: auto auto 0px 0px; transform: translate(-2px, -33px)';
                        x.insertAdjacentElement('afterend', tooltip);
                    });

                    x.addEventListener('mouseout', () => {
                        tooltip.remove();
                    });
                }
            });
        });
    }, []);
    useEffect(() => {
        const textEditorBtn = document.querySelectorAll('.k-icon-button');
        if (textEditorBtn) {
            textEditorBtn?.forEach((item) => {
                item.removeAttribute('title');
            });
        }
    }, []);

    const setEditorContentBackground = (color) => {
        const editorContent = document.querySelector('.k-editor-content');
        if (editorContent) {
            const displayColor =
                typeof color === 'string' && color.toLowerCase() === 'transparent' ? '#ffffff' : color;
            editorContent.style.backgroundColor = displayColor;
        }
    };

    const editorTools = useMemo(() => [
        [Bold, Italic, Underline, Strikethrough],
        [
            CustomForeColor,
            BackgroundColorPicker,
            ImageUploadMobile,
            (props) => <EmojiPickerMobile {...props} maxLength={mobileNotificationEditorMaxLength} onEditorMaxLen={setEditorMaxLenError} />
        ],
        [
            (props) => <Personalize {...props} maxLength={mobileNotificationEditorMaxLength} onEditorMaxLen={setEditorMaxLenError} />,
            (props) => <InsertOffer {...props} maxLength={mobileNotificationEditorMaxLength} onEditorMaxLen={setEditorMaxLenError} />,
            TimerPicker
        ],
    ], [mobileNotificationEditorMaxLength, setEditorMaxLenError]);

    return (
        <div className="mt41">
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 0, span: 2 }}>
                        <label className="control-label-left">Title text</label>
                    </Col>
                    <Col sm={8} className="position-relative px46">
                        <RSEmojiPickerInput
                            inputName={titleName}
                            isColorPicker={true}
                            placeholder={TITLE_TEXT}
                            colorPickerName={colorPickerName}
                            // rules={{
                            //     required: ENTER_TITLE_TEXT,
                            // }}
                            // required
                            personalizationSettings={{
                                data: handlePersonalization(personalization, location?.audience?.length ? location?.audience : (watch('audience')?.length ? watch('audience') : getValues()?.audience), listTypeWisePersonlization),
                                dataItemKey: 'dataAttributeId',
                                textField: 'key',
                            }}
                            maxLength={MAX_LENGTH60}
                            isTop
                        />
                        <small className="position-absolute mr46 right0 top30">
                            {getValues(titleName)?.length} / {MAX_LENGTH60}
                        </small>
                    </Col>
                </Row>
            </div>
            {(layoutPosition?.id === 5 || layoutPosition?.id === 4) && (
                // || (layoutPosition?.id === 4 && deliveryType?.id !== 2)
                <div className="form-group">
                    <Row>
                        <Col sm={{ offset: 0, span: 2 }}>
                            <label className="control-label-left">Subtitle</label>
                        </Col>
                        <Col sm={8} className="position-relative px46">
                            <RSEmojiPickerInput
                                inputName={subtitleTextName}
                                isColorPicker={false}
                                required={false}
                                placeholder={'Subtitle text'}
                                // rules={{
                                //     required: 'Enter subtitle text',
                                // }}
                                personalizationSettings={{
                                    data: handlePersonalization(personalization, location?.audience?.length ? location?.audience : (watch('audience')?.length ? watch('audience') : getValues()?.audience), listTypeWisePersonlization),
                                    dataItemKey: 'dataAttributeId',
                                    textField: 'key',
                                }}
                                maxLength={MAX_LENGTH60}
                            />
                            <small className="position-absolute mr46 right0 top30">
                                {getValues(subtitleTextName)?.length} / {MAX_LENGTH60}
                            </small>
                        </Col>
                    </Row>
                </div>
            )}
            <div>
                <Row>
                    <Col sm={{ offset: 0, span: 12 }}>
                        <div className="rs-live-preview-wrapper mp-texteditor mt20 emojifont">
                            <Row>
                                {/* Left column starts */}
                                <Col sm={7} className={`position-relative ${!previewImage ? 'mdc_mobilepush_editors' : ''}`}>
                                    {/* {type === 'mobile' && ( */}
                                    <div>
                                        {/* {isSplit ? (
                                                <div className="rs-textarea-component-wrapper">
                                                    <div className="rstcw-top-icons">
                                                        <ul>
                                                            <li>
                                                                <RSBootstrapdown
                                                                    data={personalization}
                                                                    isObject
                                                                    fieldKey="personalizationKey"
                                                                    flatIcon
                                                                    defaultItem={{
                                                                        attributeName: '',
                                                                        dataAttributeId: 0,
                                                                        fallbackAttributeName: null,
                                                                        personalizationKey: (
                                                                            <i
                                                                                className={`${user_question_mark_edge_medium} icon-md`}
                                                                            />
                                                                        ),
                                                                    }}
                                                                    showUpdate={false}
                                                                    className="no_caret"
                                                                    onSelect={({ personalizationKey }) =>
                                                                        handleChange(personalizationKey, 'static')
                                                                    }
                                                                />
                                                            </li>

                                                            <Fragment>
                                                                <li>
                                                                    <EmojiPicker
                                                                        onEmojiSelect={(e) => handleChange(e.native, 'static')}
                                                                    />
                                                                </li>

                                                                <li>
                                                                    <ImageUpload
                                                                        contentType={'img'}
                                                                        isSplit={isSplit}
                                                                        fieldName={fieldName}
                                                                        isbase64={true}
                                                                        handleImageData={handleImageData}
                                                                    />
                                                                </li>

                                                                <Fragment>
                                                                    <li title="">
                                                                        <RSColorPicker
                                                                            icon={colorpicker_bg_medium}
                                                                            onSelect={(color) =>
                                                                                setValue(`${customizationName}.background`, color)
                                                                            }
                                                                            initColor={customizationName?.background}
                                                                        />
                                                                    </li>
                                                                    <li title="Font color">
                                                                        <RSColorPicker
                                                                            icon={colorpicker_text_medium}
                                                                            onSelect={(color) =>
                                                                                setValue(`${customizationName}.color`, color)
                                                                            }
                                                                            initColor={customizationName?.color}
                                                                        />
                                                                    </li>{' '}
                                                                </Fragment>
                                                            </Fragment>
                                                        </ul>
                                                    </div>
                                                    <div className="rstcw-textarea-holder">
                                                            <RSTextarea
                                                                control={control}
                                                                name={editorTextName}
                                                                maxLength={mobileNotificationEditorMaxLength}
                                                            onKeyUp={(e) => handleSelectionChange(e)}
                                                            onClick={(e) => handleSelectionChange(e)}
                                                            rules={{
                                                                required: ENTER_EDITOR_TEXT,
                                                            }}
                                                            handleChange={(e) => {
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="rs-editor-bottom-message">
                                                        <div className="editor-message-right">
                                                            <small>
                                                                <span className="emr-length">{editorText?.length} / {mobileNotificationEditorMaxLength}</span>
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <TextEditorMobile
                                                        isSplit={isSplit}
                                                        fieldName={fieldName}
                                                        onChange={(e) => {
                                                            setValue(editorTextName, e);
                                                            if (editorText?.length >= mobileNotificationEditorMaxLength) {

                                                                setEditable(false);
                                                            }
                                                        }}
                                                        editable={editable}
                                                        setEditable={setEditable}
                                                        tools={[
                                                            [Personalize, TimerIcon],
                                                            [Bold, Italic, Underline, Strikethrough],
                                                            [ForeColor, BackColor, ImageUploadMobile],
                                                        ]}
                                                        handleChange={handleChange}
                                                        handleImageData={handleImageData}
                                                        editValue={editorText}
                                                    />
                                                    <div className="rs-editor-bottom-message">
                                                        <div className="editor-message-right">
                                                            <small>
                                                                <span className="emr-length">{editorTextLength} / {mobileNotificationEditorMaxLength}</span>
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            )} */}
                                        <div>
                                            {editorTextLenghtMobile > mobileNotificationEditorMaxLength && (
                                                <small className="color-primary-red">
                                                    {ENTER_LESS_THAN_350_CHARACTERS}
                                                </small>
                                            )}
                                            {(pasteErrorMessage ||
                                                maxLengthError ||
                                                editorMaxLenError ||
                                                errors?.editorTextLength ||
                                                errors?.splitA?.editorText ||
                                                errors?.splitB?.editorText ||
                                                errors?.splitC?.editorText ||
                                                errors?.splitD?.editorText) && (
                                                    <small className="color-primary-red position-absolute top-20 fs11">
                                                        {pasteErrorMessage || maxLengthError || (editorMaxLenError ? `Max. ${mobileNotificationEditorMaxLength}` : '') || ENTER_EDITOR_TEXT}
                                                    </small>
                                                )}
                                            <TextEditorMobile
                                                isSplit={isSplit}
                                                fieldName={fieldName}
                                                onChange={(e) => {
                                                    const regex = /<p>(.*?)<\/p>/;
                                                    const textContent = e.match(regex);
                                                    // console.log('aa123', e);
                                                    setValue(editorTextName, e);
                                                    // console.log('Length ::: ', editorText?.length);
                                                    if (editorTextLength >= mobileNotificationEditorMaxLength) {
                                                        // console.log('Length ::: ', editorText?.length, 'ASASD');
                                                        // setEditable(false);
                                                    }
                                                    if (textContent[1]?.length > 0) {
                                                        // console.log('Length ::: ', editorText?.length, 'ASASD');
                                                        // setEditable(false);
                                                        clearErrors(editorTextLengthName);
                                                        clearErrors(editorTextName);
                                                        setPasteErrorMessage('');
                                                        setMaxLengthError('');
                                                        setEditorMaxLenError(false);
                                                    }
                                                    if (textContent[1]?.length === 0) {
                                                        setError(editorTextLengthName, {
                                                            type: 'custom',
                                                            message: 'Enter a body text',
                                                        });
                                                    }
                                                }}
                                                onPasteError={setPasteErrorMessage}
                                                // editable={editable}
                                                // setEditable={setEditable}
                                                tools={editorTools}
                                                handleChange={handleChange}
                                                handleImageData={handleImageData}
                                                editValue={editorText}
                                                handleTextLength={handleEditorTextLengthForMobile}
                                            />
                                            <div className="rs-editor-bottom-message">
                                                <div className="editor-message-right">
                                                    <small>
                                                        <span className="emr-length">
                                                            {editorTextLenghtMobile} / {mobileNotificationEditorMaxLength}
                                                        </span>
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* )} */}
                                </Col>
                                {/* /Left column ends */}
                                {/* Right column starts */}
                                <Col sm={5}>
                                    <div className="rsamp-text">{PREVIEW}</div>
                                    <div
                                        className={` ${!editorText?.length
                                                ? 'rs-mobile-preview-disable'
                                                : 'rs-mobile-preview-enable'
                                            }`}
                                    >
                                        {/* {(title?.text || editorText || previewImage) && ( */}

                                        <RSTabber
                                            defaultClass={`col-md-2 tabTransparent `}
                                            dynamicTab={`mb-25 mini mt3 float-end`}
                                            activeClass={`active`}
                                            className="rs-tabs row rsamp-dropdown"
                                            wrapperClassName="mt-5"
                                            componentClassName={`mobilepush_frame_wrapper windows ${selectedPreviewTab === 'andriod' ? 'mobile' : 'ios'} w-100`}
                                            defaultTab={0}
                                            callBack={(tab, index) => {
                                                // debugger
                                                setSelectedPreviewTab(tab?.id)
                                            }}
                                            tabData={[
                                                {
                                                    id: 'andriod',
                                                    text: ANDROID,
                                                    component: () => (
                                                        <Preview
                                                            type="andriod"
                                                            {...previewProps}
                                                            channelType={type}
                                                            campaignType={campaign?.campaignType}
                                                        />
                                                    ),
                                                },
                                                {
                                                    id: 'ios',
                                                    text: IOS,
                                                    component: () => (
                                                        <Preview
                                                            type="ios"
                                                            {...previewProps}
                                                            channelType={type}
                                                            campaignType={campaign?.campaignType}
                                                        />
                                                    ),
                                                },
                                            ]}
                                        />
                                        {/* )} */}
                                    </div>
                                </Col>
                                {/* /Right column ends */}
                            </Row>
                        </div>
                    </Col>
                </Row>
            </div>
            <div>
                {/* <div className="form-group">
                    <Row>
                        <Col sm={type === 'mobile' ? 2 : 3} className="text-right">
                            <label className="control-label-left">Body text</label>
                        </Col>
                        <Col sm={type === 'mobile' ? 6 : 4}>
                            {type === 'web' && (
                                <div className="rs-textarea-component-wrapper">
                                    <div className="rstcw-top-icons">
                                        <ul>
                                            <li>
                                                <RSBootstrapdown
                                                    data={personalization}
                                                    isObject
                                                    fieldKey="personalizationKey"
                                                    flatIcon
                                                    defaultItem={{
                                                        attributeName: '',
                                                        dataAttributeId: 0,
                                                        fallbackAttributeName: null,
                                                        personalizationKey: (
                                                            <i
                                                                className={`${user_question_mark_edge_medium} icon-md`}
                                                            />
                                                        ),
                                                    }}
                                                    showUpdate={false}
                                                    className="no_caret"
                                                    onSelect={({ personalizationKey }) =>
                                                        handleChange(personalizationKey, 'static')
                                                    }
                                                />
                                            </li>

                                            {type === 'web' && (
                                                <Fragment>
                                                    <li>
                                                        <EmojiPicker
                                                            onEmojiSelect={(e) => handleChange(e.native, 'static')}
                                                        />
                                                    </li>

                                                    <li>
                                                        <ImageUpload
                                                            contentType={'img'}
                                                            isSplit={isSplit}
                                                            fieldName={fieldName}
                                                            isbase64={true}
                                                            handleImageData={handleImageData}
                                                        />
                                                    </li>

                                                    {deliveryType?.id !== 1 && (
                                                        <Fragment>
                                                            <li title="Background color">
                                                                <RSColorPicker
                                                                    icon={colorpicker_bg_medium}
                                                                    onSelect={(color) =>
                                                                        setValue(
                                                                            `${customizationName}.background`,
                                                                            color,
                                                                        )
                                                                    }
                                                                    initColor={customizationName?.background}
                                                                />
                                                            </li>
                                                            <li title="Font color">
                                                                <RSColorPicker
                                                                    icon={colorpicker_text_medium}
                                                                    onSelect={(color) =>
                                                                        setValue(`${customizationName}.color`, color)
                                                                    }
                                                                    initColor={customizationName?.color}
                                                                />
                                                            </li>{' '}
                                                        </Fragment>
                                                    )}
                                                </Fragment>
                                            )}
                                        </ul>
                                    </div>
                                    <div className="rstcw-textarea-holder">
                                        <RSTextarea
                                            control={control}
                                            name={editorTextName}
                                            maxlength={mobileNotificationEditorMaxLength}
                                            onKeyUp={(e) => handleSelectionChange(e)}
                                            onClick={(e) => handleSelectionChange(e)}
                                            rules={{
                                                required: ENTER_EDITOR_TEXT,
                                            }}
                                            handleChange={(e) => {
                                            }}
                                        />
                                    </div>

                                    <div className="text-end mt5">
                                        <small>{editorText?.length} / {mobileNotificationEditorMaxLength}</small>
                                    </div>
                                </div>
                            )}
                            {type === 'mobile' && (
                                <div>
                                    {isSplit ? (
                                        <div className="rs-textarea-component-wrapper">
                                            <div className="rstcw-top-icons">
                                                <ul>
                                                    <li>
                                                        <RSBootstrapdown
                                                            data={personalization}
                                                            isObject
                                                            fieldKey="personalizationKey"
                                                            flatIcon
                                                            defaultItem={{
                                                                attributeName: '',
                                                                dataAttributeId: 0,
                                                                fallbackAttributeName: null,
                                                                personalizationKey: (
                                                                    <i
                                                                        className={`${user_question_mark_edge_medium} icon-md`}
                                                                    />
                                                                ),
                                                            }}
                                                            showUpdate={false}
                                                            className="no_caret"
                                                            onSelect={({ personalizationKey }) =>
                                                                handleChange(personalizationKey, 'static')
                                                            }
                                                        />
                                                    </li>

                                                    <Fragment>
                                                        <li>
                                                            <EmojiPicker
                                                                onEmojiSelect={(e) => handleChange(e.native, 'static')}
                                                            />
                                                        </li>

                                                        <li>
                                                            <ImageUpload
                                                                contentType={'img'}
                                                                isSplit={isSplit}
                                                                fieldName={fieldName}
                                                                isbase64={true}
                                                                handleImageData={handleImageData}
                                                            />
                                                        </li>

                                                        <Fragment>
                                                            <li title="Background color">
                                                                <RSColorPicker
                                                                    icon={colorpicker_bg_medium}
                                                                    onSelect={(color) =>
                                                                        setValue(
                                                                            `${customizationName}.background`,
                                                                            color,
                                                                        )
                                                                    }
                                                                    initColor={customizationName?.background}
                                                                />
                                                            </li>
                                                            <li title="Font color">
                                                                <RSColorPicker
                                                                    icon={colorpicker_text_medium}
                                                                    onSelect={(color) =>
                                                                        setValue(`${customizationName}.color`, color)
                                                                    }
                                                                    initColor={customizationName?.color}
                                                                />
                                                            </li>{' '}
                                                        </Fragment>
                                                    </Fragment>
                                                </ul>
                                            </div>
                                            <div className="rstcw-textarea-holder">
                                                <RSTextarea
                                                    control={control}
                                                    name={editorTextName}
                                                    maxlength={mobileNotificationEditorMaxLength}
                                                    onKeyUp={(e) => handleSelectionChange(e)}
                                                    onClick={(e) => handleSelectionChange(e)}
                                                    rules={{
                                                        required: ENTER_EDITOR_TEXT,
                                                    }}
                                                    handleChange={(e) => {
                                                    }}
                                                />
                                            </div>

                                            <div className="text-end mt5">
                                                <small>{editorText?.length} / {mobileNotificationEditorMaxLength}</small>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <TextEditorMobile
                                                isSplit={isSplit}
                                                fieldName={fieldName}
                                                onChange={(e) => {
                                                    setValue(editorTextName, e);
                                                    if (editorText?.length >= mobileNotificationEditorMaxLength) {

                                                        setEditable(false);
                                                    }
                                                }}
                                                editable={editable}
                                                setEditable={setEditable}
                                                tools={[
                                                    [Personalize, TimerIcon],
                                                    [Bold, Italic, Underline, Strikethrough],
                                                    [ForeColor, BackColor, ImageUploadMobile],
                                                ]}
                                                handleChange={handleChange}
                                                handleImageData={handleImageData}
                                                editValue={editorText}
                                            />
                                            <div className="text-end mt5">
                                                <small>{editorTextLength} / {mobileNotificationEditorMaxLength}</small>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Col>
                        {(title?.text || editorText || previewImage) && (
                            <Col sm={4} className="pr0 pl0">
                                <RSTabber
                                    defaultClass={`col-md-2 tabTransparent `}
                                    dynamicTab={`mb0 mini mt-30`}
                                    activeClass={`active`}
                                    className="rs-tabs row"
                                    componentClassName={'mt20'}
                                    defaultTab={0}
                                    tabData={
                                        type === 'web'
                                            ? [
                                                  {
                                                      id: 'chrome',
                                                      text: 'Chrome',
                                                      component: () => <Preview type="chrome" {...previewProps} />,
                                                  },
                                                  {
                                                      id: 'firefox',
                                                      text: 'Firefox',
                                                      component: () => <Preview type="firefox" {...previewProps} />,
                                                  },
                                              ]
                                            : [
                                                  {
                                                      id: 'andriod',
                                                      text: 'Andriod',
                                                      component: () => <Preview type="andriod" {...previewProps} />,
                                                  },
                                                  {
                                                      id: 'ios',
                                                      text: 'IOS',
                                                      component: () => <Preview type="ios" {...previewProps} />,
                                                  },
                                              ]
                                    }
                                />
                            </Col>
                        )}
                    </Row>
                </div> */}
                <TimerModal
                    show={timer}
                    isSplit={isSplit}
                    handleClose={(status) => {
                        setTimer(false);
                        setValue(timerEnabledName, status);
                        if (!status) {
                            resetField(timerName);
                            resetField(remainingTimeName);
                            resetField(timerBgColorName);
                            resetField(timerTextColorName);
                        }
                    }}
                    fieldName={fieldName}
                />
            </div>
        </div>
    );
};

export default Create;
