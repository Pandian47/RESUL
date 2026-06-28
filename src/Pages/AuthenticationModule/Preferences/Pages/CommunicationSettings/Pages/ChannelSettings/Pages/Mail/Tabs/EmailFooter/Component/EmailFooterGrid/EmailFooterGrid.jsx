import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getmasterData } from 'Utils/modules/masterData';
import { ACTIONS, ARE_YOU_SURE_DELETE_FOOTER, CANCEL, DELETE, DELETE_USER_ROLE, FOOTER_LIST } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_medium, delete_medium, eye_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';
import RSConfirmationModal from 'Components/ConfirmationModal';

import usePermission from 'Hooks/usePersmission';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    getEmailFooterData,
    getEmailFooterById,
    deleteEmailFooterById,
} from 'Reducers/preferences/CommunicationSettings/request';
import { getCompanyClientDetails } from 'Reducers/preferences/Companies/request';
import { setSavedVersions } from 'Reducers/preferences/EmailBuilder/reducer';
import { EmailFooterProvider } from '../..';
import { useNavigate } from 'react-router-dom';

import PreviewModal from '../PreviewModal/PreviewModal';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';



const buildPreviewHtml = (footerResponse, companyResponse) => {
    const { countryMasterList } = getmasterData() || {};
    let emailHtml = footerResponse?.data?.emailFooterHTML;
    const { logoPath, childClientName, parentClientName, countryId, address, zipCode, city } =
        companyResponse.data;
    const country = countryMasterList?.find((c) => c.countryID === countryId)?.country || '';
    const clientAddress = [address, city, zipCode, country].filter(Boolean).join(', ');

    return emailHtml
        .replace(/\[COMPANY_LOGO\]/g, `data:image/png;base64,${logoPath}`)
        .replace(/\[COMPANY_NAME\]/g, childClientName ?? parentClientName ?? '')
        .replace(/\[CLIENT_FOOTER_ADDRESS\]/g, clientAddress);
};

