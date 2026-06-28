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
const FREQUENCY_TIME = ['Week', 'Month', 'Quarter', 'Half year', 'Year'];
const FREQUENCY_AMOUNT = ['Thousand(s)', 'Million(s)', 'Billion(s)'];
const GRADE = ['A', 'B', 'C', 'D', 'E'];
const INITIAL_STATE = {
    defaultValues: {
        frequency: [{ less: '2', more: '5', score: '' }],
        purchaseWorth: [{ below: '1,000', above: '5,000', score: '' }],
        grading: [{ belove: '', above: '', score: '' }],
        recency: {},
    },
};

export const handleSegmentRule = (segmentRule) => {
    let updateValue;

    if (typeof segmentRule === 'object' && !Array.isArray(segmentRule)) {
        updateValue = Object.entries(segmentRule).flatMap(([key, value]) => {
            if (key.includes(',')) {
                const [from, to] = key.split(',');
                return {
                    from: from.trim(),
                    to: to.trim(),
                    score: value,
                };
            }
            return [];
        });
    } else if (Array.isArray(segmentRule)) {
        updateValue = segmentRule.map((rule) => ({
            from: rule?.OperatorFromKey,
            to: rule?.OperatorToKey,
            score: rule?.Score,
            isCreate: rule?.IsCreate,
        }));
    } else {
        updateValue = [];
    }

    return updateValue;
};

export const getInitialValue = (isWorth, isGrading) => {
    let initialReplaceValues;

    if (isGrading) {
        initialReplaceValues = [
            {
                from: 'Above',
                score: '',
                to: '',
                isCreate: true,
            },
            {
                from: 'Below',
                score: '',
                to: '',
                isCreate: true,
            },
        ];
    } else {
        if (!isWorth) {
            initialReplaceValues = [
                {
                    from: 'Less than',
                    score: '',
                    to: '',
                    isCreate: true,
                },
                {
                    from: 'More than',
                    score: '',
                    to: '',
                    isCreate: true,
                },
            ];
        } else {
            initialReplaceValues = [
                {
                    from: 'Below',
                    score: '',
                    to: '',
                    isCreate: true,
                },
                {
                    from: 'Above',
                    score: '',
                    to: '',
                    isCreate: true,
                },
            ];
        }
    }

    return initialReplaceValues;
};

export const handlePurchasePatternGradingTotal = (allValues, setValue) => {
    const { frequencyValues, recencyValues, worthValues } = allValues;
    if (frequencyValues?.total || recencyValues?.total || worthValues?.total) {
        const totalOtherValues =
            Number(frequencyValues?.total || 0) + Number(recencyValues?.total || 0) + Number(worthValues?.total || 0);
        setValue(`gradingValues.total`, totalOtherValues);
    } else {
        setValue(`gradingValues.total`, 0);
    }
};
export const handleProfileDataGradingTotal = (allValues, setValue) => {
    
    const { referralviralityProfile, omnipresenceProfile, networkworthProfile, dataaugmentationProfile } = allValues;
    if (
        referralviralityProfile?.Total ||
        omnipresenceProfile?.Total ||
        networkworthProfile?.Total ||
        dataaugmentationProfile?.Total
    ) {
        const totalOtherValues =
            Number(referralviralityProfile?.Total || 0) +
            Number(omnipresenceProfile?.Total || 0) +
            Number(networkworthProfile?.Total || 0) +
            Number(dataaugmentationProfile?.Total || 0);
        setValue(`gradingProfile.total`, totalOtherValues);
    } else {
        setValue(`gradingProfile.total`, 0);
    }
};

export const getErrorMessage = (isGrading, totalValues, index) => {
    let customMsg;

    if (isGrading) {
        if (index === 0 && totalValues?.length === 2) {
            customMsg = 'greater';
        } else {
            customMsg = 'lesser';
        }
    } else {
        if (index === 0) {
            customMsg = 'lesser';
        } else {
            customMsg = 'greater';
        }
    }

    const errorMsg = `Enter ${customMsg} value`;
    return errorMsg;
};
export { RECENCY, FREQUENCY_TIME, INITIAL_STATE, GRADE, FREQUENCY_AMOUNT };
