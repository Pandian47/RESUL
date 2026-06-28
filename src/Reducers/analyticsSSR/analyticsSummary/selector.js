import { createSelector } from 'reselect';
export const getSummaryList = createSelector(
    (state) => state.analyticsReportSSRReducer || {},
    (state) => state.summaryReport,
);

export const getTrends = createSelector(
    (state) => state.analyticsReportSSRReducer || {},
    (state) => state.trends,
);

export const getPreBlast = createSelector(
    (state) => state.analyticsReportSSRReducer || {},
    (state) => state.preBlast,
);

export const getGeographyList = createSelector(
    (state) => state.analyticsReportSSRReducer || {},
    (state) => state.geography,
);

export const getKnownToUnknown = createSelector(
    (state) => state.analyticsReportSSRReducer || {},
    (state) => state.knownToUnknownConversion,
);

export const getBenchmarkList = createSelector(
    (state) => state.analyticsReportSSRReducer || {},
    (state) => state.benchMark,
);

export const getInsightsList = createSelector(
    (state) => state.analyticsReportSSRReducer || {},
    (state) => state.insights,
);

export const getIndustry = createSelector(
    (state) => state.analyticsReportSSRReducer || {},
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
    (state) => state.analyticsReportSSRReducer || {},
    (state) => state.retargetListStatus,
);

export const getAttributionRoi = createSelector(
    (state) => state.analyticsReportSSRReducer || {},
    (state) => state.attributionRoi,
);

export const getAttributionRoiLoading = createSelector(
    (state) => state.analyticsReportSSRReducer || {},
    (state) => state.attributionRoiLoading,
);
