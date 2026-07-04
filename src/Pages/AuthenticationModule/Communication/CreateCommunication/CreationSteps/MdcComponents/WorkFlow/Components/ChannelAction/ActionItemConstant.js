import { addHoursToDate } from 'Utils/modules/dateTime';
import { addDaysToDate } from 'Utils/modules/dateTime';
import { get as _get, find as _find, cloneDeep as _cloneDeep, mapKeys as _mapKeys, camelCase as _camelCase, filter as _filter } from 'Utils/modules/lodashReplacements';
import { eachDeep, findDeep, mapDeep } from 'deepdash-es/standalone';

import { getModule } from '../../constant';

export const HandleUpdateEdgeLabelDateTimeValidation = ({ ...restParam }) => {
    const {
        currentWindowId,
        canvasData,
        fields: triggerActionListConfig,
        campaignDetails: { endDate },
    } = restParam;

        const optionList = triggerActionListConfig.filter((item) => item.checked);
    let modules = canvasData['Campaign']['CanvasChannel']['activeChannel'];
    let rslt = getModule(modules, currentWindowId);
    let validateDate = true;
    let addedDate, channelList;
    if (rslt && rslt.hasOwnProperty('value')) {
        channelList = JSON.parse(JSON.stringify(rslt['value']));
    }
    optionList.forEach((optionListItem) => {
        channelList['activeChannel'].forEach((item, index) => {
            if (
                optionListItem.durDate != '' &&
                item.hasOwnProperty('actionOption') &&
                optionListItem.name == item['actionOption']['name']
            ) {
                let prevDurDate = optionListItem.durDate;
                const {
                    durDate,
                    durType: { value: durationType },
                    durVal,
                } = optionListItem;
                item['actionOption']['durDate'] = durDate;
                item['actionOption']['durType'] = durationType;
                item['actionOption']['durVal'] = durVal;

                eachDeep(
                    item,
                    (child, i, parent, ctx) => {
                        // if (child.hasOwnProperty('actionOption') && child['actionOption'][0].hasOwnProperty('optionDomId')) {
                        if (child.hasOwnProperty('actionOption')) {
                            let {
                                durDate,
                                durType: { value: durationType },
                                durVal,
                                optionDomId,
                            } = child['actionOption'];

                            if (i && parent) {
                                prevDurDate = parent['actionOption']['durDate'];
                                let dateFormat = new Date(prevDurDate);
                                if (durationType === 'days') addedDate = addDaysToDate(dateFormat, durVal);
                                if (durationType === 'hours') addedDate = addHoursToDate(dateFormat, durVal);

                                child['actionOption']['durDate'] = addedDate;

                                
                                if (!CompareDate({ addedDate, endDate })) {
                                    validateDate = false;
                                }
                            }
                        }
                    },
                    { childrenPath: 'activeChannel' },
                );
            }
        });
    });

    return validateDate;
};

export const CompareDate = (dateParam) => {
    const { addedDate, endDate ,currentDateByTimeZone } = dateParam;
    let updateCurrentDate = currentDateByTimeZone || new Date()
    const campaignEndDate = new Date(endDate);
    const scheduleDate = new Date(addedDate);
    // let dateFormat = new Date(endDate);
    // let cEndDate = addDaysToDate(dateFormat, 1); // allow inclusive of campaign end date to add 1 day, validation purpose only
    let cEndDate = new Date(`${endDate} 23:59:59`); // allow inclusive of campaign end date to add 1 day, validation purpose only

    if (scheduleDate < updateCurrentDate) {
        dateParam.isSelectedDateBeforeCurrentDate.isNotValid = true;
        return false;
    }

    cEndDate.setDate(cEndDate.getDate() - 2);
    cEndDate.setHours(23, 59, 59, 999);

    return scheduleDate <= cEndDate ? true : false;
};

export const getActionModule = ({ canvasData, currentWindowId, optionName }) => {
    const modules = canvasData['Campaign']['CanvasChannel']['activeChannel'];
    let actionElementRslt = findDeep(modules, (module) => module.DomId === currentWindowId, {
        checkCircular: false,
        childrenPath: 'activeChannel',
    });
    let activeChannel = _get(actionElementRslt, 'value.activeChannel', []);
    let findOption = _find(activeChannel, ['actionOption.name', optionName]);
    // if(!findOption){
    //     findOption =
    // }
    return findOption;
};

