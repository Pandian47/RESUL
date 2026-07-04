import {
    convertToUserTimezone,
    getCurrentDateOfMonth,
    getDateWithDaynoFormat,
    getFirstDayOfMonth,
    getUserCurrentFormatWithAbbreviation,
    getYYMM,
    getYYMMDD,
} from 'Utils/modules/dateTime';
import { csv_download_large } from 'Constants/GlobalConstant/Glyphicons';
import RSSearchField from 'Components/RSSearchField';
import RSTooltip from 'Components/RSTooltip';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import {
    getConsumptionChannelDetails,
    getConsumptionChannelDetailsDownload,
} from 'Reducers/preferences/consumptionsTwins/request';

import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import { globalStateSelector } from 'Utils/Selectors/app';
import { getSessionId, getUtcTimeData } from 'Reducers/globalState/selector';
const ConsumptionChannelHeader = ({
    setCustColumns,
    setConsumptionChannelList,
    paginationParams,
    setPaginationParams,
    customFilterValue,
    onDateChange,
    onSearchChange,
    onDownloadCSV,
}) => {
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const utcTimeData = useSelector((state) => getUtcTimeData(state));
    const { u_consumptionMM, u_consumptionYY, consumptionMM, consumptionYY, consumptionChannel } = useSelector(
        (state) => globalStateSelector(state),
    );
    const dispatch = useDispatch();
    const isVersium = consumptionChannel?.lable === 'Versium' || consumptionChannel?.isVersium;
    const channelLabel = isVersium ? 'Versium' : (consumptionChannel?.lable || '');
    let [lastestUpdateJobTime, setLastestUpdateJobTime] = useState(new Date());
    
    // Use UTC time from API if available, otherwise fallback to system time
    const currentUTCdateTime = utcTimeData.utcTime ? new Date(utcTimeData.utcTime.replace('Z', '')) : new Date();

    // Call UTC time API when component mounts
    // useEffect(() => {
    //     dispatch(getUtcTimeNow());
    // }, [dispatch]);

    // Helper functions to get timezone-adjusted dates
    const getTimezoneAdjustedFirstDayOfMonth = (year, month) => {
        const systemDate = new Date(getFirstDayOfMonth(year, month));
        return convertToUserTimezone(systemDate, { formatAsString: false });
    };

    const getTimezoneAdjustedCurrentDateOfMonth = (year, month) => {
             const systemDate = new Date(getCurrentDateOfMonth(year, month));
        return convertToUserTimezone(systemDate, { formatAsString: false });
    };

    const [updateConsumptionDate, setUpdateConsumptionDate] = useState(() => {
        if (isVersium) {
            const end = new Date();
            const start = getDateWithDaynoFormat(LAST30DAYS_DATEFILTER);
            return { startDate: start, endDate: end };
        }
        return {
            startDate: getFirstDayOfMonth(u_consumptionYY, consumptionMM + 1),
            endDate: getCurrentDateOfMonth(u_consumptionYY, consumptionMM + 1),
        };
    });

    const [params, setParams] = useState({
        departmentId,
        clientId,
        userId,
        month: u_consumptionMM + 1,
        year: u_consumptionYY,
        channelId: consumptionChannel?.id,
        pageNo: 1,
        pageSize: 5,
        searchText: '',
        startDate: getYYMMDD(getFirstDayOfMonth(u_consumptionYY, u_consumptionMM + 1)),
        endDate: getYYMMDD(getCurrentDateOfMonth(u_consumptionYY, u_consumptionMM + 1)),
    });

    const paramsRef = useRef();
    const [isCloseSearch, setIsCloseSearch] = useState(false);

    const [paramsDownload, setParamsDownload] = useState({
        departmentId,
        clientId,
        userId,
        month: u_consumptionMM + 1,
        year: u_consumptionYY,
        channelId: consumptionChannel?.id,
          startDate: getYYMMDD(getFirstDayOfMonth(u_consumptionYY, u_consumptionMM + 1)),
        endDate: getYYMMDD(getCurrentDateOfMonth(u_consumptionYY, u_consumptionMM + 1)),
    });

    const downloadConsumptionData = async () => {
        if (onDownloadCSV) {
            onDownloadCSV();
            return;
        }
        let res = await dispatch(getConsumptionChannelDetailsDownload(paramsDownload));
        //downloadCSVcommasFile(res, 'SMS_' + new Date().toLocaleDateString() + '_' + new Date().toLocaleTimeString());
        downloadCSVcommasFileLangSupport(
            res,
            'Consumption Report' + '_' + getYYMM(paramsDownload.startDate) + '_' + consumptionChannel?.lable,
        );
    };

    useEffect(() => {
        const { skip, take } = paginationParams;
        setParams((prev) => ({
            ...prev,
            pageNo: skip === 0 ? 1 : skip / take + 1,
            pageSize: take,
        }));
    }, [paginationParams]);

    useEffect(() => {
        if (customFilterValue) {
            setParams((pre) => ({
                ...pre,
                customFilteration: customFilterValue,
            }));
        }
    }, [customFilterValue]);

    useEffect(() => {
        setParams((pre) => ({
            ...pre,
            month: u_consumptionMM + 1,
            year: u_consumptionYY,
           startDate: getYYMMDD(getFirstDayOfMonth(u_consumptionYY, u_consumptionMM + 1)),
            endDate: getYYMMDD(getCurrentDateOfMonth(u_consumptionYY, u_consumptionMM + 1)),
        }));
    }, [u_consumptionMM, u_consumptionYY]);

    const handleConsumptionChannelDetails = async (params) => {
        let { status, data } = await dispatch(getConsumptionChannelDetails(params));
        if (status) {
            setLastestUpdateJobTime(data?.lastUpdatedTime || new Date());
            setConsumptionChannelList(data);
            // const tableName =
            //     Array.isArray(data?.emailChannelConsumptionList?.[0]?.custom) &&
            //     data.emailChannelConsumptionList[0]?.custom?.length > 0
            //         ? _map(data.emailChannelConsumptionList[0].custom, (res, key) => {
            //               return { field: res, title: res, width: 150 };
            //           })
            //         : [];
            // setCustColumns(tableName);
        } else {
            setLastestUpdateJobTime(new Date());
            setConsumptionChannelList([]);
        }
    };

    useEffect(() => {
        if (isVersium) {
            return;
        }
        if (!paramsRef.current || JSON.stringify(paramsRef.current) !== JSON.stringify(params)) {
            handleConsumptionChannelDetails(params);
            paramsRef.current = params;
        }
    }, [paginationParams, params, isVersium]);

    useEffect(() => {
        if (isVersium) {
            const end = new Date();
            const start = getDateWithDaynoFormat(LAST30DAYS_DATEFILTER);
            setUpdateConsumptionDate({ startDate: start, endDate: end });
        } else {
            setUpdateConsumptionDate({
                startDate: getTimezoneAdjustedFirstDayOfMonth(u_consumptionYY, u_consumptionMM + 1),
                endDate: getTimezoneAdjustedCurrentDateOfMonth(u_consumptionYY, u_consumptionMM + 1),
            });
        }
    }, [u_consumptionMM, u_consumptionYY, isVersium]);

    useEffect(() => {
        setParamsDownload((pre) => ({
            ...pre,
            month: u_consumptionMM + 1,
            year: u_consumptionYY,
            startDate: getYYMMDD(getFirstDayOfMonth(u_consumptionYY, u_consumptionMM + 1)),
            endDate: getYYMMDD(getCurrentDateOfMonth(u_consumptionYY, u_consumptionMM + 1)),
        }));
    }, [u_consumptionMM, u_consumptionYY]);

    const handleInitialState = () => {
        return setPaginationParams({
            skip: 0,
            take: 5,
            initialPagination: true,
        });
    };

    useEffect(() => {
        setParams((prev) => ({
            ...prev,
            departmentId,
            clientId,
            searchText: ''
        }));
        setParamsDownload((prev) => ({
            ...prev,
            departmentId,
            clientId,
        }));
        setIsCloseSearch(true);
        handleInitialState();
    }, [departmentId, clientId, u_consumptionMM, u_consumptionYY]);

    const handleSearchFilter = (searchName) => {
        if (onSearchChange) {
            onSearchChange(searchName);
            return;
        }
        handleInitialState();
        setParams((pre) => ({
            ...pre,
            searchText: searchName,
        }));
    };
    const handleDateFilter = (date) => {
        if (onDateChange) {
            onDateChange(date);
            return;
        }
        
        handleInitialState();
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

     const handleOnblurData = () =>{
        if (onSearchChange) {
            onSearchChange('');
            return;
        }
        setParams((pre) => ({
            ...pre,
            searchText: '',
        }));
     }

    const currentDate = new Date().toDateString();
    return (
        <Fragment>
            <Row className="mb10 align-items-center consumptionEmail">
                <Col md={5} className="d-flex align-items-center">
                    <h3 className="d-flex align-items-center">
                        {channelLabel}
                        <small className="color-primary-grey ml10 position-relative top1">
                            {/* (As on: {getUserDateTimeFormat(currentDate + ' UTC', 'formatDateTime')}) */}
                            (As on:{' '}
                            {
                                getUserCurrentFormatWithAbbreviation(lastestUpdateJobTime, { isOffset: true })
                                    ?.dateTimeFormat
                            }
                            )
                        </small>
                    </h3>
                </Col>
                <Col md={7}>
                    <ul className="rs-list-group-horizontal float-end">
                        {/* <li>
                            <RSDateRangePicker
                                onDatePickerClosed={handleDateFilter}
                                isConsumption={true}
                                consumptionStartDate={updateConsumptionDate.startDate}
                                consumptionEndDate={updateConsumptionDate.endDate}
                            />
                        </li> */}
                            <li className="ml15">
                                {' '}
                                <RSSearchField
                                    handleOnblur = {handleOnblurData}
                                    searchedText={handleSearchFilter}
                                    placeholder={'By communication name'}
                                    isCloseSearch={isCloseSearch}
                                    setIsCloseSearch={setIsCloseSearch}
                                />{' '}
                            </li>
                        <li className="ml15">
                            <RSTooltip text={'Download CSV'}>
                                <i
                                    onClick={() => {
                                        downloadConsumptionData();
                                        // downloadCSV(
                                        //     consumptionChannelList?.emailChannelConsumptionList,
                                        //     consumptionChannel?.lable + '_' + new Date().toDateString(),
                                        // );
                                    }}
                                    className={`${csv_download_large} icon-lg color-primary-blue`}
                                ></i>
                            </RSTooltip>
                        </li>
                    </ul>
                </Col>
            </Row>
        </Fragment>
    );
};

export default ConsumptionChannelHeader;
