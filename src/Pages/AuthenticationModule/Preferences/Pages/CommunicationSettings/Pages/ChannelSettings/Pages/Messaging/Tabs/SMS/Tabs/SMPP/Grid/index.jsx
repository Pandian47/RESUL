
import { ACTIONS, ADD, EDIT, SENDER_ID, SERVICE_PROVIDER, SMPP, SMPP_SMS_SENT, SMS, SMS_TYPE, STATUS } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large, circle_plus_fill_edge_medium, mobile_sms_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useState } from 'react';
import { Switch } from '@progress/kendo-react-inputs';
import { useSelector, useDispatch } from 'react-redux';

import RSTooltip from 'Components/RSTooltip';
import KendoGrid from 'Components/RSKendoGrid';
import { SMPPProvider } from '../Context';
import usePermission from 'Hooks/usePersmission';
import { getCSSMSGrid, isCreatedValue } from 'Reducers/preferences/CommunicationSettings/selector';
import {
    getCSSMSGridData,
    sendSMSSMPP,
    updateCSSMSGridDataStatus,
} from 'Reducers/preferences/CommunicationSettings/request';
import { SMS_TYPES } from '../../../constant';
import { getSessionId } from 'Reducers/globalState/selector';
import RSConfirmationModal from 'Components/ConfirmationModal';

import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import { globalStateSelector } from 'Utils/Selectors/app';
import { updateCommunicationSettings } from 'Reducers/preferences/CommunicationSettings/reducer';
import { canEditMessagingChannel } from '../../../../../../../constant';

