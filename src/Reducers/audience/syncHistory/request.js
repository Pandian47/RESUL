import { numberWithCommas } from 'Utils/modules/formatters';
import { GET_EXPORT_SYNC_HISTORY, GET_FILE_TYPE_STATUS_LIST, GET_LIST_ANALYSIS, GET_SYNC_HISTORY, GET_SYNC_HISTORY_INVALID_AUDIENCE } from 'Constants/EndPoints';
import request, { isRequestAborted } from 'Utils/Http';
import moment from 'moment';



import { updateActionList, updateListAnalysis, updateLoading, updateSynchistory } from './reducer';
import { capitalize } from 'lodash';

let syncHistoryListRequestSeq = 0;

const isStaleSyncHistoryListResponse = (requestSeq) => requestSeq !== syncHistoryListRequestSeq;

const SYNC_HISTORY_EXPORT_MODE = 'Export';

const dispatchSyncHistoryListRequest = async (dispatch, { url, payload }) => {
    const requestSeq = ++syncHistoryListRequestSeq;
    dispatch(updateLoading({ field: 'syncLoading', payload: true }));

    try {
        return await dispatch(
            request.post({
                url,
                payload,
                ok: (res) => {
                    if (isStaleSyncHistoryListResponse(requestSeq)) return;
                    const { status, data, totalAudience } = res?.data ?? {};
                    if (status) {
                        dispatch(
                            updateSynchistory({
                                syncHistory: data,
                                totalAudience,
                                mode: payload?.requestMode,
                            }),
                        );
                    } else {
                        dispatch(
                            updateSynchistory({
                                syncHistory: [],
                                totalAudience: 0,
                                mode: payload?.requestMode,
                            }),
                        );
                    }
                },
                fail: (err) => {
                    if (isStaleSyncHistoryListResponse(requestSeq) || isRequestAborted(err)) return;
                    dispatch(
                        updateSynchistory({
                            syncHistory: [],
                            totalAudience: 0,
                            mode: payload?.requestMode,
                        }),
                    );
                },
                final: () => {
                    if (!isStaleSyncHistoryListResponse(requestSeq)) {
                        dispatch(updateLoading({ field: 'syncLoading', payload: false }));
                    }
                },
            }),
        );
    } catch (err) {
        if (isRequestAborted(err)) {
            if (!isStaleSyncHistoryListResponse(requestSeq)) {
                dispatch(updateLoading({ field: 'syncLoading', payload: false }));
            }
            throw err;
        }
        throw err;
    }
};

export const getSyncHistory = (payload) => async (dispatch) =>
    dispatchSyncHistoryListRequest(dispatch, { url: GET_SYNC_HISTORY, payload });

/** Export tab — same payload shape as import; `requestMode` should be `"Export"`. */
export const getExportSyncHistory = (payload) => async (dispatch) =>
    dispatchSyncHistoryListRequest(dispatch, { url: GET_EXPORT_SYNC_HISTORY, payload });

/** Import / Export list — picks endpoint from `requestMode` on payload. */
export const getSyncHistoryList = (payload) => async (dispatch) => {
    const url =
        payload?.requestMode === SYNC_HISTORY_EXPORT_MODE
            ? GET_EXPORT_SYNC_HISTORY
            : GET_SYNC_HISTORY;
    return dispatchSyncHistoryListRequest(dispatch, { url, payload });
};

export const getSyncHistoryAudience = (payload) => async (dispatch) => {
    dispatch(updateActionList([]));
    return dispatch(
        request.post({
            url: GET_SYNC_HISTORY_INVALID_AUDIENCE,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, data: res } = data ?? {};
                if (status && Array.isArray(res)) {
                    dispatch(updateActionList(res));
                } else {
                    dispatch(updateActionList([]));
                }
            },
            fail: (err) => {
                if (isRequestAborted(err)) return;
                dispatch(updateActionList([]));
            },
        }),
    );
};

