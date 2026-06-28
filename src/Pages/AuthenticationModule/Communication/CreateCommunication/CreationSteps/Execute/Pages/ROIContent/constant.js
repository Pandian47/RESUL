import { TAB_HEADER_CONFIG } from '../../constant';
export const ROI_INITIAL_DATA = {
    defaultValues: {
        goalType: '',
        goalPercentage: '',
        reachGoalPercentage: '',
        engagementGoalPercentage: '',
        conversionGoalPercentage: '',
        listPropensityType: '',
        listPropensity: 0,
        fixedCostAmount: '',
        fixedCostValue: 0,
        Reach: '',
        Engagement: '',
        Conversion: '',
        expectedROI: 0,
        expectedReachROI: 0,
        expectedEngagementROI: 0,
        expectedConversionROI: 0,
        expectedReachROIDisplay: '',
        expectedEngagementROIDisplay: '',
        expectedConversionROIDisplay: '',
        benchmarkValue: '',
        emailRecipientCount: 0,
        smsRecipientCount: 0,
        overAllAudienceCount: 0,
        channels: [],
    },
    mode: 'onTouched'
};

export const ROI_TYPE = {
    R: 'Reach',
    E: 'Engagement',
    C: 'Conversion',
};

export const roiGoalPercentagesRoughlyEqual = (a, b) => {
    if (a === '' || a == null || b === '' || b == null) return false;
    const na = toSafeNumber(a);
    const nb = toSafeNumber(b);
    if (!Number.isFinite(na) || !Number.isFinite(nb)) return false;
    return Math.abs(na - nb) < 0.01;
};

export const goalTypeToTargetCode = (goalType) => {
    const match = Object.entries(ROI_TYPE).find(([, label]) => label === goalType);
    if (match) return match[0];
    return typeof goalType === 'string' && goalType ? goalType.charAt(0).toUpperCase() : 'R';
};

export const getGoalPercentageByTargetCode = (
    targetCode,
    { reachGoalPercentage, engagementGoalPercentage, conversionGoalPercentage } = {},
) => {
    if (targetCode === 'R') return reachGoalPercentage;
    if (targetCode === 'E') return engagementGoalPercentage;
    if (targetCode === 'C') return conversionGoalPercentage;
    return '';
};

export const formatRoiPercentageToTwoDecimals = (value) => {
    if (value === '' || value == null || (typeof value === 'string' && value.trim() === '')) return '';
    const n = Number(value);
    if (!Number.isFinite(n)) return '';
    return n.toFixed(2);
};

export const getReferenceGoalBenchmark = (primaryTargetCode, tierGoalPercentages) => {
    const raw = getGoalPercentageByTargetCode(primaryTargetCode, tierGoalPercentages);
    if (raw === '' || raw == null) return { raw: '', display: '' };
    return { raw, display: formatRoiPercentageToTwoDecimals(raw) };
};

export const shouldShowGoalBenchmarkHint = (enteredGoalPercent, referenceRaw) =>
    !!enteredGoalPercent &&
    referenceRaw !== '' &&
    referenceRaw != null &&
    !roiGoalPercentagesRoughlyEqual(enteredGoalPercent, referenceRaw);

export const resolveVariableCostFromResponse = (base) => {
    if (!base) return 0;
    if (Object.prototype.hasOwnProperty.call(base, 'variableCost') && base.variableCost !== undefined && base.variableCost !== null) {
        return base.variableCost;
    }
    if (base.totalCost !== undefined && base.totalCost !== null && String(base.totalCost) !== '') {
        return base.totalCost;
    }
    return 0;
};

export const parseExpectedRoiFromApi = (raw) => {
    if (raw == null || raw === '') return null;
    if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed) return null;
        try {
            let parsed = JSON.parse(trimmed);
            if (typeof parsed === 'string') {
                try {
                    parsed = JSON.parse(parsed);
                } catch {
                    return null;
                }
            }
            return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : null;
        } catch {
            return null;
        }
    }
    return null;
};

const coerceTierRoiFromParsed = (v) => {
    if (v === '' || v == null) return '';
    const n = Number(v);
    return Number.isFinite(n) ? n : '';
};

