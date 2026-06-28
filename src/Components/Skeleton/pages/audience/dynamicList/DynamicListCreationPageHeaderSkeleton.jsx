import { memo } from 'react';
import PropTypes from 'prop-types';

import { RSPageHeaderSkeleton } from '../../../Components/common';

/** Matches RSPageHeader on Dynamic list create — title shimmer + BU / dept / Back. */
const DynamicListCreationPageHeaderSkeleton = ({ titleWidth = 175 }) => (
    <RSPageHeaderSkeleton
        variant="dynamicListCreation"
        titleWidth={titleWidth}
        className="dynamic-list-creation-page-header-skeleton"
    />
);

DynamicListCreationPageHeaderSkeleton.propTypes = {
    titleWidth: PropTypes.number,
};

export default memo(DynamicListCreationPageHeaderSkeleton);
