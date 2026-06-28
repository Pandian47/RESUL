import { download_medium } from 'Constants/GlobalConstant/Glyphicons';
import { encodeUrl } from 'Utils/modules/crypto';
import { getUserCurrentFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { numberWithCommas } from 'Utils/modules/formatters';
import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import KendoGrid from 'Components/RSKendoGrid';

import RSTooltip from 'Components/RSTooltip';

import { getSessionId } from 'Reducers/globalState/selector';
import { getConsumptionChannelDetails } from 'Reducers/preferences/consumptionsTwins/request';
import useQueryParams from 'Hooks/useQueryParams';
import ConsumptionChannelHeader from '../../ConsumptionChannelHeader/ConsumptionChannelHeader';
import { updateAnalyticsDetail } from 'Reducers/analytics/communicationAnalytics/reducer';
import { useNavigate } from 'react-router-dom';
const ConsumptionSmartLinks = () => {
    const navigate = useNavigate();
    const { u_consumptionMM, u_consumptionYY, consumptionYY, consumptionMM, consumptionChannel } = useSelector(
        ({ globalstate }) => globalstate,
    );
    const isLoading = useSelector((state) => state.consumptionReducer?.loading?.consumption_channel_detail || false);
    const currentDate = new Date().toDateString();
    const [consumptionChannelList, setConsumptionChannelList] = useState([]);
    const dispatch = useDispatch();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const location = useQueryParams('/preferences/consumptionsTwins/consumption-channel');
    const [custColumns, setCustColumns] = useState(['dd', 'dd1', 'dd2']);
    const [params, setParams] = useState({
        departmentId,
        clientId,
        userId,
        month: consumptionMM + 1,
        year: consumptionYY,
        channelId: 120,
        pageNo: 1,
        pageSize: 5,
        searchText: '',
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
    const handleConsumptionChannelDetails = useCallback(async (params) => {
        let { status, data } = await dispatch(getConsumptionChannelDetails(params));
        //console.log('status getConsumptionChannelDetails: ', data);
        if (status) {
            setConsumptionChannelList(data);
        } else {
            setConsumptionChannelList([]);
        }
    }, [dispatch]);
    // Consolidated useEffect to handle all parameter updates
    useEffect(() => {
        const newParams = {
            departmentId,
            clientId,
            userId,
            month: u_consumptionMM + 1,
            year: u_consumptionYY,
            channelId: 120,
            pageNo: 1,
            pageSize: 5,
            searchText: params.searchText || '',
        };
        
        // Only update params if they have actually changed
        const hasChanged = Object.keys(newParams).some(key => newParams[key] !== params[key]);
        if (hasChanged) {
            setParams(newParams);
        }
    }, [departmentId, clientId, userId, u_consumptionMM, u_consumptionYY]);

    // Separate useEffect for API call with proper dependency
    useEffect(() => {
        if (params.departmentId && params.clientId && params.userId) {
            handleConsumptionChannelDetails(params);
        }
    }, [params.departmentId, params.clientId, params.userId, params.month, params.year, params.searchText, handleConsumptionChannelDetails]);
    
    const handleSearchFilter = useCallback((searchName) => {
        setParams((pre) => ({
            ...pre,
            searchText: searchName,
        }));
    }, []);
    const handleDateFilter = (date) => {
        setParams((pre) => ({
            ...pre,

            startDate: getYYMMDD(date.startDate),
            endDate: getYYMMDD(date.endDate),
        }));
    };
    
    return (
        <Fragment>
            {consumptionChannelList?.length > 0 || consumptionChannelList ? (
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

                    {consumptionChannelList?.smartURls !== null ? (
                        <div className="mb70">
                            <KendoGrid
                                data={consumptionChannelList?.smartURls}
                                isLoading={isLoading}
                                isFailure={!consumptionChannelList?.length}
                                settings={{ total: consumptionChannelList?.totalRows }}
                                scrollable={'scrollable'}
                                pagerChange={paginationParams?.initialPagination}
                                pageable={true}
                                onDataStateChange={(data) => handlePagerChange(data)}
                                autoResizeSize
                            column={[
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
                                                                    channelId: 21,
                                                                    currIndex:
                                                                        dataItem?.deliveryMethod ===
                                                                        'Multi dimension'
                                                                            ? dataItem?.mdcLevel - 1
                                                                            : 0,
                                                                }),
                                                            );
                                                            const state = {
                                                                channelName: consumptionChannel?.lable,
                                                                campaignId: dataItem?.campaignID,
                                                                channelId: 21,
                                                                iswinnerSplit: dataItem?.iswinnerSplit,  
                                                                iswinnerSplitType: dataItem?.iswinnerSplitType,
                                                                isSplitAB: dataItem?.isSplitAB
                                                            };
                                                            const encryptState = encodeUrl(state);
                                                            navigate(
                                                                `/analytics/detail-analytics?q=${encryptState}`,
                                                                {
                                                                    state,
                                                                },
                                                            );
                                                        }}
                                                    >
                                                        {dataItem?.[field]?.length > 28 ? (
                                                            <RSTooltip
                                                                text={`${dataItem?.[field]}`}
                                                                position="top"
                                                                innerContent={false}
                                                            >
                                                                <span className="m0">
                                                                    {truncateTitle(dataItem?.[field], 28)}
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
                                    field: 'scheduledate',
                                    title: 'Sent on',
                                    width: 150,
                                   filter: 'date',
                                    cell: ({ dataItem, field }) => {
                                        // return <td>{dateFormat(dataItem?.[field])}</td>;
                                        return <td>{getUserCurrentFormat(dataItem?.[field])?.dateFormat}</td>;
                                    },
                                },
                                { field: 'deliveryMethod', title: 'Delivery method', width: 180 ,filter: 'text',},
                                { field: 'smartUrl', title: 'Smartlink', width: 200,filter: 'text',cell: ({ dataItem }) => (
                                    <td>
                                        {dataItem?.smartUrl?.length > 30 ? (
                                            <RSTooltip
                                                text={dataItem?.smartUrl}
                                                position="top"
                                                // className="d-inline-block"
                                                innerContent={false}
                                            >
                                                <span className="m0">
                                                    {truncateTitle(dataItem?.smartUrl, 30)}
                                                </span>
                                            </RSTooltip>
                                        ) : (
                                            <span className="m0">{dataItem?.smartUrl}</span>
                                        )}
                                    </td>
                                ), },
                                {
                                    field: 'smartURlsClickCount',
                                    title: 'Clicked',
                                    width: 100,
                                    filter: 'numeric', 
                                    cell: ({ dataItem, field }) => {
                                        return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                    },
                                },
                                {
                                    field: 'totalbase',
                                    title: 'Total audience',
                                    width: 120,
                                    filter: 'numeric', 
                                    cell: ({ dataItem, field }) => {
                                        return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                    },
                                },
                                // { field: 'campaignmanager', title: 'Communication manager', width: 150 ,filter: 'text',},
                                // { field: 'productmanager', title: 'Product manager', width: 150,filter: 'text', },
                                // { field: 'productname', title: 'Product name', width: 150 ,filter: 'text',},

                                // {
                                //     field: 'Attachment',
                                //     title: 'Attachment',
                                //     width: 130,
                                //     cell: ({ dataItem, field }) => {
                                //         return (
                                //             <td>
                                //                 <RSTooltip text="Download" position="top">
                                //                     <i
                                //                         id='rs_data_download'
                                //                         className={`${download_medium} icon-md color-primary-blue`}
                                //                     ></i>
                                //                 </RSTooltip>
                                //             </td>
                                //         );
                                //     },
                                // },
                            ]}
                        />
                        </div>
                    ) : (
                        <HorizontalSkeleton
                            isError={
                                consumptionChannelList?.smartURls === null ||
                                consumptionChannelList?.smartURls?.length === 0
                            }
                        />
                    )}
                </>
            ) : (
                <HorizontalSkeleton
                    isError={consumptionChannelList?.length === 0 || !consumptionChannelList}
                />
            )}
        </Fragment>
    );
};

export default ConsumptionSmartLinks;
