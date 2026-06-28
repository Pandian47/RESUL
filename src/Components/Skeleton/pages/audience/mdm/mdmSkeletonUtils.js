export const SKELETON_BG = '#e2e7ee';
export const SKELETON_BORDER = '#c2cfe3';
export const AXIS_COLOR = '#e9e9e9';
export const GRID_BLUE_HEADER = '#0043ff';
export const GRID_BORDER = '#c2cfe3';
export const GRID_ROW_ALT = '#f0f8ff';

/** Bubble positions centered around 50%/50% within the chart area. */
export const BUBBLE_PLACEHOLDERS = [
    { left: '22%', top: '57%', width: 115, height: 115 },
    { left: '34%', top: '32%', width: 80, height: 80 },
    { left: '78%', top: '46%', width: 70, height: 70 },
    { left: '40%', top: '73%', width: 120, height: 120 },
    { left: '60%', top: '60%', width: 120, height: 120 },
    { left: '46%', top: '43%', width: 95, height: 95 },
    { left: '62%', top: '28%', width: 98, height: 98 },
];

export const skeletonBlockStyle = ({ width, height, circle = false, radius = 4, flex }) => ({
    width,
    height,
    flex,
    backgroundColor: SKELETON_BG,
    borderRadius: circle ? '50%' : radius,
});
