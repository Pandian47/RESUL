import { cloneElement } from 'react';

import { getUserDetails } from 'Utils/modules/crypto';
import { circle_plus_medium, import_file_edge_large, template_edge_large, text_document_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import _map from 'lodash/map';
import _get from 'lodash/get';
import _reduce from 'lodash/reduce';
import { Row } from 'react-bootstrap';
import Import from 'Pages/AuthenticationModule/Components/Import';
import TextEditor from './Component/TextEditor/TextEditor';
import Template from './Component/Template/Template';
import SplitABTab from './Component/SplitABTab/SplitABTab';
import { handleAllChannelPayload, handleAllChannelTimeZonePayload, handleMDCExtraPayload, getSavedPushChannelFlagPayload, resolveLocalBlastDateTime } from '../../constant';
import { updateSenderDetails } from 'Reducers/communication/createCommunication/Create/request';
import { saveEmailCampaign, saveEmailTemplateContent } from 'Reducers/communication/createCommunication/Create/request';

export { getSavedPushChannelFlagPayload };

export const PAUSED_TRIGGER_PLAY_PAUSE_STATUS_ID = 27;//Pause 
export const PAUSED_STATUS_ID = 5;// In progress

const coerceNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};

export const isPausedEventTriggerCampaign = ({ campaignType, triggerPlayPauseStatus, statusId }) =>
    String(campaignType ?? '').toUpperCase() === 'T' &&
    coerceNumber(triggerPlayPauseStatus) === PAUSED_TRIGGER_PLAY_PAUSE_STATUS_ID &&
    coerceNumber(statusId) === PAUSED_STATUS_ID;

const resolveCampaignStateForPausedEtCheck = ({ campaignDetails, locationState }) => {
    const campaignType =
        locationState?.campaignType ??
        campaignDetails?.campaignType ??
        campaignDetails?.campaignTypeId ??
        '';

    const triggerPlayPauseStatus =
        campaignDetails?.triggerPlayPauseStatus ??
        locationState?.triggerPlayPauseStatus ??
        null;

    const statusId =
        campaignDetails?.content?.[0]?.statusId ??
        locationState?.statusId ??
        null;

    return { campaignType, triggerPlayPauseStatus, statusId };
};


export const resolvePausedEtSaveThunk = ({ payload, savedChannelsId, campaignDetails, locationState, thunks }) => {
    const { saveDefault, saveTemplateContent } = thunks || {};
    if (typeof saveDefault !== 'function' || typeof saveTemplateContent !== 'function') {
        return saveEmailCampaign({ payload, savedChannelsId });
    }
    const { campaignType, triggerPlayPauseStatus, statusId } = resolveCampaignStateForPausedEtCheck({
        campaignDetails,
        locationState,
    });
    const shouldUseNew = isPausedEventTriggerCampaign({ campaignType, triggerPlayPauseStatus, statusId });
    return shouldUseNew
        ? saveTemplateContent({ payload, savedChannelsId })
        : saveDefault({ payload, savedChannelsId });
};

export const resolvePausedEtSaveEmailThunk = ({ payload, savedChannelsId, campaignDetails, locationState }) =>
    resolvePausedEtSaveThunk({
        payload,
        savedChannelsId,
        campaignDetails,
        locationState,
        thunks: {
            saveDefault: ({ payload: p, savedChannelsId: sc }) => saveEmailCampaign({ payload: p, savedChannelsId: sc }),
            saveTemplateContent: ({ payload: p, savedChannelsId: sc }) =>
                saveEmailTemplateContent({ payload: p, savedChannelsId: sc }),
        },
    });

export const EMAIL_TAB_CONFIG = (isClickOff = false) => [
    {
        id: 'text',
        text: 'Rich text',
        iconLeft: `${text_document_edge_large} icon-lg `,
        component: () => (
            <div className="form-group mb0">
                <Row>
                    <TextEditor />
                </Row>
            </div>
        ),
    },
    {
        id: 'import',
        text: 'Import',
        iconLeft: `${import_file_edge_large} icon-lg `,
        component: () => <Import showBrowerText channelId={1} />,
    },
    {
        id: 'template',
        text: 'Template',
        iconLeft: `${template_edge_large} icon-lg `,
        component: () => <Template showBrowerText isClickOff={isClickOff} channelId={1} />,
        disable: false,
    },
];
export const SPLITAB_EMAIL_TAB_CONFIG = (fieldName, isClickOff = false) => [
    {
        id: 'text',
        text: 'Text',
        iconLeft: `${text_document_edge_large} icon-lg `,
        component: () => (
            <TextEditor
                key={`${fieldName}.text`}
                fieldName={fieldName}
                isSplit
            // className={'col-sm-10 offset-sm-1 p0 kendo-text-format'}
            />
        ),
    },
    {
        id: 'import',
        text: 'Import',
        iconLeft: `${import_file_edge_large} icon-lg `,
        component: () => (
            <Import isSplit key={`${fieldName}.import`} fieldName={fieldName} showBrowerText channelId={1} />
        ),
    },
    {
        id: 'template',
        text: 'Template',
        iconLeft: `${template_edge_large} icon-lg `,
        component: () => <Template key={`${fieldName}.template`} fieldName={fieldName} isSplit showBrowerText isClickOff={isClickOff} channelId={1} />,
        disable: false,
    },
];

