import { getUserDetails } from 'Utils/modules/crypto';
import { SELECT_BU } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import RSTabbar from 'Components/RSTabber/index';
import useQueryParams from 'Hooks/useQueryParams';
import { NOTIFICATION_TABBER_CONFIG, resolveNotificationTabState } from '../../constant';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';

import RSConfirmationModal from 'Components/ConfirmationModal';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import { update_isBUEnablePush } from 'Reducers/preferences/CommunicationSettings/reducer';
const Notification = () => {
    const location = useQueryParams('/communication');
    const queryState = useQueryParams('/preferences/communication-settings');
    const dispatch = useDispatch();
    const { state } = useLocation();
    const [tabState, setTabState] = useState(() =>
        resolveNotificationTabState({ ...queryState, ...location, ...state }),
    );
    const { licenseTypeId } = getUserDetails();
    const [confirmationModal, setConfimrationModal] = useState(false);
    const { departmentName } = useSelector((state) => getSessionId(state));
    useEffect(() => {
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
            setConfimrationModal(true);
        } else {
            setConfimrationModal(false);
        }
    }, [departmentName]);
    useEffect(() => {
        setTabState(resolveNotificationTabState({ ...queryState, ...location, ...state }));
        dispatch(update_isBUEnablePush(2));
    }, [location, queryState, state, dispatch]);
    return (
        // <div className="rsv-tabs-content rs-pref-innertabs-wrapper">
        //     <div className="tabs-right-align pageSub_tab">
        <>
            {departmentName?.toLowerCase() === 'all' && licenseTypeId === '3' ? (
                <div className="d-flex flex-column notificationdatabar">
                    <RSSkeletonTable text={true} message={'No data available'} count={5} />
                </div>
            ) : (
                <RSTabbar
                    dynamicTab={`rs-sub-tabs rs-cc-sub-tabs pref-tabber`}
                    activeClass={`active`}
                    defaultTab={tabState}
                    tabData={NOTIFICATION_TABBER_CONFIG}
                />
            )}
            <RSConfirmationModal
                show={confirmationModal}
                text={SELECT_BU}
                handleClose={() => {
                    setConfimrationModal(false);
                }}
                handleConfirm={() => {
                    setConfimrationModal(false);
                }}
                secondaryButton={false}
            />
        </>
        //     </div>
        // </div>
    );
};

export default Notification;
