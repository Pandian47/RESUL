import { memo } from 'react';
import PropTypes from 'prop-types';

import CommunicationCreationDeliverySkeleton from './CommunicationCreationDeliverySkeleton';

/**
 * @deprecated Use CommunicationCreationDeliverySkeleton — keeps tab + panel in RSTabbar layout.
 */
const DeliveryMethodTabsSkeleton = ({ activeTabIndex = 0, deliveryType = 'single' }) => (
    <CommunicationCreationDeliverySkeleton activeTabIndex={activeTabIndex} deliveryType={deliveryType} />
);

DeliveryMethodTabsSkeleton.propTypes = {
    activeTabIndex: PropTypes.number,
    deliveryType: PropTypes.oneOf(['single', 'event', 'multi']),
};

export default memo(DeliveryMethodTabsSkeleton);
