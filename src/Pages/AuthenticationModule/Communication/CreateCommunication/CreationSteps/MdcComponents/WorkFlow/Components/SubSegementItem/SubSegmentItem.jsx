import { encodeUrl } from 'Utils/modules/crypto';
import { Handle, Panel, Position } from 'reactflow';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RSModal from 'Components/RSModal';
import CreateWorkFlowContext, { CreateWorkFlowOtherContext } from '../../context';
import { Row, Col } from 'react-bootstrap';
import {
    buildCanvasDataSavePayload,
    CanvasSubSegmentCollapseExpand,
    GenerateNodeId,
    GenerateNodeIdForAddon,
    GenerateNodePosition,
    GenerateNodePositionForAddon,
    getSubSegmentModule,
    stashMdcCanvasSnapshot,
} from '../../constant';
import _cloneDeep from 'lodash/cloneDeep';
import { getCount } from '../PotentialAudience/PotentialConst';

import { useDispatch, useSelector } from 'react-redux';
import DeleteSubSegment from './DeleteSubSegment';
import PrioritySetting from './PrioritySetting/PrioritySetting';
import ChannelFriendlyNameEdit from '../ChannelFriendlyNameEdit';

import useQueryParams from 'Hooks/useQueryParams';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    saveChannelFriendlyName,
    saveMdcCanvasData,
    subsegmentDisableChannels,
    subsegmentEnableChannels,
} from 'Reducers/communication/createCommunication/Mdc/Canvas/request';
import filter from 'lodash/filter';
import sum from 'lodash/sum';
import { ChannelRemove } from '../ChannelItem/ChannelConst';
import { handleCustomNavigationDetails } from 'Utils/modules/navigation';
import { markAudienceRouteSkeleton } from 'Components/Skeleton/pages/audience';

