import { QRcode } from 'Assets/Images';
import { getDateWithAddMinutes } from 'Utils/modules/dateTime';
import { getChannelId } from 'Utils/modules/communicationChannels';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { ENTER_EDITOR_TEXT, ENTER_TEMPLATE_ID, SELECT_AUDIENCE, SELECT_SENDER_ID } from 'Constants/GlobalConstant/ValidationMessage';
import { EDIT_CURLY_BRACES, LIVE_PREVIEW, PERSONALIZATION, PREVIEW, SENDER_TEMPLATEID, SMART_LINK_POPUP, SMS_AUDIENCE_COUNT, TEMPLATE_ID } from 'Constants/GlobalConstant/Placeholders';
import { alert_mini, circle_plus_fill_medium, circle_question_mark_mini, close_medium, editor_personalize_medium, editor_smart_link_medium, eye_medium, question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { get as _get, upperCase as _upperCase } from 'Utils/modules/lodashReplacements';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

import { MAX_SMART_LINKS, SMARTLINK_BOOTSTRAP_DROPDOWN_DEFAULT_ID } from 'Constants/GlobalConstant/InputLimit';

import RSTooltip from 'Components/RSTooltip';
import EmojiPicker from 'Components/EmojiPicker';
import RSPPophover from 'Components/RSPPophover';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import Scheduler from '../../../../Component/Scheduler';
import RSTextarea from 'Components/FormFields/RSTextarea';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import LivePreviewModal from '../LivePreviewModal/LivePreviewModal';
import MessagingContext from '../../context';
import { getSmartLinksListWithLabels } from 'Reducers/communication/createCommunication/smartlink/selectors';
import { updateSmartLinkModalState, updateSmartLinkAutoAdd } from 'Reducers/communication/createCommunication/Create/reducer';

import { getSmartUrlDetailByChannel } from 'Reducers/communication/createCommunication/smartlink/request';
import useQueryParams from 'Hooks/useQueryParams';
import { getRequestApprovalList, getSessionId, getUtcTimeData } from 'Reducers/globalState/selector';
import { RSMobilePreview, PREVIEW_SOURCE } from 'Components/Previews';
import InsertOffer from '../../../../Component/InsertOffer';

import WarningPopup from 'Pages/AuthenticationModule/Components/WarningPopup/WarningPopup';
import { handlePersonalization } from '../../../../constant';
import { getUtcTimeNow } from 'Reducers/globalState/request';
import {
    usePersonalizationHighlight,
    getHighlightedHTML,
    useRestrictedPlaceholderEdit,
    buildProgrammaticInsert,
    canInsertPersonalizationIntoTextarea,
    canInsertPersonalizationAt,
    canInsertSmartLinkIntoTextarea,
    canInsertSmartLinkAt,
    canInsertEmojiIntoTextarea,
    canInsertEmojiAt,
    isCaretAllowedPosition,
} from 'Utils/personalizationHighlight';
import NewAttributeBtn from 'Pages/AuthenticationModule/Audience/Pages/AddImportAudience/Components/CustomHeaderColumn/NewAttributeBtn';
import useApiLoader from 'Hooks/useApiLoader';
import SmartLinkInsertingOverlay from 'Components/SmartLinkInsertingOverlay';
import { AUTHORING_FIELD_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';
import { ensureArray, ensureObject } from 'Pages/AuthenticationModule/Audience/audienceDefaults';

const SplitAB = ({ fieldName, isSplitTabs = true, templateType = 1, channelTabName, waSelectedTemplate, audienceCount = 0 }) => {
    // console.log('channelTabName: ', channelTabName);
    const {
        control,
        setValue,
        getValues,
        trigger,
        watch,
        handleSubmit,
        setError,
        setFocus,
        clearErrors,
        formState: { errors },
        reset,
        unregister
    } = useFormContext();
    const context = useContext(MessagingContext);
    const { smsTemplateList = [], isSmsTemplateListLoading = false } = context || {};
    const inputRef = useRef();
    const { backdropRef, syncBackdropScroll } = usePersonalizationHighlight();
    const [isToolbarActive, setIsToolbarActive] = useState(false);
    const { editorRef, getEditorTextarea, restoreTextareaSelection } = useRestrictedPlaceholderEdit(
        'single',
        (allowed) => setIsToolbarActive(allowed)
    );
    const location = useQueryParams('/communication');
    const dispatch = useDispatch();
    const [preview, setPreview] = useState(false);
    const [dataSource, setDataSource] = useState('TL');
    const [levelNumber, setLevelNumber] = useState('');
    const [campaignType, setCampaignType] = useState('');
    const [mdcSchedule, setMdcSchedule] = useState('');
    const [emojiData, setEmojiData] = useState([]);
    const smartLinkInsertLoader = useApiLoader();
    const smsEditorMaxLength = 1000;
    // const [waEditorDefaultText, setWaEditorDefaultText] = useState('');
    const { personalization, listTypeWisePersonlization } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const smartLinks = ensureArray(useSelector((state) => getSmartLinksListWithLabels(state)));
    const handleOpenWithAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (smartLinks.length > 0) {
            dispatch(updateSmartLinkAutoAdd(true));
        }
        dispatch(updateSmartLinkModalState(true));
    };
    // const {
    //     verticalTab: { type: channelType },
    // } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { parentClientId, ...payload } = useSelector((state) => getSessionId(state));
    // console.log('payload: ', payload);
    const usersList = ensureArray(useSelector((state) => getRequestApprovalList(state)));
    const name = isSplitTabs ? `${fieldName}.editorText` : 'editorText';
    const mediaURL = isSplitTabs ? `${fieldName}.waMediaURL` : 'waMediaURL';
    const mediaType = isSplitTabs ? `${fieldName}.waMediaURLType` : 'waMediaURLType';
    const audienceName = 'audience';
    const previewImageName = isSplitTabs ? `${fieldName}.previewImage` : 'previewImage';
    const previewImage = watch(previewImageName);
    const senderIdName = 'senderId';
    const [isFailure, setIsFailure] = useState({
        status: false,
        message: '',
    });
    const [pasteErrorMessage, setPasteErrorMessage] = useState('');
    const [isCustomTemplateId, setIsCustomTemplateId] = useState(false);
    const senderId = watch(senderIdName, {});
    // console.log('senderId: ', senderId);
    const approvalListName = 'approvalList';

    const templateIdName = isSplitTabs ? `${fieldName}.templateId` : 'templateId';
    const isCustomTemplateWatch = isSplitTabs ? `${fieldName}.isCustomTemplateId` : 'isCustomTemplateId';

    // const editorText = watch(name);
    const [
        splitTest,
        currentSplitTab,
        channelType,
        editorText,
        waMediaURL,
        waMediaURLType,
        approvalList,
        layoutPosition,
        audience,
        templateName,
        schedule,
    ] = watch([
        'splitTest',
        'currentSplitTab',
        'channelType',
        name,
        mediaURL,
        mediaType,
        approvalListName,
        'layoutPosition',
        audienceName,
        'templateName',
        'schedule',
    ]);
    // console.log('Smart links :::: ', smartLink);
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
    // const editorText = watch(name);
    // const waMediaURL = watch(mediaURL);
    // const waMediaURLType = watch(mediaType);

    const utcTimeData = useSelector(getUtcTimeData);

    useEffect(() => {
        dispatch(getUtcTimeNow());
    }, [dispatch]);

    useEffect(() => {
        if (editorText) trigger(name); // validation purpose

        setBubbleContent(editorText);
    }, [editorText]);
    // console.log('editorText: ', editorText);

    // useEffect(() => {
    //     console.log('waSelectedTemplate', waSelectedTemplate);
    //     if (waSelectedTemplate?.waTemplateId > 0) {
    //         const regex = new RegExp(`{{` + '.*?' + `}}`, 'g');
    //         const defaultText = waSelectedTemplate['templateContent'].replace(regex, '');
    //         setWaEditorDefaultText(defaultText);
    //     }
    // }, [waSelectedTemplate?.waTemplateId]);
    useEffect(() => {
        const campaignType = _get(location, 'campaignType', 'S');
        const mdcContentSetupDetails = _get(location, 'mdcContentSetupDetails', {});
        const levelNumber = _get(mdcContentSetupDetails, 'levelNumber', 1);
        const dataSource = _get(mdcContentSetupDetails, 'dataSource', 'TL');
        const mdcAudience = _get(mdcContentSetupDetails, 'audience', []);
        setCampaignType(campaignType);
        setLevelNumber(levelNumber);
        setDataSource(campaignType === 'T' ? 'DL' : dataSource);
        if (campaign.campaignType === 'M') {
            setValue(audienceName, mdcAudience);
            if (levelNumber > 1) {
                setMdcSchedule(_get(mdcContentSetupDetails, 'scheduleDate', ''));
            }
        }
    }, [location]);
    const handleSelectionChange = (e) => {
        const { selectionStart, selectionEnd, value } = e.target;
        if (!isCaretAllowedPosition(value, selectionStart, selectionEnd, 'single')) {
            if (document.activeElement !== e.target) {
                return;
            }
            inputRef.current = undefined;
            return;
        }
        inputRef.current = {
            startPoistion: selectionStart,
            endPosition: selectionEnd,
        };
    };

    const handleEditorBlur = (e) => {
        const wrapper = editorRef.current?.closest('.rs-textarea-component-wrapper');
        if (wrapper && e?.relatedTarget && wrapper.contains(e.relatedTarget)) {
            return;
        }
        inputRef.current = undefined;
    };

    const getInsertSelection = (ta, { isEmoji = false, isSmartLink = false } = {}) => {
        if (ta && document.activeElement === ta) {
            const allowed = isEmoji
                ? canInsertEmojiIntoTextarea(ta, 'single')
                : isSmartLink
                    ? canInsertSmartLinkIntoTextarea(ta, 'single')
                    : canInsertPersonalizationIntoTextarea(ta, 'single');
            if (!allowed) return null;
            return { start: ta.selectionStart, end: ta.selectionEnd };
        }
        if (inputRef.current) {
            const text = editorText || '';
            const start = inputRef.current.startPoistion;
            const end = inputRef.current.endPosition;
            const allowedAt = isEmoji
                ? canInsertEmojiAt(text, start, end, 'single')
                : isSmartLink
                    ? canInsertSmartLinkAt(text, start, end, 'single')
                    : canInsertPersonalizationAt(text, start, end, 'single');
            if (!allowedAt) {
                return null;
            }
            return { start, end };
        }
        return null;
    };

    const insertContentAtCursor = (content, { isEmoji = false, isSmartLink = false } = {}) => {
        const ta = getEditorTextarea();
        const selection = getInsertSelection(ta, { isEmoji, isSmartLink });
        if (!selection) {
            return;
        }

        const text = editorText || '';
        const insertResult = buildProgrammaticInsert(
            text,
            content,
            selection.start,
            selection.end,
            'single',
            { isEmoji, isSmartLink },
        );
        if (!insertResult) {
            return;
        }

        if (insertResult.value.length <= smsEditorMaxLength) {
            setValue(name, insertResult.value);
            trigger(name);
            inputRef.current = {
                startPoistion: insertResult.newCursorPosition,
                endPosition: insertResult.newCursorPosition,
            };
            restoreTextareaSelection(ta, insertResult.newCursorPosition);
        } else {
            setError(`editorText`, {
                type: 'custom',
                message: `Max. ${smsEditorMaxLength}`,
            });
        }
    };
    const [bubbleContent, setBubbleContent] = useState('');
    const [personalizationWarning, setPersonalizationWarning] = useState('');
    useEffect(() => {
        switch (context.type) {
            case 'sms':
                setBubbleContent(
                    editorText,
                    //  `Dear [[Firstname]]|[[first name]],<br>Click here to get 5% discount on apparels through our debit card.<br><a href="">Click here</a> to avail the offer 👍<br><a href="https://resu.io/ap7Xgb">https://resu.io/ap7Xgb</a></div>`,
                );
                break;
            case 'mms':
                setBubbleContent(
                    editorText,
                    //   `Dear VIP customer,<br />Our new fall menu is here. Scan this QR and avail exciting offer.<br /><img src=${QRcode} alt="Logo" class="mt10" />`,
                );
                break;
            case 'whatsapp':
                setBubbleContent(
                    editorText,
                    //  `<p class="user-name">Vision bank</p>Dear John,<br><a href="">Click here</a> to get 5% discount on apparels through our debit card.<div class="wbrwc-user">V</div><div class="wbrwc-time">6:03 AM</div>`,
                );
                break;
            case 'line':
                setBubbleContent(
                    editorText,
                    // `Dear [[Firstname]]|[[first name]],<br>Click here to get 5% discount on apparels through our debit card.<br><a href="">Click here</a> to avail the offer 👍<br><a href="https://resu.io/ap7Xgb">https://resu.io/ap7Xgb</a></div>`,
                );
                break;
            case 'viber':
                setBubbleContent(
                    editorText,
                    //   `Dear [[Firstname]]|[[first name]],<br>Click here to get 5% discount on apparels through our debit card.<br><a href="">Click here</a> to avail the offer 👍<br><a href="https://resu.io/ap7Xgb">https://resu.io/ap7Xgb</a></div>`,
                );
                break;
            default:
                setBubbleContent('smsssmsmsmssmsmssss');
                break;
        }
    }, [context.type]);

    useEffect(() => {
        const text = editorText || '';
        const tokenPattern = /\[\[(.*?)\]\]/g;
        let match;
        let hasLong = false;
        while ((match = tokenPattern?.exec(text)) !== null) {
            const inner = (match[1] || '').trim();
            if (inner.length > 30) {
                hasLong = true;
                break;
            }
        }
        setPersonalizationWarning(
            hasLong ? 'If personalization value exceeds 30 characters, it may impact delivery.' : '',
        );
    }, [editorText]);

    const handleChange = async (smartLinkData, type, emoji) => {
        // debugger;
        // console.log('DAta ::::::::::::: ', smartLinkData, channelType, type);
        // console.log('smartLinkData: ', smartLinkData?.length + editorText?.length);
        const mdcContentSetupDetails = _get(location, 'mdcContentSetupDetails', {});
        if (type === 'dynamic') {
            let goalValue = 0,
                blastValue = 1,
                parentClientValue = 0,
                actionValue = 0,
                channelName = '';
            goalValue = smartLinkData?.goalNo ?? 0;

            if (campaign?.campaignType === 'S') {
                blastValue = 1;
                parentClientValue = 0;
                actionValue = 1;
            } else if (campaign?.campaignType === 'T') {
                blastValue = 1;
                parentClientValue = 0;
                actionValue = 1;
            } else {
                // console.log(location);
                blastValue = _get(mdcContentSetupDetails, 'levelNumber', '');
                parentClientValue = _get(mdcContentSetupDetails, 'parentChannelDetailId', 0);
                actionValue = _get(mdcContentSetupDetails, 'actionId', 0);
                channelName = _get(mdcContentSetupDetails, 'name', '');
                channelName = channelName?.toLowerCase?.() ?? '';
            }
            if (Object.keys(ensureObject(senderId)).length === 0) {
                setError(senderIdName, {
                    type: 'custom',
                    message: SELECT_SENDER_ID,
                });
                setFocus(senderIdName);
                return;
            }
            const channelId =
                campaign?.campaignType === 'M' ? getChannelId(channelName)?.id : getChannelId(channelType)?.id;
            const channelPayload = {
                ...payload,
                campaignId: campaign?.campaignId,
                blastType: splitTest ? splitObj?.[currentSplitTab] : '',
                channelId: context?.type === 'whatsapp' ? 21 : 2,
                goalNo: goalValue,
                blastNo: blastValue,
                parentChannelDetailId: parentClientValue,
                actionId: actionValue,
                senderId: senderId?.senderId?.split('(')?.[0]?.replace(/_/g, ''),
                subSegmentId: _get(mdcContentSetupDetails, 'subSegmentId', 0),
            };

            const { status, data } =
                (await smartLinkInsertLoader.refetch({
                    fetcher: ({ payload: smartPayload } = {}) =>
                        dispatch(getSmartUrlDetailByChannel({ payload: smartPayload, loading: false })),
                    mode: 'create',
                    loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                    params: { payload: channelPayload },
                })) || {};
            if (status) {
                const { urlName, smartCode, blastSC } = data || {};
                const smartURL = urlName + smartCode + blastSC;
                insertContentAtCursor(smartURL, { isSmartLink: true });
            }
        } else {
            insertContentAtCursor(smartLinkData, { isEmoji: !!emoji });
        }
    };

    const calculateSmsCount = (textLength, messageType) => {
        if (!textLength || textLength <= 0) return 1;
        if (textLength > 918) return 7;
        if (textLength > 765) return 6;
        if (textLength > 612) return 5;
        if (textLength > 459) return 4;
        if (textLength > 306) return 3;
        if (textLength > 160) return 2;
        return 1;
    };

    const noOfSms = calculateSmsCount(editorText?.length, 'sms');
    // const noOfSms = Math.floor(editorText?.length / 161);
    const additionalNo = noOfSms === 3 ? 0 : 1;

    // Calculate minimum date for scheduler based on previous split tab's schedule
    const splitTabLetters = ['A', 'B', 'C', 'D', 'E'];
    const currentTabLetter = fieldName?.replace('split', '').toUpperCase() || '';
    const currentTabIndex = splitTabLetters.indexOf(currentTabLetter);

    // Get the previous tab's schedule field name to watch
    const previousTabScheduleFieldName = useMemo(() => {
        if (!isSplitTabs || currentTabIndex <= 0) return null;
        const previousTabLetter = splitTabLetters[currentTabIndex - 1];
        return `split${previousTabLetter}.schedule`;
    }, [isSplitTabs, fieldName, currentTabIndex]);

    // Watch the previous tab's schedule
    const previousTabSchedule = previousTabScheduleFieldName ? watch([previousTabScheduleFieldName])[0] : null;

    // Calculate minimum date: previous schedule + 5 minutes
    const getMinDateForScheduler = useMemo(() => {
        if (!isSplitTabs || !fieldName || currentTabIndex <= 0) return null;

        // If previous tab has a schedule, add 5 minutes to it
        if (previousTabSchedule && previousTabSchedule instanceof Date && !isNaN(previousTabSchedule.getTime())) {
            return getDateWithAddMinutes(previousTabSchedule, 5);
        }

        return null;
    }, [isSplitTabs, fieldName, currentTabIndex, previousTabSchedule]);

    const TemplateIdField = useMemo(() => {
        if (!(senderId?.clientSmsSettingId || senderId > 0)) return null;

        const footer = smsTemplateList?.length > 0 ? (
            <NewAttributeBtn
                title="Custom Template Id"
                handleModalAttribute={() => {
                    unregister(templateIdName)
                    setValue(templateIdName, '');
                    setValue(name, '');
                    clearErrors(templateIdName)
                    setValue(isCustomTemplateWatch, true);
                }}
            />
        ) : null;

        if (watch(isCustomTemplateWatch)) {
            return (
                <div className="form-group mt20">
                    <Row>
                        <Col sm={{ offset: 1, span: 2 }}>
                            <label className="control-label-left">{TEMPLATE_ID}</label>
                        </Col>
                        <Col sm={6} className='position-relative'>
                            <RSInput
                                control={control}
                                id="rs_SplitAB_templadeIdName"
                                name={templateIdName}
                                label={SENDER_TEMPLATEID}
                                rules={LIST_NAME_RULES(ENTER_TEMPLATE_ID)}
                                required
                                maxLength={MAX_LENGTH50}
                            />
                            <RSTooltip position="top" text="Close" className="cp bottom2 position-absolute right15 zIndex2" >
                                <i
                                    className={`${close_medium}  color-primary-red`}
                                    onClick={() => {
                                        unregister(templateIdName)
                                        clearErrors(templateIdName)
                                        setValue(templateIdName, '');
                                        setValue(isCustomTemplateWatch, false);
                                    }}
                                ></i>
                            </RSTooltip>
                        </Col>
                    </Row>
                </div>
            );
        }

        return (
            <div className="form-group mt20">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{TEMPLATE_ID}</label>
                    </Col>
                    <Col sm={6}>
                        {smsTemplateList?.length > 0 || isSmsTemplateListLoading ? (
                            <RSKendoDropDownList
                                control={control}
                                name={templateIdName}
                                data={smsTemplateList}
                                dataItemKey="templateId"
                                textField="templateName"
                                label={SENDER_TEMPLATEID}
                                isLoading={isSmsTemplateListLoading}
                                required
                                rules={smsTemplateList?.length ? {
                                    required: 'Select template'
                                } : {}}
                                footer={footer}
                                handleChange={(e) => {
                                    setValue(name, e.target.value.templateContent || '')
                                }}
                            />
                        ) : (
                            <RSInput
                                control={control}
                                id="rs_SplitAB_templadeIdName"
                                name={templateIdName}
                                label={SENDER_TEMPLATEID}
                                rules={{
                                    required: 'Enter template ID'
                                }}
                                required
                                maxLength={MAX_LENGTH50}
                            />
                        )}
                    </Col>
                </Row>
            </div>
        );
    }, [senderId, smsTemplateList, isSmsTemplateListLoading, watch(templateIdName), watch(isCustomTemplateWatch)]);

    return (
        <Fragment>
            <div className="split-tab-content-holder mt40">
                {TemplateIdField}
                <div className="form-group mb0">
                    <Row>
                        {' '}
                        <Col sm={{ offset: 1, span: 10 }}>
                            <div className="rs-live-preview-wrapper mt30">
                                <div className="rsamp-text">{PREVIEW}</div>
                            </div>
                        </Col>
                    </Row>

                    {/* <div className="rsamp-text">Live preview</div> */}
                </div>
                <div className="form-group ">
                    <Row>
                        {/* Left column starts */}
                        <Col sm={{ offset: 1, span: 6 }} className='mb30'>
                            <div className="rs-textarea-component-wrapper preview-mobile-editor position-relative ">
                                <SmartLinkInsertingOverlay isLoading={smartLinkInsertLoader.isLoading} />
                                <div className="rstcw-top-icons">
                                    <ul className={`float-left ${isToolbarActive ? '' : 'click-off pe-none'}`}>
                                        <li>
                                            <RSTooltip text={PERSONALIZATION} className="lh0">
                                                <RSBootstrapdown
                                                    title={PERSONALIZATION}
                                                    data={handlePersonalization(
                                                        personalization,
                                                        ensureArray(
                                                            location?.audience?.length
                                                                ? location?.audience
                                                                : watch('audience')?.length
                                                                    ? watch('audience')
                                                                    : getValues()?.audience,
                                                        ),
                                                        listTypeWisePersonlization,
                                                    )}
                                                    isObject
                                                    fieldKey="personalizationKey"
                                                    flatIcon
                                                    defaultItem={{
                                                        attributeName: '',
                                                        dataAttributeId: 0,
                                                        fallbackAttributeName: null,
                                                        personalizationKey: (
                                                            <i
                                                                //title="Personalize"
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
                                        <li className="emoji-top">
                                            {/* <RSTooltip text="Emoji" className="lh0"> */}
                                            <EmojiPicker
                                                onEmojiSelect={(e) => handleChange(e.native, 'static', 'emoji')}
                                                isTextEditor
                                            />
                                            {/* </RSTooltip> */}
                                        </li>
                                        <li>
                                            <RSTooltip text={SMART_LINK_POPUP} className="lh0">
                                                <RSBootstrapdown
                                                    data={smartLinks}
                                                    flatIcon
                                                    isObject
                                                    idKey="id"
                                                    fieldKey="menuLabel"
                                                    defaultItem={{
                                                        id: SMARTLINK_BOOTSTRAP_DROPDOWN_DEFAULT_ID,
                                                        menuLabel: (
                                                            <i
                                                                //title="Smart link"
                                                                className={`${editor_smart_link_medium} icon-md`}
                                                            />
                                                        ),
                                                    }}
                                                    showUpdate={false}
                                                    name="smartlink"
                                                    className="no_caret"
                                                    popupSettings={{
                                                        popupClass: `addImportSmartLinkDropdownListContainer`,
                                                    }}
                                                    footer={
                                                        smartLinks.length < MAX_SMART_LINKS ? (
                                                            <div
                                                                className="dropdown-footer-item"
                                                                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                                onClick={handleOpenWithAdd}
                                                            >
                                                                <span>Add Smart Link</span>
                                                                <i className={`${circle_plus_fill_medium} icon-md color-primary-blue`} />
                                                            </div>
                                                        ) : null
                                                    }
                                                    onSelect={(e) => handleChange(e, 'dynamic')}
                                                />
                                            </RSTooltip>
                                        </li>
                                        <li>
                                            {/* <RSTooltip text="Coupon code" className="lh0"> */}
                                            <InsertOffer insert={(e) => handleChange(e, 'static')} textArea={true} audienceCount={audienceCount} />
                                            {/* </RSTooltip> */}
                                        </li>
                                    </ul>
                                    <ul
                                        className={`float-right ${!editorText?.length ? 'click-off' : ''
                                            } position-relative right-10 preview-right`}
                                    >
                                        <li className="border-0">
                                            <RSTooltip text={LIVE_PREVIEW} className="lh0">
                                                <i
                                                    //title="Preview"
                                                    className={`${eye_medium} icon-md cp`}
                                                    id="rs_data_eye"
                                                    onClick={() => {
                                                        if (
                                                            campaignType === 'S' &&
                                                            (ensureArray(audience).length === 0)
                                                        ) {
                                                            setError(audienceName, {
                                                                type: 'custom',
                                                                message: SELECT_AUDIENCE,
                                                            });
                                                        } else if (
                                                            usersList.length === 0
                                                        ) {
                                                            setIsFailure({
                                                                status: true,
                                                                message: 'Key person info not found.',
                                                            });
                                                        } else {
                                                            setPreview(true);
                                                        }
                                                    }}
                                                />
                                            </RSTooltip>
                                        </li>
                                    </ul>
                                </div>
                                <div ref={editorRef} className={`rs-textarea-editor sms ${smartLinkInsertLoader.isLoading ? 'click-off' : ''}`}>
                                    {(pasteErrorMessage || _get(errors, `${name}.message`, '')) && (
                                        <div className="validation-message color-primary-red">
                                            {pasteErrorMessage || _get(errors, `${name}.message`, '')}
                                        </div>
                                    )}
                                    <div
                                        ref={backdropRef}
                                        className="personalization-backdrop"
                                        aria-hidden="true"
                                        dangerouslySetInnerHTML={{ __html: getHighlightedHTML(watch(name)) }}
                                    />
                                    <RSTextarea
                                        control={control}
                                        name={name}
                                        maxLength={smsEditorMaxLength}
                                        onKeyUp={(e) => handleSelectionChange(e)}
                                        onClick={(e) => handleSelectionChange(e)}
                                        onBlur={handleEditorBlur}
                                        handleChange={(e) => {
                                            handleSelectionChange(e);
                                            if (backdropRef.current) {
                                                backdropRef.current.innerHTML = getHighlightedHTML(e.target.value);
                                            }
                                        }}
                                        onScroll={syncBackdropScroll}
                                        onPasteError={setPasteErrorMessage}
                                        required={true}
                                        isError={false}
                                        customWebpushClassname="h-100"
                                        rules={{
                                            required: ENTER_EDITOR_TEXT,
                                            validate: (value) => {
                                                const currentText = value;
                                                const regex = new RegExp(`{{` + '.*?' + `}}`, 'g');
                                                const newText = currentText.replace(regex, '');

                                                if (waSelectedTemplate?.waTemplateId > 0) {
                                                    const regex = new RegExp(`{{` + '.*?' + `}}`, 'g');
                                                    const waEditorDefaultText = waSelectedTemplate[
                                                        'templateContent'
                                                    ].replace(regex, '');

                                                    // Remove all `\r` characters if new lines are added to the template content.
                                                    const updateWAEditorDefaultText = waEditorDefaultText.replace(
                                                        /\r/g,
                                                        '',
                                                    );
                                                    const updateNewText = newText.replace(/\r/g, '');
                                                    let rslt =
                                                        updateNewText?.trim() === updateWAEditorDefaultText?.trim() ||
                                                            waEditorDefaultText === '' ||
                                                            newText === ''
                                                            ? true
                                                            : EDIT_CURLY_BRACES;

                                                    return rslt;
                                                }
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                            {/* <div className="text-end mt5">
                                <small>
                                    {editorText?.length} / {context.type === 'whatsapp' ? smsEditorMaxLength : '500'}{' '}
                                    {!!editorText?.length && (
                                        <Fragment>
                                            {' | '}
                                            {context.type !== 'whatsapp' && (
                                                <RSPPophover text="If the number of characters exceeds more than 160 then additional charges for the SMS may be incurred.">
                                                    <i
                                                        className={`${question_mark_mini} color-primary-blue fs13 position-relative top1`}
                                                    />
                                                </RSPPophover>
                                            )}
                                            {/* ({noOfSms + additionalNo} {_upperCase(context.type)}/audience) */}
                            {/* {noOfSms + additionalNo} {context.type === 'whatsapp' ? 'WhatsApp' : 'SMS'}
                                            /audience)
                                        </Fragment>
                                    )}
                                </small>
                            </div> */}

                            <div className="rs-editor-bottom-message rsebm-sms">
                                <span className='d-flex'>
                                    {personalizationWarning && (
                                        <>
                                            <i className={`${alert_mini} icon-xs color-primary-orange  cursor-default`}></i>
                                            <small className="color-primary-orange position-absolute w-25 ml25 fs10 pr20">{personalizationWarning}</small>
                                        </>
                                    )}
                                </span>
                                <div className="emr-sms editor-message-right w-100">
                                    <small>
                                        <span className="emr-length sms">
                                            {editorText?.length}/{' '}
                                            {smsEditorMaxLength} |
                                            <span className="emr-info ml3">
                                                ({noOfSms}{' '}
                                                <span className="text-uppercase">
                                                    {_upperCase('sms')}
                                                </span>
                                                /contact)
                                            </span>
                                            <RSPPophover
                                                pophover={
                                                    <ul className="rs-tooltip-text-multi">
                                                        <li>
                                                            <span>
                                                                If your{' '}
                                                                {_upperCase('sms')}{' '}
                                                                has over 160 characters then additional charges may be incurred.
                                                            </span>
                                                        </li>
                                                        <li>
                                                            <span>{SMS_AUDIENCE_COUNT}</span>
                                                        </li>
                                                    </ul>
                                                }
                                            >
                                                <i
                                                    className={`${circle_question_mark_mini} icon-xs color-primary-blue editor-help-icon ml5`}
                                                    id="circle_question_mark"
                                                />
                                            </RSPPophover>
                                        </span>
                                    </small>
                                </div>
                            </div>
                        </Col>
                        {/* /Left column ends */}
                        {/* Right column starts */}
                        {/* <Col sm={4} className="pl25 pr0"> */}
                        <Col sm={4} className='pr0'>
                            <div
                                className={`${!editorText?.length ? 'rs-mobile-preview-disable' : ''
                                    } `}
                            >
                                <RSMobilePreview
                                    previewSource={PREVIEW_SOURCE.AUTHORING}
                                    mobileType="ios"
                                    bubbleType={context}
                                    barHeight={'medium'}
                                    bubbleContent={`<p>${editorText}</p>`}
                                    // bubbleContent={`${getMediaSource(
                                    //     waMediaURL,
                                    //     waMediaURLType,
                                    // )}<p>${bubbleContent}</p>`}
                                    searchIcon
                                    previewImage={previewImage}
                                    schedule={levelNumber < 2 ? schedule : mdcSchedule}
                                />
                                {/* <div
                                    className={`rsm-preview-buttons ${
                                        !editorText?.length ? 'click-off' : ''
                                    } mt20 pr21 float-end`}
                                > */}
                                {/* <div
                                    className={`rsm-preview-buttons ${
                                        !editorText?.length ? 'click-off' : ''
                                    } mt75 pr73 float-end`}
                                >
                                    
                                    <RSPrimaryButton>Send to me</RSPrimaryButton>
                                </div> */}
                            </div>
                        </Col>
                        {/* /Right column ends */}
                    </Row>
                </div>

                {(!levelNumber || levelNumber < 2) && (
                    <>
                        {campaignType === 'S' || (campaignType === 'M' && dataSource === 'TL') ? (
                            <div className='form-group'>
                            <Scheduler
                                utcTime_Data={utcTimeData}
                                isSplitTabs={isSplitTabs}
                                fieldName={fieldName}
                                isRequired={approvalList?.requestApproval ? true : false}
                                // isRequired={isSplitTabs}
                                isSendTimeRecommendation
                                clearErrors={clearErrors}
                                splitABminDate={getMinDateForScheduler}
                                isRfaEnabled={true}
                            />
                            </div>
                        ) : null}
                    </>
                )}
                {/* levelNumber added for MDC --- if levelNumber gerater than 1 disable schedule  */}
            </div>
            {preview && (
                <LivePreviewModal
                    show={preview}
                    type={context.type}
                    audience={audience}
                    // content={
                    //     context.type === 'whatsapp'
                    //         ? `${getMediaSource(waMediaURL, waMediaURLType)}<p>${editorText}</p>`
                    //         : `<p>${editorText}</p>`
                    // }
                    content={`<p>${editorText}</p>`}
                    previewImage={previewImage}
                    handleClose={() => setPreview(false)}
                    sendPreview={async (e) => {
                        await handleSubmit(async (data) => {
                            await context.formSubmitHandler(data, 'live', false, false, e);
                        })();
                        setPreview(false);
                        context.setSmsPreview(true);
                    }}
                    dataSource={dataSource}
                />
            )}
            <WarningPopup
                show={isFailure?.status}
                handleClose={() => {
                    setIsFailure({
                        status: false,
                        message: '',
                    });
                }}
                text={<div className="text-center">{isFailure?.message}</div>}
                showCancel={true}
                isPrimary={false}
            />
        </Fragment>
    );
};

export default SplitAB;
