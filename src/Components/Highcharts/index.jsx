import { ListAqusitionSekelton } from 'Components/Skeleton/Skeleton';
import { circle_info_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, forwardRef, memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import RSTooltip from 'Components/RSTooltip';
import { formatPercentageDisplay } from 'Utils/modules/formatters';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMore from 'highcharts/highcharts-more.js';
import Highcharts3d from 'highcharts/highcharts-3d.js';
import variablePieModule from 'highcharts/modules/variable-pie.js';
import solidGaugeModule from 'highcharts/modules/solid-gauge.js';
import sankeyModule from 'highcharts/modules/sankey.js';
import mapModule from 'highcharts/modules/map.js';
import boostModule from 'highcharts/modules/boost.js';
import sonificationModule from 'highcharts/modules/sonification.js';
import annotationsModule from 'highcharts/modules/annotations.js';
import cylinderModule from 'highcharts/modules/cylinder.js';
import funnel3dModule from 'highcharts/modules/funnel3d.js';
import accessibilityModule from 'highcharts/modules/accessibility.js';
import funnelModule from 'highcharts/modules/funnel.js';
import treemapModule from 'highcharts/modules/treemap.js';
import heatmapModule from 'highcharts/modules/heatmap.js';
import sunburstModule from 'highcharts/modules/sunburst.js';

// require("highcharts/highcharts-more.js")(Highcharts);
// require("highcharts/modules/variable-pie.js")(Highcharts);
// require("highcharts/modules/solid-gauge.js")(Highcharts);
// require("highcharts/modules/funnel.js")(Highcharts);
// require("highcharts/modules/sankey.js")(Highcharts);
// require("highcharts/modules/map")(Highcharts);

import COMMON_OPTIONS, { configureHighchartsDefaults } from './commonOptions';
import {
    PieChartSkeleton,
    BubbleChartSkeleton,
    HorizontalSkeleton,
    ColumnChartSkeleton,
    ColumnChartSkeletonNew,
    PerformanceBenchmarkSkeleton,
    MapChartSkeleton,
    PathtoConversionColumnSkeleton,
    SankeyHorizontalSkeleton,
} from 'Components/Skeleton/Skeleton';

const resolveModuleDefault = (module) => module?.default ?? module;

/** Factory modules call (Highcharts); HC 12 side-effect modules export the namespace — skip calling. */
const applyHighchartsModule = (module, Highcharts) => {
    const init = resolveModuleDefault(module);
    if (typeof init === 'function') {
        init(Highcharts);
    }
};

const buildChartOptions = (options) =>
    Highcharts.merge(COMMON_OPTIONS, {
        accessibility: {
            enabled: false,
        },
        plotOptions: {
            ...COMMON_OPTIONS.plotOptions,
            series: {
                ...COMMON_OPTIONS.plotOptions?.series,
                animation: false,
                enableMouseTracking: true,
                turboThreshold: 1000,
            },
            // Allow pie charts to keep their custom entrance animation
            // (pieChartOptions sets plotOptions.pie.animation which takes precedence over plotOptions.series.animation)
        },
        boost: {
            enabled: true,
            useGPUTranslations: true,
            usePreallocated: true,
        },
        ...options,
    });

let isHighchartsInitialized = false;

const initializeHighcharts = () => {
    if (isHighchartsInitialized) {
        return;
    }

    if (typeof window !== 'undefined') {
        window.Highcharts = Highcharts;
    }

    // highcharts-more must be applied before solid-gauge and other dependent modules
    [
        HighchartsMore,
        Highcharts3d,
        variablePieModule,
        solidGaugeModule,
        cylinderModule,
        funnelModule,
        funnel3dModule,
        sankeyModule,
        mapModule,
        annotationsModule,
        treemapModule,
        heatmapModule,
        sunburstModule,
        boostModule,
        accessibilityModule,
        sonificationModule,
    ].forEach((module) => applyHighchartsModule(module, Highcharts));

    configureHighchartsDefaults(Highcharts);
    isHighchartsInitialized = true;
};

initializeHighcharts();

const RSHighchartsContainer = forwardRef(({
    constructorType = '',
    options,
    type,
    count,
    isError,
    width = null,
    height = '100%',
    skeletonHeight = null,
    pClassName,
    className = '',
    chartCore,
    smallText,
    footerPercent,
    footerText,
    content,
    isDataStorage=false,
    isCommunicationSent=false,
    isCustomStyle=false,
    onDataStorageClick,
    isDashboard=false
}, ref) => {
    const navigate = useNavigate();
    const chartRef = useRef(null);
    const handleCommunicationSentClick = () => {
        navigate('/preferences/consumptions/csv-report');
    };
    const hasData = useMemo(() => {
        if (!options?.series || !Array.isArray(options.series) || options.series.length === 0) {
            return false;
        }
        // Exclude the decorative 'shadow' series from the data availability validation
        const dataSeries = options.series.filter(s => s?.name !== 'shadow');
        return dataSeries.some(s => Array.isArray(s?.data) && s.data.length > 0);
    }, [options]);

    const chartOptions = useMemo(() => buildChartOptions(options), [options]);
    const isdataAvailable = chartOptions?.series?.some((seriesItem) => seriesItem?.name !== 'shadow' && seriesItem?.data?.length > 0);
    const [rerender, setRerender] = useState(false);

    const setChartRefs = useCallback(
        (instance) => {
            chartRef.current = instance;
            if (typeof ref === 'function') {
                ref(instance);
            } else if (ref) {
                ref.current = instance;
            }
        },
        [ref],
    );

    const handleChartCallback = useCallback((chart) => {
        if (!chart || typeof chart.reflow !== 'function') {
            return;
        }

        try {
            chart.reflow();
        } catch {
            return;
        }

        requestAnimationFrame(() => {
            try {
                chart?.reflow?.();
            } catch {
            }
        });
    }, []);

    const onMouseLeave = useCallback(() => {
        if (constructorType === 'mapChart') {
            setRerender(true);
            setTimeout(() => {
                setRerender(false);
            }, 10);
        }
    }, [constructorType]);

    useLayoutEffect(() => {
        const chart = chartRef.current?.chart;
        if (!chart || typeof chart.reflow !== 'function') {
            return;
        }

        try {
            chart.reflow();
        } catch {
            return;
        }

        const reflowTimer = requestAnimationFrame(() => {
            try {
                chartRef.current?.chart?.reflow?.();
            } catch {
            }
        });

        return () => cancelAnimationFrame(reflowTimer);
    }, [chartOptions, constructorType]);

    return (
        <div className={`${chartCore ? '' : 'portlet-chart'} ${pClassName}`} onMouseLeave={onMouseLeave}>
            <div style={{ width: width !== null && width, height: height }} className={className}>
                {!hasData ? (
                    <>
                        {Array(count || 1)
                            .fill(0)
                            .map((_, index) => {
                                return <Fragment key={index}>{chartType(type, isError || true, skeletonHeight, isDashboard)}</Fragment>;
                            })}
                    </>
                ) : !HighchartsReact ? (
                    <>
                        {Array(count || 1)
                            .fill(0)
                            .map((_, index) => {
                                return <Fragment key={index}>{chartType(type, isError, skeletonHeight, isDashboard)}</Fragment>;
                            })}
                    </>
                ) : (
                    <>
                        {rerender ? null : (
                            <>
                                <HighchartsReact
                                    ref={setChartRefs}
                                    highcharts={Highcharts}
                                    constructorType={constructorType || 'chart'}
                                    options={chartOptions}
                                    callback={handleChartCallback}
                                />
                                {(footerPercent || footerText) && (
                                    <div className="portlet-footer portlet-two-label">
                                        <ul>
                                            <li>
                                                <span>{formatPercentageDisplay(footerPercent) || 0}</span>
                                                <small>%</small>
                                            </li>
                                            <li>{footerText}</li>
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
                {content && <small className="portlet-info-text">Day-wise unique audience</small>}
                {isDataStorage && (
                    <RSTooltip text='Detail view' position='top' className={`position-absolute cp align-items-end ${isCustomStyle ? 'bottom0 right5': 'right20'}`}>
                        <span  onClick={onDataStorageClick}>
                            <i className={`${circle_info_medium} icon-md color-primary-blue`}/>
                        </span>
                    </RSTooltip>
                )}
                 {isCommunicationSent && (
                    <RSTooltip text='Communication sent' position='top' className='position-absolute right5 mt-5 cp'>
                        <span  onClick={handleCommunicationSentClick}>
                            <i className={`${circle_info_medium} icon-md color-primary-blue`}/>
                        </span>
                    </RSTooltip>
                )}
            </div>
            {(chartOptions?.series?.length > 0 && isdataAvailable) && smallText && <small className="portlet-info-text">{smallText}</small>}
        </div>
    );
});

RSHighchartsContainer.displayName = 'RSHighchartsContainer';

RSHighchartsContainer.propTypes = {
    constructorType: PropTypes.string,
    options: PropTypes.object.isRequired,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
    height: PropTypes.string,
    className: PropTypes.string,
};

export default memo(RSHighchartsContainer);

export const chartType = (type, isError, skeletonHeight = null, isDashboard = false) => {
    switch (type) {
        case 'pie':
            return <PieChartSkeleton isError={isError} />;
        case 'bubble':
            return <BubbleChartSkeleton isError={isError} />;
        case 'column':
            return <HorizontalSkeleton isError={isError} />;
        case 'columnChart':
            return isError
                ? <ListAqusitionSekelton isError isChartSkeleton isCustom disableLegendAnimation />
                : <ColumnChartSkeleton isError={isError} />;
        case 'columnChartNew':
            return <ColumnChartSkeletonNew isError={isError} />;
        case 'benchMark':
            return <PerformanceBenchmarkSkeleton isError={isError} />;
        case 'area':
            return <ListAqusitionSekelton isError={isError} isChartSkeleton isCustom disableLegendAnimation={isError} />;
        case 'gauge':
            return <PieChartSkeleton isError={isError} noLegend />;
        case 'map':
            return <MapChartSkeleton isError={isError} />;
        case 'pathToConversion':
            return <PathtoConversionColumnSkeleton isError={isError} />;
        case 'sankey':
            return <SankeyHorizontalSkeleton isError={isError} />;
        case 'listAcquisitionCompact':
            return <ListAqusitionSekelton isError={isError} isChartSkeleton={true} isCustom disableLegendAnimation={isError} height={skeletonHeight} isCommunicationSent={isDashboard}/>;
        case 'LIST_ACTIVITY':
        case 'LIST_ACQUISITION':
        case 'LIST_ACQUISITION ':
        case 'LIST_ATTRITION':
            return <ListAqusitionSekelton isError={isError} isChartSkeleton={true} height={skeletonHeight} />;
        default:
            return <HorizontalSkeleton isError={isError} className="m0"/>;
    }
};