export const formatRoiNumericDisplay = (value) => {
    if (value === '' || value == null || (typeof value === 'string' && value.trim() === '')) return '';
    const n = Number(value);
    if (!Number.isFinite(n)) return '';
    if (Number.isInteger(n)) return String(n);
    const t = Number.parseFloat(Number(n).toPrecision(12));
    if (Number.isInteger(t)) return String(t);
    return String(t);
};

const formatRoiFieldForDisplayBind = (v) => formatRoiNumericDisplay(v);

const pickNestedExpectedRoiPayload = (base) => {
    if (!base) return null;
    if (typeof base.expectedRoi === 'object' && base.expectedRoi !== null && !Array.isArray(base.expectedRoi)) {
        return base.expectedRoi;
    }
    if (typeof base.expectedROI === 'object' && base.expectedROI !== null && !Array.isArray(base.expectedROI)) {
        return base.expectedROI;
    }
    if (typeof base.expectedRoi === 'string' && base.expectedRoi.trim().startsWith('{')) {
        return base.expectedRoi;
    }
    if (typeof base.expectedROI === 'string' && base.expectedROI.trim().startsWith('{')) {
        return base.expectedROI;
    }
    return null;
};

export const flattenNestedExpectedRoi = (base = {}) => {
    const exp = parseExpectedRoiFromApi(pickNestedExpectedRoiPayload(base));
    if (!exp) {
        return { ...base };
    }
    const code = base?.goalDetails?.primaryTargetCode || base?.primaryTargetCode || '';
    const reach = coerceTierRoiFromParsed(exp.reach ?? exp.Reach);
    const engagement = coerceTierRoiFromParsed(exp.engagement ?? exp.engagment ?? exp.Engagment);
    const conversion = coerceTierRoiFromParsed(exp.conversion ?? exp.Conversion);
    let expectedROI = base.expectedROI;
    if (typeof expectedROI === 'string' && expectedROI.trim().startsWith('{')) {
        expectedROI =
            code === 'R'
                ? reach
                : code === 'E'
                    ? engagement
                    : code === 'C'
                        ? conversion
                        : reach;
    }
    if (expectedROI === undefined || expectedROI === null || expectedROI === '') {
        if (code === 'R') expectedROI = reach;
        else if (code === 'E') expectedROI = engagement;
        else if (code === 'C') expectedROI = conversion;
    }
    return {
        ...base,
        expectedReachRoi: reach !== '' ? reach : base?.expectedReachRoi,
        expectedEngagementRoi: engagement !== '' ? engagement : base?.expectedEngagementRoi,
        expectedConversionRoi: conversion !== '' ? conversion : base?.expectedConversionRoi,
        expectedReachROI: reach !== '' ? reach : base?.expectedReachROI,
        expectedEngagementROI: engagement !== '' ? engagement : base?.expectedEngagementROI,
        expectedConversionROI: conversion !== '' ? conversion : base?.expectedConversionROI,
        expectedROI,
    };
};

export const normalizeROIResponse = (rawData) => {
    const isApiEnvelope =
        rawData &&
        typeof rawData === 'object' &&
        rawData.data &&
        typeof rawData.data === 'object' &&
        'status' in rawData &&
        !(
            Object.prototype.hasOwnProperty.call(rawData, 'campaignROIId') &&
            rawData.campaignROIId !== undefined &&
            rawData.campaignROIId !== null
        );
    const root = isApiEnvelope ? rawData.data : rawData;
    const base = flattenNestedExpectedRoi(root || {});
    const goalDetails = base?.goalDetails || {};
    const audienceCount =
        toSafeNumber(base?.overAllAudienceCount) || toSafeNumber(base?.totalAudience);
    return {
        ...base,
        primaryTargetCode: goalDetails?.primaryTargetCode || base?.primaryTargetCode || '',
        primaryTargetValue: goalDetails?.primaryTargetValue ?? base?.primaryTargetValue ?? '',
        reachGoalPercentage: goalDetails?.reachGoalPercentage ?? base?.reachGoalPercentage ?? '',
        engagementGoalPercentage: goalDetails?.engagementGoalPercentage ?? base?.engagementGoalPercentage ?? '',
        conversionGoalPercentage: goalDetails?.conversionGoalPercentage ?? base?.conversionGoalPercentage ?? '',
        campaignROIId: base?.campaignROIId || base?.campaignRoiId || 0,
        overAllAudienceCount: audienceCount,
        channels: Array.isArray(base?.channels) ? base.channels : [],
        resolvedVariableCost: resolveVariableCostFromResponse(base),
        revenueReach: base?.revenueReach,
        revenueEngagement: base?.revenueEngagement,
        revenueConversion: base?.revenueConversion,
    };
};


