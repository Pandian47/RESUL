import { getUserCurrentFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { numberWithCommas } from 'Utils/modules/formatters';
import { download_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import KendoGrid from 'Components/RSKendoGrid';

import RSTooltip from 'Components/RSTooltip';
import { map as _map } from 'Utils/modules/lodashReplacements';
import { getSessionId } from 'Reducers/globalState/selector';
import { getConsumptionChannelDetails } from 'Reducers/preferences/consumptions/request';
import useQueryParams from 'Hooks/useQueryParams';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import ConsumptionChannelHeader from '../../ConsumptionChannelHeader/ConsumptionChannelHeader';
import { commonConsumptionColumns } from '../../../../constant';
const ConsumptionOfers = () => {
    const { u_consumptionMM, u_consumptionYY, consumptionYY, consumptionMM, consumptionChannel } = useSelector(
        ({ globalstate }) => globalstate,
    );
    const currentDate = new Date().toDateString();
    const [consumptionChannelList, setConsumptionChannelList] = useState([]);
    const isLoading = useSelector((state) => state.consumptionReducer?.loading?.consumption_channel_detail || false);
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
        channelId: 21,
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
    const handleConsumptionChannelDetails = async (params) => {
        let { status, data } = await dispatch(getConsumptionChannelDetails(params));
        //console.log('status getConsumptionChannelDetails: ', data);
        if (status) {
            setConsumptionChannelList(data);
        } else {
            setConsumptionChannelList([]);
        }
    };
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
    return (
        <Fragment>
            {' '}
            {/* {consumptionChannelList?.whatsAppChannelConsumptionList?.length ? ( */}
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
                            data={[]}
                            isLoading={isLoading}
                            isConsumption
                            scrollable={'scrollable'}
                            pagerChange={paginationParams?.initialPagination}
                            onDataStateChange={(data) => handlePagerChange(data)}
                            autoResizeSize
                            column={[
                                { field: 'campaignName', title: 'Offer name', width: 300 },
                                ...commonConsumptionColumns(),
                                {
                                    field: 'startDate',
                                    title: 'Start date',
                                    width: 150,
                                    cell: ({ dataItem, field }) => {
                                        // return <td>{dateFormat(dataItem?.[field])}</td>;
                                        return <td>{getUserCurrentFormat(dataItem?.[field])?.dateFormat}</td>;
                                    },
                                },
                                { field: 'offerType', title: 'Offer type', width: 150 },
                                { field: 'channel', title: 'Channel', width: 150 },
                                {
                                    field: 'impressions',
                                    title: 'Impressions',
                                    width: 100,
                                    cell: ({ dataItem, field }) => {
                                        return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                    },
                                },
                                {
                                    field: 'clicked',
                                    title: 'Clicked',
                                    width: 100,
                                    cell: ({ dataItem, field }) => {
                                        return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                    },
                                },

                                { field: 'campaignmanager', title: 'Communication manager', width: 150 },
                                { field: 'productmanager', title: 'Product manager', width: 150 },
                                { field: 'productname', title: 'Product name', width: 150 },
                                {
                                    field: 'costcode',
                                    title: 'Cost code',
                                    width: 100,
                                    cell: ({ dataItem, field }) => {
                                        return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                    },
                                },
                                {
                                    field: 'costcodedollar',
                                    title: 'Cost ($)',
                                    width: 100,
                                    cell: ({ dataItem, field }) => {
                                        return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                    },
                                },
                                {
                                    field: 'Attachment',
                                    title: 'Attachment',
                                    width: 130,
                                    cell: ({ dataItem, field }) => {
                                        return (
                                            <td>
                                                <RSTooltip text="Download" position="top">
                                                    <i
                                                        id="rs_data_download"
                                                        className={`${download_medium} icon-md color-primary-blue`}
                                                    ></i>
                                                </RSTooltip>
                                            </td>
                                        );
                                    },
                                },
                            ]}
                        />{' '}
                    </div>
                </>
            {/* ) : (
                <div className=" ">
                    <RSSkeletonTable text={true} count={5} />
                </div>
            )} */}
        </Fragment>
    );
};

export default ConsumptionOfers;
