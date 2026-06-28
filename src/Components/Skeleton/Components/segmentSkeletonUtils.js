export const SKELETON_BG = '#e2e7ee';
export const SKELETON_BG_MUTED = '#e0e5eb';

export const skeletonBarStyle = ({ width, height, circle = false, radius = 4 }) => ({
    width,
    height,
    backgroundColor: SKELETON_BG,
    borderRadius: circle ? '50%' : radius,
});

export const ATTRIBUTE_TAG_WIDTHS = [70, 140, 80, 50, 40, 80, 50, 40,80, 50, 40, 80, 50];
export const ATTRIBUTE_GROUP_COUNT = 3;