export const stateReducer = (state, action) => {
    const { payload, type } = action;
    switch (type) {
        case 'UPDATE':
            return {
                ...state,
                [action.field]: payload,
            };
        case 'UPDATE_TAB':
            return {
                ...state,
                currentSplitTab: payload.splitTab,
                currentErrorTabName: payload.errorTab,
                // tabErrorText: payload?.tabErrorText || state.tabErrorText,
            };
        case 'UPDATE_GOOGLE_ANNOTATION':
            return {
                ...state,
                isGoogleAnnotationEditIcon: payload.googleAnnotationEditIcon,
                isGoogleAnnotationModal: payload.googleAnnotationModal,
            };
        case 'UPDATE_SPLITAB':
            return {
                ...state,
                splitTabList: payload.splitList,
                splitOffConfirmationModal: payload.splitModal,
                currentSplitTab: payload.currentSplitTab,
                splitABCount: payload.splitABCount,
            };
        case 'UPDATE_TAB_CHANGE':
            return {
                ...state,
                splitTabList: payload.splitTabList,
                currentSplitTab: payload.currentSplitTab,
                splitABCount: {},
            };
        case 'UPDATE_SCHEDULER':
            return {
                ...state,
                showSchedulerModal: payload.showSchedulerModal,
                proceedWithoutSchedule: payload.proceedWithoutSchedule,
            };

        case 'UPDATE_SLIDER':
            return {
                ...state,
                splitABCount: payload.splitABCount,
                showSlider: payload.showSlider,
            };
        case 'UPDATE_EDITSTATE':
            return {
                ...state,
                splitABCount: payload.splitABCount,
                isAlternateEmailInput: payload.isAlternateEmailInput,
                splitTabList: payload.splitTabList,
            };
        case 'UPDATE_EDIT_STATE':
            return {
                ...state,
                ...payload,
            };
        case 'RESET':
            return {
                ...formInitialState,
            };

        default:
            return state;
    }
};

export const renderItem = (li, callback) => {
    const isExpectedItem = li.props.children[0]?.props?.children === '';
    return cloneElement(
        li,
        li.props,
        <span
            className="d-flex justify-content-between w-100 px-10"
            onClick={() => {
                if (isExpectedItem) callback(true);
            }}
        >
            {isExpectedItem ? 'Enter new email' : li.props.children}
        </span>,
    );
};

export const googleAnnotationConstant = {
    offerBadge: {
        isofferBadge: false,
        text: '15% OFF',
    },
    promoCode: {
        isPromoCode: false,
        text: 'RES 20% OFF',
    },
    offerEndDate: {
        isOfferEndDate: false,
        date: new Date(),
    },
    senderLogo: {
        isSenderLogo: false,
        path: '',
        image: {},
        src: '',
    },
    promoImage: {
        isPromoImage: false,
        path: '',
        image: {},
        src: '',
    },
};

const getPeriodRange = (time) => {
    switch (time) {
        case 'Hour(s)':
            return 1;
        case 'Day(s)':
            return 2;
        case 'Week(s)':
            return 3;
        case 'Month(s)':
            return 4;
        default:
            return 1;
    }
};

export const getCommunicationPerformanceId = (id) => {
    //Subject line Content Schedule
    const updateId = Number(id);
    if (updateId === 1) return 'Subject line';
    else if (updateId === 2) return 'Content';
    else if (updateId === 3) return 'Schedule';
    return '';
};

export const getLatestEdmContentFromIframe = () => {
    try {
        const iframe = document.querySelector('#template iframe');
        const doc = iframe?.contentWindow?.document;
        if (!doc) return '';
        return [...doc.childNodes]
            .map((item) => new XMLSerializer().serializeToString(item))
            .join('');
    } catch {
        return '';
    }
};

