import { pieChartOptions } from 'Constants/Charts';
import { BY_DELIVERABILITY, BY_DOMAIN, DOMAIN_AND_DELIVERIBILITY } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import RSModal from 'Components/RSModal';
import RSHighchartsContainer from 'Components/Highcharts';

import { ensureObject, sanitizeMdmChartValue, sanitizeMdmMetric } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import { MDM_COUNT_LIST_SECTION_CONFIG } from 'Pages/AuthenticationModule/Audience/Pages/MasterData/constant';
import { MdmCountListSections } from '../CountListSection';

const EmailInfo = ({ show = false, handleClose = ()=>{}, chartData = {}, chartType='' }) => {
    const [shouldRenderChart, setShouldRenderChart] = useState(false);
    const emailInfo = ensureObject(chartData?.emailDomainInfo);
    const emaildeliveryInfo = ensureObject(chartData?.emailDeliveryInfo);
    const emailRecipients = sanitizeMdmMetric(chartData?.emailRecipients);

    const data = useMemo(() => {
        const series = Object.keys(emailInfo).map((domain) => ({
            name: domain,
            y: sanitizeMdmChartValue(emailInfo[domain]),
            value: sanitizeMdmChartValue(emailInfo[domain]),
        }));
        return { series };
    }, [emailInfo]);

    useEffect(() => {
        const frameId = requestAnimationFrame(() => setShouldRenderChart(true));
        return () => {
            cancelAnimationFrame(frameId);
            setShouldRenderChart(false);
        };
    }, []);

    return (
        <RSModal
            show={Boolean(show)}
            size="xxlg"
            handleClose={() => handleClose(false)}
            header={DOMAIN_AND_DELIVERIBILITY}
            body={
                <div className="master-recip-data-popup">
                    <Row>
                        <Col md={6} className="d-flex justify-content-center align-items-center">
                            {shouldRenderChart ? (
                                <RSHighchartsContainer options={pieChartOptions(data)} />
                            ) : (
                                <div style={{ minHeight: 320 }} aria-hidden="true" />
                            )}
                        </Col>
                        <Col md={6} className="borderleft">
                            <MdmCountListSections
                                sections={[
                                    {
                                        title: BY_DOMAIN,
                                        data: emailInfo,
                                        totalRecipients: emailRecipients,
                                    },
                                    {
                                        title: BY_DELIVERABILITY,
                                        data: emaildeliveryInfo,
                                        totalRecipients: emailRecipients,
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

export default EmailInfo;
