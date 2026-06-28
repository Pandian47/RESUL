import { AUDIENCE_COUNT_ZERO } from 'Constants/GlobalConstant/Placeholders';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Handle, Panel, Position } from 'reactflow';
import _cloneDeep from 'lodash/cloneDeep';
import _get from 'lodash/get';
import filter from 'lodash/filter';
import sum from 'lodash/sum';

import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';

import DeleteChannel from '../ChannelItem/DeleteChannel';
import Icon from 'Components/Icon/Icon';

import CreateWorkFlowContext from '../../context';
import { GenerateNodeId, GenerateNodePosition, GetAudienceBasedOnChannel } from '../../constant';
import {
    getRecipientList,
    UpsertSubSegmentJourney,
} from 'Reducers/communication/createCommunication/Mdc/Canvas/request';
import { updateSelectedRecipientList } from 'Reducers/communication/createCommunication/Mdc/Canvas/reducer';
import { getSessionId } from 'Reducers/globalState/selector';
import ListAudienceModal from './ListAudienceModal';
import CanvasWarning from '../Modal/CanvasWarning';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import {
    AUTHORING_FIELD_LOADER_CONFIG,
    AUTHORING_SAVE_LOADER_CONFIG,
} from 'Components/Skeleton/pages/communication/authoring';
import { SourceRemove } from '../ChannelItem/ChannelConst';
export default memo(({ data, isConnectable }) => {
    const [show, setShow] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [disableSave, setDisableSave] = useState(false);
    const dropDownRef = useRef(null);
    const justOpenedRef = useRef(false);
    const [campaignId, setCampaignId] = useState(0);
    const [selectedAudienceList, setSelectedAudienceList] = useState([]);

    const [isRemove, setChannelRemove] = useState(false);
    const [isChildChannelExist, setChildChannelExist] = useState(false);
    const [isCollapse, setCollapse] = useState(false);
    const [isShowCanvasWarning, setCanvasWarning] = useState(false);
    const saveAudienceApiError = useRef('');

    const [actionList, setActionList] = useState([
        { id: 'create', value: 'Select list' },
        { id: 'delete', value: 'Delete' },
    ]);
    const { savedChannelStatusId } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);
    const { defaultEle, nodeState } = canvasState;

    const {
        Campaign: {
            CanvasChannel: { activeChannel },
        },
    } = canvasState;

    const firstLevelActiveChannel = activeChannel;

    const isCompletedOneChannel = !savedChannelStatusId?.length
        ? false
        : savedChannelStatusId?.some((savedChannel) => {
              const findActiveChannel = firstLevelActiveChannel?.find(
                  (activeChannel) => activeChannel?.ChannelDetailID === savedChannel.channelDetailId,
              );
              if (findActiveChannel) {
                  // completed  , inprogress
                  if (savedChannel.statusId === 5 || savedChannel.statusId === 9) {
                      return true;
                  }
              } else {
                  return false;
              }
          });

    const dispatch = useDispatch();
    const locationState = useQueryParams('/communication') || {};
    const recipientListLoader = useApiLoader({ autoFetch: false });
    const audienceSaveLoader = useApiLoader({ autoFetch: false });
    const [isAudienceSavePending, setIsAudienceSavePending] = useState(false);
    const isAudienceSaving = isAudienceSavePending || audienceSaveLoader.isFetching;

    const { recipientList } = useSelector(({ mdcCanvasFlowReducer }) => mdcCanvasFlowReducer);
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const Recipients = _get(canvasState, 'Campaign.PotentialRecipients.Recipients', []);

    useEffect(() => {
        const campaignId = _get(locationState, 'campaignId');
        setCampaignId(campaignId);
    }, [locationState]);
    useEffect(() => {
        if (
            canvasState?.Campaign?.PotentialRecipients?.Recipients?.length &&
            canvasState?.MdcType === 'RecursivelyTraverse_React'
        ) {
            setSelectedAudienceList(canvasState['Campaign']['PotentialRecipients']['Recipients']);
        }
    }, [Recipients, show]);
    useEffect(() => {
        if (
            canvasState['Campaign']['CanvasChannel']['activeChannel'].length ||
            canvasState['Campaign']['CanvasChannel']?.['Placeholder']?.length ||
            canvasState['subSegment']['subSegmentList']?.length
        ) {
            setChildChannelExist(true);
        } else {
            setChildChannelExist(false);
        }

        if (
            (canvasState?.MdcType === 'RecursivelyTraverse' &&
                canvasState['Campaign']['CanvasChannel']['activeChannel'].length) ||
            isCompletedOneChannel
        ) {
            let actionList = [
                { id: 'edit', value: 'Edit list' },
                { id: 'delete', value: 'Delete', disabled: true },
            ];
            setActionList(actionList);
            setDisableSave(true);
        }
    }, [canvasState]);
    useEffect(() => {
        if (
            canvasState?.['Campaign']?.['CanvasChannel']?.['activeChannel']?.length ||
            canvasState?.['Campaign']?.['CanvasChannel']?.['Placeholder']?.length
        ) {
            setChildChannelExist(true);
        } else {
            setChildChannelExist(false);
        }
    }, []);
    useEffect(() => {
        if (selectedAudienceList.length) {
            let actionList = [
                { id: 'edit', value: 'Edit list' },
                { id: 'delete', value: 'Delete' },
            ];

            if (canvasState?.['Campaign']?.['CanvasChannel']?.['activeChannel']?.length) {
                let exceed = false;
                canvasState?.['Campaign']?.['CanvasChannel']?.['activeChannel'].forEach((item) => {
                    if (new Date() >= new Date(item.ScheduleDate)) {
                        exceed = true;
                    }
                });

                if (exceed || isCompletedOneChannel) {
                    actionList = actionList.map((item) => {
                        return (item = item.id === 'delete' ? { ...item, disabled: true } : item);
                    });
                }
            }
            setActionList(actionList);
        }
    }, [selectedAudienceList]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
                setIsOpen(false);
                justOpenedRef.current = false;
            }
        };

        const handleDropdownOpen = (event) => {
            const { nodeId } = event.detail || {};
            if (nodeId !== nodeId && isOpen && !justOpenedRef.current) {
                setIsOpen(false);
            }
            if (nodeId === data.nodeId) {
                justOpenedRef.current = false;
            }
        };

        if (isOpen) {
            const timeoutId = setTimeout(() => {
                document.addEventListener('click', handleClickOutside, true);
            }, 0);
            
            const frameId = requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const event = new CustomEvent('mdc-dropdown-open', {
                        detail: { nodeId: data.nodeId, type: 'SourceItem' }
                    });
                    document.dispatchEvent(event);
                });
            });
            
            return () => {
                clearTimeout(timeoutId);
                cancelAnimationFrame(frameId);
                document.removeEventListener('click', handleClickOutside, true);
            };
        }
        
        document.addEventListener('mdc-dropdown-open', handleDropdownOpen);
        
        return () => {
            document.removeEventListener('mdc-dropdown-open', handleDropdownOpen);
        };
    }, [isOpen, data.nodeId]);
    const handleActionForwardOnclick = async () => {
        setShow(true);

        const resolvedCampaignId = _get(locationState, 'campaignId', campaignId) || 0;
        let payload = {
            departmentId,
            clientId,
            userId,
            searchText: '',
            segmentIds: [],
            campaignId: resolvedCampaignId,
            channelType: '',
            listType: '',
        };
        if (canvasState?.MdcType === 'RecursivelyTraverse') {
            const dataList = canvasState?.dataSource?.DataList;
            payload = { ...payload, segmentIds: dataList };
        }
        if (!recipientList?.length) {
            const response = await recipientListLoader.refetch({
                fetcher: ({ payload: requestPayload }) =>
                    dispatch(getRecipientList({ payload: requestPayload, loading: false })),
                mode: 'create',
                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                params: { payload },
            });

            if (response?.status && canvasState?.MdcType === 'RecursivelyTraverse') {
                const dataList = canvasState?.dataSource?.DataList?.map((item) => parseInt(item, 10));
                const list = response?.data?.filter((segList) =>
                    dataList?.includes(parseInt(segList?.segmentationListId, 10)),
                );
                setSelectedAudienceList(list);
            }
        }
    };
    const handleClose = () => {
        if (isAudienceSaving) return;
        recipientListLoader.reset();
        audienceSaveLoader.reset();
        setShow(false);
    };

    const handlePostionNodeId = () => {
        let position = GenerateNodePosition({
            nodes: canvasState,
            currentNodeId: data.nodeId,
            type: 'srcItem',
            optionList: '',
        })[0];
        const [nodeId] = GenerateNodeId(canvasState);

        return {
            nodeId: nodeId,
            position: position,
        };
    };

    const handleSubSegmentPlaceholderObject = (formState) => {
        const { audienceList } = formState;
        const { position, nodeId } = handlePostionNodeId();
        const { x, y } = position;

        let recipientCount = filter(audienceList, 'recipientCount').map((v) => v.recipientCount);
        let totalRecipientCount = sum(recipientCount);

        let subSegmentObj = {
            id: nodeId,
            type: 'SubSegmentItem',
            targetPosition: 'left',
            sourcePosition: 'right',
            position: { x: x + 80, y },
            data: {
                parentWindowId: data.nodeId,
                currentWindowId: nodeId,
                audienceCount: totalRecipientCount,
                subSegmentLevel: 1,
                isSubSegmentSave: false,
                friendlyName: '{SubSegment1}',
                priority: 1,
            },
        };

        return subSegmentObj;
    };

    const handleCommonPlaceholder = (formstate, isCGTGEnabled = false) => {
        const { audienceList, isAutoRefresh, isGroupedCampaign, groupCommunicationCGID, isJourney } = formstate;
        const { position, nodeId } = handlePostionNodeId();
        const { x, y } = position;

        let placeholderObj = _cloneDeep(defaultEle);
        placeholderObj = {
            ...placeholderObj,
            id: nodeId,
            type: 'Placeholder',
            targetPosition: 'left',
            sourcePosition: 'right',
        };
        placeholderObj = { ...placeholderObj, position: { x, y } };
        placeholderObj = {
            ...placeholderObj,
            data: { ...placeholderObj['data'], parentWindowId: data.nodeId, currentWindowId: nodeId },
        };
        placeholderObj = {
            ...placeholderObj,
            data: {
                ...placeholderObj['data'],
                selectedAudienceList: audienceList,
                isAutoRefresh,
                isGroupCommunication: isGroupedCampaign,
                GroupedCampaignId: groupCommunicationCGID,
                isSubsegmentJoureny: isJourney,
                isCGTGEnabled: isCGTGEnabled ?? false,
            },
        };

        return placeholderObj;
    };

    const handleJourney = async (formState, groupCommunicationCGID, isCGTGEnabled = false) => {
        let subSegmentObj = handleSubSegmentPlaceholderObject(formState);
        let placeholderObj = handleCommonPlaceholder(formState, isCGTGEnabled);
        const { audienceList, isAutoRefresh, isJourney, isGroupedCampaign } = formState;
        const isSubsegmentJoureny = _get(canvasState, 'dataSource.isSubsegmentJoureny', false);
        const {
            Campaign,
            subSegment: { subSegmentList },
            nodeState,
            dataSource,
            defaultEle,
        } = canvasState;

        const otherPayload = {
            ...placeholderObj['data'],
            selectedAudienceList: audienceList,
            isAutoRefresh,
            isGroupCommunication: isGroupedCampaign,
            GroupedCampaignId: groupCommunicationCGID,
            isSubsegmentJoureny: isJourney,
        };

        const SourceItem = nodeState.find((x) => x.type === 'SourceItem');
        const { MDCTemplate } = SourceRemove({ mdcCanvas: canvasState });
        if (subSegmentList?.length > 0 && !isJourney && !isSubsegmentJoureny) {
                    dispatchState({
                        type: 'UPDATE_SUBSEGMENT_CHANGE',
                        payload: {
                            selectedAudienceList: audienceList,
                            MDCTemplate: MDCTemplate,
                            dataSource: dataSource,
                            SourceItem: SourceItem,
                            placeholderObj: placeholderObj,
                            isCGTGEnabled: isCGTGEnabled,
                            data: {
                                ...otherPayload,
                            },
                        },
                    });
        } else {
            const response = await handleSubSegmentSaveApi(formState);

            if (response?.status) {
                dispatchState({
                    type: 'UPDATE_SUBSEGMENT_CHANGE',
                    payload: {
                        selectedAudienceList: audienceList,
                        MDCTemplate: MDCTemplate,
                        dataSource: dataSource,
                        SourceItem: SourceItem,
                        subSegmentObj: subSegmentObj,
                        isCGTGEnabled: isCGTGEnabled,
                        data: {
                            ...otherPayload,
                        },
                    },
                });
                saveAudienceApiError.current = '';
            } else {
                saveAudienceApiError.current = response.message || 'Exception has occured';
            }
        }
    };

    const handleSubSegmentSaveApi = async (formState) => {
        const { isJourney, isGroupedCampaign } = formState;
        const payload = {
            campaignId: _get(locationState, 'campaignId', 0),
            isSubsegmentJoureny: isJourney,
            isGroupCommunication: isGroupedCampaign,
            groupCommunicationId: isGroupedCampaign ? `CGID:${_get(locationState, 'campaignId', 0)}` : '',
            departmentId,
            clientId,
            userId,
        };

        return audienceSaveLoader.refetch({
            fetcher: ({ payload: requestPayload }) =>
                dispatch(UpsertSubSegmentJourney({ payload: requestPayload, loading: false })),
            mode: 'create',
            loaderConfig: AUTHORING_SAVE_LOADER_CONFIG,
            params: { payload },
        });
    };

    const handleSaveAudienceList = async (formState, isDeleteSubSegment = false, isCGTGEnabled = false) => {
        setIsAudienceSavePending(true);
        saveAudienceApiError.current = '';

        try {
            const { audienceList, isAutoRefresh, isJourney, isGroupedCampaign } = formState;

            const activeChannel = _get(canvasState, 'Campaign.CanvasChannel.activeChannel', []);
            const placeholder = _get(canvasState, 'Campaign.CanvasChannel.Placeholder', []);
            const subSegmentList = _get(canvasState, 'subSegment.subSegmentList', []);
            const groupCommunicationCGID = `CGID:${_get(locationState, 'campaignId', 0)}`;

            const placeholderObj = handleCommonPlaceholder(formState, isCGTGEnabled);
            const subSegmentObj = handleSubSegmentPlaceholderObject(formState);

            const isSubSegmentJourney = canvasState?.dataSource?.isSubsegmentJoureny;
            const isRecipientType = canvasState?.dataSource?.Type === 'Recipient';

            if (isJourney) {
                if (
                    (!isSubSegmentJourney || isSubSegmentJourney) &&
                    !placeholder.length &&
                    !activeChannel?.length &&
                    !subSegmentList.length
                ) {
                    const response = await handleSubSegmentSaveApi(formState);
                    if (response?.status) {
                        dispatchState({
                            type: 'AUDIENCE_LIST_SAVE_SUBSEGMENT_FLOW',
                            payload: {
                                data: {
                                    selectedAudienceList: audienceList,
                                    isAutoRefresh,
                                    isSubsegmentJoureny: isJourney,
                                    isGroupCommunication: isGroupedCampaign,
                                    isGroupCommunicationId: groupCommunicationCGID,
                                    isCGTGEnabled: isCGTGEnabled,
                                },
                                subSegmentObj,
                            },
                        });
                    } else {
                        saveAudienceApiError.current = response?.message || 'Exception has occured';
                    }
                } else if (isSubSegmentJourney) {
                    if (subSegmentList?.length) {
                        const response = await handleSubSegmentSaveApi(formState);
                        if (response?.status) {
                            dispatchState({
                                type: 'AUDIENCE_LIST_UPDATE_SUBSEGMENT_FLOW',
                                payload: {
                                    data: {
                                        selectedAudienceList: audienceList,
                                        isAutoRefresh,
                                        isSubsegmentJoureny: isJourney,
                                        isGroupCommunication: isGroupedCampaign,
                                        isGroupCommunicationId: groupCommunicationCGID,
                                        isCGTGEnabled: isCGTGEnabled,
                                    },
                                },
                            });
                        } else {
                            saveAudienceApiError.current = response?.message || 'Exception has occured';
                        }
                    } else {
                        await handleJourney(formState, groupCommunicationCGID, isCGTGEnabled);
                    }
                } else if (placeholder.length || activeChannel.length) {
                    await handleJourney(formState, groupCommunicationCGID, isCGTGEnabled);
                }
            } else {
                if (!activeChannel.length) {
                    if (isRecipientType && !placeholder.length && !subSegmentList.length) {
                        dispatchState({ type: 'AUDIENCE_LIST_SAVE', payload: placeholderObj });
                    } else if (isSubSegmentJourney && subSegmentList.length) {
                        await handleJourney(formState, groupCommunicationCGID, isCGTGEnabled);
                    } else {
                        validateAndUpdateAudienceList(audienceList, isAutoRefresh, activeChannel, isCGTGEnabled);
                    }
                } else if (isSubSegmentJourney && subSegmentList.length) {
                    await handleJourney(formState, groupCommunicationCGID, isCGTGEnabled);
                } else {
                    validateAndUpdateAudienceList(audienceList, isAutoRefresh, activeChannel, isCGTGEnabled);
                }
            }

            dispatch(updateSelectedRecipientList(audienceList));
            setSelectedAudienceList(audienceList);

            if (!saveAudienceApiError.current) {
                setShow(false);
            }
        } finally {
            setIsAudienceSavePending(false);
        }
    };

    const validateAndUpdateAudienceList = (audienceList, isAutoRefresh, activeChannel) => {
        let valid = activeChannel.every((item) => GetAudienceBasedOnChannel(item.ChannelId, audienceList));

        if (!valid) {
            setCanvasWarning(true);
            return;
        }

        dispatchState({
            type: 'AUDIENCE_LIST_UPDATE',
            payload: { selectedAudienceList: audienceList, isAutoRefresh },
        });
    };

    const handleChannelDeleteUpdate = (canvasJson) => {
        dispatchState({
            type: 'CHANNEL_DELETE_UPDATE',
            payload: canvasJson,
        });
    };
    const resetDelete = () => {
        setChannelRemove(false);
    };
    const RenderSourceAction = ({ list: { item } }) => {
        return <div>{item.value}</div>;
    };

    const audiencePayload = {
        campaignId: _get(locationState, 'campaignId', campaignId) || 0,
        userId,
        departmentId,
        clientId,
    };

    return (
        <>
            <Handle
                type="source"
                position={Position.Right}
                style={{ bottom: 'auto', top: 34, left: 'auto', right: -21, visibility: 'hidden' }}
                onConnect={(params) => {}}
                isConnectable={isConnectable}
            ></Handle>
            <div className="elementCircleCSS source-item-dropped">
                {isRemove && (
                    <DeleteChannel
                        isRemove={isRemove}
                        resetDelete={resetDelete}
                        nodeId={data.nodeId}
                        mdcCanvas={canvasState}
                        dispatch={dispatch}
                        basePayload={{ userId, clientId, departmentId, campaignId }}
                        channelDeleteUpdate={(canvasJson) => handleChannelDeleteUpdate(canvasJson)}
                        type={'root'}
                    />
                )}
                {/* <KendoIconDropdown
                    className={'elementBottomIcon '}
                    icon={` icon-rs-circle-menu-dot-medium icon-md color-primary-grey`}
                    data={actionList}
                    isCustomRender
                    itemRender={(props) => <RenderSourceAction list={props} />}
                    popupClass={'mdc-channel-action-tools'}
                    onItemClick={({ item }) => {
                        if (item.id === 'create' || item.id === 'edit') {
                            handleActionForwardOnclick();
                        }
                        if (item.id === 'delete') {
                            setChannelRemove(true);
                        }
                    }}
                /> */}
                {/* <BootstrapDropdown
                    data={actionList}
                    flatIcon
                    defaultItem={<i className={`icon-rs-circle-menu-dot-medium icon-md color-primary-grey`} />}
                    showUpdate={false}
                    className="no_caret elementBottomIcon mdc-channel-action-tools"
                    alignLeft
                    isObject={true}
                    fieldKey={`value`}
                    onSelect={(item) => {
                        if (item.id === 'create' || item.id === 'edit') {
                            handleActionForwardOnclick();
                        }
                        if (item.id === 'delete') {
                            setChannelRemove(true);
                        }
                    }}
                /> */}
                <Panel className="ToolBar" position="bottom-right">
                    <div ref={dropDownRef} style={{ zIndex: '1' }}>
                        <BootstrapDropdown
                            data={actionList}
                            flatIcon
                            defaultItem={<i className={`icon-rs-circle-menu-dot-medium icon-md color-primary-grey`} />}
                            showUpdate={false}
                            className="no_caret elementBottomIcon  mdc-channel-action-tools"
                            alignLeft
                            isObject={true}
                            fieldKey={`value`}
                            onSelect={(item) => {
                                if (item.id === 'create' || item.id === 'edit') {
                                    handleActionForwardOnclick();
                                }
                                if (item.id === 'delete') {
                                    setChannelRemove(true);
                                }
                            }}
                            isCustomToggle={true}
                            show={isOpen}
                            handleClick={(e) => {
                                e?.stopPropagation?.();
                                const newIsOpen = !isOpen;
                                setIsOpen(newIsOpen);
                                if (newIsOpen) {
                                    justOpenedRef.current = true;
                                } else {
                                    justOpenedRef.current = false;
                                }
                            }}
                        />
                    </div>
                </Panel>
                {isChildChannelExist && (
                    <Icon
                        mainClass={'elementMiddleIcon'}
                        icon={!isCollapse ? 'icon-rs-square-minus-medium' : 'icon-rs-square-plus-medium'}
                        color={'color-secondary-grey'}
                        size="md"
                        callBack={(event) => {
                            setCollapse((prev) => {
                                const next = !prev;
                                data.ToggleCollapse(next, data.nodeId);
                                return next;
                            });
                        }}
                    />
                )}
                <div className="elementCircleIconCSS bg-list-audience">
                    <i className="icon-rs-user-segments-xlarge icon-xl"></i>
                </div>
            </div>
            <p className="card-text font-xxs text-center" title="Segment(s)">
                Segment(s)
            </p>
            {show && (
                <ListAudienceModal
                    show={show}
                    handleClose={handleClose}
                    selectedAudienceList={selectedAudienceList}
                    recipientList={recipientList}
                    handleSaveAudienceList={handleSaveAudienceList}
                    setSelectedAudienceList={setSelectedAudienceList}
                    disableSave={disableSave}
                    audiencePayload={audiencePayload}
                    isAutoRefresh={canvasState?.dataSource?.isAutoRefresh}
                    saveAudienceApiError={saveAudienceApiError}
                    isAudienceLoading={recipientListLoader.isLoading}
                    isAudienceSaving={isAudienceSaving}
                />
            )}
            {isShowCanvasWarning && (
                <CanvasWarning
                    show={isShowCanvasWarning}
                    warnText={AUDIENCE_COUNT_ZERO}
                    handleClose={() => {
                        setCanvasWarning(false);
                    }}
                    isPotentialAudeinceCount={{
                        isShowCountStatus: false,
                        details: {},
                    }}
                />
            )}
        </>
    );
});
