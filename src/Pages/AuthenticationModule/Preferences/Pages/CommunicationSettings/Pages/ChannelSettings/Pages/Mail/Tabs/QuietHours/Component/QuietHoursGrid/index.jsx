import { ACTION, ARE_YOU_SURE_DELETE, DELETE, DUPLICATE, EDIT, QUIET_HOURS_BEHAVIOR, QUIET_HOURS_COL_RULE, QUIET_HOURS_COUNTRY_REGION, QUIET_HOURS_DAYS, QUIET_HOURS_FIRST_RULE_HINT, QUIET_HOURS_MESSAGE_TYPE, QUIET_HOURS_STATUS_OFF, QUIET_HOURS_STATUS_ON, QUIET_HOURS_WINDOW, STATUS, TYPE, VIEW } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_medium, delete_large, duplicate_medium, eye_medium, lock_medium, pencil_edit_large } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Switch } from '@progress/kendo-react-inputs';
import { useDispatch, useSelector } from 'react-redux';

import KendoGrid from 'Components/RSKendoGrid';

import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
import RSTooltip from 'Components/RSTooltip';
import RSConfirmationModal from 'Components/ConfirmationModal';
import useApiLoader from 'Hooks/useApiLoader';
import { NONE_LOADER_CONFIG as noLoaderConfig } from 'Hooks/loaderTypes';

