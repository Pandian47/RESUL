import { memo } from 'react';
import PropTypes from 'prop-types';

import { RSPageHeaderSkeleton } from '../../Components/common';

/** Matches RSPageHeader on Target list create — medium title + BU / dept / Back. */
const TargetListCreationPageHeaderSkeleton = ({ titleWidth = 165 }) => (
    <RSPageHeaderSkeleton
        variant="targetListCreation"
        titleWidth={titleWidth}
        className="target-list-creation-page-header-skeleton"
    />
);

TargetListCreationPageHeaderSkeleton.propTypes = {
    titleWidth: PropTypes.number,
};

export default memo(TargetListCreationPageHeaderSkeleton);
