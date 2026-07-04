import { getmasterData } from 'Utils/modules/masterData';
import { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Handle, Panel, Position } from 'reactflow';
import DeleteChannel from '../ChannelItem/DeleteChannel';

import Icon from 'Components/Icon/Icon';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';

import { cloneDeep as _cloneDeep, get as _get } from 'Utils/modules/lodashReplacements';

import CreateWorkFlowContext from '../../context';
import { GenerateNodeId, GenerateNodePosition } from '../../constant';
import { getDynamicList, SaveTriggerCanvasData } from 'Reducers/communication/createCommunication/Mdc/Canvas/request';
import { getSessionId } from 'Reducers/globalState/selector';
import DynamicAudienceModal from './DynamicAudienceModal';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import { buildSaveTriggerCavasDataPayload, buildSelectedListByFrequency } from './constant';

const DynamicItem = ({ data, isConnectable }) => {
    const [show, setShow] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [disableSave, setDisableSave] = useState(false);
    const dropDownRef = useRef(null);
    const justOpenedRef = useRef(false);
    const [campaignId, setCampaignId] = useState(0);

    const [isRemove, setChannelRemove] = useState(false);
    const [isChildChannelExist, setChildChannelExist] = useState(false);
    const [isCollapse, setCollapse] = useState(false);
    const [selectedDynamicList, setSelectedDynamicList] = useState({});
    const [actionList, setActionList] = useState([
        { id: 'create', value: 'Select list' },
        { id: 'delete', value: 'Delete' },
    ]);
    const { timeZoneList } = getmasterData();
    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);
    const { defaultEle, nodeState } = canvasState;
    
    const dispatch = useDispatch();
    const dynamicListLoader = useApiLoader({ autoFetch: false });
    const dynamicSaveLoader = useApiLoader({ autoFetch: false });
    const locationState = useQueryParams('/communication') || {};
    //const { state: locationState } = useLocation();
    const { dynamicList } = useSelector(({ mdcCanvasFlowReducer }) => mdcCanvasFlowReducer);
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const { savedChannelStatusId } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);

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
                  // completed , inprogress
                  if (savedChannel.statusId === 5 || savedChannel.statusId === 9) {
                      return true;
                  }
              } else {
                  return false;
              }
          });

    useEffect(() => {
        const campaignId = _get(locationState, 'campaignId');
        setCampaignId(campaignId);
    }, [locationState]);

    useEffect(() => {
        if (
            canvasState['Campaign']['CanvasChannel']['activeChannel']?.length ||
            canvasState['Campaign']['CanvasChannel']?.['Placeholder']?.length
        ) {
            setChildChannelExist(true);
        }
    }, [canvasState]);
    useEffect(() => {
        if (canvasState?.dataSource?.dynamicData?.dynamicList && canvasState?.MdcType === 'RecursivelyTraverse_React') {
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

                if (exceed) {
                    actionList = actionList.map((item) => {
                        return (item = item.id === 'delete' ? { ...item, disabled: true } : item);
                    });
                }
            }
            setActionList(actionList);
            setSelectedDynamicList(canvasState.dataSource.dynamicData);
        }

        if (canvasState?.dataSource?.DataList && canvasState?.MdcType === 'RecursivelyTraverse') {
            const selectedDynamicList = dynamicList?.find(
                (list) => parseInt(list?.dynamicListId, 10) === parseInt(canvasState?.dataSource?.DataList, 10),
            );
            setSelectedDynamicList(selectedDynamicList || {});
        }
        if (
            (canvasState?.MdcType === 'RecursivelyTraverse' &&
                canvasState['Campaign']['CanvasChannel']['activeChannel']?.length) ||
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
        const handleClickOutside = (event) => {
            if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
                setIsOpen(false);
                justOpenedRef.current = false;
            }
        };

        const handleDropdownOpen = (event) => {
            const { nodeId } = event.detail || {};
            if (nodeId !== data.nodeId && isOpen && !justOpenedRef.current) {
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
                        detail: { nodeId: data.nodeId, type: 'DynamicItem' }
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

    const handleActionForwardOnclick = () => {
        setShow(true);
    };

    useEffect(() => {
        if (!show) return;

        const fetchDynamicList = async () => {
            const payload = {
                campaignId,
                clientId,
                departmentId,
                userId,
                filterText: '',
                ...(canvasState?.MdcType === 'RecursivelyTraverse'
                    ? { dynamicListId: canvasState?.dataSource?.DataList }
                    : {}),
            };

            const result = await dynamicListLoader.refetch({
                fetcher: () => dispatch(getDynamicList({ payload, loading: false })),
            });

            const { status, data } = result || {};

            if (status && canvasState?.MdcType === 'RecursivelyTraverse') {
                const DataList = parseInt(canvasState?.dataSource?.DataList, 10);
                const tzoneId = parseInt(canvasState?.dataSource?.timeZone, 10);
                const freqId = parseInt(canvasState?.dataSource?.freqDetails?.id, 10);
                const list = data?.filter((dyList) => parseInt(dyList?.dynamicListId, 10) === DataList);
                const timezone = timeZoneList?.filter(
                    (tzone) => parseInt(tzone?.timeZoneID, 10) === tzoneId,
                );
                const selList = buildSelectedListByFrequency(canvasState, freqId, list, timezone);
                setSelectedDynamicList(selList);
            }
        };

        fetchDynamicList();
    }, [show]);
    const handleClose = () => {
        setShow(false);
    };
    const handleSaveDynamicAudienceList = async ({ dynamicData }) => {
        const activeChannel = _get(canvasState, 'Campaign.CanvasChannel.activeChannel', []);

        const commonPayload = {
            campaignId,
            clientId,
            departmentId,
            userId,
        };
        const triggerData = { ...commonPayload, ...dynamicData };
        const payload = buildSaveTriggerCavasDataPayload(triggerData);

        await dynamicSaveLoader.refetch({
            fetcher: () => dispatch(SaveTriggerCanvasData({ payload, loading: false })),
        });

        if (!activeChannel?.length) {
            const Position = GenerateNodePosition({
                nodes: canvasState,
                currentNodeId: data.nodeId,
                type: 'srcItem',
                optionList: '',
            })[0];
            const { x, y } = Position;
            const [nodeId] = GenerateNodeId(canvasState);
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
                data: { ...placeholderObj['data'], dynamicData: dynamicData },
            };

            if (
                canvasState?.dataSource?.Type === 'DynamicList' &&
                canvasState?.Campaign?.CanvasChannel?.Placeholder?.length
            ) {
                dispatchState({
                    type: 'DYNAMIC_LIST_UPDATE',
                    payload: { dynamicData: dynamicData },
                });
            } else {
                dispatchState({
                    type: 'DYNAMIC_LIST_SAVE',
                    payload: placeholderObj,
                });
            }
        } else {
            dispatchState({
                type: 'DYNAMIC_LIST_UPDATE',
                payload: { dynamicData: dynamicData },
            });
        }

        setShow(false);
    };

    const toggleRemoveIcon = (event) => {
                setChannelRemove(!isRemove);
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
    return (
        <>
            {' '}
            <Handle
                type="source"
                position={Position.Right}
                style={{ bottom: 'auto', top: 33, left: 'auto', right: -21, visibility: 'hidden' }}
                onConnect={(params) => {}}
                isConnectable={isConnectable}
            >
                {/* <i className="icon-rs-circle-minus-medium icon-md color-grey-dark" onClick={ToggleCollapse(data)}></i> */}
            </Handle>
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

                <Panel className="ToolBar">
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
                <div className="elementCircleIconCSS bg-dynamic-audience">
                    <i className="icon-rs-user-dynamic-list-xlarge icon-xl"></i>
                </div>
            </div>
            <p className="card-text font-xxs text-center" title="Individual(s)">
                Individual(s)
            </p>
            {show && (
                <DynamicAudienceModal
                    show={show}
                    handleClose={handleClose}
                    dynamicList={dynamicList || []}
                    handleSaveDynamicAudienceList={handleSaveDynamicAudienceList}
                    selectedDynamicList={selectedDynamicList}
                    disableSave={disableSave}
                    isDynamicListLoading={dynamicListLoader.isFetching}
                    isSaveLoading={dynamicSaveLoader.isLoading}
                />
            )}
        </>
    );
};

export default DynamicItem;
