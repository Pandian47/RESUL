import { COMMUNICATION_RECOMMENDATIONS, COMMUNICATION_SUMMARY_TWINS, GET_ATTRIBUTION_FOR_ROI_TWINS, GET_BENCHMARK_TWINS, GET_COMMUNICATION_PRE_BLAST_TWINS, GET_COMMUNICATION_TRENDS_TWINS, GET_CSR_PDFDOWNLOAD, GET_DEMOGRAPHICS_TWINS, GET_GEOGRAPHY_TWINS, GET_KNOWN_AND_UNKNOWN, GET_RETARGETLIST_STATUS_TWINS, GET_SEGMENT_INDUSTRY_TWINS, GET_SHOWLINK_TWINS, GET_SNAP_DETAILS_TWINS, GET_SNAP_NAME_LIST_TWINS, GET_TOP_DEVICES_TWINS, NEW_CONTACT_LIST_TWINS, SAVE_SNAPSHOTS_TWINS, SET_GOLDEN_CAMPAIGN_TWINS, UNKNOWN_TO_KNOWN_CONVERSION_TWINS } from 'Constants/EndPoints';
import request from 'Utils/Http';
import { parseAnalyticsJson, parseAnalyticsJsonArray } from 'Pages/AuthenticationModule/Analytics/analyticsDefaults';

import { map as _map } from 'Utils/modules/lodashReplacements';

import { updateTopDevice, updateSummaryReport, updateTrendsReport, updateKnownToUnknown, updatePreblast, updateGeography, updateBenchMark, updateIndustry, updatePDFDownload, updateSummaryLoading, updateNewContactLoading, updateTopDeviceLoading, updateTrendsLoading, updateRetargetListStatus, updateRetargetListLoading, updateSnapshotList, updateListingPreviewImage, updateAttributionRoiLoading, updateAttributionRoi } from './reducer';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';

export const getCommunicationSummary =
    ({ payload }) =>
        async (dispatch) => {
            dispatch(updateSummaryLoading(true));
            return dispatch(
                request.post({
                    url: COMMUNICATION_SUMMARY_TWINS,
                    payload,
                    loading: true,
                    ok: ({ data }) => {
                        const { data: res, status } = data;
                        if (status) {
                            dispatch(updateSummaryReport(res));
                        }
                        else {
                            dispatch(updateSummaryReport({}));
                        }
                        dispatch(updateSummaryLoading(false));
                    },
                    fail: (err) => {
                        dispatch(updateSummaryReport({}));
                        dispatch(updateSummaryLoading(false));
                    },
                }),
            );
        };

export const getCommunicationSummaryPDF =
    ({ payload }) =>
        async (dispatch) =>
            dispatch(
                request.post({
                    url: GET_CSR_PDFDOWNLOAD,
                    payload,
                    loading: true,
                    ok: ({ data }) => {
                        const { data: res, status } = data;
                        if (status) {
                            dispatch(updatePDFDownload(res));
                        } else {
                            dispatch(updatePDFDownload([]));
                        }
                    },
                    fail: (err) => {},
                }),
            );
export const getAttributionForRoi =
    ({ payload }) =>
    (dispatch) => {
        dispatch(updateAttributionRoiLoading(true));
        return dispatch(
            request.post({
                url: GET_ATTRIBUTION_FOR_ROI_TWINS,
                payload,
                loading: false,
                ok: ({ data }) => {
                    const { data: apiRes, status } = data || {};
                    if (status && apiRes) {
                        dispatch(updateAttributionRoi(apiRes));
                    } else {
                        dispatch(updateAttributionRoi(null));
                    }
                    dispatch(updateAttributionRoiLoading(false));
                },
                fail: (err) => {
                    if (err) void 0;
                    dispatch(updateAttributionRoi(null));
                    dispatch(updateAttributionRoiLoading(false));
                },
            }),
        );
    };