export const toSafeNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

export const roundRoiMoney = (value) => Number(roundRoiMoneyRaw(value).toFixed(2));

const roundRoiMoneyRaw = (value) => {
    const n = toSafeNumber(value);
    return Math.round(n * 100) / 100;
};

export const numericOrZeroOrFallback = (value, fallbackWhenUndefined) => {
    if (value === null || value === false || value === '') return 0;
    if (value === undefined) return fallbackWhenUndefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : fallbackWhenUndefined;
};

export const resolveROICost = ({ fixedCostAmount, variableCost, listPropensity }) => {
    const fixedCost = toSafeNumber(fixedCostAmount);
    const variable = toSafeNumber(variableCost);
    const propensityFallback = toSafeNumber(listPropensity);
    if (fixedCost > 0) return fixedCost;
    if (variable > 0) return variable;
    return propensityFallback;
};

export const isValidDecimalCurrencyInput = (value) => {
    if (value === '' || value == null) return false;
    const trimmed = String(value).trim();
    if (!/^\d+(\.\d+)?$/.test(trimmed)) return false;
    const n = Number(trimmed);
    return Number.isFinite(n) && n > 0;
};

export const isRevenueFieldProvided = (value) => isValidDecimalCurrencyInput(value);

export const buildRevenuePerAudienceRules = ({
    required = false,
    requiredMessage,
    invalidMessage,
}) => ({
    ...(required && requiredMessage ? { required: requiredMessage } : {}),
    validate: (value) => {
        if (value === '' || value == null || (typeof value === 'string' && value.trim() === '')) {
            return true;
        }
        return isValidDecimalCurrencyInput(value) ? true : invalidMessage;
    },
});

export const isRevenueTierNumericForBind = (value) => {
    if (value === '' || value == null) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    const n = Number(value);
    return Number.isFinite(n);
};

export const computePreserveApiExpectedRoiFlags = (normalized) => {
    const hasApiExpectedTierRoi = (tier) => {
        const v =
            tier === 'reach'
                ? normalized?.expectedReachROI ?? normalized?.expectedReachRoi
                : tier === 'engagement'
                    ? normalized?.expectedEngagementROI ?? normalized?.expectedEngagementRoi
                    : normalized?.expectedConversionROI ?? normalized?.expectedConversionRoi;
        if (v === '' || v == null) return false;
        return Number.isFinite(Number(v));
    };
    return {
        reach: !isRevenueFieldProvided(normalized?.revenueReach) && hasApiExpectedTierRoi('reach'),
        engagement:
            !isRevenueFieldProvided(normalized?.revenueEngagement) && hasApiExpectedTierRoi('engagement'),
        conversion:
            !isRevenueFieldProvided(normalized?.revenueConversion) && hasApiExpectedTierRoi('conversion'),
    };
};

export const sumAudienceFromChannels = (channels) => {
    if (!Array.isArray(channels)) return 0;
    return channels.reduce((sum, ch) => sum + toSafeNumber(ch?.audienceCount), 0);
};

export const resolveTotalAudienceCount = ({
    overAllAudienceCount,
    emailRecipientCount,
    smsRecipientCount,
    channels,
    minFallback = 0,
}) => {
    const channelAudienceSum = sumAudienceFromChannels(channels);
    let totalAudience =
        toSafeNumber(overAllAudienceCount) ||
        (toSafeNumber(emailRecipientCount) + toSafeNumber(smsRecipientCount)) ||
        channelAudienceSum;
    if (totalAudience <= 0 && minFallback > 0) {
        totalAudience = minFallback;
    }
    return totalAudience;
};

const formatGoalPercentForPopover = (value) => {
    if (value === '' || value == null || (typeof value === 'string' && value.trim() === '')) {
        return '-';
    }
    const formatted = formatRoiPercentageToTwoDecimals(value) || formatRoiNumericDisplay(value);
    return formatted ? `${formatted}%` : '-';
};

