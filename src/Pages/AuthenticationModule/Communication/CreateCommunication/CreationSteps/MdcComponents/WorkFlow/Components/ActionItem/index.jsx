import * as icons from 'Constants/GlobalConstant/Glyphicons';
import { memo, useContext, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { get as _get, find as _find, differenceBy as _differenceBy, differenceWith as _differenceWith, isEqual as _isEqual, filter as _filter, cloneDeep as _cloneDeep } from 'Utils/modules/lodashReplacements';

import TriggerActionModal from './TriggerActionModal';
import Icon from 'Components/Icon/Icon';

import CreateWorkFlowContext, { CreateWorkFlowOtherContext } from '../../context';
import {
    GenerateNodeId,
    GenerateNodePosition,
    GetChannelStyleAttributes,
    GetTriggerActionList,
    getModule,
    UpdateRecursivelyFlowDateTime,
} from '../../constant';

import useQueryParams from 'Hooks/useQueryParams';
export default memo(({ data, isConnectable }) => {
    const [show, setShow] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');
    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);
    const { lastUpdatedCanvasState } = useContext(CreateWorkFlowOtherContext);
    const { defaultEle, nodeState } = canvasState;
    // console.log('Action  data #################### aaaa', data);
    // const {
    //     state: { primaryGoal },
    // } = useLocation();

    const location = useQueryParams('/communication') || {};
    const { primaryGoal } = location;
    const { channelBgClassName } = GetChannelStyleAttributes(data.channelId);
    const triggerActionList = _cloneDeep(GetTriggerActionList(data.channelId));
    const [currentTriggerAction, setCurrentTriggerAction] = useState(triggerActionList);
    const [isActionPropActive, setIsActionPropActive] = useState(false);
    const [actionIcon, setActionIcon] = useState({
        icon: icons['alert_medium'],
        color: 'color-red-medium',
    });

    useEffect(() => {
        if (canvasState?.Campaign?.CanvasChannel?.activeChannel?.length) {
            let contentDetails = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], data.nodeId);

            if (contentDetails?.value?.activeChannel?.length) {
                setActionIcon({ icon: icons['settings_medium'], color: 'color-primary-blue' });
            }
        }
    }, [canvasState['Campaign']['CanvasChannel']['activeChannel']]);

    const handleActionForwardOnclick = (event) => {
        let currentWindowId = data.currentWindowId;
        //let modules = canvasState['Campaign']['CanvasChannel']['activeChannel'];
        const {
            Campaign: {
                CanvasChannel: { activeChannel: modules, Placeholder },
            },
        } = canvasState;
        let getChannelActionDetails = getModule(modules, currentWindowId);

        let optionList = [];
        getChannelActionDetails['value']['activeChannel'].forEach((item) => {
            let option = item?.actionOption && _get(item, 'actionOption');
            optionList = [...optionList, option];
        });

        Placeholder.forEach((item) => {
            if (item.data.parentWindowId === currentWindowId) {
                let option = item?.data?.actionOption && _get(item, 'data.actionOption');
                optionList = [...optionList, option];
            }
        });

        let newTriggerAction = currentTriggerAction.map((item) => {
            return _find(optionList, { value: item.value, checked: true })
                ? _find(optionList, { value: item.value, checked: true })
                : { ...item, durType: { dayOrHour: 'Day(s)', value: 'days' } };
        });

        let checkedLength = _filter(newTriggerAction, ['checked', true])?.length;

        if (checkedLength === 2) {
            newTriggerAction = newTriggerAction.map((item) => {
                return item.checked ? { ...item, disabled: false } : { ...item, disabled: true };
            });
        }
        /* Conversion/goal flow section start*/
        if (primaryGoal.toLowerCase() === 'conversion') {
            newTriggerAction = newTriggerAction.map((item) => {
                return item.value === 3 ? { ...item, checked: true, disabled: true } : item;
            });
        }
                /* Conversion/goal flow section end*/
                setScheduleDate(getChannelActionDetails['value']['ScheduleDate']);
        setCurrentTriggerAction([...newTriggerAction]);
        setShow(true);
    };

    const handleSaveActionTriggerList = ({ triggerActionListConfig }) => {
        let selectedActionTriggerList = triggerActionListConfig.filter((item) => item.checked); // filter only selected/checked options

        let currentWindowId = data.currentWindowId;
        const {
            Campaign: {
                CanvasChannel: { activeChannel: modules, Placeholder },
            },
        } = canvasState;
        let getChannelActionDetails = getModule(modules, currentWindowId);

        let optionList = [];
        getChannelActionDetails['value']['activeChannel'].forEach((item) => {
            let option = item?.actionOption && _get(item, 'actionOption');
            optionList = [...optionList, option];
        });

        Placeholder.forEach((item) => {
            if (item.data.parentWindowId === currentWindowId) {
                let option = item?.data?.actionOption && _get(item, 'data.actionOption');
                optionList = [...optionList, option];
            }
        });

                let activeTriggerList = _differenceBy(selectedActionTriggerList, optionList, 'name'); // filter selected/checked option in edit mode
            lastUpdatedCanvasState.current = canvasState;
        const optionDiff = _differenceWith(selectedActionTriggerList, optionList, _isEqual); // to update recursive flow date and time
                if (optionDiff && optionDiff?.length && optionList?.length) {
            dispatchState({
                type: 'UPDATE_RECURSIVE_FLOW_DATE_TIME',
                payload: { optionDiff, currentWindowId },
            });
            let rslt = UpdateRecursivelyFlowDateTime({ optionDiff, currentWindowId }, canvasState, 'updateToDb');
            if (rslt && rslt?.length) {
                data.CascadeUpdate(rslt);
            }
        }

        if (activeTriggerList && activeTriggerList?.length) {
            let payloadObj = [];
            let diff = optionList && optionList?.length ? true : false;
            let Position = GenerateNodePosition({
                nodes: canvasState,
                currentNodeId: data.nodeId,
                type: 'sub',
                optionList: activeTriggerList,
                diff,
            });
            const nodeId = GenerateNodeId(canvasState, activeTriggerList);
            activeTriggerList.forEach((item, index) => {
                let placeholderObj = _cloneDeep(defaultEle);
                let placeholderType =
                    primaryGoal.toLowerCase() === 'conversion' && item.value === 3 ? 'GoalPlaceholder' : 'Placeholder';
                placeholderObj = {
                    ...placeholderObj,
                    id: nodeId[index],
                    type: placeholderType,
                    targetPosition: 'left',
                    sourcePosition: 'right',
                };
                placeholderObj = { ...placeholderObj, position: Position[index] };
                placeholderObj = {
                    ...placeholderObj,
                    data: {
                        ...placeholderObj['data'],
                        parentWindowId: data.nodeId,
                        currentWindowId: nodeId[index],
                        action: true,
                        actionOption: item,
                    },
                };
                payloadObj = [...payloadObj, placeholderObj];
            });
                        lastUpdatedCanvasState.current = canvasState;
            dispatchState({
                type: 'TRIGGER_ACTION_FORWARD',
                payload: { updatedStateVal: payloadObj, updateCount: canvasState.updatedCount + 1 },
            });
        }
        setShow(false);
    };
    const handleActionForwadIconChange = (event, currentIcon) => {
        let iconConfig = {};
        let contentDetails = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], data.nodeId);

        switch (currentIcon) {
            case icons['alert_medium']:
                iconConfig = { icon: icons['circle_arrow_right_medium'], color: 'color-primary-blue' };
                break;
            case icons['circle_arrow_right_medium']:
                iconConfig = contentDetails?.value?.activeChannel?.length
                    ? { icon: icons['settings_medium'], color: 'color-primary-blue' }
                    : { icon: icons['alert_medium'], color: 'color-red-medium' };
                break;
            case icons['settings_medium']:
                iconConfig = { icon: icons['circle_arrow_right_medium'], color: 'color-primary-blue' };
                break;
            default:
                iconConfig = { icon: icons['alert_medium'], color: 'color-red-medium' };
        }
        setActionIcon(iconConfig);
    };

    const parseScheduleDate = (d) => {
        if (!d) return null;
        if (d instanceof Date) return d;
        if (typeof d === 'string' && d.includes(',')) {
            const parts = d.split(',');
            if (parts.length >= 5) {
                const [date, month, year, hours, minutes] = parts;
                return new Date(Number(year), Number(month) - 1, Number(date), Number(hours), Number(minutes));
            }
        }
        const parsed = new Date(d);
        return !isNaN(parsed.getTime()) ? parsed : null;
    };

    const resolvedDate = parseScheduleDate(scheduleDate);
    const finalScheduleDate = (!resolvedDate || resolvedDate.getFullYear() === 1970) ? new Date() : resolvedDate;

    return (
        <>
            <Handle
                type="target"
                position={Position.Left}
                style={{ bottom: 30, top: 16, left: 15, right: 'auto', visibility: 'hidden' }}
                onConnect={(params) => {}}
                isConnectable={isConnectable}
            />
            <div className="elementCircleCSS polygonIconBlock">
                <Icon
                    mainClass={'elementBottomIcon'}
                    icon={actionIcon['icon']}
                    color={actionIcon['color']}
                    size="md"
                    onMouseEnter={(event) => handleActionForwadIconChange(event, actionIcon['icon'])}
                    onMouseLeave={(event) => handleActionForwadIconChange(event, actionIcon['icon'])}
                    callBack={(event) => handleActionForwardOnclick(event)}
                />
                <div className={`elementCircleIconCSS ${channelBgClassName}`}>
                    <i className={`icon-rs-channel-action-medium icon-md`}></i>
                </div>
            </div>
            <p className="card-text font-xxs text-center width75" title={data.actionName}>
                {' '}
                {data.actionName}{' '}
            </p>
            <Handle
                type="source"
                position={Position.Right}
                style={{ bottom: 0, top: 16, right: 18, left: 'auto', visibility: 'hidden' }}
                onConnect={(params) => {}}
                isConnectable={isConnectable}
            />
            {show ? (
                <TriggerActionModal
                    title={data.actionName}
                    currentWindowId={data.currentWindowId}
                    canvasData={canvasState}
                    currentTriggerAction={currentTriggerAction}
                    scheduleDate={finalScheduleDate}
                    show={show}
                    dispatchState={dispatchState}
                    formSubmit={(data) => handleSaveActionTriggerList(data)}
                    onClose={() => {
                                                setCurrentTriggerAction(currentTriggerAction);
                        setShow(false);
                    }}
                />
            ) : (
                <></>
            )}
        </>
    );
});
//export default memo(SrcElement)
