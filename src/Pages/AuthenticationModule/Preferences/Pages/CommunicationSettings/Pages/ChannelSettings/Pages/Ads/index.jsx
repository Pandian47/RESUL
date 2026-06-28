import { getUserDetails } from 'Utils/modules/crypto';
import { SELECT_BU } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import RSTabbar from 'Components/RSTabber/index';
import useQueryParams from 'Hooks/useQueryParams';
import { ADS_TABBER_CONFIG } from '../../constant';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';

import RSConfirmationModal from 'Components/ConfirmationModal';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
const Ads = () => {
    const location = useQueryParams('/communication');
    const dispatch = useDispatch();
    const { state } = useLocation();
    const [tabState, setTabState] = useState(0);
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

    return (
        <>
            {departmentName?.toLowerCase() === 'all' && licenseTypeId === '3' ? (
                <div className="d-flex flex-column adsdatabar">
                    <RSSkeletonTable text={true} message={'No data available'} count={5} />
                </div>
            ) : (
                <RSTabbar
                    dynamicTab={`rs-sub-tabs rs-cc-sub-tabs pref-tabber`}
                    activeClass={`active`}
                    defaultTab={tabState}
                    tabData={ADS_TABBER_CONFIG}
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
    );
};

export default Ads;
