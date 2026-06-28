import { BIND_LINK_CSV_DOWNLOAD, CLICK_ACTIVITY_DETAILS, COMMUNICATION_STATUS, DETAIL_ADVANCE_SEARCH, DETAIL_ADVANCE_SEARCH_DATA, DETAIL_DOCKET, DETAIL_DOCKET_DOWNLOAD, DETAIL_DOWNLOAD_COMM_STATUS_ACTIVITY, DETAIL_EMAIL_HEATMAP_REPORT, DETAIL_GET_KYC_COUNT, DETAIL_REPORT, DETAIL_REPORT_CHANNELDETAILS, DETAIL_REPORT_CONTENTDETAILS, DETAIL_REPORT_DOWNLOAD, DETAIL_REPORT_OTPTOKEN, DETAIL_REPORT_OTPTOKEN_VALID, DETAIL_REPORT_OVERVIEWDETAILS, DETAIL_REPORT_SEGMENTDETAILS, GET_ANALYTICSUSER_JOURNEY, GET_COMMUNICATION_PRE_BLAST, GET_DIGIPOP_REPORT, GET_FORM_ANALYTICS, GET_FORM_PROGRESSIVE_PROFILE } from 'Constants/EndPoints';
import request from 'Utils/Http';

import { docketDetailsData,
    docketCsvPathData,
    linkPreviewDetailsData,
    updateDetailsLoading,
    updateDetailsMainList,
    updateDetailsPreBlast,
    updateDetailsChannelLoading,
    setCommStatusLoading,
    updatekyccount
} from './reducer';
import { getKeyUserInfo } from 'Reducers/globalState/reducer';
import { updateOtpInValid, updateOtpValid } from 'Reducers/Preferences/MyProfile/reducer';

export const getDetailReport =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(updateDetailsLoading(true));
        return dispatch(
            request.post({
                url: DETAIL_REPORT,
                loading: true,
                payload,
                ok: (res) => {
                    const { status, data } = res?.data;
                    if (status) {
                        dispatch(updateDetailsMainList({ field: 'detailsList', data: data }));
                    } else {
                        dispatch(updateDetailsMainList({ field: 'detailsList', data: {} }));
                    }
                },
                fail: () => {
                    dispatch(updateDetailsMainList({ field: 'detailsList', data: {} }));
                },
                final: () => {
                    dispatch(updateDetailsLoading(false));
                },
            }),
        );
    };

export const getDetailReport_ChannelDetails =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(updateDetailsChannelLoading(true));
        return dispatch(
            request.post({
                url: DETAIL_REPORT_CHANNELDETAILS,
                loading: false,
                payload,
                ok: (res) => {
                    const { status, data } = res?.data;
                    if (status) {
                        dispatch(updateDetailsMainList({ field: 'channelDetail', data: data }));
                    } else {
                        dispatch(updateDetailsMainList({ field: 'channelDetail', data: {} }));
                    }
                    return res?.data;
                },
                fail: (err) => {
                                        return { status: false, data: null };
                },
                final: () => {
                    dispatch(updateDetailsChannelLoading(false));
                },
            }),
        );
    };

export const getDetailReport_ContentDetails = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DETAIL_REPORT_CONTENTDETAILS,
            payload,
            loading: true,
            isFailureCheck: true,
        }),
    );
};

export const getHeatMapContentDetails = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DETAIL_EMAIL_HEATMAP_REPORT,
            payload,
            loading: false,
        }),
    );
}
export const getDetailAdvanceSearch = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DETAIL_ADVANCE_SEARCH,
            payload,
            loading: true,
        }),
    );
}
export const getDetailAdvanceSearchData = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DETAIL_ADVANCE_SEARCH_DATA,
            payload,
            loading: false,
        }),
    );
}

export const get_CommStatus_activityDownload = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DETAIL_DOWNLOAD_COMM_STATUS_ACTIVITY,
            payload,
            loading: true,
        }),
    );
}

