
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { NO_DATA_AVAILABEL } from 'Constants/GlobalConstant/Placeholders';
import { useState } from 'react';
import { Container } from 'react-bootstrap';
import { Switch } from '@progress/kendo-react-inputs';

import RSPageHeader from 'Components/RSPageHeader';
import KendoGrid from 'Components/RSKendoGrid';
import PreferencesSubPageSkeletonGate from 'Components/Skeleton/Components/PreferencesSubPageSkeletonGate';
import { PREFERENCES_SUBPAGE_VARIANT } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import usePreferencesSubPageApi from 'Hooks/usePreferencesSubPageApi';
import { useDispatch, useSelector } from 'react-redux';
import { updateAlertsAndNotfications } from 'Reducers/preferences/alertsAndNotification/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { getNotificationStatus } from 'Reducers/notifications/request';

import { ALERTS_HEADER } from 'Constants/GlobalConstant/Placeholders';
const isPreferencesApiSuccess = (status) =>
    status === true || status === 1 || status === 'true' || status === 'True';

const AlertAndNotifcations = ({ permissions }) => {
    const { updateAccess } = permissions;
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const dispatch = useDispatch();
    const [pageGridChange, setPageGridChange] = useState([]);
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);

    const alertsApi = usePreferencesSubPageApi({
        mode: 'edit',
        deps: [departmentId, clientId, userId],
        fetcher: async () => {
            const payload = { departmentId, clientId, userId };
            const res = await dispatch(
                getNotificationStatus({ payload, loading: false, isFailureCheck: false }),
            );
            const rows = Array.isArray(res?.data) ? res.data : [];
            if (!isPreferencesApiSuccess(res?.status) || !rows.length) {
                throw new Error(res?.message || NO_DATA_AVAILABEL);
            }
            return res;
        },
        onSuccess: (res) => {
            setPageGridChange([...(res?.data ?? [])]);
        },
        onError: () => {
            setPageGridChange([]);
        },
    });

    const showAlertsNoData = alertsApi.isError;
    const showAlertsSkeleton = alertsApi.isPageLoading || showAlertsNoData;

    const handleChange = (value, dataItem, index) => {
        setPageGridChange((prev) => {
            return prev.map((alert, ind) => {
                if (index === ind) return { ...alert, isAlert: value };
                return alert;
            });
        });
        const payload = {
            departmentId,
            clientId,
            userId,
            alertNotificationId: dataItem?.alertNotificationID,
            isAlert: value,
        };
        dispatch(updateAlertsAndNotfications({ payload }));
    };

    return (
        <div className="page-content-holder">
            <RSPageHeader
                title="Alerts and notifications"
                isBack
                rightCommonMenus
                backPath="/preferences"
                isHeaderLine
            />

            <Container fluid>
                <div className="page-content alertsAndNotificationCSS">
                    <Container className="px0">
                        <PreferencesSubPageSkeletonGate
                            variant={PREFERENCES_SUBPAGE_VARIANT.ALERTS_NOTIFICATIONS}
                            isLoading={showAlertsSkeleton}
                            showNoData={showAlertsNoData}
                            ariaLabel="Loading alerts and notifications"
                        >
                            <h3 className="top-sub-heading mt0">{ALERTS_HEADER}</h3>
                            <div className="rs-kendo-table-hide-header rskt-width-90-10 rs-alertnotifications">
                                {pageGridChange?.length > 0 && (
                                    <KendoGrid
                                        data={pageGridChange}
                                        noBoxShadow={true}
                                        column={[
                                            {
                                                field: 'alertNotification',
                                                title: 'Alert notification',
                                                cell: ({ dataItem }) => (
                                                    <td>
                                                        {dataItem?.alertNotification}
                                                    </td>
                                                ),
                                            },
                                            {
                                                field: 'checked',
                                                title: 'Action',
                                                width: '125px',
                                                cell: ({ dataItem, dataIndex }) => (
                                                    <td>
                                                        <Switch
                                                            onChange={(e) =>
                                                                handleChange(e.target.value, dataItem, dataIndex)
                                                            }
                                                            checked={dataItem?.isAlert}
                                                            disabled={updateAccess}
                                                        />
                                                    </td>
                                                ),
                                            },
                                        ]}
                                        settings={{ total: pageGridChange?.length }}
                                        pageable={true}
                                    />
                                )}
                            </div>
                        </PreferencesSubPageSkeletonGate>
                    </Container>
                </div>
            </Container>
            {!showAlertsNoData && getWarningPopupMessage(failureApiErrors, dispatch)}
        </div>
    );
};

export default AlertAndNotifcations;
