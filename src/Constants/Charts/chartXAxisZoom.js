/** Shared x-axis zoom config for analytics trend charts (HC 10 + HC 11 compatible). */
const wheelHandlers = new WeakMap();

const ZOOM_FACTOR_IN = 0.85;
const ZOOM_FACTOR_OUT = 1.15;
const MIN_CATEGORY_RANGE = 2;

export const RESET_ZOOM_BORDER_COLOR = '#c2cfe3';

const getXAxisDataBounds = (xAxis) => {
    const isDatetime = xAxis.options?.type === 'datetime';
    const dataMin = isDatetime ? xAxis.dataMin : 0;
    const dataMax = isDatetime
        ? xAxis.dataMax
        : Math.max(0, (xAxis.categories?.length ?? 1) - 1);

    return { isDatetime, dataMin, dataMax };
};

const getChartMountElement = (chart) => {
    const renderTo = chart?.renderTo;
    if (!renderTo?.parentElement) return null;

    const mount = renderTo.parentElement;
    if (!mount.classList.contains('chart-zoom-mount')) {
        mount.classList.add('chart-zoom-mount');
    }
    return mount;
};

const destroyDefaultResetZoomButton = (chart) => {
    if (chart?.resetZoomButton) {
        chart.resetZoomButton.destroy();
        chart.resetZoomButton = undefined;
    }
    if (chart?.customResetZoomButton) {
        chart.customResetZoomButton.destroy();
        chart.customResetZoomButton = undefined;
    }
};

const hideCustomResetZoomButton = (chart) => {
    if (chart?.customResetZoomDomBtn) {
        chart.customResetZoomDomBtn.style.display = 'none';
    }
};

const ensureCustomResetZoomButton = (chart) => {
    destroyDefaultResetZoomButton(chart);

    const mount = getChartMountElement(chart);
    if (!mount) return;

    if (!chart.customResetZoomDomBtn) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'custom-reset-zoom-dom-btn';
        btn.textContent = 'Reset zoom';
        btn.setAttribute('aria-label', 'Reset zoom');
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (typeof chart.zoomOut === 'function') {
                chart.zoomOut();
            } else {
                chart.xAxis?.[0]?.setExtremes(
                    undefined,
                    undefined,
                    true,
                    false,
                    { trigger: 'zoom' },
                );
            }
            hideChartResetZoom(chart, chart.xAxis?.[0]);
        });
        mount.appendChild(btn);
        chart.customResetZoomDomBtn = btn;
    }

    chart.customResetZoomDomBtn.style.display = 'inline-flex';
};

const showChartResetZoom = (chart, xAxis) => {
    if (!chart || !xAxis) return;
    xAxis.displayBtn = true;
    ensureCustomResetZoomButton(chart);
};

const hideChartResetZoom = (chart, xAxis) => {
    if (xAxis) {
        xAxis.displayBtn = false;
    }
    destroyDefaultResetZoomButton(chart);
    hideCustomResetZoomButton(chart);
};

const applyXAxisZoom = (chart, xAxis, newMin, newMax) => {
    const isCategory = xAxis.options?.type === 'category';

    if (isCategory) {
        xAxis.setExtremes(
            Math.max(0, Math.floor(newMin)),
            Math.min(getXAxisDataBounds(xAxis).dataMax, Math.ceil(newMax)),
            true,
            false,
            { trigger: 'zoom' },
        );
    } else {
        xAxis.setExtremes(newMin, newMax, true, false, { trigger: 'zoom' });
    }

    showChartResetZoom(chart, xAxis);
};

const resetXAxisZoom = (chart, xAxis) => {
    if (typeof chart?.zoomOut === 'function') {
        chart.zoomOut();
        return;
    }

    xAxis?.setExtremes(undefined, undefined, true, false, { trigger: 'zoom' });
    hideChartResetZoom(chart, xAxis);
};

export const attachMouseWheelXZoom = (chart) => {
    const container = chart?.container;
    if (!container || wheelHandlers.has(chart)) return;

    const handler = (event) => {
        const xAxis = chart.xAxis?.[0];
        if (!xAxis) return;

        event.preventDefault();
        event.stopPropagation();

        const { dataMin, dataMax } = getXAxisDataBounds(xAxis);
        if (dataMin == null || dataMax == null) return;

        const min = xAxis.min ?? dataMin;
        const max = xAxis.max ?? dataMax;
        const range = max - min;
        if (range <= 0) return;

        const zoomIn = event.deltaY < 0;
        const fullRange = dataMax - dataMin;
        let newRange = range * (zoomIn ? ZOOM_FACTOR_IN : ZOOM_FACTOR_OUT);

        if (newRange >= fullRange) {
            resetXAxisZoom(chart, xAxis);
            return;
        }

        const minRange = xAxis.options?.type === 'datetime' ? fullRange / 50 : MIN_CATEGORY_RANGE;
        newRange = Math.max(minRange, newRange);

        const center = (min + max) / 2;
        let newMin = center - newRange / 2;
        let newMax = center + newRange / 2;

        if (newMin < dataMin) {
            newMax += dataMin - newMin;
            newMin = dataMin;
        }
        if (newMax > dataMax) {
            newMin -= newMax - dataMax;
            newMax = dataMax;
        }

        applyXAxisZoom(chart, xAxis, newMin, newMax);
    };

    container.addEventListener('wheel', handler, { passive: false });
    wheelHandlers.set(chart, handler);
};

export const detachMouseWheelXZoom = (chart) => {
    const handler = wheelHandlers.get(chart);
    if (handler && chart?.container) {
        chart.container.removeEventListener('wheel', handler);
        wheelHandlers.delete(chart);
    }
    if (chart?.customResetZoomDomBtn) {
        chart.customResetZoomDomBtn.remove();
        chart.customResetZoomDomBtn = undefined;
    }
};

/** Chart-level options when enableXAxisZoom prop is true. */
export const getChartXAxisZoomOptions = () => ({
    zoomType: 'x',
    spacingTop: 25,
    zooming: {
        mouseWheel: {
            type: 'x',
            showResetButton: false,
        },
    },
    resetZoomButton: {
        theme: {
            style: {
                display: 'none',
            },
        },
    },
});

export const mergeChartZoomEvents = (existingEvents = {}, onLoad, onDestroy) => ({
    ...existingEvents,
    load: function (...loadArgs) {
        existingEvents.load?.apply(this, loadArgs);
        onLoad?.apply(this, loadArgs);
    },
    redraw: function (...redrawArgs) {
        existingEvents.redraw?.apply(this, redrawArgs);
        destroyDefaultResetZoomButton(this);
    },
    destroy: function (...destroyArgs) {
        onDestroy?.apply(this, destroyArgs);
        if (this.customResetZoomDomBtn) {
            this.customResetZoomDomBtn.remove();
            this.customResetZoomDomBtn = undefined;
        }
        destroyDefaultResetZoomButton(this);
        existingEvents.destroy?.apply(this, destroyArgs);
    },
    selection: function (event) {
        if (event?.xAxis?.length) {
            const xAxis = this.xAxis?.[0];
            if (xAxis) {
                showChartResetZoom(this, xAxis);
            }
        }
        existingEvents.selection?.apply(this, arguments);
    },
});
