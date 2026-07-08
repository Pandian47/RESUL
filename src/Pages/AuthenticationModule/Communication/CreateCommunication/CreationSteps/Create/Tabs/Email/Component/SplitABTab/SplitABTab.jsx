import { UpdateState } from 'Utils/modules/misc';
import { sanitizeEmailHtmlForPreview } from 'Utils/modules/stringUtils';
import { removeQueryParams } from 'Utils/modules/urlQuery';
import { createCommunicationSettingsNavState, MAIL_TAB_ID } from 'Utils/modules/navigation';
import { getDateWithAddMinutes } from 'Utils/modules/dateTime';
import { encodeUrl } from 'Utils/modules/crypto';
import { EMAIL_TAB_CONFIG, googleAnnotationConstant, initialState, refreshSplitABFields, resetFieldsOnRefresh, SPLITAB_EMAIL_TAB_CONFIG, stateReducer } from '../../constant';
import { MAX_LENGTH150 } from 'Constants/GlobalConstant/Regex';
import { ENTER_SUBJECT_LINE, SELECT_AUDIENCE, SELECT_UNSUBSCRIPTION_BUTTON_MESSAGE } from 'Constants/GlobalConstant/ValidationMessage';
import { A_SUFFICIENT_NUMBER, ADD_EMAIL_FOOTER, ARE_YOU_SURE_YOU_WANT_TO_LEAVE, CREATE_EMAIL_FOOTER, EMAIL_FOOTER_TEMPLATES, EMAIL_PREVIEW, ENABLE_UNSUBSCRIPTION, KEY_PERSON_INFO_NOT_FOUND, LIVE_PREVIEW, MESSAGE, PREVIEW, SUBJECT_LINE, UNSUBSCRIPTION_MESSAGE } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_medium, circle_question_mark_medium, email_preview_medium, eye_medium, pencil_edit_medium, spam_assassin_medium, template_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { get as _get, cloneDeep as _cloneDeep } from 'Utils/modules/lodashReplacements';
import parse from 'html-react-parser';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { useFormContext, useWatch } from 'react-hook-form';

import { getContentSetupStatus, COMMUNICATION_CHANNEL_ID } from '../../../../constant';
import EmailProvider from '../../context';
import RSTabbar from 'Components/RSTabber';
import RSTooltip from 'Components/RSTooltip';
import RSSwitch from 'Components/FormFields/RSSwitch';
import Scheduler from '../../../../Component/Scheduler';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSEmojiPickerInput from 'Components/EmojiPickerInput';
import LivePreviewModal from '../LivePreviewModal/LivePreviewModal';
import RSBootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import SubjectLineAnalysisModal from '../SubjectLineAnalysisModal/SubjectLineAnalysisModal';

import { useNavigate } from 'react-router-dom';

import { emailList } from 'Reducers/communication/createCommunication/Create/selectors';
import { getCompleteSplitABTabDataSelector } from 'Reducers/communication/createCommunication/Create/emailFormSelectors';
import useQueryParams from 'Hooks/useQueryParams';

import { updateTemplate } from 'Reducers/communication/Template/reducer';
import { updateEmailList } from 'Reducers/communication/createCommunication/Create/reducer';
import WarningPopup from 'Pages/AuthenticationModule/Components/WarningPopup/WarningPopup';

import { handlePersonalization } from '../../../../constant';

