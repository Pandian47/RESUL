import { mapChartOptions } from 'Constants/Charts';
import { formatPercentageDisplay } from 'Utils/modules/formatters';
import { memo } from 'react';
import RSHighchartsContainer from 'Components/Highcharts';
import { MapChartSkeleton } from 'Components/Skeleton/Skeleton';

const MapChart = ({ title, chartData, footerPercent, footerText, isCustomFooter }) => {
    const geographySeries = {
        series: chartData?.series?.map((item) => ({
            country: item.country,
            zoomLevel: 15,
            state: item?.city,
            lat: item?.latitude,
            lon: item?.longitude,
            value: item?.count || 0,
        })),
    };

    return (
        <div className="portlet-container portlet-md pfooter">
            <div className="portlet-header">
                <h4>{title}</h4>
            </div>
            <div className="portlet-body">
                {!!chartData && chartData?.series?.length === 0 ? (
                    <MapChartSkeleton isError />
                ) : (
                    <RSHighchartsContainer
                        type="map"
                        constructorType="mapChart"
                        // options={mapChartOptions(chartData, 'World')}
                        options={mapChartOptions({ series: geographySeries?.series }, 'World', false)}
                    />
                )}
            </div>
            {!!chartData && chartData?.series?.length === 0 ? null : (
                <div className="portlet-footer portlet-two-label">
                    <ul>
                        {footerPercent && !isCustomFooter && (
                            <li>
                                <span> {formatPercentageDisplay(footerPercent) || 0}</span>
                                <small>%</small>
                            </li>
                        )}
                        {footerText && !isCustomFooter && <li>{footerText}</li>}
                        {isCustomFooter && (
                            <li>
                                {footerText}(<span className="font-sm">{formatPercentageDisplay(footerPercent) || 0}</span>
                                <small className="font-xxs">%</small>)
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default memo(MapChart);
