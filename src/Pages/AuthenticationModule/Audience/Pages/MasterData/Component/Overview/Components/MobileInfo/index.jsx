import { bubbleChartOptions, pieChartOptions } from 'Constants/Charts';
import { BY_DELIVERABILITY, BY_REGION, DISTRIBUTION_AND_DELIVERY } from 'Constants/GlobalConstant/Placeholders';
import { useMemo } from 'react';
import RSModal from 'Components/RSModal';
import { Col, Row } from 'react-bootstrap';

import RSHighchartsContainer from 'Components/Highcharts';

import { ensureObject, sanitizeMdmChartValue, sanitizeMdmMetric } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import { MDM_COUNT_LIST_SECTION_CONFIG } from 'Pages/AuthenticationModule/Audience/Pages/MasterData/constant';
import { MdmCountListSections } from '../CountListSection';

const MobileInfo = ({ show=false, handleClose=()=>{}, chartData = {}, chartType='' }) => {
    const countryInfo = ensureObject(chartData?.countryInfo);
    const mobileInfo = ensureObject(chartData?.mobileDeliveryInfo);
    const mobileRecipients = sanitizeMdmMetric(chartData?.mobileRecipients);

    const data = useMemo(() => {
        const tmpChartData = {};
        tmpChartData.series = Object.keys(countryInfo).map((domain) => ({
            name: domain,
            y: sanitizeMdmChartValue(countryInfo[domain]),
            value: sanitizeMdmChartValue(countryInfo[domain]),
        }));
        tmpChartData.angle = 90;
        return tmpChartData;
    }, [countryInfo]);

    return (
        <RSModal
            show={Boolean(show)}
            size="xxlg"
            handleClose={() => handleClose(false)}
            header={DISTRIBUTION_AND_DELIVERY}
            body={
                <div className="master-recip-data-popup">
                    <Row>
                        <Col md={6} className="">
                            {chartType === 'MultiChart' ? (
                                <RSHighchartsContainer options={bubbleChartOptions(data)} />
                            ) : (
                                <RSHighchartsContainer options={pieChartOptions(data)} />
                            )}
                        </Col>
                        <Col md={6} className="borderleft">
                            <MdmCountListSections
                                sections={[
                                    {
                                        title: BY_REGION,
                                        data: countryInfo,
                                        totalRecipients: mobileRecipients,
                                    },
                                    {
                                        title: BY_DELIVERABILITY,
                                        data: mobileInfo,
                                        totalRecipients: mobileRecipients,
                                        headingClassName: MDM_COUNT_LIST_SECTION_CONFIG.secondaryHeadingClassName,
                                    },
                                ]}
                            />
                        </Col>
                    </Row>
                </div>
            }
        />
    );
};

export default MobileInfo;
