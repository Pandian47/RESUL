import { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@progress/kendo-react-inputs';

import { getUserDetails } from 'Utils/modules/crypto';
import { getUserCurrentFormat, momentIsValid } from 'Utils/modules/dateTime';
import { getEnvironment } from 'Utils/modules/environment';

import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';

import { Push_WebContext } from '../Context';
import usePermission from 'Hooks/usePersmission';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    getCustomEventList,
    getCustomEventById,
    deleteCustomEvent,
} from 'Reducers/preferences/CommunicationSettings/request';
import { circle_plus_fill_edge_large, pencil_edit_medium, circle_plus_fill_edge_medium, eye_medium, delete_medium } from 'Constants/GlobalConstant/Glyphicons';
import { ADD, EVENT_NAME, SELECT_DOMAIN_NAME, CREATED_BY, CREATE_DATE, ACTIONS, WEB_View, EDIT, STATUS, DELETE, WAITING_FOR_EVENT_SET } from 'Constants/GlobalConstant/Placeholders';

import RSConfirmationModal from 'Components/ConfirmationModal';
import RSModal from 'Components/RSModal';
import RSAlert from 'Components/RSAlert';
import { ScriptBlock } from 'Assets/Images';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { CommunicationSettingsSmtpTableSkeleton } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';

