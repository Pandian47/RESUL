import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { numberWithCommas } from 'Utils/modules/formatters';
import { ACTION, ARE_YOU_SURE_DELETE, CANCEL, CREATE_DATE, DELETE, DELETE_USER_ROLE, DOMAIN_NAME, EDIT, VOLUME, YES,EMAIL_NAME } from 'Constants/GlobalConstant/Placeholders';
import { circle_tick_medium, delete_medium, pencil_edit_medium, smtp_approved_medium, smtp_inprogress_medium, smtp_pending_medium,email_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useState } from 'react';
import moment from 'moment';
import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';
import { ActionsType } from '../..';
import usePermission from 'Hooks/usePersmission';

import { useDispatch, useSelector } from 'react-redux';
import { deleteSmtpDomainSettingsById, getSmtpDomainSettingsGrid, sendDomainDetailsMail } from 'Reducers/preferences/CommunicationSettings/request';
import RSModal from 'Components/RSModal';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getSessionId } from 'Reducers/globalState/selector';

const SMTPDomainNameSettingsGrid = () => {
    const { setDomainToggle, setActions } = useContext(ActionsType);
    const {
        permissions: { updateAccess, deleteAccess },
    } = usePermission();
        const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    // const { clientId, userId, departmentId } = getUserDetails();
    // const [deleteStatus, setDeleteStatus] = useState({
    //     selectId: '',
    //     status: false,
    //     active: false,
    // });
    const [deleteModal, setDeleteModal] = useState({
        show: false,
        id: 0,
    });
    const [warning, setWarning] = useState(false);
    const dispatch = useDispatch();

    const [gridData, setGridData] = useState({
        isFailure: false,
        isLoading: true,
        grid: [],
    });

    useEffect(() => {
        getDomainSettingsList();
    }, [departmentId, clientId]);

    const getDomainSettingsList = async () => {
        setGridData((pre) => ({
            ...pre,
            isLoading: true,
        }));
        let payload = { clientId, userId, departmentId };
        const { status, data } = await dispatch(getSmtpDomainSettingsGrid(payload));
        if (status) {
            setGridData({
                isLoading: false,
                isFailure: false,
                grid: data,
            });
        } else {
            setGridData({
                isLoading: false,
                isFailure: true,
                grid: [],
            });
        }
    };

    const deleteDomainSettingsById = async (id) => {
        // setDeleteStatus((pre) => ({ ...pre, status: false }));
        setDeleteModal({
            show: false,
            id: 0,
        });
        setGridData((pre) => ({
            ...pre,
            isLoading: true,
        }));
        let payload = {
            clientId,
            userId,
            departmentId,
            smtpDomainsettingId: id,
            isActive: false,
        };
        const { status, data } = await dispatch(deleteSmtpDomainSettingsById(payload));
        if (status) {
            getDomainSettingsList();
            setDeleteModal({
                show: false,
                id: 0,
            });
        } else {
            setGridData((pre) => ({
                ...pre,
                isLoading: false,
            }));
        }
    };

    const handleDomainMail = async (smtpDomainSettingId) => {
        const payload = { smtpDomainSettingId, userId, clientId, departmentId };
        const { status } = await dispatch(sendDomainDetailsMail(payload));
        if (status) {
            setWarning(true);
        }
    };

    return (
        <>
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
                        title: DOMAIN_NAME,
                        filter:'text',
                        width: 300,
                        cell: ({ dataItem }) => {
                            const fullDomainName = dataItem?.domainName || '';

                            return (
                                <td>
                                    {fullDomainName?.length > 45 ? (
                                        <RSTooltip
                                            text={fullDomainName}
                                            position="top"
                                            className="d-inline-block"
                                            innerContent={false}
                                        >
                                            <span>{truncateTitle(fullDomainName, 45)}</span>
                                        </RSTooltip>
                                    ) : (
                                        <span>{fullDomainName}</span>
                                    )}
                                </td>
                            );
                        },
                    },
                    {
                        field: 'potentialBase',
                        title: VOLUME,
                        width: 200,
                        cell: ({ dataItem }) => {
                            const value = dataItem?.potentialBase;
                            return (
                                <td>
                                    <span>
                                        {value != null && value !== ''
                                            ? numberWithCommas(value)
                                            : '—'}
                                    </span>
                                </td>
                            );
                        },
                    },
                    {
                        field: 'createdDate',
                        title: CREATE_DATE,
                        filter:'date',
                        width: 200,
                        cell: (props) => {
                            return (
                                <td>
                                    {moment(props.dataItem?.createdDate).isValid() && (
                                        <span className="rctcb-by-date">
                                            {getUserCurrentFormat(props.dataItem?.createdDate,{isOffset: true})?.dateFormat}
                                        </span>
                                    )}
                                </td>
                            );
                        },
                    },
                    {
                        field: 'status',
                        title: 'Status',
                        width: '100px',
                        cell: ({ dataItem }) => {
                            const status = (dataItem?.status || '').toUpperCase();
                            const statusConfig = {
                                PENDING: {
                                    tooltip: 'Pending',
                                    icon: smtp_pending_medium,
                                    iconClass: 'color-inprogress',
                                },
                                'READY TO PICK': {
                                    tooltip: 'Ready to pick',
                                    icon: smtp_approved_medium,
                                    iconClass: 'color-inprogress',
                                },
                                INPROGRESS: {
                                    tooltip: 'In progress',
                                    icon: smtp_inprogress_medium,
                                    iconClass: 'color-inprogress',
                                },
                                SUCCESS: {
                                    tooltip: 'Success',
                                    icon: circle_tick_medium,
                                    iconClass: 'color-completed',
                                },
                            };
                            const currentStatus = statusConfig[status] || statusConfig.SUCCESS;
                            return (
                                <td>
                                    <RSTooltip
                                        text={currentStatus.tooltip}
                                        position="top"
                                        className="lh0 d-inline-block"
                                        innerContent={false}
                                    >
                                        <i className={`${currentStatus.icon} icon-md ${currentStatus.iconClass}`} />
                                    </RSTooltip>
                                </td>
                            );
                        },
                    },
                    {
                        field: 'action',
                        title: ACTION,
                        width: '165px',
                        sortable: false,
                        cell: ({ dataItem }) => {
                            const statusNorm = (dataItem?.status || '').trim().toUpperCase();
                            const showEdit =
                                updateAccess &&
                                (statusNorm === 'PENDING' || statusNorm === 'READY TO PICK');
                            return (
                                <td>
                                    <ul className="rs-list-inline rli-space-15 ">
                                        {showEdit && (
                                            <>
                                                <li>
                                                    <RSTooltip text={EDIT} position="top" className={"lh0"}>
                                                        <i
                                                            id="rs_data_pencil_edit"
                                                            className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                                            onClick={() => {
                                                                setDomainToggle('edit');
                                                                setActions({
                                                                    type: 'Domain Create',
                                                                    state: {
                                                                        mode: 'edit',
                                                                        settingsId: dataItem?.smtpdomainSettingId,
                                                                        domainStatus: dataItem?.status,
                                                                    },
                                                                });
                                                            }}
                                                        />
                                                    </RSTooltip>
                                                </li>
                                                <li>
                                                    <RSTooltip text={EMAIL_NAME} position="top" className={"lh0"}>
                                                        <i
                                                            id="rs_data_email"
                                                            className={`${email_medium} icon-md color-primary-blue`}
                                                            onClick={() => {
                                                                handleDomainMail(dataItem?.smtpdomainSettingId);
                                                            }}
                                                        />
                                                    </RSTooltip>
                                                </li>
                                            </>
                                        )}
                                        <li className="d-none">
                                            {/* ${!deleteAccess ? "click-off" : ""} */}
                                            <RSTooltip text={DELETE} position="top" className={"lh0"}>
                                                <i
                                                    id="rs_data_delete"
                                                    className={`${delete_medium} icon-md color-primary-blue `}
                                                    onClick={() => {
                                                        // setDeleteStatus((pre) => ({
                                                        //     ...pre,
                                                        //     status: true,
                                                        //     selectId: dataItem?.smtpdomainSettingId,
                                                        //     active: dataItem?.isActive,
                                                        // }));
                                                        setDeleteModal({
                                                            show: true,
                                                            id: dataItem?.smtpdomainSettingId,
                                                        });
                                                    }}
                                                ></i>
                                            </RSTooltip>
                                        </li>
                                    </ul>
                                </td>
                            );
                        },
                    },
                ]}
            />

            <RSModal
                show={deleteModal?.show}
                size="md"
                // isCloseButton={false}
                header={DELETE_USER_ROLE}
                body={ARE_YOU_SURE_DELETE}
                footer={
                    <>
                        <RSSecondaryButton
                            onClick={() => {
                                // setDeleteStatus((pre) => ({ ...pre, status: false }));
                                setDeleteModal({
                                    show: false,
                                    id: 0,
                                });
                            }}
                        >
                            {CANCEL}
                        </RSSecondaryButton>
                        <RSPrimaryButton className={'ml15'} onClick={() => deleteDomainSettingsById(deleteModal?.id)}>
                            {YES}
                        </RSPrimaryButton>
                    </>
                }
            />

            <RSConfirmationModal
                show={warning}
                text="Your domain will be integrated within the next 12 hours."
                primaryButtonText="Ok"
                secondaryButton={false}
                handleConfirm={() => {
                    setWarning(false);
                }}
                handleClose={() => {
                    setWarning(false);
                }}
                header="Information"
            />
        </>
    );
};

export default SMTPDomainNameSettingsGrid;
