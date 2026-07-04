import { getListingPreviewNoDataPopover, GetpopoverContent, hasListingPreviewApiContent, PREVIEW_SOURCE } from 'Utils/modules/preview';
import { analyticsAvaliableIds, analyticsIds, channelIds, getChannelId, getChannelPaidMediaId, getChannelSocialId, getNameType } from 'Utils/modules/communicationChannels';
import { getIconByStatus, getPausePlayTrigger } from 'Utils/modules/communicationStatus';
import { statusIdCheck } from 'Utils/modules/campaignUtils';
import { encodeUrl, encryptWithAES } from 'Utils/modules/crypto';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';

import { ANALYTICS, ARE_YOU_SURE_DELETE, CANCEL, DELETE, DYNAMIC_LIST_ZERO, EDIT, ENTER_COMMENTS, OK, PROCEED, VIEW } from 'Constants/GlobalConstant/Placeholders';
import { analytics_medium, comment_medium, delete_medium, eye_medium, listing_preview_medium, pencil_edit_medium, tick_medium, winner_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, cloneElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { get as _get,forEach as _forEach ,lowerCase} from 'Utils/modules/lodashReplacements';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useForm } from 'react-hook-form';
import RSTooltip from 'Components/RSTooltip';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropdown';
import RSPPophover from 'Components/RSPPophover';
import { Col } from 'react-bootstrap';

import { getSessionId } from 'Reducers/globalState/selector';

import { useNavigate } from 'react-router-dom';
import RSModal from 'Components/RSModal';
import RSConfirmationModal from 'Components/ConfirmationModal';
import {
    deleteChannelById,
    get_campaign_make_changes,
    get_campaign_reject_commets,
    Get_Preview_By_Channel,
    get_splitAB_popup,
    getCommunicationList,
    updatePlayPause,
} from 'Reducers/communication/listing/request';
import { splitABIcon } from 'Assets/Images';
import {
    CHANNEL_TYPES,
    getGoalType,
} from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Plan/Tabs/DeliveryMethod/constant';
import { setTabforEdit, updateMDCEditMode, updateTab } from 'Reducers/communication/createCommunication/Create/reducer';
import { availableTabs } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/constant';
import { updatePopupContent, updatePopupModal } from 'Reducers/communication/listing/reducer';
import { Progressbar } from 'Constants/Charts/pieChartPercentage';
import { CommunicationListingsContext } from '../../CommunicationListings';
import { buildPayloadListingApi, handleQrTypeTab, getSentByChannelDisplay, buildPayload } from '../../constant';
import { updateAnalyticsDetail } from 'Reducers/analytics/communicationAnalytics/reducer';
import { buildDetailAnalyticsNavState } from 'Pages/AuthenticationModule/Analytics/Pages/communicationAnalytics/DetailedAnalytics/constants';
import KendoGrid from 'Components/RSKendoGrid';
import { MDC_AUTHORING_CHANNEL_CONFIG } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/MdcComponents/Create/constant';
import { getTriggerDynamicListChanneltype } from 'Reducers/communication/createCommunication/plan/request';
import { getEligibleChannelIds } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Plan/Tabs/DeliveryMethod/constant';

import RSTextarea from 'Components/FormFields/RSTextarea';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { splitA, splitB, splitC, splitD } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { MAX_LENGTH250 } from 'Constants/GlobalConstant/Regex';

import { SplitTypes, parseSplitABPopupResponse } from 'Pages/AuthenticationModule/Components/SplitABScheduler/constant';
import { getSocialPostTypeLabelForListing } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs/SocialPost/constant';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

const COMMENT_MODAL_LOADER_CONFIG = { create: 'none', edit: 'none' };
const LISTING_FIELD_LOADER_CONFIG = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };

const REJECT_COMMENT_GRID_COLUMNS = [
    { field: 'ApprovalEmailSentTo', title: 'Approval sent to' },
    { field: 'CreatedDate', title: ' Create date' },
    { field: 'UserReasons', title: 'Reason', width: 200 },
    { field: 'UserComments', title: 'Comments' },
];
import TruncateCell from 'Components/RSKendoGrid/TruncateCell';

