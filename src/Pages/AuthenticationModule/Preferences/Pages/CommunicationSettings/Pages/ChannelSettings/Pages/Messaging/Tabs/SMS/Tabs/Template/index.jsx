import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { ACTIONS, ADD, ARE_YOU_SURE_DELETE, CANCEL, DELETE, DELETE_USER_ROLE, EDIT, SENDER_ID, STATUS, YES } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large, delete_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useState } from 'react';
import { Switch } from '@progress/kendo-react-inputs';
import { useSelector, useDispatch } from 'react-redux';

import RSTooltip from 'Components/RSTooltip';
import KendoGrid from 'Components/RSKendoGrid';
import usePermission from 'Hooks/usePersmission';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import {
    getSmsTemplateList,
    updateTemplateStatus,
    getSmsTemplateById,
} from 'Reducers/preferences/CommunicationSettings/request';
import { getSessionId } from 'Reducers/globalState/selector';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { CommunicationSettingsSmtpTableSkeleton } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import { SMSTemplateProvider } from './Context';

import SMSTemplateCreate from './Create';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';


const ACTION_INITIAL_STATE = {
    showGrid: true,
    smsTemplateAction: {
        edit: {
            editState: [],
            isEdit: false,
        },
        create: false,
    },
};
const SMSTemplate = () => {
    const { permissions } = usePermission();
    const { updateAccess, addAccess } = permissions || {};
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const [gridData, setGridData] = useState([]);
    const [gridLoading, setGridLoading] = useState(false);
    const [editingTemplateId, setEditingTemplateId] = useState(null);
    const [updatingTemplateId, setUpdatingTemplateId] = useState(null);
    const templateEditApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'edit' });
    const statusUpdateApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const deleteTemplateApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isDeleteTemplateLoading = deleteTemplateApi.isFetching;
    const isAnyStatusUpdating = Boolean(updatingTemplateId);
    const [failedApi, setFailedApi] = useState('');

    const [gridCreate, setGridCreate] = useState(ACTION_INITIAL_STATE);
    const [deleteModal, setDeleteModal] = useState({ show: false, templateId: null });
    const value = { setGridCreate, gridCreate };

    useEffect(() => {
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        fetchTemplateList(payload);
    }, [departmentId, clientId, userId]);

    const fetchTemplateList = async (payload) => {
        setGridLoading(true);
        const response = await dispatch(getSmsTemplateList(payload));
        // Response structure: { status, data: [...], message, totalRows }
        if (response?.status && Array.isArray(response?.data)) {
            setGridData(response?.data);
        } else {
            setGridData([]);
        }
        setGridLoading(false);
    };

    const handleErrClose = () => {
        if (failedApi === 'GetClientSMSOptById') {
            setGridCreate(ACTION_INITIAL_STATE);
        }
        setFailedApi('');
    };

    const handleEdit = useCallback(
        async (dataItem) => {
            if (!updateAccess || !dataItem?.templateId) return;

            const templateId = dataItem.templateId;
            setEditingTemplateId(templateId);

            try {
                const response = await templateEditApi.refetch({
                    fetcher: () =>
                        dispatch(
                            getSmsTemplateById({
                                departmentId,
                                clientId,
                                userId,
                                templateId,
                            }),
                        ),
                    loaderConfig: fieldLoaderConfig,
                    mode: 'edit',
                });

                if (response?.status) {
                    setGridCreate((prev) => ({
                        ...prev,
                        showGrid: false,
                        smsTemplateAction: {
                            edit: {
                                editState: response,
                                isEdit: true,
                            },
                            create: false,
                        },
                    }));
                }
            } finally {
                setEditingTemplateId(null);
            }
        },
        [updateAccess, departmentId, clientId, userId, dispatch, templateEditApi.refetch],
    );

    const handleStatusChange = useCallback(
        async (e, dataItem) => {
            if (!updateAccess || !dataItem?.templateId || isAnyStatusUpdating || isDeleteTemplateLoading) return;

            const templateId = dataItem.templateId;
            setUpdatingTemplateId(templateId);

            try {
                const payload = {
                    channel: 2,
                    statusId: e.value ? 1 : 2, // 1=Active, 2=InActive
                    templateId,
                };
                const { status } = await statusUpdateApi.refetch({
                    fetcher: () => dispatch(updateTemplateStatus(payload, false)),
                    loaderConfig: fieldLoaderConfig,
                    mode: 'create',
                });

                if (status) {
                    fetchTemplateList({
                        departmentId,
                        clientId,
                        userId,
                    });
                }
            } finally {
                setUpdatingTemplateId(null);
            }
        },
        [
            updateAccess,
            departmentId,
            clientId,
            userId,
            dispatch,
            isAnyStatusUpdating,
            isDeleteTemplateLoading,
            statusUpdateApi.refetch,
        ],
    );

    const handleDeleteTemplate = async () => {
        const templateIdToDelete = deleteModal.templateId;
        if (templateIdToDelete == null || isDeleteTemplateLoading) return;

        const payload = {
            channel: 2,
            statusId: 3, // 3 => Deleted
            templateId: templateIdToDelete,
        };
        const { status } = await deleteTemplateApi.refetch({
            fetcher: () => dispatch(updateTemplateStatus(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
        if (status) {
            setDeleteModal({ show: false, templateId: null });
            fetchTemplateList({
                departmentId,
                clientId,
                userId,
            });
        }
    };

    return (
        <SMSTemplateProvider.Provider value={value}>
            {gridCreate.showGrid ? (
                <>
                    <div className="rs-sub-heading">
                        <div className="align-items-center d-flex justify-content-between">
                            <h4 className="mb0">Templates</h4>
                            <RSTooltip position="top" text={ADD} className="lh0">
                                <i
                                    onClick={() => {
                                        if (addAccess) {
                                            setGridCreate((prev) => ({
                                                ...prev,
                                                showGrid: false,
                                                smsTemplateAction: {
                                                    edit: {
                                                        editState: [],
                                                        isEdit: false,
                                                    },
                                                    create: true,
                                                },
                                            }));
                                        }
                                    }}
                                    className={`icon-lg color-primary-blue icon-hover-shadow-primary ${
                                        circle_plus_fill_edge_large
                                    } ${!addAccess ? 'click-off' : ''}`}
                                    id="rs_data_circle_plus_fill_edge"
                                ></i>
                            </RSTooltip>
                        </div>
                    </div>

                    {gridLoading ? (
                        <CommunicationSettingsSmtpTableSkeleton />
                    ) : (
                    <KendoGrid
                        data={gridData}
                        isLoading={false}
                        loading={false}
                        noBoxShadow
                        isFailure={!gridData?.length}
                        settings={{ total: gridData?.length }}
                        isCustomBox
                        noDataText={'No templates found.'}
                        column={[
                            {
                                field: 'templateName',
                                title: 'Template name',
                                // cell: ({ dataItem ,field}) => (
                                //    <TruncatedCell value={dataItem?.[field] || ''} />
                                // ),
                              },  {
                                field: 'templateType',
                                title: 'Template type',
                                cell: ({ dataItem, field }) => {
                                    const typeValue = (dataItem?.[field] || '').toString().trim().toUpperCase();
                                    const templateTypeLabel =
                                        typeValue === 'T'
                                            ? 'Transactional'
                                            : typeValue === 'P'
                                            ? 'Promotional'
                                            : typeValue === 'O'
                                            ? 'OTP'
                                            : dataItem?.[field] || '';
                                return <td>{templateTypeLabel}</td>;}
                              },  {
                                field: 'entryType',
                                title: 'Entry type',
                                cell: ({ dataItem, field }) => {
                                return <td className='text-capitalize'>{dataItem?.[field] || 'Manual'}</td>;
                            },
                            },
                            //   {
                            //     field: 'languages',
                            //     title: 'Language',
                            //     cell: ({ dataItem ,field}) => (
                            //        <TruncatedCell value={dataItem?.[field] || ''} />
                            //     ),
                            // },
                            {
                                field: 'senderId',
                                title: SENDER_ID,
                                //  cell: ({ dataItem ,field}) => (
                                //    <TruncatedCell value={dataItem?.[field] || ''} />
                                // ),
                            },
                            {
                                field: 'status',
                                title: STATUS,
                                width: 130,
                                cell: ({ dataItem }) => {
                                    const isRowStatusUpdating = updatingTemplateId === dataItem?.templateId;
                                    const isStatusBlocked =
                                        !updateAccess || isAnyStatusUpdating || isDeleteTemplateLoading;

                                    return (
                                    <td className="text-left">
                                        {dataItem?.status !== 3 ? (
                                            isRowStatusUpdating ? (
                                                <span className="segment_loader" aria-hidden="true" />
                                            ) : (
                                                <Switch
                                                    checked={dataItem?.status === 1}
                                                    onChange={(e) => handleStatusChange(e, dataItem)}
                                                    disabled={isStatusBlocked}
                                                    className={isStatusBlocked ? 'pe-none click-off' : ''}
                                                />
                                            )
                                        ) : (
                                            <span className="text-muted">Deleted</span>
                                        )}
                                    </td>
                                    );
                                },
                            },
                            {
                                field: 'action',
                                title: ACTIONS,
                                width: 100,
                                sortable: false,
                                cell: (props) => {
                                    const isRowEditLoading = editingTemplateId === props.dataItem?.templateId;
                                    const isAnyEditLoading = Boolean(editingTemplateId);
                                    const isRowActionBlocked =
                                        isAnyEditLoading || isDeleteTemplateLoading || isAnyStatusUpdating;

                                    return (
                                        <td>
                                            <ul className="rs-list-inline rli-space-15 grid-view-icons">
                                                <li>
                                                    <RSTooltip
                                                        text={isRowEditLoading ? 'Loading...' : EDIT}
                                                        position="top"
                                                    >
                                                        <span
                                                            className={`d-inline-flex align-items-center justify-content-center ${
                                                                !updateAccess || isRowActionBlocked
                                                                    ? 'pe-none click-off'
                                                                    : 'cp'
                                                            }`}
                                                            role="button"
                                                            tabIndex={!updateAccess || isRowActionBlocked ? -1 : 0}
                                                            onClick={() => {
                                                                if (updateAccess && !isRowActionBlocked) {
                                                                    handleEdit(props.dataItem);
                                                                }
                                                            }}
                                                        >
                                                            {isRowEditLoading ? (
                                                                <span
                                                                    className="segment_loader"
                                                                    aria-hidden="true"
                                                                />
                                                            ) : (
                                                                <i
                                                                    id="rs_data_pencil_edit"
                                                                    className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                                                />
                                                            )}
                                                        </span>
                                                    </RSTooltip>
                                                </li>
                                                {props.dataItem?.status !== 3 && (
                                                    <li
                                                        onClick={() => {
                                                            if (updateAccess && !isRowActionBlocked) {
                                                                setDeleteModal({
                                                                    show: true,
                                                                    templateId: props.dataItem?.templateId,
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        <RSTooltip text={DELETE} position="top">
                                                            <div
                                                                className={`${
                                                                    !updateAccess || isRowActionBlocked
                                                                        ? 'pe-none click-off'
                                                                        : ''
                                                                }`}
                                                            >
                                                                <i
                                                                    id="rs_data_template_delete"
                                                                    className={`${delete_medium} icon-md color-primary-red`}
                                                                ></i>
                                                            </div>
                                                        </RSTooltip>
                                                    </li>
                                                )}
                                            </ul>
                                        </td>
                                    );
                                },
                            },
                        ]}
                    />
                    )}

                    <RSModal
                        show={deleteModal.show}
                        size="md"
                        header={DELETE_USER_ROLE}
                        handleClose={() => {
                            if (isDeleteTemplateLoading) return;
                            setDeleteModal({ show: false, templateId: null });
                        }}
                        body={
                            <p className='text-center'>{ARE_YOU_SURE_DELETE}</p>
                        }
                        footer={
                            <>
                                <RSSecondaryButton
                                    blockInteraction={isDeleteTemplateLoading}
                                    onClick={() => {
                                        if (isDeleteTemplateLoading) return;
                                        setDeleteModal({ show: false, templateId: null });
                                    }}
                                >
                                    {CANCEL}
                                </RSSecondaryButton>
                                <RSPrimaryButton
                                    isLoading={isDeleteTemplateLoading}
                                    blockBodyPointerEvents={isDeleteTemplateLoading}
                                    onClick={() => {
                                        if (isDeleteTemplateLoading) return;
                                        handleDeleteTemplate();
                                    }}
                                >
                                    {YES}
                                </RSPrimaryButton>
                            </>
                        }
                    />
                </>
            ) : (
                <>
                    <SMSTemplateCreate
                        config={gridCreate.smsTemplateAction.edit.editState}
                        handleCancel={(status) => {
                            if (status) {
                                const payload = {
                                    departmentId,
                                    clientId,
                                    userId,
                                };
                                fetchTemplateList(payload);
                                setGridCreate((prev) => ({
                                    ...prev,
                                    showGrid: status,
                                    smsTemplateAction: {
                                        edit: {
                                            editState: [],
                                            isEdit: false,
                                        },
                                        create: false,
                                    },
                                }));
                            }
                        }}
                        type={gridCreate.smsTemplateAction.edit.isEdit}
                    />
                </>
            )}
            {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
        </SMSTemplateProvider.Provider>
    );
};

export default SMSTemplate;