export const getTopDeviceInfo =
    ({ payload }) =>
        async (dispatch) => {
            dispatch(updateTopDeviceLoading(true));
            return dispatch(
                request.post({
                    url: GET_TOP_DEVICES_TWINS,
                    payload,
                    loading: false,
                    isReturn: true,
                    ok: (res) => {
                        const {
                            data: { data, status },
                        } = res;
                        if (status) {
                            dispatch(updateTopDevice(data));
                        }
                        dispatch(updateTopDeviceLoading(false));
                    },
                    fail: (err) => {
                        dispatch(updateTopDeviceLoading(false));
                    },
                }),
            );
        };

export const getBenchmark = (payload) => async (dispatch) => {
    dispatch(updateBenchMark({loading: true}));
    dispatch(
        request.post({
            url: GET_BENCHMARK_TWINS,
            payload,
            //loading: true,
            ok: ({ data }) => {
                const { data: res, status } = data;
                if (status) {
                    if (res === "") {
                        dispatch(updateBenchMark({}));
                    } else {
                        let resp = parseAnalyticsJson(res, {});
                        if (payload.benchmark === 1) {
                            resp.chartType.legend = {
                                enabled: false,
                            };
                        }
                        resp.loading = false;
                        dispatch(updateBenchMark(resp));
                    }
                }
                else {
                    dispatch(updateBenchMark({loading: false}));
                }
            },
            fail: (err) => {
                dispatch(updateBenchMark({loading: false}));
            },
        })
    );
};

export const getCommunicationPreblast =
    ({ payload }) =>
        async (dispatch) =>
            dispatch(
                request.post({
                    url: GET_COMMUNICATION_PRE_BLAST_TWINS,
                    payload,
                    loading: false,
                    ok: ({ data }) => {
                        const { data: res, status } = data;
                        if (status) {
                            dispatch(updatePreblast(res));
                        }
                    },
                    fail: (err) => {},
                }),
            );

export const handleChart = (channel, key) => {
    let finalData = [];

    if (key === 'line') {
        finalData = _map(eval(channel.data), (val) => val[1]);
    } else if (key === 'column') {
        finalData = parseAnalyticsJsonArray(channel?.data, []);
    } else {
        finalData = _map(eval(channel.data), (val) => (Array.isArray(val) ? val[1] : val));
    }
    return finalData;
};

export const getCommunicationTrends =
    ({ payload, key, chartType }) =>
    async (dispatch) => {
        dispatch(updateTrendsLoading(true));
        return dispatch(
            request.post({
                url: GET_COMMUNICATION_TRENDS_TWINS,
                payload,
                loading: false,
                ok: ({ data }) => {
                    const { status } = data;
                    if (status) {
                        const { categories, series } = data;
                        let dt = '';
                        let dateValues;
                        if (key === 'line') {
                            const dateData = _map(series, (time) => {
                                return eval(time.data);
                            });
                            dateValues = dateData
                                .flat()
                                .map((pair) => pair[0])
                                .filter((value) => value);
                        }
                        if (key === 'radar') {
                            dispatch(
                                updateTrendsReport({
                                    payload: {
                                        categories,
                                        series: _map(series, (channel) => ({
                                            ...channel,
                                            name: channel.name,
                                        })),
                                    },
                                    key,
                                }),
                            );
                        } else {
                        let tmpCategories =
                            key === 'line'
                                ? _map(dateValues, (date) => {
                                      //   const md = getMMMDD(date);
                                    //   const md = getDateWithDDMMM(date);
                                      const md = getUserCurrentFormat(date,{isOffset:true})?.utcformat;
                                      if (dt !== md) {
                                          dt = md;
                                          return md;
                                      }
                                    //   return getUserDateTimeFormat(new Date(date), 'time');
                                      return getUserCurrentFormat(date,{isOffset:true})?.utcformat;

                                  })
                                : (() => {
                                    const dateUtcMatches = categories?.match(/Date\.UTC\([^)]+\)/g);
                                    const categoryDates = dateUtcMatches?.map(dateStr => eval(dateStr)) || [];
                                    return _map(categoryDates, (date) => getUserCurrentFormat(date,{noConversion:true})?.dateFormat);
                                })();

                            const payload = {
                                categories: tmpCategories,
                                series: _map(series, (channel) => ({
                                    ...channel,
                                    data: handleChart(channel, key),
                                    name: channel.name,
                                })),
                            };
                            
                        dispatch(updateTrendsReport({ payload, key }));
                        }
                    } else {
                        dispatch(updateTrendsReport({ payload: [], key }));
                    }
                    dispatch(updateTrendsLoading(false));
                },
                fail: (err) => {
                    dispatch(updateTrendsReport({ payload: [], key }));
                    dispatch(updateTrendsLoading(false));
                },
            }),
        );
    };

