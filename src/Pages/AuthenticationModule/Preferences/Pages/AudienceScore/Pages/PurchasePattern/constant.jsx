import { formatName } from 'Utils/modules/formatters';

const RECENCY = [
    {
        id: 1,
        name: 'recency_1_to_3_days',
        lable: '1 to 3 days',
    },
    {
        id: 2,
        name: 'week',
        lable: 'More than a week',
    },
    {
        id: 3,
        name: 'month',
        lable: 'More than a month',
    },

    {
        id: 4,
        name: 'quarter',
        lable: 'More than a quarter',
    },
    {
        id: 5,
        name: 'more_6_months',
        lable: 'More than 6 months',
    },
];
const FREQUENCY_TIME = ['Week', 'Month', 'Quarter', 'Half year'];
const FREQUENCY_TIME_PURCHASE_PATTERN = ['Week', 'Month', 'Quarter', 'Half year', 'Year'];
const GRADE = ['A', 'B', 'C', 'D', 'E'];
const INITIAL_STATE = {
    defaultValues: {
        frequency: [{ less: '3', more: '5', score: '10' }],
        purchaseWorth: [{ less: '1,000', more: '5,000', score: '20' }],
        grading: [{ belove: '', above: '', score: '' }],
        recency: {
            recency_1_to_3_days: '20',
            week: '10',
            month: '15',
            quarter: '5',
            more_6_months: '10',
        },
        frequencyLessThanScore: '5',
        frequencyMoreThanScore: '20',
        purchasePriseBelow: '1,000',
        purchasePriseAbove: '5,000',
        purchasePriseBelowScore: '10',
        purchasePriseAboveScore: '30',
        gradingScores: {
            Above: 'A',
            ScoreOne: 'B',
            ScoreTwo: 'C',
            Below: 'D',
        },
        gradingValue: {
            Above: '50',
            FromOne: '40',
            ToOne: '30',
            FromTwo: '20',
            ToTwo: '10',
            Below: '10',
        },
        recencyTotal: '60',
        recencyFlag: false,
        frequencyTotal: '35',
        purchaseWorthTotal: '45',
        frequencybetweenData: {
            lessValue: '2',
            moreValue: '5',
            lessScore: '10',
            moreScore: '20',
        },
        purchaseWorthbetweenData: {
            lessValue: '1,000',
            moreValue: '5,000',
            lessScore: '15',
            moreScore: '30',
        },
    },
    mode: 'onTouched',
};
export { RECENCY, FREQUENCY_TIME, INITIAL_STATE, GRADE, FREQUENCY_TIME_PURCHASE_PATTERN };

export const customArray = (count) => {
    let result = [];

    for (let i = 1; i <= count; i++) {
        result.push(i);
    }

    return result;
};

export const purchaseRecencyLimitCount = customArray(10);
export const recencyDurationData = ['Less than', 'More than'];
export const purchaseRecencyDuration = ['Day(s)', 'Week(s)', 'Month(s)', 'Quarter(s)', 'Half year', 'Year(s)'];
export const worthLimit = ['Thousand(s)', 'Million(s)', 'Billion(s)'];

export const sortDataByFromTo = (data, isGrading) => {
    const lessThanItems = data.filter((item) => item?.from?.toLowerCase()?.includes(isGrading ? 'below' : 'less'));
    const moreThanItems = data.filter((item) => item?.from?.toLowerCase()?.includes(isGrading ? 'above' : 'more'));
    let remainingItems;
    if (!isGrading) {
        remainingItems = data.filter(
            (item) => !item.from?.toLowerCase()?.includes('less') && !item?.from?.toLowerCase()?.includes('more'),
        );
    } else {
        remainingItems = data.filter(
            (item) => !item.from?.toLowerCase()?.includes('below') && !item?.from?.toLowerCase()?.includes('above'),
        );
    }

    remainingItems.sort((a, b) => {
        const fromA = parseFloat(a.from);
        const fromB = parseFloat(b.from);
        const toA = parseFloat(a.to);
        const toB = parseFloat(b.to);

        if (fromA !== fromB) return !isGrading ? fromA - fromB : fromB - fromA;
        return !isGrading ? toA - toB : toB - toA;
    });
    return !isGrading
        ? [...lessThanItems, ...remainingItems, ...moreThanItems]
        : [...moreThanItems, ...remainingItems, ...lessThanItems];
};

