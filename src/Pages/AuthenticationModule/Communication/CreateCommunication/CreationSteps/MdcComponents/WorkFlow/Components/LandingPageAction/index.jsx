import { alert_medium, circle_arrow_right_medium, settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useContext, useEffect, useState } from 'react';
import _get from 'lodash/get';
import _find from 'lodash/find';
import _differenceBy from 'lodash/differenceBy';
import _differenceWith from 'lodash/differenceWith';
import _isEqual from 'lodash/isEqual';
import _filter from 'lodash/filter';

import TriggerActionModal from './TriggerActionModal';
import _cloneDeep from 'lodash/cloneDeep';
import CreateWorkFlowContext, { CreateWorkFlowOtherContext } from '../../context';
import {
    GenerateNodeId,
    GenerateNodePosition,
    GetChannelStyleAttributes,
    GetTriggerActionList,
    getModule,
    UpdateRecursivelyFlowDateTime,
    chennalUiConfig,
    getCurrentDateTimeByTimezone,
} from '../../constant';

import useQueryParams from 'Hooks/useQueryParams';
import { useDispatch } from 'react-redux';

export default memo(({ data, isContentSetupComplet, cancelAction, goalType }) => {
    const dispatch = useDispatch();
    const [show, setShow] = useState(false);
    const [scheduleDate, setScheduleDate] = useState(new Date());
    const [currentDateByTimeZone, setCurrentDateByTimeZone] = useState('');
    const [primaryGoal, setPrimaryGoal] = useState(goalType);
    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);
    const { lastUpdatedCanvasState } = useContext(CreateWorkFlowOtherContext);
    const { defaultEle, nodeState } = canvasState;
    // console.log('Action  data #################### aaaa', data);
    // const {
    //     state: { primaryGoal },
    // } = useLocation();

    const location = useQueryParams('/communication') || {};

    const { channelBgClassName } = GetChannelStyleAttributes(data.channelId);
    const triggerActionList = _cloneDeep(GetTriggerActionList(data.channelId));
    const [currentTriggerAction, setCurrentTriggerAction] = useState(triggerActionList);
    const [isActionPropActive, setIsActionPropActive] = useState(false);
    let getChannelActionDetails = getModule(canvasState?.Campaign?.CanvasChannel?.activeChannel, data.currentWindowId);

    const [actionIcon, setActionIcon] = useState({
        icon: alert_medium,
        color: 'color-red-medium',
    });

    useEffect(() => {
        setPrimaryGoal(goalType);
    }, [goalType]);
    useEffect(() => {
        if (canvasState?.Campaign?.CanvasChannel?.activeChannel?.length) {
            let contentDetails = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], data.nodeId);

            if (contentDetails?.value?.activeChannel?.length) {
                setActionIcon({ icon: settings_medium, color: 'color-primary-blue' });
            }
        }
    }, [canvasState['Campaign']['CanvasChannel']['activeChannel']]);

    useEffect(() => {
        handleActionForwardOnclick();
        setShow(isContentSetupComplet);
    }, [isContentSetupComplet]);
    const handleActionForwardOnclick = () => {
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
        if (primaryGoal) {
            newTriggerAction = newTriggerAction.map((item) => {
                return item.value === 21 ? { ...item, checked: true, disabled: true } : item;
            });
        }
                /* Conversion/goal flow section end*/
                // setScheduleDate(getChannelActionDetails['value']['ScheduleDate']); need to update as current date
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
        lastUpdatedCanvasState.current = canvasState;
                let activeTriggerList = _differenceBy(selectedActionTriggerList, optionList, 'name'); // filter selected/checked option in edit mode

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

          // handle subSegment flow add in level and audience
          let handleSegmentValues = () => {
            let segmentValues = {};

            if (canvasState['dataSource']['isSubsegmentJoureny']) {
                segmentValues = {
                    subSegmentLevel: data.subSegmentLevel,
                    // audienceCount: data?.audienceCount,
                    isNestedLevelActiveChannel: true,
                };
            }
            return segmentValues;
        };

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
                        ...handleSegmentValues(),
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
        cancelAction();
    };
    const handleActionForwadIconChange = (event, currentIcon) => {
        let iconConfig = {};
        let contentDetails = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], data.nodeId);

        switch (currentIcon) {
            case alert_medium:
                iconConfig = { icon: circle_arrow_right_medium, color: 'color-primary-blue' };
                break;
            case circle_arrow_right_medium:
                iconConfig = contentDetails?.value?.activeChannel?.length
                    ? { icon: settings_medium, color: 'color-primary-blue' }
                    : { icon: alert_medium, color: 'color-red-medium' };
                break;
            case settings_medium:
                iconConfig = { icon: circle_arrow_right_medium, color: 'color-primary-blue' };
                break;
            default:
                iconConfig = { icon: alert_medium, color: 'color-red-medium' };
        }
        setActionIcon(iconConfig);
    };
    const getChannelActionName = (channelId) => {
        let finalChannel = channelId?.includes('goal') ? 'goal001' : channelId;
        let rslt = chennalUiConfig.filter((item) => item?.channelId === finalChannel)[0]['channelActionName'];
        return rslt;
    };

    useEffect(() => {
        let isMounted = true;

        const fetchCurrentDateTime = async () => {
            try {
                const currentDateAndTimeZone = await getCurrentDateTimeByTimezone({
                    canvasState,
                    nodeId: data?.currentWindowId,
                    dispatch,
                });
                if (isMounted) {
                    setCurrentDateByTimeZone(currentDateAndTimeZone);
                }
            } catch (error) {
                if (isMounted) {
                    setCurrentDateByTimeZone('');
                }
            }
        };

        fetchCurrentDateTime();

        return () => {
            isMounted = false;
        };
    }, [canvasState, data?.currentWindowId]);

    return (
        <>
            {show ? (
                <TriggerActionModal
                    title={getChannelActionName(data.channelId)}
                    currentWindowId={data.currentWindowId}
                    canvasData={canvasState}
                    currentTriggerAction={currentTriggerAction}
                    scheduleDate={getChannelActionDetails?.parent?.ScheduleDate || new Date()}
                    show={show}
                    dispatchState={dispatchState}
                    formSubmit={(data) => handleSaveActionTriggerList(data)}
                    onClose={() => {
                                                setCurrentTriggerAction(currentTriggerAction);
                        setShow(false);
                        cancelAction();
                    }}
                    currentDateByTimeZone={currentDateByTimeZone}
                />
            ) : (
                <></>
            )}
        </>
    );
});