export const getGeography =
    ({ payload }) =>
        async (dispatch) =>
            dispatch(
                request.post({
                    url: GET_GEOGRAPHY_TWINS,
                    payload,
                    // loading: true,
                    ok: ({ data }) => {
                        const { data: res, status } = data;
                        if (status) {
                            const payload = {
                                list: res.csrOverviewGeographyLists,
                                lastJobTime: res.jobDateTime,
                            };
                            dispatch(updateGeography(payload));
                        }else{
                            dispatch(updateGeography({}));
                        }
                    },
                    fail: (err) => {},
                }),
            );

export const getDemoGraphics =
    ({ payload }) =>
        async (dispatch) =>
            dispatch(
                request.post({
                    url: GET_DEMOGRAPHICS_TWINS,
                    payload,
                    // loading: true,
                    ok: ({ data }) => {
                        const { data: res, status } = data;
                        if (status) {
                            dispatch(updateIndustry(res));
                        }
                    },
                    fail: (err) => {},
                }),
            );
export const GetRetargetListStatus =
    ({ payload }) =>
        async (dispatch) => {
            dispatch(updateRetargetListLoading(true));
            return dispatch(
                request.post({
                    url: GET_RETARGETLIST_STATUS_TWINS,
                    payload,
                    loading: false,
                    ok: ({ data }) => {
                        const { data: res, status } = data;
                        if (status) {
                            dispatch(updateRetargetListStatus(res));
                        }else{
                            dispatch(updateRetargetListStatus([]));
                        }
                        dispatch(updateRetargetListLoading(false));
                    },
                    fail: (err) => {
                        dispatch(updateRetargetListLoading(false));
                    },
                }),
            );
        };

export const getSegmentIndustry =
    ({ payload }) =>
        async (dispatch) =>
            dispatch(
                request.post({
                    url: GET_SEGMENT_INDUSTRY_TWINS,
                    payload,
                    // loading: true,
                    ok: ({ data }) => {
                        const { data: res, status } = data;
                        if (status) {
                            dispatch(updateIndustry(res));
                        }
                    },
                    fail: (err) => {},
                }),
            );

export const getGoldenCampaign =
    ({ payload }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: SET_GOLDEN_CAMPAIGN_TWINS,
                    payload,
                    // loading: true,
                    ok: () => { },
                    fail: (err) => {},
                }),
            );
        };

export const getNewContactList =
    ({ payload }) =>
        async (dispatch) => {
            dispatch(updateNewContactLoading(true));
            return dispatch(
                request.post({
                    url: NEW_CONTACT_LIST_TWINS,
                    payload,
                    // loading: true,
                    ok: () => { },
                    fail: (err) => {},
                    final: () => {
                        dispatch(updateNewContactLoading(false));
                    },
                }),
            );
        };

export const getKnownToUnknownConversion =
    ({ payload }) =>
        async (dispatch) =>
            dispatch(
                request.post({
                    url: UNKNOWN_TO_KNOWN_CONVERSION_TWINS,
                    payload,
                    // loading: true,
                    ok: ({ data }) => {
                        const { data: res, status } = data;
                        if (status) {
                            dispatch(updateKnownToUnknown(res));
                        }else{
                            dispatch(updateKnownToUnknown([]));
                        }
                    },
                    fail: (err) => {},
                }),
            );

export const getConversionByChannel =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_KNOWN_AND_UNKNOWN,
                payload,
                loading: false,
                isReturn: true,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    if (status && res) {
                        return res;
                    }
                    return null;
                },
                fail: (err) => {
                    return null;
                },
            }),
        );

