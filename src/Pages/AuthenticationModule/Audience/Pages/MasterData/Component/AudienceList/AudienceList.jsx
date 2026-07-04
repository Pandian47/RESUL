
import { AUDIENCE_LIST, CHOOSE_ATTRIBUTES_TO_DISPLAY_IN_TABLE, CSV_DOWNLOAD, DOWNLOAD_CSV, DOWNLOAD_LINK_DATA_SHORTLY, FAILED, REQUEST_PROCESSING, SEARCH_FILTERS_SAMPLE_RECORD, SEELCTED_DISPLAY_FIELDS, THANK_YOU_YOUR_REQUEST } from 'Constants/GlobalConstant/Placeholders';
import { csv_download_medium, field_selector_large, field_selector_medium, in_progress_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo, useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { map as _map,keys as _key,omit as _omit,compact as _compact } from 'Utils/modules/lodashReplacements';
import { useSelector, useDispatch } from 'react-redux';

import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';
import SelectAttributeListboxModal from 'Components/SelectAttributeListboxModal';
import { getSessionId } from 'Reducers/globalState/selector';
import { AUDIENCE_TYPE_FLAGS } from '../../constant';
import { getMasterGridData } from 'Reducers/audience/masterdata/request';
import useOnlyDepChangeEffect from 'Hooks/useOnlyDepChangeEffect';

import DownloadCSV from 'Pages/AuthenticationModule/Components/DownloadCSV/DownloadCSV';
import { downloadTargetListFiles } from 'Reducers/audience/targetList/request';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { getUserInfoDetailsForOTP } from 'Reducers/globalState/request';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import { sanitizeMdmCellValue, compareMdmStrings } from 'Pages/AuthenticationModule/Audience/audienceDefaults';

const stripGridMeta = (row) => _omit(row || {}, ['RowKey', 'R1_s']);
const firstDataRow = (rows) =>
    (rows || []).map(stripGridMeta).find((r) => r && typeof r === 'object' && Object.keys(r).length > 0) || null;

const AUDIENCE_GRID_COLUMN_WIDTH = 205;

const buildAudienceGridColumn = (field) => ({
    field,
    title: field,
    width: AUDIENCE_GRID_COLUMN_WIDTH,
    filter: 'text',
    cell: (props) => {
        const cellValue = props?.dataItem?.[field];
        const displayValue = sanitizeMdmCellValue(cellValue);
        return <td>{displayValue}</td>;
    },
});

const AudienceList = ({ show = {}, setIsShow }) => {
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { currentTabConfig: { audienceType = 'Brand audience' } = {} } = useSelector(
        ({ globalstate }) => globalstate,
    );
    const audienceFlags = AUDIENCE_TYPE_FLAGS[audienceType] ?? { isPartner: false, isInternal: false };
    const { audienceList, audienceOverviewLoading, audienceListAttrs, audienceGridLoading, audienceGrid = {} } = useSelector(
        ({ masterDataReducer = {} }) => masterDataReducer,
    );

    const [audienceGridData, setAudienceGridData] = useState([]);
    const [selectedColumnsData, setSelectedColumnData] = useState({ leftAttributes: [], rightAttributes: [] });
    const [downloadCSVAPIError, setDownloadCSVAPIError] = useState('');
    const [csvDownloadStatus, setCsvDownloadStatus] = useState(null);
    const audienceDownloadAPI = useApiLoader({ autoFetch: false });
    const fieldSelectorApplyAPI = useApiLoader({ autoFetch: false });
    // useEffect(() => {
    //     const modifiedData = _map(audienceList, (obj) => _omit(obj, ['RowKey', 'R1_s']));
    //     setAudienceGridData(modifiedData);
    //     let attributes = _map(_key(modifiedData[0]), (attr) => ({ name: attr, selected: false })); // Object.keys(audienceGridData?.[0])?.map((key) => ({ name: key, selected: false }));
    //     // let tempSortValue = attributes?.sort((a, b) => (a?.name.toLowerCase() > b?.name.toLowerCase() ? 1 : -1));
    //     // setSelectedColumnData((prev) => ({ ...prev, rightAttributes: tempSortValue }));
    //     let sortedAttributes = attributes?.sort((a, b) => (a?.name.toLowerCase() > b?.name.toLowerCase() ? 1 : -1));
    //     setSelectedColumnData({
    //         leftAttributes: sortedAttributes,
    //         rightAttributes: [],
    //     });
    // }, [audienceList]);

    useEffect(() => {
        const grid = audienceGrid;
        const availRaw = grid?.availableattributes;
        const selRaw = grid?.selectedattributes;

        if (!Array.isArray(availRaw) && !Array.isArray(selRaw)) {
            setSelectedColumnData({ leftAttributes: [], rightAttributes: [] });
            return;
        }

        const leftAttrs = _map(availRaw || [], (obj) => stripGridMeta(obj));
        const rightAttrs = _map(selRaw || [], (obj) => stripGridMeta(obj));

        const leftFirst = firstDataRow(leftAttrs);
        const rightFirst = firstDataRow(rightAttrs);

        const keysFromRow = (row) =>
            row && typeof row === 'object' && Object.keys(row).length
                ? _map(_key(row), (attr) => ({ name: attr, selected: false }))
                : [];

        const hasSelectedKeys = Boolean(rightFirst && Object.keys(rightFirst).length);

        let attributesRight = keysFromRow(rightFirst);
        let attributesLeft = keysFromRow(leftFirst);

        // if (!hasSelectedKeys && leftFirst && Object.keys(leftFirst).length) {
        //     attributesRight = keysFromRow(leftFirst);
        //     attributesLeft = [];
        // } else 
        if (!hasSelectedKeys) {
            attributesRight = [];
            attributesLeft = keysFromRow(leftFirst);
        }

        setSelectedColumnData({
            leftAttributes: attributesLeft,
            rightAttributes: attributesRight,
        });
    }, [audienceGrid]);

    // useEffect(() => {
    //     const modifiedData = _map(audienceList, (obj) => _omit(obj, ['RowKey', 'R1_s']));
    //     setAudienceGridData(modifiedData);
    // }, [])

    // useOnlyDepChangeEffect(() => {
    //     let attributes = _map(_key(audienceGridData[0]), (attr) => ({ name: attr, selected: false }));
    //     setSelectedColumnData((prev) => ({ ...prev, leftAttributes: [...prev.leftAttributes, ...attributes] }));
    // }, [audienceList]);

    useOnlyDepChangeEffect(() => {
        if (!Array.isArray(audienceListAttrs) || !audienceListAttrs.length) return;
        const attributes = Object.keys(audienceGridData?.[0] ?? {}).map((key) => ({ name: key, selected: false }));

        setSelectedColumnData((prev) => ({
            ...prev,
            leftAttributes: [...prev.leftAttributes, ...attributes],
            rightAttributes: [...prev.rightAttributes, ...attributes],
        }));
    }, [audienceListAttrs]);

    // useEffect(() => {
    //     if (show.FieldSelectorModal && _isEmpty(audienceListAttrs)) {
    //         dispatch(getAudienceListAttributes({ departmentId, clientId, userId }));
    //     }
    // }, [show.FieldSelectorModal, departmentId, clientId, userId]);
    useEffect(() => {
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        dispatch(getUserInfoDetailsForOTP(payload, false));
    }, []);
    const gridData = useMemo(() => {
        const sel = _map(audienceGrid?.selectedattributes || [], (obj) => stripGridMeta(obj));
        const avail = _map(audienceGrid?.availableattributes || [], (obj) => stripGridMeta(obj));

        const rawRows = firstDataRow(sel) ? sel : firstDataRow(avail) ? avail : [];

        return (rawRows || [])
            .map((item) => {
                const processedItem = {};
                Object.keys(item || {}).forEach((key) => {
                    processedItem[key] = sanitizeMdmCellValue(item[key]);
                });
                return processedItem;
            })
            .filter((row) => row && Object.keys(row).length > 0);
    }, [audienceGrid?.selectedattributes, audienceGrid?.availableattributes]);

    const updateListBox = async (data) => {
        const payload = {
            departmentId,
            dataattributeId: _compact(_map(data.rightAttributes, 'DataAttributeID')).join(','),
        };
        // await dispatch(updateAudienceListAttributes(payload));
    };
    const handleCancel = () => {
        if (selectedColumnsData.leftAttributes?.length > 0) {
            setSelectedColumnData((prevState) => {
                return {
                    leftAttributes: [...prevState.leftAttributes],
                    rightAttributes: [...prevState.rightAttributes],
                };
            });
            selectedColumnsData.leftAttributes?.forEach((item) => {
                item.selected = false;
            });
        }

        if (selectedColumnsData.leftAttributes?.length === 0) {
            setSelectedColumnData((prevState) => {
                return {
                    leftAttributes: [],
                    rightAttributes: [...prevState.rightAttributes, ...prevState.leftAttributes],
                };
            });
        }
        selectedColumnsData.rightAttributes?.forEach((item) => {
            item.selected = false;
        });
    };
    const handleBgColor = () => {
        selectedColumnsData.leftAttributes?.forEach((item) => {
            item.selected = false;
        });
        selectedColumnsData.rightAttributes?.forEach((item) => {
            item.selected = false;
        });
    };

    const handleDownloadCSV = async (keyData) => {
        setDownloadCSVAPIError('');
        setCsvDownloadStatus('processing');
        setIsShow((prev) => ({ ...prev, csvDownloadModal: false, csvDownloadSuccessModal: true }));

        const payload = {
            departmentId,
            clientId,
            userId,
            sentMailList: keyData,
            downloadType: 'Audiencelist',
        };

        const res = await audienceDownloadAPI.refetch({
            fetcher: () => dispatch(downloadTargetListFiles(payload, false)),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.NONE, edit: LOADER_TYPE.NONE },
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
        setIsShow((prev) => ({ ...prev, csvDownloadSuccessModal: false }));
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

    const gridColumnFields = useMemo(() => {
        const selectedFieldNames = (selectedColumnsData?.rightAttributes ?? [])
            .map((attr) => attr?.name)
            .filter(Boolean);
        if (selectedFieldNames.length) return selectedFieldNames;

        const sel = _map(audienceGrid?.selectedattributes || [], (obj) => stripGridMeta(obj));
        const avail = _map(audienceGrid?.availableattributes || [], (obj) => stripGridMeta(obj));
        const schemaRow = firstDataRow(sel) || firstDataRow(avail);
        if (schemaRow) return _key(schemaRow);

        if (gridData?.[0]) return _key(gridData[0]);

        return [];
    }, [
        gridData,
        selectedColumnsData?.rightAttributes,
        audienceGrid?.selectedattributes,
        audienceGrid?.availableattributes,
    ]);

    const gridColumns = useMemo(
        () => _map(gridColumnFields, (field) => buildAudienceGridColumn(field)),
        [gridColumnFields],
    );

    const gridSettings = useMemo(
        () => ({
            total: gridData?.length,
        }),
        [gridData?.length],
    );

    return (
        <Fragment>
            <Row>
                <Col>
                    <div className="rs-table-with-heading mb4 MDM-AudienceList">
                        <div className="portlet-header d-flex justify-content-between mb10">
                            <div className="fr flex-left">
                                <h4 className="mb0 d-flex align-items-center">
                                    {AUDIENCE_LIST}:{' '}
                                    <span className="font-bold font-md ml5">{gridData?.length} </span>
                                </h4>
                                <small className="my5-del">{SEARCH_FILTERS_SAMPLE_RECORD}</small>
                            </div>
                            <div className="float-end">
                                <ul
                                    className={`${ audienceGridLoading ? 'pe-none click-off' : ''
                                    } rs-list-group-horizontal jc-right`}
                                >
                                    <li
                                        onClick={() => {
                                            setIsShow((prev) => ({ ...prev, FieldSelectorModal: true }));
                                        }}
                                    >
                                        <RSTooltip
                                            className="lh0"
                                            text={SEELCTED_DISPLAY_FIELDS}
                                            position="top"
                                        >
                                            <i
                                                id="rs_data_field_selector"
                                                className={`icon-md color-primary-blue ${field_selector_medium}`}
                                            ></i>
                                        </RSTooltip>
                                    </li>

                                    <li
                                        onClick={() => {
                                            setIsShow((prev) => ({ ...prev, csvDownloadModal: true }));
                                        }}
                                        className={`ml15 ${
                                            !gridData?.length || audienceGridLoading ? 'pe-none click-off' : ''
                                        }`}
                                    >
                                        <RSTooltip className="lh0" text={CSV_DOWNLOAD} position="top">
                                            <i
                                                id="rs_data_field_selector"
                                                className={`icon-md color-primary-blue ${csv_download_medium}`}
                                            ></i>
                                        </RSTooltip>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="portlet-body">
                            <KendoGrid
                                data={gridData}
                                isLoading={audienceOverviewLoading || audienceGridLoading}
                                loadResetKey={`${departmentId}-${audienceType}`}
                                skeletonRows={5}
                                column={gridColumns}
                                isScrollTop={false}
                                pageable
                                scrollable={'scrollable'}
                                settings={gridSettings}
                                // isCustomClass={gridData?.length > 4 ? 'pb15' : ''}
                            />
                        </div>
                    </div>
                </Col>
            </Row>
            <SelectAttributeListboxModal
                header={CHOOSE_ATTRIBUTES_TO_DISPLAY_IN_TABLE}
                show={show?.FieldSelectorModal}
                leftAttributes={[...(selectedColumnsData.leftAttributes ?? [])].sort((a, b) =>
                    compareMdmStrings(a?.name, b?.name),
                )}
                rightAttributes={[...(selectedColumnsData.rightAttributes ?? [])].sort((a, b) =>
                    compareMdmStrings(a?.name, b?.name),
                )}
                getSelectedData={async (data) => {
                    const payload = {
                        departmentId,
                        userId,
                        clientId,
                        isPartner: audienceFlags.isPartner,
                        isInternal: audienceFlags.isInternal,
                        Isupdate: true,
                        updateattribute: _map(data?.rightAttributes, 'name'),
                    };
                    await fieldSelectorApplyAPI.refetch({
                        fetcher: () => dispatch(getMasterGridData(payload)),
                        mode: 'create',
                        loaderConfig: { create: LOADER_TYPE.NONE, edit: LOADER_TYPE.NONE },
                    });
                    setSelectedColumnData(data);
                    updateListBox(data);
                    setIsShow((prev) => ({ ...prev, FieldSelectorModal: false }));
                    handleBgColor();
                }}
                isApplyLoading={fieldSelectorApplyAPI.isFetching}
                handleClose={() => {
                    if (show?.FieldSelectorModal) {
                        fieldSelectorApplyAPI.reset();
                        setIsShow((prev) => ({ ...prev, FieldSelectorModal: false }));
                        handleCancel();
                    }
                }}
                isAudienceField
                showCount={true}
            />
            {show?.csvDownloadModal && (
                <DownloadCSV
                    show={show.csvDownloadModal}
                    handleClose={() => setIsShow((prev) => ({ ...prev, csvDownloadModal: false }))}
                    isDataCatalogue
                    onSuccess={(data) => handleDownloadCSV(data)}
                    apiErrorMessage={downloadCSVAPIError}
                    requestOtpExtraPayload={{ requestfrom: 'audienceList' }}
                />
            )}
            {show?.csvDownloadSuccessModal && (
                <RSConfirmationModal
                    show={show.csvDownloadSuccessModal}
                    header={csvDownloadModalHeader}
                    isCloseButton={!audienceDownloadAPI.isLoading && csvDownloadStatus !== 'processing'}
                    htmlContent={
                        audienceDownloadAPI.isLoading || csvDownloadStatus === 'processing' ? (
                            <p className="text-center d-flex align-items-center justify-content-center  mb0">
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

export default memo(AudienceList);
