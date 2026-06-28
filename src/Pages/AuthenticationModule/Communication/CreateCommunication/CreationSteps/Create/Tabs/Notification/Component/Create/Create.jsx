import { statusIdCheck } from 'Utils/modules/campaignUtils';
import { getChannelId } from 'Utils/modules/communicationChannels';
import { MAX_LENGTH60 } from 'Constants/GlobalConstant/Regex';
import { ENTER_EDITOR_TEXT, ENTER_TITLE_TEXT } from 'Constants/GlobalConstant/ValidationMessage';
import { BACKGROUND_COLOR, CHROME, FIREFOX, FONT_COLOR, OFFER_CODE, PERSONALIZATION, PREVIEW, TITLE_TEXT, UPLOAD_IMAGE } from 'Constants/GlobalConstant/Placeholders';
import { colorpicker_bg_medium, colorpicker_text_medium, coupon_medium, editor_color_picker_medium, editor_personalize_medium, editor_text_color_medium, smart_link_medium, user_question_mark_edge_medium, user_question_mark_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useFormContext, useWatch } from 'react-hook-form';
import _get from 'lodash/get';

import RSTabber from 'Components/RSTabber';
import RSEmojiPickerInput from 'Components/EmojiPickerInput';
import ImageUpload from '../../../../Component/ImageUpload/ImageUpload';
import EmojiPicker from 'Components/EmojiPicker';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import RSTextarea from 'Components/FormFields/RSTextarea';
import Preview from './Component/Preview/Preview';
import RSColorPicker from 'Components/ColorPicker';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';

import { EditorTools } from '@progress/kendo-react-editor';

import { getSmartUrlDetailByChannel } from 'Reducers/communication/createCommunication/smartlink/request';
import useQueryParams from 'Hooks/useQueryParams';
import { uploadWebPush } from 'Reducers/communication/createCommunication/Create/request';
import { getSmartLinksList } from 'Reducers/communication/createCommunication/smartlink/selectors';
import TimerModal from './Component/TimerModal/TimerModal';
import TimerIcon from '../../Component/SplitAB/Component/TimerIcon/TimerIcon';
import RSTooltip from 'Components/RSTooltip';
import TextEditorMobile from '../SplitAB/Component/TextEditorMobile/TextEditorMobile';
import Personalize from '../../../../Component/Personalize';
import InsertOffer from '../../../../Component/InsertOffer';
import { handlePersonalization } from '../../../../constant';
const { Bold, Italic, Underline, Strikethrough, FormatBlock, ForeColor, BackColor } = EditorTools;

const ImageUploadMobile = () => {
    const dispatch = useDispatch();
    const { parentClientId, ...payload } = useSelector((state) => getSessionId(state));
    const { control, setValue, watch, setFocus } = useFormContext();
    const splitTest = useWatch({ name: 'splitTest', control });
    const { notification } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const fieldName = `${notification?.web?.fieldNameIndex}`;
    const [deliveryType] = watch(['deliveryType']);
    const [showTooltip, setShowTooltip] = useState(false);
    const suppressTooltipRef = useRef(false);

    const handleMouseEnter = () => {
        if (!suppressTooltipRef.current) {
            setShowTooltip(true);
        }
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    const handleClick = () => {
        setShowTooltip(false);
        suppressTooltipRef.current = true;
        setTimeout(() => {
            suppressTooltipRef.current = false;
        }, 500);
    };

    const handleImageUpload = async (base64Image, fileName, contentLength) => {
        setShowTooltip(false);
        suppressTooltipRef.current = true;

        if (!fileName || !base64Image) return;

        const payloadData = {
            base64Image,
            imageFormat: fileName.split('.')?.[1],
            contentLength,
            ...payload,
        };

        const { data, status, message } = await dispatch(uploadWebPush({ payload: payloadData }));
        const format = fileName.split('.')?.pop();

        if (status) {
            if (splitTest) {
                if (['mp4', 'mp3'].includes(format)) {
                    setValue(`${fieldName}.previewImage_video`, data);
                } else {
                    setValue(`${fieldName}.browserImage`, data);
                    setValue(`${fieldName}.previewImage`, data);
                    setValue(`${fieldName}.uploadImage`, data);
                }
            } else {
                if (['mp4', 'mp3'].includes(format)) {
                    setValue(`previewImage_video`, data);
                } else {
                    setValue('browserImage', data);
                    setValue('previewImage', data);
                    setValue(`uploadImage`, data);
                }
            }
            setFocus('editorText');
        }

        setTimeout(() => {
            suppressTooltipRef.current = false;
        }, 1000);

        return { status, message };
    };

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            <RSTooltip text={UPLOAD_IMAGE} show={showTooltip}>
                <ImageUpload
                    contentType="img"
                    isSplit={splitTest}
                    fieldName={fieldName}
                    isbase64={true}
                    channelType={'wpush'}
                    isCustomFormat
                    isNotificationUpload
                    isAlertPush={deliveryType?.id === 1}
                    handleImageData={handleImageUpload}
                />
            </RSTooltip>
        </div>
    );
};

