import { memo, useContext, useEffect, useState } from 'react';
import { get as _get, find as _find, differenceBy as _differenceBy, differenceWith as _differenceWith, isEqual as _isEqual, filter as _filter, cloneDeep as _cloneDeep } from 'Utils/modules/lodashReplacements';

import TriggerActionModal from './TriggerActionModal';
import CreateWorkFlowContext, { CreateWorkFlowOtherContext } from '../../context';
import {
    GenerateNodeId,
    GenerateNodePosition,
    GetTriggerActionList,
    getModule,
    UpdateRecursivelyFlowDateTime,
    chennalUiConfig,
    checkLandingPageExist,
    getCurrentDateTimeByTimezone,
} from '../../constant';
import { useDispatch } from 'react-redux';

const MAX_SELECTABLE_ACTIONS = 4;

export default memo(({ data, isContentSetupComplet, cancelAction, goalType }) => {
    const dispatch = useDispatch();
    const [show, setShow] = useState(false);
    const [currentDateByTimeZone, setCurrentDateByTimeZone] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [primaryGoal, setPrimaryGoal] = useState(goalType);
    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);
    const { lastUpdatedCanvasState } = useContext(CreateWorkFlowOtherContext);
    const { defaultEle, nodeState } = canvasState;
    
    const triggerActionList = _cloneDeep(GetTriggerActionList(data.channelId));
    const [currentTriggerAction, setCurrentTriggerAction] = useState(triggerActionList);

    useEffect(() => {
        setPrimaryGoal(goalType);
    }, [goalType]);

    useEffect(() => {
        handleActionForwardOnclick();
        setShow(isContentSetupComplet);
    }, [isContentSetupComplet]);
    const handleActionForwardOnclick = () => {
        let currentWindowId = data.currentWindowId;
        const {
            Campaign: {
                CanvasChannel: { activeChannel: modules, Placeholder },
            },
        } = canvasState;
        let getChannelActionDetails = getModule(modules, currentWindowId);

        let optionList = [];
        getChannelActionDetails['value']['activeChannel'].forEach((item) => {
            let option = {};

            if (canvasState?.MdcType === `RecursivelyTraverse`) {
                option = item?.actionOption && _get(item, 'actionOption[0]');
                option = { ...option, checked: true };
            } else {
                option = item?.actionOption && _get(item, 'actionOption');
            }
            optionList = [...optionList, option];
        });

        Placeholder?.forEach((item) => {
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

        if (checkedLength === MAX_SELECTABLE_ACTIONS) {
            newTriggerAction = newTriggerAction.map((item) => {
                return item.checked ? { ...item, disabled: false } : { ...item, disabled: true };
            });
        }
        /* Conversion/goal flow section start*/
        if (primaryGoal && primaryGoal.toLowerCase() === 'conversion') {
            newTriggerAction = newTriggerAction.map((item) => {
                return item.value === 3 ? { ...item, checked: true, disabled: true } : item;
            });
        }
                /* Conversion/goal flow section end*/
                if (canvasState?.MdcType === `RecursivelyTraverse`) {
            newTriggerAction = newTriggerAction.map((item) => {
                return { ...item, disabled: true, attribute: item?.attributeSetup || false };
            });
        }
        setScheduleDate(getChannelActionDetails['value']['ScheduleDate']);
        setCurrentTriggerAction([...newTriggerAction]);
        setShow(true);
    };

    const handleSaveActionTriggerList = ({ triggerActionListConfig }) => {
        let currentWindowId = data.currentWindowId;
        const {
            Campaign: {
                CanvasChannel: { activeChannel: modules, Placeholder },
            },
        } = canvasState;
        let getChannelActionDetails = getModule(modules, currentWindowId);
        let isLpExist = checkLandingPageExist(modules, 'goal001');

        let selectedActionTriggerList =
            (primaryGoal.toLowerCase() === 'conversion' &&
                getChannelActionDetails['value']['LevelNumber'] > 1 &&
                (getChannelActionDetails?.['parent']['ChannelDetailType'] === 'LP1' ||
                    getChannelActionDetails?.['parent']['ChannelDetailType'] === 'LP2')) ||
            (primaryGoal.toLowerCase() === 'conversion' &&
                getChannelActionDetails['value']['LevelNumber'] === 1 &&
                !isLpExist) ||
            primaryGoal.toLowerCase() !== 'conversion'
                ? triggerActionListConfig.filter((item) => item.checked) // filter only selected/checked options
                : triggerActionListConfig.filter((item) => item.checked && item.value !== 3);

        let optionList = [];
        getChannelActionDetails['value']['activeChannel'].forEach((item) => {
            let option = item?.actionOption && _get(item, 'actionOption');
            optionList = [...optionList, option];
        });

        Placeholder?.forEach((item) => {
            if (item.data.parentWindowId === currentWindowId) {
                let option = item?.data?.actionOption && _get(item, 'data.actionOption');
                optionList = [...optionList, option];
            }
        });
        lastUpdatedCanvasState.current = canvasState;

                let activeTriggerList = _differenceBy(selectedActionTriggerList, optionList, 'name'); // filter selected/checked option in edit mode
        const findClickedTriggerList = _find(activeTriggerList, (data) => data.value === 3);
        const findNonClickedTriggerList = _filter(activeTriggerList, (data) => data.value !== 3);
        const isExistClickActionInLp =
            _find(optionList, (data) => data.value === 3) && primaryGoal.toLowerCase() === 'conversion';

        activeTriggerList = findClickedTriggerList
            ? [...findNonClickedTriggerList, findClickedTriggerList]
            : findNonClickedTriggerList;
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
            let diff = isExistClickActionInLp ? false : optionList && optionList?.length ? true : false;
            let isLPClickActionContains = isExistClickActionInLp ? true : false;
            let Position = GenerateNodePosition({
                nodes: canvasState,
                currentNodeId: data.nodeId,
                type: 'sub',
                optionList: activeTriggerList,
                diff,
                isLPClickActionContains,
            });
            const nodeId = GenerateNodeId(canvasState, activeTriggerList);

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

    const getChannelActionName = (channelId) => {
         let finalChannel = channelId?.includes('goal') ? 'goal001' : channelId;
        let rslt = chennalUiConfig.filter((item) => item?.channelId === finalChannel)[0]['channelActionName'];
        return rslt;
    };

    useEffect(() => {
        let isMounted = true;
        
        const fetchCurrentDateTime = async () => {
            try {
                const currentDateAndTimeZone = await getCurrentDateTimeByTimezone({ canvasState, nodeId: data?.currentWindowId, dispatch });
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

    const parseCurrentDateByTimeZone = (str) => {
        if (!str) return new Date();
        const cleaned = str.replace(/,/g, '');
        const parsed = new Date(cleaned);
        return !isNaN(parsed.getTime()) ? parsed : new Date();
    };

    const resolvedDate = parseScheduleDate(scheduleDate);
    const finalScheduleDate = (!resolvedDate || resolvedDate.getFullYear() === 1970)
        ? parseCurrentDateByTimeZone(currentDateByTimeZone)
        : resolvedDate;

    return (
        <>
            {show ? (
                <TriggerActionModal
                    title={getChannelActionName(data.channelId)}
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
                        cancelAction();
                    }}
                    currentChannelDetailData={data}
                    currentDateByTimeZone={currentDateByTimeZone}
                />
            ) : (
                <></>
            )}
        </>
    );
});
