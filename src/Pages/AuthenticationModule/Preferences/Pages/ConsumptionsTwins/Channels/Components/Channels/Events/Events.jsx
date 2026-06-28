import { download_medium } from 'Constants/GlobalConstant/Glyphicons';
import { encodeUrl } from 'Utils/modules/crypto';
import { getUserCurrentFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { numberWithCommas } from 'Utils/modules/formatters';
import { Fragment, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import KendoGrid from 'Components/RSKendoGrid';

import RSTooltip from 'Components/RSTooltip';

import _map from 'lodash/map';
import { getSessionId } from 'Reducers/globalState/selector';
import { getConsumptionChannelDetails } from 'Reducers/preferences/consumptionsTwins/request';
import useQueryParams from 'Hooks/useQueryParams';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import ConsumptionChannelHeader from '../../ConsumptionChannelHeader/ConsumptionChannelHeader';
import { updateAnalyticsDetail } from 'Reducers/analytics/communicationAnalytics/reducer';
import { useNavigate } from 'react-router-dom';

const ConsumptionEvents = () => {
    const { u_consumptionMM, u_consumptionYY, consumptionYY, consumptionMM, consumptionChannel } = useSelector(
        ({ globalstate }) => globalstate,
    );
    const navigate = useNavigate();
    const currentDate = new Date().toDateString();
    const [consumptionChannelList, setConsumptionChannelList] = useState([]);
    const dispatch = useDispatch();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const location = useQueryParams('/preferences/consumptionsTwins/consumption-channel');
    const [custColumns, setCustColumns] = useState([]);
    const isLoading = useSelector((state) => state.consumptionReducer?.loading?.consumption_channel_detail || false);
    const [params, setParams] = useState({
        departmentId,
        clientId,
        userId,
        month: consumptionMM + 1,
        year: consumptionYY,
        channelId: 39,
        pageNo: 1,
        pageSize: 5,
        searchText: '',
    });
    const [paginationParams, setPaginationParams] = useState({
        skip: 0,
        take: 5,
        initialPagination: false,
    });

    // const handlePagerChange = (data) => {
    //     const { skip, take } = data?.dataState ?? {};
    //     setParams((prev) => ({
    //         ...prev,
    //         pageNo: skip === 0 ? 1 : skip / take + 1,
    //         pageSize: take,
    //     }));
    // };

    const handlePagerChange = (data) => {
        const { skip, take } = data?.dataState;
        setPaginationParams({ skip, take });
    };
    const handleConsumptionChannelDetails = async (params) => {
        let { status, data } = await dispatch(getConsumptionChannelDetails(params));
        //console.log('status getConsumptionChannelDetails: ', data);
        if (status) {
            setConsumptionChannelList(data);
            const tableName =
                Array.isArray(data?.eventsChannelConsumptionList?.[0]?.custom) &&
                data.eventsChannelConsumptionList[0].custom?.length > 0
                    ? _map(data.eventsChannelConsumptionList[0].custom, (res, key) => {
                          return { field: res, title: res, width: 150 };
                      })
                    : [];
            setCustColumns(tableName);
        } else {
            setConsumptionChannelList([]);
        }
    };
    // useEffect(() => {
    //     setParams((prev) => ({
    //         ...prev,
    //         departmentId,
    //         clientId,
    //         userId,
    //     }));
    // }, [departmentId, clientId, userId]);

    useEffect(() => {
        if (departmentId && clientId && userId) {
            const updatedParams = {
                ...params,
                month: u_consumptionMM + 1,
                year: u_consumptionYY,
            };
            setParams(updatedParams);
            handleConsumptionChannelDetails(updatedParams);
        }
    }, [u_consumptionMM, u_consumptionYY, departmentId, clientId, userId]);

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
    };
    return (
        <Fragment>
            {' '}
            {consumptionChannelList?.eventsConsumptionList?.length ? (
                <>
                    {/* <Row className="my10 align-items-center d-none">
                        <Col md={6} className="d-flex align-items-center">
                            <h3 className="d-flex align-items-center">
                                {consumptionChannel?.lable}{' '}
                                <small className="color-primary-grey ml10 position-relative top1">
                                    (As on: {dateFormat(currentDate)})
                                </small>
                            </h3>
                        </Col>
                        <Col md={6}>
                            <ul className="rs-list-group-horizontal float-end">
                                <li>
                                    <RSDateRangePicker onDatePickerClosed={handleDateFilter} />
                                </li>
                                <li className="ml15">
                                    {' '}
                                    <RSSearchField
                                        searchedText={handleSearchFilter}
                                        placeholder={'By communication name'}
                                    />{' '}
                                </li>
                            </ul>
                        </Col>
                    </Row> */}

                    <ConsumptionChannelHeader
                        setConsumptionChannelList={setConsumptionChannelList}
                        setCustColumns={setCustColumns}
                        paginationParams={paginationParams}
                        setPaginationParams={setPaginationParams}
                    />

                    <div className="mb70">
                        <KendoGrid
                            data={consumptionChannelList?.eventsConsumptionList}
                            isLoading={isLoading}
                            isConsumption
                            scrollable={'scrollable'}
                            onDataStateChange={(data) => handlePagerChange(data)}
                            pagerChange={paginationParams?.initialPagination}
                            autoResizeSize
                            column={[
                                { field: 'campaignID', title: 'Group ID', width: 120, filter: 'text' },
                                {
                                    field: 'campaignName',
                                    title: 'Communication name',
                                    width: 210,
                                    filter: 'text',
                                    cell: ({ dataItem, field }) => {
                                        return (
                                            <td>
                                                <div className="d-flex justify-content-between">
                                                    <span
                                                        className="cursor-pointer link-underline-hover color-primary-black"
                                                        onClick={() => {
                                                            dispatch(
                                                                updateAnalyticsDetail({
                                                                    channelName: consumptionChannel?.lable,
                                                                    campaignId: dataItem?.campaignID,
                                                                    from: 'analytics',
                                                                    blastId: dataItem?.blastShortCode,
                                                                    channelId: 39,
                                                                    currIndex:
                                                                        dataItem?.deliveryMethod === 'Multi dimension'
                                                                            ? dataItem?.mdcLevel - 1
                                                                            : 0,
                                                                }),
                                                            );
                                                            const state = {
                                                                channelName: consumptionChannel?.lable,
                                                                campaignId: dataItem?.campaignID,
                                                                from: dataItem?.campaignID,
                                                                campaignName: dataItem?.campaignName,
                                                                isGolden: dataItem?.isGoldCampaign,
                                                                channelId: dataItem?.channelId,
                                                                iswinnerSplit: dataItem?.iswinnerSplit,
                                                                iswinnerSplitType: dataItem?.iswinnerSplitType,
                                                                startDate: dataItem?.displayStartdate,
                                                                endDate: dataItem?.displayEnddate,
                                                                campaignTypeValue: dataItem?.campaignTypeValue,
                                                                subSegmentFriendlyName: dataItem?.subSegmentLevelFriendlyName,
                                                               subSegmentLevel: dataItem?.subSegmentLevel,
                                                               isSplitAB: dataItem?.isSplitAB
                                                            };
                                                            const encryptState = encodeUrl(state);
                                                            navigate(`/analytics/analytics-report?q=${encryptState}`, {
                                                                state,
                                                            });
                                                            // navigate(`/analytics/detail-analytics`, {
                                                            //     state: {
                                                            //         channelName: consumptionChannel?.lable,
                                                            //         campaignId: dataItem?.campaignID,
                                                            //     },
                                                            // });
                                                        }}
                                                    >
                                                        {dataItem?.[field]?.length > 15 ? (
                                                            <RSTooltip
                                                                text={`${dataItem?.[field]}`}
                                                                position="top"
                                                                innerContent={false}
                                                            >
                                                                <span className="m0">
                                                                    {truncateTitle(dataItem?.[field], 15)}
                                                                </span>
                                                            </RSTooltip>
                                                        ) : (
                                                            <span className="m0">{dataItem?.[field]}</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </td>
                                        );
                                    },
                                },
                                {
                                    field: 'displayStartdate',
                                    title: 'Start date',
                                    width: 180,
                                    filter: 'date',
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
                                    cell: ({ dataItem }) => (
                                        <td>
                                            <span className="m0">
                                                {getUserCurrentFormat(dataItem?.displayEnddate)?.dateFormat}
                                            </span>
                                        </td>
                                    ),
                                },
                                {
                                    field: 'displayScheduledate',
                                    title: 'Sent on',
                                    width: 150,
                                    filter: 'date',
                                    cell: ({ dataItem, field }) => {
                                        // return <td>{dateFormat(dataItem?.[field])}</td>;
                                        return <td>{getUserCurrentFormat(dataItem?.[field])?.dateFormat}</td>;
                                    },
                                },
                                { field: 'channelName', title: 'Channel name', width: 150, filter: 'text' },
                                // { field: 'deliveryMethod', title: 'Delivery method', width: 150, filter: 'text' },
                                { field: 'triggerSource', title: 'Product', width: 150, filter: 'text' },
                                { field: 'productCategory', title: 'Product category', width: 180, filter: 'text' },
                                { field: 'subProductCategory', title: 'Sub product category', width: 200, filter: 'text' },
                                { field: 'totalValidFileCount', title: 'Total events', width: 150, filter: 'text', cell: ({ dataItem, field }) => {
                                        return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                    }, },
                                // {
                                //     field: 'sent',
                                //     title: 'Sent',
                                //     width: 100,
                                //     filter: 'text',
                                //     cell: ({ dataItem, field }) => {
                                //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                //     },
                                // },
                                // {
                                //     field: 'delivered',
                                //     title: 'Delivered',
                                //     width: 100,
                                //     filter: 'text',
                                //     cell: ({ dataItem, field }) => {
                                //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                //     },
                                // },
                                // {
                                //     field: 'opened',
                                //     title: 'Opened',
                                //     width: 100,
                                //     filter: 'text',
                                //     cell: ({ dataItem, field }) => {
                                //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                //     },
                                // },
                                // {
                                //     field: 'clicked',
                                //     title: 'Clicked',
                                //     width: 100,
                                //     filter: 'text',
                                //     cell: ({ dataItem, field }) => {
                                //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                //     },
                                // },
                                // {
                                //     field: 'reachPercentage',
                                //     title: 'Reach %',
                                //     width: 100,
                                //     filter: 'text',
                                //     cell: ({ dataItem, field }) => {
                                //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                //     },
                                // },
                                // {
                                //     field: 'engagementPercentage',
                                //     title: 'Engagement %',
                                //     width: 150,
                                //     filter: 'text',
                                //     cell: ({ dataItem, field }) => {
                                //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                //     },
                                // },
                                // {
                                //     field: 'conversion',
                                //     title: 'Conversion',
                                //     width: 150,
                                //     filter: 'text',
                                //     cell: ({ dataItem, field }) => {
                                //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                //     },
                                // },
                                // {
                                //     field: 'conversionPercentage',
                                //     title: 'Conversion %',
                                //     width: 150,
                                //     filter: 'text',
                                //     cell: ({ dataItem, field }) => {
                                //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                //     },
                                // },
                                // {
                                //     field: 'hardBounced',
                                //     title: 'Hard bounced',
                                //     width: 150,
                                //     filter: 'text',
                                //     cell: ({ dataItem, field }) => {
                                //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                //     },
                                // },
                                // {
                                //     field: 'softBounced',
                                //     title: 'Soft bounced',
                                //     width: 150,
                                //     filter: 'text',
                                //     cell: ({ dataItem, field }) => {
                                //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                //     },
                                // },
                                // {
                                //     field: 'quarantined',
                                //     title: 'Quarantined',
                                //     width: 150,
                                //     filter: 'text',
                                //     cell: ({ dataItem, field }) => {
                                //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                //     },
                                // },
                                // {
                                //     field: 'campaignmanager',
                                //     title: 'Communication manager',
                                //     width: 150,
                                //     filter: 'text',
                                // },
                                // { field: 'productmanager', title: 'Product manager', width: 150, filter: 'text' },
                                // { field: 'productname', title: 'Product name', width: 150, filter: 'text' },
                                // {
                                //     field: 'costcode',
                                //     title: 'Cost code',
                                //     width: 100,
                                //     filter: 'text',
                                //     cell: ({ dataItem, field }) => {
                                //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                //     },
                                // },
                                // {
                                //     field: 'costcodedollar',
                                //     title: 'Cost ($)',
                                //     width: 100,
                                //     filter: 'text',
                                //     cell: ({ dataItem, field }) => {
                                //         return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                //     },
                                // },
                                // {
                                //     field: 'Attachment',
                                //     title: 'Attachment',
                                //     width: 130,
                                //     filter: 'text',
                                //     cell: ({ dataItem, field }) => {
                                //         return (
                                //             <td>
                                //                 <RSTooltip text="Download" position="top">
                                //                     <i
                                //                         id="rs_data_download"
                                //                         className={`${download_medium} icon-md color-primary-blue`}
                                //                     ></i>
                                //                 </RSTooltip>
                                //             </td>
                                //         );
                                //     },
                                // },
                            ]}
                        />{' '}
                    </div>
                </>
            ) : (
                <div className=" ">
                    <RSSkeletonTable text={true} count={5} />
                </div>
            )}
        </Fragment>
    );
};

export default ConsumptionEvents;
