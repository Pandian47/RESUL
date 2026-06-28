import { memo } from 'react';
import PropTypes from 'prop-types';

import AuthoringChannelEditSkeletonHost from './authoringChannelInnerSkeletonLayouts';

/**
 * SDC + MDC channel tabs: show shared inner skeleton while edit APIs load.
 * Route shells (vertical tabs vs MDC-only) stay separate — only inner form uses Host.
 */
const AuthoringChannelEditSkeletonGate = ({
    channelId,
    innerVariant,
    isLoading: isLoadingProp,
    showEditSkeleton,
    children,
}) => {
    const isLoading = typeof isLoadingProp === 'boolean' ? isLoadingProp : Boolean(showEditSkeleton);

    if (isLoading) {
        return <AuthoringChannelEditSkeletonHost channelId={channelId} innerVariant={innerVariant} />;
    }

    return children;
};

AuthoringChannelEditSkeletonGate.propTypes = {
    channelId: PropTypes.number.isRequired,
    innerVariant: PropTypes.string,
    isLoading: PropTypes.bool,
    showEditSkeleton: PropTypes.bool,
    checkSave: PropTypes.bool,
    isSavedChannel: PropTypes.bool,
    children: PropTypes.node,
};

export default memo(AuthoringChannelEditSkeletonGate);