export default memo(({ data, isConnectable }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const locationState = useQueryParams('/communication') || {};

    const dropDownRef = useRef(null);
    const justOpenedRef = useRef(false);

    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const { savedChannelStatusId } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);

    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);
    const { canvasRef, lastUpdatedCanvasState, setAlign, setIsWorkflowNavigating } =
        useContext(CreateWorkFlowOtherContext);
    const activeChannel = canvasState?.Campaign?.CanvasChannel?.activeChannel;

    const { nodeState, disableNodeList = [] } = canvasState;
    let isDisabled = disableNodeList?.includes(data.currentWindowId);

    const isDisable = nodeState?.find((node) => node.id === data?.currentWindowId)?.data?.disabled || false;

    const channelClassName = `elementCircleIconCSS ${data['channelBgClassName']} ${isDisable ? 'click-off' : ''}`;

    const isMatchActiveChannel = activeChannel?.find((active) => active.subSegmentLevel === data.subSegmentLevel);
    const isExistSubSegmentSave = canvasState.subSegment.subSegmentList?.find(
        (segment) => segment.data.subSegmentLevel === data.subSegmentLevel && segment.data.isSubSegmentSave,
    );
    const isExtractionStatus = canvasState.subSegment.subSegmentList?.find(
        (segment) => segment.data.subSegmentLevel === data.subSegmentLevel && segment.data.isExtractionStatus,
    );

    const [actionList, setActionList] = useState([
        { id: 'createContent', value: 'Configure' },
        { id: 'createNode', value: 'Add' },
        { id: 'delete', value: 'Delete' },
    ]);
    const [isOpen, setIsOpen] = useState(false);
    const [priorityModal, setPriorityModal] = useState(false);
    const [SubSegmentDeleteModal, setSubSegmentDeleteModal] = useState(false);
    const [isConfigureSaving, setIsConfigureSaving] = useState(false);



    const isAvailableAdhocListType = [1, 11, 17];

    const handleAdhocListStatus = () => {
        const selectedAudienceList = canvasState?.Campaign?.PotentialRecipients?.Recipients;
        const findAhocList = selectedAudienceList?.find(
            (list) => isAvailableAdhocListType?.includes(list?.listType) && list?.segmentationListId,
        );
        if (findAhocList) {
            return true;
        } else {
            return false;
        }
    };

    const handleViewStatus = () => {
        const matchSegmentLevelActiveChannel = activeChannel?.filter(
            (active) => active?.subSegmentLevel === data?.subSegmentLevel,
        );

        const isCompletedOneChannel = !savedChannelStatusId?.length
            ? false
            : savedChannelStatusId?.some((savedChannel) => {
                  const findActiveChannel = matchSegmentLevelActiveChannel?.find(
                      (matchActive) => matchActive?.ChannelDetailID === savedChannel.channelDetailId,
                  );
                  if (findActiveChannel) {
                      // completed , onhold , alert , inprogress
                      if (
                          savedChannel.statusId === 5 ||
                          savedChannel.statusId === 9 ||
                          savedChannel.statusId === 52 ||
                          savedChannel.statusId === 12
                      ) {
                          return true;
                      }
                  } else {
                      return false;
                  }
              });

        return isCompletedOneChannel;
    };

    const handleCreateSegement = async () => {
        if (isConfigureSaving) return;

        const saveCanvasPayload = buildCanvasDataSavePayload({
            userId,
            departmentId,
            clientId,
            campaignId: locationState?.campaignId,
            canvasState,
        });

        if (!(clientId && locationState?.campaignId > 0 && canvasState)) return;

        setIsConfigureSaving(true);
        setIsWorkflowNavigating?.(true);
        try {
            const isViewStatus = handleViewStatus();

            let recipientsName =
                canvasState?.Campaign?.PotentialRecipients?.Recipients[0]?.recipientsBunchName?.split('(')[0];
            recipientsName = `${recipientsName.trim()}_ss${data.subSegmentLevel}_${new Date().getTime()}`;

            const state = {
                ...locationState,
                isMDCSubSegment: true,
                listName: recipientsName,
                listId: canvasState?.dataSource?.DataList?.join(),
                currentTargetNodeId: data.currentWindowId,
                mdcSegmentMode: !isExistSubSegmentSave ? 'create' : 'edit',
                isAutoRefresh: canvasState?.dataSource?.isAutoRefresh,
                isReceipientCount: canvasState?.ReceipientCount,
                subSegmentLevel: data?.subSegmentLevel,
                subSegmentLevelFriendlyName: data?.friendlyName,
                priority: data?.priority,
                isGroupCommunication: canvasState?.dataSource?.isGroupCommunication ?? false,
                subSegmentId: data?.subSegmentId ?? 0,
                isAdhocList: handleAdhocListStatus(),
                SubSegmentGUID: data?.subSegmentGUID,
                isViewOnly: isViewStatus,
                ...handleCustomNavigationDetails(locationState),
            };
            const encryptState = encodeUrl(state);
            markAudienceRouteSkeleton();
            stashMdcCanvasSnapshot(locationState?.campaignId, canvasState);
            navigate(`/audience/create-target-list?q=${encryptState}`, { state });
        } finally {
            setIsConfigureSaving(false);
            setIsWorkflowNavigating?.(false);
        }
    };

    const updateNodeStatePriority = (nodeState, priorityArray) => {
        return nodeState.map((node) => {
            if (node.type === 'SubSegmentItem') {
                const matchingPriorityItem = priorityArray.find((item) => item.id === node.id);


                if (matchingPriorityItem) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            priority: matchingPriorityItem.data.priority,
                        },
                    };
                }
            }
            return node;
        });
    };

    const handlePriority = (UpdatePriorityList) => {
        // debugger;
        const priorityWiseNodeState = updateNodeStatePriority(nodeState, UpdatePriorityList);
       
        const segmentLevelWiseNodeList = UpdatePriorityList?.sort(
            (segmentA, segmentB) => segmentA.data.subSegmentLevel - segmentB.data.subSegmentLevel,
        );
        const otherNodes = canvasState?.nodeState?.filter((nodeState) => nodeState.type !== 'SubSegmentItem');
        let finalNode = [...otherNodes, ...segmentLevelWiseNodeList];
        dispatchState({
            type: 'UPDATE_SUBSEGMENT',
            payload: UpdatePriorityList,
        });
        dispatchState({
            type: 'UPDATE_NODESTATE',
            payload: finalNode,
        });
        setPriorityModal(false);
    };
    const handleUpdateCanvaseRefState = () => {
        lastUpdatedCanvasState.current = canvasState;
    };

    const handleCreateNode = async () => {
        // debugger;
        const audienceCount = getCount(canvasState?.Campaign?.PotentialRecipients?.Recipients, 'recipientCount');
        let recipientCount = filter(canvasState?.Campaign?.PotentialRecipients?.Recipients, 'recipientCount').map(
            (v) => v.recipientCount,
        );
        let totalRecipientCount = sum(recipientCount);
        if (false) {
            const AddNodeId = GenerateNodeIdForAddon(canvasState, 'sub');
            let positionList = GenerateNodePositionForAddon(canvasState?.subSegment?.subSegmentList[0]);
            const newSubSegementPosition = positionList?.newChannelPosition;
            const addonElePosition = positionList?.addonElePosition;
            let SubSegmentObject = {
                id: AddNodeId[1],
                type: 'SubSegmentItem',
                targetPosition: 'left',
                sourcePosition: 'right',
                position: { x: newSubSegementPosition?.x, y: newSubSegementPosition?.y },
                data: {
                    parentWindowId: AddNodeId[0],
                    currentWindowId: AddNodeId[1],
                    audienceCount,
                    isSubSegmentSave: false,
                    subSegmentLevel: canvasState?.subSegment?.subSegmentList?.length + 1,
                    sourceHandle: 'A3',
                    friendlyName: `{SubSegment${canvasState?.subSegment?.subSegmentList?.length + 1}}`,
                    priority: canvasState?.subSegment?.subSegmentList?.length + 1,
                },
            };

            let addOnEle = _cloneDeep(canvasState?.defaultEle);
            addOnEle.id = AddNodeId[0];
            addOnEle.type = 'AddonItem';
            addOnEle.className = 'addon-item-dropped';
            addOnEle.position = addonElePosition;
            addOnEle.sourcePosition = ['top', 'bottom'];
            let addOnEletempData = {
                action: true,
                // channelBgClassName: item.bgClassName,
                parentWindowId: canvasState['dataSource']['DomId'],
                currentWindowId: AddNodeId[0],
                nodeId: AddNodeId[0],
                SelectionMode: 'All',
            };
            addOnEle.data = { ...addOnEletempData };
            await handleUpdateCanvaseRefState();

            dispatchState({
                type: 'UPDATE_SUBSEGMENT_NODE',
                payload: {
                    subSegmentData: SubSegmentObject,
                    addOnEle: addOnEle,
                    isAddOn: true,
                    positionList: positionList,
                },
            });
        } else {
            const [nodeId] = GenerateNodeId(canvasState);
            let Position = GenerateNodePosition({
                nodes: canvasState,
                currentNodeId: nodeId,
                type: 'rootSubSegmentAddon',
                optionList: '',
            })[0];
            let SubSegmentObject = {
                id: nodeId,
                type: 'SubSegmentItem',
                targetPosition: 'left',
                sourcePosition: 'right',
                position: { x: Position?.x, y: Position?.y },
                data: {
                    currentWindowId: nodeId,
                    audienceCount: totalRecipientCount,
                    isSubSegmentSave: false,
                    subSegmentLevel: canvasState?.subSegment?.subSegmentList?.length + 1,
                    sourceHandle: 'A3',
                    friendlyName: `{SubSegment${canvasState?.subSegment?.subSegmentList?.length + 1}}`,
                    priority: canvasState?.subSegment?.subSegmentList?.length + 1,
                    parentWindowId: canvasState['dataSource']['DomId'],
                },
            };
            await handleUpdateCanvaseRefState();

            dispatchState({
                type: 'UPDATE_SUBSEGMENT_NODE',
                payload: {
                    subSegmentData: SubSegmentObject,
                    addOnEle: {},
                    isAddOn: false,
                    positionList: {},
                },
            });
        }
    };

    const reorderArray = (arr, key, priorityOrder) => {
        return arr.sort((a, b) => {
            let indexA = priorityOrder.indexOf(a[key]);
            let indexB = priorityOrder.indexOf(b[key]);

            indexA = indexA === -1 ? Infinity : indexA;
            indexB = indexB === -1 ? Infinity : indexB;

            return indexA - indexB;
        });
    };

    useEffect(() => {
        // const actionEdit = { id: 'editContent', value: 'Edit subsegment audience', disabled: false };
        const setPriority = { id: 'priority', value: 'Set priority' };
        const actionDisable = { id: 'disable', value: 'Disable', disabled: false };

        let updatedActions = [...actionList];

        if (canvasState?.subSegment?.subSegmentList?.length >= 19) {
            updatedActions = updatedActions.map((action) =>
                action.id === 'createNode' ? { ...action, disabled: true } : action,
            );
        }

        if (canvasState?.dataSource?.isGroupCommunication) {
            const hasPriority = updatedActions.some((a) => a.id === 'priority');

            if (!hasPriority) {
                updatedActions.push(setPriority);
            }

            const isSingleSubSegment = canvasState?.subSegment?.subSegmentList?.length === 1;
            updatedActions = updatedActions.map((action) =>
                action.id === 'priority' ? { ...action, disabled: isSingleSubSegment } : action,
            );
        } else {
            updatedActions = updatedActions.filter((action) => action.id !== 'priority');
        }

        if (isExistSubSegmentSave) {
            updatedActions = updatedActions.map((action) =>
                action.id === 'createContent' ? { ...action, value: 'Edit/Modify' } : action,
            );

            const hasDisable = updatedActions.some((action) => action.id === 'disable' || action.id === 'enable');

            // Add Disable based on campaign type
            if (!hasDisable) updatedActions.push(actionDisable);

            // Handle enable/disable actions
            updatedActions = updatedActions.map((item) =>
                item.id === 'disable' || item.id === 'enable'
                    ? { id: isDisabled ? 'enable' : 'disable', value: isDisabled ? 'Enable' : 'Disable' }
                    : item,
            );

            if (isDisabled) {
                updatedActions = updatedActions.map((action) =>
                    action.id === 'enable' ? action : { ...action, disabled: true },
                );
                updatedActions = updatedActions?.map((action) =>
                    action.id === 'createNode'
                        ? {
                              ...action,
                              disabled: false,
                          }
                        : action,
                );
            } else {
                const excludedActionIds = [];

                updatedActions = updatedActions
                    .filter((item) => item.id !== 'enable')
                    .map((action) => {
                        if (excludedActionIds.includes(action.id)) {
                            return action;
                        }
                        return {
                            ...action,
                            disabled:
                                canvasState?.subSegment?.subSegmentList?.length === 1 && action.id === 'priority'
                                    ? true
                                    : false,
                        };
                    });
            }
        } else {
            updatedActions = updatedActions.map((action) =>
                action.id === 'createContent' ? { ...action, value: 'Configure',disabled: false } : action,
            );
        }

        // Reorder actions
        updatedActions = updatedActions.map((action) => ({
            ...action,
            ...(action.id === 'createNode' && {
                disabled: canvasState?.subSegment?.subSegmentList?.length >= 19,
            }),
        }));

        if (!canvasState?.Campaign?.PotentialRecipients?.Recipients?.length) {
            updatedActions = updatedActions?.map((action) => {
                if (action.id === 'delete') {
                    return {
                        ...action,
                        disabled: false,
                    };
                } else {
                    return {
                        ...action,
                        disabled: true,
                    };
                }
            });
        }

        const priorityOrder = ['createContent', 'createNode', 'priority', 'disable', 'delete'];
        const reorderedActionList = reorderArray(updatedActions, 'id', priorityOrder);


        setActionList(reorderedActionList);
    }, [canvasState, data?.currentWindowId, isDisabled]);

    const handleDisableChannel = async (isDisable, nodeId, canvasState) => {
        let { nodeState } = canvasState;
        let affectedNodes = CanvasSubSegmentCollapseExpand(nodeId, canvasState, data.subSegmentLevel).filter(Boolean);

        let currentDisableNodeList;

        if (!isDisable) {
            currentDisableNodeList = disableNodeList.filter((id) => ![nodeId, ...affectedNodes].includes(id));
        } else {
            affectedNodes = [...disableNodeList, nodeId, ...affectedNodes];
            currentDisableNodeList = affectedNodes;
        }

        const updatedNodes = nodeState.map((node) => ({
            ...node,
            data: {
                ...node.data,
                disabled: currentDisableNodeList.includes(node.id),
            },
        }));

        const matchActiveChannelList = getSubSegmentModule(
            canvasState['Campaign']['CanvasChannel']['activeChannel'],
            data.subSegmentLevel,
        );

        let updateAfterDeleteChannelCanvasState;

        let deleteChannelList = [];

        if (matchActiveChannelList?.length) {
            matchActiveChannelList.map((activeChannel) => {
                if (activeChannel.subSegmentLevel === data.subSegmentLevel) {
                    const { MDCTemplate, channelDeleteList } = ChannelRemove({
                        mdcCanvas: canvasState,
                        nodeId: activeChannel?.DomId,
                    });
                    updateAfterDeleteChannelCanvasState = MDCTemplate;
                    deleteChannelList.push(...channelDeleteList);
                }
            });
        }

        const finalDeleteChannelList = Array.from(new Set(deleteChannelList.map(JSON.stringify))).map(JSON.parse);

        const handleDisableOrEnableApi = async (payload, isDisable) => {
            let response;
            if (isDisable) {
                response = await dispatch(subsegmentDisableChannels({ payload }));
            } else {
                response = await dispatch(subsegmentEnableChannels({ payload }));
            }
            return response;
        };

        const payload = {
            userId,
            clientId,
            departmentId,
            campaignId: locationState?.campaignId,
            subsegmentId: data.subSegmentId,
            channels: finalDeleteChannelList,
        };

        const disableOrEnableApiStatus = await handleDisableOrEnableApi(payload, isDisable);

        if (disableOrEnableApiStatus?.status) {
            dispatchState({
                type: 'UPDATE_DISABLE_NODE_LIST',
                payload: currentDisableNodeList,
            });
            dispatchState({
                type: 'UPDATE_NODESTATE',
                payload: updatedNodes,
            });
        }
    };

    const handleSegmentDelete = (canvasJson) => {
        // debugger;
        dispatchState({
            type: 'CHANNEL_DELETE_UPDATE',
            payload: canvasJson,
        });
    };

    const resetDelete = () => {
        setSubSegmentDeleteModal(false);
    };

    const handleUpdateFriendlyName = async (name) => {
        try {
            if (name && data.subSegmentId) {
                const payload = {
                    userId,
                    departmentId,
                    clientId,
                    campaignId: locationState?.campaignId,
                    subSegmentId: data.subSegmentId,
                    friendlyName: name,
                    channelDetailId: 0,
                    channelType: '',
                };
                await dispatch(saveChannelFriendlyName({ payload, loading: false }));
            }

            const updatedSubSegmentList = canvasState?.subSegment?.subSegmentList?.map((segment) =>
                data.currentWindowId === segment.id
                    ? {
                          ...segment,
                          data: {
                              ...segment.data,
                              friendlyName: name,
                          },
                      }
                    : segment,
            );

            const updatedCanvasState = {
                ...canvasState,
                subSegment: {
                    ...canvasState.subSegment,
                    subSegmentList: updatedSubSegmentList,
                },
            };

            const saveCanvasPayload = buildCanvasDataSavePayload({
                userId,
                departmentId,
                clientId,
                campaignId: locationState?.campaignId,
                canvasState: updatedCanvasState,
            });

            lastUpdatedCanvasState.current = updatedCanvasState;
            await dispatch(saveMdcCanvasData({ saveCanvasPayload }));
            dispatchState({ type: 'CHANNEL_FRIENDLYNAME_UPDATE', payload: updatedCanvasState });
        } catch (error) {
          
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
                setIsOpen(false);
                justOpenedRef.current = false;
            }
        };

        const handleDropdownOpen = (event) => {
            const { nodeId } = event.detail || {};
            if (nodeId !== data.currentWindowId && isOpen && !justOpenedRef.current) {
                setIsOpen(false);
            }
            if (nodeId === data.currentWindowId) {
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
                        detail: { nodeId: data.currentWindowId, type: 'SubSegmentItem' }
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
    }, [isOpen, data.currentWindowId]);

    return (
        <>
            {/* edges target connect list */}
            <Handle
                type="target"
                position={Position.Left}
                style={{ bottom: 'auto', top: 33, left: -3, right: 'auto', visibility: 'hidden' }}
                onConnect={(params) => {}}
                isConnectable={isConnectable}
                id="shandle"
            />
            <div className={`elementCircleIconCSS subSegmentElement ${isConfigureSaving ? 'click-off' : ''}`}>
                <Panel className="ToolBar">
                    <div ref={dropDownRef} style={{ zIndex: '1' }}>
                        <BootstrapDropdown
                            data={actionList}
                            flatIcon
                            defaultItem={
                                <i
                                    className={` icon-rs-circle-menu-dot-medium  color-primary-grey channelActionMeduDot`}
                                />
                            }
                            showUpdate={false}
                            className="no_caret elementBottomIcon"
                            alignLeft
                            isObject={true}
                            fieldKey={`value`}
                            onSelect={(item) => {
                                if (item.id === 'createContent') {
                                    handleCreateSegement();
                                } else if (item.id === 'priority') {
                                    setPriorityModal(true);
                                } else if (item.id === 'createNode') {
                                    handleCreateNode();
                                } else if (item.id === 'enable') {
                                    handleDisableChannel(false, data.currentWindowId, canvasState);
                                } else if (item.id === 'disable') {
                                    handleDisableChannel(true, data.currentWindowId, canvasState);
                                } else if (item.id === 'editContent') {
                                    handleCreateSegement();
                                } else if (item.id === 'delete') {
                                    setSubSegmentDeleteModal(true);
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
                {/*  node panel */}

                <div className={channelClassName} style={{ position: 'relative' }}>
                    {canvasState.dataSource.isGroupCommunication && (
                        <small className="mdc-top-edge-text">{data['priority'] || 0}</small>
                    )}
                    <div
                        className={`subSegmentElementIcon ${
                            isExistSubSegmentSave
                                ? isExtractionStatus
                                    ? 'bg-primary-orange'
                                    : 'bg-secondary-green'
                                : ''
                        }`}
                    >
                        <i className="icon-rs-subsegment-medium lh0"></i>
                    </div>
                </div>
            </div>

            {/* edges source connect list  */}
            <Handle
                type="source"
                position={Position.Right}
                style={{
                    bottom: 'auto',
                    top: 34,
                    left: 'auto',
                    right: -21,
                    visibility: 'hidden',
                }}
                onConnect={(params) => {}}
                isConnectable={isConnectable}
                id="shandle"
            ></Handle>
            <Handle
                type="source"
                position={Position.Right}
                style={{
                    bottom: 'auto',
                    top: 34,
                    left: 'auto',
                    right: -21,
                    visibility: 'hidden',
                }}
                onConnect={(params) => {}}
                isConnectable={isConnectable}
                id="A1"
            ></Handle>
            <Handle
                type="source"
                position={Position.Bottom}
                style={{
                    bottom: -5,
                    top: 'auto',
                    left: 'auto',
                    right: 25,
                    visibility: 'hidden',
                }}
                onConnect={(params) => {}}
                isConnectable={isConnectable}
                id="B1"
            ></Handle>
            {/* edges source connect list */}

            <span className="mt17">
                <ChannelFriendlyNameEdit
                    friendlyName={data['friendlyName'] || ''}
                    updateFriendlyName={handleUpdateFriendlyName}
                    data={data}
                />
            </span>

            {priorityModal && (
                <RSModal
                    size="md"
                    show={priorityModal}
                    handleClose={() => setPriorityModal(false)}
                    header={' Set priority'}
                    body={
                        <Row className="text-center">
                            <Col sm={12}>
                                <PrioritySetting handlePriority={handlePriority} setPriorityModal={setPriorityModal} />
                            </Col>
                        </Row>
                    }
                />
            )}

            {SubSegmentDeleteModal && (
                <DeleteSubSegment
                    isRemove={SubSegmentDeleteModal}
                    resetDelete={resetDelete}
                    nodeId={data.currentWindowId}
                    canvasState={canvasState}
                    dispatch={dispatch}
                    subSegementUpdateCanvasState={(updateCanvaseState) => handleSegmentDelete(updateCanvaseState)}
                    segmentLevel={data.subSegmentLevel}
                />
            )}
        </>
    );
});
