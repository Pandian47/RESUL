import { getUserCurrentFormatWithoutYear } from 'Utils/modules/dateTime';
import RSTooltip from 'Components/RSTooltip';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { NoData } from 'Components/Skeleton/Skeleton';
const capitalizeStatusFirstLetter = (status) => {
    if (status == null || status === '') return '';
    const s = String(status);
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const getPipelineBarTooltipText = (item) => {
    const statusLabel = capitalizeStatusFirstLetter(item.Status ?? item.status);
    const base = `${item.dag_run_id} - ${statusLabel}`;
    const rawDesc = item?.ImportDescription ?? item?.importDescription;
    if (rawDesc == null) return base;
    const desc = String(rawDesc).trim();
    if (desc === '' || desc.toUpperCase() === 'NA') return base;
    return `${base}\n${desc}`;
};
const SCROLL_EDGE_EPS = 2;

const CustomBarChartView = ({ onItemClick, pipelineData, isLoading = false, centerBars = false }) => {
    const barsContainerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollState, setScrollState] = useState({
        canScroll: false,
        atStart: true,
        atEnd: true,
    });

    const onMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - barsContainerRef.current.offsetLeft);
        setScrollLeft(barsContainerRef.current.scrollLeft);
    };

    const onMouseLeave = () => {
        setIsDragging(false);
    };

    const onMouseUp = () => {
        setIsDragging(false);
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - barsContainerRef.current.offsetLeft;
        const walk = (x - startX) * 1.5; // Custom scroll speed multiplier
        barsContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const updateScrollState = useCallback(() => {
        const el = barsContainerRef.current;
        if (!el) return;
        const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
        const canScroll = maxScroll > SCROLL_EDGE_EPS;
        setScrollState({
            canScroll,
            atStart: el.scrollLeft <= SCROLL_EDGE_EPS,
            atEnd: el.scrollLeft >= maxScroll - SCROLL_EDGE_EPS,
        });
    }, []);

    const scrollChartPage = useCallback(
        (dir) => {
            const el = barsContainerRef.current;
            if (!el) return;
            const step = Math.max(120, Math.round(el.clientWidth * 0.75));
            const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
            const delta = dir === 'older' ? -step : step;
            const next = Math.max(0, Math.min(el.scrollLeft + delta, maxScroll));
            el.scrollTo({ left: next, behavior: 'smooth' });
        },
        [],
    );

    const legendItems = [
        { label: 'Success', color: 'success' },
        { label: 'Running', color: 'running' },
        { label: 'Failed', color: 'failed' },
        { label: 'Upstream_failed', color: 'upstream_failed' },
        { label: 'Skipped', color: 'skipped' },
        { label: 'Up_for_retry', color: 'up_for_retry' },
        { label: 'Up_for_reschedule', color: 'up_for_reschedule' },
        { label: 'Queued', color: 'queued' },
        { label: 'Scheduled', color: 'scheduled' },
        { label: 'Deferred', color: 'deferred' },
        { label: 'Removed', color: 'removed' },
        { label: 'Restarting', color: 'restarting' },
        { label: 'None', color: 'none' },
    ];

    const hasData = Array.isArray(pipelineData) && pipelineData.length > 0;
    const showSkeleton = isLoading || !hasData;
    const showNoData = !isLoading && !hasData;
    const skeletonHeights = [
        55, 28, 78, 40, 62, 32, 70, 46, 58, 36, 66, 30, 55, 28, 78, 40, 62, 32, 70, 46, 58, 70, 46, 58
    ];

    const presentStatuses = new Set(
        Array.isArray(pipelineData) ? pipelineData.map((item) => item.Status?.toLowerCase() || 'none') : []
    );
    const displayedLegendItems = hasData ? legendItems.filter((item) => presentStatuses.has(item.color)) : legendItems;

    const showCarouselControls = scrollState.canScroll && !centerBars && hasData && !isLoading;
    const showPrevNav = showCarouselControls && !scrollState.atStart;
    const showNextNav = showCarouselControls && !scrollState.atEnd;

    useEffect(() => {
        const el = barsContainerRef.current;
        if (!el) return undefined;
        const onScroll = () => updateScrollState();
        onScroll();
        el.addEventListener('scroll', onScroll, { passive: true });
        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onScroll) : null;
        ro?.observe(el);
        window.addEventListener('resize', onScroll);
        return () => {
            el.removeEventListener('scroll', onScroll);
            ro?.disconnect();
            window.removeEventListener('resize', onScroll);
        };
    }, [updateScrollState, pipelineData, centerBars, isLoading]);

    // Bars render oldest → newest (left → right). Default viewport shows the latest (right); user scrolls left for older runs.
    useLayoutEffect(() => {
        if (centerBars || isLoading || !hasData) return;
        const el = barsContainerRef.current;
        if (!el) return;
        const scrollToLatest = () => {
            el.scrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
        };
        scrollToLatest();
        const id = requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                scrollToLatest();
                updateScrollState();
            });
        });
        return () => cancelAnimationFrame(id);
    }, [pipelineData, isLoading, centerBars, hasData, updateScrollState]);

    return (
        <div className="chart-container">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            <div
                className={`chart-wrapper${
                    showCarouselControls ? ' rs-pipeline-bar-chart-carousel--scrollable' : ''
                }`}
            >
                {/* Y-Axis Labels */}
                <div className="y-axis-labels">
                    <span>100</span>
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>
                    <span>0</span>
                </div>

                {showPrevNav ? (
                    <button
                        type="button"
                        className="carousel-control-prev sync-history-chart-nav rs-pipeline-bar-chart-carousel__control"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            scrollChartPage('older');
                        }}
                        aria-label="Scroll to older pipeline runs"
                    >
                        <span className="carousel-control-prev-icon" aria-hidden />
                    </button>
                ) : null}
                {showNextNav ? (
                    <button
                        type="button"
                        className="carousel-control-next sync-history-chart-nav rs-pipeline-bar-chart-carousel__control"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            scrollChartPage('newer');
                        }}
                        aria-label="Scroll to newer pipeline runs"
                    >
                        <span className="carousel-control-next-icon" aria-hidden />
                    </button>
                ) : null}

                <div className="chart-bars-wrap">
                    <div
                        className="grid-lines"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: 'calc(100% - 35px)',
                            borderLeft: '1px solid #e2e8f0',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            pointerEvents: 'none',
                            zIndex: 0,
                        }}
                    >
                        <div
                            className="line"
                            style={{ width: '100%', borderTop: '1px solid #f1f5f9', height: 0 }}
                        ></div>
                        <div
                            className="line"
                            style={{ width: '100%', borderTop: '1px solid #f1f5f9', height: 0 }}
                        ></div>
                        <div
                            className="line"
                            style={{ width: '100%', borderTop: '1px solid #f1f5f9', height: 0 }}
                        ></div>
                        <div
                            className="line"
                            style={{ width: '100%', borderTop: '1px solid #f1f5f9', height: 0 }}
                        ></div>
                        <div
                            className="line"
                            style={{ width: '100%', borderTop: '1px solid #e2e8f0', height: 0 }}
                        ></div>
                    </div>
                    <ul
                        className="CustomBarChartViewCSS hide-scrollbar"
                        id="CustomBarChartViewJS"
                        ref={barsContainerRef}
                        onMouseDown={onMouseDown}
                        onMouseLeave={onMouseLeave}
                        onMouseUp={onMouseUp}
                        onMouseMove={onMouseMove}
                        style={{
                            flex: 1,
                            margin: 0,
                            padding: '0 10px 35px 10px',
                            boxSizing: 'border-box',
                            height: '100%',
                            overflowX: centerBars ? 'hidden' : 'auto',
                            overflowY: 'hidden',
                            border: 'none',
                            justifyContent: centerBars ? 'center' : 'flex-start',
                            gap: '25px',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            cursor: isDragging ? 'grabbing' : 'grab',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            userSelect: 'none',
                        }}
                    >
                        {showNoData && <NoData />}
                        {showSkeleton
                            ? skeletonHeights.map((h, idx) => (
                                <li
                                    key={`sk-${idx}`}
                                    className={`skeleton-bar ${!showNoData ? '' : 'no-data'}`}
                                    style={{ height: `${h}%`, flexShrink: 0, width: 23 }}
                                />
                            ))
                            : [...pipelineData].reverse().map((item) => (
                                <RSTooltip
                                    key={item.dag_run_id}
                                    text={getPipelineBarTooltipText(item)}
                                    innerContent={false}
                                >
                                    <li
                                        className={item.Status?.toLowerCase() || 'none'}
                                        style={{ height: `${item.barValue || 40}%`, flexShrink: 0, width: 23 }}
                                        onClick={() => onItemClick(item.dag_run_id)}
                                    >
                                        <a href="javascript:;">
                                            <span>
                                                {item.start_date
                                                    ? getUserCurrentFormatWithoutYear(item?.start_date)?.dateTimeFormat ?? ''
                                                    : 'NA'}
                                            </span>
                                        </a>
                                    </li>
                                </RSTooltip>
                            ))}
                    </ul>
                </div>
            </div>

            {/* Legend */}
            <div className="chart-legend">
                {showSkeleton
                    ? legendItems.map((item) => (
                        <div key={item.label} className="legend-item legend-skeleton">
                            <span className="legend-color"></span>
                            <span className="legend-label"></span>
                        </div>
                    ))
                    : displayedLegendItems.map((item) => (
                        <div key={item.label} className="legend-item">
                            <span className={`legend-color ${item.color}`}></span>
                            <span className="legend-label">{item.label}</span>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default CustomBarChartView;
