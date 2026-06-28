import { daysCount } from 'Constants/Charts/commonFunction';
import { ch_color1, ch_email, ch_mobile_push, ch_others, ch_sms, ch_web_push, segmentIndustryPiePalette } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { GET_ALL_DASHBOARD_DATA, GET_ATTRIBUTE_VALUES, GET_AUDIENCE_BEHAVIOUR_DATA, GET_AVG_TIME_DATA, GET_CHANNEL_PERFORMACE, GET_LEADS_CHANGE_DATA, GET_RECENT_CAMPAIGNS, GET_ROI_DATA, GET_SEGMENTS_DATA, GET_TOP_EARNING_DATA, GET_TOP_PERFORMANCES_DATA } from 'Constants/EndPoints';
import { email_mini, mobile_notification_mini, mobile_sms_mini, qrcode_mini, social_facebook_mini, web_notification_mini } from 'Constants/GlobalConstant/Glyphicons';
import request from 'Utils/Http';

import { get_dashboard_data } from './dashboardReducer';
export const getRecentCampaigns =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(
            get_dashboard_data({
                field: 'recentCampaigns',
                data: { groupedCampaigns: [], isLoading: true, isFailure: false },
            }),
        );

        return dispatch(
            request.post({
                url: GET_RECENT_CAMPAIGNS,
                payload,
                loading: false,
                ok: ({ data }) => {
                    const { status, data: response } = data;
                    if (status) {
                        var recentCampaign;
                        const campaignData = payload.mode === 1 ? 'recentCampaigns' : 'recentCompletedCampaigns';
                        recentCampaign = response[campaignData]?.reduce((res, el, i) => {
                            if (i % 3 === 0) {
                                res[res.length] = [el];
                            } else {
                                res[res.length - 1] = [...res[res.length - 1], el];
                            }
                            return res;
                        }, []);
                        dispatch(
                            get_dashboard_data({
                                field: 'recentCampaigns',
                                data: { groupedCampaigns: recentCampaign, isLoading: false, isFailure: false },
                            }),
                        );
                    } else {
                        dispatch(
                            get_dashboard_data({
                                field: 'recentCampaigns',
                                data: { groupedCampaigns: [], isLoading: false, isFailure: true },
                            }),
                        );
                    }
                },
                fail: (err) => {
                                        dispatch(
                        get_dashboard_data({
                            field: 'recentCampaigns',
                            data: { groupedCampaigns: [], isLoading: false, isFailure: true },
                        }),
                    );
                },
            }),
        );
    };

export const getROIData =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(get_dashboard_data({ field: 'roiData', data: { data: {}, isLoading: true, isFailure: false } }));
        return dispatch(
            request.post({
                url: GET_ROI_DATA,
                payload,
                loading: false,
                ok: ({ data }) => {
                    if (data.status) {
                        let roiObj = {
                            xAxis: {
                                title: '',
                                // tickInterval: 4
                            },
                            yAxis: {
                                title: ' ',
                            },
                            // categories: daysCount(30),
                            categories: [
                                'Jan',
                                'Feb',
                                'Mar',
                                'Apr',
                                'May',
                                'Jun',
                                'Jul',
                                'Aug',
                                'Sep',
                                'Oct',
                                'Nov',
                                'Dec',
                            ],
                            series: [
                                {
                                    name: 'Communications',
                                    data: [],
                                    color: ch_color1,
                                },
                            ],
                        };
                        let temp = [];
                        for (var i = 0; i < data?.data?.roiData.length; i++) {
                            temp.push(Number(data?.data?.roiData[i].yAxis));
                        }

                        roiObj = {
                            ...roiObj,
                            series: [
                                {
                                    name: 'Communications',
                                    data: temp,
                                    color: ch_color1,
                                },
                            ],
                        };
                        if (data?.data?.roiData.length) {
                            dispatch(
                                get_dashboard_data({
                                    field: 'roiData',
                                    data: { data: roiObj, isLoading: false, isFailure: false },
                                }),
                            );
                        } else {
                            dispatch(
                                get_dashboard_data({
                                    field: 'roiData',
                                    data: { data: {}, isLoading: false, isFailure: false },
                                }),
                            );
                        }
                    } else {
                        dispatch(
                            get_dashboard_data({
                                field: 'roiData',
                                data: { data: {}, isLoading: false, isFailure: true },
                            }),
                        );
                    }
                },
                fail: (err) => {
                    dispatch(
                        get_dashboard_data({ field: 'roiData', data: { data: {}, isLoading: false, isFailure: true } }),
                    );
                },
            }),
        );
    };