export const getListAnalysis = (payload) => async (dispatch) => {
    dispatch(updateLoading({ field: 'listAnalysisLoading', payload: true }));
    dispatch(
        request.post({
            url: GET_LIST_ANALYSIS,
            loading: false,
            payload,
            ok: ({ data }) => {
                const { status, data: responseData } = data;
                try {
                    if (status && responseData?.summary) {
                        const summary = responseData.summary;
                        const transformedData = {
                            colLength: summary.attribute_count || 0,
                            totalErrorCount: summary.invalid_audience || 0,
                            totalMissingValuesCount: summary.total_missing_cells || 0,
                            size: summary.total_file_size || '',
                            duplicateRowsCount: summary.duplicate_audience || 0,
                            rowLength: summary.total_audience || 0,
                            columnDetails: (summary.columns || []).map((col) => ({
                                columnName: col.column_name || '',
                                missingValuesCount: numberWithCommas(col.missing_count) || 0,
                                dataType: capitalize(col.datatype) || 0,
                            })),
                            dedupe_audience: summary.dedupe_audience ?? 0,
                            duplicate_audience: summary.duplicate_audience ?? 0,
                            existing_audience: summary.existing_audience ?? 0,
                            import_description: summary.import_description || '',
                            invalid_audience: summary.invalid_audience ?? 0,
                            new_audience: summary.new_audience ?? 0,
                            total_audience: summary.total_audience ?? 0,
                            update_frequency: summary.update_frequency || '',
                            valid_audience: summary.valid_audience ?? 0,
                            colLength: summary.columns?.length || 0,
                        };
                        dispatch(updateListAnalysis(transformedData));
                    } else {
                        dispatch(updateListAnalysis(null));
                    }
                } catch (error) {
                    dispatch(updateListAnalysis(null));
                }
            },
            fail: (err) => {
                dispatch(updateListAnalysis(null));
            },
            final: () => {
                dispatch(updateLoading({ field: 'listAnalysisLoading', payload: false }));
            },
        }),
    );
};

export const getAudienceStatusList =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_FILE_TYPE_STATUS_LIST,
                payload,
                loading: false,
                ok: () => {},
                fail: () => {},
            }),
        );

const API_BASE_URL = 'https://ingapi.resul.team';
//const API_BASE_URL = 'http://ingapi.resul.team:5001';

const formatUTCDate = (date, type = 'start') => {
    const base = moment.utc(date);

    if (type === 'start') {
        return base.startOf('day').format('YYYY-MM-DD[T]HH:mm:ss') + '%2B00:00';
    }

    if (type === 'end') {
        return base.endOf('day').format('YYYY-MM-DD[T]HH:mm:ss') + '%2B00:00';
    }

    return base.format('YYYY-MM-DD[T]HH:mm:ss') + '%2B00:00';
};

export const getFetchPipeline = async (clientId, dagId, start_date, end_date, dag_run_id, signal) => {
    if (!dagId) {
        throw new Error('dagId is required');
    }
    let url = `${API_BASE_URL}/fetchdagsinfo?dag_id=${encodeURIComponent(dagId)}`;
    if (dag_run_id) {
        url += `&dag_run_id=${encodeURIComponent(dag_run_id)}`;
    }
    if (start_date && end_date) {
        const sDate = formatUTCDate(start_date, 'start');
        const eDate = formatUTCDate(end_date, 'end');

        url += `&start_date=${sDate}&end_date=${eDate}`;
    }

    try {
        const response = await fetch(url, { method: 'GET', signal });

        if (!response.ok) {
            throw new Error(`Failed to fetch pipeline data: ${response?.status}`);
        }

        const json = await response.json();
        const runs = json?.dag_runs || [];
        const normalized = runs.map((r) => ({
            dag_id: r.dag_id,
            dag_run_id: r.dag_run_id,
            start_date: r.start_date || null,
            end_date: r.end_date || null,
            duration: typeof r.duration === 'number' ? r.duration : null,
            Status: r.status,
            status: r.status,
            listtype: r.listtype,
            importSourceID: r.ImportSourceID ?? r.importSourceID ?? r.import_source_id ?? null,
            source: r.source ?? r.Source ?? r.source_type ?? r.sourceType ?? r.import_source ?? 'NA',
            ImportDescription: r.ImportDescription ?? r.import_description ?? 'NA',
            ImportAudiences: r.ImportAudiences ?? r.import_audiences ?? r.total_audience ?? 'NA',
            ListType: r.ListType ?? r.list_type ?? r.listtype ?? 'NA',
        }));

        if (normalized.length === 0) return [];

        const durations = normalized.map((x) => (typeof x.duration === 'number' ? x.duration : 0));
        const min = Math.min(...durations);
        const max = Math.max(...durations);
        const scale = (val) => {
            if (typeof val !== 'number' || !isFinite(val)) return 40;
            if (max === min) return 60;
            const pct = 20 + ((val - min) / (max - min)) * 80;
            return Math.round(pct);
        };
        return normalized.map((x) => ({ ...x, barValue: scale(x.duration) }));
    } catch (error) {
        if (error?.name === 'AbortError') throw error;
        console.error('Error fetching pipeline data:', error);
        throw error;
    }
};

