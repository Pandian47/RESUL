const pickArray = (obj, ...keys) => {
    for (const key of keys) {
        const value = obj?.[key];
        if (Array.isArray(value)) return value;
    }
    return [];
};

/** Normalize GetCampaignPlannerListSingle payload for PlannerModal. */
export const normalizePlannerDayModalEvents = (data) => {
    if (!data) {
        return { newcampaignsPlannerList: [], ongoingcampaignsPlannerList: [] };
    }
    if (Array.isArray(data)) {
        return { newcampaignsPlannerList: [], ongoingcampaignsPlannerList: data };
    }
    if (typeof data !== 'object') {
        return { newcampaignsPlannerList: [], ongoingcampaignsPlannerList: [] };
    }

    return {
        newcampaignsPlannerList: pickArray(
            data,
            'newcampaignsPlannerList',
            'NewCampaignsPlannerList',
            'newCampaignsPlannerList',
        ),
        ongoingcampaignsPlannerList: pickArray(
            data,
            'ongoingcampaignsPlannerList',
            'OngoingCampaignsPlannerList',
            'ongoingCampaignsPlannerList',
        ),
    };
};

export const isPlannerDayModalPayloadReady = (events) => {
    if (!events || typeof events !== 'object' || Array.isArray(events)) return false;
    return (
        Array.isArray(events.newcampaignsPlannerList) || Array.isArray(events.ongoingcampaignsPlannerList)
    );
};

export const shouldShowPlannerModalEmpty = ({ events, showMore, isFailure, isLoading }) => {
    if (isLoading || isFailure) return isFailure;
    if (events == null) return true;
    if (showMore) return !Array.isArray(events) || events.length === 0;
    return !isPlannerDayModalPayloadReady(events);
};
