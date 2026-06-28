import { pieChartOptions } from 'Constants/Charts';
import { numberWithCommas } from 'Utils/modules/formatters';
import { useMemo } from 'react';
import RSIcon from 'Components/RSIcon';
import RSModal from 'Components/RSModal';
import { Col, Row } from 'react-bootstrap';

import RSHighchartsContainer from 'Components/Highcharts';

import { ensureObject, sanitizeMdmChartValue } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

const SocialMedia = ({ show=false, handleClose=()=>{}, chartData = {} }) => {
    const safeChartData = ensureObject(chartData);

    const data = useMemo(() => {
        const series = Object.keys(safeChartData).map((social) => ({
            name: social,
            y: sanitizeMdmChartValue(safeChartData[social]),
        }));
        return { series };
    }, [safeChartData]);

    return (
        <RSModal
            show={Boolean(show)}
            size="xxlg"
            handleClose={() => handleClose(false)}
            header="Social"
            body={
                <div className="master-recip-data-popup">
                    <Row className="h-100">
                        <Col md={6} className="d-flex align-items-center">
                            <RSHighchartsContainer options={pieChartOptions(data)} />
                        </Col>
                        <Col md={6}>
                            <h4 className="mt20 mb10">By web notification</h4>
                            <ul className="domain-list">
                                {data?.series?.length ? (
                                    data.series.map((social) => {
                                        return (
                                            <li key={social.name}>
                                                <span className="">{social.name}</span>
                                                <span className="">{numberWithCommas(social.y)}</span>
                                            </li>
                                        );
                                    })
                                ) : (
                                    <div className="align-items-center bg-body-bg-color border d-flex h-100 justify-content-center noDataFound">
                                        <NoDataAvailableRender />
                                    </div>
                                )}
                            </ul>
                        </Col>
                    </Row>
                </div>
            }
        />
    );
};

export default SocialMedia;
