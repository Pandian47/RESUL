import { SOURCE_FILTER_DEFAULT, SOURCE_FILTER_OPTIONS, SYNC_HISTORY_REQUEST_MODE, TAB_CONFIG } from './constants';
import { data_attributes_schema_large, data_attributes_schema_medium, list_large } from 'Constants/GlobalConstant/Glyphicons';
import {
    convertToUserTimezone,
    convertUTCtoUserTimezone,
    getCurrentTimeInUserTimezoneWithAbbreviation,
    getDateWithDaynoFormat,
    getYYMMDD,
} from 'Utils/modules/dateTime';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { encodeUrl } from 'Utils/modules/crypto';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container } from 'react-bootstrap';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';

import RsTab from 'Components/RSTabber/Component/RSTab';
import { useTabState } from 'Pages/KendoDocs/CommonComponents/ResTabber/hooks';
import RSPageHeader from 'Components/RSPageHeader';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import { getSyncHistoryList } from 'Reducers/audience/syncHistory/request';
import useApiLoader, { resetAbortableRequests } from 'Hooks/useApiLoader';
import { getSessionId, getUtcTimeData } from 'Reducers/globalState/selector';
import { getUtcTimeNow } from 'Reducers/globalState/request';
import SynchistoryContext from './context';
import { updateSynchistory, updateLoading } from 'Reducers/audience/syncHistory/reducer';
import { safeToDate } from 'Utils/DateTimeUtils';
import { AUDIENCE_LIST_LAST_30_DAYS_OFFSET } from '../../audienceModuleDefaults';
import { useNavigate } from 'react-router-dom';
import { useWindowSize } from 'Hooks/useWindowSize';
import useSkipFirstRender from 'Hooks/useSkipFirstRender';
import SyncHistoryPipeline from './Components/SyncHistoryPipeline/SyncHistoryPipeline';
import useQueryParams from 'Hooks/useQueryParams';
import RSTooltip from 'Components/RSTooltip';

