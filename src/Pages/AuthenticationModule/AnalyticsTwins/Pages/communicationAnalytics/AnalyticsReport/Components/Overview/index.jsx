import { OVERVIEW_GRID_DATA } from '../../constants';
import { Fragment, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getSummaryList } from 'Reducers/analyticsTwins/analyticsSummary/selector';

import OverviewCard from './Components/OverviewCard';
import OverviewGrid from './Components/OverviewGrid';
import Geography from './Components/Geography';
import ReachByChannel from './Components/ReachByChannel';
import Sentiment from './Components/Sentiment';
import UnknownToKnown from './Components/UnknownToKnown';
import ConversionByChannel from './Components/ConversionByChannel';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';

const Overview = ({ overviewConfig, date, downloadUI }) => {
    const dispatch = useDispatch();
    // const { state } = useLocation();
    const state = useQueryParams('/analyticsTwins/analytics-report');
    // const state = { from: 64671 };
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const summary = useSelector((state) => getSummaryList(state));
    const [isExpandIcon, setExpandIcon] = useState(false);

    const showConversionByChannel = summary?.channelList?.includes(10);

    return (
        <Fragment>
            <Row>
                <Col md={7}>
                    <OverviewCard cardData={overviewConfig} downloadUI={downloadUI} />
                </Col>
                <Col md={5}>
                    {/* Device
                    Industry / Brand perceptions
                    Segment / By audience type
                    New contacts */}
                    <OverviewGrid
                        data={OVERVIEW_GRID_DATA}
                        handleChange={async (value) => {
                            // if (value) {
                            //     const payload = { campaignId: state.from, clientId, departmentId, userId };
                            //     await dispatch(getGeography({ payload }));
                            //     await dispatch(getKnownToUnknownConversion({ payload }));
                            // }
                            setExpandIcon(value);
                        }}
                        downloadUI={downloadUI}
                    />
                </Col>
            </Row>
            <Row
                className={`expand-viewer-container ${isExpandIcon ? 'expanded' : ''} ${
                    downloadUI ? 'expanded download-page-setup-detail' : ''
                }`}
            >
                <Geography date={date} overviewConfig={overviewConfig} downloadUI={downloadUI} />
                <ReachByChannel date={date} overviewConfig={overviewConfig} downloadUI={downloadUI} />
                <Sentiment date={date} downloadUI={downloadUI} />
                {showConversionByChannel ? (
                    <ConversionByChannel date={date} downloadUI={downloadUI} />
                ) : (
                    <UnknownToKnown date={date} downloadUI={downloadUI} />
                )}
            </Row>
        </Fragment>
    );
};

export default Overview;
