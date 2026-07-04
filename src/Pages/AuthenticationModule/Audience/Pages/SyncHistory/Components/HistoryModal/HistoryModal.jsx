import { numberWithCommas } from 'Utils/modules/formatters';
import {
    DEFAULT_SKELETON_COLUMNS,
    SKELETON_COLUMN_COUNT,
    generateHeaders,
    getSummaryTitle,
    isConfigurationAttributeColumn,
    isNumericValue,
} from './constants';
import { DOWNLOAD_CSV, DOWNLOAD_LINK_DATA_SHORTLY, NO_RECORDS_FOUND, FAILED, REQUEST_PROCESSING, THANK_YOU_YOUR_REQUEST } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { in_progress_medium } from 'Constants/GlobalConstant/Glyphicons';
import KendoGrid from 'Components/RSKendoGrid';
import RSModal from 'Components/RSModal';
import { updateActionList } from 'Reducers/audience/syncHistory/reducer';
import RSTooltip from 'Components/RSTooltip';
import DownloadCSV from 'Pages/AuthenticationModule/Components/DownloadCSV/DownloadCSV';

import { getSessionId } from 'Reducers/globalState/selector';
import { downloadTargetListFiles } from 'Reducers/audience/targetList/request';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { useForm } from 'react-hook-form';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import { Row, Col } from 'react-bootstrap';
import { getAudienceStatusList, getSyncHistoryAudience } from 'Reducers/audience/syncHistory/request';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall.jsx';
import useApiLoader, { resetAbortableRequests } from 'Hooks/useApiLoader';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell.jsx';