export const getChannelPerformanceData =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(
            get_dashboard_data({ field: 'channelPerformance', data: { data: {}, isLoading: true, isFailure: false } }),
        );

        return dispatch(
            request.post({
                url: GET_CHANNEL_PERFORMACE,
                payload,
                loading: false,
                ok: ({ data }) => {
                    if (data?.status) {
                        let channelData = {
                            categories: data?.data?.categories,
                            xAxis: {
                                title: '',
                            },
                            yAxis: {
                                title: '',
                            },
                            tooltip: {
                                shared: true,
                            },
                            pointWidth: 20,
                            series: [],
                        };
                        let temp = [];
                        //let colorsData = [ch_email, ch_sms, ch_mobile_push, ch_web_push];
                        for (var i = 0; i < data?.data?.series.length; i++) {
                            temp.push({
                                name: data?.data?.series[i].name,
                                //color: colorsData[i],
                                data: data?.data?.series[i].data,
                            });
                        }
                        channelData = {
                            ...channelData,
                            series: temp,
                        };
                        if(data?.data?.series.length > 0){
                            dispatch(
                                get_dashboard_data({
                                    field: 'channelPerformance',
                                    data: { data: channelData, isLoading: false, isFailure: false },
                                }),
                            );
                        } else {
                            dispatch(
                                get_dashboard_data({
                                    field: 'channelPerformance',
                                    data: { data: {}, isLoading: false, isFailure: true },
                                }),
                            );
                        }
                    } else {
                        dispatch(
                            get_dashboard_data({
                                field: 'channelPerformance',
                                data: { data: {}, isLoading: false, isFailure: true },
                            }),
                        );
                    }
                },
                fail: (err) =>
                    dispatch(
                        get_dashboard_data({
                            field: 'channelPerformance',
                            data: { data: {}, isLoading: false, isFailure: true },
                        }),
                    ),
            }),
        );
    };
// export const getSegmentIndustry =
//     ({ payload }) =>
//     async (dispatch) => {
//         dispatch(
//             get_dashboard_data({ field: 'segmentindustry', data: { data: {}, isLoading: true, isFailure: false } }),
//         );

//         return dispatch(
//             request.post({
//                 url: GET_SEGMENTS_DATA,
//                 payload,
//                 loading: false,
//                 ok: ({ data }) => {
//                     if (data?.status) {
//                         let colorsData = [
//                             ch_sms,
//                             ch_email,
//                             ch_mobile_push,
//                             ch_web_push,
//                             ch_others,
//                         ];

//                         let temp = {
//                             name: 'Segments',
//                             dataLabels: true,
//                             series: [],
//                         };

//                         for (let i = 0; i < data?.data?.segmentIndustry.length; i++) {
//                             temp.series.push({
//                                 name: data?.data?.segmentIndustry[i].name,
//                                 color: colorsData[i % colorsData.length],
//                                 y: data?.data?.segmentIndustry[i].value,
//                                 z: data?.data?.segmentIndustry[i].value,
//                             });
//                         }

//                         dispatch(
//                             get_dashboard_data({
//                                 field: 'segmentindustry',
//                                 data: { data: temp, isLoading: false, isFailure: false },
//                             }),
//                         );
//                     } else {
//                         dispatch(
//                             get_dashboard_data({
//                                 field: 'segmentindustry',
//                                 data: { data: [], isLoading: false, isFailure: true },
//                             }),
//                         );
//                     }
//                 },
//                 fail: (err) =>
//                     dispatch(
//                         get_dashboard_data({
//                             field: 'segmentindustry',
//                             data: { data: {}, isLoading: false, isFailure: true },
//                         }),
//                     ),
//             }),
//         );
//     };
export const getSegmentIndustry =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(
            get_dashboard_data({ field: 'segmentindustry', data: { data: {}, isLoading: true, isFailure: false } }),
        );

        return dispatch(
            request.post({
                url: GET_ATTRIBUTE_VALUES,
                payload,
                loading: false,
                ok: ({ data }) => {
                    if (data?.status) {
                        const colorsData = segmentIndustryPiePalette;

                        let temp = {
                            name: payload?.attributeName === 'Industry_s' ? 'Industry' : 'Segments',
                            dataLabels: true,
                            series: [],
                        };

                        const parsedData = JSON.parse(data?.data);
                        const segmentIndustryData = typeof parsedData === 'string' ? JSON.parse(parsedData) : parsedData;
                        for (let i = 0; i < segmentIndustryData?.length; i++) {
                            temp.series.push({
                                name: segmentIndustryData[i].name,
                                color: colorsData[i % colorsData.length],
                                y: parseInt(segmentIndustryData[i].value),
                                z: parseInt(segmentIndustryData[i].value),
                            });
                        }

                        dispatch(
                            get_dashboard_data({
                                field: 'segmentindustry',
                                data: { data: temp, isLoading: false, isFailure: false },
                            }),
                        );
                    } else {
                        dispatch(
                            get_dashboard_data({
                                field: 'segmentindustry',
                                data: { data: [], isLoading: false, isFailure: true },
                            }),
                        );
                    }
                },
                fail: (err) =>
                    dispatch(
                        get_dashboard_data({
                            field: 'segmentindustry',
                            data: { data: {}, isLoading: false, isFailure: true },
                        }),
                    ),
            }),
        );
    };