export const buildPayload = (formState, checkSpam, type = '', locationState) => {
    const {
        tabErrorText,
        replyEmail,
        isReplyMailEnabled = true,
        offers,
        splitTabList,
        senderName,
        SenderemailDomain,
        SenderemailUsername,
        senderEmail,
        alternateEmailDomain,
        alternateEmailName,
        alternateEmailId,
        audience,
        splitTest,
        splitscehdule,
        approvalList,
        splitABCount,
        campaignId,
        campaignType = 'S',
        userId,
        clientId,
        departmentId,
        dataSource = 'TL',
        levelNumber = 1,
        addOnLevel = 1,
        isALLorAny = 'ALL',
        parentChannelDetailId = 0,
        parentChannelDetailType = 'S',
        actionId = 1,
        actionTime = 1,
        activeChannel = 2,
        actionTimeDuration = 'D',
        channelFriendlyName = '',
        channelDetailType = 'S',
        channelId = '',
        domId = '',
        flowChannel = 2,
        edmAutoSchedule,
        edmSplit,
        content,
        sendTimeRecommendation,
        isSendTestMail,
        dynamiclistId = 0,
        scheduled,
        isAutoRefereshenabled,
        alternateEmailIdText,
        editActionId,
        ...restState
    } = formState;
    const { timeZoneId = 0 } = getUserDetails();
    restState.schedule =
        levelNumber > 1
            ? new Date(formState.scheduleDate)
            : levelNumber == 1 && campaignType === 'M' && dataSource === 'DL'
                ? new Date()
                : restState.schedule;
    const getSourceType = (id) => {
        if (id === 0) return 'R';
        else if (id === 1) return 'Z';
        else if (id === 2) return 'T';
        return '';
    };

    const getEdmTextContent = (state, tabName) => {
        const contentType = getSourceType(state?.currentPage);
        if (contentType === 'T') {
            return state?.templateContent || '';
        }
        if (contentType !== 'Z') {
            return state.editorText;
        }

        const activeTabName =
            splitTest && splitTabList?.length ? splitTabList[formState.currentSplitTab ?? 0] : '';
        const isActiveTab = !splitTest || tabName === activeTabName || tabName === '';

        if (isActiveTab) {
            const iframeContent = getLatestEdmContentFromIframe();
            if (iframeContent) {
                return iframeContent;
            } else {
                return state.edmContent || '';
            }
        }

        return state.edmContent || '';
    };

    const buildTabPayload = (state, index, tabName = '') => {
        let contentType = getSourceType(state?.currentPage);
        let contentTypeValue = '';
        if (contentType === 'Z') contentTypeValue = 'Z';
        else if (contentType === 'T') contentTypeValue = 'Z';
        else {
            contentTypeValue = 'R';
        }

        let iframeEl = document.querySelector('#template iframe');
        let edmelement = document.querySelector('.edm-import-wrapper');
        const clientheight = iframeEl?.contentDocument?.children[0]?.childNodes[1]?.childNodes[0]?.clientHeight;
        const clientWidth = iframeEl?.contentDocument?.children[0]?.childNodes[1]?.childNodes[0]?.clientWidth;
        let tempedmDimension = parseInt(clientheight, 10) * parseInt(clientWidth, 10);
        const finalDimensionValue =
            contentType === 'Z' ? tempedmDimension || state?.edmDimension || 0 : state?.edmDimension || 0;
        return {
            edmChannelId:
                type === 'template'
                    ? formState?.content?.length
                        ? formState?.content?.[index]?.edmChannelId || 0
                        : 0
                    : formState?.tempcampaignDetails?.content?.length
                        ? formState?.tempcampaignDetails?.content?.[index]?.edmChannelId
                        : 0,
            contentType, //-- R/Z/T
            splitType: tabName?.slice(-1) || '',
            statusId: _get(content?.[index], 'statusId', 0) || 0, //-- with schedule (7)/ Test preview(6)/Test preview with schedule(6)/RFA(12)/
            // Z/T
            body: '',
            textContent: getEdmTextContent(state, tabName), //-- R/Z/T
            // preHeaderMessage: 'Email Preheader 10July2023', //--X

            edmFileWeight:
                tabName === ''
                    ? parseInt(localStorage.getItem('edm'), 10) || 0
                    : parseInt(localStorage.getItem(tabName), 10) || 0,
            edmDimension: finalDimensionValue || 0,
            edmImageDimension: 0,
            spamScore: state?.spamScore?.spamScore || 0,
            isFooterEnabled: state.emailFooter || false,
            footerId: _get(state.sampleEmailFooter, 'emailfooterId', 0) || 0,
            // clientFooterAddress: '', ///--X
            // footerAddress: '', //--X
            inboxFirstLineMessage: state.inboxLinePreview || '',
            // unsubscriptionMessage: _get(state.unsubscriptionMessage, 'unsubscribeName', ''),
            isUnsubscribeEnabled: state.unSubscription || false,
            unsubscribeSettingId: _get(state.unsubscriptionMessage, 'unsubscribeSettingId', 0) || 0,
            contentUrl: state?.importUrl || '',
            // htmlFilePath: '', //--X
            // previewId: 0, //--X
            // zipFilePath: '', //--X
            isViewinBrowser: state.viewInBrowser || false,
            templateId: state?.templateId || _get(content?.[index], 'templateId') || 0,
            timezoneId: handleAllChannelTimeZonePayload(
                campaignType,
                locationState?.timeZoneId,
                state.timezone,
                timeZoneId,
                locationState,
            ),
            localBlastDateTime: resolveLocalBlastDateTime({
                campaignType,
                statusId: _get(content?.[index], 'statusId', 0),
                triggerPlayPauseStatus: _get(state, 'triggerPlayPauseStatus') || _get(formState, 'triggerPlayPauseStatus') || 0,
                schedule: state.schedule,
            }),
            // blastDateTime: '',
            blastScheduleGuid: _get(content?.[index], 'blastScheduleGuid') || '',
            blastScheduleId: _get(content?.[index], 'blastScheduleId') || 0,
            subjectLine: state.subjectLine || '',
            isDaylightSavings: _get(state, 'daylightSavings', false),
            // confirmationEmailAddress: null, //--X
            // edmFileWeight: 0, //-- convert into kb
            // edmDimension: 0, //---need to calculate in python
            // subTitlePosition: 0, //--X
            // edmImageDimension: 0, //---need to calculate in python
        };
    };

    const autoSchedule = _get(splitscehdule, 'autoSchedule', false);
    const isWorkflowEnabled = _get(approvalList, 'requestApproval', false);
    const approvarList = isWorkflowEnabled
        ? _map(_get(approvalList, 'name', []), ({ approverName, mandatory, isCustom }) => {
            return {
                approvarId: isCustom ? 0 : approverName.userId,
                approvarName: isCustom ? approverName : approverName.email,
                flag: mandatory || false,
            };
        })
        : [];

    const getCommunicationPerformance = (text) => {
        //Subject line Content Schedule
        if (!autoSchedule) return 0;
        if (text === 'Subject line') return 1;
        else if (text === 'Content') return 2;
        return 3;
    };
    const getSplitAbStatus = () => {
        return campaignType === 'T' ||
            (campaignType === 'M' && dataSource === 'DL') ||
            (campaignType === 'M' && (dataSource === 'TL' || dataSource === 'QR') && levelNumber > 1)
            ? false
            : splitTest;
    };
    const totalAudience = _reduce(audience, (prev, cur) => prev + cur.recipientCountEmail, 0);
    const splitScheduleId = edmAutoSchedule?.splitScheduleId || 0;

    const handleDataSourceType = (dataSource) => {
        if (campaignType === 'T') {
            return 'DL';
        }
        if (campaignType === 'M') {
            return dataSource;
        }
        return 'TL';
    };

    return {
        campaignId,
        campaignType,
        isCopy: false,
        createdBy: userId,
        departmentId,
        clientId,
        userId,
        senderName,
        senderEmail: SenderemailUsername + '@' + SenderemailDomain?.domainName,
        //replyEmail: isReplyMailEnabled ? '' : alternateEmailName + '@' + alternateEmailDomain?.domainName,
        replyEmail: isReplyMailEnabled ? '' : alternateEmailIdText,
        // replyEmail: _get(alternateEmailId, 'senderEmailId', alternateEmailId ?? ''),
        isAutoRefereshenabled,
        testCampaignEmailAddress:
            isSendTestMail === 4
                ? `${formState?.userKeyPersonInfo?.[0]?.email || ''}|${formState?.passportId || ''}`
                : typeof formState?.approvalList?.testEmail === 'string'
                    ? _get(approvalList, 'testEmail', '')
                    : _get(approvalList, 'testEmail.email', ''),
        targetListTargetAudience: _map(audience, 'segmentationListId'),
        isSendTimeOptEnable: sendTimeRecommendation || false,
        totalAudience,
        isSendTestMail, //  --- 0- save, 1- request for approval, 2 - test preview,4 live preview
        // isReplyMailEnabled: replyEmail, // --X
        isReplyMailEnabled,
        dataSource: handleDataSourceType(dataSource),
        levelNumber, //-- S
        addOnLevel, //-- S
        allOrAny: isALLorAny, //-- S
        isSplitAB: getSplitAbStatus() || false,
        parentChannelDetailId, //-- S
        parentChannelDetailType, //-- S
        actionId, //-- S
        actionTime, //-- S
        activeChannel: activeChannel === null ? 2 : activeChannel,
        actionTimeDuration, //-- S
        channelFriendlyName, //-- S
        channelDetailType,
        channelId,
        domId,
        flowChannel,
        dynamiclistId, //-- S
        // isSendTimeOptEnable: sendTimeRecommendation,
        edmAutoSchedule: {
            splitScheduleId: splitScheduleId,
            autoSchedule,
            performedBy: getCommunicationPerformance(_get(splitscehdule, 'communicationPerformanceBy', 0)),
            startIn: _get(splitscehdule, 'duration', 0) || 0,
            periodRange: autoSchedule
                ? splitscehdule?.time
                    ? getPeriodRange(_get(splitscehdule, 'time'))
                    : getPeriodRange(_get(scheduled, 'time.value'))
                : 0,
        },
        edmSplit: {
            // edmChannelId: edmSplit?.edmChannelId || 0,
            splitPercentage: _get(splitABCount, 'percentage', 0),
            splitAudience: Math.floor(_get(splitABCount, 'count', 0)),
            totalAudience: totalAudience || 0,
            splitWidth: _get(splitABCount, 'width', 0),
        },
        content: splitTest
            ? _map(splitTabList, (tabName, index) => buildTabPayload(formState[tabName], index, tabName))
            : [buildTabPayload(restState, 0)],
        requestForApproval: {
            isWorkflowEnabled,
            approvarList,
            noOfApprovers: isWorkflowEnabled ? approvalList?.name?.length : 0,
            approvalFrom: _get(approvalList, 'approvalFrom', 'ALL') || 'ALL',
            isFollowHierarchy: _get(approvalList, 'followHierarchy', false),
            approverCount:
                _get(approvalList, 'approvalFrom', 'ALL') === 'Any'
                    ? _get(approvalList, 'approvalCount', 0)
                    : approvalList?.name?.length,
        },
        ...handleMDCExtraPayload(locationState),
        ...handleAllChannelPayload('email', formState),
    };
};