const HistoryModal = ({ show, setHistoryModal, invalidAudiences, warningCount, dedupInValidAudiences, payloadVal }) => {
    const dispatch = useDispatch();
    const { actionList } = useSelector(({ syncHistoryReducer = {} }) => syncHistoryReducer);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [csvDownloadModal, setCsvDownloadModal] = useState(false);
    const [csvDownloadSuccessModal, setCsvDownloadSuccessModal] = useState(false);
    const [downloadCSVAPIError, setDownloadCSVAPIError] = useState('');
    const [csvDownloadStatus, setCsvDownloadStatus] = useState(null);
    const audienceDownloadAPI = useApiLoader({ autoFetch: false });
    const { getValues, setValue } = useForm();
    const [statusList, setStatusList] = useState([]);
    const [displayCount, setDisplayCount] = useState(invalidAudiences);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [gridColumns, setGridColumns] = useState([]);

    const statusListRequest = useApiLoader({
        actionCreator: getAudienceStatusList,
        autoFetch: false,
    });
    const audienceRequest = useApiLoader({
        actionCreator: getSyncHistoryAudience,
        autoFetch: false,
    });

    const isAudienceGridLoading = audienceRequest.isFetching;
    const isStatusDropdownLoading = statusListRequest.isFetching;
    const isGridLoading = isAudienceGridLoading || isStatusDropdownLoading;
    const gridData = Array.isArray(actionList) ? actionList : [];
    const dataAvailable = gridData.length > 0;

    const baseColumns =
        gridColumns.length > 0 ? gridColumns : generateHeaders(gridData) || [];

    const resolvedColumnDefinitions =
        baseColumns.length > 0 ? baseColumns : DEFAULT_SKELETON_COLUMNS;

    const handleDownloadCSV = async (keyData) => {
        setDownloadCSVAPIError('');
        setCsvDownloadStatus('processing');
        setCsvDownloadModal(false);
        setCsvDownloadSuccessModal(true);

        const payload = {
            departmentId,
            clientId,
            userId,
            jobID: payloadVal?.jobId,
            importDescription: payloadVal?.list_name,
            listType: payloadVal?.listType,
            sentMailList: keyData,
            source: payloadVal?.sourceType,
            fileType: getValues()?.status?.key,
        };

        const res = await audienceDownloadAPI.refetch({
            fetcher: () => dispatch(downloadTargetListFiles(payload, false)),
        });

        if (res?.status) {
            setCsvDownloadStatus('success');
        } else {
            setCsvDownloadStatus('error');
            setDownloadCSVAPIError(res?.message || res?.errorMsg || 'Export request failed.');
        }
    };

    const closeCsvDownloadResultModal = () => {
        audienceDownloadAPI.reset();
        setCsvDownloadStatus(null);
        setDownloadCSVAPIError('');
        setCsvDownloadSuccessModal(false);
    };

    const csvDownloadModalHeader = useMemo(() => {
        if (audienceDownloadAPI.isLoading || csvDownloadStatus === 'processing') {
            return 'Processing';
        }
        if (csvDownloadStatus === 'error') {
            return FAILED;
        }
        return DOWNLOAD_CSV;
    }, [audienceDownloadAPI.isLoading, csvDownloadStatus]);

    const headerRightContent = (
        <RSTooltip position="top" text={DOWNLOAD_CSV} className="lh0">
            <i
                className={`icon-rs-csv-download-large icon-lg color-primary-blue position-relative`}
                onClick={() => setCsvDownloadModal(true)}
            ></i>
        </RSTooltip>
    );

    useEffect(() => {
        if (show) {
            setDisplayCount(invalidAudiences);
            handleStatusData();
            return;
        }

        resetAbortableRequests(statusListRequest, audienceRequest, audienceDownloadAPI);
        setStatusList([]);
        setSelectedStatus(null);
        setGridColumns([]);
    }, [show]);

    useEffect(() => {
        if (show && statusList?.length) {
            const currentStatus = getValues('status') || statusList[0];
            setSelectedStatus(currentStatus);
        }
    }, [show, statusList]);

    const handleStatusData = async () => {
        dispatch(updateActionList([]));
        const payload = {
            departmentId,
            clientId,
            userId,
            jobId: payloadVal?.jobId,
            sourceType: payloadVal?.sourceType || '',
            listType: payloadVal?.listType,
        };
        const response = await statusListRequest.refetch({ payload });
        if (response === undefined) return;

        if (response?.status && Array.isArray(response?.data) && response.data.length) {
            setStatusList(response.data);
            setSelectedStatus(response.data[0]);
            setValue('status', response.data[0]);
            handleInvalidAPI(response.data[0]);
        } else {
            setStatusList([]);
            setSelectedStatus(null);
            dispatch(updateActionList([]));
        }
    };

    const handleInvalidAPI = (selectValue) => {
        if (!selectValue) return;

        setValue('status', selectValue);
        setSelectedStatus(selectValue);

        const statusKey = selectValue?.key?.toLowerCase() || '';
        if (statusKey.includes('warning')) {
            setDisplayCount(warningCount);
        } else if (statusKey.includes('dedup') || statusKey.includes('dedupe')) {
            setDisplayCount(dedupInValidAudiences);
        } else {
            setDisplayCount(invalidAudiences);
        }

        const payload = {
            list_name: payloadVal?.dataItem?.importDescription || '',
            departmentId,
            listType: payloadVal?.dataItem?.listType || 1,
            clientId,
            userId,
            jobId: payloadVal?.dataItem?.jobID || 0,
            sourceType: payloadVal?.dataItem?.source || 'CSV',
            identity: 'sample',
            importPreferences: payloadVal?.dataItem?.importPreferences,
            fileType: selectValue?.key,
        };
        audienceRequest.refetch(payload);
    };

    useEffect(() => () => resetAbortableRequests(statusListRequest, audienceRequest, audienceDownloadAPI), []);

    useEffect(() => {
        const headers = generateHeaders(gridData);
        if (headers?.length) {
            setGridColumns(headers);
        }
    }, [gridData]);

    const columns = resolvedColumnDefinitions.map((col) => ({
        ...col,
        cell: (props) => {
            const value = props?.dataItem?.[col.field];
            const isInvalid = typeof value === 'string' && value.includes('_invalid');
            const isConfigField = isConfigurationAttributeColumn(col.field);
            const isNumericCell = !isInvalid && !isConfigField && isNumericValue(value);
            const displayValue = isNumericCell ? numberWithCommas(value) : value;
            const { className, style, colSpan, title } = props || {};
            return (
                <td
                    className={`${className || ''} ${isInvalid ? 'text-bg-danger-subtle' : ''} ${isNumericCell ? 'text-right' : ''}`}
                    style={style}
                    {...(colSpan ? { colSpan } : {})}
                    {...(title ? { title } : {})}
                >
                    {isInvalid ? (
                        
                        <TruncatedCell value = {displayValue} truncateClassName="d-inline-block cursor-pointer" noTable = {true}/>

                    ) : (
                        displayValue
                    )}
                </td>
            );
        },
    }));

    return (
        <Fragment>
            <RSModal
                show={!csvDownloadModal && !csvDownloadSuccessModal && show}
                size="xlg"
                header="Audience import summary"
                handleClose={() => {
                    resetAbortableRequests(statusListRequest, audienceRequest, audienceDownloadAPI);
                    dispatch(updateActionList([]));
                    setStatusList([]);
                    setSelectedStatus(null);
                    setGridColumns([]);
                    setHistoryModal(false);
                }}
                isBorder
                bodyClassName="custom_modal_tableTop"
                body={
                    <>
                        <Row className="mb15">
                            <Col sm={12} className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center headerLeftContent">
                                    {isStatusDropdownLoading ? (
                                        <CommonSkeleton width={360} height={28} box stopAnimation />
                                    ) : (
                                        dataAvailable && (
                                            <h4 className="m0 d-flex align-items-center">
                                                <span>{getSummaryTitle(selectedStatus)}:</span>

                                                {isAudienceGridLoading && selectedStatus ? (
                                                    <CommonSkeleton
                                                        width={32}
                                                        height={26}
                                                        box
                                                        stopAnimation
                                                        mainClass="d-inline-flex ml5 mb0"
                                                    />
                                                ) : (
                                                    <span className="font-bold font-md ml5">
                                                        {numberWithCommas(displayCount || 0)}
                                                    </span>
                                                )}
                                            </h4>
                                        )
                                    )}
                                </div>
                                <div className="d-flex align-items-center headerRightContent">
                                    {isStatusDropdownLoading ? (
                                        <CommonSkeleton width={180} height={32} box stopAnimation />
                                    ) : statusList?.length > 0 ? (
                                        <RSBootstrapdown
                                            data={statusList}
                                            defaultItem={statusList[0]}
                                            fieldKey="labelName"
                                            alignRight={true}
                                            onSelect={handleInvalidAPI}
                                            isObject
                                            isActive
                                        />
                                    ) : null}
                                    {(isAudienceGridLoading && statusList?.length > 0) || dataAvailable ? (
                                        <div className="ml15 d-flex align-items-center lh0">
                                            {isAudienceGridLoading && statusList?.length > 0 ? (
                                                <CommonSkeleton
                                                    width={32}
                                                    height={32}
                                                    icon
                                                    stopAnimation
                                                    mainClass="d-inline-flex mb0"
                                                />
                                            ) : (
                                                headerRightContent
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            </Col>
                        </Row>
                        <KendoGrid
                            data={gridData}
                            column={columns}
                            scrollable="scrollable"
                            noBoxShadow
                            pageable={true}
                            isLoading={isGridLoading}
                            isFailure={!isGridLoading && !gridData.length}
                            isFailureMessage={NO_RECORDS_FOUND}
                            skeletonColumns={SKELETON_COLUMN_COUNT}
                            settings={{
                                total: gridData.length || 0,
                                sortable: false,
                            }}
                        />
                    </>
                }
                downloadModal={csvDownloadModal}
            />
            {csvDownloadModal && (
                <DownloadCSV
                    show={csvDownloadModal}
                    handleClose={() => setCsvDownloadModal(false)}
                    isSyncHistory
                    onSuccess={(data) => handleDownloadCSV(data)}
                    apiErrorMessage={downloadCSVAPIError}
                    requestOtpExtraPayload={{
                        requestfrom: `${getValues()?.status?.key || 'invalid'}csv`,
                    }}
                />
            )}
            {csvDownloadSuccessModal && (
                <RSConfirmationModal
                    show={csvDownloadSuccessModal}
                    header={csvDownloadModalHeader}
                    isCloseButton={!audienceDownloadAPI.isLoading && csvDownloadStatus !== 'processing'}
                    htmlContent={
                        audienceDownloadAPI.isLoading || csvDownloadStatus === 'processing' ? (
                            <p className="text-center d-flex align-items-center justify-content-center mb0">
                                <i className={`${in_progress_medium} icon-md lh0 color-inprogress mr8`} />
                                <span>{REQUEST_PROCESSING}</span>
                            </p>
                        ) : csvDownloadStatus === 'error' ? (
                            <p className="text-center mb0">{downloadCSVAPIError}</p>
                        ) : (
                            <p className="text-center mb0">
                                {THANK_YOU_YOUR_REQUEST}
                                <br />
                                {DOWNLOAD_LINK_DATA_SHORTLY}
                            </p>
                        )
                    }
                    primaryButton={false}
                    handleClose={closeCsvDownloadResultModal}
                    secondaryButton={false}
                />
            )}
        </Fragment>
    );
};

export default HistoryModal;