export const getAudeinceBehaviourData =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(
            get_dashboard_data({ field: 'audienceBehaviour', data: { data: {}, isLoading: true, isFailure: false } }),
        );

        return dispatch(
            request.post({
                url: GET_AUDIENCE_BEHAVIOUR_DATA,
                payload,
                loading: false,
                ok: ({ data }) => {
                    if (data?.status) {
                        if (payload.part === 1) {
                            let series = [
                               { name: 'Thursday', value: data?.data?.customersPropensity.thursdayRange },
                                { name: 'Wednesday', value: data?.data?.customersPropensity.wednesdayRange },
                                { name: 'Tuesday', value: data?.data?.customersPropensity.tuesdayRange },
                                { name: 'Monday', value: data?.data?.customersPropensity.mondayRange },
                                { name: 'Saturday', value: data?.data?.customersPropensity.saturdayRange },
                                { name: 'Sunday', value: data?.data?.customersPropensity.sundayRange },
                                { name: 'Friday', value: data?.data?.customersPropensity.fridayRange },
                            ];
                            dispatch(
                                get_dashboard_data({
                                    field: 'audienceBehaviour',
                                    data: { data: { series }, isLoading: false, isFailure: false },
                                }),
                            );
                        } else {
                            let series = [
                                { name: 'Afternoon', value: data?.data?.customersPropensity.afternoon },
                                { name: 'Early morning', value: data?.data?.customersPropensity.earlyMorning },
                                { name: 'Evening', value: data?.data?.customersPropensity.evening },
                                { name: 'Morning', value: data?.data?.customersPropensity.morning },
                                { name: 'Night', value: data?.data?.customersPropensity.night },
                            ];
                            dispatch(
                                get_dashboard_data({
                                    field: 'audienceBehaviour',
                                    data: { data: { series }, isLoading: false, isFailure: false },
                                }),
                            );
                        }
                    } else {
                        dispatch(
                            get_dashboard_data({
                                field: 'audienceBehaviour',
                                data: { data: {}, isLoading: false, isFailure: true },
                            }),
                        );
                    }
                },
                fail: (err) => {
                    dispatch(
                        get_dashboard_data({
                            field: 'audienceBehaviour',
                            data: { data: {}, isLoading: false, isFailure: true },
                        }),
                    );
                },
            }),
        );
    };

export const getTopPerformancesData =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(
            get_dashboard_data({ field: 'topPerformances', data: { data: {}, isLoading: true, isFailure: false } }),
        );

        return dispatch(
            request.post({
                url: GET_TOP_PERFORMANCES_DATA,
                payload,
                loading: false,
                ok: ({ data }) => {
                    if (data?.status) {
                        const campaigns = data?.data?.performanceCampaigns;
                        if (Array.isArray(campaigns)) {
                            const range = payload.mode === 1 ? 'high' : 'low';
                            for (let i = 0; i < campaigns.length; i++) {
                                campaigns[i].range = range;
                            }
                        }
                        dispatch(
                            get_dashboard_data({
                                field: 'topPerformances',
                                data: { data: campaigns ?? [], isLoading: false, isFailure: false },
                            }),
                        );
                    } else {
                        dispatch(
                            get_dashboard_data({
                                field: 'topPerformances',
                                data: { data: [], isLoading: false, isFailure: true },
                            }),
                        );
                    }
                },
                fail: (err) => {
                    dispatch(
                        get_dashboard_data({
                            field: 'topPerformances',
                            data: { data: [], isLoading: false, isFailure: true },
                        }),
                    );
                },
            }),
        );
    };

