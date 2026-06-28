import { analyticsAvaliableIds } from 'Utils/modules/communicationChannels';
import { getIndexBasedOnCampaign, getStatus } from 'Utils/modules/communicationStatus';
import { renderCommunicationListingTags } from 'Utils/modules/display';
import { encodeUrl, encryptWithAES } from 'Utils/modules/crypto';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';

import { numberWithCommas } from 'Utils/modules/formatters';
import { ACTIONS, ANALYTICS, ARE_YOU_SURE_ARCHIVE, COMMUNICATION_EXECUTION, DUPLICATE, EDIT, OK, TOTAL_AUDIENCE, VIEW } from 'Constants/GlobalConstant/Placeholders';
import { analytics_medium, circle_arrow_down_medium, duplicate_medium, listing_preview_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useMemo, useState } from 'react';
import _get from 'lodash/get';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import RSTooltip from 'Components/RSTooltip';
import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';

import { buildPayload, initialDataState } from '../constant';
import { getSessionId } from 'Reducers/globalState/selector';
import { updateListDuplicate } from 'Reducers/communication/listing/reducer';

import {
    deleteArchiveCommunication,
    duplicateCommunication,
    getCommunicationList,
    unarchiveCommunication,
} from 'Reducers/communication/listing/request';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { updateCommunicationData } from 'Reducers/communication/createCommunication/plan/reducer';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import DuplicateModal from './DuplicateModal';

import TruncatedCell from 'Components/RSKendoGrid/TruncateCell.jsx';
import { LAYOUT_CLASSES } from 'Pages/KendoDocs/CommonComponents/ResGrid/config';

