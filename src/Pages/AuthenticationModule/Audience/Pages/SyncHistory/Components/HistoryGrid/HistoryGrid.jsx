import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { numberWithCommas } from 'Utils/modules/formatters';
import { data_attributes_schema_medium, list_analytics_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useContext, useState } from 'react';
import { get as _get } from 'Utils/modules/lodashReplacements';

import { getListAnalysis } from 'Reducers/audience/syncHistory/request';
import KendoGrid from 'Components/RSKendoGrid';
import Action from '../Action/Action';
import HistoryModal from '../HistoryModal/HistoryModal';
import SynchistoryContext from '../../context';
import { useSelector, useDispatch } from 'react-redux';
import RSTooltip from 'Components/RSTooltip';
import { getSessionId } from 'Reducers/globalState/selector';

import { getUserInfoDetailsForOTP } from 'Reducers/globalState/request';
import DownloadCSV from 'Pages/AuthenticationModule/Components/DownloadCSV/DownloadCSV';
import { useWindowSize } from 'Hooks/useWindowSize';
import ListAnalysis from '../../../AddImportAudience/Components/ListAnalysis';
import { updateListAnalysis } from 'Reducers/audience/syncHistory/reducer';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell.jsx';

const HistoryGrid = ({ columnData }) => {
    const { payload, dates, getSyncHistoryData, setPayload, config, setConfig, setGraphToggle, setPipelinePayload, requestMode } =
        useContext(SynchistoryContext);
    const dispatch = useDispatch();
    const { clientId, departmentId, userId } = useSelector((state) => getSessionId(state));
    const { pageSize } = useWindowSize();

    const { syncLoading, totalAudience, syncHistory, mode, listAnalysisData, listAnalysisLoading } = useSelector(
        ({ syncHistoryReducer }) => syncHistoryReducer,
    );
    const [payloadVal, setPayloadVal] = useState({});

    const [downloadModal, setDownloadModal] = useState(false);
    const [historyModal, setHistoryModal] = useState(false);
    const [listAnalysisModal, setListAnalysisModal] = useState(false);
    const [analysisListType, setAnalysisListType] = useState(null);
    const [invalidAudiences, setinvalidAudiences] = useState(0);
    const [warningCount, setWarningCount] = useState(0);
    const [dedupInValidAudiences, setDedupInValidAudiences] = useState(0);
    const handlePageSizeChange = (dataState) => {
        const { skip, take } = dataState;
        setPayload((prev) => ({
            ...prev,
            pageNumber: skip,
            itemsPerPage: take,
        }));
    };

    const formatGridText = (value) => {
        if (value == null || (typeof value === 'number' && Number.isNaN(value))) return 'NA';
        return String(value);
    };

    const handleTooltipField = (value, tdProps) => {
        return <TruncatedCell value={formatGridText(value)} tdProps={tdProps} />;
    };

    const handleListAnalysis = (dataItem) => {
        dispatch(updateListAnalysis(null));
        const currentListType = _get(dataItem, 'listType', 5);
        setAnalysisListType(currentListType);
        const payload = {
            jobId: _get(dataItem, 'jobID', 0),
            departmentId,
            listType: currentListType,
            sourceType: _get(dataItem, 'source', 'CSV'),
            clientId,
            userId,
        };
        dispatch(getListAnalysis(payload));
        setListAnalysisModal(true);
    };

    const defaultAirflowDagId = `AudienceImportSchedular_${clientId}_${departmentId}`;

    const getAirFlowDagRunId = (dataItem) =>
        _get(dataItem, 'airFlowDagRunID') ?? _get(dataItem, 'airFlowDagRunId') ?? _get(dataItem, 'airflowDagRunID');

    const getAirFlowDagId = (dataItem) =>
        _get(dataItem, 'airFlowDagID') ??
        _get(dataItem, 'airFlowDagId') ??
        _get(dataItem, 'airflowDagID') ??
        defaultAirflowDagId;

    const handlePipelineFromGrid = (dataItem) => {
        const dagRunId = getAirFlowDagRunId(dataItem);
        if (dagRunId == null || String(dagRunId).trim() === '') return;

        setPipelinePayload({
            dagId: getAirFlowDagId(dataItem),
            dagRunId: String(dagRunId).trim(),
            startDate: dates.startDate,
            endDate: dates.endDate,
            openPipelineDetails: true,
            fromGridPipeline: true,
        });
        setGraphToggle(false);
    };

    return (
        <Fragment>
            <KendoGrid
                noBoxShadow
                data={Array.isArray(syncHistory) ? syncHistory : []}
                pageable={true}
                settings={{
                    total: totalAudience,
                    sortable: false,
                }}
                pagerChange={config}
                isLoading={syncLoading}
                setInitialPagination={setConfig}
                isFailure={!syncLoading && !syncHistory?.length && mode === requestMode}
                noDataText="No data available"
                onPageSizeChange={handlePageSizeChange}
                //isDataStateRequired
                autoResizeSize
                scrollable="scrollable"
                onDataStateChange={async (event) => {
                    const { take, skip } = event?.dataState;
                    setPayload((prev) => ({
                        ...prev,
                        itemsPerPage: take,
                        pageNumber: skip / take + 1,
                    }));
                    // getSyncHistoryData({ ...payload, itemsPerPage: take, pageNumber: skip / take + 1 });
                }}
                column={columnData?.map((column) => {
                    const resolvedFilter =
                        column['title'] === 'Action'
                            ? undefined
                            : column?.filter === 'date' || column?.filter === 'numeric' || column?.filter === 'boolean'
                              ? column?.filter
                              : 'text';
                    return {
                        field: column.field,
                        title: column.title,
                        width: 140,
                        filter: resolvedFilter,
                        // filter: column?.filter,
                        ...(column['field'] === 'fileName' && {
                            width: 220,
                            filter: 'text',
                            cell: (props) => {
                                const val = props.dataItem?.[props.field];
                                let tooltipText;
                                if (typeof val === 'string' && val.includes(',')) {
                                    tooltipText = (
                                        <div className="text-left">
                                            <ul className="list-disk">
                                                {val.split(',').map((f, i) => (
                                                    <li key={i}>{f.trim()}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                }
                                return (
                                    <TruncatedCell
                                        value={formatGridText(val)}
                                        tooltipText={tooltipText}
                                        tdProps={props.tdProps}
                                    />
                                );
                            },
                        }),
                        ...(column['field'] === 'scheduleFrequency' && {
                            width: 140,
                            filter: 'text',
                            cell: ({ dataItem, field }) => {
                                return <td>{dataItem?.[field] || 'One time '}</td>;
                            },
                        }),
                        ...(column['filter'] === 'numeric' && {
                            width: 180,
                            filter: 'numeric',
                            cell: ({ dataItem, field }) => {
                                const raw = dataItem?.[field];
                                const numeric = Number(raw);
                                const display =
                                    Number.isFinite(numeric) && numeric > 0
                                        ? numberWithCommas(numeric)
                                        : '0';
                                return <td className="text-right">{display}</td>;
                            },
                        }),
                        ...(column['filter'] === 'date' && {
                            width: 190,
                            filter: 'date',
                            cell: ({ dataItem, field }) => {
                                // console.log('dataItem::', dataItem?.[field]?.length);
                                return (
                                    <td className="text-left">
                                        {/* {dataItem?.[field]?.length > 0
                                                ? getUserDateTimeFormat(dataItem?.[field] + ' UTC', 'formatDateTime')
                                                : // ? getUserDateTimeFormat(
                                                  //        dataItem?.[field] ,
                                                  //       'formatDateTime',
                                                  //   )
                                                  'NA'} */}
                                        {!!dataItem?.[field]
                                            ? getUserCurrentFormat(dataItem?.[field], { isOffset: true })?.dateTimeFormat ?? ''
                                            : // ? getUserDateTimeFormat(
                                              //        dataItem?.[field] ,
                                              //       'formatDateTime',
                                              //   )
                                              'NA'}
                                    </td>
                                );
                            },
                        }),
                        ...(column['title'] === 'Actions' && {
                            width: 150,
                            sortable: false,
                            filter: false,
                            cell: (props) => {
                                const airFlowRunId = getAirFlowDagRunId(props?.dataItem);
                                const pipelineEnabled = airFlowRunId != null && String(airFlowRunId).trim() !== '';
                                return (
                                    <td className="d-flex align-items-center">
                                        <div onClick={() => handleListAnalysis(props?.dataItem)}>
                                            <RSTooltip
                                                text={'List analysis'}
                                                position="top"
                                                className="lh0 mr10"
                                                innerContent={false}
                                            >
                                                <i
                                                    className={`${list_analytics_medium} icon-md color-primary-blue`}
                                                />
                                            </RSTooltip>
                                        </div>
                                        <RSTooltip text={'Pipeline'} position="top" className="lh0 mr10" innerContent={false}>
                                            <div
                                                className={pipelineEnabled ? 'cp' : 'click-off pe-none'}
                                                onClick={() => pipelineEnabled && handlePipelineFromGrid(props?.dataItem)}
                                            >
                                                <i
                                                    className={`${data_attributes_schema_medium} icon-md color-primary-blue`}
                                                />
                                            </div>
                                        </RSTooltip>
                                        <div
                                            // className={`actionBlockCol`}
                                            onClick={async () => {
                                                if (
                                                    (props?.dataItem?.dedupInValidAudiences ?? 0) === 0 &&
                                                    (props?.dataItem?.invalidAudiences ?? 0) === 0 &&
                                                    (props?.dataItem?.warningCount ?? 0) === 0
                                                )
                                                    return;

                                                const payloads = {
                                                    departmentId,
                                                    clientId,
                                                    userId,
                                                };
                                                dispatch(getUserInfoDetailsForOTP({ ...payloads }, false));
                                                setHistoryModal(true);
                                                setPayloadVal({
                                                    jobId:props?.dataItem?.jobID||0,// _get(props, 'dataItem?.jobID', 0),
                                                    list_name:props?.dataItem?.importDescription||'',// _get(props, 'dataItem?.importDescription', ''),
                                                    listType: props?.dataItem?.listType||1,// _get(props, 'dataItem?.listType', 1),
                                                    sourceType: props?.dataItem?.source||'CSV',// _get(props, 'dataItem?.source', 'CSV'),
                                                    dataItem: props?.dataItem,
                                                });
                                                setinvalidAudiences(props?.dataItem?.invalidAudiences||0);
                                                setWarningCount(props?.dataItem?.warningCount||0);
                                                setDedupInValidAudiences(
                                                    _get(props, 'dataItem?.dedupInValidAudiences', 0),
                                                );
                                            }}
                                        >
                                            <Action
                                                props={props}
                                                action={props.dataItem?.invalidAudiences}
                                                details={props?.dataItem}
                                                setHistoryModal={setHistoryModal}
                                                setDownloadModal={setDownloadModal}
                                                isInvalid={
                                                    (props.dataItem?.dedupInValidAudiences ?? 0) !== 0 ||
                                                    (props.dataItem?.invalidAudiences ?? 0) !== 0 ||
                                                    (props.dataItem?.warningCount ?? 0) !== 0
                                                }
                                                importStatus={props.dataItem?.importStatus}
                                            />
                                        </div>
                                    </td>
                                );
                            },
                        }),
                        ...(column['title'] === 'Import description' && {
                            width: 250,
                            filter: 'text',
                            cell: (props) => {
                                return handleTooltipField(props.dataItem?.[props.field], props.tdProps);
                            },
                        }),
                        ...(column['title'] === 'Status' && {
                            width: 200,
                            filter: 'text',
                            cell: (props) => {
                                const capitalizeName = (name) => {
                                    if (name == null || name === '') return 'NA';
                                    const text = String(name);
                                    if (text.toLowerCase() === 'inprogress') return 'In progress';
                                    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
                                };
                                return handleTooltipField(
                                    capitalizeName(props.dataItem?.[props.field]),
                                    props.tdProps,
                                );
                            },
                        }),
                    };
                })}
            />

            {historyModal && (
                <HistoryModal
                    show={historyModal}
                    setHistoryModal={setHistoryModal}
                    invalidAudiences={invalidAudiences}
                    warningCount={warningCount}
                    dedupInValidAudiences={dedupInValidAudiences}
                    payloadVal={payloadVal}
                />
            )}
            {/* <DownloadModal show={downloadModal} setDownloadModal={setDownloadModal} /> */}
            {downloadModal && (
                <DownloadCSV
                    show={downloadModal}
                    handleClose={() => setDownloadModal(false)}
                    isDataCatalogue
                    onSuccess={(keyData) => {
                        // handleDownloadCSV(keyData);
                    }}
                />
            )}
            {listAnalysisModal && (<ListAnalysis
                type={'sync'}
                close={() => setListAnalysisModal(false)}
                show={listAnalysisModal}
                dispatchState={() => {}}
                isProceed={false}
                listAnalysisData={listAnalysisData}
                listType={analysisListType}
                isLoading={listAnalysisLoading}
            />)}
        </Fragment>
    );
};

export default HistoryGrid;