const getGoalPercentPopoverRows = ({
    goalType,
    goalPercentage,
    reachGoalPercentage,
    engagementGoalPercentage,
    conversionGoalPercentage,
}) => {
    const allTiers = [
        { key: 'reach-goal-percentage', label: 'Reach', benchmark: reachGoalPercentage, goalType: 'Reach' },
        {
            key: 'engagement-goal-percentage',
            label: 'Engagement',
            benchmark: engagementGoalPercentage,
            goalType: 'Engagement',
        },
        {
            key: 'conversion-goal-percentage',
            label: 'Conversion',
            benchmark: conversionGoalPercentage,
            goalType: 'Conversion',
        },
    ];
    return allTiers.map((tier) => {
        const value = tier.goalType === goalType ? goalPercentage : tier.benchmark;
        return {
            key: tier.key,
            text: `${tier.label} = ${formatGoalPercentForPopover(value)}`,
        };
    });
};

export const pickEffectiveGoalPercent = (tierGoalPercentage, primaryGoalPercentage) => {
    const primary = toSafeNumber(primaryGoalPercentage);
    if (tierGoalPercentage === '' || tierGoalPercentage == null) return primary;
    const tier = toSafeNumber(tierGoalPercentage);
    if (!Number.isFinite(tier) || tier <= 0) return primary;
    return tier;
};

const ROI_TIER_TO_GOAL_TYPE = {
    reach: 'Reach',
    engagement: 'Engagement',
    conversion: 'Conversion',
};

export const resolveCalculationGoalPercent = ({
    tier,
    goalType,
    goalPercentage,
    tierGoalPercentage,
}) => {
    if (ROI_TIER_TO_GOAL_TYPE[tier] === goalType) {
        if (goalPercentage !== '' && goalPercentage != null) {
            const primary = toSafeNumber(goalPercentage);
            if (Number.isFinite(primary) && primary > 0) return primary;
        }
    }
    return pickEffectiveGoalPercent(tierGoalPercentage, goalPercentage);
};

export const calculateCampaignROI = ({
    totalAudience,
    benchmarkPercentage,
    fixedCost = 0,
    variableCost = 0,
    revenuePerAudience,
    goalType = 'reach',
}) => {
    console.log('benchmarkPercentage: ', benchmarkPercentage);
    const ta = toSafeNumber(totalAudience);
    const bench = toSafeNumber(benchmarkPercentage);
    const rpa = toSafeNumber(revenuePerAudience);
    const fixed = toSafeNumber(fixedCost);
    const variable = toSafeNumber(variableCost);

    if (ta <= 0) return null;
    if (bench < 0 || bench > 100) return null;
    if (rpa < 0) return null;

    const convertedAudience = ta * (bench / 100);
    const expectedRevenue = convertedAudience * rpa;
    const actualRevenue = expectedRevenue;
    const totalCost = fixed + variable;
    const profit = expectedRevenue - totalCost;
    let roiPercentage = 0;
    if (totalCost > 0) {
        roiPercentage = Number((((expectedRevenue - totalCost) / totalCost) * 100).toFixed(2));
    }
    const normalizedGoalType =
        typeof goalType === 'string' ? goalType.replace(/\s+/g, '').toLowerCase() : 'reach';

    return {
        goalType: normalizedGoalType,
        totalAudience: ta,
        benchmarkPercentage: bench,
        convertedAudience: roundRoiMoney(convertedAudience),
        revenuePerAudience: rpa,
        fixedCost: roundRoiMoney(fixed),
        variableCost: roundRoiMoney(variable),
        totalCost: roundRoiMoney(totalCost),
        expectedRevenue: roundRoiMoney(expectedRevenue),
        actualRevenue: roundRoiMoney(actualRevenue),
        profit: roundRoiMoney(profit),
        roiPercentage,
        benchmarkAchieved: actualRevenue >= expectedRevenue,
    };
};

