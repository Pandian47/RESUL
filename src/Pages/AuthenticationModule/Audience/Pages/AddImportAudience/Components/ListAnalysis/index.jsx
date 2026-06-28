import { formatNumber } from 'Utils/modules/campaignUtils';

import { truncateTitle } from 'Utils/modules/displayCore';
import { CANCEL, DUPLICATE_ROW_COUNT, LIST_ANALYSIS, NO_OF_CELL_MISSING, NO_OF_COLUMN_HEADERS, NO_RECORDS_FOUND, PROCEED, ROW_LENGTH, TOTAL_FILE_SIZE, TOTAL_FILE_SIZES, UPDATE_CYCLE } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useMemo } from 'react';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
import { Col, Row } from 'react-bootstrap';
import KendoGrid from 'Components/RSKendoGrid';
import { columnConfig } from './constants';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';

import RSTooltip from 'Components/RSTooltip';

const formatDataTypeLabel = (type) => {
    if (type == null || type === '') return '-';
    const text = String(type);
    return text?.charAt(0)?.toUpperCase() + text?.slice(1)?.toLowerCase();
};

const ListAnalysis = ({
    show,
    dispatchState,
    type,
    close,
    isProceed = true,
    listAnalysisData,
    listType,
    isLoading = false,
}) => {
    const handleClose = () => {
        if (type === 'sync' || type === 'addAudience') {
            close();
        } else {
            dispatchState({ type: 'UPDATE', field: 'listAnalysis', payload: false });
        }
    };

    const hasData = listAnalysisData != null && Object.keys(listAnalysisData).length > 0;
    const isSync = type === 'sync';
    const isEmptyState = !isLoading && !hasData;

    const columnDetails = useMemo(() => {
        if (!hasData) return [];
        return (listAnalysisData?.columnDetails ?? [])?.map((column) => ({
            ...column,
            dataType: formatDataTypeLabel(column?.dataType ?? ''),
        }));
    }, [hasData, listAnalysisData?.columnDetails]);

    const listTypeNum = Number(listType);
    const isMLSL =
        listTypeNum === 2 ||
        listTypeNum === 4 ||
        listType === 'Match input list' ||
        listType === 'Suppression input list';

    const audienceLabel = isMLSL ? 'Total records' : 'Total audience';
    const totalFileSizeLabel = isSync ? TOTAL_FILE_SIZES : TOTAL_FILE_SIZE;

    const regularFields = [
        { key: 'rowLength', label: audienceLabel, isNumber: true },
        { key: 'colLength', label: NO_OF_COLUMN_HEADERS, isNumber: true },
        { key: 'duplicateRowsCount', label: DUPLICATE_ROW_COUNT, isNumber: true },
        // { key: 'rowLength', label: ROW_LENGTH },
        { key: 'totalMissingValuesCount', label: NO_OF_CELL_MISSING, isNumber: true },
        { key: 'size', label: totalFileSizeLabel },
    ];

    const syncFields = [
        { key: 'new_audience', label: 'New audiences', isNumber: true },
        { key: 'existing_audience', label: 'Existing audiences', isNumber: true },
        { key: 'invalid_audience', label: 'Invalid audiences', isNumber: true },
        { key: 'dedupe_audience', label: 'Dedupe audiences', isNumber: true },
        { key: 'update_frequency', label: UPDATE_CYCLE },
    ];

    const renderValue = (value, field) => {
        const limitCharacter = field.limitCharacter || 20;
        const stringValue = String(value);
        const shouldTruncate = stringValue.length > limitCharacter;
        return (
            <RSTooltip text={stringValue} position="top" innerContent={false}>
                <span className="m0">
                    {shouldTruncate
                        ? truncateTitle(field?.isNumber ? formatNumber(stringValue) : stringValue, limitCharacter)
                        : field?.isNumber
                        ? formatNumber(stringValue)
                        : stringValue}
                </span>
            </RSTooltip>
        );
    };

    const renderRow = (label, value, field = null, isSkeleton = false) => (
        <div className={`box-design no-box-shadow listBox-item `}>
            <h5 className="font-xs mb5 text-center">
                {isSkeleton ? <CommonSkeleton height={20} width={150} box stopAnimation={true} /> : label}
            </h5>
            <h1 className="font-md font-bold text-center">
                {isSkeleton ? (
                    <CommonSkeleton height={20} width={30} box stopAnimation={true} />
                ) : (
                    renderValue(value, field)
                )}
            </h1>
        </div>
    );

    const renderColumn = (fields, data, isSkeleton = false) =>
        fields
            .filter((field) => field)
            .map((field) => {
                const value = isSkeleton ? null : data?.[field.key] ?? '-';
                return (
                    <Fragment key={field.key}>{renderRow(field.label, value, field, isSkeleton)}</Fragment>
                );
            });

    return (
        <RSModal
            show={show}
            handleClose={handleClose}
            header={LIST_ANALYSIS}
            size="xxlg"
            body={
                <div>
                    <>
                        {isLoading ? (
                            <div className="mb15 d-flex flex-wrap listBoxWrapper skeleton-span-con p0">
                                {renderColumn(regularFields, null, true)}
                                {isSync &&
                                    Number(listType) !== 2 &&
                                    Number(listType) !== 4 &&
                                    renderColumn(syncFields, null, true)}
                            </div>
                        ) : hasData ? (
                            <>
                                {isSync && listAnalysisData?.import_description && (
                                    <Row className="mb15">
                                        <Col sm={12}>
                                            {listAnalysisData.import_description.length >= 100 ? (
                                                <div>
                                                    <h5 className="mb10">Import description:</h5>
                                                    <h5 className="font-bold mb0">
                                                        {listAnalysisData.import_description}
                                                    </h5>
                                                </div>
                                            ) : (
                                                <h4 className="mb0">
                                                    Import description:{' '}
                                                    <span className="font-bold">
                                                        {listAnalysisData.import_description}
                                                    </span>
                                                </h4>
                                            )}
                                        </Col>
                                    </Row>
                                )}
                                <div className="mb15 d-flex flex-wrap listBoxWrapper">
                                    {renderColumn(regularFields, listAnalysisData)}
                                    {isSync &&
                                        Number(listType) !== 2 &&
                                        Number(listType) !== 4 &&
                                        renderColumn(syncFields, listAnalysisData)}
                                </div>
                            </>
                        ) : (
                           <></>
                        )}

                        <KendoGrid
                            data={columnDetails}
                            column={columnConfig}
                            noBoxShadow
                            isDataStateRequired={false}
                            isLoading={isLoading}
                            isFailure={isEmptyState}
                            isFailureMessage={NO_RECORDS_FOUND}
                            settings={{
                                total: isSync
                                    ? columnDetails.length
                                    : parseInt(listAnalysisData?.colLength, 10) ?? 0,
                            }}
                            pageable={true}
                            pagerChange={true}
                        />
                        {/* {!isSync && (
                            <div className="buttons-holder">
                                <RSSecondaryButton onClick={handleClose} className="mr10">
                                    {CANCEL}
                                </RSSecondaryButton>
                                {isProceed && (
                                    <RSPrimaryButton
                                        onClick={() => {
                                            handleClose();
                                            dispatchState({ type: 'UPDATE', field: 'saveModal', payload: true });
                                        }}
                                    >
                                        {PROCEED}
                                    </RSPrimaryButton>
                                )}
                            </div>
                        )} */}
                    </>
                </div>
            }
        />
    );
};

export default ListAnalysis;
