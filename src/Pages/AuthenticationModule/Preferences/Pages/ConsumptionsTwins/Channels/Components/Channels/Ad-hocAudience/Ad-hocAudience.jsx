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
const ConsumptionAdhocAudience = () => {
    const { u_consumptionMM, u_consumptionYY, consumptionYY, consumptionMM, consumptionChannel } = useSelector(
        ({ globalstate }) => globalstate,
    );
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
        channelId: 21,
        pageNo: 1,
        pageSize: 5,
        searchText: '',
        startDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
        endDate: getYYMMDD(new Date()),
    });
    const isLoading = useSelector((state) => state.consumptionReducer?.loading?.consumption_channel_detail || false);
    const handlePagerChange = (data) => {
        const { skip, take } = data?.dataState ?? {};
        setParams((prev) => ({
            ...prev,
            pageNo: skip === 0 ? 1 : skip / take + 1,
            pageSize: take,
        }));
    };
    const handleConsumptionChannelDetails = async (params) => {
        let { status, data } = await dispatch(getConsumptionChannelDetails(params));
        if (status) {
            const tableName = _map(data?.mobileChannelConsumptionList[0]?.custom, (res, key) => {
                return { field: res, title: res, width: 150 };
            });
            setCustColumns(tableName);
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
    }, [params]);

    useEffect(() => {
        setParams((pre) => ({
            ...pre,
            month: u_consumptionMM + 1,
            year: u_consumptionYY,
        }));
    }, [u_consumptionMM, u_consumptionYY]);

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
                        handleSearchFilter={handleSearchFilter}
                        handleDateFilter={handleDateFilter}
                    />

                    <div className="mb70">
                        <KendoGrid
                            data={[]}
                            isLoading={isLoading}
                            scrollable={'scrollable'}
                            column={[
                                { field: 'campaignName', title: 'List name', width: 300, filter: 'text', },
                                {
                                    field: 'scheduledate',
                                    title: 'Uploaded on',
                                    width: 150,
                                    filter: 'date',
                                    cell: ({ dataItem, field }) => {
                                        // return <td>{dateFormat(dataItem?.[field])}</td>;
                                        return <td>{getUserCurrentFormat(dataItem?.[field])?.dateFormat}</td>;
                                    },
                                },
                                {
                                    field: 'audienceCount',
                                    title: 'Audience count',
                                    width: 100,
                                    filter: 'text',
                                    cell: ({ dataItem, field }) => {
                                        return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
                                    },
                                },
                                { field: 'dataSize', title: 'Data size', width: 150, filter: 'text', },
                                { field: 'uploadedBy', title: 'Uploaded by', width: 150, filter: 'text', },
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

export default ConsumptionAdhocAudience;