const DetailedStatus = ({
    content,
    dataItem,
    idx,
    isExistOfflineConversionChannel,
    isSubsegment = false,
    splitIndex = null,
    hasGrouping = false,
    showPostTypeColumn = false,
    showSentByChannel = false,
}) => {
    const isGrouping = content?.isGrouping || false;
    const groupDetails = content?.SplitDetails || [];
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const store = useStore();
    const {
        control,
        watch,
        setValue,
        setError,
        clearErrors,
        formState: { errors },
        trigger,
    } = useForm({
        mode: 'onTouched',
    });
    const { parentClientId, departmentId, userId, clientId, ...user } = useSelector((state) => getSessionId(state));
    const { selecteTabforEdit } = useSelector((state) => state.createCommunicationReducer);

    const { savedChannelsId, campaignBlastDetails } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const { campaignDetail = {}, data = {} } = useSelector((state) => state.communicationListingReducer ?? {});
    const statusId = content?.statusId;
    const communicationStatusId = dataItem?.statusId; // communicationStatus
    const isArchivable =
        communicationStatusId === 6 ||
        communicationStatusId === 7;
    const { icon, title } = getIconByStatus(statusId);
    const socialSubChannelId = content?.socialPostChannelId ?? content?.subChannelId ?? 0;

    let channelData =
        content?.channelId === 7
            ? getChannelSocialId(socialSubChannelId || 0)
            : content?.channelId === 10
                ? getChannelPaidMediaId(socialSubChannelId || 0)
                : getChannelId(content?.channelId);
    // console.log('channelData: ', channelData);
    const { icon: channelIcon, name, label, tabName, bgColor } = channelData || {};
    // const {
    //     icon: channelIcon,
    //     name,
    //     label,
    //     tabName,
    //     bgColor,
    // } = content.channelId === 7 ? getChannelSocialId(content?.socialPostChannelId) :content.channelId === 10 ? getChannelPaidMediaId(content?.socialPostChannelId) : getChannelId(content?.channelId);

    const isSplit = content?.isSplitAB;
    const campaignId = _get(dataItem, 'campaignId', 0);
    let campaignTypeEvaluate = _get(dataItem, 'campaignTypeValue', '').slice(0, 1);
    const campaignType = campaignTypeEvaluate === "E" ? "T" : campaignTypeEvaluate;
    const isLimitList = content?.islimitlist || false;
    const limitliststatusId = content?.limitliststatusId;
    const triggerPlayPauseStatus = content?.triggerPlayPauseStatus;
    const contextState = useContext(CommunicationListingsContext);
    const { setPlayPauseInitialPayload } = contextState;

    // lakshmi boostrap default value not change render
    // const getDefaultItem = () => {
    //     if (campaignType === 'E') {
    //         const pausePlayStatusId = _get(content, 'triggerPlayPauseStatus');
    //         const { defaultItem, options } = getPausePlayTrigger(pausePlayStatusId);
    //         return {
    //             defaultItem,
    //             options,
    //         };
    //     }
    // };

    // const defaultValue = getDefaultItem();

    // const [{ defaultItem, options }, setPlayPauseTrigger] = useState({
    //     defaultItem: defaultValue?.defaultItem,
    //     options: defaultValue?.options,
    // });

    const [{ defaultItem, options }, setPlayPauseTrigger] = useState({
        defaultItem: {},
        options: [],
    });
    const [pendingSelection, setPendingSelection] = useState(null);
    const [{ isPausePlayTrigger, payload, type }, setPausePlayPopupConfig] = useState({
        isPausePlayTrigger: false,
        payload: {},
        type: '',
    });
    const [showComment, setShowComment] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);
    const [showCommentData, setShowCommentData] = useState([]);
    const [showModalRejectsCommentsData, setShowModalRejectsCommentsData] = useState({
        show: false,
        rejectComments: [],
    });
    const [preview, setPreview] = useState({});
    const popoverTriggerRef = useRef(null);

    const makeChangesCommentLoader = useApiLoader({ loaderConfig: COMMENT_MODAL_LOADER_CONFIG, autoFetch: false });
    const rejectCommentLoader = useApiLoader({ loaderConfig: COMMENT_MODAL_LOADER_CONFIG, autoFetch: false });
    const editFlowLoader = useApiLoader({ loaderConfig: LISTING_FIELD_LOADER_CONFIG, autoFetch: false });

    const getCommentApiPayload = useCallback(
        () => ({
            campaignId: content?.campaignId || 0,
            channelId: content?.channelId || 0,
            departmentId,
            userId,
            clientId,
            channelDetailId: content?.channeldetailId || 0,
        }),
        [content?.campaignId, content?.channelId, content?.channeldetailId, departmentId, userId, clientId],
    );
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = async () => {
        const deletePayload = {
            clientId,
            departmentId,
            campaignId,
            channelDetailid: content?.channeldetailId || content?.channelDetailID || 0,
            channelType: content?.channelId,
            campaignType,
            status: content?.statusId,
            createdBy: dataItem?.createdById || userId,
            levelNumber: content?.levelNumber || 1,
        };
        const response = await dispatch(
            deleteChannelById({
                payload: deletePayload,
            }),
        );
        setShowDeleteModal(false);
        if (response?.status) {
            const { requestPayload } = contextState || {};
            const listPayload = {
                userId,
                clientId,
                departmentId,
                campaignId,
            };
            dispatch(
                getCommunicationList({
                    payload: buildPayload({
                        ...listPayload,
                        totalRows: requestPayload?.pageSize ?? data?.totalRows ?? 5,
                        ...requestPayload,
                        userId: requestPayload?.userId ?? userId,
                    }, true),
                }),
            );
        }
    };

    const socialPostTypeLabel = showPostTypeColumn ? getSocialPostTypeLabelForListing(content, tabName) : '';

    const handleClickEyeIcon = async (e) => {
        if (isPreviewLoaded || isPreviewLoading) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        setIsPreviewLoading(true);

        const payload = {
            userId,
            departmentId,
            clientId,
            campaignId,
            channelId: content?.channelId || 0,
            levelNumber: content?.levelNumber || 1,
            ChannelDetailID: content?.channeldetailId || 0,
        };

        try {
            const previewResponse = await dispatch(Get_Preview_By_Channel(payload, false));

            if (!hasListingPreviewApiContent(content?.channelId, previewResponse, content)) {
                setPreview(getListingPreviewNoDataPopover());
                setIsPreviewLoaded(true);
                setTimeout(() => {
                    if (popoverTriggerRef.current) {
                        popoverTriggerRef.current.click();
                    }
                }, 100);
                return;
            }

            const previewData = previewResponse?.data?.[0] || {};
            const props = {
                content: previewData?.content,
                name: dataItem?.createdBy,
                date: content?.scheduleDateTime,
                senderId: content?.senderName,
                previewImage: previewData?.imagePath,
                scheduleDate: content?.scheduleDateTime,
                webContent: content?.content,
                notification: previewData || undefined,
                notifications: previewResponse?.data || undefined,
                slides: previewResponse?.data || undefined,
                carouselJSON: previewData?.carouselJSON ? previewData?.carouselJSON : undefined,
                isCarousel: previewData?.isCarousel ? previewData?.isCarousel : false,
                header: content?.header ? content?.header : undefined,
                footer: content?.footer ? content?.footer : previewData?.footer ? previewData?.footer : undefined,
                showAsHtml: true,
                ...(content?.channelId === 7 && {
                    imageUrl: previewData?.imagePath || '',
                    socialPostChannelId: content?.socialPostChannelId || 0,
                    postUrl: previewData?.postLink || '',
                    scheduleTime: content?.scheduleDateTime || null,
                }),
                ...(content?.channelId === 21 && {
                    imagePath: previewData?.imagePath || previewData?.mediaurl || '',
                }),
                contentJson: previewData?.contentjson,
                previewSource: PREVIEW_SOURCE?.COMM_LISTING,
                ...(content?.channelId === 14 && {
                    mainClassName: 'main_wrapper_mp_preview_listing'
                }),
            };
            const previewContent = GetpopoverContent(content?.channelId, props);
            setPreview(previewContent);
            setIsPreviewLoaded(true);

            setTimeout(() => {
                if (popoverTriggerRef.current) {
                    popoverTriggerRef.current.click();
                }
            }, 100);
        } catch (error) {
            setPreview(getListingPreviewNoDataPopover());
            setIsPreviewLoaded(true);
            setTimeout(() => {
                if (popoverTriggerRef.current) {
                    popoverTriggerRef.current.click();
                }
            }, 100);
        } finally {
            setIsPreviewLoading(false);
        }
    };

    useEffect(() => {
        if (campaignType === 'E'|| campaignType === 'T' || isLimitList) {
            const pausePlayStatusId = _get(content, 'triggerPlayPauseStatus');
            const { defaultItem, options } = getPausePlayTrigger(limitliststatusId || pausePlayStatusId, {
                isScheduled: statusId === 7,
            });
            setPlayPauseTrigger({
                defaultItem,
                options,
            });
            // Initialize form value
            setValue('playPauseDropdown', defaultItem);
        }
    }, []);

    // Update form value when defaultItem changes
    useEffect(() => {
        if (defaultItem && Object.keys(defaultItem).length > 0) {
            setValue('playPauseDropdown', defaultItem);
        }
    }, [defaultItem, setValue]);

    const handleCommunicationStatus = (statusId) => {
        // 5 - Inprogress   9 - completed    20 - MuliStatus    26 - stop    27 - pause
        return (
            statusId !== 9 &&
            statusId !== 5 &&
            statusId !== 20 &&
            statusId !== 27 &&
            statusId !== 26 &&
            statusId !== 51 &&
            statusId !== 52
        );
    };

    const runEditFlow = async () => {
        const communicationStatus = handleCommunicationStatus(communicationStatusId);
        let tabValue = !!name ?  lowerCase(name) :  lowerCase(label);
        let tabValueName = getNameType(tabValue);
        let verticalValues = Object.keys(availableTabs);
        const verticalIndex = verticalValues.indexOf(tabValueName);
        let selectedArray = availableTabs[`${tabValueName}`];
        let tabIndex = selectedArray.indexOf(tabValue);
        dispatch(
            setTabforEdit({
                type: tabValueName,
                currentTab: verticalIndex,
            }),
        );
        dispatch(
            updateTab({
                field: tabValueName,
                data: {
                    tabName: availableTabs[tabValueName][tabIndex],
                    currentIndex: tabIndex,
                },
            }),
        );

        // qr tab update flow
        const isQr = content?.channelId === 3 ? true : false;

        if (isQr) {
            handleQrTypeTab(content, dispatch);
        }
        // 1 - full TL list
        // 3 - TL,AL List Mixed
        let channels = _get(dataItem, 'channels', '').split(',');
        if (isExistOfflineConversionChannel && [1, 3]?.includes(parseInt(campaignBlastDetails?.[0]?.isAdhoclist, 10))) channels.push(1001);
        const channelList = [],
            analyticsList = [];
        _forEach(channels, (id) => {
            id = Number(id);
            if (channelIds.includes(id)) channelList.push(id);
            if (analyticsIds.includes(id)) analyticsList.push(id);
        });
        const isEditable = statusId !== 9 && statusId !== 5;

        let eligibleChannelType = {};

        if ((campaignType === 'E' || campaignType === 'T') && (content?.dynamiclistId || content?.dynamicListId)) {
            const payload = {
                dynamicList: content?.dynamiclistId || content?.dynamicListId,
                campaignType: 'T',
                campaignId: dataItem?.campaignId,
                departmentId,
            };
            try {
                const response = await dispatch(getTriggerDynamicListChanneltype({ payload, loading: false }));
                if (response?.status && response?.data?.length) {
                    channelList?.forEach((channel) => {
                        const matchChannelType = CHANNEL_TYPES?.find(
                            (channelType) => channelType.id?.includes(channel) && channelType?.checkAllChannelsExist,
                        );
                        if (matchChannelType) {
                            eligibleChannelType[channel] = getEligibleChannelIds(
                                response?.data,
                                channel,
                                _get(dataItem, 'campaignId', 0),
                            );
                        }
                    });
                }
            } catch (error) {
            }
        }

        const state = {
            campaignId,
            campaignType: campaignType === 'E' ? 'T' : campaignType,
            channels: channelList,
            startDate: _get(dataItem, 'startDate', ''),
            endDate: _get(dataItem, 'endDate', ''),
            campaignName: _get(dataItem, 'campaignName', ''),
            communicationType: _get(dataItem, 'communicationType', ''),
            primaryGoal: getGoalType(_get(dataItem, 'primaryTargetCode', 0)),
            productType: _get(dataItem, 'productCategoryName', ''),
            analyticsTypes: analyticsList,
            editSourceChannelId: Number(content?.channelId) || 0,
            editSourceSubChannelId: Number(content?.subChannelId) || 0,
            currentIndex: tabIndex,
            analyticsTabIndex: tabValueName === 'analytics' ? tabIndex : undefined,
            statusId: communicationStatusId,
            isEditable,
            savedChannelsId,
            offlineConversion: isExistOfflineConversionChannel,
            communicationExcuteStatus: communicationStatus,
            dynamicListId: content?.dynamicListId || content?.dynamiclistId,
            eligibleChannelType,
            campaignStatusId: communicationStatusId,
            splitType: content?.splitType ? `split${content?.splitType}` : '',
            roi: dataItem?.isRoi || content?.isRoi || false
        };

        if (campaignType === 'M') {
            try {
                const getChannelIdById = (id) => {
                    const channel = MDC_AUTHORING_CHANNEL_CONFIG.find((item) => item.id === id);
                    if (!channel) {
                        throw new Error(`Channel with id ${id} not found`);
                    }
                    return channel.channelId;
                };
                dispatch(updateMDCEditMode('edit'));
                const authoringUrl = `/communication/create-mdc-communication`;
                const updateLocationState = {
                    ...state,
                    mode: 'edit',
                    mdcContentSetupDetails: {
                        channelId: getChannelIdById(content?.channelId) || 'ch001',
                        channelDetailId: content?.channeldetailId || 0,
                        levelNumber: content?.levelNumber || 1,
                        actionId: content?.actionId || 0,
                        scheduleDate: content?.scheduleDateTime,
                        channelFriendlyName: content?.channelFriendlyName || '',
                        dataSource: content?.dynamicListId > 0 || content?.dynamiclistId > 0 ? 'DL' : 'TL',
                        dynamiclistId: content?.dynamicListId || content?.dynamiclistId || 0,
                        name: getChannelId(content?.channelId)?.name || 'email'
                    },
                };
                const encryptState = encodeUrl(updateLocationState);
                navigate(`${authoringUrl}?q=${encryptState}`, {
                    state,
                });
            } catch (error) {
                const url = '/communication/mdc-workflow';
                const encryptState = encodeUrl(state);
                navigate(`${url}?q=${encryptState}`, {
                    state,
                });
            }
            return false;
        }
        const encryptState = encodeURIComponent(encryptWithAES(JSON.stringify(state).replace(/\+/g, '%2B')));
        navigate(`/communication/create-communication?q=${encryptState}`);
    };

    const editFlow = () => {
        if (editFlowLoader.isFetching) return;
        editFlowLoader.refetch({ fetcher: runEditFlow });
    };

    const eventPausePlay = async (choice, channelDetails) => {
        setPendingSelection(choice);
        setValue('playPauseDropdown', defaultItem);
        setPlayPauseInitialPayload((pre) => ({
            ...pre,
            name: dataItem?.campaignName || '',
            campaignId: dataItem?.campaignId || 0,
        }));
        const { id, type } = choice;
        const payload = {
            // ...user,
            statusId: id,
            channelId: _get(channelDetails, 'channelId', 0),
            campaignId,
            departmentId,
            userId,
            fromStatusId: defaultItem?.id || 0,
        };
        setPausePlayPopupConfig({
            isPausePlayTrigger: true,
            payload,
            type,
        });
    };

    const handleOpenModal = async () => {
        const payload = {
            campaignId: content?.campaignId || 0,
            channelId: content?.channelId || 0,
            departmentId,
            userId,
            clientId,
        };
        const modalMeta = {
            popupModal: true,
            channelId: content?.channelId || 0,
            endDate: dataItem?.endDate ?? '',
            startDate: dataItem?.startDate ?? '',
            campaignId,
        };

        dispatch(updatePopupContent([]));
        dispatch(updatePopupModal({ ...modalMeta, splitABPopupLoading: true }));

        try {
            const response = await dispatch(get_splitAB_popup({ payload }));
            dispatch(updatePopupContent(parseSplitABPopupResponse(response)));
        } finally {
            const { campaignDetail: activeModal } = store.getState().communicationListingReducer ?? {};
            if (activeModal?.popupModal && activeModal?.campaignId === campaignId) {
                dispatch(updatePopupModal({ ...modalMeta, splitABPopupLoading: false }));
            }
        }
    };

    const handleCommListingApi = async (pausePlayId) => {
        const { requestPayload, expandChange, setPlayPauseStopStatusContent, playPauseInitialPayload } =
            contextState || {};
        const payload = buildPayloadListingApi(playPauseInitialPayload, requestPayload);
        const apiResult = await dispatch(getCommunicationList({ payload }));
        const { data: listPayload } = coerceApiListingPayload(apiResult);
        const { communicationsList = [] } = listPayload ?? EMPTY_COMMUNICATION_LISTING_DATA;

        const dataItem = communicationsList.find(
            (comm) => comm?.campaignId === playPauseInitialPayload?.campaignId,
        );

        if (dataItem) {
            await expandChange({ dataItem }, communicationsList);
            const playPauseStatusName = await getPausePlayTrigger(pausePlayId || 0);
            setPlayPauseStopStatusContent({
                showContent: true,
                messageContent: `Communication ${dataItem?.campaignName} has been ${playPauseStatusName?.defaultItem?.type === 'start'
                    ? 'resumed'
                    : playPauseStatusName?.defaultItem?.type === 'pause'
                        ? 'paused'
                        : playPauseStatusName?.defaultItem?.type === 'stop'
                            ? 'stopped'
                            : playPauseStatusName?.defaultItem?.type
                    } `,
            });
        }

        setTimeout(() => {
            setPlayPauseStopStatusContent({
                showContent: false,
                messageContent: '',
            });
        }, 5000);
    };

    const handleMakeChangesCommentClick = async () => {
        setShowComment(true);
        setShowCommentData([]);

        const response = await makeChangesCommentLoader.refetch({
            fetcher: (payload) => dispatch(get_campaign_make_changes(payload)),
            params: getCommentApiPayload(),
        });

        if (response?.status) {
            setShowCommentData(response?.data ? JSON.parse(response.data) : []);
        } else {
            setShowComment(false);
        }
    };

    const handleRejectCommentClick = async () => {
        setShowModalRejectsCommentsData({ show: true, rejectComments: [], message: '' });

        const response = await rejectCommentLoader.refetch({
            fetcher: (payload) => dispatch(get_campaign_reject_commets(payload)),
            params: getCommentApiPayload(),
        });

        if (response?.status) {
            setShowModalRejectsCommentsData({
                show: true,
                rejectComments: response?.workflowDetails?.length ? response.workflowDetails : [],
                message: '',
            });
        } else {
            setShowModalRejectsCommentsData({
                show: true,
                rejectComments: [],
                message: response?.message,
            });
        }
    };

    const isPreviewDisabled =
        content.channelId === 6 ||
        content.channelId === 16 ||
        content.channelId === 33;

    const handleIconStatus = () => {
        const isEditable = statusIdCheck(statusId ?? null);
        const campaignEditableStatus = statusIdCheck(communicationStatusId ?? null)
        const isAnalytics = content?.channelId === 6 || content?.channelId === 16
        if (isEditable || triggerPlayPauseStatus === 27 || (isAnalytics && campaignEditableStatus)) {
            return {
                icon: `${pencil_edit_medium}`,
                tooltipText: EDIT,
            };
        } else {
            return {
                icon: `${listing_preview_medium}`,
                tooltipText: VIEW,
            };
        }
    };

    const splitInfo = useMemo(() => {
        const splitNames = content?.splitTypes || [];
        const splitColors = [splitA, splitB, splitC, splitD];

        const winnerSplit = `Split ${content?.iswinnerSplitType}`;
        const currentSplitName = (typeof splitIndex === 'number' && splitNames[splitIndex]) ? splitNames[splitIndex] : (content?.splitType ? `Split ${content?.splitType}` : '');
        const isWinner = content?.iswinnerSplit && winnerSplit?.toUpperCase() === currentSplitName?.toUpperCase();
        if (isWinner) {
            return {
                name: `${winnerSplit} (Winner)`,
                color: '#FFB300',
                isWinner: true,
                icon: winner_mini,
            };
        }

        // 🔤 Match by splitType value
        if (currentSplitName) {
            const index = splitNames.findIndex((name) => name?.toUpperCase() === currentSplitName.toUpperCase());

            if (index !== -1) {
                return {
                    name: splitNames[index],
                    color: splitColors[index] || '#666666',
                    isWinner: false,
                };
            }
        }

        // 🔢 Fallback using splitIndex (if passed separately)
        if (typeof splitIndex === 'number' && splitNames[splitIndex]) {
            return {
                name: splitNames[splitIndex],
                color: splitColors[splitIndex] || '#666666',
                isWinner: false,
            };
        }

        return null;
    }, [
        content?.splitTypes,
        content?.splitType,
        content?.iswinnerSplit,
        content?.iswinnerSplitType,
        splitIndex,
        splitA,
        splitB,
        splitC,
        splitD,
    ]);

    return (
        <Fragment>
            <tr key={content?.blastGuid} className={`${isGrouping ? 'split-info-wrapper' : ''}`}>
                {campaignType === 'M' && isSubsegment && (
                    <td>{content?.subSegmentFriendlyName?.trim() && <p>{content?.subSegmentFriendlyName}</p>}</td>
                )}

                <td
                    className={`${isSubsegment ? 'subsegment-channel-border' : ''} ${isGrouping
                        ? groupDetails?.length - 1 === splitIndex
                            ? 'campaign-custom-right-bottom'
                            : 'campaign-custom-border'
                        : ''
                        }`}
                >
                    {' '}
                    {(!isGrouping || splitIndex === 0) && (
                        <div className="d-flex">
                            <RSTooltip text={label}>
                                <div className={`social-icon ${bgColor}`}>
                                    <i className={`${channelIcon} icon-md white`}></i>
                                </div>
                            </RSTooltip>
                        </div>
                    )}
                </td>
                {hasGrouping && (
                    <td>
                        {isGrouping && (
                            <div className="split-indicator-wrapper">
                                {splitInfo?.isWinner ? (
                                    <i
                                        className={`${splitInfo.icon} icon-xs mr13 split-winner-icon pe-none`}
                                        style={{ color: splitInfo.color }}
                                    />
                                ) : (
                                    <span className="split-dot mr15" style={{ backgroundColor: splitInfo?.color }} />
                                )}
                                <span className="split-label">{`${splitInfo?.name}`}</span>
                            </div>
                        )}
                    </td>
                )}

                {/* <td>{content?.channelFriendlyName && <p>{content?.channelFriendlyName}</p>}</td> */}
                {campaignType === 'M' && (
                    <td>
                        {content?.channelFriendlyName && (
                            <>
                                {/* {content?.channelFriendlyName?.length > 20 ? (
                                    <RSTooltip position="top" text={content?.channelFriendlyName}  className='lh-sm d-inline-flex'>
                                        <p>{truncateTitle(content?.channelFriendlyName, 20)}</p>
                                    </RSTooltip>
                                ) : (
                                    <p>{content?.channelFriendlyName}</p>
                                )} */}
                                <TruncateCell value={content?.channelFriendlyName} noTable={true} />
                            </>
                        )}
                    </td>
                )}
                <td>
                    {/* {true ? <>
            <div className="d-flex">
                
                <i className={`${tick_medium} icon-md color-primary-green pr5`}></i>  : <img src={splitABIcon} alt='' />
                <p>{content?.status}</p>
                
            </div></>} */}
                    <div className="cl-status-icons d-flex align-items-center">
                        {
                            //content.channelId === 6 || content.channelId === 16
                            false ? (
                                <></>
                            ) : (
                                <Fragment>
                                    <RSTooltip position="top" text={title} className="mr15">
                                        <i className={icon} />
                                    </RSTooltip>
                                    {statusId === 52 && (
                                        <small className="fs17 color-primary-black lh-sm">
                                            {DYNAMIC_LIST_ZERO}
                                        </small>
                                    )}
                                    {(statusId === 54 || statusId === 12 || statusId === 2) && (
                                        <p className="fs17 color-primary-black lh-sm">{title}</p>
                                    )}
                                    {isSplit && (statusId === 5 || statusId === 9) && (
                                        <img src={splitABIcon} alt="splitABIcon" className="mr5" />
                                    )}
                                    {isSplit && (campaignType !== 'E' || campaignType !== 'T') && (statusId === 5 || statusId === 9) && (
                                        <span
                                            className="splitab-underline cp"
                                            onClick={() => {
                                                handleOpenModal();
                                            }}
                                        >
                                            Split - {title}
                                        </span>
                                    )}

                                    {/* Only show in channel types, not in analytics types, so it's hidden. */ console.log('campaignType',campaignType)}

                                    {((isLimitList && statusId !== 9) ||
                                        (campaignType === 'E'||campaignType === 'T' &&
                                            content?.channelId !== 6 &&
                                            content?.channelId !== 16 &&
                                            (statusId === 5 ||
                                                statusId === 7 ||
                                                statusId === 26 ||
                                                statusId === 27 ||
                                                statusId === 28))) && (
                                            <>
                                                <Progressbar
                                                    bgcolor={'#26ade0'}
                                                    progress={50}
                                                    height={5}
                                                    width={100}
                                                    borderRadius={20}
                                                    icon={<i className={`icon-lg color-primary-blue d-block`}></i>}
                                                    // tooltip={key.split('_').join(' ')}
                                                    // isToolTip
                                                    isDetailStatus={true}
                                                    listingProgressbarClassName="mr5"
                                                />
                                                {defaultItem?.id === 26 ? (
                                                    <RSTooltip text="Stop" position="top">
                                                        <div
                                                            className={`${limitliststatusId === 26 || triggerPlayPauseStatus === 26
                                                                ? 'pe-none click-off'
                                                                : ''
                                                                }`}
                                                        >
                                                            <RSKendoDropDown
                                                                control={control}
                                                                name="playPauseDropdown"
                                                                data={options}
                                                                defaultValue={defaultItem}
                                                                textField="type"
                                                                dataItemKey="id"
                                                                className={`no_caret playdropdown ${content?.triggerPlayPauseStatus === 26 ? ' pe-none listing_stop_tooltip' : ''
                                                                    }`}
                                                                popupSettings={{
                                                                    popupClass: `listing-play-pause-dropdown`,
                                                                }}
                                                                handleChange={(e) => eventPausePlay(e.value, content)}
                                                                // isLoading={content?.triggerPlayPauseStatus === 26}
                                                                isCustomRender={true}
                                                                itemRender={(li, itemProps) => {
                                                                    return cloneElement(
                                                                        li,
                                                                        li.props,
                                                                        itemProps.dataItem?.icon,
                                                                    );
                                                                }}
                                                                valueRender={(element, value) => {
                                                                    return value?.icon || element;
                                                                }}
                                                                isShowBordertip
                                                            />
                                                        </div>
                                                    </RSTooltip>
                                                ) : (
                                                    <div
                                                        className={`${limitliststatusId === 26 || triggerPlayPauseStatus === 26
                                                            ? 'pe-none click-off'
                                                            : ''
                                                            }`}
                                                    >
                                                        <RSKendoDropDown
                                                            control={control}
                                                            name="playPauseDropdown"
                                                            data={options}
                                                            defaultValue={defaultItem}
                                                            textField="type"
                                                            dataItemKey="id"
                                                            className={`no_caret playdropdown${content?.triggerPlayPauseStatus === 26 ? ' pe-none' : ''
                                                                }`}
                                                            popupSettings={{
                                                                popupClass: `listing-play-pause-dropdown`,
                                                            }}
                                                            handleChange={(e) => eventPausePlay(e.value, content)}
                                                            // isLoading={content?.triggerPlayPauseStatus === 26}
                                                            isCustomRender={true}
                                                            itemRender={(li, itemProps) => {
                                                                return cloneElement(
                                                                    li,
                                                                    li.props,
                                                                    itemProps.dataItem?.icon,
                                                                );
                                                            }}
                                                            valueRender={(element, value) => {
                                                                return value?.icon || element;
                                                            }}
                                                            isShowBordertip
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    {statusId === 7 && (
                                        <Fragment>
                                            <small className="fs17 color-primary-black">
                                                {/* {getDateWithDDMMM(content?.scheduleDateTime)} */}
                                                {/* {getUserDateTimeFormat(content?.scheduleDateTime, 'formatDateTime')} */}
                                                {getUserCurrentFormat(content?.scheduleDateTime)?.dateTimeFormat}
                                            </small>
                                        </Fragment>
                                    )}
                                </Fragment>
                            )
                        }
                    </div>
                </td>
                {showPostTypeColumn && (
                    <td>{socialPostTypeLabel ? <p className="mb0">{socialPostTypeLabel}</p> : null}</td>
                )}
                {showSentByChannel && (
                    <td className="text-end">
                        {getSentByChannelDisplay(content?.channelId, content?.sentCount)}
                    </td>
                )}
                <td>
                    <ul className="rs-communication-icon">
                        {statusId === 54 && (
                            <li>
                                <RSTooltip text="Comments" position="top">
                                    <i
                                        id="rs_data_comment"
                                        className={`${comment_medium} icon-md color-primary-blue  `}
                                        onClick={handleMakeChangesCommentClick}
                                    ></i>
                                </RSTooltip>
                            </li>
                        )}

                        {statusId === 51 && (
                            <li>
                                <RSTooltip text="Comments" position="top">
                                    <i
                                        id="rs_data_comment"
                                        className={`${comment_medium} icon-md color-primary-blue  `}
                                        onClick={handleRejectCommentClick}
                                    ></i>
                                </RSTooltip>
                            </li>
                        )}

                        <li>
                            {isPreviewLoaded && !isPreviewDisabled ? (
                                <RSPPophover
                                    position="left"
                                    {...preview}
                                    popover_overlay_class={`commlistpreview ${content?.channelId === 14 ? 'mobile-prev' : ''
                                        } ${content?.channelId === 7 ? 'p0 border-0 border-r10 social-post-preview ' : ''} ${content?.channelId === 1 ? 'p0 email_listing_preview' : ''
                                        } ${content?.channelId === 8 ? '' : ''} ${content?.channelId === 3 ? 'email_listing_preview QR_listing_preview' : ''
                                        }`}
                                    trigger="click"
                                >
                                    <span className="eye-icon-wrapper d-flex" ref={popoverTriggerRef}>
                                        <RSTooltip text="Preview" position="top">
                                            <i
                                                id="rs_data_eye"
                                                className={`${eye_medium} icon-md color-primary-blue cp`}
                                            ></i>
                                        </RSTooltip>
                                    </span>
                                </RSPPophover>
                            ) : (
                                <RSTooltip text={isPreviewLoading ? 'Loading...' : 'Preview'} position="top">
                                    <span
                                        className={`eye-icon-wrapper d-flex align-items-center justify-content-center ${
                                            isPreviewDisabled ? 'pe-none click-off' : ''
                                        } ${isPreviewLoading ? 'eye-icon-wrapper--loading' : ''}`}
                                        ref={popoverTriggerRef}
                                        onClick={
                                            isPreviewDisabled || isPreviewLoading ? undefined : handleClickEyeIcon
                                        }
                                    >
                                        {isPreviewLoading ? (
                                            <span
                                                className="segment_loader listing-preview-eye-loader"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <i
                                                id="rs_data_eye"
                                                className={`${eye_medium} icon-md color-primary-blue cp`}
                                            />
                                        )}
                                    </span>
                                </RSTooltip>
                            )}
                        </li>
                        <li>
                            <RSTooltip text={editFlowLoader.isLoading ? 'Loading...' : handleIconStatus()?.tooltipText}>
                                <span
                                    className={`eye-icon-wrapper d-flex align-items-center justify-content-center ${
                                        editFlowLoader.isLoading ? 'eye-icon-wrapper--loading' : ''
                                    }`}
                                    onClick={editFlowLoader.isFetching ? undefined : editFlow}
                                >
                                    {editFlowLoader.isLoading ? (
                                        <span
                                            className="segment_loader listing-preview-eye-loader"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <i
                                            id="rs_data_pencil_edit"
                                            className={`${handleIconStatus()?.icon} icon-md color-primary-blue`}
                                        />
                                    )}
                                </span>
                            </RSTooltip>
                        </li>
                        <li>
                            <RSTooltip text={ANALYTICS}>
                                <span
                                    className={
                                        content?.channelId === 16 ||
                                            content?.channelId === 6 ||
                                            content?.channelId === 33 ||
                                            !analyticsAvaliableIds.includes(content?.statusId)
                                            ? 'pe-none click-off'
                                            : ''
                                    }
                                >
                                    <i
                                        className={`${analytics_medium} 
                                      icon-md color-primary-blue`}
                                        onClick={() => {
                                            const isSplitABScheduler = content?.isSplitAB;
                                            const splitLetter = isSplitABScheduler
                                                ? SplitTypes(idx)
                                                : '';
                                            const splitName =
                                                isSplitABScheduler && splitLetter
                                                    ? `Split ${splitLetter}`
                                                    : '';
                                            const isWinnerSplitSelected =
                                                content?.iswinnerSplit &&
                                                String(content?.iswinnerSplitType || '').toUpperCase() ===
                                                String(
                                                    splitLetter || content?.splitType || '',
                                                ).toUpperCase();
                                            const selectedBlastId =
                                                isWinnerSplitSelected && content?.iswinnerB2
                                                    ? content?.iswinnerB2
                                                    : content?.blastId;
                                            const state = buildDetailAnalyticsNavState({
                                                channelName: content?.channelName || label,
                                                channelId: content?.channelId,
                                                subChannelId: content?.subChannelId,
                                                socialPostChannelId: content?.socialPostChannelId,
                                                campaignId,
                                                blastId: selectedBlastId,
                                                startDate: dataItem?.startDate,
                                                endDate: dataItem?.endDate,
                                                iswinnerSplit: content?.iswinnerSplit,
                                                iswinnerSplitType: content?.iswinnerSplitType,
                                                isSplitAB: content?.isSplitAB,
                                                isSplitABScheduler,
                                                subSegmentLevel: content?.subSegmentLevel,
                                                subSegmentFriendlyName: content?.subSegmentFriendlyName,
                                                fromPath: '/communication',
                                                isFromListingPage: true,
                                                currIndex: idx,
                                                iswinnerBlastId:
                                                    content?.iswinnerSplit && content?.iswinnerB2
                                                        ? content?.iswinnerB2
                                                        : '',
                                                splitName,
                                                splitType: content?.splitType,
                                            });
                                            dispatch(
                                                updateAnalyticsDetail({
                                                    channelName: content?.channelName,
                                                    campaignId: campaignId,
                                                    from: 'communication',
                                                    blastId: selectedBlastId,
                                                    channelId: content?.channelId,
                                                    subChannelId: state.subChannelId,
                                                    currIndex: idx,
                                                    isSplitABScheduler,
                                                    splitName:
                                                        splitName ||
                                                        state.splitName ||
                                                        content?.splitNameVal ||
                                                        'A',
                                                    subSegmentLevel: content?.subSegmentLevel,
                                                    subSegmentFriendlyName:
                                                        content?.subSegmentFriendlyName,
                                                }),
                                            );
                                            const encryptState = encodeUrl(state);
                                            navigate(`/analytics/detail-analytics?q=${encryptState}`, {
                                                state,
                                            });
                                        }}
                                    ></i>
                                </span>
                            </RSTooltip>
                        </li>
                        <li>
                            <RSTooltip text={DELETE}>
                                <span
                                    className={
                                        !isArchivable
                                            ? 'pe-none click-off'
                                            : ''
                                    }
                                >
                                    <i
                                        id="rs_data_trash_delete"
                                        className={`${delete_medium} icon-md color-primary-red cp`}
                                        onClick={() => setShowDeleteModal(true)}
                                    ></i>
                                </span>
                            </RSTooltip>
                        </li>
                    </ul>
                </td>
            </tr>

            {isPausePlayTrigger && (
                <RSModal
                    show={isPausePlayTrigger}
                    size="md"
                    header={'Confirmation'}
                    handleClose={() => {
                        clearErrors();
                        setValue('playPauseComments', '');
                        setValue('playPauseDropdown', defaultItem);
                        setPendingSelection(null);
                        setPausePlayPopupConfig({
                            isPausePlayTrigger: false,
                            payload: {},
                            type: '',
                        });
                    }}
                    body={
                        <>
                            <h5 className="mb30">
                                Are you sure, you want to{' '}
                                <span className="font-semi-bold">{type === 'start' ? 'resume' : type}</span> the
                                communication ?
                            </h5>
                            <div className="form-group">
                                <RSTextarea
                                    name="playPauseComments"
                                    control={control}
                                    required
                                    placeholder={ENTER_COMMENTS}
                                    rules={{
                                        required: ENTER_COMMENTS_MSG,
                                    }}
                                    isCustomBorder
                                    maxLength={MAX_LENGTH250}
                                />
                            </div>
                            <Col sm={12} className="text-right">
                                <RSSecondaryButton
                                    className={'mr20'}
                                    onClick={() => {
                                        clearErrors();
                                        setValue('playPauseComments', '');
                                        setValue('playPauseDropdown', defaultItem);
                                        setPendingSelection(null);
                                        setPausePlayPopupConfig({
                                            isPausePlayTrigger: false,
                                            payload: {},
                                            type: '',
                                        });
                                    }}
                                >
                                    {CANCEL}
                                </RSSecondaryButton>
                                <RSPrimaryButton
                                    onClick={async () => {
                                        if (!watch('playPauseComments')) {
                                            setError('playPauseComments', {
                                                type: 'custom',
                                                message: ENTER_COMMENTS_MSG,
                                            });
                                        } else if (playPauseComments) {
                                            trigger();
                                            return;
                                        } else {
                                            const { status } = await dispatch(
                                                updatePlayPause({
                                                    payload: { ...payload, comments: watch('playPauseComments') || '' },
                                                }),
                                            );
                                            if (status) {
                                                const { defaultItem: newDefaultItem, options: newOptions } =
                                                    getPausePlayTrigger(payload?.statusId, {
                                                        isScheduled: statusId === 7,
                                                    });
                                                setPlayPauseTrigger({
                                                    defaultItem: newDefaultItem,
                                                    options: newOptions,
                                                });
                                                setValue('playPauseDropdown', newDefaultItem);
                                                setPendingSelection(null);
                                                setPausePlayPopupConfig({
                                                    isPausePlayTrigger: false,
                                                    payload: {},
                                                    type: '',
                                                });
                                                handleCommListingApi(payload?.statusId, dataItem);
                                            } else {
                                                setPlayPauseTrigger((prev) => prev);
                                                setValue('playPauseDropdown', defaultItem);
                                                setPendingSelection(null);
                                            }
                                        }
                                    }}
                                >
                                    {PROCEED}
                                </RSPrimaryButton>
                            </Col>
                        </>
                    }
                />
            )}
            {/* {(isLimitList || campaignType === 'E') && (
                <RSModal
                    show={isPausePlayTrigger}
                    text={`Are you sure, you want to ${type === 'start' ? 'resume' : type} the communication?`}
                    handleClose={() => {
                        setValue('playPauseDropdown', defaultItem);
                        setPendingSelection(null);
                        setPausePlayPopupConfig({
                            isPausePlayTrigger: false,
                            payload: {},
                            type: '',
                        });
                    }}
                    handleConfirm={async () => {
                        const { status } = await dispatch(updatePlayPause({ payload }));
                        if (status) {
                            const { defaultItem: newDefaultItem, options: newOptions } = getPausePlayTrigger(
                                payload?.statusId,
                            );
                            setPlayPauseTrigger({
                                defaultItem: newDefaultItem,
                                options: newOptions,
                            });
                            setValue('playPauseDropdown', newDefaultItem);
                            setPendingSelection(null);
                            setPausePlayPopupConfig({
                                isPausePlayTrigger: false,
                                payload: {},
                                type: '',
                            });
                            handleCommListingApi(payload?.statusId, dataItem);
                            // const payload = buildPayload({ clientId, userId, departmentId });
                            // dispatch(getCommunicationList({ payload }));
                        } else {
                            setPlayPauseTrigger((prev) => prev);
                            setValue('playPauseDropdown', defaultItem);
                            setPendingSelection(null);
                        }
                    }}
                />
            )} */}

            {showComment && (
                <RSModal
                    show={showComment}
                    size="xlg"
                    header={'Comments on request for approval/gate approval'}
                    handleClose={() => {
                        setShowComment(false);
                        setShowCommentData([]);
                        makeChangesCommentLoader.reset();
                    }}
                    className="gate-approval-popup"
                    body={
                        <KendoGrid
                            data={showCommentData}
                            isLoading={makeChangesCommentLoader.isFetching}
                            column={[
                                {
                                    field: 'ApprovalEmailSentTo',
                                    title: 'Approver',
                                    width: 200,
                                },
                                {
                                    field: 'CreatedDate',
                                    title: 'Date',
                                    cell: ({ dataItem, field }) => {
                                        // return <td>{dateFormat(dataItem?.[field], 'formatDateTime')}</td>;
                                        return <td>{getUserCurrentFormat(dataItem?.[field])?.dateFormat}</td>;
                                    },
                                },
                                {
                                    field: 'Status',
                                    title: 'Status',
                                },
                                {
                                    field: 'MakeChangesComments',
                                    title: 'Comments',
                                    width: 300,
                                },
                            ]}
                            settings={{ total: showCommentData?.length }}
                            pageable={true}
                        />
                    }
                />
            )}
            {showModalRejectsCommentsData?.show && (
                <RSModal
                    show={showModalRejectsCommentsData?.show}
                    size="xlg"
                    header={'Comments on request for approval/gate approval'}
                    handleClose={() => {
                        setShowModalRejectsCommentsData({
                            show: false,
                            rejectComments: [],
                            message: '',
                        });
                        rejectCommentLoader.reset();
                    }}
                    className="gate-approval-popup"
                    body={
                        rejectCommentLoader.isFetching ? (
                            <KendoGrid
                                data={[]}
                                isLoading
                                column={REJECT_COMMENT_GRID_COLUMNS}
                                settings={{ total: 0 }}
                                pageable={true}
                            />
                        ) : showModalRejectsCommentsData?.message ? (
                            <p className="color-primary-red text-center">{showModalRejectsCommentsData?.message}</p>
                        ) : (
                            <KendoGrid
                                data={showModalRejectsCommentsData?.rejectComments}
                                column={[
                                    {
                                        field: 'ApprovalEmailSentTo',
                                        title: 'Approval sent to',
                                        cell: ({ dataItem, field }) => {
                                            return (
                                                <td>
                                                    {dataItem?.ApprovalEmailSentTo?.length > 20 ? (
                                                        <RSTooltip text={dataItem?.ApprovalEmailSentTo}>
                                                            {truncateTitle(dataItem?.ApprovalEmailSentTo, 20)}
                                                        </RSTooltip>
                                                    ) : (
                                                        dataItem?.ApprovalEmailSentTo
                                                    )}
                                                </td>
                                            );
                                        },
                                    },
                                    {
                                        field: 'CreatedDate',
                                        title: ' Create date',
                                        cell: ({ dataItem, field }) => {
                                            return <td>{getUserCurrentFormat(dataItem?.[field]).dateTimeFormat}</td>;
                                        },
                                    },
                                    {
                                        field: 'UserReasons',
                                        title: 'Reason',
                                        width: 200,
                                        cell: ({ dataItem }) => {
                                            return (
                                                <td>
                                                    {dataItem?.UserReasons?.length > 20 ? (
                                                        <RSTooltip text={dataItem?.UserReasons}>
                                                            {truncateTitle(dataItem?.UserReasons, 20)}
                                                        </RSTooltip>
                                                    ) : (
                                                        dataItem?.UserReasons
                                                    )}
                                                </td>
                                            );
                                        },
                                    },
                                    {
                                        field: 'UserComments',
                                        title: 'Comments',
                                        cell: ({ dataItem }) => {
                                            return (
                                                <td>
                                                    {dataItem?.UserComments?.length > 20 ? (
                                                        <RSTooltip text={dataItem?.UserComments}>
                                                            {truncateTitle(dataItem?.UserComments, 20)}
                                                        </RSTooltip>
                                                    ) : (
                                                        dataItem?.UserComments
                                                    )}
                                                </td>
                                            );
                                        },
                                    },
                                ]}
                                settings={{ total: showModalRejectsCommentsData?.rejectComments?.length }}
                                pageable={true}
                            />
                        )
                    }
                />
            )}
            <RSConfirmationModal
                show={showDeleteModal}
                text={ARE_YOU_SURE_DELETE}
                primaryButtonText={OK}
                handleClose={() => setShowDeleteModal(false)}
                handleConfirm={handleDelete}
                isCloseButton={false}
            />
        </Fragment>
    );
};

export default DetailedStatus;