export const formInitialState = {
    defaultValues: {
        replyEmail: true,
        isReplyMailEnabled: true,
        isAutoRefereshenabled: false,
        sendername: '',
        senderEmailAddress: '',
        SenderemailUsername: '',
        SenderemailDomain: '',
        subjectLine: '',
        alternateEmailId: '',
        audience: [],
        editActionId: null,
        isCGTGEnabled: false,
        isCGTGConfirm: false,
        currentSplitTab: 0,
        splitTest: false,
        unSubscription: false,
        sendTimeRecommendation: false,
        editorText: '',
        tabErrorText: '',
        sampleEmailFooter: '',
        emailFooter: false,
        currentPage: null,
        importType: 'url',
        contentType: '',
        edmContent: '',
        templateContent: '',
        unsubscriptionMessage: '',
        importUrl: '',
        zipFile: '',
        edmFileWeight: 0,
        edmDimension: 0,
        edmImageDimension: 0,
        viewInbrowser: true,
        inboxLinePreview: '',
        offers: {
            autoMatch: true,
            offerCodeType: '',
        },
        templateId: 0,
        splitscehdule: {
            autoSchedule: false,
            communicationPerformanceBy: 'SubjectLine',
            duration: '',
            time: { id: 1, value: 'Hour(s)' },
        },
        schedule: null,
        approvalList: {
            requestApproval: false,
            name: [{ approverName: '', mandatory: false }],
            approvalFrom: 'All',
            approvalCount: '2',
            followHierarchy: false,
        },
        // googleAnnotation: _cloneDeep(googleAnnotationConstant),
        splitA: {
            sampleEmailFooter: '',
            editorText: '',
            unSubscription: false,
            subjectLine: '',
            unsubscriptionMessage: '',
            emailFooter: false,
            currentPage: null,
            schedule: null,
            tabErrorText: '',
            viewInbrowser: true,
            importUrl: '',
            contentType: '',
            zipFile: '',
            importType: 'url',
            edmContent: '',
            templateContent: '',
            edmFileWeight: 0,
            edmDimension: 0,
            edmImageDimension: 0,
            inboxLinePreview: '',
        },
        splitB: {
            sampleEmailFooter: '',
            editorText: '',
            unSubscription: false,
            subjectLine: '',
            unsubscriptionMessage: '',
            emailFooter: false,
            currentPage: null,
            schedule: null,
            viewInbrowser: true,
            importType: 'url',
            importUrl: '',
            contentType: '',
            tabErrorText: '',
            zipFile: '',
            inboxLinePreview: '',
            edmContent: '',
            templateContent: '',
            edmFileWeight: 0,
            edmDimension: 0,
            edmImageDimension: 0,
        },
        splitC: {
            sampleEmailFooter: '',
            editorText: '',
            unSubscription: false,
            subjectLine: '',
            unsubscriptionMessage: '',
            emailFooter: false,
            currentPage: null,
            schedule: null,
            viewInbrowser: true,
            edmContent: '',
            templateContent: '',
            edmFileWeight: 0,
            edmDimension: 0,
            edmImageDimension: 0,
            tabErrorText: '',
            importUrl: '',
            contentType: '',
            zipFile: '',
            inboxLinePreview: '',
            importType: 'url',
        },
        splitD: {
            sampleEmailFooter: '',
            editorText: '',
            unSubscription: false,
            subjectLine: '',
            unsubscriptionMessage: '',
            emailFooter: false,
            currentPage: null,
            schedule: null,
            viewInbrowser: true,
            tabErrorText: '',
            edmContent: '',
            templateContent: '',
            edmFileWeight: 0,
            edmDimension: 0,
            edmImageDimension: 0,
            importUrl: '',
            contentType: '',
            zipFile: '',
            inboxLinePreview: '',
            importType: 'url',
        },
        splitTabList: ['splitA', 'splitB'],
    },
    mode: 'onTouched',
    // mode: 'onChange',
};