import { getUnSubscribeEditData } from 'Reducers/preferences/CommunicationSettings/request';
import {
    getEmailFooterList,
    getUnSubscriptionList,
    getSubjectLineAnalysis,
} from 'Reducers/communication/createCommunication/Create/request';
import UnsubscriptionPreviewModal from '../UnsubscriptionPreviewModal';
import { clearTemplateGalleryCache } from '../Template/Template';
import { AUTHORING_FIELD_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';
import useApiLoader from 'Hooks/useApiLoader';

const SplitABTab = ({ fieldName, isSplit = true, isSubjectLineEnable }) => {

    const dispatch = useDispatch();
    const store = useStore();
    const navigate = useNavigate();
    const [state, setState] = useState({
        subjectAnalysisModal: false,
        isEmailPreviewModal: false,
        subjectLineEnable: false,
        confirmUnsubscribeLostDataModal: false,
        isRSSwitchClickOff: false,
        confirmEmailFooterLostDataModal: false,
        isUnsubscriptionPreviewModal: false
    });
    const { formSubmitHandler, isClickOff } = useContext(EmailProvider);

    const [unsubscriptionPreviewData, setUnsubscriptionPreviewData] = useState(null);
    const [emailFooterListResolved, setEmailFooterListResolved] = useState(false);
    const unsubscriptionPreviewCache = useRef({});
    const unsubscriptionCacheOrder = useRef([]);
    const MAX_CACHE_SIZE = 10;

  const isManualUnsubscriptionChange = useRef(false);
  const unsubscriptionFetchPromiseRef = useRef(null);
  const unsubscriptionListHydratedRef = useRef(false);
  const hasFetchedFooterRef = useRef(false);
  const emailFooterFetchPromiseRef = useRef(null);
  const emailFooterListHydratedRef = useRef(false);
  const [{ splitTabList }] = useReducer(
    stateReducer,
    initialState
  );

    const [mdcContentSetupDetails, setMdcContentSetupDetails] = useState({});
    const [levelNumber, setLevelNumber] = useState('');
    const [campaignType, setCampaignType] = useState('');
    const [dataSource, setDataSource] = useState('TL');
    //const [isClickOff, setIsClickOff] = useState(isClickOffStatus);
    //console.log('isClickOff: ', isClickOff);
    const location = useQueryParams('/communication');

    // OPTIMIZED: Single useSelector call instead of 7, reduces re-renders by ~40%
    const emailFormState = useSelector(getCompleteSplitABTabDataSelector);
    const {
        personalization,
        listTypeWisePersonlization,
        campaignDetails,
        approvalList,
        unSubscriptionList,
        emailFooter: emailFooterList,
        sessionData: { departmentId: { departmentId }, clientId: { clientId }, userId },
        clientList
    } = emailFormState;

    const subjectAnalysisLoader = useApiLoader({ autoFetch: false });
    const unsubscriptionLoader = useApiLoader({ autoFetch: false });
    const emailFooterLoader = useApiLoader({ autoFetch: false });
    const unsubscriptionPreviewLoader = useApiLoader({ autoFetch: false });

    const [isFailure, setIsFailure] = useState({
        status: false,
        message: ''
    });
    const {
        control,
        setValue,
        getValues,
        formState: { errors },
        setError,
        clearErrors,
        watch,
        reset,
        handleSubmit,
        trigger,
        setFocus
    } = useFormContext();

    useEffect(() => {
        const list = emailList(store.getState()).unSubscriptionList;
        unsubscriptionListHydratedRef.current = Boolean(list?.length);
        unsubscriptionFetchPromiseRef.current = null;
    }, [clientId, userId, departmentId, store]);

    useEffect(() => {
        if (unSubscriptionList?.length) {
            unsubscriptionListHydratedRef.current = true;
        }
    }, [unSubscriptionList]);



    const ensureUnSubscriptionListLoaded = useCallback(async () => {
        const readList = () => emailList(store.getState()).unSubscriptionList;
        if (unsubscriptionListHydratedRef.current) {
            return readList();
        }
        let list = readList();
        if (list?.length) {
            unsubscriptionListHydratedRef.current = true;
            return list;
        }
        if (unsubscriptionFetchPromiseRef.current) {
            await unsubscriptionFetchPromiseRef.current;
            return readList();
        }
        const fetchPromise = unsubscriptionLoader.refetch({
            fetcher: ({ payload } = {}) =>
                dispatch(getUnSubscriptionList({ payload, loading: false })),
            mode: 'create',
            loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
            params: { payload: { clientId, userId, departmentId } },
        });
        unsubscriptionFetchPromiseRef.current = fetchPromise;
        try {
            await fetchPromise;
        } finally {
            if (unsubscriptionFetchPromiseRef.current === fetchPromise) {
                unsubscriptionFetchPromiseRef.current = null;
            }
        }
        unsubscriptionListHydratedRef.current = true;
        return readList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, store, clientId, userId, departmentId]);

    const ensureEmailFooterListLoaded = useCallback(async () => {
        const readList = () => emailList(store.getState()).emailFooter;
        if (emailFooterListHydratedRef.current) {
            return readList();
        }
        let list = readList();
        if (list?.length) {
            emailFooterListHydratedRef.current = true;
            setEmailFooterListResolved(true);
            return list;
        }
        if (emailFooterFetchPromiseRef.current) {
            await emailFooterFetchPromiseRef.current;
            return readList();
        }
        const fetchPromise = emailFooterLoader.refetch({
            fetcher: ({ payload } = {}) =>
                dispatch(getEmailFooterList({ payload, loading: false })),
            mode: 'create',
            loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
            params: { payload: { clientId, userId, departmentId } },
        });
        emailFooterFetchPromiseRef.current = fetchPromise;
        try {
            await fetchPromise;
        } finally {
            if (emailFooterFetchPromiseRef.current === fetchPromise) {
                emailFooterFetchPromiseRef.current = null;
            }
        }
        list = readList();
        emailFooterListHydratedRef.current = Boolean(list?.length);
        setEmailFooterListResolved(Boolean(list?.length));
        return list;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, store, clientId, userId, departmentId]);
    const subjectLineName = isSplit ? `${fieldName}.subjectLine` : 'subjectLine';
    const tabErrorTextName = isSplit ? `${fieldName}.tabErrorText` : 'tabErrorText';
    const editorTextName = isSplit ? `${fieldName}.editorText` : 'editorText';
    const edmContentName = isSplit ? `${fieldName}.edmContent` : 'edmContent';
    const edmContentDimensionName = isSplit ? `${fieldName}.edmDimension` : 'edmDimension';
    const templateContentName = isSplit ? `${fieldName}.templateContent` : 'templateContent';
    const sampleEmailFooterName = isSplit ? `${fieldName}.sampleEmailFooter` : 'sampleEmailFooter';
    const currentTabName = isSplit ? `${fieldName}.currentPage` : 'currentPage';
    const unSubscriptionName = isSplit ? `${fieldName}.unSubscription` : 'unSubscription';
    const unsubscriptionMessage = isSplit ? `${fieldName}.unsubscriptionMessage` : 'unsubscriptionMessage';
    const emailFooterName = isSplit ? `${fieldName}.emailFooter` : 'emailFooter';
    const viewInBrowserName = isSplit ? `${fieldName}.viewInBrowser` : 'viewInBrowser';
    const inboxLinePreviewName = isSplit ? `${fieldName}.inboxLinePreview` : 'inboxLinePreview';
    const approvalListName = 'approvalList';
    const audienceName = 'audience';

    const [
        sampleEmailFooter,
        unSubscription,
        emailFooter,
        currentPage = null,
        edmContent = '',
        edmContentDimension = 0,
        templateContent = '',
        viewInBrowser,
        unSubMessage,
        editorText] =
        watch([
            sampleEmailFooterName,
            unSubscriptionName,
            emailFooterName,
            currentTabName,
            edmContentName,
            edmContentDimensionName,
            templateContentName,
            viewInBrowserName,
            unsubscriptionMessage,
            editorTextName]
        );

    const subjectValue = useWatch({ name: subjectLineName }) || '';
    const importTabFormValues = useWatch({ control });
  
  useEffect(() => {
    if (!emailFooter) {
      hasFetchedFooterRef.current = false;
      emailFooterListHydratedRef.current = false;
      return;
    }
    if (!emailFooterList?.length && !hasFetchedFooterRef.current) {
      hasFetchedFooterRef.current = true;
      void ensureEmailFooterListLoaded();
    }
  }, [emailFooter, emailFooterList, ensureEmailFooterListLoaded]);
  // console.log('approvalList: ', approvalList);
    // useEffect(() => {
    //     // console.log('subjectLine:', subjectLine);
    //     if (subjectLine?.length) {
    //         UpdateState(setState, 'subjectLineEnable', true);
    //     } else {
    //         UpdateState(setState, 'subjectLineEnable', false);
    //     }
    // }, [subjectLine]);

    useEffect(() => {
        if (isManualUnsubscriptionChange.current) {
            isManualUnsubscriptionChange.current = false;
            return;
        }

        const footerContent = sampleEmailFooter ?
            sampleEmailFooter?.emailFooterRawcode :
            _get(emailFooterList[0], 'emailFooterRawcode', '');
        const hasUnsubscribeInFooter = footerContent?.toLowerCase().includes('unsubscribe');
        const hasUnsubscribeInTemplate = templateContent?.toLowerCase().includes('unsubscribe');
        const hasUnsubscribeInEdm = edmContent?.toLowerCase().includes('unsubscribe');
        const hasUnsubscribeInEditorText = editorText?.toLowerCase().includes('unsubscribe');

        if (
            emailFooter && hasUnsubscribeInFooter ||
            hasUnsubscribeInTemplate ||
            hasUnsubscribeInEdm ||
            hasUnsubscribeInEditorText) {
            (async () => {
                await ensureUnSubscriptionListLoaded();
                if (!getValues(unSubscriptionName)) {
                    setValue(unSubscriptionName, true);
                    UpdateState(setState, 'isRSSwitchClickOff', true);
                }
            })();
        } else {
            setValue(unSubscriptionName, false);
            UpdateState(setState, 'isRSSwitchClickOff', false);
        }
    }, [
        templateContent,
        emailFooter,
        edmContent,
        sampleEmailFooter,
        editorText,
        emailFooterList,
        ensureUnSubscriptionListLoaded,
        setValue,
        getValues,
        unSubscriptionName]
    );

    useEffect(() => {
        const campaignType = _get(location, 'campaignType', 'S');
        const mdcContentSetupDetails = _get(location, 'mdcContentSetupDetails', {});
        const levelNumber = _get(mdcContentSetupDetails, 'levelNumber', 1);
        const dataSource = _get(mdcContentSetupDetails, 'dataSource', 'TL');

        setCampaignType(campaignType);
        setMdcContentSetupDetails(mdcContentSetupDetails);
        setLevelNumber(levelNumber);
        setDataSource(campaignType === 'T' ? 'DL' : dataSource);
        if (_get(location, 'campaignType', 'S') === 'M') {
            const mdcAudience = _get(mdcContentSetupDetails, 'audience', []);
            setValue(audienceName, mdcAudience);
        }
    }, [location]);

    useEffect(() => {
        if (emailFooterList?.length) {
            setEmailFooterListResolved(true);
        } else {
            setEmailFooterListResolved(false);
        }
    }, [emailFooterList]);

    // useEffect(() => {
    //     const statusId = campaignDetails?.content?.[0]?.statusId;
    //     const approverList = campaignDetails?.requestForApproval?.approvarList;

    //     // Wait until all required data is loaded
    //     if (
    //         location?.campaignType === undefined ||
    //         location?.endDate === undefined ||
    //         statusId === undefined ||
    //         approverList === undefined
    //     ) {
    //         return; // Don't run effect yet
    //     }

    //     if (
    //         checkTrigger(location.campaignType, location.endDate) ||
    //         !statusIdCheck(statusId) ||
    //         checkRFAApproved(statusId, approverList)
    //     ) {
    //         setIsClickOff(true);
    //     } else {
    //         setIsClickOff(false);
    //     }
    // }, [
    //     location?.campaignType,
    //     location?.endDate,
    //     campaignDetails?.content?.[0]?.statusId,
    //     campaignDetails?.requestForApproval?.approvarList,
    // ]);

    // useEffect(() => {
    //     if (

    //     ) {
    //         setIsClickOff(true);

    //     } else {
    //         setIsClickOff(false);
    //     }
    // }, [location?.campaignType, location?.endDate, campaignDetails?.content?.[0]?.statusId]);

    const tabErrorMessage = _get(errors, `${tabErrorTextName}.message`, null);
    const isImportTabEnabled = useMemo(
        () =>
            getContentSetupStatus(importTabFormValues, fieldName, {
                channelId: COMMUNICATION_CHANNEL_ID.EMAIL,
                splitTabList: importTabFormValues?.splitTabList
            }),
        [importTabFormValues, fieldName, splitTabList]
    );
    const handleUnSubscriptionChange = async (e) => {
        isManualUnsubscriptionChange.current = true;

        if (e) {
            await ensureUnSubscriptionListLoaded();
            clearErrors(unSubscriptionName);
            setValue(unsubscriptionMessage, '');
        } else {
            // if (sampleEmailFooter?.emailFooterList?.toLowerCase()?.includes('unsubscribe')) {
            if (sampleEmailFooter && Object.keys(sampleEmailFooter)?.length) {
                setError(unSubscriptionName, {
                    type: 'custom',
                    message: ENABLE_UNSUBSCRIPTION
                });
            }
            clearErrors(unsubscriptionMessage);
        }
    };

    const handleEmailFooterChange = async (e) => {
        const isChecked = e.target.checked;
        clearErrors(unSubscriptionName);

        if (isChecked) {
            const list = (await ensureEmailFooterListLoaded()) || [];
            setEmailFooterListResolved(true);
            if (!list?.length) {
                setValue(emailFooterName, false);
                setValue(sampleEmailFooterName, '');
                return;
            }
            const firstFooter = list[0];
            const footerRaw = _get(firstFooter, 'emailFooterRawcode', '');
            const hasUnsubscribeInFooter = footerRaw.toLowerCase().includes('unsubscribe');
            const hasUnsubscribeInTemplate = templateContent.toLowerCase().includes('unsubscribe');
            const shouldEnableUnsubscription = hasUnsubscribeInFooter || hasUnsubscribeInTemplate;

            setValue(sampleEmailFooterName, firstFooter);

            if (shouldEnableUnsubscription) {
                await ensureUnSubscriptionListLoaded();
                setValue(unSubscriptionName, true);
                UpdateState(setState, 'isRSSwitchClickOff', true);
            }
        } else {
            const hasUnsubscribeInTemplate = templateContent.toLowerCase().includes('unsubscribe');
            setValue(sampleEmailFooterName, '');

            if (hasUnsubscribeInTemplate) {
                await ensureUnSubscriptionListLoaded();
                setValue(unSubscriptionName, true);
                clearErrors(unSubscriptionName);
                UpdateState(setState, 'isRSSwitchClickOff', true);
            } else {
                setValue(unSubscriptionName, false);
                UpdateState(setState, 'isRSSwitchClickOff', false);
            }
        }
    };

    const sampleFooterText = _get(sampleEmailFooter, 'emailFooterRawcode', '');

    const footerBodyOnlyHTML = sanitizeEmailHtmlForPreview(sampleFooterText);

    const liveModalProps = {
        viewInBrowserName: viewInBrowserName,
        show: state.isEmailPreviewModal,
        viewInBrowser: viewInBrowser,
        currentTab: currentPage,
        content: getValues(editorTextName) || '',
        edmContent,
        templateContent,
        subjectValue,
        audience:
            _get(location, 'campaignType', 'S') === 'M' ? mdcContentSetupDetails?.audience : getValues(audienceName),
        emailFooter: footerBodyOnlyHTML,
        senderName: getValues('senderName') || '',
        senderEmail: `${getValues('SenderemailUsername') || ''}${getValues('SenderemailDomain') ? '@' + getValues('SenderemailDomain')?.domainName : ''}`,
        handleClose: () => UpdateState(setState, 'isEmailPreviewModal', false),
        handleSave: async (e) => {
            await handleSubmit(async (data) => {
                data = { ...data, ...(campaignType === 'M' && mdcContentSetupDetails) };
                await formSubmitHandler(data, 'live', true, '', true, e);
            })();
            UpdateState(setState, 'isEmailPreviewModal', false);
        },
        dataSource,
        mdcContentSetupDetails,
    };

    // Calculate minimum date for scheduler based on previous split tab's schedule
    const splitTabLetters = ['A', 'B', 'C', 'D', 'E'];
    const currentTabLetter = fieldName?.replace('split', '').toUpperCase() || '';
    const currentTabIndex = splitTabLetters.indexOf(currentTabLetter);

    // Get the previous tab's schedule field name to watch
    const previousTabScheduleFieldName = useMemo(() => {
        if (!isSplit || currentTabIndex <= 0) return null;
        const previousTabLetter = splitTabLetters[currentTabIndex - 1];
        return `split${previousTabLetter}.schedule`;
    }, [isSplit, fieldName, currentTabIndex]);

    // Watch the previous tab's schedule
    const previousTabSchedule = previousTabScheduleFieldName ? watch([previousTabScheduleFieldName])[0] : null;

    // Calculate minimum date: previous schedule + 5 minutes
    const getMinDateForScheduler = useMemo(() => {
        if (!isSplit || !fieldName || currentTabIndex <= 0) return null;

        // If previous tab has a schedule, add 5 minutes to it
        if (previousTabSchedule && previousTabSchedule instanceof Date && !isNaN(previousTabSchedule.getTime())) {
            return getDateWithAddMinutes(previousTabSchedule, 5);
        }

        return null;
    }, [isSplit, fieldName, currentTabIndex, previousTabSchedule]);

    const handleUnsubscriptionPreview = async () => {
        const selectedUnsubscriptionId = getValues(unsubscriptionMessage);
        if (!selectedUnsubscriptionId) {
            return;
        }

        const unsubscribeSettingId = selectedUnsubscriptionId?.unsubscribeSettingId;
        if (!unsubscribeSettingId) {
            return;
        }

        const cache = unsubscriptionPreviewCache.current;
        const cacheOrder = unsubscriptionCacheOrder.current;

        if (cache[unsubscribeSettingId]) {
            const index = cacheOrder.indexOf(unsubscribeSettingId);
            if (index > -1) {
                cacheOrder.splice(index, 1);
            }
            cacheOrder.push(unsubscribeSettingId);

            setUnsubscriptionPreviewData(cache[unsubscribeSettingId]);
            UpdateState(setState, 'isUnsubscriptionPreviewModal', true);
            return;
        }

        try {
            const payload = { departmentId, clientId, userId };
            const response = await unsubscriptionPreviewLoader.refetch({
                fetcher: ({ payload: previewPayload } = {}) =>
                    dispatch(getUnSubscribeEditData(previewPayload, { loading: false })),
                mode: 'create',
                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                params: { payload: { ...payload, UnsubscribeSettingID: unsubscribeSettingId } },
            });

            if (response?.status && response?.data?.[0]) {
                const unsubscribeData = response?.data[0];
                const currClient = clientList?.find((item) => item?.clientId === clientId) || {};

                const communicationType = unsubscribeData?.unsubscribeCategory ?
                    unsubscribeData.unsubscribeCategory.
                        split(',').
                        map((item) => item.trim()).
                        filter(Boolean) :
                    [];

                const productType = unsubscribeData?.productType ?
                    unsubscribeData.productType.
                        split(',').
                        map((item) => item.trim()).
                        filter(Boolean) :
                    [];

                const channelType = unsubscribeData?.channelList ?
                    unsubscribeData.channelList.
                        split(',').
                        map((item) => {
                            const trimmed = item.trim();
                            return trimmed?.toLowerCase() === 'mobile' ? 'SMS' : trimmed;
                        }).
                        filter(Boolean) :
                    [];

                const reason = unsubscribeData?.reason ?
                    unsubscribeData.reason.
                        split(',').
                        map((item) => item.trim()).
                        filter(Boolean) :
                    [];

                const previewData = {
                    logoPath: unsubscribeData?.logoPath || currClient?.logoPath || '',
                    title: unsubscribeData?.title || '',
                    message: unsubscribeData?.unsubscribeText || '',
                    emailId: unsubscribeData?.emailId || '',
                    communicationType: communicationType,
                    productType: productType,
                    channelType: channelType,
                    reason: reason,
                    termsCondition: unsubscribeData?.termsCondition || false,
                    termsCondtionUrl: unsubscribeData?.unsubscribeUrl || ''
                };

                const cache = unsubscriptionPreviewCache.current;
                const cacheOrder = unsubscriptionCacheOrder.current;

                if (cacheOrder.length >= MAX_CACHE_SIZE) {
                    const oldestKey = cacheOrder.shift(); // Remove first (oldest) item
                    delete cache[oldestKey];
                }
                cache[unsubscribeSettingId] = previewData;
                cacheOrder.push(unsubscribeSettingId);

                setUnsubscriptionPreviewData(previewData);
                UpdateState(setState, 'isUnsubscriptionPreviewModal', true);
            }
        } catch (error) {
        }
    };

    return (
        <div className="split-tab-content-holder mt41 email-splitAB">
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{SUBJECT_LINE}</label>
                    </Col>
                    <Col
                        sm={6}
                        className={`split-subjectline ${isClickOff ? 'pe-none click-off' : ''} position-relative`}
                        id="rs_SplitABTab_subjectLine">

                        <RSEmojiPickerInput
                            inputName={subjectLineName}
                            rules={{
                                required: ENTER_SUBJECT_LINE
                            }}
                            placeholder={SUBJECT_LINE}
                            personalizationSettings={{
                                data: handlePersonalization(
                                    personalization,
                                    location?.audience?.length ? location?.audience : watch(audienceName)?.length ? watch(audienceName) : getValues()?.audience,
                                    listTypeWisePersonlization
                                ),
                                dataItemKey: 'dataAttributeId',
                                textField: 'key'
                            }}
                            maxLength={MAX_LENGTH150}
                            required />

                        <small className="bottom3 position-absolute right15">
                            {subjectValue?.length}/{MAX_LENGTH150}
                        </small>
                    </Col>
                    <Col sm={3} className={`fg-icons-wrapper pl0 ${isClickOff ? 'pe-none click-off' : ''}`}>
                        <div className={`fg-icons d-flex`}>
                            <RSTooltip text={A_SUFFICIENT_NUMBER} className="mr15">
                                <div className={`${isClickOff || subjectValue?.length === 0 || isSubjectLineEnable || subjectAnalysisLoader.isLoading ? 'pe-none click-off' : 'cp'} mr15`}>
                                    {subjectAnalysisLoader.isLoading ? (
                                        <span className="d-inline-flex align-items-center justify-content-center">
                                            <span className="segment_loader"></span>
                                        </span>
                                    ) : (
                                        <i
                                            id="rs_SplitABTab_spamassassign"
                                            className={`${spam_assassin_medium} ${subjectValue?.length ? ' 1' : ' 2'
                                                } icon-md color-primary-blue `}
                                            onClick={async () => {
                                                if (!isSplit) {
                                                    trigger('subjectLine');
                                                } else {
                                                    trigger(`${fieldName}.subjectLine`);
                                                }
                                                if (!subjectValue?.length) return;

                                                await subjectAnalysisLoader.refetch({
                                                    fetcher: ({ payload } = {}) =>
                                                        dispatch(
                                                            getSubjectLineAnalysis({
                                                                loading: false,
                                                                payload,
                                                            }),
                                                        ),
                                                    mode: 'create',
                                                    loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                                                    params: {
                                                        payload: {
                                                            userId,
                                                            clientId,
                                                            departmentId,
                                                            campaignType: _get(location, 'communicationType', ''),
                                                            productType: _get(location, 'productType', ''),
                                                            subjectLine: subjectValue,
                                                        },
                                                    },
                                                });
                                                UpdateState(setState, 'subjectAnalysisModal', true);
                                            }}
                                        ></i>
                                    )}
                                </div>
                            </RSTooltip>
                            {/* <RSPPophover
                   pophover={
                       <ul className="rs-tooltip-text-multi">
                           <li>
                               <span>
                                   {' '}
                                   {A_SUFFICIENT_NUMBER}
                               </span>
                           </li> */}
                            {/* <li>
                               <span>Recommended: 75 characters.</span>
                           </li> */}
                            {/* </ul>
                   }
                >
                   <i
                       className={`${circle_question_mark_medium} icon-md top5 color-primary-blue`}
                       id="circle_question_mark"
                   ></i>
                </RSPPophover> */}
                        </div>
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 10 }}>
                        {/* <Col sm={{ offset: 1, span: 10 }}> */}
                        {tabErrorMessage &&
                            <p className="color-primary-red position-relative">{tabErrorMessage}</p>
                        }
                        <RSTabbar
                            dynamicTab={`rs-content-tabs-flat col-sm-9`}
                            activeClass={`active`}
                            heading="Email content"
                            flatTabs
                            ccTabs
                            refresh={isClickOff ? false : true}
                            disableOtherTabs
                            isRefreshConfirmation
                            // ccTabs
                            componentClassName='bg-white'
                            defaultTab={currentPage}
                            tabData={isSplit ? SPLITAB_EMAIL_TAB_CONFIG(fieldName, isClickOff) : EMAIL_TAB_CONFIG(isClickOff)}
                            onRefresh={() => {
                                clearTemplateGalleryCache();
                                dispatch(updateTemplate([]));
                                if (isSplit) {
                                    reset(
                                        (formState) => ({
                                            ...formState,
                                            splitscehdule: {
                                                autoSchedule: false,
                                                communicationPerformanceBy: 'SubjectLine',
                                                duration: '',
                                                time: 'Hour(s)'
                                            },
                                            [fieldName]: {
                                                subjectLine: formState[fieldName].subjectLine,
                                                ..._cloneDeep(refreshSplitABFields)
                                            }
                                        }),
                                        {
                                            keepDirty: true
                                        }
                                    );
                                } else {
                                    reset(
                                        (formState) => ({
                                            ...formState,
                                            ...resetFieldsOnRefresh
                                        }),
                                        {
                                            keepDirty: false
                                        }
                                    );
                                }
                                removeQueryParams(['channelId', 'templateId']);
                            }}
                            callBack={(_, index) => {
                                clearErrors(`${fieldName}.tabErrorText`);
                                clearErrors(`tabErrorText`);
                                setValue(currentTabName, index);
                            }} />

                        {!!footerBodyOnlyHTML &&
                            <div className="form-group mt15">
                                <div
                                    id="footerEDM"
                                    className="d-flex justify-content-center pe-none rs-auth-footer-holder edm-import-wrapper">

                                    {parse(footerBodyOnlyHTML)}
                                </div>
                            </div>
                        }
                    </Col>
                </Row>
            </div>

            {isImportTabEnabled ?
                <Fragment>
                    <div className={`form-group ${!!sampleEmailFooter ? '' : ''} `}>
                        <Row>
                            <Col sm={{ offset: 1, span: 3 }}>
                                <label className="control-label-left">{UNSUBSCRIPTION_MESSAGE}</label>
                            </Col>
                            <Col sm={7}>
                                <Row>
                                    <Col
                                        sm={2}
                                        className={`rs-radio-error-message-container ${isClickOff ?
                                            'pe-none click-off' :
                                            state.isRSSwitchClickOff ?
                                                'click-off pe-none' :
                                                ''}`
                                        }>

                                        <div>
                                            <RSSwitch
                                                control={control}
                                                name={unSubscriptionName}
                                                handleChange={(e) => handleUnSubscriptionChange(e)}
                                                id="rs_SplitABTab_Unsubscriptionmessage"
                                                rules={{
                                                    validate: () => {
                                                        const errorMessage = _get(
                                                            errors,
                                                            `${unSubscriptionName}.message`,
                                                            null
                                                        );
                                                        // return errorMessage ? ENABLE_UNSUBSCRIPTION : true;
                                                    }
                                                }} />

                                        </div>
                                    </Col>
                                    <Col sm={10} className="text-right">
                                        <ul className="d-flex rs-list-inline float-end align-items-center">
                                            <li className={`${isClickOff ? 'pe-none click-off' : ''}`}>
                                                <RSCheckbox
                                                    control={control}
                                                    name={emailFooterName}
                                                    labelName={ADD_EMAIL_FOOTER}
                                                    disabled={
                                                        emailFooterLoader.isLoading ||
                                                        emailFooterListResolved && emailFooterList?.length === 0 ||
                                                        isClickOff
                                                    }
                                                    handleChange={(e) => handleEmailFooterChange(e)}
                                                />
                                            </li>

                                            {emailFooter &&
                                                <li
                                                    className={`d-inline-flex pl0 email-footer-icons-wrap no-border-left${isClickOff ? 'pe-none click-off' : ''}`
                                                    }>

                                                    <div className="templates-icon">
                                                        <RSTooltip
                                                            text={EMAIL_FOOTER_TEMPLATES}
                                                            className="lh0"
                                                        >
                                                            {emailFooterLoader.isLoading ? (
                                                                <span
                                                                    className="d-inline-flex align-items-center justify-content-center mr15"
                                                                    id="rs_email_footer_template_loader"
                                                                >
                                                                    <span className="segment_loader"></span>
                                                                </span>
                                                            ) : (
                                                                <RSBootstrapDropdown
                                                                    data={emailFooterList?.filter((list) => list?.IsActive)}
                                                                    flatIcon
                                                                    isObject
                                                                    alignRight
                                                                    fieldKey="footername"
                                                                    showSearch
                                                                    footer={
                                                                        <div
                                                                            className="rs-kendo-footer-add-new d-flex align-items-center justify-content-between cp w-100"
                                                                            onMouseDown={(e) => e.preventDefault()}
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                setState((pre) => ({
                                                                                    ...pre,
                                                                                    confirmEmailFooterLostDataModal: true,
                                                                                }));
                                                                            }}
                                                                        >
                                                                            <span className="text-primary-blue">
                                                                                New email footer
                                                                            </span>
                                                                            <i
                                                                                className={`${circle_plus_fill_medium} icon-md color-primary-blue`}
                                                                                id="rs_email_footer_add_in_dropdown_footer"
                                                                            />
                                                                        </div>
                                                                    }
                                                                    defaultItem={{
                                                                        footername: (
                                                                            <i
                                                                                className={`${template_medium} icon-md `}
                                                                            />
                                                                        ),
                                                                    }}
                                                                    showUpdate={false}
                                                                    className="mr15 cart_template cart_icons"
                                                                    onSelect={(item) => {
                                                                        // console.log('item footer', item);
                                                                        const footer = _get(item, 'emailFooterRawcode', '');
                                                                        setValue(sampleEmailFooterName, item);
                                                                    }}
                                                                />
                                                            )}
                                                        </RSTooltip>
                                                    </div>
                                                </li>
                                            }
                                            <li className={`${isClickOff ? 'pe-none click-off' : ''}`}>
                                                <span className="rsli-label-with-icon">
                                                    <RSTooltip text={LIVE_PREVIEW} className="lh0">
                                                        <div className={` ${getValues(editorTextName)?.length <= 7 &&
                                                                !edmContent?.length &&
                                                                !emailFooter ?
                                                                'pe-none click-off' :
                                                                ''} `
                                                        }>
                                                            <i
                                                                className={`${email_preview_medium} icon-md color-primary-blue `
                                                                }
                                                                onClick={() => {
                                                                    if (
                                                                        campaignType === 'S' && (
                                                                            getValues(audienceName) === undefined ||
                                                                            getValues(audienceName)?.length === 0)) {
                                                                        setError(audienceName, {
                                                                            type: 'custom',
                                                                            message: SELECT_AUDIENCE
                                                                        });
                                                                        setFocus(audienceName);
                                                                    } else if (getValues(subjectLineName) === '') {
                                                                        setError(subjectLineName, {
                                                                            type: 'custom',
                                                                            message: ENTER_SUBJECT_LINE
                                                                        });
                                                                        setFocus(subjectLineName);
                                                                    } else {
                                                                        if (
                                                                            approvalList !== undefined &&
                                                                            approvalList?.length > 0) {
                                                                            UpdateState(
                                                                                setState,
                                                                                'isEmailPreviewModal',
                                                                                true
                                                                            );
                                                                        } else {
                                                                            setIsFailure({
                                                                                status: true,
                                                                                message:
                                                                                    KEY_PERSON_INFO_NOT_FOUND
                                                                            });
                                                                        }
                                                                    }
                                                                }}
                                                                id="rs_SplitABTab_Emailpreview" />
                                                        </div>

                                                    </RSTooltip>
                                                </span>
                                            </li>
                                        </ul>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>
                    {/* <Col sm={{ offset: 1, span: 10 }} className="d-none">
                        <div className={`form-group ${!!sampleEmailFooter ? 'mt15' : ''}`}>
                            <Row>
                                <Col sm={3}>
                                    <label className="control-label-left">{UNSUBSCRIPTION_MESSAGE}</label>
                                </Col>
                                <Col sm={9}>
                                    <Row className="align-items-baseline">
                                        <Col
                                            sm={1}
                                            className={`rs-radio-error-message-container ${
                                                isClickOff ? 'pe-none click-off' : state.isRSSwitchClickOff ? 'pe-none click-off' : ''
                                            }`}
                                        >
                                            <RSSwitch
                                                control={control}
                                                name={unSubscriptionName}
                                                handleChange={(e) => handleUnSubscriptionChange(e)}
                                                rules={{
                                                    validate: () => {
                                                        const errorMessage = _get(
                                                            errors,
                                                            `${unSubscriptionName}.message`,
                                                            null,
                                                        );
                                                        // return errorMessage ? ENABLE_UNSUBSCRIPTION : true;
                                                    },
                                                }}
                                            />
                                        </Col>
                                        <Col sm={5} className={`pr0 ${isClickOff ? 'pe-none click-off' : ''}`}>
                                            {unSubscription && (
                                                <div className="ml40 mt-3">
                                                    <RSKendoDropDownList
                                                        data={unSubscriptionList}
                                                        textField={'unsubscribeName'}
                                                        dataItemKey={'unsubscribeSettingId'}
                                                        control={control}
                                                        name={unsubscriptionMessage}
                                                        label={MESSAGE}
                                                        isLoading={unsubscriptionLoader.isLoading}
                                                        rules={{
                                                            required: SELECT_UNSUBSCRIPTION_BUTTON_MESSAGE,
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </Col>
                                        <Col
                                            sm={6}
                                            className={`text-right pl0 ${isClickOff ? 'pe-none click-off' : ''}`}
                                        >
                                            <ul className="position-relative rs-list-inline top-1">
                                                <li>
                                                    <RSCheckbox
                                                        control={control}
                                                        name={emailFooterName}
                                                        labelName={ADD_EMAIL_FOOTER}
                                                        disabled={emailFooterList?.length == 0 ? true : false}
                                                        handleChange={(e) => handleEmailFooterChange(e)}
                                                    />
                                                </li>

                                                <li className="position-relative top2">
                                                    <span className="rsli-label-with-icon">
                                                        <RSTooltip text={EMAIL_PREVIEW} className="ml15 lh0">
                                                            <i
                                                                className={`${
                                                                    email_preview_medium
                                                                } icon-md color-primary-blue ${
                                                                    getValues(editorTextName)?.length <= 7 &&
                                                                    !edmContent?.length &&
                                                                    !emailFooter
                                                                        ? 'click-off'
                                                                        : ''
                                                                } `}
                                                                onClick={() =>
                                                                    UpdateState(setState, 'isEmailPreviewModal', true)
                                                                }
                                                            />
                                                        </RSTooltip>
                                                    </span>
                                                </li>
                                                {emailFooter && (
                                                    <li className="ml15 d-inline-flex pl0 email-footer-icons-wrap no-border-left">
                                                        <div className="templates-icon">
                                                            <RSTooltip text={EMAIL_FOOTER_TEMPLATES}>
                                                                <BootstrapDropdown
                                                                    data={emailFooterList}
                                                                    flatIcon
                                                                    isObject
                                                                    alignRight
                                                                    fieldKey="footername"
                                                                    defaultItem={{
                                                                        footername: (
                                                                            <i
                                                                                className={`${template_medium} icon-md `}
                                                                            />
                                                                        ),
                                                                    }}
                                                                    showUpdate={false}
                                                                    className="mr15 cart_template"
                                                                    onSelect={(item) => {
                                                                        // console.log('item footer', item);
                                                                        const footer = _get(
                                                                            item,
                                                                            'emailFooterRawcode',
                                                                            '',
                                                                        );
                                                                        setValue(sampleEmailFooterName, item);
                                                                    }}
                                                                />
                                                            </RSTooltip>
                                                        </div>
                                                        <RSTooltip position="top" text={CREATE_EMAIL_FOOTER}>
                                                            <i
                                                                onClick={() => {
                                                                    setState((pre) => ({
                                                                        ...pre,
                                                                        confirmEmailFooterLostDataModal: true,
                                                                    }));
                                                                }}
                                                                className={`${circle_plus_fill_medium} color-primary-blue icon-md`}
                                                                id="rs_data_circle_plus_fill"
                                                            />
                                                        </RSTooltip>
                                                    </li>
                                                )}
                                            </ul>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    </Col> */}
                    {/* <div className="form-group">
                     <Row>
                         <Col sm={4} className="text-right">
                             <label className="control-label-left">Google promo annotations</label>
                         </Col>
                         <Col sm={7}>
                             <RSSwitch
                                 control={control}
                                 name="googlePromoAnnotations"
                                 handleChange={(e) => {
                                     if (e) {
                                         dispatchState({
                                             type: 'UPDATE',
                                             payload: true,
                                             field: 'isGoogleAnnotationModal',
                                         });
                                     } else {
                                         dispatchState({
                                             type: 'UPDATE',
                                             payload: false,
                                             field: 'isGoogleAnnotationEditIcon',
                                         });
                                         setValue('googleAnnotation', _cloneDeep(googleAnnotationConstant));
                                     }
                                 }}
                             />
                             {state.isGoogleAnnotationEditIcon && (
                                 <i
                                     className={`${pencil_edit_medium}`}
                                     onClick={(e) =>
                                         dispatchState({
                                             type: 'UPDATE',
                                             payload: true,
                                             field: 'isGoogleAnnotationModal',
                                         })
                                     }
                                 ></i>
                             )}
                         </Col>
                     </Row>
                 </div> */}
                </Fragment> :
                null}
            {unSubscription &&
                <div className="form-group">
                    <Row>
                        <Col
                            sm={{ offset: 1, span: 4 }}
                            className={`${isClickOff ? 'pe-none click-off' : ''} d-flex justify-content-between position-relative`}>

                            <>
                                {/* Unsubscription list footer: custom row + circle_plus_fill_medium — not NewAttributeFormBtn / NewAttributeBtn */}
                                <RSKendoDropDownList
                                    data={unSubscriptionList}
                                    textField={'unsubscribeName'}
                                    dataItemKey={'unsubscribeSettingId'}
                                    control={control}
                                    required={true}
                                    name={unsubscriptionMessage}
                                    label={MESSAGE}
                                    isLoading={unsubscriptionLoader.isLoading}
                                    rules={{
                                        required: SELECT_UNSUBSCRIPTION_BUTTON_MESSAGE,
                                    }}
                                    className="w-100"
                                    popupClass="email-unsubscription-kendo-dropdown"
                                    footer={() => (
                                        <div
                                            className="d-flex align-items-center justify-content-between px-10 py-8 cp rs-kendo-footer-add-new"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setState((pre) => ({
                                                    ...pre,
                                                    confirmUnsubscribeLostDataModal: true,
                                                }));
                                            }}
                                        >
                                            <span className="text-primary-blue">
                                                New unsubscription message
                                            </span>
                                            <i
                                                className={`${circle_plus_fill_medium} icon-md color-primary-blue`}
                                                id="rs_unsubscription_add_in_dropdown_footer" />

                                        </div>
                                    )} />

                                <div className="d-flex align-items-center gap-2 position-absolute Left100 top8">
                                    {unSubMessage && (
                                        <RSTooltip
                                            position="top"
                                            text={PREVIEW}
                                             className={`d-inline-block lh0 position-relative top6${isClickOff ? 'pe-none click-off' : 'cp'
                                                        }`}
                                        >
                                            {unsubscriptionPreviewLoader.isLoading ? (
                                                <span
                                                    className="d-inline-flex align-items-center justify-content-center"
                                                    id="rs_unsubscription_preview_loader"
                                                >
                                                    <span className="segment_loader"></span>
                                                </span>
                                            ) : (
                                                <i
                                                    onClick={handleUnsubscriptionPreview}
                                                    className={`${eye_medium} color-primary-blue icon-md`}
                                                    id="rs_unsubscription_preview"
                                                />
                                            )}
                                        </RSTooltip>
                                    )}
                                </div>
                            </>
                        </Col>
                    </Row>
                </div>
            }
            {isImportTabEnabled && (!levelNumber || levelNumber < 2) &&
                <>
                    {(campaignType === 'S' || campaignType === 'M' && dataSource === 'TL') &&
                        <div className={`form-group ${isClickOff ? 'pe-none click-off' : ''}`}>
                            <Scheduler
                                fieldName={fieldName}
                                isSplitTabs={isSplit}
                                isRequired={getValues('approvalList.requestApproval') ? true : false}
                                splitABminDate={getMinDateForScheduler}
                                isRfaEnabled={true} />

                        </div>
                    }
                </>
            }
            <SubjectLineAnalysisModal
                show={state.subjectAnalysisModal}
                subjectLineText={subjectValue}
                handleClose={() => UpdateState(setState, 'subjectAnalysisModal', false)} />


            <LivePreviewModal {...liveModalProps} />

            <WarningPopup
                show={isFailure?.status}
                handleClose={() => {
                    setIsFailure({
                        status: false,
                        message: ''
                    });
                }}
                text={<div>{isFailure?.message}</div>}
                showCancel={true}
                isPrimary={false} />

            {state?.confirmUnsubscribeLostDataModal &&
                <WarningPopup
                    show={state?.confirmUnsubscribeLostDataModal}
                    showCancel={true}
                    handleClose={(status) => {
                        setState((pre) => ({
                            ...pre,
                            confirmUnsubscribeLostDataModal: false,
                        }));
                        if (status !== 1) return;

                        dispatch(updateEmailList({ data: [], field: 'unSubscriptionList' }));
                        const navState = createCommunicationSettingsNavState('mail', {
                            from: 'communication',
                            tabname: 'Unsubscription',
                            mailTabId: MAIL_TAB_ID.SUBSCRIPTION_UNSUBSCRIPTION,
                        }, location, getValues);
                        navigate(`/preferences/communication-settings/subscribe?q=${encodeUrl(navState)}`, {
                            state: navState,
                        });
                    }}
                    text={<div>{ARE_YOU_SURE_YOU_WANT_TO_LEAVE}</div>} />

            }
            {state?.confirmEmailFooterLostDataModal &&
                <WarningPopup
                    show={state?.confirmEmailFooterLostDataModal}
                    showCancel={true}
                    handleClose={(status) => {
                        setState((pre) => ({
                            ...pre,
                            confirmEmailFooterLostDataModal: false,
                        }));
                        if (status !== 1) return;

                        dispatch(updateEmailList({ data: [], field: 'emailFooter' }));
                        const navState = createCommunicationSettingsNavState('mail', {
                            from: 'communication',
                            mailTabId: MAIL_TAB_ID.EMAIL_FOOTER,
                        }, location, getValues);
                        navigate(`/preferences/communication-settings?q=${encodeUrl(navState)}`, {
                            state: navState,
                        });
                    }}
                    text={<div>{ARE_YOU_SURE_YOU_WANT_TO_LEAVE}</div>} />

            }
            <UnsubscriptionPreviewModal
                show={state.isUnsubscriptionPreviewModal}
                handleClose={() => {
                    UpdateState(setState, 'isUnsubscriptionPreviewModal', false);
                    setUnsubscriptionPreviewData(null);
                }}
                previewData={unsubscriptionPreviewData} />

            {/*FIXME {Samben} : Update the googleAnotation modal for split A/B Scenarios */}
            {/* <GooglePromoAnnotationModal
           show={false}
           handleClose={(e) => {
               // setValue('googlePromoAnnotations', false);
               //  setValue('googleAnnotation', _cloneDeep(googleAnnotationConstant));
               // dispatchState({
               //     type: 'UPDATE_GOOGLE_ANNOTATION',
               //     payload: {
               //         googleAnnotationEditIcon: false,
               //         googleAnnotationModal: false,
               //     },
               // });
           }}
           confirm={(status) => {
               // dispatchState({
               //     type: 'UPDATE_GOOGLE_ANNOTATION',
               //     payload: {
               //         googleAnnotationEditIcon: true,
               //         googleAnnotationModal: false,
               //     },
               // });
           }}
        /> */}
        </div>);

};

export default SplitABTab;