const EmojiPickerMobile = (props) => {
    const { view, onEditorMaxLen, maxLength = 350 } = props;
    const { control, setValue, watch, trigger, getValues, setError } = useFormContext();
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
            isTextEditor
        />
    );
};
const personalizationMobile = () => {
    const { personalization, listTypeWisePersonlization } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { control, setValue, watch, trigger, setError, getValues } = useFormContext();
    const splitTest = useWatch({
        name: 'splitTest',
        control,
    });

    const { notification } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const editorTextName = splitTest ? `${notification?.mobile?.fieldNameIndex}.editorText` : 'editorText';

    const [editorText] = watch([editorTextName]);

    return (
        <RSBootstrapdown
            data={handlePersonalization(personalization, location?.audience?.length ? location?.audience : (watch('audience')?.length ? watch('audience') : getValues()?.audience), listTypeWisePersonlization)}
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
            showSearch
        />
    );
};

const Create = ({ isSplit, fieldName }) => {
    const notificationEditorMaxLength = 350;
    const inputRef = useRef();
    const location = useQueryParams('/communication');
    const { notification } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const [timer, setTimer] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [suppressTooltip, setSuppressTooltip] = useState(false);
    const [editorTextLenghtMobile, setEditorTextLengthMobile] = useState(0);
    const [isEditorMaxLen, seIsEditorMaxLen] = useState(false);
    // const [editable, setEditable] = useState(false);
    const [mobileStyles, setMobileStyles] = useState({
        boldClick: false,
        italicClick: false,
        underlineClick: false,
        strikeClick: false,
    });
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

    const { control, setValue, watch, trigger, setFocus, resetField, setError, getValues } = useFormContext();

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
    const previewImage1 = isSplit ? `${fieldName}.previewImage` : 'previewImage';

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
    ]);
    // console.log('Customization :::: ', customization);
    const buttonText = useWatch({
        name: buttonTextName,
        control,
    });

    const handleSelectionChange = (e) => {
        // console.log('DAta ::::::::::::: ', e)
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
                subSegmentId: 0,
            };

            const { status, data } = await dispatch(getSmartUrlDetailByChannel({ payload: channelPayload }));
            if (status) {
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

                if (finalValue?.length <= notificationEditorMaxLength) {
                    setValue(editorTextName, finalValue);
                    if (inputRef?.current !== undefined) {
                        const newCursorPosition = inputRef?.current?.startPoistion + finalValue?.length - text?.length;
                        inputRef.current = {
                            startPoistion: newCursorPosition,
                            endPosition: newCursorPosition,
                        };
                    }
                    trigger(editorTextName);
                } else {
                    setError(editorTextName, {
                        type: 'custom',
                        message: `Max. ${notificationEditorMaxLength}`,
                    });
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

            if (finalValue?.length <= notificationEditorMaxLength) {
                setValue(editorTextName, finalValue);
                if (inputRef?.current !== undefined) {
                    const newCursorPosition = inputRef?.current?.startPoistion + finalValue?.length - text?.length;
                    inputRef.current = {
                        startPoistion: newCursorPosition,
                        endPosition: newCursorPosition,
                    };
                }
                trigger(editorTextName);
            } else {
                setError(editorTextName, {
                    type: 'custom',
                    message: `Max. ${notificationEditorMaxLength}`,
                });
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
        style: notification?.web?.styles,
    };

    const handleImageData = async (base64Image, fileName, contentLength) => {
        setShowTooltip(false);
        setSuppressTooltip(true);
        if (fileName !== '' && base64Image !== '') {
            let payloadData = {
                base64Image,
                imageFormat: fileName.split('.')?.[1],
                contentLength: contentLength,
                ...payload,
            };

            let { data, status, message } = await dispatch(uploadWebPush({ payload: payloadData }));

            let format = fileName.split('.')?.pop();

            if (status) {
                if (isSplit) {
                    if (['mp4', 'mp3'].includes(format)) {
                        setValue(`${fieldName}.previewImage_video`, data);
                        setFocus('editorText');
                    } else {
                        setValue(`${fieldName}.browserImage`, data);
                        setValue(`${fieldName}.previewImage`, data);
                        setValue(`${fieldName}.uploadImage`, data);
                        setFocus('editorText');
                        setTimeout(() => {
                            setSuppressTooltip(false);
                        }, 1000);
                        return { status: true, message: message };
                    }
                } else {
                    if (['mp4', 'mp3'].includes(format)) setValue(`previewImage_video`, data);
                    else {
                        setValue('browserImage', data);
                        setValue('previewImage', data);
                        setValue(`uploadImage`, data);
                        setFocus('editorText');
                        setTimeout(() => {
                            setSuppressTooltip(false);
                        }, 1000);
                        return { status: true, message: message };
                    }
                }
                // handleChange(data, 'browseImage');
            } else {
                setSuppressTooltip(false);
                return { status: false, message: message };
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
    const TextColorPicker = ({ view }) => {
        const [lastColor, setLastColor] = useState('#000000'); // initial default

        return (
            <RSColorPicker
                wrapperClass="text_editor_icon"
                icon={editor_text_color_medium}
                colorValue={getValues(`${fieldName}.TextColor`)}
                defaultIconColor={lastColor}
                onSelect={(color) => {
                    if (!view) return;
                    const { state, dispatch } = view;
                    const { from, to, empty } = state.selection;
                    if (empty) return;

                    const markType = state.schema.marks.style || state.schema.marks.textColor;
                    if (!markType) return;

                    let tr = state.tr.removeMark(from, to, markType);
                    tr = tr.addMark(from, to, markType.create({ style: `color: ${color}` }));
                    dispatch(tr);
                    setValue(`${fieldName}.TextColor`, color);
                    setLastColor(color); // this now correctly updates the icon
                }}
            />
        );
    };

    const TimerPicker = (props) => {
        return <TimerIcon wrapperClass="text_editor_icon" />;
    };

    const BackgroundColorPicker = (props) => {
        const { view } = props;
        // const { notification } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
        // const dispatch = useDispatch();
        return (
            <RSColorPicker
                wrapperClass="text_editor_icon"
                icon={editor_color_picker_medium}
                onSelect={(e) => {
                    // const state = view.state;
                    // const tr = state.tr;
                    // const markType = state.schema.marks.style;
                    // const mark = markType.create({ class: { backgroundColor: e } });
                    // // const content = state.schema.text(e?.native);
                    // tr.addStoredMark(mark);
                    // // tr.replaceSelectionWith(content, true);
                    // view.dispatch(tr);
                    setValue(`${customizationName}.background`, e);
                }}
                colorValue={customization?.background || ''}
                tooltipText={BACKGROUND_COLOR}
            />
        );
    };

    // console.log('TExt change ============= >>>>> ', editorTextLength);
    useEffect(() => {
        if (editorTextLength === 0) {
            setValue(`${customizationName}.color`, null);
            setValue(`${customizationName}.background`, null);
        }
    }, [editorTextLength]);

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

        // Apply CSS styles for k-content > p
        const applyStylesToIframes = () => {
            const iframes = document.querySelectorAll('.k-iframe');
            iframes.forEach((iframe) => {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (!iframeDoc) return;

                const styleTag = iframeDoc.createElement('style');
                styleTag.innerHTML = `
                    body {
                        font-family: 'MuktaRegular', 'Mukta', sans-serif;
                    }
                    .k-content > p {
                        margin: 0;
                    }
                `;
                iframeDoc.head.appendChild(styleTag);
            });
        };

        // Apply styles immediately
        applyStylesToIframes();

        // Simple interval to check for new iframes
        const interval = setInterval(applyStylesToIframes, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);
    useEffect(() => {
        const textEditorBtn = document.querySelectorAll('.k-icon-button');
        if (textEditorBtn) {
            textEditorBtn?.forEach((item) => {
                item.removeAttribute('title');
            });
        }
    }, []);

    const handleEditorTextLengthForMobile = (val) => {
        setEditorTextLengthMobile(val);
    };
    const [tooltipOffer, setTooltipOffer] = useState(false);



    return (
        <div className="mt40">
            <div className="form-group">
                <Row>
                    <Col sm={{ span: 2 }}>
                        <label className="control-label-left">{TITLE_TEXT}</label>
                    </Col>
                    <Col sm={8} id="rs_Create_TitleText" className="position-relative pl47">
                        <RSEmojiPickerInput
                            inputName={titleName}
                            isColorPicker={deliveryType?.id !== 1}
                            placeholder={TITLE_TEXT}
                            colorPickerName={colorPickerName}
                            rules={{
                                required: ((deliveryType?.id === 2 || deliveryType?.id === 3) && previewImage?.length > 0) ? false : ENTER_TITLE_TEXT,
                                // validate: {
                                //     validateTitle: (value) => {
                                //         if (deliveryType?.id === 2 || deliveryType?.id === 3) {
                                //             if (!value?.trim() && !editorText?.trim() && !previewImage) {
                                //                 return ENTER_TITLE_TEXT;
                                //             }
                                //         }
                                //         return true;
                                //     },
                                // },
                            }}

                            personalizationSettings={{
                                data: handlePersonalization(personalization, location?.audience?.length ? location?.audience : (watch('audience')?.length ? watch('audience') : getValues()?.audience), listTypeWisePersonlization),
                                dataItemKey: 'dataAttributeId',
                                textField: 'key',
                            }}
                            maxLength={MAX_LENGTH60}
                        />
                        <small className="position-absolute right15 top30">
                            {getValues(titleName)?.length} / {MAX_LENGTH60}
                        </small>
                    </Col>
                </Row>
            </div>
            <div className="form-group">
            <Row>
                <Col sm={{ span: 12 }}>
                    <div
                        className={`rs-live-preview-wrapper wp-texteditor mt20 ${getValues('deliveryType')?.id === 3 ? 'overlayEle' : ''
                            }`}
                    >
                        <Row>
                            {/* Left column starts */}
                            <Col
                                sm={{ offset: 0, span: `${getValues('deliveryType')?.id === 3 ? 7 : 6}` }}
                                className="webTooltip mdc_mobilepush_editors"
                            >
                                {getValues('deliveryType')?.id === 1 && (
                                    <Fragment>
                                        <div className="rs-textarea-component-wrapper">
                                            <div className="rstcw-top-icons">
                                                <ul>
                                                    <li>
                                                        <RSTooltip text="Personalization">
                                                            <RSBootstrapdown
                                                                data={handlePersonalization(personalization, location?.audience?.length ? location?.audience : (watch('audience')?.length ? watch('audience') : getValues()?.audience), listTypeWisePersonlization)}
                                                                isObject
                                                                fieldKey="personalizationKey"
                                                                flatIcon
                                                                defaultItem={{
                                                                    attributeName: '',
                                                                    dataAttributeId: 0,
                                                                    fallbackAttributeName: null,
                                                                    personalizationKey: (
                                                                        <i
                                                                            title={PERSONALIZATION}
                                                                            className={`${editor_personalize_medium} icon-md`}
                                                                        />
                                                                    ),
                                                                }}
                                                                showUpdate={false}
                                                                className="no_caret"
                                                                onSelect={({ personalizationKey }) =>
                                                                    handleChange(personalizationKey, 'static')
                                                                }
                                                                showSearch
                                                            />
                                                        </RSTooltip>
                                                    </li>

                                                    <Fragment>
                                                            <li className="emoji-top">
                                                                <EmojiPicker
                                                                    onEmojiSelect={(e) =>
                                                                        handleChange(e.native, 'static')
                                                                    }
                                                                    isTextEditor
                                                                />
                                                            </li>

                                                            {/* <li>
                                                                    <RSBootstrapdown
                                                                        data={smartLinks}
                                                                        flatIcon
                                                                        isObject
                                                                        fieldKey="id"
                                                                        defaultItem={{
                                                                            id: <i className={`${smart_link_medium} icon-md`} />,
                                                                        }}
                                                                        containerClass={!smartLinks?.length ? 'click-off' : ''}
                                                                        showUpdate={false}
                                                                        name="smartlink"
                                                                        className="no_caret"
                                                                        onSelect={(e) => handleChange(e, 'dynamic')}
                                                                    />
                                                                </li> */}

                                                            <li
                                                                onMouseEnter={() => {
                                                                    if (!suppressTooltip) {
                                                                        setShowTooltip(true);
                                                                    }
                                                                }}
                                                                onMouseLeave={() => setShowTooltip(false)}
                                                                onClick={() => {
                                                                    setShowTooltip(false);
                                                                    setSuppressTooltip(true);
                                                                    setTimeout(() => {
                                                                        setSuppressTooltip(false);
                                                                    }, 500);
                                                                }}
                                                            >
                                                                <RSTooltip
                                                                    text={UPLOAD_IMAGE}
                                                                    show={showTooltip}
                                                                >
                                                                    <ImageUpload
                                                                        contentType={'img'}
                                                                        isSplit={isSplit}
                                                                        fieldName={fieldName}
                                                                        isbase64={true}
                                                                        channelType={'wpush'}
                                                                        handleImageData={handleImageData}
                                                                        isAlertPush={deliveryType?.id === 1}
                                                                        isNotificationUpload={true}
                                                                        isCustomFormat
                                                                        setShowTooltip={setShowTooltip}
                                                                    />
                                                                </RSTooltip>
                                                            </li>
                                                            {/* <li title="Personalization">
                                                            <RSBootstrapdown
                                                                data={['[[firstname]]', '[[lastname]]']}
                                                                flatIcon
                                                                defaultItem={
                                                                    <i className={`${user_question_mark_edge_medium} icon-md`} />
                                                                }
                                                                showUpdate={false}
                                                                className="no_caret"
                                                                onSelect={(e) => handleChange(e)}
                                                            />
                                                        </li>
                                                        <li title="Upload Image">
                                                            <ImageUpload
                                                                isSplit={isSplit}
                                                                fieldName={fieldName}
                                                                isbase64={true}
                                                                handleImageData={handleImageData}
                                                                // setImagePreviewStatus={() => {
                                                                //     setImagePreviewStatus(true);
                                                                // }}
                                                            />
                                                        </li>
                                                        <li title="Emoji">
                                                            <EmojiPicker onEmojiSelect={(e) => handleChange(e.native)} />
                                                        </li> */}

                                                            {deliveryType?.id !== 1 && (
                                                                <Fragment>
                                                                    <li>
                                                                        <RSColorPicker
                                                                            icon={colorpicker_text_medium}
                                                                            onSelect={(color) => {
                                                                                setValue(
                                                                                    `${customizationName}.color`,
                                                                                    color,
                                                                                );
                                                                            }}
                                                                            tooltipText={FONT_COLOR}
                                                                            initColor={customizationName?.color}
                                                                            defaultIconColor={'#000000'}
                                                                        />
                                                                    </li>
                                                                    <li>
                                                                        <RSColorPicker
                                                                            icon={editor_color_picker_medium}
                                                                            onSelect={(color) => {
                                                                                setValue(
                                                                                    `${customizationName}.background`,
                                                                                    color,
                                                                                );
                                                                            }}
                                                                            tooltipText={BACKGROUND_COLOR}
                                                                            initColor={customizationName?.background}
                                                                        />
                                                                    </li>
                                                                </Fragment>
                                                            )}
                                                            <li>
                                                                <RSTooltip
                                                                    text={OFFER_CODE}
                                                                    show={tooltipOffer}
                                                                >
                                                                    <InsertOffer
                                                                        insert={(e) => handleChange(e, 'static')}
                                                                        textArea={true}
                                                                    />
                                                                    {/* <RSTooltip text="Coupon code">
                                                                    <i className={`${coupon_medium} icon-md`} />
                                                                </RSTooltip> */}
                                                                </RSTooltip>
                                                            </li>
                                                        </Fragment>
                                                </ul>
                                            </div>
                                            <div className="rstcw-textarea-holder">
                                                <RSTextarea
                                                    control={control}
                                                    name={editorTextName}
                                                    maxLength={notificationEditorMaxLength}
                                                    onKeyUp={(e) => handleSelectionChange(e)}
                                                    onClick={(e) => handleSelectionChange(e)}
                                                    onKeyDown={(e) => handleSelectionChange(e)}
                                                    rules={{
                                                        required: ENTER_EDITOR_TEXT,
                                                    }}
                                                    handleOnchange={(e) => {
                                                    }}
                                                    customWebpushClassname="mdc"
                                                />
                                            </div>
                                        </div>
                                        <div className="rs-editor-bottom-message">
                                            <div className="editor-message-right">
                                                <small>
                                                    <span className="emr-length">
                                                        {/* {editorText?.replaceAll(' ', '')?.length} / {notificationEditorMaxLength} */}
                                                        {editorText?.length} / {notificationEditorMaxLength}
                                                    </span>
                                                </small>
                                            </div>
                                        </div>
                                    </Fragment>
                                )}
                                {getValues('deliveryType')?.id === 3 && (
                                    <div>
                                        {/* {isSplit ? (
                                                <div className="rs-textarea-component-wrapper">
                                                    <div className="rstcw-top-icons">
                                                        <ul>
                                                            <li>
                                                                <RSBootstrapdown
                                                                    data={handlePersonalization(personalization, location?.audience?.length ? location?.audience : (watch('audience')?.length ? watch('audience') : getValues()?.audience), listTypeWisePersonlization)}
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
                                                            maxLength={notificationEditorMaxLength}
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
                                                                <span className="emr-length">{editorText?.length} / {notificationEditorMaxLength}</span>
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
                                                            if (editorText?.length >= notificationEditorMaxLength) {

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
                                                                <span className="emr-length">{editorTextLength} / {notificationEditorMaxLength}</span>
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            )} */}
                                        <div>
                                            {isEditorMaxLen && (
                                                <small className="color-primary-red color-primary-red position-absolute top-20 fs11">
                                                    Max. {notificationEditorMaxLength}
                                                </small>
                                            )}
                                            <TextEditorMobile
                                                isSplit={isSplit}
                                                fieldName={fieldName}
                                                onChange={(e) => {
                                                    // debugger;
                                                    // console.log('aa123', e);
                                                    setValue(editorTextName, e);
                                                    seIsEditorMaxLen(false)
                                                    // console.log('Length ::: ', editorText?.length);
                                                    if (editorTextLength >= notificationEditorMaxLength) {
                                                        // console.log('Length ::: ', editorText?.length, 'ASASD');
                                                        // setEditable(false);
                                                    }
                                                }}
                                                // editable={editable}
                                                // setEditable={setEditable}
                                                tools={[
                                                    [Bold, Italic, Underline, Strikethrough],

                                                    [
                                                        TextColorPicker,
                                                        BackgroundColorPicker,
                                                        //   CustomForeColor,
                                                        //   CustomBackColor,
                                                        ImageUploadMobile,
                                                    ],

                                                    [, (props) => (
                                                        <EmojiPickerMobile
                                                            {...props}
                                                            maxLength={notificationEditorMaxLength}
                                                            onEditorMaxLen={seIsEditorMaxLen}
                                                        />
                                                    ), (props) => (
                                                        <Personalize
                                                            {...props}
                                                            maxLength={notificationEditorMaxLength}
                                                            onEditorMaxLen={seIsEditorMaxLen}
                                                        />
                                                    ), (props) => (
                                                        <InsertOffer
                                                            {...props}
                                                            maxLength={notificationEditorMaxLength}
                                                            onEditorMaxLen={seIsEditorMaxLen}
                                                        />
                                                    ),],
                                                ]}
                                                handleChange={handleChange}
                                                handleImageData={handleImageData}
                                                editValue={editorText}
                                                handleTextLength={handleEditorTextLengthForMobile}
                                                onBlur={(e) => {
                                                    seIsEditorMaxLen(false)
                                                }}
                                            />
                                            <div className="rs-editor-bottom-message">
                                                <div className="editor-message-right">
                                                    <small>
                                                        <span className="emr-length">
                                                            {editorTextLenghtMobile} / {notificationEditorMaxLength}
                                                        </span>
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Col>
                            {/* /Left column ends */}
                            {/* Right column starts */}
                            <Col sm={`${getValues('deliveryType')?.id === 3 ? 5 : 6}`}>
                                <div className="rsamp-text">{PREVIEW}</div>
                                <div
                                    className={` ${!editorText?.length ? 'rs-mobile-preview-disable' : 'rs-mobile-preview-enable'
                                        }`}
                                >
                                    {/* {(title?.text || editorText || previewImage) && ( */}

                                    <RSTabber
                                        defaultClass={`col-md-2 tabTransparent `}
                                        dynamicTab={`mb0 mini mt3`}
                                        activeClass={`active`}
                                        className="rs-tabs row rsamp-dropdown"
                                        componentClassName={`webCreate-wrapper position-relative windows ${location?.campaignType === 'M' ? 'rs-web-mdc-preview' : ''} w-100`}
                                        defaultTab={0}
                                        tabData={[
                                            {
                                                id: 'chrome',
                                                text: CHROME,
                                                component: () => (
                                                    <Preview
                                                        type="chrome"
                                                        {...previewProps}
                                                        previewActive={
                                                            !!title?.text || !!editorText || !!previewImage
                                                        }
                                                        channelType="web"
                                                        deliveryType={layoutPosition}
                                                    />
                                                ),
                                            },
                                            {
                                                id: 'firefox',
                                                text: FIREFOX,
                                                component: () => (
                                                    <Preview
                                                        type="firefox"
                                                        {...previewProps}
                                                        previewActive={
                                                            !!title?.text || !!editorText || !!previewImage
                                                        }
                                                        channelType="web"
                                                        deliveryType={layoutPosition}
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
                                                    data={handlePersonalization(personalization, location?.audience?.length ? location?.audience : (watch('audience')?.length ? watch('audience') : getValues()?.audience), listTypeWisePersonlization)}
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
                                            maxlength={notificationEditorMaxLength}
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
                                        <small>{editorText?.length} / {notificationEditorMaxLength}</small>
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
                                                            data={handlePersonalization(personalization, location?.audience?.length ? location?.audience : (watch('audience')?.length ? watch('audience') : getValues()?.audience), listTypeWisePersonlization)}
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
                                                    maxlength={notificationEditorMaxLength}
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
                                                <small>{editorText?.length} / {notificationEditorMaxLength}</small>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            {isEditorMaxLen && (
                                                <small className="color-primary-red">
                                                    Max. {notificationEditorMaxLength}
                                                </small>
                                            )}
                                            <TextEditorMobile
                                                isSplit={isSplit}
                                                fieldName={fieldName}
                                                onChange={(e) => {
                                                    setValue(editorTextName, e);
                                                    seIsEditorMaxLen(false)
                                                    if (editorText?.length >= notificationEditorMaxLength) {

                                                        setEditable(false);
                                                    }
                                                }}
                                                editable={editable}
                                                setEditable={setEditable}
                                                tools={[
                                                    [(props) => <Personalize {...props} maxLength={notificationEditorMaxLength} onEditorMaxLen={seIsEditorMaxLen} />, TimerIcon],
                                                    [Bold, Italic, Underline, Strikethrough],
                                                    [ForeColor, BackColor, ImageUploadMobile],
                                                ]}
                                                handleChange={handleChange}
                                                handleImageData={handleImageData}
                                                editValue={editorText}
                                            />
                                            <div className="text-end mt5">
                                                <small>{editorTextLength} / {notificationEditorMaxLength}</small>
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