export const resetFieldsOnRefresh = {
    unSubscription: false,
    sendTimeRecommendation: false,
    editorText: '',
    tabErrorText: '',
    offers: {
        autoMatch: true,
        offerCodeType: '',
    },
    schedule: null,
    approvalList: {
        name: [{ approverName: '', mandatory: false }],
        requestApproval: false,
        approvalFrom: 'All',
        approvalCount: '2',
        followHierarchy: false,
    },
    sampleEmailFooter: '',
    unsubscriptionMessage: '',
    emailFooter: false,
    viewInBrowser: true,
    currentPage: null,
    importUrl: '',
    contentType: '',
    zipFile: '',
    edmContent: '',
    templateContent: '',
    templateId: 0,
    edmFileWeight: 0,
    edmDimension: 0,
    edmImageDimension: 0,
    // importType: 'url',
    inboxLinePreview: '',
};

export const refreshSplitABFields = {
    sampleEmailFooter: '',
    editorText: '',
    unSubscription: false,
    unsubscriptionMessage: '',
    emailFooter: false,
    currentPage: null,
    schedule: null,
    sendTimeRecommendation: false,
    viewInbrowser: true,
    edmContent: '',
    templateContent: '',
    templateId: 0,
    edmFileWeight: 0,
    edmDimension: 0,
    edmImageDimension: 0,
    importUrl: '',
    contentType: '',
    zipFile: '',
    importType: 'url',
};