const CommunicationListRowCell = (props) => {
    let { dataItem, requestPayload = {}} = props;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const statusId = _get(dataItem, 'statusId', 0);
    const { className, status } = getStatus(dataItem?.statusId);
    const campaignType = String(_get(dataItem, 'campaignTypeValue', '') ?? '').slice(0, 1);
    const [show, setShow] = useState(false);
    const [duplicateModal, setDuplicateModal] = useState({
        show: false,
        selectedCommunication: {},
    });
    const [isCommRefEnable, setIsCommRefEnable] = useState(false);
    const duplicateApi = useApiLoader({ autoFetch: false });
    const archiveApi = useApiLoader({ autoFetch: false });

    const { userId, clientId, departmentId, departmentName } = useSelector((state) => getSessionId(state));
    const hasCampaignGroupingId = !!dataItem?.campaignGroupingId?.length;
    const sanitizedEncodeCampaignId = hasCampaignGroupingId
        ? dataItem?.encodeCampaignId?.replace(/^\//, '')
        : dataItem?.encodeCampaignId;
    const { data: listingReducerData = {} } = useSelector((state) => state.communicationListingReducer ?? {});
    const totalRows = listingReducerData?.totalRows ?? 5;

    useEffect(() => {
        const hierarchyCells = document.querySelectorAll('.k-hierarchy-cell a.k-icon.k-i-plus');
        hierarchyCells.forEach((anchor) => {
            anchor.classList.remove('k-i-plus');
        });
    }, []);

    const options = useMemo(() => {
        const option = ['Share'];
        if (statusId === 6 || statusId === 9 || statusId === 26) {
            option.push('Archive');
        } else if (statusId === 70) {
            option.push('Unarchive');
        }
        return option;
    }, [statusId]);

    const canArchiveAsCreator =
    dataItem?.createdById != null &&
    userId != null &&
    Number(dataItem?.createdById) === Number(userId);
    const actionDropdownDisableItems = ['Share'];
    if (!canArchiveAsCreator) {
        if (options.includes('Archive')) {
            actionDropdownDisableItems.push('Archive');
        }
        if (options.includes('Unarchive')) {
            actionDropdownDisableItems.push('Unarchive');
        }
    }

    const handleRequestPayloadAdded = () => {
        return {
            ...requestPayload,
            userId: requestPayload?.userId ?? userId,
        }
    }

    // 5 - Inprogress   9 - completed    20 - MuliStatus    26 - stop    27 - pause
    const isEditable =
        statusId !== 9 &&
        statusId !== 5 &&
        statusId !== 20 &&
        statusId !== 27 &&
        statusId !== 26 &&
        statusId !== 51 &&
        statusId !== 52;
    const handleEdit = () => {
        const state = {
            mode: 'edit',
            campaignId: dataItem?.campaignId,
            currentTab: getIndexBasedOnCampaign(campaignType),
            isEditable,
            statusId,
            campaignType: campaignType,
        };
        dispatch(updateCommunicationData({ field: 'editState', data: state }));
        const encryptState = encodeURIComponent(encryptWithAES(JSON.stringify(state).replace(/\+/g, '%2B')));
        navigate(`/communication/communication-creation?q=${encryptState}`);
    };
    const handleDelete = async () => {
        if (archiveApi.isFetching) return;
        const payload = {
            userId,
            clientId,
            departmentId,
            campaignId: dataItem?.campaignId,
        };
        const response = await archiveApi.refetch({
            fetcher: () =>
                dispatch(
                    deleteArchiveCommunication({
                        payload,
                        loading: false,
                    }),
                ),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.FIELD },
        });
        if (response?.status) {
            dispatch(
                getCommunicationList({
                    payload: buildPayload({ ...payload, totalRows: props?.requestPayload?.pageSize != null ? props?.requestPayload?.pageSize : totalRows, ...handleRequestPayloadAdded() }, true),
                }),
            );
            setShow(false);
        }
    };

    const handleDuplicate = async (newCampaignName) => {
        if (duplicateApi.isFetching) return;
        const payload = {
            userId,
            clientId,
            departmentId,
            campaignId: dataItem?.campaignId,
            campaignName: newCampaignName || '',
        };
        const response = await duplicateApi.refetch({
            fetcher: () => handleAction('Duplicate', payload),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.FIELD },
        });
        if (response?.status) {
            dispatch(updateListDuplicate(true));
            dispatch(
                getCommunicationList({
                    payload: buildPayload({ ...payload, totalRows: props?.requestPayload?.pageSize != null ? props?.requestPayload?.pageSize : totalRows,...handleRequestPayloadAdded() }, true),
                }),
            );
            setDuplicateModal({ show: false, selectedCommunication: {} });
        }
    };

    const handleAction = async (option, payload) => {
        const actions = {
            Duplicate: async () => {
                if (!dataItem?.isCommuReference) {
                    const response = await dispatch(duplicateCommunication({ payload, loading: false }));
                    props?.setCampaignData({ dataState: initialDataState });
                    return response;
                } else {
                    setIsCommRefEnable(true);
                }
            },
            Archive: async () => setShow(true),
            Unarchive: async () => {
                const response = await dispatch(unarchiveCommunication({ payload }));
                if (response?.status) {
                    dispatch(updateListDuplicate(true));
                    dispatch(
                        getCommunicationList({
                            payload: buildPayload({ ...payload, ...handleRequestPayloadAdded() }, true),
                        }),
                    );
                }
                return response;
            },
        };

        return actions[option] ? await actions[option]() : null;
    };

    const handleExpandClick = (e) => {
        // e.stopPropagation();
        const tr = e.currentTarget.closest('tr');
        if (!tr) return;
        const expandTarget = tr.querySelector(
            '.k-hierarchy-cell .k-icon-button, .k-hierarchy-cell a, .k-hierarchy-cell button, .k-hierarchy-cell .k-icon',
        );
        if (expandTarget && typeof expandTarget.click === 'function') {
            expandTarget.click();
        }
    };

    const handleIconStatus = () => {
        if (isEditable) {
            return {
                icon: `${pencil_edit_medium}`,
                tooltipText: EDIT,
            };
        } else {
            return {
                icon: `${listing_preview_medium}`,
                tooltipText: VIEW,
            };
        }
    };

    return (
        <>
            <td>
                <div
                    className={`rs-communication-list ${className} comm-listing ${
                        dataItem?.expanded ? 'sp-grid-expanded' : ''
                    }`}
                >
                    <div className="communication-content">
                        <span className="badge">
                            {dataItem?.priority > 0
                                ? `${hasCampaignGroupingId ? `${dataItem?.campaignGroupingId} / ` : ''}P${
                                      dataItem?.priority
                                  } || ${sanitizedEncodeCampaignId ?? ''}`
                                : sanitizedEncodeCampaignId ?? ''}
                        </span>
                        <small>
                            {dataItem?.modifiedDate !== '' ? 'Modified by' : 'Created by'}:{' '}
                            {dataItem?.modifiedDate !== '' && !!dataItem?.modifiedBy
                                ? dataItem?.modifiedBy || ''
                                : dataItem?.createdBy || ''}
                         
                           <span></span>
                            {/* {getDateWithDay(
                                dataItem?.modifiedDate !== '' ? dataItem?.modifiedDate : dataItem?.createdDate,
                            )} */}
                            {
                                getUserCurrentFormat(
                                    dataItem?.modifiedDate !== '' ? dataItem?.modifiedDate : dataItem?.createdDate,
                                )?.dateFormat
                            }
                        </small>
                        <div className={LAYOUT_CLASSES.listCardTitle}>
                            <TruncatedCell value={dataItem?.campaignName} noTable />
                        </div>
                        {renderCommunicationListingTags({
                            tags: dataItem?.tags,
                            campaignId: dataItem?.campaignId,
                            campaignName: dataItem?.campaignName,
                        })}
                    </div>

                    <div className="communication-content">
                        <small>{dataItem?.campaignTypeValue}</small>
                        <div className="d-flex">
                            <TruncatedCell value={dataItem?.communicationType} noTable />
                        </div>
                    </div>

                    <div className="communication-content text-end">
                        <small>{TOTAL_AUDIENCE}</small>
                        <p>
                            {dataItem?.totalRecipientsCount > 0
                                ? numberWithCommas(dataItem?.totalRecipientsCount)
                                : 'N/A'}
                        </p>
                    </div>

                    <div className="communication-content">
                        <div className={`${className} communication-status`}>
                            <small>{status}</small>
                        </div>

                        <ul className="rs-communication-icon">
                            <li>
                                <RSTooltip text={handleIconStatus()?.tooltipText} position="top">
                                    <i
                                        id="rs_data_pencil_edit"
                                        className={`${handleIconStatus()?.icon} icon-md color-primary-blue`}
                                        onClick={handleEdit}
                                    ></i>
                                </RSTooltip>
                            </li>
                            <li>
                                <RSTooltip text={ANALYTICS} position="top">
                                    <div
                                        className={
                                            !analyticsAvaliableIds?.includes(dataItem?.statusId) || (dataItem?.channelIds?.length === 1 && dataItem?.channelIds?.[0] === 33)
                                                ? 'pe-none click-off'
                                                : ''
                                        }
                                    >
                                        <i
                                            id="rs_CommunicationListRowCell_Analytics"
                                            className={`${analytics_medium} icon-md color-primary-blue`}
                                            onClick={() => {
                                                const state = {
                                                    from: dataItem?.campaignId,
                                                    campaignName: dataItem?.campaignName,
                                                    isGolden: dataItem?.isGoldCampaign,
                                                    startDate: dataItem?.startDate,
                                                    endDate: dataItem?.endDate,
                                                    subSegmentLevel: dataItem?.subSegmentLevel,
                                                    subSegmentFriendlyName: dataItem?.subSegmentLevelFriendlyName,
                                                    fromPath: '/communication',
                                                };
                                                let url = '/analytics/analytics-report';
                                                const encryptState = encodeUrl(state);
                                                navigate(`${url}?q=${encryptState}`, {
                                                    state,
                                                });
                                            }}
                                        ></i>
                                    </div>
                                </RSTooltip>
                            </li>
                            <li>
                                <RSTooltip
                                    // text={'Archive'}DDDFSC
                                    text={DUPLICATE}
                                    position="top"
                                    // className={`${statusId === 9 || statusId === 6 ? '' : 'click-off'}`}
                                >
                                    <div
                                        className={`${statusId !== 52 ? '' : 'pe-none click-off'} ${
                                            campaignType === 'M' && statusId !== 52 ? 'pe-none click-off' : ''
                                        }`}
                                    >
                                        <i
                                            id="rs_CommunicationListRowCell_Archieve"
                                            onClick={() => setDuplicateModal({ show: true, selectedCommunication: dataItem })}
                                            className={`${duplicate_medium} icon-md color-primary-blue`}
                                        ></i>
                                    </div>
                                </RSTooltip>
                            </li>
                            <li>
                                <RSTooltip text={ACTIONS} position="top">
                                    <BootstrapDropdown
                                        data={options}
                                        flatIcon
                                        defaultItem={
                                            <i
                                                id="rs_CommunicationListRowCell_arrowdown"
                                                className={`${circle_arrow_down_medium} icon-md color-primary-blue`}
                                            />
                                        }
                                        showUpdate={false}
                                        disbleItems={actionDropdownDisableItems}
                                        className="no_caret"
                                        alignRight
                                        onSelect={async (option) => {
                                            const payload = {
                                                userId,
                                                clientId,
                                                departmentId,
                                                campaignId: dataItem?.campaignId,
                                            };
                                            const response = await handleAction(option, payload);
                                            if (response?.status) {
                                                dispatch(updateListDuplicate(true));
                                                dispatch(
                                                    getCommunicationList({
                                                        // payload: buildPayload({ ...payload, totalRows: totalRows }),
                                                        payload: buildPayload({ ...payload,...handleRequestPayloadAdded() }, true),
                                                    }),
                                                );
                                            } else {
                                                return;
                                            }
                                        }}
                                    />
                                </RSTooltip>
                            </li>
                        </ul>
                    </div>
                    <div
                        className={`${className} expand-plus ${dataItem?.expanded ? 'd-none pe-none' : ''}`}
                        onClick={handleExpandClick}
                        role="button"
                        aria-label="Expand row"
                        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                    >
                        <ul className="camp-icon-pannel">
                            <li className={`${dataItem?.expanded ? 'pe-none' : ''}`}>
                                <i className="k-icon k-i-plus" style={{ pointerEvents: 'auto' }}></i>
                            </li>
                        </ul>
                    </div>
                </div>
                <RSConfirmationModal
                    show={show}
                    text={ARE_YOU_SURE_ARCHIVE}
                    primaryButtonText={OK}
                    handleClose={() => {
                        if (archiveApi.isFetching) return;
                        setShow(false);
                    }}
                    handleConfirm={handleDelete}
                    isCloseButton={false}
                    isLoading={archiveApi.isLoading}
                    blockBodyPointerEvents={archiveApi.isFetching}
                />
                {isCommRefEnable && (
                    <RSConfirmationModal
                        show={isCommRefEnable}
                        text={COMMUNICATION_EXECUTION}
                        handleClose={() => {
                            setIsCommRefEnable(false);
                        }}
                        handleConfirm={() => {
                            setIsCommRefEnable(false);
                        }}
                        secondaryButton={false}
                        isCloseButton={false}
                    />
                )}
                <DuplicateModal
                    show={duplicateModal.show}
                    onHide={() => {
                        if (duplicateApi.isFetching) return;
                        setDuplicateModal({ show: false, selectedCommunication: {} });
                    }}
                    selectedCommunication={duplicateModal.selectedCommunication}
                    onDuplicate={handleDuplicate}
                    isDuplicating={duplicateApi.isLoading}
                />
            </td>
        </>
    );
};

export default CommunicationListRowCell;
