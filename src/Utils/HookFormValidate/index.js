import { COMMUNICATION_NAME, MIN_LENGTH, NAME_CREATION } from 'Constants/GlobalConstant/Regex';
import { MINLENGTH, PARAMETER_ALREADY_EXISTS, SPECIAL_CHATACTERS_NOT_ALlOWED } from 'Constants/GlobalConstant/ValidationMessage';

export const channelTypeValidator = ({ name, getValues, index, error }) => {
    const channelLength = getValues(name)?.filter((e) => e.selected === true);
    // const findIndex = _findIndex(getValues(name), (item) => item.selected === true);
    // return findIndex === -1 ? error : true;
    return channelLength?.length > 0 ? true : error;
};

export const analyticsTypeValidator = ({ name, getValues, index, primaryGoal, secondaryGoal, error }) => {
    const isNotificationSelected = getValues('channelTypes')[2]?.selected;
    const analyticsTypes = getValues(name);
    const isConversion = primaryGoal === 'Conversion' || secondaryGoal === 'Conversion';
    // Offline store purchase
    const findIndex = getValues(name).findIndex((item) => item.selected === true);

    // return result ? result : errorMessage;
    // return (findIndex === -1 && index === 0) ||
    //     (isNotificationSelected &&
    //         ((analyticsTypes[0].selected === false && index === 0) ||
    //             (analyticsTypes[1].selected === false && index === 1)))
    //     ? error
    //     : true;
    // return findIndex === -1 ||
    //     (analyticsTypes[0].selected === false && !isNotificationSelected && index === 0) ||
    //     (isNotificationSelected && analyticsTypes[0].selected === false && analyticsTypes[1].selected === false)
    //     ? error
    //     : true;

    // return (isConversion && analyticsTypes[0].selected === false && index === 0 && !isNotificationSelected) ||
    //     (isNotificationSelected &&
    //         analyticsTypes[0].selected === false &&
    //         analyticsTypes[1].selected === false &&
    //         index === 0)
    //     ? error
    //     : true;
    return isNotificationSelected &&
        analyticsTypes[0].selected === false &&
        analyticsTypes[1].selected === false &&
        index === 0
        ? error
        : true;
};
export const communicationNamevalidtor = (data) => {
    if (data.trim()?.length < MIN_LENGTH) {
        return MINLENGTH;
    }
    else if (COMMUNICATION_NAME.test(data)) {
        return SPECIAL_CHATACTERS_NOT_ALlOWED;
    };
    // COMMUNICATION_NAME.test(data) ? SPECIAL_CHATACTERS_NOT_ALlOWED : data.trim()?.length < MIN_LENGTH ? MINLENGTH : true: true;
}
export const senderNameValidator = (name, selectedSenderName) => {
    if (!name) return 'Sender name is required';

    // Extract bracketed text [[...]]
    const match = name.match(/\[\[.*?\]\]/g)?.[0] ?? '';
    const defaultSenderName = selectedSenderName?.match(/\[\[.*?\]\]/g)?.[0] ?? '';

 
    if (selectedSenderName) {
        // Ensure length of bracketed content is unchanged
        if (match && match?.length !== defaultSenderName?.length) {
            return 'Only change fallback value';
        } 
           // Ensure there are no extra characters outside the expected pattern
    const validFormat = /^\[\[.*?\]\] \| \[\[.*?\]\]$/.test(name);
    if (!validFormat && match) {
        return 'Enter only text inside brackets';
    }

    } else {
        // Ensure valid format when no sender is selected
        if (!NAME_CREATION.test(name)) {
            return 'Enter a valid sender name';
        }
    }

    return true;
};