import { QuietHoursProvider } from '../..';
import { getUserDetails } from 'Utils/modules/crypto';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    deleteQuietHoursSettings,
    getQuietHoursSettings,
    updateQuietHoursStatus,
} from 'Reducers/preferences/CommunicationSettings/request';
import { ADMIN_ACCESS_TOOLTIP, RULE_TYPES, buildQuietHoursDeletePayload, buildQuietHoursListPayload, buildQuietHoursStatusPayload, isQuietHoursAdminRole, isQuietHoursSessionReady, mapQuietHoursApiRowsToGrid, parseQuietHoursApiResponse } from '../../constant';
const QuietHoursGrid = () => {
    const context = useContext(QuietHoursProvider);
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { channelId, gridListVersion = 0, consumePreloadedGridList } = context || {};
    const roleId = getUserDetails()?.roleId;
    const isAdmin = isQuietHoursAdminRole(roleId);

    const gridApi = useApiLoader({ autoFetch: false, loaderConfig: noLoaderConfig, mode: 'create' });
    const [gridRows, setGridRows] = useState([]);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [deleteState, setDeleteState] = useState({ show: false, data: {} });

    const isGridLoading = gridApi.isFetching || !hasLoaded;

    const openCreateForm = () => {
        if (!isAdmin) return;
        context.setGridCreate((prev) => ({
            ...prev,
            showGrid: false,
            quietHoursAction: {
                edit: {
                    editState: [],
                    isEdit: false,
                },
                create: true,
                duplicate: false,
            },
        }));
    };

    const emptyGridMessage = (
        <>
            Click
            <span
                className={`rs-nodata-icon-wrap position-relative bottom1 mx5 pt2${!isAdmin ? ' cursor-not-allowed' : ''}`}
            >
                <i
                    id="rs_data_circle_plus_fill_edge"
                    className={`icon-md color-primary-blue icon-hover-shadow-primary ${circle_plus_fill_edge_medium}${!isAdmin ? ' click-off' : ''}`}
                    onClick={(event) => {
                        event.stopPropagation();
                        openCreateForm();
                    }}
                />
            </span>
            
             {QUIET_HOURS_FIRST_RULE_HINT}
        </>
    );

    const isRegulatory = (dataItem) => dataItem?.ruleType === RULE_TYPES.REGULATORY;
    const isBrandRule = (dataItem) => dataItem?.ruleType === RULE_TYPES.BRAND;

    const showViewOnlyAction = (dataItem) => isRegulatory(dataItem) || !isAdmin;
    const canManageBrandRule = (dataItem) => isAdmin && isBrandRule(dataItem);

    const applyGridRows = useCallback((rows) => {
        setGridRows(mapQuietHoursApiRowsToGrid(rows));
    }, []);

    const handleGridData = useCallback(() => {
        const payload = buildQuietHoursListPayload({
            clientId,
            userId,
            departmentId,
            channelId,
            pageNo: 1,
            pageSize: 500,
        });

        return gridApi.refetch({
            fetcher: () => dispatch(getQuietHoursSettings(payload, { loading: false })),
            loaderConfig: noLoaderConfig,
            mode: 'create',
            onSuccess: (response) => {
                const { status, data } = parseQuietHoursApiResponse(response);
                if (status) {
                    applyGridRows(data);
                    return;
                }
                setGridRows([]);
            },
            onError: () => {
                setGridRows([]);
            },
            onSettled: () => {
                setHasLoaded(true);
            },
        });
    }, [applyGridRows, channelId, clientId, departmentId, dispatch, gridApi.refetch, userId]);

    useEffect(() => {
        const preloaded = consumePreloadedGridList?.();
        if (preloaded != null) {
            applyGridRows(preloaded);
            setHasLoaded(true);
            return undefined;
        }

        if (
            !isQuietHoursSessionReady({
                channelId,
                clientId,
                departmentId,
                userId,
            })
        ) {
            return undefined;
        }

        handleGridData();

        return () => {
            gridApi.reset();
            setHasLoaded(false);
        };
    }, [
        applyGridRows,
        channelId,
        clientId,
        consumePreloadedGridList,
        departmentId,
        handleGridData,
        gridListVersion,
        gridApi.reset,
        userId,
    ]);

    const handleStatusChange = async (checked, dataItem) => {
        if (!isAdmin || isRegulatory(dataItem) || dataItem?.ruleId == null) return;

        const nextStatus = Boolean(checked);
        const response = await dispatch(
            updateQuietHoursStatus(
                buildQuietHoursStatusPayload({
                    clientId,
                    userId,
                    departmentId,
                    channelId,
                    ruleId: dataItem.ruleId,
                    statusId: nextStatus ? 1 : 0,
                    ruleType: dataItem.ruleType,
                }),
            ),
        );
        const { status } = parseQuietHoursApiResponse(response);

        if (status) {
            setGridRows((prev) =>
                prev.map((item) =>
                    item.ruleId === dataItem.ruleId ? { ...item, status: checked } : item,
                ),
            );
        }
    };

    const handleDelete = async (ruleId, ruleType) => {
        if (ruleId == null) return;

        const response = await dispatch(
            deleteQuietHoursSettings(
                buildQuietHoursDeletePayload({
                    clientId,
                    userId,
                    departmentId,
                    channelId,
                    ruleId,
                    ruleType,
                }),
            ),
        );
        const { status } = parseQuietHoursApiResponse(response);

        if (status) {
            handleGridData();
        }
    };

    const openForm = (dataItem, { duplicate = false } = {}) => {
        context?.setGridCreate?.((prev) => ({
            ...prev,
            showGrid: false,
            quietHoursAction: {
                edit: {
                    editState: dataItem,
                    isEdit: !duplicate,
                },
                create: duplicate,
                duplicate,
            },
        }));
    };

    const gridColumns = [
        {
            field: 'ruleName',
            title: QUIET_HOURS_COL_RULE,
            filter: 'text',
            width: 300,
            cell: ({ dataItem }) => (
                <td style={{ minWidth: 0 }}>
                    <div
                        className="rs-quiet-hours-rule-cell"
                        style={{ minWidth: 0, overflow: 'hidden' }}
                    >
                        <div className="font-semi-bold" style={{ minWidth: 0 }}>
                            <TruncatedCell noTable value={dataItem?.ruleName ?? ''} />
                        </div>
                        {dataItem?.ruleSubtitle ? (
                            <small className="text-muted d-block" style={{ minWidth: 0 }}>
                                <TruncatedCell noTable value={dataItem.ruleSubtitle} />
                            </small>
                        ) : null}
                    </div>
                </td>
            ),
        },
        {
            field: 'ruleType',
            title: TYPE,
            filter: 'text',
            width: 150,
            cell: ({ dataItem }) => (
                <td>
                    {isRegulatory(dataItem) ? (
                        <span className="d-inline-flex align-items-center">
                            <RSTooltip text="Regulatory rule" position="top">
                                <i className={`${lock_medium} icon-sm color-primary-grey mr5`} />
                            </RSTooltip>
                            {RULE_TYPES.REGULATORY}
                        </span>
                    ) : (
                        RULE_TYPES.BRAND
                    )}
                </td>
            ),
        },
        {
            field: 'countryRegion',
            title: QUIET_HOURS_COUNTRY_REGION,
            filter: 'text',
            width: 220,
            cell: ({ dataItem }) => (
                <TruncatedCell cellClassName="m0" value={dataItem?.countryRegion ?? ''} />
            ),
        },
        {
            field: 'window',
            title: QUIET_HOURS_WINDOW,
            filter: 'text',
            width: 200,
            cell: ({ dataItem }) => (
                <TruncatedCell cellClassName="m0" value={dataItem?.window ?? ''} />
            ),
        },
        {
            field: 'days',
            title: QUIET_HOURS_DAYS,
            filter: 'text',
            width: 200,
            cell: ({ dataItem }) => (
                <TruncatedCell cellClassName="m0" value={dataItem?.days ?? ''} />
            ),
        },
        {
            field: 'messageType',
            title: QUIET_HOURS_MESSAGE_TYPE,
            filter: 'text',
            width: 180,
            cell: ({ dataItem }) => (
                <TruncatedCell cellClassName="m0" value={dataItem?.messageType ?? ''} />
            ),
        },
        {
            field: 'behavior',
            title: QUIET_HOURS_BEHAVIOR,
            filter: 'text',
            width: 140,
            cell: ({ dataItem }) => (
                <TruncatedCell cellClassName="m0" value={dataItem?.behavior ?? ''} />
            ),
        },
        {
            field: 'status',
            title: STATUS,
            width: 130,
            cell: ({ dataItem }) => {
                const switchProps = {
                    checked: Boolean(dataItem?.status),
                    onLabel: QUIET_HOURS_STATUS_ON,
                    offLabel: QUIET_HOURS_STATUS_OFF,
                };

                if (isRegulatory(dataItem)) {
                    return (
                        <td className="text-center pe-none click-off">
                            <Switch className="click-off" {...switchProps} />
                        </td>
                    );
                }

                if (!isAdmin) {
                    return (
                        <td className="text-center pe-none click-off">
                            <RSTooltip text={ADMIN_ACCESS_TOOLTIP} position="top">
                                <Switch className="click-off" {...switchProps} />
                            </RSTooltip>
                        </td>
                    );
                }

                return (
                    <td className="text-center">
                        <Switch
                            {...switchProps}
                            onChange={(e) =>
                                                    handleStatusChange(
                                                        e.value ?? e.target?.value,
                                                        dataItem,
                                                    )
                                                }
                        />
                    </td>
                );
            },
        },
        {
            field: 'action',
            title: ACTION,
            width: 240,
            sortingEnabled: false,
                                sortable: false,
            cell: ({ dataItem }) => {
                if (showViewOnlyAction(dataItem)) {
                    return (
                        <td>
                            <div className="d-inline-flex align-items-center flex-nowrap">
                                <RSTooltip text={VIEW} position="top" innerContent={false}>
                                    <i
                                        className={`${eye_medium} icon-md cp color-primary-blue`}
                                        role="presentation"
                                        onClick={() => openForm(dataItem)}
                                    />
                                </RSTooltip>
                            </div>
                        </td>
                    );
                }

                if (!canManageBrandRule(dataItem)) {
                    return <td />;
                }

                return (
                    <td>
                        <div className="d-inline-flex align-items-center flex-nowrap">
                            <RSTooltip text={EDIT} position="top" innerContent={false}>
                                <i
                                    className={`${pencil_edit_large} icon-md cp mr10 color-primary-blue`}
                                    role="presentation"
                                    onClick={() => openForm(dataItem)}
                                />
                            </RSTooltip>
                            <RSTooltip text={DUPLICATE} position="top" innerContent={false}>
                                <i
                                    className={`${duplicate_medium} icon-md cp mr10 color-primary-blue`}
                                    role="presentation"
                                    onClick={() => openForm(dataItem, { duplicate: true })}
                                />
                            </RSTooltip>
                            <RSTooltip text={DELETE} position="top" innerContent={false}>
                                <i
                                    className={`${delete_large} icon-md cp color-primary-red`}
                                    role="presentation"
                                    onClick={() => {
                                        setDeleteState({ show: true, data: dataItem });
                                    }}
                                />
                            </RSTooltip>
                        </div>
                    </td>
                );
            },
        },
    ];

    return (
        <>
            <div className="rs-grid-border-radius">
                <KendoGrid
                    data={gridRows}
                    isLoading={isGridLoading}
                    hasLoaded={hasLoaded}
                    skeletonColumns={9}
                    skeletonRows={5}
                    noBoxShadow
                    isCustomBox
                    scrollable="scrollable"
                    pageable={false}
                    noDataText={emptyGridMessage}
                    noDataShowIcon={false}
                    settings={{
                        total: gridRows.length,
                    }}
                    column={gridColumns}
                />
            </div>
            <RSConfirmationModal
                show={deleteState.show}
                text={ARE_YOU_SURE_DELETE}
                handleConfirm={(status) => {
                    if (status) {
                        handleDelete(deleteState.data?.ruleId, deleteState.data?.ruleType);
                    }
                    setDeleteState({ show: false, data: {} });
                }}
                handleClose={() => setDeleteState({ show: false, data: {} })}
            />
        </>
    );
};

export default QuietHoursGrid;
