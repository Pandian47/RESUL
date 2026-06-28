import { createSelector } from 'reselect';
export const getSummaryList = createSelector(
    (state) => state.analyticsReportReducer,
    (state) => state.summaryReport,
);

export const getTrends = createSelector(
    (state) => state.analyticsReportReducer,
    (state) => state.trends,
);

export const getPreBlast = createSelector(
    (state) => state.analyticsReportReducer,
    (state) => state.preBlast,
);

export const getGeographyList = createSelector(
    (state) => state.analyticsReportReducer,
    (state) => state.geography,
);

export const getKnownToUnknown = createSelector(
    (state) => state.analyticsReportReducer,
    (state) => state.knownToUnknownConversion,
);

export const getBenchmarkList = createSelector(
    (state) => state.analyticsReportReducer,
    (state) => state.benchMark,
);

export const getInsightsList = createSelector(
    (state) => state.analyticsReportReducer,
    (state) => state.insights,
);

export const getIndustry = createSelector(
    (state) => state.analyticsReportReducer,
    (state) => state.industryData,
);

export const getIndustrySegmentTopGraphChart = createSelector(
    getIndustry,
    (industry) => {
        const segmentData = industry?.segmentTopGraphDataJson || [];
        return segmentData.map((res) => ({
            name: res.name,
            y: res.value,
            z: res.value,
        }));
    },
);

export const getIndustryTopGraphChart = createSelector(
    getIndustry,
    (industry) => {
        const industryData = industry?.industryTopGraphDataJson || [];
        return industryData.map((res) => ({
            name: res.name,
            y: res.doubleValue,
            z: res.doubleValue,
        }));
    },
);

export const getRetargetListStatus = createSelector(
    (state) => state.analyticsReportReducer,
    (state) => state.retargetListStatus,
);

export const getAttributionRoi = createSelector(
    (state) => state.analyticsReportReducer,
    (state) => state.attributionRoi,
);

export const getAttributionRoiLoading = createSelector(
    (state) => state.analyticsReportReducer,
    (state) => state.attributionRoiLoading,
);