export const getDetailReport_OverviewDetails =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(updateDetailsLoading(true));
        return dispatch(
            request.post({
                url: DETAIL_REPORT_OVERVIEWDETAILS,
                loading: false,
                payload,
                ok: (res) => {
                    const { status, data } = res?.data;
                    if (status) {
                        dispatch(updateDetailsMainList({ field: 'overviewDetail', data: data }));
                    } else {
                        dispatch(updateDetailsMainList({ field: 'overviewDetail', data: {} }));
                    }
                },
                fail: (err) => {
                                    },
                final: () => {
                    dispatch(updateDetailsLoading(false));
                },
            }),
        );
    };


    export const GetAnalyticsUser_Journey =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_ANALYTICSUSER_JOURNEY,
                loading: false,
                payload,
                ok: (res) => {
                    const { status, data } = res?.data;
                    if (status) {
                        // dispatch(updateDetailsMainList({ field: 'overviewDetail', data: data }));
                    } else {
                        // dispatch(updateDetailsMainList({ field: 'overviewDetail', data: {} }));
                    }
                    return res?.data; // Return response so it can be used in component
                },
                fail: (err) => {
                                        return { status: false, data: null };
                },
                final: () => {
                    // dispatch(updateDetailsLoading(false));
                },
            }),
        );
    };

export const getDetailReport_SegmentDetails =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(updateDetailsLoading(true));
        return dispatch(
            request.post({
                url: DETAIL_REPORT_SEGMENTDETAILS,
                loading: false,
                payload,
                ok: (res) => {
                    const { status, data } = res?.data;
                    if (status) {
                        dispatch(updateDetailsMainList({ field: 'segmentDetail', data: data }));
                    } else {
                        dispatch(updateDetailsMainList({ field: 'segmentDetail', data: {} }));
                    }
                },
                fail: (err) => {
                                    },
                final: () => {
                    dispatch(updateDetailsLoading(false));
                },
            }),
        );
    };

export const getClickActivityDetails =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: CLICK_ACTIVITY_DETAILS,
                // loading: true,
                payload,
                ok: ({ data }) => {
                    if (data?.status) {
                        dispatch(linkPreviewDetailsData(data?.data));
                    }else{
                        dispatch(linkPreviewDetailsData({}));
                    }
                },
                fail: (err) => {},
            }),
        );
    };

export const getkycount =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: DETAIL_GET_KYC_COUNT,
                // loading: true,
                payload,
                ok: ({ data }) => {
                    if (data?.status) {
                        dispatch(updatekyccount(data?.data));
                    }else{
                        dispatch(updatekyccount(0));
                    }
                },
                fail: (err) => {},
            }),
        );
    };
  
export const getCommunicationStatus =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(setCommStatusLoading(true));
        return dispatch(
            request.post({
                url: COMMUNICATION_STATUS,
                // loading: true,
                payload,
                ok: () => {},
                fail: (err) => {},
                final: () => {
                    dispatch(setCommStatusLoading(false));
                },
            }),
        );
    };
export const csvDownloadLInkPreview =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: BIND_LINK_CSV_DOWNLOAD,
                loading: false,
                payload,
                ok: () => {},
                fail: (err) => {},
                isFailureCheck: true,
            }),
        );
    };

export const getCommunicationPreBlast =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_COMMUNICATION_PRE_BLAST,
                loading: true,
                payload,
                ok: (res) => {
                    const { status, data } = res?.data;
                    if (status) {
                        dispatch(updateDetailsPreBlast({ field: 'preBlastList', data: data }));
                    } else {
                        dispatch(updateDetailsPreBlast({ field: 'preBlastList', data: [] }));
                    }
                },
                fail: (err) => {
                                    },
            }),
        );


export const requestKeyPersonOTPAnalytics = (payload, setMessage, resend = false, loading = true) => async (dispatch) => {
   return dispatch(
        request.post({
            url: DETAIL_REPORT_OTPTOKEN,
            payload,
            loading,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    dispatch(getKeyUserInfo({ field: 'userOTPToken', data: data }));
                     if(resend){setMessage('OTP resent successfully');}
                   else {setMessage('OTP sent successfully');}
                    setTimeout(() => {
                        setMessage(null);
                    }, 2000);
                }
            },
            fail: (err) => {
                            },
        }),
    );
};

export const validateAnalyticsOTP =
    ({ payload, setMessage, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DETAIL_REPORT_OTPTOKEN_VALID,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, message } = data;
                    if (status) {
                        dispatch(updateOtpValid(true));
                          setMessage('OTP sent successfully');
                    setTimeout(() => {
                        setMessage(null);
                    }, 2000);
                    } else {
                        dispatch(
                            updateOtpInValid({
                                flag: true,
                                otpMessage: message,
                            }),
                        );
                    }
                },
                fail: (err) => {},
            }),
        );