const SyncHistory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { clientId, departmentId, userId } = useSelector((state) => getSessionId(state) ?? {});
    const utcTimeData = useSelector((state) => getUtcTimeData(state));
    const { pageSize = 5 } = useWindowSize() ?? {};
    const [graphToggle, setGraphToggle] = useState(true);
    const currentUTCdateTime = safeToDate(utcTimeData?.utcTime, { resetTime: false, fallback: new Date() });
    const locationState = useQueryParams('/audience');
    const [currTab, setCurrTab] = useState(locationState?.connectionMode === 2 ? 1 : 0);

    const { selectedIdx, tabconfig, setSelectedIndex } = useTabState({
        defaultTab: locationState?.connectionMode === 2 ? 1 : 0,
        tabData: TAB_CONFIG,
        callBack: (tab = {}, tabIdx) => {
            const { id } = tab;
            if (!id) return;
            dispatch(updateLoading({ field: 'syncLoading', payload: true }));
            setPayload((prev) => ({
                ...prev,
                requestMode: id,
                pageNumber: 1,
                itemsPerPage: pageSize,
            }));
            setConfig(true);
            setCurrTab(tabIdx ?? 0);
            dispatch(
                updateSynchistory({
                    syncHistory: [],
                    totalAudience: 0,
                    mode: id,
                }),
            );
        },
    });
    const { failureApiErrors } = useSelector(({ globalstate = {} }) => globalstate ?? {});

    useEffect(() => {
        dispatch(getUtcTimeNow());
    }, [dispatch]);

    const getTimezoneAdjustedStartDate = (dayOffset = AUDIENCE_LIST_LAST_30_DAYS_OFFSET) => {
        if (utcTimeData?.utcTime) {
            const baseDate = new Date(currentUTCdateTime);
            baseDate.setDate(baseDate.getDate() + dayOffset);
            return convertUTCtoUserTimezone(baseDate);
        }
        return convertToUserTimezone(new Date(getDateWithDaynoFormat(dayOffset)), { formatAsString: false });
    };

    const getTimezoneAdjustedEndDate = () => {
        if (utcTimeData?.utcTime) {
            return convertUTCtoUserTimezone(currentUTCdateTime);
        }
        return convertToUserTimezone(new Date(), { formatAsString: false });
    };

    const [config, setConfig] = useState(false);
    const [dates, setDates] = useState({
        startDate: getTimezoneAdjustedStartDate(),
        endDate: getTimezoneAdjustedEndDate(),
        selectedDateText: 'Last 30 days',
    });
    const [payload, setPayload] = useState({
        requestMode: locationState?.connectionMode === 2 ? SYNC_HISTORY_REQUEST_MODE.EXPORT : 'Import',
        clientId,
        departmentId,
        userId,
        startDate: getYYMMDD(getTimezoneAdjustedStartDate()),
        endDate: getYYMMDD(getTimezoneAdjustedEndDate()),
        itemsPerPage: pageSize,
        pageNumber: 1,
        sortBy: '',
        sortByColumn: '',
        sourceFilter: SOURCE_FILTER_DEFAULT,
    });
    const [pipelinePayload, setPipelinePayload] = useState(null);

    const syncHistoryRequest = useApiLoader({
        actionCreator: getSyncHistoryList,
        autoFetch: false,
    });

    const stopListRequest = () => {
        syncHistoryRequest.abort();
        dispatch(updateLoading({ field: 'syncLoading', payload: false }));
    };

    useEffect(() => {
        if (!graphToggle) {
            stopListRequest();
            return;
        }
        if (!clientId || !departmentId || !userId) return;
        syncHistoryRequest.refetch(payload);
    }, [graphToggle, payload, clientId, departmentId, userId]);

    useEffect(() => {
        const tabIdx = locationState?.connectionMode === 2 ? 1 : 0;
        setCurrTab(tabIdx);
        setSelectedIndex(tabIdx);
    }, [locationState?.connectionMode]);

    useSkipFirstRender(() => {
        const start = getTimezoneAdjustedStartDate();
        const end = getTimezoneAdjustedEndDate();
        setPayload((prev) => ({
            ...prev,
            clientId,
            departmentId,
            userId,
            startDate: getYYMMDD(start),
            endDate: getYYMMDD(end),
            itemsPerPage: pageSize,
            pageNumber: 1,
            sourceFilter: SOURCE_FILTER_DEFAULT,
        }));
        setDates({ startDate: start, endDate: end, selectedDateText: 'Last 30 days' });
        setConfig(true);
    }, [departmentId, clientId, userId]);

    const getSyncHistoryData = (attr = payload) => {
        const requestPayload = attr ?? payload;
        if (!requestPayload?.clientId || !requestPayload?.departmentId || !requestPayload?.userId) return;
        syncHistoryRequest.refetch(requestPayload);
    };

    useEffect(() => {
        return () => {
            dispatch(
                updateSynchistory({
                    syncHistory: [],
                    totalAudience: 0,
                    mode: payload?.requestMode ?? SYNC_HISTORY_REQUEST_MODE.IMPORT,
                }),
            );
            resetAbortableRequests(syncHistoryRequest);
        };
    }, []);

    const applyDateRange = (start, end, selectedDateText) => {
        setDates({ startDate: start, endDate: end, selectedDateText });
        setPayload((prev) => ({
            ...prev,
            startDate: getYYMMDD(start),
            endDate: getYYMMDD(end),
            pageNumber: 1,
        }));
    };

    const openPipelineView = () => {
        applyDateRange(getTimezoneAdjustedStartDate(-6), getTimezoneAdjustedEndDate(), 'Last 7 days');
        setPipelinePayload(null);
        setGraphToggle(false);
    };

    const openListView = (restoreListDateRange = true) => {
        setPipelinePayload(null);
        if (restoreListDateRange) {
            applyDateRange(getTimezoneAdjustedStartDate(), getTimezoneAdjustedEndDate(), 'Last 30 days');
            setPayload((prev) => ({ ...prev, sourceFilter: SOURCE_FILTER_DEFAULT }));
        } else {
            setPayload((prev) => ({
                ...prev,
                startDate: getYYMMDD(dates.startDate ?? prev.startDate),
                endDate: getYYMMDD(dates.endDate ?? prev.endDate),
                pageNumber: 1,
            }));
        }
        setConfig(true);
        setGraphToggle(true);
    };

    const showPipelineHeaderFilters = graphToggle || !pipelinePayload?.fromGridPipeline;

    return (
        <SynchistoryContext.Provider
            value={{
                requestMode: payload.requestMode,
                payload,
                dates,
                setPayload,
                getSyncHistoryData,
                setConfig,
                config,
                setGraphToggle,
                pipelinePayload,
                setPipelinePayload,
            }}
        >
            <div className="page-content-holder">
                <RSPageHeader
                    title="Sync history"
                    isTabber
                    isBack
                    backPath={graphToggle ? '/audience' : '/audience/sync-history'}
                    rightCommonMenus
                    backAction={() => {
                        if (!graphToggle) {
                            openListView(!pipelinePayload?.fromGridPipeline);
                            return;
                        }
                        const state1 = { index: 0 };
                        try {
                            navigate(`/audience?q=${encodeUrl(state1)}`, { state: state1 });
                        } catch {
                            navigate('/audience', { state: state1 });
                        }
                    }}
                />

                <Container fluid>
                    <div className="page-content">
                        <Container className="px0">
                            <div className={`${!graphToggle && 'box-design'}`}>
                                <div
                                    className={`flex-row justify-content-between ${
                                        graphToggle && 'top-sub-heading'
                                    }`}
                                >
                                    <span className="d-flex">
                                        <h3 className="mr5">{payload?.requestMode ?? 'Import'}</h3>
                                        <small className="font-xsm">
                                            (As on: {getCurrentTimeInUserTimezoneWithAbbreviation()})
                                        </small>
                                    </span>
                                    <ul className={`rs-list-group-horizontal ${graphToggle && 'mr150-del pr15-del'} mt-1`}>
                                        {showPipelineHeaderFilters && (
                                            <li>
                                                <RSDateRangePicker
                                                    onDatePickerClosed={({
                                                        startDate,
                                                        endDate,
                                                        selectedType,
                                                    } = {}) => {
                                                        if (!startDate || !endDate) return;
                                                        setPayload((prev) => ({
                                                            ...prev,
                                                            startDate: getYYMMDD(startDate),
                                                            endDate: getYYMMDD(endDate),
                                                            itemsPerPage: pageSize,
                                                            pageNumber: 1,
                                                        }));
                                                        setDates((prev) => ({
                                                            ...prev,
                                                            startDate,
                                                            endDate,
                                                            selectedDateText:
                                                                selectedType || prev.selectedDateText,
                                                        }));
                                                        if (graphToggle) setConfig(true);
                                                    }}
                                                    startDate={dates.startDate}
                                                    endDate={dates.endDate}
                                                    selectedDateText={dates.selectedDateText}
                                                    isTemplate
                                                />
                                            </li>
                                        )}
                                        {!graphToggle && showPipelineHeaderFilters && (
                                            <li>
                                                <RSBootstrapdown
                                                    className="pl15"
                                                    data={SOURCE_FILTER_OPTIONS}
                                                    isObject={true}
                                                    fieldKey="text"
                                                    defaultItem={
                                                        SOURCE_FILTER_OPTIONS.find(
                                                            (opt) =>
                                                                opt.id ===
                                                                (payload.sourceFilter ||
                                                                    SOURCE_FILTER_DEFAULT),
                                                        ) || {
                                                            id: SOURCE_FILTER_DEFAULT,
                                                            text: 'All',
                                                        }
                                                    }
                                                    onSelect={(item) => {
                                                        if (!item?.id) return;
                                                        setPayload((prev) => ({
                                                            ...prev,
                                                            sourceFilter: item.id,
                                                            pageNumber: 1,
                                                        }));
                                                    }}
                                                    alignRight
                                                />
                                            </li>
                                        )}
                                        <li>
                                            <RSTooltip
                                                text={graphToggle ? 'Pipeline' : 'List view'}
                                                position="top"
                                                className="lh0"
                                            >
                                                <i
                                                    className={`${
                                                        graphToggle
                                                            ? data_attributes_schema_medium
                                                            : list_large
                                                    } icon-md color-primary-blue ${!graphToggle && 'pl15'}`}
                                                    onClick={() => {
                                                        if (graphToggle) {
                                                            openPipelineView();
                                                        } else {
                                                            openListView(true);
                                                        }
                                                    }}
                                                />
                                            </RSTooltip>
                                        </li>
                                        {graphToggle && (
                                            <li>
                                                <ul className="res-tabs mb0 mini d-flex gap15">
                                                    <RsTab
                                                        activeClass="active"
                                                        tabconfig={tabconfig}
                                                        selectedIdx={selectedIdx}
                                                        setSelectedIndex={setSelectedIndex}
                                                        defaultClass="tabTransparent"
                                                    />
                                                </ul>
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <div className={graphToggle ? undefined : 'd-none'}>
                                    <div className="tabs-content mb20 pb70">
                                        {tabconfig?.[selectedIdx]?.component?.()}
                                    </div>
                                </div>

                                <div className={graphToggle ? 'd-none' : undefined}>
                                    <SyncHistoryPipeline isActive={!graphToggle} />
                                </div>
                            </div>
                        </Container>
                    </div>
                </Container>
                {getWarningPopupMessage(failureApiErrors, dispatch)}
            </div>
        </SynchistoryContext.Provider>
    );
};

export default SyncHistory;