export const audienceListValidator = (audience, knownAudienceFlag) => {
    let findALList = 0,
        findSLList = 0,
        findAutoList = 0,
        findTLList = 0;
    //Seperating the audience based on start text
    audience.forEach((list) => {
        if (list.recipientsBunchName.toLowerCase().startsWith('al_')) findALList++;
        else if (list.recipientsBunchName.toLowerCase().startsWith('sl_')) findSLList++;
        else if (list.recipientsBunchName.toLowerCase().startsWith('auto_')) findAutoList++;
        else if (list.recipientsBunchName.toLowerCase().startsWith('tl')) findTLList++;
    });
    let adhoclist = 0,
        seedList = 0,
        targetList = 0,
        matchList = 0,
        supressionList = 0;
    audience.forEach((list) => {
        if (list.listType === 1) adhoclist++;
        else if (list.listType === 2) matchList++;
        else if (list.listType === 3) seedList++;
        else if (list.listType === 4) supressionList++;
        else if (list.listType === 5) targetList++;
    });
    // const findKnownIndex = _findIndex(
    //     audience,
    //     (aud) =>
    //         aud.recipientsBunchName.includes('All Audience (Known and Identified)') ||
    //         aud.recipientsBunchName.includes('Known Audience'),
    // );
    const findKnownIndex = audience.findIndex((aud) => [-1, -2].includes(aud.segmentationListId));
    //Throwing Error based on the below condition
    if (knownAudienceFlag && findKnownIndex !== -1 && audience?.length > 1) {
        return 'Cannot add all or known list with other lists';
    }
    if (audience?.length > 5) {
        return 'More than 5 lists are not allowed';
    }
    if (adhoclist > 1) {
        // return 'Cannot add adhoc list with other lists';
        return 'Cannot have more than on Ad-Hoc lists';
    } else if (adhoclist > 0 && targetList > 0) {
        return 'Cannot add adhoc list with other lists';
    } else if (adhoclist > 0 && seedList > 0) {
        return 'Cannot add adhoc list with other lists';
    } else if (adhoclist > 0 && matchList > 0) {
        return 'Cannot add adhoc list with other lists';
    } else if (adhoclist > 0 && supressionList > 0) {
        return 'Cannot add adhoc list with other lists';
    } else if (adhoclist > 1 && seedList > 0 && (targetList > 0 || supressionList > 0 || matchList > 0)) {
        return 'Cannot add adhoc list with other lists';
    } else if (adhoclist > 0 && seedList > 0 && (targetList > 0 || supressionList > 0 || matchList > 0)) {
        return 'Cannot have more than one adhoc list or seedlist';
    } else if (matchList > 0 && seedList > 0 && (targetList > 0 || supressionList > 0 || adhoclist > 0)) {
        return 'Cannot have more than one match list or seedlist';
    } else if (supressionList > 0 && seedList > 0 && (targetList > 0 || matchList > 0 || adhoclist > 0)) {
        return 'Cannot have more than one supression list or seedlist';
    } else if (targetList > 0 && seedList > 0 && (supressionList > 0 || matchList > 0 || adhoclist > 0)) {
        return 'Cannot have more than one seedlist';
    }
    // else if (findALList > 1) {
    //     return 'Cannot accept more than one adhoc list';
    // } else if (findAutoList > 1) {
    //     return 'Cannot accept more than one auto cluster list';
    // } else if (findALList > 0 && findSLList > 0) {
    //     return 'Audience cannot have both AL and SL List ';
    // } else if (findALList > 0 && findAutoList > 0) {
    //     return 'Audience cannot have both AL and SL List ';
    // } else if (findALList > 0 && findTLList > 0) {
    //     return 'Audience cannot have both AL and SL List ';
    // }
    else return true;
};