const EmailFooterGrid = ({ handleCreate }) => {
    const navigate = useNavigate();
    const context = useContext(EmailFooterProvider);
    const {
        permissions: { updateAccess },
    } = usePermission();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const [gridData, setGridData] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [previewHtml, setPreviewHtml] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        show: false,
        itemToDelete: null,
    });
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const dispatch = useDispatch();
    const [isCreated, setIsCreated] = useState(false);
    const [gridLoadFailed, setGridLoadFailed] = useState(false);
    const [editingFooterId, setEditingFooterId] = useState(null);

    const footerListApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const previewApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const editFooterApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'edit' });
    const deleteFooterApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isDeleteFooterLoading = deleteFooterApi.isFetching;

    const sessionPayload = useMemo(
        () => ({ userId, clientId, departmentId }),
        [userId, clientId, departmentId],
    );
    const sessionReady = Boolean(clientId && userId && departmentId);

    const reloadFooterList = useCallback(() => {
        if (!sessionReady) return undefined;
        setGridLoadFailed(false);
        return footerListApi.refetch({
            fetcher: async () => {
                const response = await dispatch(getEmailFooterData(sessionPayload));
                if (response?.isCreated !== undefined) {
                    setIsCreated(response.isCreated);
                }
                if (response?.status) {
                    setGridData(response.data ?? []);
                } else {
                    setGridData([]);
                    setGridLoadFailed(true);
                }
                return response;
            },
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
    }, [sessionReady, sessionPayload, dispatch, footerListApi.refetch]);

    useEffect(() => {
        reloadFooterList();
    }, [reloadFooterList]);

    const handleEdit = async (dataItem) => {
        if (!updateAccess || dataItem?.isDefault) return;

        const footerId = dataItem?.emailFooterId;
        setEditingFooterId(footerId);

        try {
            const response = await editFooterApi.refetch({
                fetcher: () =>
                    dispatch(
                        getEmailFooterById({
                            clientId,
                            userId,
                            emailfooterId: footerId,
                            departmentId,
                        }),
                    ),
                loaderConfig: fieldLoaderConfig,
                mode: 'edit',
            });

            if (response?.status) {
                if (response?.data?.historyList?.length > 0) {
                    const historyList = response.data.historyList.map((item) => ({
                        ...item,
                        htmlContent: item.emailFooterHTML,
                        CreatedDate: item.createdDate,
                        jsonContent: item.emailFooterJSON,
                    }));
                    dispatch(setSavedVersions(historyList));
                }

                const state = {
                    data: response?.data?.emailFooterJSON,
                    templateId: response?.data?.emailfooterId,
                    mode: 'edit',
                    templateName: response?.data?.footerName,
                };
                const encryptState = encodeUrl(state);
                navigate(`/preferences/communication-settings/footer-builder?q=${encryptState}&mode=${state.mode}`, {
                    state,
                });
            }
        } finally {
            setEditingFooterId(null);
        }
    };

    const handleView = async (dataItem) => {
        const { isAgency, clientId: agencyClientId } = getUserDetails();
        const footerPayload = {
            clientId,
            userId,
            emailfooterId: dataItem?.emailFooterId,
            departmentId,
        };
        const companyPayload = {
            clientId: isAgency ? agencyClientId : clientId,
            userId,
            departmentId: 0,
        };

        setPreviewHtml('');
        setShowPreview(true);

        const result = await previewApi.refetch({
            fetcher: async () => {
                const [footerResponse, companyResponse] = await Promise.all([
                    dispatch(getEmailFooterById(footerPayload)),
                    dispatch(
                        getCompanyClientDetails({
                            payload: companyPayload,
                            isAgency,
                            loading: false,
                        }),
                    ),
                ]);

                if (footerResponse?.status && companyResponse?.status) {
                    return {
                        status: true,
                        html: buildPreviewHtml(footerResponse, companyResponse),
                    };
                }
                return { status: false, html: '' };
            },
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });

        if (result?.status && result?.html) {
            setPreviewHtml(result.html);
        } else {
            setShowPreview(false);
        }
    };

    const handleDelete = async () => {
        if (
            !updateAccess ||
            !deleteConfirmation.itemToDelete ||
            deleteConfirmation.itemToDelete.isDefault ||
            isDeleteFooterLoading
        ) {
            return;
        }

        const payload = {
            clientId,
            userId,
            emailfooterId: deleteConfirmation.itemToDelete.emailFooterId,
        };
        const response = await deleteFooterApi.refetch({
            fetcher: () => dispatch(deleteEmailFooterById(payload)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
        if (response?.status) {
            reloadFooterList();
            setDeleteConfirmation({ show: false, itemToDelete: null });
        }
    };

    const gridIsLoading = footerListApi.isLoading || footerListApi.isFetching;

    return (
        <>
            {isCreated && gridData?.length === 0 ? (
                <RSSkeletonTable
                    text
                    message={
                        <>
                            Click
                            <i
                                id="rs_data_circle_plus_fill_edge"
                                className={`icon-md color-primary-blue icon-hover-shadow-primary ${
                                    circle_plus_fill_edge_medium
                                } ${!addAccess ? 'click-off' : ''} mx5`}
                                onClick={() => {
                                    if (addAccess) handleCreate();
                                }}
                            />
                            to configure your email footer.
                        </>
                    }
                    isCustombox
                    isAlertIcon={false}
                />
            ) : (
                <KendoGrid
                    data={gridData}
                    isLoading={gridIsLoading}
                    isFailure={gridLoadFailed}
                    noBoxShadow
                    settings={{
                        total: gridData?.length,
                    }}
                    isCustomBox
                    column={[
                        {
                            field: 'footername',
                            title: FOOTER_LIST,
                            filter: 'text',
                        },
                        {
                            field: 'action',
                            title: ACTIONS,
                            width: '165px',
                            cell: ({ dataItem }) => {
                                const isEditable = !dataItem?.isDefault;
                                const isRowEditLoading = editingFooterId === dataItem?.emailFooterId;
                                const isAnyEditLoading = Boolean(editingFooterId);
                                const isRowActionBlocked = isAnyEditLoading || isDeleteFooterLoading;

                                return (
                                    <td>
                                        <ul className="rs-list-inline rli-space-15 grid-view-icons">
                                            <li
                                                onClick={() => !isRowActionBlocked && handleView(dataItem)}
                                                className={isRowActionBlocked ? 'pe-none opacity-50' : ''}
                                            >
                                                <RSTooltip text="View" position="top">
                                                    <i
                                                        id="rs_data_icon_view"
                                                        className={`${eye_medium} icon-md color-primary-blue`}
                                                    />
                                                </RSTooltip>
                                            </li>

                                            {updateAccess && isEditable && (
                                                <li>
                                                    <RSTooltip
                                                        text={isRowEditLoading ? 'Loading...' : 'Edit'}
                                                        position="top"
                                                    >
                                                        <span
                                                            className={`d-inline-flex align-items-center justify-content-center ${
                                                                isRowActionBlocked ? 'pe-none click-off' : 'cp'
                                                            }`}
                                                            role="button"
                                                            tabIndex={isRowActionBlocked ? -1 : 0}
                                                            onClick={() => {
                                                                if (!isRowActionBlocked) {
                                                                    handleEdit(dataItem);
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
                                                                    id="rs_data_icon_edit"
                                                                    className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                                                />
                                                            )}
                                                        </span>
                                                    </RSTooltip>
                                                </li>
                                            )}

                                            {updateAccess && isEditable && (
                                                <li
                                                    onClick={() =>
                                                        !isRowActionBlocked &&
                                                        setDeleteConfirmation({
                                                            show: true,
                                                            itemToDelete: dataItem,
                                                        })
                                                    }
                                                    className={isRowActionBlocked ? 'pe-none opacity-50' : ''}
                                                >
                                                    <RSTooltip text={DELETE} position="top">
                                                        <i
                                                            className={`${delete_medium} icon-md color-primary-red`}
                                                        />
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
            <PreviewModal
                show={showPreview}
                handleClose={() => setShowPreview(false)}
                data={previewHtml}
                isLoading={previewApi.isFetching}
            />

            <RSConfirmationModal
                show={deleteConfirmation.show}
                text={
                    deleteConfirmation.itemToDelete
                        ? ARE_YOU_SURE_DELETE_FOOTER.replace(
                              '{name}',
                              deleteConfirmation.itemToDelete.footername,
                          )
                        : ''
                }
                handleClose={() => {
                    if (isDeleteFooterLoading) return;
                    setDeleteConfirmation({ show: false, itemToDelete: null });
                }}
                handleConfirm={() => {
                    if (isDeleteFooterLoading) return;
                    handleDelete();
                }}
                primaryButtonText={DELETE}
                secondaryButtonText={CANCEL}
                isLoading={isDeleteFooterLoading}
                blockBodyPointerEvents
                isBorder
                header={DELETE_USER_ROLE}
            />
        </>
    );
};

export default EmailFooterGrid;