// export const getCommunicationInsights =
//     ({ payload }) =>
//         async (dispatch) => {
//             dispatch(updateInsightsLoading(true));
//             return dispatch(
//                 request.post({
//                     url: COMMUNICATION_RECOMMENDATIONS,
//                     payload,
//                     loading: false,
//                     ok: ({ data }) => {
//                         const { data: res, status } = data;
//                         if (status) {
//                             dispatch(updateInsights(res));
//                         } else {
//                             dispatch(updateInsights([]));
//                         }
//                         dispatch(updateInsightsLoading(false));
//                     },
//                     fail: (err) => {
//                         console.error(err);
//                         dispatch(updateInsights([]));
//                         dispatch(updateInsightsLoading(false));
//                     },
//                 }),
//             );
//         };


export const getshowLink =
    ({ payload, loading = false }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: GET_SHOWLINK_TWINS,
                    payload,
                    loading,
                }),
            );
        };

export const getSnapNameList =
    ({ payload , loading = false}) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: GET_SNAP_NAME_LIST_TWINS,
                    payload,
                    loading: loading,
                    ok: ({ data }) => {
                        const { data: res, status } = data;
                        if (status && Array.isArray(res)) {
                            dispatch(updateSnapshotList(res));
                        } else {
                            dispatch(updateSnapshotList([]));
                        }
                    },
                    fail: (err) => {
                        dispatch(updateSnapshotList([]));
                    },
                }),
            );
        };

export const saveSnapshots =
    ({ payload }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: SAVE_SNAPSHOTS_TWINS,
                    payload,
                    loading: false,
                    ok: ({ data }) => {
                    },
                    fail: (err) => {
                    },
                }),
            );
        };

