import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { ReachChannelSkeleton } from 'Components/Skeleton/Skeleton';
import { mapChartOptions } from 'Constants/Charts';
import { Col } from 'react-bootstrap';
import { map as _map } from 'Utils/modules/lodashReplacements';

import RSHighchartsContainer from 'Components/Highcharts';
import { useSelector } from 'react-redux';
import { getGeographyList } from 'Reducers/analyticsTwins/analyticsSummary/selector';


const Geography = ({ date }) => {
    const geography = useSelector((state) => getGeographyList(state));
    const { list = [], lastJobTime = new Date() } = geography;

    const geographySeries = _map(list, (series) => ({
        zoomLevel: 15,
        country: series.country,
        state: series.city,
        lat: series.latitude,
        lon: series.longitude,
        value: series.reachCount || 0,
    }));

    return (
        <Col md={6}>
            <div className="portlet-container portlet-sm">
                <div className="portlet-header">
                    <h4 className="mb0">Geography</h4>
                </div>
                <div className="portlet-body">
                    {!!geography?.list && geography?.list?.length !== 0 ? (
                        <div className="portlet-chart geo-graph-map">
                            <RSHighchartsContainer
                                key={'location'}
                                // smallText={`(As on : ${getUserDateTimeFormat(lastJobTime, 'formatDateTime')})`}
                                smallText={`(As on: ${getUserCurrentFormat(lastJobTime)?.dateTimeFormat})`}
                                constructorType="mapChart"
                                options={mapChartOptions(
                                    {
                                        height: 200,
                                        series: geographySeries,
                                    },
                                    'World',
                                    false,
                                )}
                            />
                            {/* <h1 className='geo-map-title font-bold'>{numberWithCommas(CampaignSummary.allAudienceCount)}</h1> */}
                            {/* {analysisChart(analysisTabIndex)} */}
                        </div>
                    ) : (
                        <ReachChannelSkeleton
                            className="mt-15"
                            isError={!!geography?.list && geography?.list?.length !== 0 ? false : true}
                        />
                    )}
                </div>
            </div>
        </Col>
    );
};

export default Geography;
