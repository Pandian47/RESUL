import { alert_medium, circle_arrow_right_medium, settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { getDateWithDayfullFormat } from 'Utils/modules/dateTime';
import { encodeUrl } from 'Utils/modules/crypto';
import { truncateTitle } from 'Utils/modules/displayCore';
import { MAX_CONNECTIONS_EXCEEDS, OK, WARNING } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, memo, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Handle, Position, useNodes, Panel } from 'reactflow';
import { useSelector, useDispatch } from 'react-redux';

import { Row, Col } from 'react-bootstrap';
import RSModal from 'Components/RSModal';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import { RSPrimaryButton } from 'Components/Buttons';
import DeleteChannel from '../ChannelItem/DeleteChannel';
//import GoalContentPopup from '../ChannelItem/ChannelContentPopup';

import { get as _get } from 'Utils/modules/lodashReplacements';

import { getSessionId } from 'Reducers/globalState/selector';
import { getMdcChannelResponseData } from 'Reducers/communication/createCommunication/Mdc/Canvas/request';
import { setMdcContentPopupStatus } from 'Reducers/communication/createCommunication/Mdc/Canvas/reducer';

import Icon from 'Components/Icon/Icon';
import CreateWorkFlowContext from '../../context';
import { getMdcGlyph, getModule, GetChannelStyleAttributes, GetChannelContentSetupDetails } from '../../constant';
import { findChannelDepth, GetChannelChild } from '../ChannelItem/ChannelConst';
import useQueryParams from 'Hooks/useQueryParams';
import LandingPageAction from '../LandingPageAction';
export default memo(({ data, isConnectable }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const nodesList = useNodes();
    const dropDownRef = useRef(null);
    const justOpenedRef = useRef(false);
    const locationState = useQueryParams('/communication');
    const [show, setShow] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [actionIcon, setActionIcon] = useState({ icon: alert_medium, color: 'red_medium' });
    // const [contentThumbnail, setContentThumbnail] = useState('');
    // const [contentScheduleDate, setContentScheduleDate] = useState('');
    const [contentSettingJson, setContentSettingJson] = useState({});
    const [isFollowupChannelEnable, setFollowupChannelEnablement] = useState(false);
    const [isRemove, setChannelRemove] = useState(false);
    const [isRootExceed, setRootExceed] = useState(false);

    const [popupMode, setPopupMode] = useState('create');
    const [isCollapse, setCollapse] = useState(false);
    const [isChildChannelExist, setChildChannelExist] = useState(false);
    const [isContentSetupComplet, setContentSetupComplete] = useState(false);
    const [actionList, setActionList] = useState([
        { id: 'create', value: 'Create content', disabled: false },
        // { id: 'preview', value: 'Preview', disabled: true },
        { id: 'action', value: 'Actions', disabled: true },
        { id: 'delete', value: 'Delete', disabled: false },
    ]);

    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);
    const { nodeState, edgeState } = canvasState;

    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const {
        isContentPopupActive,
        mdcFlowConfig: { maxChannelConnection, withGoalOne, withGoalTwo, withoutGoal },
    } = useSelector(({ mdcCanvasFlowReducer }) => mdcCanvasFlowReducer ?? {});
    
    const contentMode = _get(locationState, 'mode', 'create');
    const campaignId = _get(locationState, 'campaignId');
    const channelDetailId = _get(locationState, 'channelResponseDetailId', 0);
    const channelType = _get(locationState, 'mdcContentSetupDetails.channelDetailType', '');
    const contentSetupDomId = _get(locationState, 'mdcContentSetupDetails.domId', '');
    const levelNumber = _get(locationState, 'mdcContentSetupDetails.levelNumber', 1);

    let depth = findChannelDepth(canvasState, data.currentWindowId);
    const authoringUrl = `/communication/configure-analytics`;
    useEffect(() => {
        if (!isContentPopupActive && channelDetailId && data.currentWindowId === contentSetupDomId) {
            let payload = {
                campaignId,
                departmentId,
                clientId,
                userId,
                channelDetailId: parseInt(channelDetailId, 10),
                channelType,
                levelNumber,
            };
            dispatch(getMdcChannelResponseData({ payload })).then((result) => {
                                const { status, message, data: channelResponseData } = result;
                if (status) {
                                        let ContentThumbnailPath = _get(channelResponseData[0], 'contentThumbnail', '');
                    let ScheduleDate = _get(channelResponseData[0], 'localBlastDateTime', '');
                    let ChannelId = _get(channelResponseData[0], 'channelId', 0);
                    let DomId = _get(channelResponseData[0], 'domId', 0);
                    // let ChannelDetailID = _get(channelResponseData[0], 'channelDetailId', 0);

                    // scheduleDate = getDateWithDayfullFormat(scheduleDate);
                    // setContentThumbnail(contentThumbnail);
                    // setContentScheduleDate(scheduleDate);
                    const tmpContentJson = {
                        ChannelId,
                        ContentThumbnailPath,
                        DomId,
                        ScheduleDate,
                        ChannelDetailID: channelDetailId,
                    };
                    setContentSettingJson(tmpContentJson);
                    setPopupMode('edit');
                    let rslt = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], data.nodeId);
                    const isActionExist = _get(rslt, 'value.Action.Template', false);
                    setFollowupChannelEnablement(!isActionExist);
                    dispatchState({
                        type: 'UPDATE_CHANNEL_RESPONSE_DATA',
                        payload: { channelResponseData, locationState },
                    });
                    dispatch(setMdcContentPopupStatus(true));
                }
            });
            handleSaveChannelContent()
            setShow(true);
        }
    }, [locationState]);

    useEffect(() => {
        if (canvasState?.Campaign?.CanvasChannel?.activeChannel?.length) {
            let contentDetails = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], data.nodeId);
            if (contentDetails) {
                let {
                    value: { ChannelDetailID },
                } = contentDetails;
            }
        }
    }, [canvasState['Campaign']['CanvasChannel']['activeChannel']]);
    useEffect(() => {
        let rslt = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], data.nodeId);
        if (rslt?.value?.ChannelDetailID > 0) {
            //setContentSetupComplete(true);

            let editActionList = actionList.map((item) =>
                item.id === 'create'
                    ? { id: 'edit', value: 'Edit content', disabled: false }
                    : { ...item, disabled: false },
            );
            [editActionList[0], editActionList[1]] = [editActionList[1], editActionList[0]];
            setActionList(editActionList);
        }
    }, []);
    useEffect(() => {
        let rslt = GetChannelChild(data.nodeId, canvasState);
        setChildChannelExist(rslt);
    }, [canvasState]);

    useEffect(() => {
        if (canvasState?.CampaignGoal !== 'Conversion') {
            setActionList((prevState) => {
                return prevState.filter((item) => item.id !== 'action');
            });
        }
    }, [canvasState?.CampaignGoal]);

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
                        detail: { nodeId: data.nodeId, type: 'GoalItem' }
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
    const handleActionForwardOnclick = (event) => {
        //console.log("parentNodeList",getParentNodes(data.nodeId,nodeState,edgeState))
        let rslt = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], data.nodeId);
        const { ContentThumbnailPath, ScheduleDate } = rslt['value'];
        const scheduleDate = getDateWithDayfullFormat(ScheduleDate);
        // setContentThumbnail(ContentThumbnailPath);
        // setContentScheduleDate(scheduleDate);
        setContentSettingJson(rslt['value']);
        setPopupMode('edit');
                const isActionExist = _get(rslt, 'value.Action.Template', false);
                setFollowupChannelEnablement(!isActionExist);

        setShow(true);
    };
    const handleClose = () => {
        setShow(false);
        // setContentThumbnail(null);
        // setContentScheduleDate(null);
    };
    const handleCreateChannelContent = () => {
        dispatch(setMdcContentPopupStatus(false));
                setShow(false);
        let contentSetupDetails = GetChannelContentSetupDetails(data.channelId, data.nodeId, canvasState);
                // navigate('/communication/configure-analytics', {
        //     state: { ...locationState, mdcContentSetupDetails: contentSetupDetails },
        // });
        const state = { ...locationState, mdcContentSetupDetails: contentSetupDetails , mode: 'create' };
        const encryptState = encodeUrl(state);
        navigate(`${authoringUrl}?q=${encryptState}`, {
            state,
        });
    };

    const handleChannelEditRedirect = () => {
        dispatch(setMdcContentPopupStatus(false));
        setShow(false);
        let contentSetupDetails = GetChannelContentSetupDetails(data.channelId, data.nodeId, canvasState);
        const state = { ...locationState, mdcContentSetupDetails: contentSetupDetails, mode: 'edit' };
        const encryptState = encodeUrl(state);
        navigate(`${authoringUrl}?q=${encryptState}`, {
            state,
        });
    };
    const handleSaveChannelContent = () => {
        locationState.mode = 'create';
        setShow(false);
        // setContentThumbnail(null);
        // setContentScheduleDate(null);
        let getLevelNumber = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], data.nodeId);
                const {
            value: { LevelNumber },
        } = getLevelNumber;
        if (channelDetailId > 1) {
            let editActionList = actionList.map((item) =>
                item.id === 'create'
                    ? { id: 'edit', value: 'Edit content ', disabled: false }
                    : { ...item, disabled: false },
            );
            [editActionList[0], editActionList[1]] = [editActionList[1], editActionList[0]];
            setActionList(editActionList);
        }
        // if (LevelNumber >= withoutGoal) {
        //     setRootExceed(true);
        //     return false;
        // }
        // let Position = GenerateNodePosition({
        //     nodes: canvasState,
        //     currentNodeId: data.nodeId,
        //     type: 'sub',
        //     optionList: '',
        // })[0];
        // console.log(Position);
        // const { x, y } = Position;
        // const [nodeId] = GenerateNodeId(canvasState);

        // let actionObj = {
        //     id: nodeId,
        //     type: 'ActionItem',
        //     targetPosition: 'left',
        //     sourcePosition: 'right',
        //     position: { x, y },
        //     parentWindowId: data.nodeId,
        // };
        // if (isFollowupChannelEnable) {
        //     dispatchState({
        //         type: 'SOURCE_ACTION_FORWARD',
        //         payload: actionObj,
        //     });
        // }
    };
    const handleActionForwadIconChange = (event, currentIcon) => {
        let iconConfig = {};
        let contentDetails = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], data.nodeId);
        let {
            value: { ChannelDetailID },
        } = contentDetails;

        switch (currentIcon) {
            case alert_medium:
                iconConfig = { icon: circle_arrow_right_medium, color: 'blue_medium' };
                break;
            case circle_arrow_right_medium:
                iconConfig = ChannelDetailID
                    ? { icon: settings_medium, color: 'blue_medium' }
                    : { icon: alert_medium, color: 'red_medium' };
                break;
            case settings_medium:
                iconConfig = { icon: circle_arrow_right_medium, color: 'blue_medium' };
                break;
            default:
                iconConfig = { icon: alert_medium, color: 'red_medium' };
        }
        setActionIcon(iconConfig);
    };

    /*Channel addon drop start*/

    const toggleRemoveIcon = (event) => {
                setChannelRemove(!isRemove);
    };

    const handleCanvasRootExceedWarning = () => {
        setRootExceed(false);
    };
    const handleChannelDeleteUpdate = (canvasJson) => {
        dispatchState({
            type: 'CHANNEL_DELETE_UPDATE',
            payload: canvasJson,
        });
    };
    const RenderGoalAction = ({ list: { item } }) => {
        return <div>{item.value}</div>;
    };
    return (
        <>
            <Handle
                type="target"
                position={Position.Left}
                style={{ bottom: 'auto', top: 33, left: -3, right: 'auto', visibility: 'hidden' }}
                onConnect={(params) => {}}
                isConnectable={isConnectable}
                id="single"
            />
            <div className="elementCircleCSS">
                {isRemove && (
                    <DeleteChannel
                        nodeId={data.nodeId}
                        mdcCanvas={canvasState}
                        dispatch={dispatch}
                        basePayload={{ userId, clientId, departmentId, campaignId }}
                        channelDeleteUpdate={(canvasJson) => handleChannelDeleteUpdate(canvasJson)}
                    />
                )}
                {/* <Icon
                    mainClass={'elementBottomIcon'}
                    icon={actionIcon['icon']}
                    color={actionIcon['color']}
                    size="md"
                    onMouseEnter={(event) => handleActionForwadIconChange(event, actionIcon['icon'])}
                    onMouseLeave={(event) => handleActionForwadIconChange(event, actionIcon['icon'])}
                    callBack={(event) => handleActionForwardOnclick(event)}
                /> */}

                {/* <KendoIconDropdown
                    className={'elementBottomIcon '}
                    icon={` icon-rs-circle-menu-dot-medium icon-md color-primary-grey`}
                    data={actionList}
                    isCustomRender
                    itemRender={(props) => <RenderGoalAction list={props} />}
                    popupClass={'mdc-channel-action-tools'}
                    onItemClick={({ item }) => {
                        if (item.id === 'create') {
                            handleCreateChannelContent();
                        }
                        if (item.id === 'edit') {
                            handleChannelEditRedirect();
                        }
                        if (item.id === 'preview') {
                            handleActionForwardOnclick();
                        } else if (item.id === 'delete') {
                            setChannelRemove(true);
                        } else if (item.id === 'action') {
                            setContentSetupComplete(true);
                        }
                    }}
                /> */}
                {/* 
                <BootstrapDropdown
                    data={actionList}
                    flatIcon
                    defaultItem={<i className={`icon-rs-circle-menu-dot-medium icon-md color-primary-grey`} />}
                    showUpdate={false}
                    className="no_caret elementBottomIcon mdc-channel-action-tools"
                    alignLeft
                    isObject={true}
                    fieldKey={`value`}
                    onSelect={(item) => {
                        if (item.id === 'create') {
                            handleCreateChannelContent();
                        }
                        if (item.id === 'edit') {
                            handleChannelEditRedirect();
                        }
                        if (item.id === 'preview') {
                            handleActionForwardOnclick();
                        } else if (item.id === 'delete') {
                            setChannelRemove(true);
                        } else if (item.id === 'action') {
                            setContentSetupComplete(true);
                        }
                    }}
                /> */}
                <Panel className="ToolBar">
                    <div ref={dropDownRef} style={{ zIndex: '1' }}>
                        <BootstrapDropdown
                            data={actionList}
                            flatIcon
                            defaultItem={
                                <i
                                    className={` icon-rs-circle-menu-dot-medium icon-md color-primary-grey channelActionMeduDot`}
                                />
                            }
                            showUpdate={false}
                            className="no_caret elementBottomIcon"
                            alignLeft
                            isObject={true}
                            fieldKey={`value`}
                            onSelect={(item) => {
                                if (item.id === 'create') {
                                    handleCreateChannelContent();
                                } else if (item.id === 'edit') {
                                    handleChannelEditRedirect();
                                } else if (item.id === 'preview') {
                                    handleActionForwardOnclick();
                                } else if (item.id === 'delete') {
                                    setChannelRemove(true);
                                } else if (item.id === 'action') {
                                    setContentSetupComplete(true);
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
                {isContentSetupComplet ? (
                    <LandingPageAction
                        isContentSetupComplet={isContentSetupComplet}
                        data={data}
                        cancelAction={() => {
                            setContentSetupComplete(false);
                        }}
                        goalType={_get(locationState, 'primaryGoal', '')}
                    />
                ) : null}
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
                <div className={`elementCircleIconCSS ${data['channelBgClassName']}`}>
                    <i className={`${getMdcGlyph(data['channelIcon'])} icon-xl`}></i>
                </div>
            </div>
            <div className="card-text font-xxs text-center flex-list" title={data['channelFriendlyName']}>
                <span className="friendly-name">{truncateTitle(data['channelFriendlyName'], 20)}</span>
            </div>
            <Handle
                type="source"
                position={Position.Right}
                style={{
                    bottom: 'auto',
                    top: 33,
                    left: 'auto',
                    right: -21,
                    visibility: 'hidden',
                }}
                onConnect={(params) => {}}
                isConnectable={isConnectable}
            ></Handle>

            <Handle
                type="target"
                position={Position.Top}
                style={{
                    bottom: 'auto',
                    top: -3,
                    left: 'auto',
                    right: 25,
                    visibility: 'hidden',
                }}
                onConnect={(params) => {}}
                isConnectable={isConnectable}
                id="T1"
            ></Handle>

            <Handle
                type="target"
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

            {/* {show && Object.keys(contentSettingJson)?.length ? (
                <GoalContentPopup
                    show={show}
                    popupMode={popupMode}
                    contentSettingJson={contentSettingJson}
                    handleCreateChannelContent={handleCreateChannelContent}
                    handleSaveChannelContent={handleSaveChannelContent}
                    handleChannelEditRedirect={handleChannelEditRedirect}
                    onClose={handleClose}
                />
            ) : null} */}

            {isRootExceed && (
                <RSModal
                    size={'md'}
                    show={isRootExceed}
                    handleClose={handleCanvasRootExceedWarning}
                    isBorder
                    header={WARNING}
                    body={
                        <Row className="text-center">
                            <Col sm="12">
                                <p>{MAX_CONNECTIONS_EXCEEDS}</p>
                            </Col>
                        </Row>
                    }
                    footer={
                        <Fragment>
                            <RSPrimaryButton onClick={handleCanvasRootExceedWarning}>{OK}</RSPrimaryButton>
                        </Fragment>
                    }
                ></RSModal>
            )}
        </>
    );
});
