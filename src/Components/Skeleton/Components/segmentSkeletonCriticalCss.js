import { SKELETON_BG, SKELETON_BG_MUTED } from './segmentSkeletonUtils';
export const segmentSkeletonCriticalCss = `
.tl-segment-create-skeleton,
.tl-segment-attributes-skeleton {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow: visible;
}
.tl-segment-create-skeleton-span-con {
    height: auto;
    min-height: 0;
    overflow: visible;
}
.tl-segment-create-skeleton .skeleton-shimmer,
.tl-segment-attributes-skeleton .skeleton-shimmer {
    display: inline-block;
    vertical-align: middle;
    background-color: ${SKELETON_BG};
    border-radius: 4px;
    flex-shrink: 0;
}
.tl-segment-create-skeleton .skeleton-shimmer::after,
.tl-segment-attributes-skeleton .skeleton-shimmer::after {
    display: none !important;
    animation: none !important;
}
.tl-segment-skeleton--static .skeleton-shimmer {
    background-color: ${SKELETON_BG_MUTED};
}
.tl-segment-create-skeleton__card {
    position: relative;
    background: #fff;
    border-radius: 8px !important;
    border: 1px dashed #0000ff !important;
    padding: 7px 20px 20px 15px;
    box-shadow: none !important;
    min-height: 195px;
    width: 100%;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
    overflow: visible;
}
.tl-segment-create-skeleton__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
    min-width: 0;
    margin-bottom: 20px;
    box-sizing: border-box;
}
.tl-segment-create-skeleton__header-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}
.tl-segment-create-skeleton__center {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
}
.tl-segment-create-skeleton__plus {
    position: absolute;
    bottom: 0;
    right: -35px;
    z-index: 10;
}
.tl-segment-attributes-skeleton__toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
.tl-segment-attributes-skeleton__toolbar-left {
    display: flex;
    align-items: center;
    gap: 8px;
}
.tl-segment-attributes-skeleton__card {
    position: relative;
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    min-height: 400px;
    overflow: hidden;
    box-sizing: border-box;
}
.tl-segment-attributes-skeleton__expand-icon {
    position: absolute;
    top: 3px;
    right: 15px;
}
.tl-segment-attributes-skeleton__group {
    margin-bottom: 11px;
}
.tl-segment-attributes-skeleton__group--first {
    margin-top: 37px;
}
.tl-segment-attributes-skeleton__group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding:10px;
    background-color: #f4f4f4;
    margin-bottom: 15px;
}
.tl-segment-attributes-skeleton__group-title {
    display: flex;
    align-items: center;
    gap: 8px;
}
.tl-segment-attributes-skeleton__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
}
`;