export const getTopEarningData =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(get_dashboard_data({ field: 'topEarnings', data: { data: [], isLoading: true, isFailure: false } }));

        return dispatch(
            request.post({
                url: GET_TOP_EARNING_DATA,
                payload,
                loading: false,
                ok: ({ data }) => {
                    if (data?.status) {
                        dispatch(
                            get_dashboard_data({
                                field: 'topEarnings',
                                data: {
                                    data:
                                        payload.mode === 1
                                            ? data?.data?.topEarningCommnications
                                            : data?.data?.lowEarningCommnications,
                                    isLoading: false,
                                    isFailure: false,
                                },
                            }),
                        );
                    } else {
                        dispatch(
                            get_dashboard_data({
                                field: 'topEarnings',
                                data: { data: [], isLoading: false, isFailure: true },
                            }),
                        );
                    }
                },
                fail: (err) => {
                    dispatch(
                        get_dashboard_data({
                            field: 'topEarnings',
                            data: { data: [], isLoading: false, isFailure: true },
                        }),
                    );
                },
            }),
        );
    };

export const getAvgTimeData =
    ({ payload }) =>
    async (dispatch) => {
        // dispatch(
        //     setAvgTime({
        //         data: [],
        //         isFailure: false,
        //         isLoading: true,
        //     }),
        // );
        dispatch(get_dashboard_data({ field: 'avgTimeData', data: { data: [], isLoading: true, isFailure: false } }));

        return dispatch(
            request.post({
                url: GET_AVG_TIME_DATA,
                payload,
                loading: false,
                ok: ({ data }) => {
                    if (data?.status) {
                        let colorsData = [ch_sms, ch_email, ch_mobile_push, ch_web_push];
                        let iconsData = [mobile_sms_mini, email_mini, web_notification_mini];
                        let series = [
                            {
                                name: 'Sample',
                                showInLegend: false,
                                borderWidth: 2,
                                size: '100%',
                                height: '100%',
                                innerSize: '45%',
                                data: [],
                                shadow: false,
                                dataLabels: { enabled: true },

                                states: {
                                    inactive: {
                                        opacity: 1,
                                    },
                                    hover: {
                                        enabled: false,
                                    },
                                },
                            },
                            {
                                name: 'Name',
                                showInLegend: false,
                                borderWidth: 0,
                                size: '49%',
                                innerSize: '88%',
                                data: [],
                                shadow: false,
                                dataLabels: { enabled: false },
                                states: {
                                    inactive: {
                                        opacity: 1,
                                    },
                                    hover: {
                                        enabled: false,
                                    },
                                },
                            },
                        ];
                        let avgData = {
                            chart: {
                                type: 'pie',
                                // width: 295,
                            },
                            title: {
                                useHTML: true,
                                text: '<div class="clock-arrow">&nbsp;</div>',
                                verticalAlign: 'middle',
                                floating: true,
                                //y: 5
                            },
                            credits: {
                                enabled: false,
                            },
                            plotOptions: {
                                series: {
                                    dataLabels: {
                                        useHTML: true,
                                        enabled: true,
                                        distance: -35,
                                        formatter: function () {
                                            let email =
                                                this.point.icon === mobile_notification_mini
                                                    ? 'mobile-notification'
                                                    : this.point.icon === mobile_sms_mini
                                                    ? 'mobile-sms'
                                                    : this.point.icon === email_mini
                                                    ? 'email'
                                                    : this.point.icon === web_notification_mini
                                                    ? 'web-notification'
                                                    : this.point.icon === social_facebook_mini
                                                    ? 'facebook'
                                                    : this.point.icon === qrcode_mini
                                                    ? 'mobile-qrcode'
                                                    : '';
                                            return (
                                                '<div class="pitChartIcon position-relative' +
                                                ' ' +
                                                email +
                                                '"><i class=' +
                                                this.point.icon +
                                                ' icon-md"></i><span>' +
                                                this.point.y +
                                                'min</span></div>'
                                            );
                                        },
                                        color: 'white',
                                    },
                                },
                            },
                            tooltip: {
                                enabled: false,
                            },
                            series: [],
                        };
                        let result = [];

                        const avgTimeData = data?.data?.avgTimeConversionModel || data?.data || [];
                        for (var i = 0; i < avgTimeData.length; i++) {
                            let temp = {
                                name: avgTimeData[i].name,
                                color: colorsData[i % colorsData.length],
                                y: Math.round(avgTimeData[i].dataValue / 60000),
                                icon: iconsData[i % iconsData.length],
                            };
                             // series[0].data.push(temp);
                            // temp.icon = iconsData[i];
                            // series[1].data.push(temp);
                            result.push(temp);
                            // avgData.push(temp);
                        }
                        avgData.series = [...series];
                        // console.log('Data in req ::: ', result);
                        dispatch(
                            get_dashboard_data({
                                field: 'avgTimeData',
                                data: { data: result, isLoading: false, isFailure: false },
                            }),
                        );

                        // setAvgTimeData(data?.data?.avgTimeConversionModel);
                    } else
                        dispatch(
                            get_dashboard_data({
                                field: 'avgTimeData',
                                data: { data: [], isLoading: false, isFailure: true },
                            }),
                        );
                },
                fail: (err) => {
                    dispatch(
                        get_dashboard_data({
                            field: 'avgTimeData',
                            data: { data: [], isLoading: false, isFailure: true },
                        }),
                    );
                },
            }),
        );
    };