export const getSnapDetails =
    ({ payload }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: GET_SNAP_DETAILS_TWINS,
                    payload,
                    loading: true,
                    isFailureCheck: true,
                    ok: ({ data }) => {
                                                const { status, data: responseData } = data;
                        
                        if (status) {
                            // const responseData = STATIC_SNAPSHOT_DATA;
                            try {
                                // Parse the JSON string from data field
                                const parsedData = responseData;
                                // const parsedData = responseData;
                                
                                const buildTrendsPayloadFromApiResponse = (apiData, key) => {
                                    if (!apiData || typeof apiData !== 'object') return [];
                                    const { categoriesData: categories, seriesData } = apiData;
                                    const series = JSON.parse(seriesData || '[]');
                                    if (!series || !Array.isArray(series)) return [];
        
                                    let dt = '';
                                    let dateValues;
                                    if (key === 'line') {
                                        const dateData = _map(series, (time) => {
                                            try {
                                                return eval(time.data);
                                            } catch (_) {
                                                return [];
                                            }
                                        });
                                        dateValues = dateData
                                            .flat()
                                            .map((pair) => pair?.[0])
                                            .filter((value) => value);
                                    }
        
                                    if (key === 'radar') {
                                        return {
                                            categories,
                                            series: _map(series, (channel) => ({
                                                ...channel,
                                                name: channel.name,
                                            })),
                                        };
                                    }

                                    const tmpCategories =
                                        key === 'line'
                                            ? _map(dateValues, (date) => {
                                                    const md = getUserCurrentFormat(date, { isOffset: true })?.utcformat;
                                                    if (dt !== md) {
                                                        dt = md;
                                                        return md;
                                                    }
                                                    return getUserCurrentFormat(date, { isOffset: true })?.utcformat;
                                                })
                                            : (() => {
                                                    if (!categories || typeof categories !== 'string') return [];
                                                    const dateUtcMatches = categories?.match(/Date\.UTC\([^)]+\)/g);
                                                    const categoryDates =
                                                        dateUtcMatches?.map((dateStr) => {
                                                            try {
                                                                return eval(dateStr);
                                                            } catch (_) {
                                                                return null;
                                                            }
                                                        }) || [];
                                                    return _map(categoryDates, (date) =>
                                                        date ? getUserCurrentFormat(date)?.dateFormat : date,
                                                    );
                                                })();
        
                                    return {
                                        categories: tmpCategories,
                                        series: _map(series, (channel) => ({
                                            ...channel,
                                            data: handleChart(channel, key),
                                            name: channel.name,
                                        })),
                                    };
                                };
                                
                                // Dispatch CommunicationSummaryReport with isFromSnapshot flag and snapshot meta
                                if (parsedData.communicationSummaryReport) {
                                    dispatch(
                                        updateSummaryReport({
                                            ...parsedData.communicationSummaryReport,
                                            isFromSnapshot: true,
                                            snapshotName: payload?.snapshotName,
                                            snapshotDate: payload?.createdDate,
                                            snapMetaData: responseData?.metaData || null,
                                        }),
                                    );
                                } else {
                                    dispatch(updateSummaryReport({}));
                                }
                                
                                // Dispatch PreBlast data
                                if (parsedData.getCommunicationPreBlast) {
                                    dispatch(updatePreblast(parsedData.getCommunicationPreBlast));
                                }
                                
                                // Dispatch Geography data
                                if (parsedData.getGeography) {
                                    const geoPayload = {
                                        list: parsedData.getGeography.csrOverviewGeographyLists,
                                        lastJobTime: parsedData.getGeography.jobDateTime,
                                    };
                                    dispatch(updateGeography(geoPayload));
                                }
                                
                                // Dispatch TopDevice data
                                if (parsedData.getTopDevice) {
                                    // Handle both string and object formats
                                    if (typeof parsedData.getTopDevice === 'string') {
                                        dispatch(updateTopDevice({ 
                                            topDeviceName: parsedData.getTopDevice, 
                                            topDeviceValue: '' 
                                        }));
                                    } else {
                                        dispatch(updateTopDevice(parsedData.getTopDevice));
                                    }
                                }
                                
                                // Dispatch Benchmark data
                                if (parsedData.getBenchmark) {
                                    dispatch(updateBenchMark(parsedData.getBenchmark));
                                }
                                
                                // Dispatch Trends data if available (same reducer path as getCommunicationTrends)
                                if (parsedData.getCommunicationTrends !== undefined && parsedData.getCommunicationTrends !== null) {
                                    let trendsRaw = parsedData.getCommunicationTrends;
        
                                    // API may return empty string when no data
                                    if (typeof trendsRaw === 'string') {
                                        if (trendsRaw.trim() === '') {
                                            dispatch(updateTrendsReport({ payload: [], key: 'line' }));
                                            dispatch(updateTrendsReport({ payload: [], key: 'column' }));
                                            dispatch(updateTrendsReport({ payload: [], key: 'radar' }));
                                        } else {
                                            try {
                                                trendsRaw = JSON.parse(trendsRaw);
                                            } catch (e) {
                                            }
                                        }
                                    }
        
                                    if (trendsRaw && typeof trendsRaw === 'object') {
                                        const possibleKeys = ['line', 'column'];
                                        const hasKeyedPayload = possibleKeys.some((k) => parsedData?.metaData?.chartType);
                                        
                                        if (hasKeyedPayload) {
                                            possibleKeys.forEach((k) => {
                                                const built = buildTrendsPayloadFromApiResponse(trendsRaw, parsedData?.metaData?.chartType);
                                                dispatch(updateTrendsReport({ payload: built, key: parsedData?.metaData?.chartType }));
                                            });
                                        } else if (trendsRaw?.categoriesData && trendsRaw?.seriesData) {
                                            const built = buildTrendsPayloadFromApiResponse(trendsRaw, 'line');
                                            dispatch(updateTrendsReport({ payload: built, key: 'line' }));
                                        }
                                    }
                                }

                                // Dispatch listing preview image data (used by CommunicationAnalysisTable)
                                if (parsedData.getListingPreviewImage !== undefined && parsedData.getListingPreviewImage !== null) {
                                    dispatch(updateListingPreviewImage(parsedData.getListingPreviewImage));
                                }

                            } catch (error) {
                            }
                        }
                        
                        return data;
                    },
                    fail: (err) => {
                    },
                }),
            );
        };