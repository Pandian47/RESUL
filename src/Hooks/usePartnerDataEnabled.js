import { getUserDetails } from 'Utils/modules/crypto';
import { useEffect, useState } from 'react';
const EVENT_PARTNER_DATA_ENABLED_UPDATED = 'partnerDataEnabledUpdated';

const resolvePartnerFlag = (details, departmentId) => {
    const partnerFlag = details?.isPartnerDataEnabled;
    if (partnerFlag != null && typeof partnerFlag === 'object' && !Array.isArray(partnerFlag)) {
        if (departmentId == null) return false;
        return partnerFlag?.[departmentId] === true;
    }
    return false;
};

 const usePartnerDataEnabled = (departmentId) => {
    const [isPartnerDataEnabled, setIsPartnerDataEnabled] = useState(() => {
        const details = getUserDetails();
        return resolvePartnerFlag(details, departmentId);
    });

    useEffect(() => {
        const details = getUserDetails();
        setIsPartnerDataEnabled(resolvePartnerFlag(details, departmentId));
    }, [departmentId]);

    useEffect(() => {
        const handler = (e) => {
            setIsPartnerDataEnabled(e?.detail === true);
        };
        window.addEventListener(EVENT_PARTNER_DATA_ENABLED_UPDATED, handler);
        return () => window.removeEventListener(EVENT_PARTNER_DATA_ENABLED_UPDATED, handler);
    }, []);

    return isPartnerDataEnabled;
};

export default usePartnerDataEnabled
