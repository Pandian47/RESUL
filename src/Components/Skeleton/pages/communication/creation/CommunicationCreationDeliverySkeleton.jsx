import { memo } from 'react';
import PropTypes from 'prop-types';

import { SkeletonShimmer } from 'Components/Skeleton/Components/common';
import DeliveryMethodSkeleton from '../../../Components/DeliveryMethodSkeleton';

const TAB_COUNT = 3;
const TAB_LABEL_WIDTHS = [88, 96, 80];

/**
 * Planning › delivery-method RSTabbar opened state — layout in critical CSS; shimmer via props.
 */
const CommunicationCreationDeliverySkeleton = ({ deliveryType = 'single', activeTabIndex = 0 }) => (
    <div className="cc-delivery-skeleton communication-creation-delivery-skeleton" aria-hidden="true">
        <div className="cc-delivery-skeleton__opened">
            <div className="cc-delivery-skeleton__header">
                <div className="cc-delivery-skeleton__label-col">
                    <div className="cc-delivery-skeleton__label-wrap">
                        <SkeletonShimmer className="cc-delivery-skeleton__section-label" width={120} height={24} />
                    </div>
                </div>
                <ul className="cc-delivery-skeleton__tab-list delivery-method-tabs-skeleton__tab-list">
                    {Array.from({ length: TAB_COUNT }, (_, index) => (
                        <li
                            key={index}
                            className={[
                                'cc-delivery-skeleton__tab',
                                'delivery-method-tabs-skeleton__tab',
                                index === activeTabIndex ? 'cc-delivery-skeleton__tab--active' : '',
                                index === 0 ? 'cc-delivery-skeleton__tab--first' : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            <div className="cc-delivery-skeleton__tab-inner">
                                <SkeletonShimmer
                                    className="cc-delivery-skeleton__tab-icon delivery-method-tabs-skeleton__icon-shimmer"
                                    width={42}
                                    height={42}
                                    marginBottom={6}
                                    variant = {'circle'}
                                />
                                <span className="cc-delivery-skeleton__tab-label-wrap">
                                    <SkeletonShimmer
                                        className="cc-delivery-skeleton__tab-label delivery-method-tabs-skeleton__label-shimmer"
                                        width={TAB_LABEL_WIDTHS[index]}
                                        height={15}
                                    />
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <DeliveryMethodSkeleton type={deliveryType} embed />
        </div>
    </div>
);

CommunicationCreationDeliverySkeleton.propTypes = {
    deliveryType: PropTypes.oneOf(['single', 'event', 'multi']),
    activeTabIndex: PropTypes.number,
};

export default memo(CommunicationCreationDeliverySkeleton);
