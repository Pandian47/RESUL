import { download_medium } from 'Constants/GlobalConstant/Glyphicons';
import { getYYMMDD, getDateWithDaynoFormat, getUserCurrentFormat } from 'Utils/modules/dateTime';
import { numberWithCommas } from 'Utils/modules/formatters';
import { Fragment, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import KendoGrid from 'Components/RSKendoGrid';


import { map as _map } from 'Utils/modules/lodashReplacements';
import { getSessionId } from 'Reducers/globalState/selector';
import { getConsumptionChannelDetails } from 'Reducers/preferences/consumptionsTwins/request';
import useQueryParams from 'Hooks/useQueryParams';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import RSSearchField from 'Components/RSSearchField';
import { Col, Row } from 'react-bootstrap';
import ConsumptionChannelHeader from '../../ConsumptionChannelHeader/ConsumptionChannelHeader';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
const ConsumptionVoice = () => {
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
        channelId: 26,
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
    useEffect(() => {
        setParams((prev) => ({
            ...prev,
            departmentId,
            clientId,
            userId,
        }));
    }, [departmentId, clientId, userId]);

    useEffect(() => {
        handleConsumptionChannelDetails(params);
    }, [params, custColumns]);
    useEffect(() => {
        handleConsumptionChannelDetails(params);
    }, []);
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
            {consumptionChannelList?.whatsAppChannelConsumptionList?.length ? (
                <>
                    <Row className="my10 align-items-center d-none">
                        <Col md={6} className="d-flex align-items-center">
                            <h3 className="d-flex align-items-center">
                                {consumptionChannel?.lable}{' '}
                                <small className="color-primary-grey ml10 position-relative top1">
                                    {/* (As on: {dateFormat(currentDate)}) */}
                                    (As on: {getUserCurrentFormat(currentDate)?.dateFormat})
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
                    </Row>

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
                            onDataStateChange={(data) => handlePagerChange(data)}
                            pagerChange={paginationParams?.initialPagination}
                            scrollable={'scrollable'}
                            autoResizeSize
                            column={[
                                { field: 'campaignName', title: 'Communication name', width: 300, filter: 'text' },
                                {
                                    field: 'scheduledate',
                                    title: 'Sent on',
                                    width: 150,
                                    filter: 'text',
                                    cell: ({ dataItem, field }) => {
                                        // return <td>{dateFormat(dataItem?.[field])}</td>;
                                        return <td>{getUserCurrentFormat(dataItem?.[field])?.dateFormat}</td>;
                                    },
                                },
                                { field: 'communicationType', title: 'Communication type', width: 150, filter: 'text' },
                                { field: 'deliveryMethod', title: 'Delivery method', width: 150, filter: 'text' },
                                { field: 'smartLink', title: 'Smartlink', width: 150, filter: 'text' },
                                {
                                    field: 'clicked',
                                    title: 'Clicked',
                                    width: 100,
                                    filter: 'text',
                                    cell: ({ dataItem, field }) => {
                                        return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                    },
                                },

                                { field: 'campaignmanager', title: 'Communication manager', width: 150, filter: 'text' },
                                { field: 'productmanager', title: 'Product manager', width: 150, filter: 'text' },
                                { field: 'productname', title: 'Product name', width: 150, filter: 'text' },

                                // {
                                //     field: 'Attachment',
                                //     title: 'Attachment',
                                //     width: 130,
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

export default ConsumptionVoice;