const getUpdatePayloadData = (apiData, currdata, userId, formState, isSave) => {
    const { fieldName, currFromStateData, id } = currdata;
    const filterPurchaseData = apiData?.filter(
        (item) => formatName(item.patternSegmentKey) === formatName(handleSegementName(fieldName)),
    );
    let finalData = [];

    const updateCurrentValue = !currFromStateData?.length
        ? []
        : currFromStateData?.map((curr) => ({
              OperatorFromKey: curr.from,
              OperatorToKey: curr.to,
              Score: curr.score ?? 0,
              Time:
                  fieldName === 'recency'
                      ? curr?.duration || ''
                      : fieldName === 'grading'
                      ? ''
                      : currFromStateData?.duration || '',
              Cvalue: '',
              IsCreate: curr.isCreate ?? false,
          }));

    finalData = filterPurchaseData?.map((purchase) => {
        return {
            ...purchase,
            patternSegmentRule: formState[`${fieldName}ToggleValue`] ? updateCurrentValue : [],
            patternSegmentScore: currFromStateData?.total ?? 0,
            periodRange: fieldName === 'frequency' || fieldName === 'worth' ? currFromStateData.duration ?? '' : '',
            modifiedBy: userId,
            modifiedDate: new Date()?.getTime(),
        };
    });

    return finalData[0];
};

const getSavePayloadData = (currAllVal, currentUserDetail, formState) => {
    // console.log('currAllVal: ', currAllVal);
    const { currFromStateData, fieldName, id } = currAllVal;
    const { userId, departmentId, clientId } = currentUserDetail;

    const updateCurrentValue = !currFromStateData?.length
        ? []
        : currFromStateData?.map((curr) => ({
              OperatorFromKey: curr.from || '',
              OperatorToKey: curr.to || '',
              Score: curr.score || 0,
              Time: id === 22 ? curr.duration || '' : id === 25 ? '' : currFromStateData?.duration || '',
              Cvalue: '',
              IsCreate: curr.isCreate ?? false,
          }));

    return {
        businessTypeId: 2,
        businessUnitId: departmentId,
        clientId: clientId,
        createdBy: userId,
        createdDate: new Date()?.getTime(),
        isSwitchOverall: 1,
        modifiedBy: 0,
        modifiedDate: 0,
        patternSegment: handleSegementName(fieldName),
        patternSegmentRule: formState[`${fieldName}ToggleValue`] ? updateCurrentValue : [],
        patternSegmentScore: currFromStateData?.total || 0,
        periodRange: id === 23 || id === 24 ? currFromStateData?.duration || '' : '',
        purchasePatternId: 0,
        tenantId: 0,
        purchaseSegementName: handleSegementName(fieldName),
    };
};

export const buildPayloadPurchasePattern = (apidata, formState, currentUserDetail, isSave) => {
    const { userId } = currentUserDetail;
    const { frequencyValues, gradingValues, recencyValues, worthValues } = formState;

    const currentallValue = [
        {
            currFromStateData: recencyValues,
            id: 22,
            fieldName: 'recency',
        },
        {
            currFromStateData: frequencyValues,
            id: 23,
            fieldName: 'frequency',
        },
        {
            currFromStateData: worthValues,
            id: 24,
            fieldName: 'worth',
        },
        {
            currFromStateData: gradingValues,
            id: 25,
            fieldName: 'grading',
        },
    ];
    let finalPayloadData = [];
    currentallValue?.map((currAllVal) => {
        if (isSave) {
            const currPayloadData = getSavePayloadData(currAllVal, currentUserDetail, formState);
            finalPayloadData.push(currPayloadData);
        } else {
            const currPayloadData = getUpdatePayloadData(apidata, currAllVal, userId, formState, isSave);
            finalPayloadData.push(currPayloadData);
        }
    });
    return {
        purchasePatternData: finalPayloadData,
    };
    // console.log('finalPayloadData: ', finalPayloadData);
};

const handleSegementName = (name) => {
    let modifiedName = name.toLowerCase()?.trim();
    let finalName;
    switch (modifiedName) {
        case 'recency':
            return (finalName = 'Recency');
        case 'frequency':
            return (finalName = 'Purchase frequency');
        case 'worth':
            return (finalName = 'Purchase worth');
        case 'grading':
            return (finalName = 'Grading');
        default:
            return (finalName = '');
    }
};