// export const watchList = ['audience', 'replyEmail', 'splitTest', 'currentPage', 'edmContent', 'isReplyMailEnabled'];
export const watchList = [
    'audience',
    'splitTest',
    'currentPage',
    'edmContent',
    'isReplyMailEnabled',
    'templateContent',
    'edmDimension',
    'isAutoRefereshenabled',
    'totalAudience'
];

export const footerData = {
    emailfooterID: 1,
    emailfooterHTML: null,
    emailFooterRawcode:
        '<table style="border:1px solid #c2cfe3" class="temp-holderSec emailFooterTemplate" id="defaultTemplate4" width="600" border="0" align="center" cellspacing="0" cellpadding="0">\r\n    <tbody class="ui-sortable">\r\n        <tr>\r\n            <td style="text-align: center;" class="temp-txtEditor" align="center">\r\n                <div class="edit-outline" style="">\r\n                    <div class="editable k-widget k-editor k-editor-inline" style="text-align: center; outline: 0pt dashed rgb(184, 184, 184);" data-role="editor" align="center" >\r\n                        <p style="padding:20px 0 10px 0;text-align:center;">Was this email forwarded to you? <a href="void(0)" style="color:#0c8aff;text-decoration:underline;">Sign up to receive your own copy</a>.</p>\r\n                    </div>\r\n\r\n                </div>\r\n            </td>\r\n        </tr>\r\n        <tr>\r\n            <td valign="middle" height="20" align="center">\r\n                <hr>\r\n            </td>\r\n        </tr>\r\n        <tr>\r\n            <td style="margin-bottom:0 !important;">\r\n                <table border="0" align="left" cellspacing="0" cellpadding="0">\r\n                    <tbody>\r\n                        <tr>\r\n                            <td style="border-right:1px solid #c2cfe3" width="370">\r\n                                <table border="0" align="left" cellspacing="0" cellpadding="0">\r\n                                    <tbody>\r\n                                        <tr>\r\n                                            <td>\r\n                                                <table style="margin-right: auto; margin-left: auto;width:100%;" border="0" align="center" cellspacing="0" cellpadding="0">\r\n                                                    <tbody>\r\n                                                        <tr>\r\n                                                            <td style="padding:0 10px;" valign="top" align="left">\r\n                                                                <div>\r\n                                                                    <table border="0" align="center" cellspacing="0" cellpadding="0">\r\n                                                                        <tbody>\r\n                                                                            <tr>\r\n                                                                                <td class="temp-imgEditor" style="text-align:right;" width="" valign="middle" align="center">\r\n                                                                                    <div class="edit-outline">\r\n                                                                                        <div style="text-align: right; outline: 0pt dashed rgb(184, 184, 184);" class="editable k-widget k-editor k-editor-inline" data-role="editor" >\r\n                                                                                            <img src="https://paasa.marketingstar.us/Uploads/Client/3b4be4e8-6f77-44e4-a045-2aee6a3a580a.jpg" alt="Company logo" data-captionimage="true" style="margin:0;display:block;float:none;width: 100%;">\r\n                                                                                        </div>\r\n\r\n                                                                                    </div>\r\n                                                                                </td>\r\n                                                                            </tr>\r\n                                                                        </tbody>\r\n                                                                    </table>\r\n                                                                </div>\r\n                                                            </td>\r\n                                                        </tr>\r\n                                                        <tr>\r\n                                                            <td style="text-align: center;padding:10px;" class="temp-txtEditor" align="center">\r\n                                                                <div class="edit-outline" style="">\r\n                                                                    <div class="editable k-widget k-editor k-editor-inline" style="text-align: center; outline: 0pt dashed rgb(184, 184, 184);" data-role="editor" align="left" >\r\n                                                                        <p style="font-family:Roboto;font-size:14px;margin:0;color: #95918d;display:block;line-height: 19px;padding-top:5px;">RESUL Marketing Star, <br/>PM Tower, Greams Road, Chennai, Zip Code: 600006</p>\r\n                                                                        <p style="padding-bottom:10px;font-family:Roboto;font-size:14px;margin:0;color: #95918d;display:block;line-height: 19px;"><a href="void(0)" style="color:#0c8aff;text-decoration:underline;">info@resul Marketing Star.com</a></p>\r\n                                                                    </div>\r\n\r\n                                                                </div>\r\n                                                            </td>\r\n                                                        </tr>\r\n                                                        <tr>\r\n                                                            <td>\r\n                                                                <table style="margin-right: auto; margin-left: auto;width:100%;" border="0" align="center" cellspacing="0" cellpadding="0">\r\n                                                                    <tbody>\r\n                                                                        <tr></tr>\r\n                                                                    </tbody>\r\n                                                                </table>\r\n                                                            </td>\r\n                                                        </tr>\r\n                                                    </tbody>\r\n                                                </table>\r\n                                            </td>\r\n                                        </tr>\r\n                                    </tbody>\r\n                                </table>\r\n                            </td>\r\n                            <td class="temp-txtEditor" style="text-align: left;padding-left:20px;" width="230" align="left">\r\n                                <div class="edit-outline" style="">\r\n                                    <div class="editable k-widget k-editor k-editor-inline" style="text-align: left; outline: 0pt dashed rgb(184, 184, 184);" data-role="editor" align="left" >\r\n                                        <p style="color:#0c8aff;font-family:  sans-serif;font-size: 13px;text-decoration: none;display:block;margin:0;padding:5px 5px 5px 5px;"><a href="[FORWARDFRIEND_URL]" style="color:#0c8aff;font-family:  sans-serif;font-size: 13px;text-decoration: none;margin:0;padding:0;">Forward</a></p>\r\n                                        <p style="color:#0c8aff;font-family:  sans-serif;font-size: 13px;text-decoration: none;display:block;margin:0;padding:5px 5px 5px 5px;"><a href="[UNSUBCRIPTION]" style="color:#0c8aff;font-family:  sans-serif;font-size: 13px;text-decoration: none;margin:0;padding:0;">Unsubscribe</a></p>\r\n                                        <p style="color:#0c8aff;font-family:  sans-serif;font-size: 13px;text-decoration: none;display:block;margin:0;padding:5px 5px 5px 5px;"><a href="void(0)" style="color:#0c8aff;font-family:  sans-serif;font-size: 13px;text-decoration: none;margin:0;padding:0;">Update your profile</a></p>\r\n                                        <p style="color:#0c8aff;font-family:  sans-serif;font-size: 13px;text-decoration: none;display:block;margin:0;padding:5px 5px 5px 5px;"><a href="void(0)" style="color:#0c8aff;font-family:  sans-serif;font-size: 13px;text-decoration: none;margin:0;padding:0;">Privacy policy</a></p>\r\n                                    </div>\r\n\r\n                                </div>\r\n                            </td>\r\n                        </tr>\r\n                    </tbody>\r\n                </table>\r\n            </td>\r\n        </tr>\r\n\r\n    </tbody>\r\n</table>',
    footername: 'Footer 1',
};