const customWebGrid = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const context = useContext(Push_WebContext);
    const { permissions } = usePermission();
    const { addAccess, updateAccess, deleteAccess } = permissions || {};

    const { licenseTypeId, roleId = 0 } = getUserDetails();
    const { clientId, userId, departmentId, departmentName } = useSelector(getSessionId);

    const [gridData, setGridData] = useState([]);
    const [initialPagination, setInitialPagination] = useState(false);
    const [isDelete, setIsDelete] = useState({ show: false, data: {} });
    const [showTrackingAgreement, setShowTrackingAgreement] = useState(false);
    const [isShowAlert, setShowAlert] = useState(false);
    const [agreementData, setAgreementData] = useState(null);
    const openedTabRef = useRef(null);
    const tabClosePollRef = useRef(null);

    const env = getEnvironment();
    const urlBase = `sdk.resul.${env === 'TEAM' ? 'team' : 'io'}`;

    // Check if add button should be disabled
    const isAddDisabled = !addAccess || (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3');

    const handleViewCustomEvent = useCallback(
        async (dataItem) => {
            const response = await dispatch(
                getCustomEventById({
                    id: dataItem?.customEventId || dataItem?.id,
                })
            );

            if (response?.status) {
                context.setGridCreate((prev) => ({
                    ...prev,
                    showGrid: false,
                    pushWebAction: {
                        edit: {
                            editState: response?.data,
                            isEdit: false,
                        },
                        create: false,
                        show: true,
                        type: 'view',
                    },
                }));
            }
        },
        [dispatch, context]
    );

    const [isGridLoading, setIsGridLoading] = useState(false);

    const fetchCustomEvents = useCallback(async () => {
        setIsGridLoading(true);
        setInitialPagination(true);

        console.log('fetchCustomEvents executing');

        try {
            const res = await dispatch(
                getCustomEventList({
                    channelType: 'WP',
                })
            );
            console.log('getCustomEventList response:', res);
            setGridData(res?.status ? res?.data : []);
        } catch (err) {
            console.error('getCustomEventList error:', err);
        } finally {
            setIsGridLoading(false);
        }
    }, [dispatch]);

    useEffect(() => {
        console.log('useEffect for fetchCustomEvents mounted');
        fetchCustomEvents();
        return () => {
            console.log('useEffect for fetchCustomEvents unmounted');
            if (tabClosePollRef.current) {
                window.clearInterval(tabClosePollRef.current);
                tabClosePollRef.current = null;
            }
        };
    }, [fetchCustomEvents]);

    // Handle delete action
    const handleDeleteCustomEvent = useCallback(

        async (eventData) => {

            const { status } = await dispatch(

                deleteCustomEvent({

                    customEventId: eventData?.customEventId || eventData?.id,

                })

            );

            if (status) {

                fetchCustomEvents();

            }

            setIsDelete({ show: false, data: {} });

        },

        [dispatch, fetchCustomEvents]

    )

    const handleSwitch = useCallback(
        async (e, dataItem) => {
            const checked = e.target.value;
            const targetId = dataItem?.id || dataItem?.customEventId;

            // Instantly toggle local state for switch transition animation
            setGridData((prev) =>
                prev.map((item) =>
                    (item?.id || item?.customEventId) === targetId
                        ? { ...item, status: checked ? 'Active' : 'Inactive' }
                        : item
                )
            );

            const { status } = await dispatch(
                deleteCustomEvent({
                    id: targetId,
                    status: checked ? 1 : 2
                })
            );

            if (!status) {
                // Revert local state on failure
                setGridData((prev) =>
                    prev.map((item) =>
                        (item?.id || item?.customEventId) === targetId
                            ? { ...item, status: checked ? 'Inactive' : 'Active' }
                            : item
                    )
                );
            }
        },
        [dispatch, fetchCustomEvents]
    );


    // Reset context for new/edit
    const resetContext = useCallback(
        (config) => {
            context.setGridCreate((prev) => ({ ...prev, showGrid: false, ...config }));
        },
        [context],
    );

    // Handle add button click
    const handleAddCustomEvent = useCallback(() => {
        if (addAccess) {
            resetContext({
                pushWebAction: {
                    edit: { editState: [], isEdit: false },
                    create: true,
                    show: true,
                },
                pushWebGoalAction: {
                    edit: { editState: [], isEdit: false },
                    create: false,
                    showGrid: false,
                    show: false,
                },
            });
        }
    }, [addAccess, resetContext]);

    // Handle edit button click
    const handleEditCustomEvent = useCallback(
        (dataItem) => {
            if (updateAccess) {
                setAgreementData(dataItem);
                setShowTrackingAgreement(true);
            }
        },
        [updateAccess],
    );

    const handleEventTrackSubmit = useCallback(
        (dataItem) => {
            const getUrl = dataItem?.domainURL || dataItem?.domainName || '';
            if (getUrl) {
                let formattedUrl = getUrl;
                if (!/^https?:\/\//i.test(formattedUrl)) {
                    formattedUrl = `https://${formattedUrl}`;
                }

                localStorage.setItem('__brandOwnedFormData', JSON.stringify({
                    platform: { id: 'web', value: 'Web' },
                    eventTrackingUrl: formattedUrl
                }));

                let campaignId = Math.floor(Math.random() * 1000 + 1);
                const reqs = localStorage.getItem('accessToken') || '';
                const formName = '';
                const domain = window.location.host;
                const redurl = `${domain}/preferences/communication-settings`;
                let path = `/preferences/communication-settings`;
                const formId = dataItem?.id || dataItem?.customEventId || 0;
                const paramsToEncrypt = `cevent|${reqs}|${formId}|${departmentId}|${formName}|${redurl}`;
                const encryptedParams = 'rfg' + btoa(paramsToEncrypt) + 'rd';
                const cleanUrl = formattedUrl.replace(/\/$/, '');
                let urlStr = `${cleanUrl}?_sdxFormId=${btoa(campaignId.toString())}&sdk_mode=${encryptedParams}&path=${encodeURIComponent(path)}&webft=true&bofadd=true`;
                localStorage.setItem('fdomain', urlStr);
                const opened = window.open(urlStr, '_blank');
                opened?.focus();
                openedTabRef.current = opened || null;

                setTimeout(() => {
                    setShowAlert(true);
                }, 350);

                if (tabClosePollRef.current) {
                    window.clearInterval(tabClosePollRef.current);
                    tabClosePollRef.current = null;
                }

                if (openedTabRef.current) {
                    tabClosePollRef.current = window.setInterval(() => {
                        if (!openedTabRef.current || openedTabRef.current.closed) {
                            if (tabClosePollRef.current) {
                                window.clearInterval(tabClosePollRef.current);
                                tabClosePollRef.current = null;
                            }
                            openedTabRef.current = null;
                            setShowAlert(false);
                            fetchCustomEvents();
                        }
                    }, 1000);
                }
            }
        },
        [departmentId, fetchCustomEvents],
    );



    const columns = useMemo(
        () => [
            {
                field: 'customEventName',
                title: EVENT_NAME,
                filter: 'text',
            },
            {
                field: 'domainName',
                title: SELECT_DOMAIN_NAME,
                filter: 'text',
            },
            {
                field: 'createdBy',
                title: CREATED_BY,
                filter: 'text',
            },
            {
                field: 'createdDate',
                title: CREATE_DATE,
                width: 240,
                filter: 'date',
                cell: ({ dataItem }) => (
                    <td>
                        {momentIsValid(dataItem?.createdDate) && (
                            <span className="rctcb-by-date">
                                {getUserCurrentFormat(dataItem?.createdDate)?.dateTimeFormat}
                            </span>
                        )}
                    </td>
                ),
            },
            {
                field: 'status',
                title: STATUS,
                width: 130,
                cell: (props) => {
                    return (
                        <td className="text-left">
                            <Switch
                                checked={props.dataItem?.status === 'Active'}
                                onChange={(e) => handleSwitch(e, props.dataItem)}
                            />
                        </td>
                    );
                },
            },
            {
                field: 'action',
                title: ACTIONS,
                width: '250px',
                sortable: false,
                cell: ({ dataItem }) => (
                    <td style={{ overflow: 'inherit' }}>
                        <ul className="rs-list-inline rli-space-15 grid-view-icons">
                            <li onClick={() => handleViewCustomEvent(dataItem)}>
                                <RSTooltip text={WEB_View} position="top">
                                    <div className={!updateAccess ? 'pe-none click-off' : ''}>
                                        <i
                                            id="rs_data_eye_view"
                                            className={`${eye_medium} icon-md color-primary-blue`}
                                        />
                                    </div>
                                </RSTooltip>
                            </li>
                            <li onClick={() => handleEditCustomEvent(dataItem)}>
                                <RSTooltip text={EDIT} position="top">
                                    <div className={!updateAccess ? 'pe-none click-off' : ''}>
                                        <i
                                            id="rs_data_pencil_edit"
                                            className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                        />
                                    </div>
                                </RSTooltip>
                            </li>
                        </ul>
                    </td>
                ),
            },
        ],
        [handleEditCustomEvent, handleViewCustomEvent, updateAccess, deleteAccess],
    );

    const emptyGridMessage = (
        <>
            Click
            <span
                className={`rs-nodata-icon-wrap position-relative bottom1 mx5 pt2${isAddDisabled ? ' cursor-not-allowed' : ''
                    }`}
            >
                <i
                    id="rs_data_circle_plus_fill_edge"
                    className={`icon-md color-primary-blue icon-hover-shadow-primary ${circle_plus_fill_edge_medium}${isAddDisabled ? ' click-off' : ''
                        }`}
                    onClick={(event) => {
                        event.stopPropagation();
                        handleAddCustomEvent();
                    }}
                />
            </span>
            to configure your custom events settings.
        </>
    );

    return (
        <>
            <div className="rs-sub-heading">
                <div className="align-items-center d-flex justify-content-between">
                    <h4 className="mb0">Custom events settings</h4>
                    <RSTooltip position="top" text={ADD} className="lh0">
                        <div className={` ${isAddDisabled ? 'pe-none click-off' : ''}`}>
                            <i
                                onClick={handleAddCustomEvent}
                                className={`icon-lg color-primary-blue icon-hover-shadow-primary ${circle_plus_fill_edge_large}`}
                                id="rs_data_circle_plus_fill_edge"
                            />
                        </div>
                    </RSTooltip>
                </div>
            </div>

            {isGridLoading ? (
                <CommunicationSettingsSmtpTableSkeleton />
            ) : (
                <div className="rs-grid-border-radius">
                    <KendoGrid
                        data={gridData}
                        settings={{ total: gridData.length }}
                        isFailure={!gridData.length}
                        noBoxShadow
                        isCustomBox
                        column={columns}
                        pagerChange={initialPagination}
                        setInitialPagination={setInitialPagination}
                        isLoading={false}
                        loading={false}
                        noDataText={emptyGridMessage}
                        noDataShowIcon={false}
                    />
                </div>
            )}

            <RSConfirmationModal
                show={isDelete.show}
                handleConfirm={(status) =>
                    status && deleteAccess && handleDeleteCustomEvent(isDelete.data)
                }
                handleClose={() => setIsDelete({ show: false, data: {} })}
            />



            {/* Custom Event Tracking Agreement Modal */}
            <RSModal
                settings={{ animation: false }}
                show={showTrackingAgreement}
                handleClose={() => setShowTrackingAgreement(false)}
                header={'Custom event tracking'}
                size="lg"
                body={
                    <div>
                        <p>
                            By proceeding, you acknowledge that Custom event tracking is supported only with static IDs.
                            Dynamic IDs are not supported and may result in unreliable event tracking.
                            You are solely responsible for the accuracy and integrity of all captured data and events.
                        </p>
                    </div>
                }
                footer={
                    <div className="d-flex gap-2">
                        <RSSecondaryButton
                            type="button"
                            onClick={() => setShowTrackingAgreement(false)}
                        >
                            Disagree
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            type="button"
                            onClick={() => {
                                setShowTrackingAgreement(false);
                                handleEventTrackSubmit(agreementData);
                            }}
                        >
                            I Agree
                        </RSPrimaryButton>
                    </div>
                }
            />

            <RSAlert
                show={isShowAlert}
                header={false}
                containerClass="py0"
                body={
                    <div className="d-flex align-items-center justify-content-center">
                        <div>
                            <img src={ScriptBlock} alt="scriptBlock" width={100} height={100} />
                        </div>
                        <div className="my20">
                            <h1 className="mb0">{WAITING_FOR_EVENT_SET}</h1>
                        </div>
                        <div className="ml30">
                            <RSPrimaryButton
                                id="proceedBtnCustomEvent"
                                onClick={() => {
                                    setShowAlert(false);
                                }}
                            >
                                Proceed
                            </RSPrimaryButton>
                        </div>
                    </div>
                }
            />

        </>
    );
};

export default customWebGrid;
