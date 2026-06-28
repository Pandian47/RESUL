
import { EMAIL_NAME, SMTP_MAIL_SENT, VIEW } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_medium, email_medium, eye_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch } from '@progress/kendo-react-inputs';

import RSTooltip from 'Components/RSTooltip';
import KendoGrid from 'Components/RSKendoGrid';
import usePermission from 'Hooks/usePersmission';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';

import { ActionsType } from '../..';
import { getClientSmtpSettings, sendEmailSMTP } from 'Reducers/preferences/CommunicationSettings/request';
import { getSessionId } from 'Reducers/globalState/selector';
import RSConfirmationModal from 'Components/ConfirmationModal';

import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';

const SMTPGrid = () => {
    const dispatch = useDispatch();

    const [gridData, setGridData] = useState({
        isFailure: false,
        isLoading: true,
        grid: [],
    });
    const [isCreated, setIsCreated] = useState(false);
    const { setSmtpToggle, setActions } = useContext(ActionsType);
    const [warning, setWarning] = useState(false);
    const [sendingSmtpId, setSendingSmtpId] = useState(null);
    const emailSendInFlightRef = useRef(false);
    const emailSendApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const {
        permissions: { updateAccess, viewAccess },
    } = usePermission();
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    // console.log('updateAccess:', updateAccess);

    useEffect(() => {
        handleGridData();
    }, [departmentId, clientId, userId]);

    const handleGridData = async () => {
        setGridData((pre) => ({
            ...pre,
            isLoading: true,
        }));
        const payload = { clientId, userId, departmentId };
        const { status, data , isCreated} = await dispatch(getClientSmtpSettings(payload));
       if(isCreated != undefined){
        setIsCreated(isCreated)
        }

        if (status) {
            let updatedData = data?.map((item) => ({
                ...item,
                smtpType: Number(item.smtpType) === 1 ? "Dedicated" : "Shared"
            }));
            setGridData({
                grid: updatedData,
                isLoading: false,
                isFailure: false,
            });
        } else {
            setGridData({
                isLoading: false,
                isFailure: true,
                grid: [],
            });
        }
    };
    const handleSMTPMail = async (id) => {
        if (!id || emailSendInFlightRef.current || emailSendApi.isFetching) {
            return;
        }
        emailSendInFlightRef.current = true;
        setSendingSmtpId(id);
        const payload = { clientId, userId, departmentId, smtpClientId: id };
        try {
            const response = await emailSendApi.refetch({
                fetcher: () => dispatch(sendEmailSMTP(payload)),
                loaderConfig: fieldLoaderConfig,
                mode: 'create',
            });
            if (response?.status) {
                setWarning(true);
            } else {
                setWarning(false);
            }
        } finally {
            emailSendInFlightRef.current = false;
            setSendingSmtpId(null);
        }
    };

    const isSmtpAddIconClickOff = !addAccess || !(gridData?.length > 0);

    return (
        <>

            {
                isCreated && gridData?.grid?.length == 0 ?

                  <RSSkeletonTable
                        text
                        isHTML
                        message={
                            <>
                                Click{' '}
                                <span
                                    className={`rs-nodata-icon-wrap position-relative bottom1 mx5${isSmtpAddIconClickOff ? ' cursor-not-allowed' : ''}`}
                                >
                                    <i
                                        id="rs_data_circle_plus_fill_edge"
                                        className={`icon-md color-primary-blue icon-hover-shadow-primary ${circle_plus_fill_edge_medium}${isSmtpAddIconClickOff ? ' click-off' : ''}`}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            if (addAccess) {
                                                setActions({ type: 'SMTP Create', state: {} });
                                                setSmtpToggle('add');
                                            }
                                        }}
                                    />
                                </span>
                                {' '}
                                to configure your SMTP settings.
                            </>
                        }
                        isCustombox
                        isAlertIcon={false}
                    />
                    : (
                    <KendoGrid
                        data={gridData.grid}
                        isFailure={gridData.isFailure}
                        loading={gridData.isLoading}
                        isLoading={gridData.isLoading}
                        settings={{
                            total: gridData?.grid?.length,
                        }}
                        noBoxShadow
                        isCustomBox
                        column={[
                            {
                                field: 'domainName',
                                title: 'Domain name',
                                filter: 'text',
                            },
                            {
                                field: 'smtpType',
                                title: 'SMTP type',
                                filter: 'text',
                                cell: ({ dataItem }) => {
                                    return (
                                        <td className="text-left">
                                            <div>{dataItem?.smtpType}</div>
                                        </td>
                                    );
                                },
                            },
                            {
                                field: 'smtphouseName',
                                title: 'SMTP housing',
                                width: '200',
                                filter: 'text',
                            },
                            {
                                field: 'isApprove',
                                title: 'Status',
                                width: 130,
                                cell: (props) => {
                                    return (
                                        <td className="text-left">
                                            <Switch checked={props.dataItem?.isApprove} className="click-off" />
                                        </td>
                                    );
                                },
                            },
                            {
                                field: 'action',
                                title: 'Actions',
                                width: 165,
                                sortable: false,
                                cell: ({ dataItem }) => {
                                    const isRowEmailSending = sendingSmtpId === dataItem?.clientSmtpId;
                                    const isAnyEmailSending = Boolean(sendingSmtpId);

                                    return (
                                        <td>
                                            <ul className="rs-list-inline rli-space-15 grid-view-icons">
                                                <li
                                                    
                                                >
                                                    <RSTooltip text={VIEW} position="top">
                                                        <div className={`${!viewAccess ? 'pe-none click-off' : ''}  `}>
                                                        <i
                                                            id="rs_data_pencil_edit"
                                                            className={`${eye_medium
                                                                } icon-md color-primary-blue `}
                                                                onClick={() => {
                                                                    if (updateAccess) {
                                                                        setSmtpToggle('edit');
                                                                        setActions({
                                                                            type: 'SMTP Create',
                                                                            state: { mode: 'edit', smtpId: dataItem?.clientSmtpId },
                                                                        });
                                                                        // setActions('SMTP Create');
                                                                    }
                                                                }}
                                                        ></i></div>
                                                    </RSTooltip>
                                                </li>
                                                <li>
                                                    <RSTooltip
                                                        text={
                                                            isRowEmailSending
                                                                ? 'Sending...'
                                                                : EMAIL_NAME
                                                        }
                                                        position="top"
                                                    >
                                                        <span
                                                            className={`d-inline-flex align-items-center justify-content-center ${
                                                                isAnyEmailSending ? 'pe-none click-off' : 'cp'
                                                            }`}
                                                            role="button"
                                                            tabIndex={isAnyEmailSending ? -1 : 0}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!isAnyEmailSending) {
                                                                    handleSMTPMail(dataItem?.clientSmtpId);
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && !isAnyEmailSending) {
                                                                    e.stopPropagation();
                                                                    handleSMTPMail(dataItem?.clientSmtpId);
                                                                }
                                                            }}
                                                        >
                                                            {isRowEmailSending ? (
                                                                <span
                                                                    className="segment_loader"
                                                                    aria-hidden="true"
                                                                />
                                                            ) : (
                                                                <i
                                                                    className={`${email_medium} icon-md color-primary-blue`}
                                                                />
                                                            )}
                                                        </span>
                                                    </RSTooltip>
                                                </li>
                                            </ul>
                                        </td>
                                    );
                                },
                            },
                        ]}
                    />
                )
            }



            <RSConfirmationModal
                show={warning}
                text={SMTP_MAIL_SENT}
                secondaryButton={false}
                primaryButton
                handleClose={() => {
                    setWarning(false);
                }}
                handleConfirm={() => {
                    setWarning(false);
                }}
                primaryButtonText="OK"
            />
        </>
    );
};

export default SMTPGrid;
