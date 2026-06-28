import { encodeUrl } from 'Utils/modules/crypto';
import { getDateWithDaynoFormat, getUserCurrentFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { numberWithCommas } from 'Utils/modules/formatters';
import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import { Fragment, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import KendoGrid from 'Components/RSKendoGrid';

import RSTooltip from 'Components/RSTooltip';

import _map from 'lodash/map';
import { getSessionId } from 'Reducers/globalState/selector';
import { getConsumptionChannelDetails } from 'Reducers/preferences/consumptions/request';
import useQueryParams from 'Hooks/useQueryParams';
import ConsumptionChannelHeader from '../../ConsumptionChannelHeader/ConsumptionChannelHeader';
import { updateAnalyticsDetail } from 'Reducers/analytics/communicationAnalytics/reducer';
import { useNavigate } from 'react-router-dom';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import { commonConsumptionColumns } from '../../../../constant';

const ConsumptionQr = () => {
    const { u_consumptionMM, u_consumptionYY, consumptionYY, consumptionMM, consumptionChannel } = useSelector(
        ({ globalstate }) => globalstate,
    ); 
    const navigate = useNavigate();
    const currentDate = new Date().toDateString();
    const isLoading = useSelector((state) => state.consumptionReducer?.loading?.consumption_channel_detail || false);
    const [consumptionChannelList, setConsumptionChannelList] = useState({});
    const dispatch = useDispatch();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const location = useQueryParams('/preferences/consumptions/consumption-channel');
    const [custColumns, setCustColumns] = useState(['dd', 'dd1', 'dd2']);
    const [params, setParams] = useState({
        departmentId,
        clientId,
        userId,
        month: consumptionMM + 1,
        year: consumptionYY,
        channelId: 3,
        pageNo: 1,
        pageSize: 5,
        searchText: '',
        startDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
        endDate: getYYMMDD(new Date()),
    });
    const [paginationParams, setPaginationParams] = useState({
        skip: 0,
        take: 5,
        initialPagination: false,
    });

    const handlePagerChange = (data) => {
        const { skip, take } = data?.dataState;
        setPaginationParams({ skip, take });
    };
    // const handlePagerChange = (data) => {
    //     const { skip, take } = data?.dataState ?? {};
    //     setParams((prev) => ({
    //         ...prev,
    //         pageNo: skip === 0 ? 1 : skip / take + 1,
    //         pageSize: take,
    //     }));
    // };

    const handleConsumptionChannelDetails = async (params) => {
        let { status, data } = await dispatch(getConsumptionChannelDetails(params));
        //console.log('status getConsumptionChannelDetails: ', data);
        if (status) {
            setConsumptionChannelList(data);
        } else {
            setConsumptionChannelList([]);
        }
    };
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
    useEffect(() => {
        setParams((prev) => ({
            ...prev,
            departmentId,
            clientId,
            userId,
        }));
    }, [departmentId, clientId, userId]);

    // useEffect(() => {
    //     handleConsumptionChannelDetails(params);
    // }, [params, custColumns]);
    // useEffect(() => {
    //     handleConsumptionChannelDetails(params);
    // }, []);
    useEffect(() => {
        setParams((pre) => ({
            ...pre,
            month: u_consumptionMM + 1,
            year: u_consumptionYY,
        }));
    }, [u_consumptionMM, u_consumptionYY]);
    useEffect(() => {
        const tableName = _map(custColumns, (res, key) => {
            return { field: res, title: res, width: 150 };
        });
        setCustColumns(tableName);
    }, []);
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
    useEffect(() => {
        const tableName = _map(custColumns, (res, key) => {
            return { field: res, title: res, width: 150 };
        });
        setCustColumns(tableName);
    }, []);

    useEffect(() => {
        const qrData = consumptionChannelList?.qrChannelConsumptionList;
    }, [consumptionChannelList?.qrChannelConsumptionList]);

    return (
        <Fragment>
            {/* {consumptionChannelList?.length > 0 || consumptionChannelList ? ( */}
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
                            </ul>
                        </Col>
                    </Row> */}

                    <ConsumptionChannelHeader
                        setConsumptionChannelList={setConsumptionChannelList}
                        setCustColumns={setCustColumns}
                        paginationParams={paginationParams}
                        setPaginationParams={setPaginationParams}
                    />

                    {/* {consumptionChannelList?.qrChannelConsumptionList !== null ? ( */}
                        <div className="mb70">
                            <KendoGrid
                                data={consumptionChannelList?.qrChannelConsumptionList}
                                isLoading={isLoading}
                                isConsumption
                                isFailure={!consumptionChannelList?.length}
                                settings={{ total: consumptionChannelList?.totalRows }}
                                scrollable={'scrollable'}
                                pagerChange={paginationParams?.initialPagination}
                                // isDataStateRequired
                                pageable={true}
                                onDataStateChange={(data) => handlePagerChange(data)}
                                autoResizeSize
                                column={[
                                    {
                                        field: 'campaignName',
                                        title: 'Communication name',
                                        width: 250,
                                        filter: 'text',
                                        cell: ({ dataItem }) => (
                                            <td>
                                                <span
                                                    className="cursor-pointer link-underline-hover color-primary-black"
                                                    onClick={() => {
                                                        dispatch(
                                                            updateAnalyticsDetail({
                                                                channelName: consumptionChannel?.lable,
                                                                campaignId: dataItem?.campaignID,
                                                                from: 'analytics',
                                                                blastId: dataItem?.iswinnerB2 && dataItem?.iswinnerSplit ? dataItem?.iswinnerB2 : dataItem?.blastShortCode,
                                                                channelId: 3,
                                                                currIndex:
                                                                    dataItem?.deliveryMethod === 'Multi dimension'
                                                                        ? dataItem?.mdcLevel > 0
                                                                            ? dataItem?.mdcLevel - 1
                                                                            : 0
                                                                        : 0,
                                                            }),
                                                        );
                                                        const state = {
                                                            channelName: consumptionChannel?.lable,
                                                            campaignId: dataItem?.campaignID,
                                                            channelId: 3,
                                                            iswinnerSplit: dataItem?.iswinnerSplit,
                                                            iswinnerSplitType: dataItem?.iswinnerSplitType,
                                                            isSplitAB: dataItem?.isSplitAB,
                                                            iswinnerBlastId: dataItem?.iswinnerSplit && dataItem?.iswinnerB2 ? dataItem?.iswinnerB2 : '',
                                                        };
                                                        const encryptState = encodeUrl(state);
                                                        navigate(`/analytics/detail-analytics?q=${encryptState}`, {
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
                                                    {/* <td> */}
                                                        {dataItem?.campaignName?.length> 20 ? (
                                                            <RSTooltip
                                                                text={`${dataItem?.campaignName}`}
                                                                position="top"
                                                                className="color-primary-black"
                                                                innerContent={false}
                                                            >
                                                                <span className="color-primary-black">
                                                                    {truncateTitle(dataItem?.campaignName, 20)}
                                                                </span>
                                                            </RSTooltip>
                                                        ) : (
                                                            <span className="m0">{dataItem?.campaignName}</span>
                                                        )}
                                                    {/* </td> */}
                                                </span>
                                            </td>
                                        ),
                                    },
                                    ...commonConsumptionColumns(),
                                    {
                                        field: 'displayStartdate',
                                        title: 'Start date',
                                        width: 180,
                                        filter: 'date',
                                        cell: ({ dataItem, field }) => {
                                            // return <td>{dateFormat(dataItem?.[field])}</td>;
                                            return <td>{getUserCurrentFormat(dataItem?.[field])?.dateFormat}</td>;
                                        },
                                    },
                                    {
                                        field: 'displayEnddate',
                                        title: 'End date',
                                        width: 180,
                                        filter: 'date',
                                        cell: ({ dataItem, field }) => {
                                            // return <td>{dateFormat(dataItem?.[field])}</td>;
                                            return <td>{getUserCurrentFormat(dataItem?.[field])?.dateFormat}</td>;
                                        },
                                    },
                                    {
                                        field: 'displayScheduledate',
                                        title: 'Sent on',   
                                        width: 180,
                                        filter: 'date',
                                        cell: ({ dataItem, field }) => {
                                            // return <td>{dateFormat(dataItem?.[field])}</td>;
                                            return <td>{getUserCurrentFormat(dataItem?.[field])?.dateFormat}</td>;
                                        },
                                    },
                                    { field: 'campaignType', title: 'Communication type', width: 200 ,filter: 'text', },
                                    { field: 'deliveryMethod', title: 'Delivery method', width: 180,filter: 'text', },
                                    { field: 'productCategory', title: 'Product category', width: 170 , filter: 'text',
                                        cell: ({ dataItem }) => (
                                            <td>
                                                {dataItem?.productCategory?.length > 15 ? (
                                                    <RSTooltip
                                                        text={dataItem?.productCategory}
                                                        position="top"
                                                        className="d-inline-block"
                                                        innerContent={false}
                                                    >
                                                        <span className="m0">
                                                        {truncateTitle(dataItem?.productCategory, 15)}
                                                        </span>
                                                    </RSTooltip>
                                                ) : (
                                                    <span className="m0">{(dataItem?.productCategory)}</span>
                                                )}
                                            </td>
                                        ),
                                    },
                                    { field: 'subProductCategory', title: 'Sub product category', width: 200,filter: 'text', },
                                    {
                                        field: 'mdcLevel',
                                        title: 'MDC level',
                                        width: 120,
                                        filter: 'numeric',
                                        cell: ({ dataItem, field }) => {
                                            return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                        },
                                    },
                                    {
                                        field: 'subSegmentLevelFriendlyName',
                                        title: 'Subsegment level',
                                        width: 170,
                                        filter: 'numeric',
                                        cell: ({ dataItem, field }) => {
                                            return <td className="text-right">{dataItem?.[field]}</td>;
                                        },
                                    },
                                    { field: 'splitType', title: 'Split type', width: 150 ,filter: 'text',},
                                    {
                                        field: 'totalaudience',
                                        title: 'Audience count',
                                        width: 160,
                                        filter: 'numeric',
                                        cell: ({ dataItem, field }) => {
                                            return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                        },
                                    },
                                    {
                                        field: 'totalscans',
                                        title: 'Unique scans',
                                        width: 150,
                                        filter: 'numeric',
                                        cell: ({ dataItem, field }) => {
                                            return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                        },
                                    },
                                    {
                                        field: 'reachPercentage',
                                        title: 'Reach %',
                                        width: 100,
                                        filter: 'numeric',
                                        cell: ({ dataItem, field }) => {
                                            return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                        },
                                    },
                                    {
                                        field: 'linkclicks',
                                        title: 'Link clicks',
                                        width: 130,
                                        filter: 'numeric',
                                        cell: ({ dataItem, field }) => {
                                            return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                        },
                                    },
                                    {
                                        field: 'engagePercentage',
                                        title: 'Engagement %',
                                        width: 150,
                                        filter: 'numeric',
                                        cell: ({ dataItem, field }) => {
                                            return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                        },
                                    },
                                ]}
                            />
                        </div>
                    {/* ) : (
                        <HorizontalSkeleton
                            isError={
                                consumptionChannelList?.qrChannelConsumptionList === null ||
                                consumptionChannelList?.qrChannelConsumptionList?.length === 0
                            }
                        />
                    )} */}
                </>
            {/* ) : (
                <HorizontalSkeleton
                    isError={consumptionChannelList?.length === 0 || !consumptionChannelList}
                />
            )} */}
        </Fragment>
    );
};

export default ConsumptionQr;
