import { getCreatedDate, getUserCurrentFormat } from 'Utils/modules/dateTime';
import { useRef } from 'react';
import RSPageHeader from 'Components/RSPageHeader';
import RSTooltip from 'Components/RSTooltip';
import { Col, Container, Row } from 'react-bootstrap';

import { useSelector } from 'react-redux';
import { getSummaryList } from 'Reducers/analytics/analyticsSummary/selector';

import BenchMark from '../Components/BenchMark';
import CommunicationAnalysis from '../Components/CommunicationAnalysis';
const PDFContent = ({ analyticsTab }) => {
    const benchRef = useRef();
    const summary = useSelector((state) => getSummaryList(state));
    // const dateField = `${getUserDateTimeFormat(summary?.startDate, 'formatDate')} - ${getUserDateTimeFormat(
    //     summary?.endDate,
    //     'formatDate',
    // )}`;
        const dateField = `${getUserCurrentFormat(summary?.startDate)?.dateFormat} - ${
            getUserCurrentFormat(summary?.endDate)?.dateFormat
        }`;
    return (
        <div className="page-content-holder">
            <RSPageHeader
                title={
                    <>
                        <small className="badge">{summary?.encodeCampaignID}</small>
                        <RSTooltip text={summary?.campaignName} position="bottom">
                            <span className="repo-label">{summary?.campaignName}</span>
                        </RSTooltip>
                    </>
                }
                pageClass="csr-page-header"
                // starClass="top0"
                titleCls="repo-title"
                star={summary?.isGoldenCampaign}
                date={`${dateField}`}
            />
            <Container fluid >
            <div className='page-content'>
             <Container className=" px0">
                {/* Title Icons */}
                <Row className="my10">
                    <Col md={6} className="d-flex align-items-center">
                        <span>Overview (As on: {getCreatedDate(summary?.jobDateTime)})</span>
                    </Col>
                </Row>

                {/* Communication analysis  */}
                <CommunicationAnalysis analyticsTab={analyticsTab} date={getCreatedDate(summary?.jobDateTime)} />

                <BenchMark
                    benchRef={benchRef}
                    campaignName={summary?.campaignName}
                    date={getCreatedDate(summary?.jobDateTime)}
                />
                {summary?.channelList?.some((res) => res === 2) && (
                    <small className="mt23 mb23 color-secondary-black">
                         <b>Data notice:</b>{' '}
                            SMS message counts may be delayed beyond the standard SLA (24–48 hours). Counts may also vary if reporting from telecom or SMS partners is incomplete.
                    </small>
                )}
            </Container>
            </div></Container>
            </div>
         
   
    );
};
export default PDFContent;