export const calculateExpectedROIByGoal = ({
    revenuePerAudience,
    totalAudience,
    fixedCostAmount,
    variableCost,
    goalPercentage,
}) => {
    const res = calculateCampaignROI({
        totalAudience,
        benchmarkPercentage: toSafeNumber(goalPercentage),
        fixedCost: toSafeNumber(fixedCostAmount),
        variableCost: toSafeNumber(variableCost),
        revenuePerAudience,
    });
    if (res == null) return '';
    return res.roiPercentage;
};


export const calculateExpectedROIValues = ({
    fixedCostAmount,
    emailRecipientCount,
    smsRecipientCount,
    overAllAudienceCount,
    goalPercentage,
    reachGoalPercentage,
    engagementGoalPercentage,
    conversionGoalPercentage,
    reachValue,
    engagementValue,
    conversionValue,
    goalType,
    fixedCostValue,
    channels,
}) => {
    const anyTierRevenueProvided =
        isRevenueFieldProvided(reachValue) ||
        isRevenueFieldProvided(engagementValue) ||
        isRevenueFieldProvided(conversionValue);
    if (!anyTierRevenueProvided) {
        return {
            expectedROI: '',
            expectedReachROI: '',
            expectedEngagementROI: '',
            expectedConversionROI: '',
        };
    }

    const totalAudience = resolveTotalAudienceCount({
        overAllAudienceCount,
        emailRecipientCount,
        smsRecipientCount,
        channels,
        minFallback: 1,
    });

    const expectedReachROI = isRevenueFieldProvided(reachValue)
        ? calculateExpectedROIByGoal({
              revenuePerAudience: reachValue,
              totalAudience,
              fixedCostAmount,
              variableCost: fixedCostValue,
              goalPercentage: resolveCalculationGoalPercent({
                  tier: 'reach',
                  goalType,
                  goalPercentage,
                  tierGoalPercentage: reachGoalPercentage,
              }),
          })
        : '';
    const expectedEngagementROI = isRevenueFieldProvided(engagementValue)
        ? calculateExpectedROIByGoal({
              revenuePerAudience: engagementValue,
              totalAudience,
              fixedCostAmount,
              variableCost: fixedCostValue,
              goalPercentage: resolveCalculationGoalPercent({
                  tier: 'engagement',
                  goalType,
                  goalPercentage,
                  tierGoalPercentage: engagementGoalPercentage,
              }),
          })
        : '';
    const expectedConversionROI = isRevenueFieldProvided(conversionValue)
        ? calculateExpectedROIByGoal({
              revenuePerAudience: conversionValue,
              totalAudience,
              fixedCostAmount,
              variableCost: fixedCostValue,
              goalPercentage: resolveCalculationGoalPercent({
                  tier: 'conversion',
                  goalType,
                  goalPercentage,
                  tierGoalPercentage: conversionGoalPercentage,
              }),
          })
        : '';

    const expectedROI =
        goalType === 'Reach'
            ? expectedReachROI
            : goalType === 'Engagement'
                ? expectedEngagementROI
                : goalType === 'Conversion'
                    ? expectedConversionROI
                    : 0;

    return {
        expectedROI,
        expectedReachROI,
        expectedEngagementROI,
        expectedConversionROI,
    };
};

export const getVariableCostChannels = ({ watchedChannels, roiContent }) => {
    if (Array.isArray(watchedChannels)) return watchedChannels;
    if (Array.isArray(roiContent?.[0]?.channels)) return roiContent[0].channels;
    if (Array.isArray(roiContent?.channels)) return roiContent.channels;
    return [];
};

export const getVariableCostChannelLabel = (channelId) => {
    const id = Number(channelId);
    if (!Number.isFinite(id) || id <= 0) {
        return `Channel ${channelId ?? ''}`.trim();
    }
    const label = TAB_HEADER_CONFIG[id];
    return label || `Channel ${id}`.trim();
};

