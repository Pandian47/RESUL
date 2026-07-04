import PropTypes from 'prop-types';

import AudienceTargetListToolbarSkeleton, {
    audienceTargetListToolbarCriticalCss,
} from './AudienceTargetListToolbarSkeleton';
import SkeletonTargetListCard, {
    audienceTargetListCardCriticalCss,
} from '../../Components/SkeletonTargetListCard';
import AudienceMdmPanelSkeleton from './mdm/AudienceMdmPanelSkeleton';

export const audienceTargetListTabCriticalCss = `
.aud-sk-target-list-tab-skeleton {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
.aud-sk-target-list-cards-grid {
    display: grid;
    flex-wrap: wrap;
    width: 100%;
    margin: 0;
    box-sizing: border-box;
    gap: 20px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
}
`;

/** Tabs 1–2 — Target / Dynamic lists */
export const AudienceTargetListTabSkeleton = ({
    showToolbar = true,
    cardCount = 6,
    isNoDataAvailable = false,
}) => (
    <div className="aud-sk-target-list-tab-skeleton" aria-hidden="true">
        <style>
            {`${audienceTargetListTabCriticalCss}${audienceTargetListToolbarCriticalCss}${audienceTargetListCardCriticalCss}`}
        </style>
        {showToolbar ? <AudienceTargetListToolbarSkeleton injectCriticalCss={false} /> : null}
        <div className="aud-sk-target-list-cards-grid">
            {Array.from({ length: cardCount }, (_, idx) => (
                <SkeletonTargetListCard
                    key={idx}
                    index={idx}
                    isNoDataAvailable={isNoDataAvailable}
                    injectCriticalCss={false}
                />
            ))}
        </div>
    </div>
);

AudienceTargetListTabSkeleton.propTypes = {
    showToolbar: PropTypes.bool,
    cardCount: PropTypes.number,
    isNoDataAvailable: PropTypes.bool,
};

/** Tab 0 — MDM (pages/audience/mdm) */
export const AudienceMdmTabSkeleton = (props) => <AudienceMdmPanelSkeleton {...props} />;