export const submitAnalyticsOTP =
    ({ payload
      
     }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DETAIL_REPORT_DOWNLOAD,
                payload,
                loading: false,
                ok: ({ data }) => {
                    const { status, message } = data;
                  
                },
                fail: (err) => {},
            }),
        );
    //     export const getCommunicationDocketDownload =
    // ({ payload
      
    //  }) =>
    // async (dispatch) =>
    //     dispatch(
    //         request.post({
    //             url: DETAIL_DOCKET_DOWNLOAD,
    //             payload,
    //             loading: true,
    //             ok: ({ data }) => {
    //                 const { status, message } = data;
    //                 if (status && data?.data) {
    //                     const parsedData = JSON.parse(data?.data);
    //                     dispatch(docketDetailsData(parsedData));
    //                 } else {
    //                     dispatch(docketDetailsData([]));
    //                 }
    //             },
    //             fail: (err) => console.log(err),
    //         }),
    //     );
export const getCommunicationDocket =
    ({ payload
      
     }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DETAIL_DOCKET,
                payload,
                loading: false,
                ok: ({ data }) => {
                    if (data?.status) {
                        let docketDetails = data?.data;
                        let tempData = docketDetails.frienndlyName.map((key, index) => ({
                            [key]: docketDetails.frienndlyNameValue[index]
                        })); 
                        tempData = tempData.reduce((acc, obj) => ({ ...acc, ...obj }), {});
                        const csvPath = tempData['Campaign Docket Url'] || tempData['CampaignDocket'] || '';
                        
                        if (tempData['Campaign Docket Url'] === 'No data available') {
                            dispatch(docketDetailsData([]));
                            dispatch(docketCsvPathData(''));
                            return;
                        }
                        
                        dispatch(docketCsvPathData(csvPath));
                        delete tempData['Campaign Docket Url'];
                        delete tempData['CampaignDocket'];

                        const resultArray = [tempData];

                        resultArray.forEach(item => {
                            item['Communication docket'] = item['Communication docket'] ? 'Yes' : 'No';
                        });

                        dispatch(docketDetailsData(resultArray));
                    }
                    else{
                        dispatch(docketDetailsData([]));
                        dispatch(docketCsvPathData(''));
                    }
                  
                },
                fail: (err) => {},
            }),
        );


export const get_Digipop_Reports = (payload) => async (dispatch) => {
    dispatch(updateDetailsLoading(true));
    return dispatch(
        request.post({
            url: GET_DIGIPOP_REPORT,
            payload,
            loading: true,
            //isFailureCheck: true,
            ok: ({data}) => {
                const { status, message, data: res} = data;
                let result = status ? res : {}
                dispatch(
                    updateDetailsMainList({
                        field: 'digipopReport',
                        data: { ...result, isDigipopCamp: true },
                    }),
                );
            },
            fail: (err) => {
                dispatch(
                    updateDetailsMainList({
                        field: 'digipopReport',
                        data: {},
                    }),
                );
            },
            final: () => {
                dispatch(updateDetailsLoading(false));
            },
        }),
    );
};

export const getFormAnalytics =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(updateDetailsLoading(true));
        return dispatch(
            request.post({
                url: GET_FORM_ANALYTICS,
                loading: false,
                payload,
                ok: (res) => {
                    const { status, data } = res?.data;
                    if (status) {
                        dispatch(updateDetailsMainList({ field: 'formAnalytics', data: data }));
                    } else {
                        dispatch(updateDetailsMainList({ field: 'formAnalytics', data: {} }));
                    }
                },
                fail: (err) => {
                                        dispatch(updateDetailsMainList({ field: 'formAnalytics', data: {} }));
                },
                final: () => {
                    dispatch(updateDetailsLoading(false));
                },
            }),
        );
    };

export const getFormProgressiveProfile =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(updateDetailsMainList({ field: 'progProfileLoading', data: true }));
        return dispatch(
            request.post({
                url: GET_FORM_PROGRESSIVE_PROFILE,
                loading: false,
                payload,
                ok: (res) => {
                    const { status, data,isProgressiveProfile } = res?.data;
                    if (status && isProgressiveProfile && data) {
                        dispatch(updateDetailsMainList({ field: 'progProfileData', data: data }));
                    } else {
                        dispatch(updateDetailsMainList({ field: 'progProfileData', data: {} }));
                    }
                },
                fail: (err) => {
                                        dispatch(updateDetailsMainList({ field: 'progProfileData', data: {} }));
                },
                final: () => {
                    dispatch(updateDetailsMainList({ field: 'progProfileLoading', data: false }));
                },
            }),
        );
    };