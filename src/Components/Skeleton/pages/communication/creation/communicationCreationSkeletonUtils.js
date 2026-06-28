/** Plan flow: type selection vs delivery form (matches Planning + DeliveryMethod). */
export const COMMUNICATION_CREATION_SKELETON_PHASE = {
    SELECT_TYPE: 'selectType',
    DELIVERY: 'delivery',
};

/**
 * Create without `?q` → type cards. Edit / refresh with `?q` → delivery form + tabs.
 * @param {string} search - `location.search`
 */
export const getCommunicationCreationSkeletonPhase = (search = '') => {
    const params = new URLSearchParams(search || '');
    if (params.has('q')) {
        return COMMUNICATION_CREATION_SKELETON_PHASE.DELIVERY;
    }
    return COMMUNICATION_CREATION_SKELETON_PHASE.SELECT_TYPE;
};

/** Map plan tab index / name to DeliveryMethod skeleton variant. */
export const getDeliverySkeletonTypeFromTab = (currentTab) => {
    if (currentTab === 1 || currentTab === 'Multi dimension') {
        return 'multi';
    }
    if (currentTab === 2 || currentTab === 'Event trigger') {
        return 'event';
    }
    return 'single';
};