export const getLeadsChangeData =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(get_dashboard_data({ field: 'leadsData', data: { data: [], isLoading: true, isFailure: false } }));

        return dispatch(
            request.post({
                url: GET_LEADS_CHANGE_DATA,
                payload,
                loading: false,
                ok: ({ data }) => {
                    if (data?.status) {
                        let colorsData = [ch_sms, ch_email, ch_mobile_push, ch_web_push];
                        let temp = {
                            name: 'Leads generated',
                            dataLabels: true,
                            // icon: true,
                            series: [],
                        };

                        for (var i = 0; i < data?.data?.leadsSource.length; i++) {
                            temp.series.push({
                                name: data?.data?.leadsSource[i].chanelImage,
                                color: colorsData[i],
                                y: data?.data?.leadsSource[i].PercentageScore,
                                z: data?.data?.leadsSource[i].percentageScore,
                            });
                        }
                        dispatch(
                            get_dashboard_data({
                                field: 'leadsData',
                                data: { data: temp, isLoading: false, isFailure: false },
                            }),
                        );
                    } else {
                        dispatch(
                            get_dashboard_data({
                                field: 'leadsData',
                                data: { data: [], isLoading: false, isFailure: true },
                            }),
                        );
                    }
                },
                fail: (err) => {
                    dispatch(
                        get_dashboard_data({
                            field: 'leadsData',
                            data: { data: [], isLoading: false, isFailure: true },
                        }),
                    );
                },
            }),
        );
    };
