import { getUserCurrentFormatWithSeconds } from 'Utils/modules/dateTime';
import { getListTypeName } from 'Utils/modules/stringUtils';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import CustomBarChartView from './Components/CutomBarChartView/CutomBarChartView';
import HeadBand from './Components/HeadBand/HeadBand';
import GraphAndLogs from './Components/GraphAndLogs/GraphAndLogs';
import { fetchPipelineDetails, getFetchPipeline, getfileNameDetails } from 'Reducers/audience/syncHistory/request';
import { useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import SynchistoryContext from '../../context';
import { SyncHistoryPipelineSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
import { matchesSourceFilter, SOURCE_FILTER_DEFAULT } from '../../constants';

const matchDagRunId = (a, b) => String(a ?? '').trim() === String(b ?? '').trim();

const buildPipelineDetails = ({ row, runId, dagId, fetchedDetails }) => {
    const importHistory = fetchedDetails?.importHistory?.[0] || {};
    const selectedListType = row?.ListType ?? row?.listtype;

    return {
        runId,
        dagId,
        startDate: row?.start_date
            ? getUserCurrentFormatWithSeconds(row.start_date)?.dateTimeFormat ?? 'NA'
            : 'NA',
        endDate: row?.end_date
            ? getUserCurrentFormatWithSeconds(row.end_date)?.dateTimeFormat ?? 'NA'
            : 'NA',
        duration: row?.duration ?? 'NA',
        status: row?.status || row?.Status || 'NA',
        graphSrc: fetchedDetails?.Graph,
        logs: fetchedDetails?.Logs,
        ImportDescription: row?.ImportDescription ?? importHistory?.ImportDescription ?? 'NA',
        ImportAudiences: row?.ImportAudiences ?? importHistory?.ImportAudiences ?? 'NA',
        ListType: selectedListType ? getListTypeName(selectedListType) : 'NA',
        extras: Object.keys(fetchedDetails || {}).reduce((acc, key) => {
            if (key !== 'Graph' && key !== 'Logs' && key !== 'log') acc[key] = fetchedDetails[key];
            return acc;
        }, {}),
    };
};

function SyncHistoryPipeline({ isActive = false }) {
    const { dates = {}, pipelinePayload, payload, setPipelinePayload } = useContext(SynchistoryContext) || {};
    const pipelinePayloadRef = useRef(pipelinePayload);
    pipelinePayloadRef.current = pipelinePayload;

    const [details, setDetails] = useState(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState(false);
    const [pipelineData, setPipelineData] = useState([]);
    const [pipelineLoading, setPipelineLoading] = useState(false);

    const { clientId, departmentId } = useSelector((state) => getSessionId(state) ?? {});
    const defaultDagId =
        clientId && departmentId ? `AudienceImportSchedular_${clientId}_${departmentId}` : '';

    const hasDagRun = pipelinePayload?.dagRunId && pipelinePayload?.dagId;
    const hasFileFilter = !hasDagRun && pipelinePayload?.fileName;

    const clearPipelineState = () => {
        setPipelineData([]);
        setDetails(null);
        setDetailsError(false);
        setIsDetailsLoading(false);
        setPipelineLoading(false);
    };

    useEffect(() => {
        if (!isActive) {
            clearPipelineState();
            return undefined;
        }

        let ignore = false;
        const ac = new AbortController();

        const load = async () => {
            if (!clientId || !defaultDagId) {
                clearPipelineState();
                return;
            }

            setPipelineData([]);
            setDetails(null);
            setDetailsError(false);
            setIsDetailsLoading(false);
            setPipelineLoading(true);
            try {
                let data = [];
                if (hasDagRun) {
                    data = await getFetchPipeline(
                        clientId,
                        pipelinePayload.dagId,
                        pipelinePayload.startDate ?? dates?.startDate,
                        pipelinePayload.endDate ?? dates?.endDate,
                        pipelinePayload.dagRunId,
                        ac.signal,
                    );
                } else if (hasFileFilter) {
                    data = await getfileNameDetails(
                        clientId,
                        defaultDagId,
                        pipelinePayload.fileName,
                        pipelinePayload.listType,
                        ac.signal,
                    );
                } else if (dates?.startDate && dates?.endDate) {
                    data = await getFetchPipeline(
                        clientId,
                        defaultDagId,
                        dates.startDate,
                        dates.endDate,
                        undefined,
                        ac.signal,
                    );
                }

                if (ignore) return;

                let sortedData = [...(Array.isArray(data) ? data : [])].sort((a, b) => {
                    const as = a?.start_date ? new Date(a.start_date) : null;
                    const bs = b?.start_date ? new Date(b.start_date) : null;
                    if (!as && !bs) return 0;
                    if (!as) return 1;
                    if (!bs) return -1;
                    return bs - as;
                });

                if (hasDagRun) {
                    const target = String(pipelinePayload.dagRunId ?? '').trim();
                    sortedData = sortedData.filter((item) => matchDagRunId(item?.dag_run_id, target));
                }

                setPipelineData(sortedData);

                if (
                    hasDagRun &&
                    pipelinePayloadRef.current?.openPipelineDetails &&
                    sortedData.length > 0
                ) {
                    const row = sortedData[0];
                    const runId = String(row?.dag_run_id ?? '').trim();
                    const dagIdForDetails = row?.dag_id || pipelinePayload.dagId;

                    setIsDetailsLoading(true);
                    setDetailsError(false);
                    setDetails(null);
                    try {
                        const fetchedDetails = await fetchPipelineDetails(
                            runId,
                            clientId,
                            dagIdForDetails,
                            ac.signal,
                        );
                        if (ignore) return;
                        setDetails(buildPipelineDetails({ row, runId, dagId: dagIdForDetails, fetchedDetails }));
                    } catch (error) {
                        if (!ignore && name !== 'AbortError') setDetailsError(true);
                    } finally {
                        if (!ignore) setIsDetailsLoading(false);
                        setPipelinePayload?.((prev) =>
                            prev ? { ...prev, openPipelineDetails: false } : prev,
                        );
                    }
                } else if (hasDagRun && pipelinePayloadRef.current?.openPipelineDetails) {
                    setPipelinePayload?.((prev) =>
                        prev ? { ...prev, openPipelineDetails: false } : prev,
                    );
                }
            } catch (error) {
                if (!ignore && name !== 'AbortError') {
                    setPipelineData([]);
                }
            } finally {
                if (!ignore) setPipelineLoading(false);
            }
        };

        load();
        return () => {
            ignore = true;
            ac.abort();
        };
    }, [
        isActive,
        departmentId,
        defaultDagId,
        hasDagRun,
        hasFileFilter,
        pipelinePayload?.dagId,
        pipelinePayload?.dagRunId,
        pipelinePayload?.startDate,
        pipelinePayload?.endDate,
        pipelinePayload?.fileName,
        pipelinePayload?.listType,
        dates?.startDate,
        dates?.endDate,
        setPipelinePayload,
    ]);

    const handleItemClick = async (dagRunId) => {
        if (!dagRunId || isDetailsLoading) return;

        const selectedData = pipelineData.find((item) => matchDagRunId(item.dag_run_id, dagRunId));
        const dagId = selectedData?.dag_id || pipelinePayload?.dagId || defaultDagId;
        const runId = String(dagRunId ?? '').trim();
        if (!runId || !dagId) return;

        setIsDetailsLoading(true);
        setDetailsError(false);
        setDetails(null);

        try {
            const fetchedDetails = await fetchPipelineDetails(runId, clientId, dagId);
            setDetails(buildPipelineDetails({ row: selectedData ?? {}, runId, dagId, fetchedDetails }));
        } catch {
            setDetailsError(true);
        } finally {
            setIsDetailsLoading(false);
        }
    };

    useEffect(() => {
        if (!isActive) return;
        setDetails(null);
        setDetailsError(false);
    }, [isActive, pipelineData, payload?.sourceFilter]);

    const filteredPipelineData = useMemo(() => {
        if (pipelinePayload?.fromGridPipeline) return pipelineData;
        const sourceFilter = payload?.sourceFilter || SOURCE_FILTER_DEFAULT;
        if (sourceFilter === SOURCE_FILTER_DEFAULT) return pipelineData;
        return pipelineData.filter((item) => matchesSourceFilter(item, sourceFilter));
    }, [pipelineData, payload?.sourceFilter, pipelinePayload?.fromGridPipeline]);

    return (
        <div className="res-pipeline-blk">
            <CustomBarChartView
                onItemClick={handleItemClick}
                pipelineData={filteredPipelineData}
                isLoading={pipelineLoading}
                centerBars={Boolean(pipelinePayload?.fromGridPipeline)}
            />

            {isDetailsLoading ? <SyncHistoryPipelineSkeleton isError={detailsError} /> : null}

            {details && !isDetailsLoading && !detailsError && (
                <>
                    <HeadBand details={details} />
                    <GraphAndLogs dagId={details.dagId} runId={details.runId} />
                </>
            )}
        </div>
    );
}

export default SyncHistoryPipeline;