export const smartLinkDuplicateTagValidator = (paramState, value, index) => {
    const temp = {};
    let attributeNameList = [];
    
    // for (const param of paramState) {
    //     const { tags, isUTMParameterInput, customValue } = param;
    //     if (isUTMParameterInput && customValue) {
    //         attributeNameList = [...attributeNameList, customValue];
    //     } else if (!isUTMParameterInput && tags?.attributeName) {
    //         attributeNameList = [...attributeNameList, tags?.attributeName];
    //     }
    // }

    // if (value?.attributeName) {
    //     let count = attributeNameList.reduce((acc, cur) => {
    //         if (cur === value?.attributeName) acc++;
    //         return acc;
    //     }, 0);
    //     return count > 1 ? PARAMETER_ALREADY_EXISTS : true;
    // } else {
    //     let count = attributeNameList.reduce((acc, cur) => {
    //         if (cur === value) acc++;
    //         return acc;
    //     }, 0);
    //     return count > 1 ? PARAMETER_ALREADY_EXISTS : true;
    // }

    const seen = new Set();
    let paramIndex;
    const hasDuplicates = paramState.some((item, pindex) => {
        paramIndex = pindex;
        if (seen.has(item?.tags?.attributeName)) {
            return true; // Duplicate found
        } else {
            seen.add(item?.tags?.attributeName);
            return false;
        }
    });
        if (hasDuplicates && index === paramIndex) {
        return PARAMETER_ALREADY_EXISTS;
    }

    return true;

    // for (const param of paramState) {
    //     const { tags, isUTMParameterInput, customValue } = param;
    //     if (isUTMParameterInput) {
    //         if (temp[customValue]) return PARAMETER_ALREADY_EXISTS;
    //         else temp[customValue] = 1;
    //     } else {
    //         if (temp[tags?.attributeName]) return PARAMETER_ALREADY_EXISTS;
    //         else temp[tags?.attributeName] = 1;
    //     }
    // }
    // const [status] = findDuplicates(paramState, 'tags.fallbackAttributeName');
    // return status ? PARAMETER_ALREADY_EXISTS : true;
};

export const numberOfDaysValidtorSplitAB = (value, error, type = { id: 1 }, days = 180) => {
    const hourError = `Hours must between 8 to 23`;
    const requiredError = 'Enter the valid duration';
    let minutes = parseFloat(Number(value) / 1440);
    let hours = parseFloat(Number(value) / 24);
    if (Number(value) === 0) return requiredError;
    if (type?.id === 1 || type === null || type?.id === undefined) {
        return value < 8 || value > 23 ? hourError : true;
    } else if (type?.id === 2) {
        return hours > days ? error : true;
    } else return Number(value) > days ? error : true;
};

export const numberOfDaysValidtor = (value, error, type = { id: 1 }, days = 180) => {
    let minutes = parseFloat(Number(value) / 1440);
    let hours = parseFloat(Number(value) / 24);
    if (type?.id === 1) {
        return minutes > days ? error : true;
    } else if (type?.id === 2) {
        return hours > days ? error : true;
    } else return Number(value) > days ? error : true;
};
export const numberOfDaysValidtorMayBeLater = (value, id) => {
    if (id === 1) {
        return value > 60 ? 'Enter values from 1 to 60' : value < 1 ? 'Enter values greater than 0' : true;
    } else if (id === 2) {
        return value > 4 ? 'Enter values from 1 to 4' : value < 1 ? 'Enter values greater than 0' : true;
    }
};
export const numberOfDaysValidtorMobilePush = (value, error, type = { id: 1 }, startDate, endDate, days = 180) => {
        let minutes = parseFloat(Number(value) / 1440);
    let hours = parseFloat(Number(value) / 24);

    if (type?.id === 2) {
        if (!value || value < 1) {
            return 'Value must be > 0';
        } else if (value > 24) {
            return `Value must be ≤ 24`;
        } else {
            return true;
        }
    } else if (type?.id === 3) {
        if (!value || value < 1) {
            return 'Value must be > 0';
        } else if (value > 28) {
            return `Value must be ≤ 28`;
        }
        // else if (addDaysToDate(new Date(), value) > new Date(endDate)) {
        //     return `Entered values doesn't exceed end date`;
        // }
        else {
            return true;
        }
    } else if (type?.id === 1) {
        if (!value || value < 1) {
            return 'Enter a value greater than 0';
        } else if (value > 59) {
            return `Enter values from 1 to 59`;
        } else {
            return true;
        }
    }

    // if (type?.id === 1) {
    //     return minutes > days ? error : true;
    // } else if (type?.id === 2) {
    //     return hours > days ? error : true;
    // } else return Number(value) > days ? error : true;
};
export const audienceScoreCompareValidator = (value, index, name, getValues, checkLess) => {
    let [prevVal, startingVal, nextVal, finalVal, prevLess, nextMore] = getValues([
        `${name}[${index - 1}].more`,
        `${name}betweenData.lessValue`,
        `${name}[${index}].more`,
        `${name}betweenData.moreValue`,
        `${name}[${index}].less`,
        `${name}[${index + 1}].less`,
    ]);

    prevVal = Number(prevVal);
    startingVal = Number(startingVal);
    nextVal = Number(nextVal);
    finalVal = Number(finalVal);
    prevLess = Number(prevLess);
    nextMore = Number(nextMore);
    value = Number(value);

    if (checkLess) {
        if ((prevVal || startingVal) >= value) return `Should be greater than ${prevVal || startingVal}`;
        else if ((nextVal || finalVal) <= value) return `Should be less than ${nextVal || finalVal}`;
    } else {
        if ((prevLess || startingVal) >= value) return `Should be greater than ${prevLess || startingVal}`;
        else if ((nextMore || finalVal) <= value) return `Should be less than ${nextMore || finalVal}`;
    }
    return true;
};