export const initialState = {
    isTimezoneEditable: false,
    isSubjectLineAnalysisModal: false,
    isGoogleAnnotationEditIcon: false,
    isGoogleAnnotationModal: false,
    selectedSendername: '',
    sampleEmailFooter: '',
    isAlternateEmailInput: false,
    isShowScheduleModal: false,
    currentSplitTab: 0,
    currentErrorTabName: null,
    splitTabList: ['splitA', 'splitB'],
    showSchedulerModal: false,
    splitOffConfirmationModal: false,
    proceedWithoutSchedule: false,
    showSlider: false,
    splitABCount: {},
    isSmarkLink: false,
    tabErrorText: '',
    isTestMailSent: false,
    testSentCommunicationModal: false,
    requestFalse: false,
};

{
    /* const getPeriodRange = (time) => {
        switch (time) {
            case 'Hour(s)':
                return 1;
            case 'Days(s)':
                return 2;
            case 'Week(s)':
                return 3;
            case 'Month(s)':
                return 4;
            default:
                return 0;
        }
    }; */
}

export async function syncDomainSenderDetailsIfChanged({
    getValues,
    dispatch,
    domainNameList,
    clientId,
    userId,
    departmentId,
    lastSuccessfulSenderSyncRef,
}) {
    const selected = getValues('SenderemailDomain');
    const smtpDomainSettingId = selected?.smtpDomainSettingId;
    if (smtpDomainSettingId == null || smtpDomainSettingId === '') return;

    const canonical =
        domainNameList?.find((d) => String(d.smtpDomainSettingId) === String(smtpDomainSettingId)) || selected;

    const storedName = String(canonical?.senderName ?? '').trim();
    const storedLocal = canonical?.senderEmailID
        ? String(canonical.senderEmailID).split('@')[0]?.trim() ?? ''
        : '';

    const formName = String(getValues('senderName') ?? '').trim();
    const formLocal = String(getValues('SenderemailUsername') ?? '').trim();

    if (storedName === formName && storedLocal === formLocal) {
        lastSuccessfulSenderSyncRef.current = null;
        return;
    }

    const prev = lastSuccessfulSenderSyncRef.current;
    if (
        prev &&
        String(prev.smtpDomainSettingId) === String(smtpDomainSettingId) &&
        prev.name === formName &&
        prev.local === formLocal
    ) {
        return;
    }

    if (storedLocal && storedName) {
        return
    }

    if (!storedLocal && !storedName) {
        const res = dispatch(
            updateSenderDetails({
                clientId,
                userId,
                departmentId,
                smtpDomainSettingId,
                senderName: formName,
                senderEmailAddress: formLocal,
            }),
        );
    }

}

export const SCHEDULE_START_TIME_MENU = [
    { id: 1, value: 'Hour(s)' },
    { id: 2, value: 'Day(s)' },
    { id: 3, value: 'Week(s)' },
    { id: 4, value: 'Month(s)' },
];
export const INITIAL_SPLIT_AB_STATE = [
    {
        id: 'splitA',
        text: 'Split A',
        component: () => <SplitABTab fieldName={'splitA'} key={'splitA'} />,
    },
    {
        id: 'splitB',
        text: 'Split B',
        component: () => <SplitABTab fieldName={'splitB'} key={'splitB'} />,
        add: circle_plus_medium,
    },
];