export const channelRemoveByAction = (params) => {
    const { currentWindowId, mdcCanvas, optionName } = params;
    let MDCTemplate = _cloneDeep(mdcCanvas);

    let modules = MDCTemplate['Campaign']['CanvasChannel']['activeChannel'];
    let rslt = getModule(modules, currentWindowId);
        //handleRemoveMdcAttrSetupFromSes();
    let deleteChannelList = [],
        channelDeleteList = [],
        actionAttributeDeletList = [];
    rslt['value']['activeChannel'].forEach((item, index) => {
        if (item['actionOption']['name'] == optionName) {
            deleteChannelList = item;

            if (deleteChannelList) {
                mapDeep(
                    deleteChannelList,
                    (child, i, parent, ctx) => {
                        if (child.hasOwnProperty('DomId')) {
                            const { ChannelDetailID, ChannelDetailType, LevelNumber, DynamicListID } = child;
                            if (ChannelDetailID > 0) {
                                channelDeleteList = [
                                    ...channelDeleteList,
                                    { ChannelDetailID, ChannelDetailType, LevelID: LevelNumber },
                                ];
                            }
                            if (DynamicListID && DynamicListID > 0) {
                                actionAttributeDeletList = [
                                    ...actionAttributeDeletList,
                                    { ChannelDetailID, ChannelDetailType, DynamicListID, DLAttrAction: 'delete' },
                                ];
                            }
                        }
                    },
                    { childrenPath: 'activeChannel' },
                );

                rslt['value']['activeChannel'].splice(index, 1);
                            }
        }
    });
    channelDeleteList = channelDeleteList?.length
        ? channelDeleteList.map((item) => _mapKeys(item, (v, k) => _camelCase(k)))
        : [];
    return { channelDeleteList, MDCTemplate };
};

export const DAY_OR_HOUR_FIELD_RULE = ({
    index,
    fields,
    setError,
    clearErrors,
    errors,
    campaignEndDate,
    currentWindowId,
    canvasData,
    currentDate
}) => {
    return {
        validate: (data) => {
            let selectedOption = _filter(fields, { checked: true });
            
            if (!selectedOption?.length) setError('dayOrHourErr', { type: `custom`, message: `` });
            else {
                let p1, p2, p3, p4, p5, p6;
                p1 = p2 = p3 = p4 = p5 = p6 = false;
                let isSelectedDateBeforeCurrentDate = {
                    isNotValid: false,
                };

                for (const option of selectedOption) {
                    const {
                        durType: { value: type },
                        durVal,
                        durDate,
                    } = option;
                    let waitPeriod = durVal ? parseInt(durVal, 10) : durVal;
                    if (!waitPeriod && waitPeriod !== 0) {
                        p1 = true;
                        
                        //break;
                    } else if (waitPeriod === 0) {
                        
                        p2 = true;
                        //break;
                    } else if (type === 'hours' && (waitPeriod < 4 || waitPeriod > 23)) {
                        p3 = true;

                        //break;
                    } else if (type === 'days' && waitPeriod < 3) {
                        if (
                            !CompareDate({
                                addedDate: durDate,
                                endDate: campaignEndDate,
                                isSelectedDateBeforeCurrentDate,
                                currentDate
                            })
                        ) {
                            p5 = true;
                        } else if (
                            !HandleUpdateEdgeLabelDateTimeValidation({
                                currentWindowId,
                                canvasData,
                                fields,
                                campaignDetails: { endDate: campaignEndDate },
                            })
                        ) {
                            p6 = true;
                        } else {
                            p4 = true;
                        }

                        // break;
                    } else if (
                        !CompareDate({ addedDate: durDate, endDate: campaignEndDate, isSelectedDateBeforeCurrentDate })
                    ) {
                        p5 = true;
                    } else if (
                        !HandleUpdateEdgeLabelDateTimeValidation({
                            currentWindowId,
                            canvasData,
                            fields,
                            campaignDetails: { endDate: campaignEndDate },
                        })
                    ) {
                        p6 = true;
                    } else {
                        clearErrors('dayOrHourErr');
                        //break;
                    }
                    if (p1) {
                        setError('dayOrHourErr', { type: `custom`, message: `Waiting time should not be blank.` });
                    } else if (p2) {
                        setError('dayOrHourErr', { type: `custom`, message: `Waiting time should not be 0.` });
                    } else if (p3) {
                        setError('dayOrHourErr', {
                            type: `custom`,
                            message: `Hours should be between 4 and 23.`,
                        });
                    } else if (p5 || p6) {
                        if (isSelectedDateBeforeCurrentDate?.isNotValid) {
                            setError('dayOrHourErr', {
                                type: `custom`,
                                message: `The selected date cannot be before the current date.`,
                            });
                        } else {
                            setError('dayOrHourErr', {
                                type: `custom`,
                                message: `Days should not exceed communication duration.`,
                            });
                        }
                    } else if (p4) {
                        setError('dayOrHourErr', {
                            type: `warning`,
                            message: `We recommend setting a delay of atleast 3-5 days on follow up communication for best results.`,
                        });
                    }
                }
            }
        },
    };
};