export const getVariableCostPopoverRows = ({
    watchedChannels,
    roiContent,
    overAllAudienceCount,
    emailRecipientCount,
    smsRecipientCount,
    goalType,
    goalPercentage,
    reachGoalPercentage,
    engagementGoalPercentage,
    conversionGoalPercentage,
}) => {
    const channels = getVariableCostChannels({ watchedChannels, roiContent });
    const rows = [];

    const goalPercentRows = getGoalPercentPopoverRows({
        goalType,
        goalPercentage,
        reachGoalPercentage,
        engagementGoalPercentage,
        conversionGoalPercentage,
    });
    goalPercentRows.forEach((row, index) => {
        rows.push({
            ...row,
            hasDivider: index === goalPercentRows.length - 1,
        });
    });

    const totalAudience = resolveTotalAudienceCount({
        overAllAudienceCount,
        emailRecipientCount,
        smsRecipientCount,
        channels: watchedChannels,
    });

    rows.push({
        key: 'total-audience',
        text: `Total audience = ${totalAudience}`,
        hasDivider: channels.length > 0,
    });

    channels.forEach((channel, index) => {
        rows.push({
            key: `${channel?.channelId || 'channel'}-${index}`,
            text: `${getVariableCostChannelLabel(channel?.channelId)} = ${channel?.audienceCount || 0} * ${
                channel?.unitPrice || 0
            }`,
            hasDivider: index === channels.length - 1,
        });
    });

    if (channels.length) {
        rows.push({
            key: 'channel-formula',
            text: 'Channel name = (Audience count * Unit price)',
            isSmallText: true,
            hasDivider: false,
        });
    }

    return rows;
};