export const getfileNameDetails = async (clientId, dagId, fileName, listType, signal) => {
    if (!dagId) {
        throw new Error('dagId is required');
    }
    let url = `${API_BASE_URL}/fetchdagsinfo?dag_id=${encodeURIComponent(dagId)}`;

    if (fileName) url += `&file_name=${encodeURIComponent(fileName)}`;
    if (listType) url += `&list_type=${encodeURIComponent(listType)}`;

    try {
        const response = await fetch(url, { method: 'GET', signal });

        if (!response.ok) {
            throw new Error(`Failed to fetch pipeline details: ${response?.status}`);
        }

        const json = await response.json();
        const runs = json?.dag_runs || [];
        const normalized = runs.map((r) => ({
            dag_id: r.dag_id,
            dag_run_id: r.dag_run_id,
            start_date: r.start_date || null,
            end_date: r.end_date || null,
            duration: typeof r.duration === 'number' ? r.duration : null,
            Status: r.status,
            status: r.status,
            listtype: r.listtype,
            importSourceID: r.ImportSourceID ?? r.importSourceID ?? r.import_source_id ?? null,
            source: r.source ?? r.Source ?? r.source_type ?? r.sourceType ?? r.import_source ?? 'NA',
            ImportDescription: r.ImportDescription ?? r.import_description ?? 'NA',
            ImportAudiences: r.ImportAudiences ?? r.import_audiences ?? r.total_audience ?? 'NA',
            ListType: r.ListType ?? r.list_type ?? r.listtype ?? 'NA',
        }));

        if (normalized.length === 0) return [];

        const durations = normalized.map((x) => (typeof x.duration === 'number' ? x.duration : 0));
        const min = Math.min(...durations);
        const max = Math.max(...durations);
        const scale = (val) => {
            if (typeof val !== 'number' || !isFinite(val)) return 40;
            if (max === min) return 60;
            const pct = 20 + ((val - min) / (max - min)) * 80;
            return Math.round(pct);
        };
        return normalized.map((x) => ({ ...x, barValue: scale(x.duration) }));
    } catch (error) {
        if (error?.name === 'AbortError') throw error;
        console.error('Error fetching pipeline data by file:', error);
        throw error;
    }
};

export const fetchPipelineDetails = async (dagRunId, clientId, dagId = 'mysql_data_ingestion', signal) => {
    if (!dagRunId || String(dagRunId).trim() === '') {
        throw new Error('dagRunId is required');
    }
    let url = `${API_BASE_URL}/fetchloginfo?dag_id=${encodeURIComponent(dagId)}&dag_run_id=${encodeURIComponent(
        dagRunId,
    )}`;

    try {
        const response = await fetch(url, { method: 'GET', signal });

        if (!response.ok) {
            throw new Error(`Failed to fetch pipeline details: ${response?.status}`);
        }

        const json = await response.json();
        return json;
    } catch (error) {
        if (error?.name === 'AbortError') throw error;
        console.error('Error fetching pipeline details:', error);
        throw error;
    }
};
