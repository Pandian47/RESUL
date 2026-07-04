export const MIN_DATE_LABEL_WIDTH = 155;
export const MAX_DATE_LABELS = 12;
export const MIN_X_AXIS_LABELS = 2;
export const X_AXIS_LABEL_GAP = 24;

export const getMaxLabelsForAxisWidth = (axisWidth = 0) => {
    const safeWidth = axisWidth > 0 ? axisWidth : 720;
    const slotWidth = MIN_DATE_LABEL_WIDTH + X_AXIS_LABEL_GAP;
    const labelCount = Math.floor((safeWidth + X_AXIS_LABEL_GAP) / slotWidth);
    return Math.max(
        MIN_X_AXIS_LABELS,
        Math.min(MAX_DATE_LABELS, labelCount),
    );
};

/** Pick up to maxCount evenly spaced items — works for timestamps and category indices. */
export const getEvenlySpacedItems = (items, maxCount) => {
    if (!items?.length) return [];
    if (items.length === 1) return [items[0]];
    const labelCount = Math.min(maxCount, items.length);
    if (labelCount <= 1) return [items[0]];
    const result = [];
    for (let i = 0; i < labelCount; i++) {
        result.push(items[Math.round((i * (items.length - 1)) / (labelCount - 1))]);
    }
    return [...new Set(result)];
};

/** Drop the right-edge tick when it matches the axis max — avoids clipped last date label. */
export const omitLastEdgeTick = (ticks, lastValue) => {
    if (!ticks?.length || ticks.length <= 1 || lastValue == null) return ticks ?? [];
    if (ticks[ticks.length - 1] === lastValue) {
        return ticks.slice(0, -1);
    }
    return ticks;
};

/** Evenly spaced category indices — count adapts to available axis width. */
export const getAxisLabelIndices = (categoryCount, maxLabels = MAX_DATE_LABELS) => {
    if (!categoryCount || categoryCount <= 0) return [];
    const indices = Array.from({ length: categoryCount }, (_, i) => i);
    const ticks = getEvenlySpacedItems(indices, maxLabels);
    return omitLastEdgeTick(ticks, categoryCount - 1);
};

/** Highcharts tickPositioner for category axes with width-based date label thinning. */
export const createCategoryAxisTickPositioner = (categoryCount) =>
    function categoryAxisTickPositioner() {
        const count = this.categories?.length ?? categoryCount;
        const maxLabels = getMaxLabelsForAxisWidth(this.len);
        const min = Math.ceil(this.min ?? 0);
        const max = Math.floor(this.max ?? count - 1);
        const visibleIndices = Array.from(
            { length: Math.max(1, max - min + 1) },
            (_, i) => min + i,
        );
        const ticks = getEvenlySpacedItems(visibleIndices, maxLabels);
        return omitLastEdgeTick(ticks, max);
    };