const SMPPList = () => {
    const context = useContext(SMPPProvider);
    const { permissions } = usePermission();
    const { addAccess, updateAccess } = permissions || {};
    const [warning, setWarning] = useState(false);

    const dispatch = useDispatch();
    const smsGrid = useSelector((state) => getCSSMSGrid(state));
    const isCreated = useSelector((state) => isCreatedValue(state));
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { loading } = useSelector((state) => globalStateSelector(state));

    const [gridLoading, setGridLoading] = useState(false);
    useEffect(() => {
        const payload = {
            //  departmentId,
            clientId,
            userId,
        };
        dispatch(getCSSMSGridData({ clientId, userId, }, setGridLoading));
    }, [departmentId, clientId, userId]);


    useEffect(() => {
        return () => {
            dispatch(updateCommunicationSettings({ field: 'smsData', payload: [] }));
            dispatch(updateCommunicationSettings({ field: 'isCreated', payload: false }));
        }
    }, [])

    // useOnlyDepChangeEffect(() => {
    //     setGridData(smsGrid);
    // }, [smsGrid]);

    const handleSwitch = async (e, data) => {
        setGridLoading(true);
        const payload = {
            channel: 2,
            settingId: data.clientSmsSettingId,
            isActive: e.value,
            // departmentId,
            clientId,
            userId,
        };
        const { status } = await dispatch(updateCSSMSGridDataStatus(payload));
        status && dispatch(getCSSMSGridData({ clientId, userId }, setGridLoading));
    };
    const handleSMPPMail = async (id) => {
        const payload = { clientId, userId, departmentId, clientSmsId: id };
        const { status, data } = await dispatch(sendSMSSMPP(payload));
        if (status) {
            setWarning(true);
            setTimeout(function () {
                setWarning(false);
            }, 3000);
        } else {
            setWarning(false);
        }
    };
    return (
        <>
            <div className="rs-sub-heading">
                <div className="align-items-center d-flex justify-content-between">
                    <h4 className="mb0">{'Vendors'}</h4>
                    <RSTooltip position="top" text={ADD} className="lh0">
                        <i
                            onClick={() => {
                                if (addAccess) {
                                    context.setGridCreate((prev) => ({
                                        ...prev,
                                        showGrid: false,
                                        smppAction: {
                                            edit: {
                                                editState: [],
                                                isEdit: false,
                                            },
                                            create: true,
                                        },
                                    }));
                                }
                            }}
                            className={`icon-lg color-primary-blue icon-hover-shadow-primary ${circle_plus_fill_edge_large
                            } ${!addAccess ? 'click-off' : ''}`}
                            id="rs_data_circle_plus_fill_edge"
                        ></i>
                    </RSTooltip>
                </div>
            </div>
            {
                isCreated && smsGrid?.length == 0 ?
                    <RSSkeletonTable
                        text
                        message={
                            <>
                                Click{' '}
                                <span
                                    className={`rs-nodata-icon-wrap position-relative bottom1 mx5${!addAccess ? ' cursor-not-allowed' : ''}`}
                                >
                                    <i
                                        id="rs_data_circle_plus_fill_edge"
                                        className={`icon-md color-primary-blue icon-hover-shadow-primary ${circle_plus_fill_edge_medium}${!addAccess ? ' click-off' : ''}`}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            if (addAccess) {
                                                context.setGridCreate((prev) => ({
                                                    ...prev,
                                                    showGrid: false,
                                                    smppAction: {
                                                        edit: {
                                                            editState: [],
                                                            isEdit: false,
                                                        },
                                                        create: true,
                                                    },
                                                }));
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
                    :
                    <KendoGrid
                        data={smsGrid}
                        isLoading={gridLoading}
                        noBoxShadow
                        isFailure={!smsGrid?.length}
                        settings={{ total: smsGrid?.length }}
                        isCustomBox
                        column={[
                                {
                                field: 'friendlyName',
                                title: 'Friendly name',
                                filter: 'text',
                                width: 200,
                                cell: ({ dataItem }) => {
                                    const displayValue = dataItem?.friendlyName || dataItem?.smsFriendlyName || dataItem?.userName || '-';
                                    return (
                                        <td>
                                            {displayValue}
                                        </td>
                                    );
                                },
                            },
                            {
                                field: 'serviceproviderName',
                                title: SERVICE_PROVIDER,
                                filter: 'text',
                                width: 200,
                                cell: ({ dataItem }) => (
                                    <td>
                                    {dataItem?.serviceproviderName}
                                    </td>
                                ),
                            },
                            {
                                field: 'settingType',
                                title: SMS_TYPE,
                                filter: 'text',
                                width: 200,
                                cell: (props) => {
                                    const item = props.dataItem;
                                    const rawType = item?.messageTypes ?? item?.settingType;
                                    let typeCodes = [];

                                    if (Array.isArray(rawType)) {
                                        typeCodes = rawType;
                                    } else if (typeof rawType === 'string') {
                                        const normalizedRaw = rawType.trim();
                                        if (normalizedRaw) {
                                            try {
                                                const parsed = JSON.parse(normalizedRaw);
                                                if (Array.isArray(parsed)) {
                                                    typeCodes = parsed;
                                                } else if (typeof parsed === 'string') {
                                                    typeCodes = [parsed];
                                                }
                                            } catch {
                                                const compactType = normalizedRaw.replace(/\s+/g, '').toUpperCase();
                                                if (compactType.includes(',')) {
                                                    typeCodes = compactType.split(',').filter(Boolean);
                                                } else if (compactType.includes('TWO')) {
                                                    const remainingCodes = compactType
                                                        .replace(/TWO/g, '')
                                                        .split('')
                                                        .filter((code) => ['P', 'T'].includes(code));
                                                    typeCodes = [...remainingCodes, 'TWO'];
                                                } else {
                                                    typeCodes = compactType.split('').filter((code) => ['P', 'T'].includes(code));
                                                }
                                            }
                                        }
                                    } else if (rawType) {
                                        typeCodes = [rawType];
                                    }

                                    const uniqueTypeCodes = [...new Set(typeCodes.map((code) => String(code).toUpperCase()))];
                                    const display =
                                        uniqueTypeCodes.map((t) => SMS_TYPES[t]).filter(Boolean).join(', ') || '-';
                                    return <td>{display}</td>;
                                },
                            },
                            {
                                field: 'senderId',
                                title: SENDER_ID,
                                filter: 'text',
                                width: 150,
                                cell: ({ dataItem }) => (
                                    <td>
                                    {dataItem?.senderId}
                                    </td>
                                ),
                            },
                            {
                                field: 'status',
                                title: STATUS,
                                width: 130,
                                cell: (props) => {
                                    return (
                                        <td className="text-left pe-none click-off">
                                            <Switch
                                                checked={props.dataItem?.isActive}
                                                onChange={(e) => handleSwitch(e, props.dataItem)}
                                            />
                                        </td>
                                    );
                                },
                            },
                            {
                                field: 'action',
                                title: ACTIONS,
                                width: 165,
                                sortable: false,
                                cell: (props) => {
                                    const isDisabled = !updateAccess || !canEditMessagingChannel(props.dataItem);
                                    return (
                                        <td>
                                            <ul className="rs-list-inline rli-space-15 grid-view-icons">
                                                <li
                                                    onClick={() => {
                                                        if (!isDisabled) {
                                                            context.setGridCreate((prev) => ({
                                                                ...prev,
                                                                showGrid: false,
                                                                smppAction: {
                                                                    edit: {
                                                                        editState: props.dataItem,
                                                                        isEdit: true,
                                                                    },
                                                                    create: false,
                                                                },
                                                            }));
                                                        }
                                                    }}
                                                >
                                                    <RSTooltip text={EDIT} position="top">
                                                        <div className={`${isDisabled ? 'pe-none click-off' : ''}`}>
                                                        <i
                                                            id="rs_data_pencil_edit"
                                                            className={`${pencil_edit_medium
                                                                }  icon-md color-primary-blue`}
                                                        ></i></div>
                                                    </RSTooltip>
                                                </li>
                                                {/* <li
                                                    onClick={() => {
                                                        handleSMPPMail(props.dataItem?.clientSmsSettingId);
                                                    }}
                                                >
                                                    <RSTooltip text={SMS} position="top">
                                                        <i
                                                            className={`${mobile_sms_medium} icon-md color-primary-blue`}
                                                        ></i>
                                                    </RSTooltip>
                                                </li> */}
                                            </ul>
                                        </td>
                                    );
                                },
                            },
                        ]}
                    />
            }
            <RSConfirmationModal
                show={warning}
                text={SMPP_SMS_SENT}
                secondaryButton={false}
                primaryButton
                isBorder
                header={SMPP}
                handleClose={() => {
                    setWarning(false);
                }}
                handleConfirm={() => {
                    setWarning(false);
                }}
            />
        </>
    );
};

export default SMPPList;