export const DAY_OR_HOUR_FIELD_RULE_CONVERSION = ({
    index,
    fields,
    setError,
    clearErrors,
    errors,
    campaignEndDate,
    currentWindowId,
    canvasData,
    currentDateByTimeZone
}) => {
    return {
        validate: (data) => {
            let selectedOption = _filter(fields, { checked: true });
            
            if (selectedOption?.length && selectedOption?.length === 1 && selectedOption[0].value === 3) {
                clearErrors('dayOrHourErr');
            } else if (selectedOption?.length && selectedOption?.length === 2 && _find(selectedOption, 'value', 3)) {
                clearErrors('dayOrHourErr');
            } else {
                let p1, p2, p3, p4, p5, p6;
                p1 = p2 = p3 = p4 = p5 = p6 = false;

                let isSelectedDateBeforeCurrentDate = {
                    isNotValid: false,
                };

                for (const option of selectedOption) {
                    if (option.value !== 3) {
                        const {
                            durType: { value: type },
                            durVal,
                            durDate,
                        } = option;
                        let waitPeriod = durVal ? parseInt(durVal, 10) : durVal;
                        if (!waitPeriod && waitPeriod !== 0) {
                            p1 = true;
                            
                            //break;
                        } else if (waitPeriod === 0) {
                            
                            p2 = true;
                            //break;
                        } else if (type === 'hours' && (waitPeriod < 4 || waitPeriod > 23)) {
                            p3 = true;

                            //break;
                        } else if (type === 'days' && waitPeriod < 3) {
                            if (
                                !CompareDate({
                                    addedDate: durDate,
                                    endDate: campaignEndDate,
                                    isSelectedDateBeforeCurrentDate,
                                    currentDateByTimeZone
                                })
                            ) {
                                p5 = true;
                            } else if (
                                !HandleUpdateEdgeLabelDateTimeValidation({
                                    currentWindowId,
                                    canvasData,
                                    fields,
                                    campaignDetails: { endDate: campaignEndDate },
                                })
                            ) {
                                p6 = true;
                            } else {
                                p4 = true;
                            }
                            // break;
                        } else if (
                            !CompareDate({
                                addedDate: durDate,
                                endDate: campaignEndDate,
                                isSelectedDateBeforeCurrentDate,
                            })
                        ) {
                            p5 = true;
                        } else if (
                            !HandleUpdateEdgeLabelDateTimeValidation({
                                currentWindowId,
                                canvasData,
                                fields,
                                campaignDetails: { endDate: campaignEndDate },
                            })
                        ) {
                            p6 = true;
                        } else {
                            clearErrors('dayOrHourErr');
                            //break;
                        }
                        if (p1) {
                            setError('dayOrHourErr', { type: `custom`, message: `Waiting time should not be blank.` });
                        } else if (p2) {
                            setError('dayOrHourErr', { type: `custom`, message: `Waiting time should not be 0.` });
                        } else if (p3) {
                            setError('dayOrHourErr', {
                                type: `custom`,
                                message: `Hours should be between 4 and 23.`,
                            });
                        } else if (p4) {
                            setError('dayOrHourErr', {
                                type: `warning`,
                                message: `We recommend setting a delay of atleast 3-5 days on follow up communication for best results.`,
                            });
                        } else if (p5 || p6) {
                            if (isSelectedDateBeforeCurrentDate?.isNotValid) {
                                setError('dayOrHourErr', {
                                    type: `custom`,
                                    message: `The selected date cannot be before the current date.`,
                                });
                            } else {
                                setError('dayOrHourErr', {
                                    type: `custom`,
                                    message: `Days should not exceed communication duration.`,
                                });
                            }
                        }
                    }
                }
            }
        },
    };
};
