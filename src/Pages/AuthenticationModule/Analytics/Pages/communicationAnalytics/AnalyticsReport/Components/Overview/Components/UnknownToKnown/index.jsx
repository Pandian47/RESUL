import { pieChartOptions } from 'Constants/Charts';
import { useState } from 'react';
import { Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { map as _map } from 'Utils/modules/lodashReplacements';

import RSHighchartsContainer from 'Components/Highcharts';
import { getKnownToUnknown, getSummaryList } from 'Reducers/analytics/analyticsSummary/selector';
import { PieChartSkeleton } from 'Components/Skeleton/Skeleton';

const UnknownToKnown = ({ date }) => {
    const [selectedValue, setSelectedValue] = useState('Lead');
    const lead = []; //CampaignSummary.campaignUnknownToKnown;
    const customer = []; // CampaignSummary.campaignCustomerKnow;

    const knownToUnknown = useSelector((state) => getKnownToUnknown(state));
    const summary = useSelector((state) => getSummaryList(state));

    return (
        <Col md={6}>
            <div className="portlet-container portlet-sm">
                <div className="portlet-header">
                    <h4 className="mb0">Unknown to known conversion</h4>
                    {/* <BootstrapDropdown
                        data={['Lead', 'Customer']}
                        defaultItem={selectedValue}
                        customAlignRight={true}
                        alignRight
                        className=""
                        onSelect={(item, index) => {
                            setSelectedValue(item);
                        }}
                    /> */}
                </div>
                <div className="portlet-body">
                    <div className="portlet-chart">
                        {selectedValue === 'Lead' ? (
                            knownToUnknown?.length ? (
                                <RSHighchartsContainer
                                    smallText={`As on: (${date})`}
                                    options={pieChartOptions({
                                        height: 200,
                                        series: _map(knownToUnknown, ({ name, intValue: y }) => ({
                                            name,
                                            y,
                                        })),
                                    })}
                                />
                            ) : (
                                <PieChartSkeleton size={160} nodata={true} />
                            )
                        ) : customer?.length ? (
                            <RSHighchartsContainer
                                smallText={`As on: (${date})`}
                                options={pieChartOptions({
                                    height: 200,
                                    series: _map(customer, ({ name, color, intValue: y }) => ({
                                        name,
                                        color,
                                        y,
                                    })),
                                })}
                            />
                        ) : null}
                    </div>
                </div>
            </div>
        </Col>
    );
};

export default UnknownToKnown;