export const fetchDefaultValues = (data, reset) => {
    const normalizedData = normalizeROIResponse(data);
    const primaryTargetCode = normalizedData?.primaryTargetCode;
    const primaryTargetValue = normalizedData?.primaryTargetValue;
    let listprofinalvalue =
        parseInt(normalizedData?.revenueReach,10) +
        parseInt(normalizedData?.revenueEngagement,10) +
        parseInt(normalizedData?.revenueConversion,10);

    const emailAudienceFromChannels = (normalizedData?.channels || []).reduce(
        (sum, channel) => (Number(channel?.channelId) === 1 ? sum + toSafeNumber(channel?.audienceCount) : sum),
        0,
    );
    const smsAudienceFromChannels = (normalizedData?.channels || []).reduce(
        (sum, channel) => (Number(channel?.channelId) === 2 ? sum + toSafeNumber(channel?.audienceCount) : sum),
        0,
    );

    const emailRecipientCount =
        toSafeNumber(normalizedData?.recepientListCount?.emailaudiencecount) || emailAudienceFromChannels;
    const smsRecipientCount =
        toSafeNumber(normalizedData?.recepientListCount?.smsaudiencecount) || smsAudienceFromChannels;

    const NumberOfRecipientValue =
        toSafeNumber(normalizedData?.overAllAudienceCount) || (emailRecipientCount + smsRecipientCount);
    const derivedListPropensityValue =
        (parseInt(NumberOfRecipientValue,10) * listprofinalvalue) / parseInt(NumberOfRecipientValue,10);
    const finalListPropensityValue = numericOrZeroOrFallback(
        normalizedData?.listPropensityValue,
        isNaN(derivedListPropensityValue) ? 0 : derivedListPropensityValue,
    );
    const reachGoalPercentage = normalizedData?.reachGoalPercentage;
    const engagementGoalPercentage = normalizedData?.engagementGoalPercentage;
    const conversionGoalPercentage = normalizedData?.conversionGoalPercentage;

        reset({
        goalType: ROI_TYPE[primaryTargetCode],
        listPropensityType: ROI_TYPE[primaryTargetCode],
        goalPercentage:
            primaryTargetValue === '' || primaryTargetValue == null
                ? ''
                : formatRoiNumericDisplay(primaryTargetValue),
        reachGoalPercentage:
            (reachGoalPercentage === '' || reachGoalPercentage == null) && primaryTargetCode === 'R'
                ? formatRoiNumericDisplay(primaryTargetValue)
                : reachGoalPercentage === '' || reachGoalPercentage == null
                  ? ''
                  : formatRoiNumericDisplay(reachGoalPercentage),
        engagementGoalPercentage:
            (engagementGoalPercentage === '' || engagementGoalPercentage == null) &&
            primaryTargetCode === 'E'
                ? formatRoiNumericDisplay(primaryTargetValue)
                : engagementGoalPercentage === '' || engagementGoalPercentage == null
                  ? ''
                  : formatRoiNumericDisplay(engagementGoalPercentage),
        conversionGoalPercentage:
            (conversionGoalPercentage === '' || conversionGoalPercentage == null) &&
            primaryTargetCode === 'C'
                ? formatRoiNumericDisplay(primaryTargetValue)
                : conversionGoalPercentage === '' || conversionGoalPercentage == null
                  ? ''
                  : formatRoiNumericDisplay(conversionGoalPercentage),
        fixedCostAmount:
            normalizedData?.setupCost === undefined ||
            normalizedData?.setupCost === null ||
            normalizedData?.setupCost === ''
                ? ''
                : formatRoiNumericDisplay(normalizedData.setupCost),
        fixedCostValue: (() => {
            const v =
                normalizedData?.resolvedVariableCost ??
                normalizedData?.variableCost ??
                normalizedData?.totalCost;
            if (v === undefined || v === null || v === '') return '';
            return formatRoiNumericDisplay(v);
        })(),
        Reach: isRevenueFieldProvided(normalizedData?.revenueReach)
            ? formatRoiNumericDisplay(normalizedData.revenueReach)
            : '',
        Engagement: isRevenueFieldProvided(normalizedData?.revenueEngagement)
            ? formatRoiNumericDisplay(normalizedData.revenueEngagement)
            : '',
        Conversion: isRevenueFieldProvided(normalizedData?.revenueConversion)
            ? formatRoiNumericDisplay(normalizedData.revenueConversion)
            : '',
        emailRecipientCount: formatRoiNumericDisplay(emailRecipientCount),
        smsRecipientCount: formatRoiNumericDisplay(smsRecipientCount),
        overAllAudienceCount: formatRoiNumericDisplay(NumberOfRecipientValue),
        expectedROI: numericOrZeroOrFallback(normalizedData?.expectedROI, 0),
        expectedReachROI: numericOrZeroOrFallback(
            normalizedData?.expectedReachROI ?? normalizedData?.expectedReachRoi,
            0,
        ),
        expectedEngagementROI: numericOrZeroOrFallback(
            normalizedData?.expectedEngagementROI ?? normalizedData?.expectedEngagementRoi,
            0,
        ),
        expectedConversionROI: numericOrZeroOrFallback(
            normalizedData?.expectedConversionROI ?? normalizedData?.expectedConversionRoi,
            0,
        ),
        expectedReachROIDisplay: formatRoiFieldForDisplayBind(
            normalizedData?.expectedReachROI ?? normalizedData?.expectedReachRoi,
        ),
        expectedEngagementROIDisplay: formatRoiFieldForDisplayBind(
            normalizedData?.expectedEngagementROI ?? normalizedData?.expectedEngagementRoi,
        ),
        expectedConversionROIDisplay: formatRoiFieldForDisplayBind(
            normalizedData?.expectedConversionROI ?? normalizedData?.expectedConversionRoi,
        ),
        campaignROIId: normalizedData?.campaignROIId,
        listPropensity: formatRoiNumericDisplay(isNaN(finalListPropensityValue) ? 0 : finalListPropensityValue),
        channels: normalizedData?.channels || [],
    });
};

export const formatRoiPayloadValue = (value) => {
    if (value === '' || value == null) return '';
    if (typeof value === 'string' && value.trim() === '') return '';
    const n = Number(value);
    if (!Number.isFinite(n)) return '';
    return Number(n.toFixed(2));
};

export const bildPayload = (data, benchmarkVal, common) => {
    let { campaignId, ...rest } = common;
    return {
        ...rest,
        campaignRois: [
            {
                blastCost: 0.0,
                campaignId,
                campaignRoiId: data?.campaignROIId,
                expectedRoi: JSON.stringify({
                    reach: formatRoiPayloadValue(data?.expectedReachROI),
                    engagement: formatRoiPayloadValue(data?.expectedEngagementROI),
                    conversion: formatRoiPayloadValue(data?.expectedConversionROI),
                }),
                primaryTargetCode: data?.goalType[0],
                primaryTargetValue: data?.goalPercentage,
                setupCost: Number(data?.fixedCostAmount),
                benchmarkValue: Number(benchmarkVal) || 0,
                reach: Number(data?.Reach),
                conversion: Number(data?.Conversion),
                engagement: Number(data?.Engagement),
                listPropensityValue: data?.listPropensity || 0,
            },
        ],
    };
};