export const getAllDashboardData =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(get_dashboard_data({ field: 'recentCampaigns', data: { groupedCampaigns: [], isLoading: true, isFailure: false } }));
        dispatch(get_dashboard_data({ field: 'roiData', data: { data: {}, isLoading: true, isFailure: false } }));
        dispatch(get_dashboard_data({ field: 'channelPerformance', data: { data: {}, isLoading: true, isFailure: false } }));
        dispatch(get_dashboard_data({ field: 'audienceBehaviour', data: { data: {}, isLoading: true, isFailure: false } }));
        dispatch(get_dashboard_data({ field: 'topPerformances', data: { data: {}, isLoading: true, isFailure: false } }));
        dispatch(get_dashboard_data({ field: 'topEarnings', data: { data: [], isLoading: true, isFailure: false } }));
        dispatch(get_dashboard_data({ field: 'avgTimeData', data: { data: [], isLoading: true, isFailure: false } }));
        dispatch(get_dashboard_data({ field: 'leadsData', data: { data: [], isLoading: true, isFailure: false } }));

        return dispatch(
            request.post({
                url: GET_ALL_DASHBOARD_DATA,
                payload,
                loading: false,
                ok: ({ data }) => {
                                        try {
                        if (data?.status) {
                            const response = data?.data;
                            
                        // Process Recent Campaigns
                        if (response?.recentCampaigns && response?.recentCampaigns.length > 0) {
                            const recentCampaign = response?.recentCampaigns?.reduce((res, el, i) => {
                                if (i % 3 === 0) {
                                    res[res.length] = [el];
                                } else {
                                    res[res.length - 1] = [...res[res.length - 1], el];
                                }
                                return res;
                            }, []);
                            dispatch(
                                get_dashboard_data({
                                    field: 'recentCampaigns',
                                    data: { groupedCampaigns: recentCampaign, isLoading: false, isFailure: false },
                                }),
                            );
                        } else {
                            dispatch(
                                get_dashboard_data({
                                    field: 'recentCampaigns',
                                    data: { groupedCampaigns: [], isLoading: false, isFailure: true },
                                }),
                            );
                        }

                        // Process ROI Trend
                        if (response?.roiTrend?.roiChartData && response?.roiTrend.roiChartData.length > 0) {
                            let roiObj = {
                                xAxis: {
                                    title: '',
                                },
                                yAxis: {
                                    title: ' ',
                                },
                                categories: [
                                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                                ],
                                series: [
                                    {
                                        name: 'Communications',
                                        data: [],
                                        color: ch_color1,
                                    },
                                ],
                            };
                            let temp = [];
                            let hasValidData = false;
                            for (let i = 0; i < response?.roiTrend.roiChartData.length; i++) {
                                const value = Number(response?.roiTrend.roiChartData[i].yAxis);
                                temp.push(value);
                                if (value > 0) hasValidData = true;
                            }
                            roiObj = {
                                ...roiObj,
                                series: [
                                    {
                                        name: 'Communications',
                                        data: temp,
                                        color: ch_color1,
                                    },
                                ],
                            };
                            dispatch(
                                get_dashboard_data({
                                    field: 'roiData',
                                    data: { data: roiObj, isLoading: false, isFailure: !hasValidData },
                                }),
                            );
                        } else {
                            dispatch(
                                get_dashboard_data({
                                    field: 'roiData',
                                    data: { data: {}, isLoading: false, isFailure: true },
                                }),
                            );
                        }

                        // Process Channel Performance
                        if (response?.channelPerformance?.reach) {
                            try {
                                const channelPerfData = JSON.parse(response?.channelPerformance.reach);
                                if (channelPerfData.Series && channelPerfData.Series.length > 0) {
                                    let channelData = {
                                        categories: channelPerfData.Categories,
                                        xAxis: {
                                            title: '',
                                        },
                                        yAxis: {
                                            title: '',
                                        },
                                        tooltip: {
                                            shared: true,
                                        },
                                        pointWidth: 20,
                                        series: [],
                                    };
                                    let temp = [];
                                    for (let i = 0; i < channelPerfData.Series.length; i++) {
                                        temp.push({
                                            name: channelPerfData.Series[i].Name,
                                            data: channelPerfData.Series[i].Datas,
                                        });
                                    }
                                    channelData = {
                                        ...channelData,
                                        series: temp,
                                    };
                                    dispatch(
                                        get_dashboard_data({
                                            field: 'channelPerformance',
                                            data: { data: channelData, isLoading: false, isFailure: false },
                                        }),
                                    );
                                } else {
                                    dispatch(
                                        get_dashboard_data({
                                            field: 'channelPerformance',
                                            data: { data: {}, isLoading: false, isFailure: true },
                                        }),
                                    );
                                }
                            } catch (error) {
                                dispatch(
                                    get_dashboard_data({
                                        field: 'channelPerformance',
                                        data: { data: {}, isLoading: false, isFailure: true },
                                    }),
                                );
                            }
                        } else {
                            dispatch(
                                get_dashboard_data({
                                    field: 'channelPerformance',
                                    data: { data: {}, isLoading: false, isFailure: true },
                                }),
                            );
                        }

                        // Process Audience Behaviour (By week)
                        if (response?.customersPropensity?.week) {
                            let series = [
                                 { name: 'Thursday', value: response?.customersPropensity.week.thursdayRange },
                                { name: 'Wednesday', value: response?.customersPropensity.week.wednesdayRange },
                                { name: 'Tuesday', value: response?.customersPropensity.week.tuesdayRange },
                                { name: 'Monday', value: response?.customersPropensity.week.mondayRange },
                                { name: 'Saturday', value: response?.customersPropensity.week.saturdayRange },
                                { name: 'Sunday', value: response?.customersPropensity.week.sundayRange },
                                { name: 'Friday', value: response?.customersPropensity.week.fridayRange },
                            ];
                            // Check if any value is not null
                            const hasValidData = series.some(item => item.value !== null && item.value !== undefined && item.value !== '');
                            dispatch(
                                get_dashboard_data({
                                    field: 'audienceBehaviour',
                                    data: { data: { series }, isLoading: false, isFailure: !hasValidData },
                                }),
                            );
                        } else {
                            dispatch(
                                get_dashboard_data({
                                    field: 'audienceBehaviour',
                                    data: { data: {}, isLoading: false, isFailure: true },
                                }),
                            );
                        }

                        // Store customersPropensity for later use (for By day dropdown)
                        dispatch(
                            get_dashboard_data({
                                field: 'customersPropensity',
                                data: response?.customersPropensity || {},
                            }),
                        );

                        // Process Top Performances
                        if (response?.performanceCampaigns?.topPerformanceCampaigns && response?.performanceCampaigns.topPerformanceCampaigns.length > 0) {
                            const performanceCampaigns = response?.performanceCampaigns.topPerformanceCampaigns.map(
                                (item) => ({ ...item, range: 'high' })
                            );
                            dispatch(
                                get_dashboard_data({
                                    field: 'topPerformances',
                                    data: { data: performanceCampaigns, isLoading: false, isFailure: false },
                                }),
                            );
                        } else {
                            dispatch(
                                get_dashboard_data({
                                    field: 'topPerformances',
                                    data: { data: [], isLoading: false, isFailure: true },
                                }),
                            );
                        }

                        // Store all performance campaigns for dropdown changes
                        dispatch(
                            get_dashboard_data({
                                field: 'allPerformanceCampaigns',
                                data: response?.performanceCampaigns || {},
                            }),
                        );

                        // Process Top Earnings
                        if (response?.earningCampaigns?.top && response?.earningCampaigns.top.length > 0) {
                            dispatch(
                                get_dashboard_data({
                                    field: 'topEarnings',
                                    data: { data: response?.earningCampaigns.top, isLoading: false, isFailure: false },
                                }),
                            );
                        } else {
                            dispatch(
                                get_dashboard_data({
                                    field: 'topEarnings',
                                    data: { data: [], isLoading: false, isFailure: true },
                                }),
                            );
                        }

                        // Store all earning campaigns for dropdown changes
                        dispatch(
                            get_dashboard_data({
                                field: 'allEarningCampaigns',
                                data: response?.earningCampaigns || {},
                            }),
                        );

                        // Process Average Time Conversion
                        if (response?.timeConversion && response?.timeConversion.length > 0) {
                            // let colorsData = [ch_sms, ch_email, ch_mobile_push, ch_web_push];
                            // let channelByIcon = {
                            //     email: email_mini,
                            //     sms: mobile_sms_mini,
                            //     webpush: web_notification_mini,
                            //     mobilepush: mobile_notification_mini,
                            // };
                            // let result = [];
                            // for (var i = 0; i < response?.timeConversion.length; i++) {
                            //     const channelName = response?.timeConversion[i]?.name?.toLowerCase();
                            //     let temp = {
                            //         name: response?.timeConversion[i].name + '',
                            //         color: colorsData[i % colorsData.length] + '',
                            //         y: response?.timeConversion[i].dataValue * 60000,
                            //         icon: (channelByIcon[channelName] || email_mini) + '',
                            //     };
                            //     result.push(temp);
                            // }
                            dispatch(
                                get_dashboard_data({
                                    field: 'avgTimeData',
                                    data: { data: response?.timeConversion, isLoading: false, isFailure: false },
                                }),
                            );
                        } else {
                            dispatch(
                                get_dashboard_data({
                                    field: 'avgTimeData',
                                    data: { data: [], isLoading: false, isFailure: false },
                                }),
                            );
                        }

                        // Process Leads Source
                        if (response?.leadsSource && response?.leadsSource.length > 0) {
                            // let colorsData = [ch_sms, ch_email, ch_mobile_push, ch_web_push];
                            // let temp = {
                            //     name: 'Leads generated',
                            //     dataLabels: true,
                            //     series: [],
                            // };
                            // const leadsSource = response?.leadsSource[0];
                            // for (let i = 0; i < leadsSource.ChanelImage.length; i++) {
                            //     temp.series.push({
                            //         name: leadsSource.ChanelImage[i],
                            //         color: colorsData[i % colorsData.length],
                            //         y: leadsSource.PercentageScore[i],
                            //         z: leadsSource.PercentageScore[i],
                            //     });
                            // }
                            dispatch(
                                get_dashboard_data({
                                    field: 'leadsData',
                                    data: { data: response?.leadsSource, isLoading: false, isFailure: false },
                                }),
                            );
                        } else {
                            dispatch(
                                get_dashboard_data({
                                    field: 'leadsData',
                                    data: { data: [], isLoading: false, isFailure: true },
                                }),
                            );
                        }

                        // Store all channel performance data for dropdown changes
                        dispatch(
                            get_dashboard_data({
                                field: 'allChannelPerformance',
                                data: response?.channelPerformance || {},
                            }),
                        );

                        // Store raw recent and completed campaigns for dropdown switching
                        dispatch(
                            get_dashboard_data({
                                field: 'allRecentCampaigns',
                                data: {
                                    recentCampaigns: response?.recentCampaigns || [],
                                    recentCompletedCampaigns: response?.recentCompletedCampaigns || [],
                                },
                            }),
                        );
                                            } else {
                        dispatch(get_dashboard_data({ field: 'recentCampaigns', data: { groupedCampaigns: [], isLoading: false, isFailure: true } }));
                        dispatch(get_dashboard_data({ field: 'roiData', data: { data: {}, isLoading: false, isFailure: true } }));
                        dispatch(get_dashboard_data({ field: 'channelPerformance', data: { data: {}, isLoading: false, isFailure: true } }));
                        dispatch(get_dashboard_data({ field: 'audienceBehaviour', data: { data: {}, isLoading: false, isFailure: true } }));
                        dispatch(get_dashboard_data({ field: 'topPerformances', data: { data: [], isLoading: false, isFailure: true } }));
                        dispatch(get_dashboard_data({ field: 'topEarnings', data: { data: [], isLoading: false, isFailure: true } }));
                        dispatch(get_dashboard_data({ field: 'avgTimeData', data: { data: [], isLoading: false, isFailure: true } }));
                        dispatch(get_dashboard_data({ field: 'leadsData', data: { data: [], isLoading: false, isFailure: true } }));
                    }
                    } catch (error) {
                        dispatch(get_dashboard_data({ field: 'recentCampaigns', data: { groupedCampaigns: [], isLoading: false, isFailure: true } }));
                        dispatch(get_dashboard_data({ field: 'roiData', data: { data: {}, isLoading: false, isFailure: true } }));
                        dispatch(get_dashboard_data({ field: 'channelPerformance', data: { data: {}, isLoading: false, isFailure: true } }));
                        dispatch(get_dashboard_data({ field: 'audienceBehaviour', data: { data: {}, isLoading: false, isFailure: true } }));
                        dispatch(get_dashboard_data({ field: 'topPerformances', data: { data: [], isLoading: false, isFailure: true } }));
                        dispatch(get_dashboard_data({ field: 'topEarnings', data: { data: [], isLoading: false, isFailure: true } }));
                        dispatch(get_dashboard_data({ field: 'avgTimeData', data: { data: [], isLoading: false, isFailure: true } }));
                        dispatch(get_dashboard_data({ field: 'leadsData', data: { data: [], isLoading: false, isFailure: true } }));
                    }
                },
                fail: (err) => {
                                        dispatch(get_dashboard_data({ field: 'recentCampaigns', data: { groupedCampaigns: [], isLoading: false, isFailure: true } }));
                    dispatch(get_dashboard_data({ field: 'roiData', data: { data: {}, isLoading: false, isFailure: true } }));
                    dispatch(get_dashboard_data({ field: 'channelPerformance', data: { data: {}, isLoading: false, isFailure: true } }));
                    dispatch(get_dashboard_data({ field: 'audienceBehaviour', data: { data: {}, isLoading: false, isFailure: true } }));
                    dispatch(get_dashboard_data({ field: 'topPerformances', data: { data: [], isLoading: false, isFailure: true } }));
                    dispatch(get_dashboard_data({ field: 'topEarnings', data: { data: [], isLoading: false, isFailure: true } }));
                    dispatch(get_dashboard_data({ field: 'avgTimeData', data: { data: [], isLoading: false, isFailure: true } }));
                    dispatch(get_dashboard_data({ field: 'leadsData', data: { data: [], isLoading: false, isFailure: true } }));
                },
            }),
        );
    };
