import { addHoursToDate } from 'Utils/modules/dateTime';
import { addDaysToDate } from 'Utils/modules/dateTime';
import _get from 'lodash/get';
import _find from 'lodash/find';
import _cloneDeep from 'lodash/cloneDeep';
import _mapKeys from 'lodash/mapKeys';
import _camelCase from 'lodash/camelCase';
import _filter from 'lodash/filter';
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
                            rslt['value']['activeChannel'].splice(index, 1);
                        }
                    },
                    { childrenPath: 'activeChannel' },
                );

                            }
        }
    });
    channelDeleteList = channelDeleteList?.length
        ? channelDeleteList.map((item) => _mapKeys(item, (v, k) => _camelCase(k)))
        : [];
    return { channelDeleteList, MDCTemplate };
};

export const CompareDate = (dateParam) => {
    const { addedDate, endDate,currentDateByTimeZone } = dateParam;
    const campaignEndDate = new Date(endDate);
    const scheduleDate = new Date(addedDate);
    const currentDate = currentDateByTimeZone || new Date()
    if (scheduleDate < currentDate) {
        dateParam.isSelectedDateBeforeCurrentDate.isNotValid = true;
        return false;
    }
    campaignEndDate.setDate(campaignEndDate.getDate() - 2);
    campaignEndDate.setHours(23, 59, 59, 999);

    return scheduleDate <= campaignEndDate ? true : false;
};

export const getActionModule = ({ canvasData, currentWindowId, optionName }) => {
    const modules = canvasData['Campaign']['CanvasChannel']['activeChannel'];
    let actionElementRslt = findDeep(modules, (module) => module.Action.DomId === currentWindowId, {
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
export const DAY_OR_HOUR_FIELD_RULE_CONVERSION = ({
    index,
    fields,
    setError,
    clearErrors,
    errors,
    campaignEndDate,
    currentDateByTimeZone
}) => {
    
    return {
        validate: (data) => {
            let selectedOption = _filter(fields, { checked: true });
            // alert(data);
            
            if (selectedOption?.length && selectedOption?.length === 1 && selectedOption[0].value === 21) {
                setError('dayOrHourErr', { type: `custom`, message: `` });
            } else if (selectedOption?.length && selectedOption?.length === 2 && _find(selectedOption, 'value', 21)) {
                setError('dayOrHourErr', { type: `custom`, message: `` });
            } else {
                let p1, p2, p3, p4, p5, maxDaysExceed = false;
                p1 = p2 = p3 = p4 = p5 = false;

                let isSelectedDateBeforeCurrentDate = {
                    isNotValid: false,
                };

                for (const option of selectedOption) {
                    if (option.value !== 21) {
                        const {
                            durType: { value: type },
                            durVal,
                            durDate,
                        } = option;
                        let waitPeriod = durVal ? parseInt(durVal, 10) : durVal;
                            if (waitPeriod === '' || waitPeriod === undefined || waitPeriod === null) {
                                p1 = true;
                                                            } else if (waitPeriod === 0) {
                                p2 = true;
                                                            } else if (type === 'hours' && (waitPeriod < 4 || waitPeriod > 23)) {
                                p3 = true;
                            }
                        else if (
                            !CompareDate({
                                addedDate: durDate,
                                endDate: campaignEndDate,
                                isSelectedDateBeforeCurrentDate,
                                currentDateByTimeZone
                            })
                        ) {
                            p5 = true;
                        }  else if (type === 'days' && waitPeriod >= 3) {
                            maxDaysExceed = true;
                            // break;
                        }
                        else {
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
                        } else if (maxDaysExceed) {
                            setError('dayOrHourErr', {
                                type: `custom`,
                                message: `Only 1–2 days are allowed for non-registered actions.`,
                            });
                        } else if (p5) {
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