export const audienceScoreCompareCardTotalScoreValidation = (name, getValues, value) => {
    const [less, more] = getValues([`${name}betweenData.lessScore`, `${name}betweenData.moreScore`]);
    let total = Object.values(getValues(name)).reduce((a, b) => Number(a) + Number(b.score), 0);
    total = total + Number(less || 0) + Number(more || 0);
    if (total > 100) {
        return 'Score should not be greater than ' + (value ? 100 - (total - Number(value)) : '100');
    }
    return true;
};

export const audienceScoreCommonCardTotalScoreValidation = (name, getValues, value) => {
    let total = Object.values(getValues(name)).reduce((a, b) => Number(a) + Number(b), 0);
    if (total > 100) {
        return 'Score should not be greater than ' + (100 - (total - Number(value)));
    }
    return true;
};

export const isSorted = (arr) => arr.every((v, i, a) => !i || a[i - 1] <= v);

export const audienceScorevalidateScoreGrade = (_, getValues) => {
    const grades = getValues('gradingScores');
    if (grades) {
        const valuesArray = Object.values(grades);
        let hasDuplicates = false;
        valuesArray.forEach((value, index) => {
            if (valuesArray.indexOf(value) !== index) hasDuplicates = true;
        });
        if (hasDuplicates) return 'Its duplicate';
        if (!isSorted(valuesArray)) return 'Should be in ascending order';
    }
    return true;
};

export const audienceScorevalidateScoreGradeRange = (value, getValues, field) => {
    value = Number(value);
    let gradings = getValues('gradingValue');
    Object.keys(gradings).forEach((key) => {
        gradings[key] = Number(gradings[key]);
    });
    switch (field) {
        case 'FromOne':
            if (gradings.Above <= value || value <= gradings.ToOne)
                return 'Should between ' + gradings.Above + ' and ' + gradings.ToOne;
            break;
        case 'ToOne':
            if (gradings.FromOne <= value || value <= gradings.FromTwo)
                return 'Should between ' + gradings.FromOne + ' and ' + gradings.FromTwo;
            break;
        case 'FromTwo':
            if (gradings.ToOne <= value || value <= gradings.ToTwo)
                return 'Should between ' + gradings.ToOne + ' and ' + gradings.ToTwo;
            break;
        case 'ToTwo':
            if (gradings.FromTwo <= value || value <= gradings.Below)
                return 'Should between ' + gradings.FromTwo + ' and ' + gradings.Below;
            break;
        default:
            break;
    }
    return true;
};

export const IsValidURL = (url) => {
    const regex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/.*)?$/i;

    try {
        let newUrl = new URL(url);
        let origin = newUrl.origin;
        let rslt = regex.test(origin);

        if (!rslt) {
            return 'Enter a valid  URL';
        }
    } catch (e) {
        return 'Enter a valid  URL';
    }
    try {
        const parsedUrl = new URL(url);
        const validProtocols = ['https:'];
        if (!validProtocols.includes(parsedUrl.protocol)) {
            return 'Enter a valid  URL';
        } else {
            return true;
        }
    } catch (e) {
        return 'Enter a valid  URL';
    }
};
