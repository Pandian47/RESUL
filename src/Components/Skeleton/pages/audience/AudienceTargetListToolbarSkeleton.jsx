import { memo } from 'react';
const SKELETON_BG = '#e2e7ee';

export const audienceTargetListToolbarCriticalCss = `
.aud-sk-target-list-toolbar-skeleton {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    max-width: 100%;
    margin: var(--pageButtonTopSpace, 21px) 0;
    box-sizing: border-box;
}
.aud-sk-target-list-toolbar-skeleton .aud-sk-target-list-toolbar-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    gap: 15px;
}
.aud-sk-target-list-toolbar-skeleton .aud-sk-block {
    flex-shrink: 0;
}
`;

const skeletonBlockStyle = ({ width, height, circle = false, radius = 4 }) => ({
    width,
    height,
    backgroundColor: SKELETON_BG,
    borderRadius: circle ? '50%' : radius,
});

const AudienceTargetListToolbarSkeleton = ({ injectCriticalCss = true }) => (
    <div className="aud-sk-target-list-toolbar-skeleton" aria-hidden="true">
        {injectCriticalCss ? <style>{audienceTargetListToolbarCriticalCss}</style> : null}
        <div className="aud-sk-target-list-toolbar-actions">
            <div className="aud-sk-block" style={skeletonBlockStyle({ width: 200, height: 32, radius: 4 })} />
            <div className="aud-sk-block" style={skeletonBlockStyle({ width: 280, height: 32, radius: 4 })} />
            <div className="aud-sk-block" style={skeletonBlockStyle({ width: 32, height: 32, circle: true })} />
            <div className="aud-sk-block" style={skeletonBlockStyle({ width: 32, height: 32, circle: true })} />
        </div>
    </div>
);

export default memo(AudienceTargetListToolbarSkeleton);
