import { csv_download_large, download_medium } from 'Constants/GlobalConstant/Glyphicons';
import { encodeUrl } from 'Utils/modules/crypto';
import { getUserCurrentFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { downloadCSVcommasFile } from 'Utils/modules/download';
import { numberWithCommas } from 'Utils/modules/formatters';
import { useEffect, useState } from 'react';
import _map from 'lodash/map';
import KendoGrid from 'Components/RSKendoGrid';


import RSTooltip from 'Components/RSTooltip';
import { globalStateSelector } from 'Utils/Selectors/app';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    getConsumptionChannelDetails,
    getConsumptionChannelDetailsDownload,
} from 'Reducers/preferences/consumptions/request';
import { useDispatch, useSelector } from 'react-redux';
import useQueryParams from 'Hooks/useQueryParams';
import { useNavigate } from 'react-router-dom';
import { updateAnalyticsDetail } from 'Reducers/analytics/communicationAnalytics/reducer';
import ConsumptionChannelHeader from '../../ConsumptionChannelHeader/ConsumptionChannelHeader';
import { commonConsumptionColumns } from '../../../../constant';
const ConsumptionSocialMedia = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useQueryParams('/preferences/consumptions/consumption-channel');
    const currentDate = new Date().toDateString();
    const [consumptionChannelList, setConsumptionChannelList] = useState([]);
    const { u_consumptionMM, u_consumptionYY, consumptionMM, consumptionYY, consumptionChannel } = useSelector(
        (state) => globalStateSelector(state),
    );
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const isLoading = useSelector((state) => state.consumptionReducer?.loading?.consumption_channel_detail || false);
    const [custColumns, setCustColumns] = useState(['dd', 'dd1', 'dd2']); //consumptionChannelList?.socialMediaChannelConsumptionList?.

    const [updateConsumptionDate, setUpdateConsumptionDate] = useState({
        startDate: getFirstDayOfMonth(consumptionYY, consumptionMM + 1),
        endDate: getCurrentDateOfMonth(consumptionYY, consumptionMM + 1),
    });

    useEffect(() => {
        setUpdateConsumptionDate({
            startDate: getFirstDayOfMonth(u_consumptionYY, u_consumptionMM + 1),
            endDate: getCurrentDateOfMonth(u_consumptionYY, u_consumptionMM + 1),
        });
    }, [u_consumptionMM, u_consumptionYY]);

    // useEffect(() => {
    //         setUpdateConsumptionDate({
    //             startDate: getFirstDayOfMonth(consumptionYY, consumptionMM + 1),
    //             endDate: getCurrentDateOfMonth(consumptionYY, consumptionMM + 1),
    //         });
    // }, []);
    //console.log('updateConsumptionDate', updateConsumptionDate);

    const [paginationParams, setPaginationParams] = useState({
        skip: 0,
        take: 5,
        initialPagination: false,
    });
    const [gridData, setGridData] = useState([]);
    const [customFilterValue, setCustomFilterValue] = useState(null);
    const [params, setParams] = useState({
        departmentId,
        clientId,
        userId,
        month: u_consumptionMM + 1,
        year: u_consumptionYY,
        channelId: 5,
        pageNo: 1,
        pageSize: 5,
        searchText: '',
        startDate: getYYMMDD(getFirstDayOfMonth(consumptionYY, u_consumptionMM + 1)),
        endDate: getYYMMDD(getCurrentDateOfMonth(consumptionYY, u_consumptionMM + 1)),
    });

    const [paramsDownload, setParamsDownload] = useState({
        departmentId,
        clientId,
        userId,
        month: consumptionMM + 1,
        year: consumptionYY,
        channelId: 5,

        startDate: getYYMMDD(getFirstDayOfMonth(consumptionYY, u_consumptionMM + 1)),
        endDate: getYYMMDD(getCurrentDateOfMonth(consumptionYY, u_consumptionMM + 1)),
    });

    const handlePagerChange = (data) => {
        const { skip, take } = data?.dataState;
        setPaginationParams({ skip, take });
    };

    useEffect(() => {
        setParams((pre) => ({
            ...pre,
            month: u_consumptionMM + 1,
            year: u_consumptionYY,
            startDate: getYYMMDD(getFirstDayOfMonth(consumptionYY, u_consumptionMM + 1)),
            endDate: getYYMMDD(getCurrentDateOfMonth(consumptionYY, u_consumptionMM + 1)),
        }));
    }, [u_consumptionMM, u_consumptionYY]);

    useEffect(() => {
        setParamsDownload((pre) => ({
            ...pre,
            month: u_consumptionMM + 1,
            year: u_consumptionYY,
            startDate: getYYMMDD(getFirstDayOfMonth(consumptionYY, u_consumptionMM + 1)),
            endDate: getYYMMDD(getCurrentDateOfMonth(consumptionYY, u_consumptionMM + 1)),
        }));
    }, [u_consumptionMM, u_consumptionYY]);

    const handleConsumptionChannelDetails = async (params) => {
        let { status, data } = await dispatch(getConsumptionChannelDetails(params));
        if (status) {
            setConsumptionChannelList(data);
            const tableName =
                Array.isArray(data?.socialMediaChannelConsumptionList?.[0]?.custom) &&
                    data.socialMediaChannelConsumptionList[0].custom?.length > 0
                    ? _map(data.socialMediaChannelConsumptionList[0].custom, (res, key) => {
                        return { field: res, title: res, width: 150 };
                    })
                    : [];
            setCustColumns(tableName);
        } else {
            setConsumptionChannelList([]);
        }
    };
    useEffect(() => {
        setParams((prev) => ({
            ...prev,
            departmentId,
            clientId,
        }));
    }, [departmentId, clientId]);
    useEffect(() => {
        const tableName =
            Array.isArray(consumptionChannelList?.socialMediaChannelConsumptionList?.[0]?.custom) &&
                consumptionChannelList.socialMediaChannelConsumptionList[0].custom?.length > 0
                ? _map(consumptionChannelList.socialMediaChannelConsumptionList[0].custom, (res, key) => {
                    return { field: res, title: res, width: 250 };
                })
                : [];
        setCustColumns(tableName);
        const data = consumptionChannelList?.socialMediaChannelConsumptionList?.map((item) => {
            const customData = item?.custom?.reduce((acc, customKey, index) => {
                if (customKey === 'Communication Docket') {
                    acc[customKey] = item.customValues[index] ? 'Yes' : 'No';
                } else {
                    acc[customKey] = item.customValues[index] || '';
                }
                return acc;
            }, {});
            return { ...item, ...customData };
        });
        setGridData(data);
    }, [consumptionChannelList]);

    // useEffect(() => {
    //     handleConsumptionChannelDetails(params);
    //     // }, [params, custColumns]);
    // }, [params]);

    const handleSearchFilter = (searchName) => {
        setParams((pre) => ({
            ...pre,
            searchText: searchName,
        }));
    };
    const handleDateFilter = (date) => {
        setParams((pre) => ({
            ...pre,
            startDate: getYYMMDD(date.startDate),
            endDate: getYYMMDD(date.endDate),
        }));
        setParamsDownload((pre) => ({
            ...pre,
            startDate: getYYMMDD(date.startDate),
            endDate: getYYMMDD(date.endDate),
        }));
    };
    const downloadConsumptionData = async () => {
        let res = await dispatch(getConsumptionChannelDetailsDownload(paramsDownload));
        //downloadCSVcommasFile(res, 'Email_' + new Date().toLocaleDateString() + '_' + new Date().toLocaleTimeString());
        downloadCSVcommasFile(
            res,
            'Email_' + getYYMM(paramsDownload.startDate) + '_' + new Date().toLocaleTimeString(),
        );
    };

    const handleChannelName = (subChannelId) => {
        const socialMediaChannelName = {
            1: 'Facebook',
            2: 'Facebook app',
            3: 'Twitter',
            4: 'Google app',
            5: 'Pinterest',
            6: 'Instagram',
            7: 'YouTube',
            8: 'LinkedIn',
        };
        return socialMediaChannelName[subChannelId] || '';
    };

    return (
        <>
            <>
                {/* <Row className="my10 align-items-center consumptionEmail d-none">
                        <Col md={6} className="d-flex align-items-center">
                            <h3 className="d-flex align-items-center">
                                {consumptionChannel?.lable}
                                <small className="color-primary-grey ml10 position-relative top1">
                                    (As on: {dateFormat(currentDate)})
                                    (As on: {getUserDateTimeFormat(currentDate + ' UTC', 'formatDateTime')})
                                </small>
                            </h3>
                        </Col>
                        <Col md={6}>
                            <ul className="rs-list-group-horizontal float-end">
                                <li>
                                    <RSDateRangePicker
                                        onDatePickerClosed={handleDateFilter}
                                        isConsumption={true}
                                        consumptionStartDate={updateConsumptionDate.startDate}
                                        consumptionEndDate={updateConsumptionDate.endDate}
                                    />
                                </li>
                                <li className="ml15">
                                    {' '}
                                    <RSSearchField
                                        searchedText={handleSearchFilter}
                                        placeholder={'By communication name'}
                                    />{' '}
                                </li>
                                <li className="ml15">
                                    <RSTooltip text={'Download CSV'}>
                                        <i
                                            onClick={() => {
                                                downloadConsumptionData();
                                                downloadCSV(
                                                    consumptionChannelList?.socialMediaChannelConsumptionList,
                                                    consumptionChannel?.lable + '_' + new Date().toDateString(),
                                                );
                                            }}
                                            className={`${csv_download_large} icon-lg color-primary-blue`}
                                        ></i>
                                    </RSTooltip>
                                </li>
                            </ul>
                        </Col>
                    </Row> */}

                <ConsumptionChannelHeader
                    setConsumptionChannelList={setConsumptionChannelList}
                    setCustColumns={setCustColumns}
                    paginationParams={paginationParams}
                    setPaginationParams={setPaginationParams}
                    customFilterValue={customFilterValue}
                />
                <div className="mb70">
                    <KendoGrid
                        // data={CONSUMPTION_EMAIL_DATA?.data?.activityList}
                        // isFailure={!CONSUMPTION_EMAIL_DATA?.data?.activityList?.length}
                        // settings={{ total: CONSUMPTION_EMAIL_DATA?.data?.activityList?.count }}
                        data={gridData}
                        isLoading={isLoading}
                        isConsumption
                        isFailure={!consumptionChannelList?.length}
                        settings={{ total: consumptionChannelList?.totalRows }}
                        scrollable={'scrollable'}
                        // isDataStateRequired
                        pageable={true}
                        pagerChange={paginationParams?.initialPagination}
                        onDataStateChange={(data) => handlePagerChange(data)}
                        column={[
                            { field: 'campaigngroupingID', title: 'Group ID', width: 90, filter: 'text' },
                            {
                                field: 'campaignName',
                                title: 'Communication name',
                                width: 250,
                                filter: 'text',
                                cell: ({ dataItem, field }) => {
                                    return (
                                        <td>
                                            <div className="d-flex justify-content-between">
                                                <span
                                                    className="cursor-pointer link-underline-hover color-primary-black cp"
                                                    onClick={() => {
                                                        dispatch(
                                                            updateAnalyticsDetail({
                                                                channelName: consumptionChannel?.lable,
                                                                campaignId: dataItem?.campaignID,
                                                                from: 'analytics',
                                                                blastId: dataItem?.iswinnerB2 && dataItem?.iswinnerSplit ? dataItem?.iswinnerB2 : dataItem?.blastShortCode,
                                                                channelId: 7,
                                                                currIndex:
                                                                    dataItem?.deliveryMethod ===
                                                                        'Multi dimension'
                                                                        ? dataItem?.mdcLevel - 1
                                                                        : 0,
                                                                subChannelId: dataItem?.subChannelID,
                                                            }),
                                                        );
                                                        const state = {
                                                            channelName: consumptionChannel?.lable,
                                                            campaignId: dataItem?.campaignID,
                                                            channelId: 7,
                                                            iswinnerSplit: dataItem?.iswinnerSplit,
                                                            iswinnerSplitType: dataItem?.iswinnerSplitType,
                                                            subChannelId: dataItem?.subChannelID,
                                                            isSplitAB: dataItem?.isSplitAB,
                                                            iswinnerBlastId: dataItem?.iswinnerSplit && dataItem?.iswinnerB2 ? dataItem?.iswinnerB2 : '',
                                                        };
                                                        const encryptState = encodeUrl(state);
                                                        navigate(
                                                            `/analytics/detail-analytics?q=${encryptState}`,
                                                            {
                                                                state,
                                                            },
                                                        );
                                                        // navigate(`/analytics/detail-analytics`, {
                                                        //     state: {
                                                        //         channelName: consumptionChannel?.lable,
                                                        //         campaignId: dataItem?.campaignID,
                                                        //     },
                                                        // });
                                                    }}
                                                >
                                                    {/* <td> */}
                                                    {dataItem?.[field]?.length > 25 ? (
                                                        <RSTooltip
                                                            text={`${dataItem?.[field]}`}
                                                            position="top"
                                                            className="color-primary-black"
                                                            innerContent={false}
                                                        >
                                                            <span className="color-primary-black">
                                                                {truncateTitle(dataItem?.[field], 25)}
                                                            </span>
                                                        </RSTooltip>
                                                    ) : (
                                                        <span className="m0">{dataItem?.[field]}</span>
                                                    )}
                                                    {/* </td> */}
                                                </span>
                                            </div>
                                        </td>
                                    );
                                },
                            },
                            ...commonConsumptionColumns(),
                            {
                                field: 'channelName',
                                title: 'Channel name',
                                width: 180,
                                filter: 'text',
                                cell: ({ dataItem }) => {
                                    return <td>{handleChannelName(dataItem?.subChannelID)}</td>;
                                },
                            },
                            {
                                field: 'displayStartdate',
                                title: 'Start date',
                                width: 180,
                                filter: 'date',
                                // filter: 'date',
                                // cell: ({ dataItem, field }) => {
                                //     return <td>{dateFormat(dataItem?.[field])}</td>;
                                // },
                                cell: ({ dataItem }) => (
                                    <td>
                                        {/* <span className="m0">{dateFormat(dataItem?.displayStartdate)}</span> */}
                                        <span className="m0">
                                            {getUserCurrentFormat(dataItem?.displayStartdate)?.dateFormat}
                                        </span>

                                        {/* {dataItem?.displayStartdate?.length > 20 ? (
                                                    <RSTooltip
                                                        text={dataItem?.displayStartdate}
                                                        position="top"
                                                        className="d-inline-block"
                                                        innerContent={false}
                                                    >
                                                        <span className="m0">
                                                            {truncateTitle(dataItem?.displayStartdate, 20)}
                                                        </span>
                                                    </RSTooltip>
                                                ) : (
                                                    <span className="m0">{dateFormat(dataItem?.displayStartdate)}</span>
                                                )} */}
                                    </td>
                                ),
                            },
                            {
                                field: 'displayEnddate',
                                title: 'End date',
                                width: 180,
                                filter: 'date',
                                // cell: ({ dataItem, field }) => {
                                //     return <td>{dateFormat(dataItem?.[field])}</td>;
                                // },
                                cell: ({ dataItem }) => (
                                    <td>
                                        {/* <span className="m0">{dateFormat(dataItem?.displayEnddate)}</span> */}
                                        <span className="m0">
                                            {getUserCurrentFormat(dataItem?.displayEnddate)?.dateFormat}
                                        </span>

                                        {/* {dataItem?.displayEnddate?.length > 20 ? (
                                                    <RSTooltip
                                                        text={dataItem?.displayEnddate}
                                                        position="top"
                                                        className="d-inline-block"
                                                        innerContent={false}
                                                    >
                                                        <span className="m0">
                                                            {truncateTitle(dataItem?.displayEnddate, 20)}
                                                        </span>
                                                    </RSTooltip>
                                                ) : (
                                                    <span className="m0">{dateFormat(dataItem?.displayEnddate)}</span>
                                                )} */}
                                    </td>
                                ),
                            },
                            {
                                field: 'displayScheduledate',
                                title: 'Sent on',
                                width: 180,
                                filter: 'date',
                                // cell: ({ dataItem, field }) => {
                                //     return <td>{dateFormat(dataItem?.[field])}</td>;
                                // },
                                cell: ({ dataItem }) => (
                                    <td>
                                        {/* <span className="m0">{dateFormat(dataItem?.displayScheduledate)}</span> */}
                                        <span className="m0">
                                            {getUserCurrentFormat(dataItem?.displayScheduledate)?.dateFormat}
                                        </span>
                                        {/* {dataItem?.displayScheduledate?.length > 20 ? (
                                                    <RSTooltip
                                                        text={dataItem?.displayScheduledate}
                                                        position="top"
                                                        className="d-inline-block"
                                                        innerContent={false}
                                                    >
                                                        <span className="m0">
                                                            {truncateTitle(dataItem?.displayScheduledate, 20)}
                                                        </span>
                                                    </RSTooltip>
                                                ) : (
                                                    <span className="m0">
                                                        {dateFormat(dataItem?.displayScheduledate)}
                                                    </span>
                                                )} */}
                                    </td>
                                ),
                            },
                            {
                                field: 'campaignType',
                                title: 'Communication type',
                                width: 200,
                                filter: 'text',
                                cell: ({ dataItem }) => (
                                    <td>
                                        {dataItem?.campaignType?.length > 20 ? (
                                            <RSTooltip
                                                text={dataItem?.campaignType}
                                                position="top"
                                                className="d-inline-block"
                                                innerContent={false}
                                            >
                                                <span className="m0">
                                                    {truncateTitle(dataItem?.campaignType, 20)}
                                                </span>
                                            </RSTooltip>
                                        ) : (
                                            <span className="m0">{dataItem?.campaignType}</span>
                                        )}
                                    </td>
                                ),
                            },
                            { field: 'deliveryMethod', title: 'Delivery method', width: 180, filter: 'text' },
                            // {
                            //     field: 'productCategory',
                            //     title: 'Product category',
                            //     width: 180,
                            //     filter: 'text',
                            //     cell: ({ dataItem }) => (
                            //         <td>
                            //             {dataItem?.productCategory?.length > 15 ? (
                            //                 <RSTooltip
                            //                     text={dataItem?.productCategory}
                            //                     position="top"
                            //                     innerContent={false}
                            //                 >
                            //                     <span className="m0">
                            //                         {truncateTitle(dataItem?.productCategory, 15)}
                            //                     </span>
                            //                 </RSTooltip>
                            //             ) : (
                            //                 <span className="m0">{dataItem?.productCategory}</span>
                            //             )}
                            //         </td>
                            //     ),
                            // },
                            // { field: 'subProductCategory', title: 'Sub product category', width: 200 },
                            // {
                            //     field: 'mdcLevel',
                            //     title: 'MDC level',
                            //     width: 120,
                            //     filter: 'numeric',
                            //     cell: ({ dataItem, field }) => {
                            //         return <td className="text-right">{dataItem?.[field]}</td>;
                            //     },
                            // },
                            // {
                            //     field: 'subSegmentLevelFriendlyName',
                            //     title: 'Subsegment level',
                            //     width: 180,
                            //     filter: 'numeric',
                            //     cell: ({ dataItem, field }) => {
                            //         return <td className="text-right">{dataItem?.[field]}</td>;
                            //     },
                            // },
                            // {
                            //     field: 'splitType',
                            //     title: 'Split type',
                            //     width: 150,
                            //     filter: 'text',
                            // },
                            // {
                            //     field: 'subjectLine',
                            //     title: 'Subject line',
                            //     width: 350,
                            //     filter: 'text',
                            //     cell: ({ dataItem }) => (
                            //         <td>
                            //             {dataItem?.subjectLine?.length > 35 ? (
                            //                 <RSTooltip
                            //                     text={dataItem?.subjectLine}
                            //                     position="top"
                            //                     // className="d-inline-block"
                            //                     innerContent={false}
                            //                 >
                            //                     <span className="m0">
                            //                         {truncateTitle(dataItem?.subjectLine, 35)}
                            //                     </span>
                            //                 </RSTooltip>
                            //             ) : (
                            //                 <span className="m0">{dataItem?.subjectLine}</span>
                            //             )}
                            //         </td>
                            //     ),
                            // },
                            // {
                            //     field: 'sent',
                            //     title: 'Sent',
                            //     width: 100,
                            //     filter: 'numeric',
                            //     cell: ({ dataItem, field }) => {
                            //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                            //     },
                            // },
                            // {
                            //     field: 'delivered',
                            //     title: 'Delivered',
                            //     width: 110,
                            //     filter: 'numeric',
                            //     cell: ({ dataItem, field }) => {
                            //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                            //     },
                            // },
                            // {
                            //     field: 'opened',
                            //     title: 'Opened',
                            //     width: 100,
                            //     filter: 'numeric',
                            //     cell: ({ dataItem, field }) => {
                            //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                            //     },
                            // },
                            // {
                            //     field: 'reachPercentage',
                            //     title: 'Reach %',
                            //     width: 100,
                            //     filter: 'numeric',
                            //     cell: ({ dataItem, field }) => {
                            //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                            //     },
                            // },
                            // {
                            //     field: 'totalOpens',
                            //     title: 'Total opens',
                            //     width: 130,
                            //     filter: 'numeric',
                            //     cell: ({ dataItem, field }) => {
                            //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                            //     },
                            // },
                            // {
                            //     field: 'clicked',
                            //     title: 'Clicked',
                            //     width: 100,
                            //     filter: 'numeric',
                            //     cell: ({ dataItem, field }) => {
                            //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                            //     },
                            // },
                            // {
                            //     field: 'engagePercentage',
                            //     title: 'Engagement %',
                            //     width: 150,
                            //     filter: 'numeric',
                            //     cell: ({ dataItem, field }) => {
                            //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                            //     },
                            // },
                            {
                                field: 'totalReachCount',
                                title: 'Reach',
                                width: 130,
                                filter: 'numeric',
                                cell: ({ dataItem, field }) => {
                                    return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                },
                            },
                            {
                                field: 'totalViewsCount',
                                title: 'Total views',
                                width: 130,
                                filter: 'numeric',
                                cell: ({ dataItem, field }) => {
                                    return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                },
                            },
                            {
                                field: 'totalEngagementCount',
                                title: 'Total engagement',
                                width: 180,
                                filter: 'numeric',
                                cell: ({ dataItem, field }) => {
                                    return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                },
                            },
                            {
                                field: 'engagementPercentage',
                                title: 'Engagement percentage',
                                width: 230,
                                filter: 'numeric',
                                cell: ({ dataItem, field }) => {
                                    return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                },
                            },
                            {
                                field: 'totalClicks',
                                title: 'Total clicks',
                                width: 150,
                                filter: 'numeric',
                                cell: ({ dataItem, field }) => {
                                    return <td className="text-right">{dataItem?.subChannelID === 6 ? 'NA' : numberWithCommas(dataItem?.[field])}</td>;
                                },
                            },
                            {
                                field: 'conversion',
                                title: 'Conversion',
                                width: 130,
                                filter: 'numeric',
                                cell: ({ dataItem, field }) => {
                                    return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                },
                            },
                            {
                                field: 'postName',
                                title: 'Post name',
                                width: 130,
                                filter: 'numeric',
                                cell: ({ dataItem, field }) => {
                                    return <td>{(dataItem?.postName) || ''}</td>;
                                },
                            },
                            {
                                field: 'pageName',
                                title: 'Page name',
                                width: 130,
                                filter: 'numeric',
                                cell: ({ dataItem, field }) => {
                                    return <td>{(dataItem?.pageName) || ''}</td>;
                                },
                            },
                            {
                                field: 'contentType',
                                title: 'Content type',
                                width: 160,
                                filter: 'numeric',
                                cell: ({ dataItem, field }) => {
                                    return <td>{(dataItem?.contentType) || ''}</td>;
                                },
                            },
                            // {
                            //     field: 'convertionPercentage',
                            //     title: 'Conversion %',
                            //     width: 150,
                            //     filter: 'numeric',
                            //     cell: ({ dataItem, field }) => {
                            //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                            //     },
                            // },
                            // {
                            //     field: 'convertionValue',
                            //     title: 'Conversion value',
                            //     width: 180,
                            //     filter: 'numeric',
                            //     cell: ({ dataItem, field }) => {
                            //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                            //     },
                            // },
                            // {
                            //     field: 'hardBounce',
                            //     title: 'Hard bounced',
                            //     width: 150,
                            //     filter: 'numeric',
                            //     cell: ({ dataItem, field }) => {
                            //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                            //     },
                            // },
                            // {
                            //     field: 'softBounce',
                            //     title: 'Soft bounced',
                            //     width: 140,
                            //     filter: 'numeric',
                            //     cell: ({ dataItem, field }) => {
                            //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                            //     },
                            // },
                            // {
                            //     field: 'quarantinedCount',
                            //     title: 'Quarantined',
                            //     width: 150,
                            //     filter: 'numeric',
                            //     cell: ({ dataItem, field }) => {
                            //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                            //     },
                            // },
                            // {
                            //     field: 'unsubscribed',
                            //     title: 'Unsubscribe',
                            //     width: 130,
                            //     filter: 'numeric',
                            //     cell: ({ dataItem, field }) => {
                            //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                            //     },
                            // },
                            // {
                            //     field: 'bounced',
                            //     title: 'Bounced',
                            //     width: 110,
                            //     filter: 'numeric',
                            //     cell: ({ dataItem, field }) => {
                            //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                            //     },
                            // },

                            ...custColumns,
                            // {
                            //     field: 'attachments',
                            //     title: 'Attachment',
                            //     width: 130,
                            //     filter: 'text',
                            //     cell: ({ dataItem, field }) => {
                            //         return (
                            //             <td>
                            //                 <RSTooltip text="Download" position="top">
                            //                     <i className={`${download_medium} icon-md color-primary-blue`}></i>
                            //                 </RSTooltip>
                            //             </td>
                            //         );
                            //     },
                            // },
                        ]}
                        autoResizeSize
                    />
                </div>
            </>

        </>
    );
};

export default ConsumptionSocialMedia;
