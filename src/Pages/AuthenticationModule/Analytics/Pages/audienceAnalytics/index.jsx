import { encodeUrl } from 'Utils/modules/crypto';
import { DATA_DISCALIMER, DATA_DISCLAIMER_FOOTER_TEXT } from 'Constants/GlobalConstant/Placeholders';
import { communication_response_sync_large, download_large, snapshot_large, user_list_large } from 'Constants/GlobalConstant/Glyphicons';
import { useRef, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RSTooltip from 'Components/RSTooltip';
import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
import ActivityLevel from './Components/ActivityLevel';
import Top5Channels from './Components/Top5Channels';
import AudienceBehavior from './Components/AudienceBehavior';
import PersonPathConversion from './Components/PersonaPathConversion';
import Audience from './Components/Audience';
import SnapshotModal from './Components/Modals/SnapshotModal';
import SendMailModal from './Components/Modals/SendMailModal';
import { downloadIcons } from './constants';
import { useTranslation } from 'react-i18next';

import { audienceAnalytics360LiveSkeletonCriticalCss } from 'Components/Skeleton/pages/analytics/analyticsSkeletonCriticalCss';

const AudienceAnalytics = () => {
    const { t: translation } = useTranslation();
    const navigate = useNavigate();
    const { isCustom } = useSelector(({ aa360ViewReducer }) => aa360ViewReducer);
    const [actionModal, setActionModal] = useState(false);

    const handleActionModal = () => {
        // console.log('=====================================');
        setActionModal(false);
    };
    const userRef = useRef(null);

    const handleClick = () => {
        userRef.current?.scrollIntoView();
    };

    const handleCommunicationResponseClick = () => {
        const state = { fromAA360: true };
        const encryptState = encodeUrl(state);
        navigate(`/preferences/consumptions/csv-report?q=${encryptState}`, {
            state: { fromAA360: true }
        });
    };
    return (
        // Contend holder starts
        <div className="page-content-holder audienceAnalytics360PageCSS pt21">
            <style>{audienceAnalytics360LiveSkeletonCriticalCss}</style>
            {/* Main page heading block starts */}
            {/* <RSPageHeader title=" Audience analytics 360" isBack backPath="/analytics" isHeaderLine rightCommonMenus /> */}
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <Container className="page-content px0">
                <Row>
                    <Col className="top-sub-heading mt0 audiance-analytics-header">
                        <h3 className="float-start">{translation('Overview')}</h3>
                        <ul className="float-end rs-list-group-horizontal">
                            {isCustom && (
                                <li onClick={handleCommunicationResponseClick}>
                                    <RSTooltip position="top" text="Communication response" className="lh0">
                                        <i
                                            className={`${communication_response_sync_large} icon-lg color-primary-blue`}
                                        ></i>
                                    </RSTooltip>
                                </li>
                            )}
                            <li onClick={handleClick}>
                                <RSTooltip position="top" text="Users" className="lh0">
                                    <i
                                        className={`${user_list_large} icon-lg color-primary-blue`}
                                        title="Users"
                                    ></i>
                                </RSTooltip>
                            </li>
                            <li>
                                <RSTooltip position="top" text="Snapshot" className="lh0">
                                    <span className="pe-none click-off lh0">
                                        <BootstrapDropdown
                                            data={['Take a snapshot']}
                                            flatIcon
                                            defaultItem={
                                                <i className={`${snapshot_large} icon-lg color-primary-blue`} />
                                            }
                                            showUpdate={false}
                                            className="no_caret"
                                            alignRight
                                            onSelect={() => {}}
                                        />
                                    </span>
                                </RSTooltip>
                            </li>
                            <li>
                                <RSTooltip position="top" text="Downloads" className="lh0">
                                    <span className="pe-none click-off lh0">
                                        <BootstrapDropdown
                                            data={downloadIcons}
                                            flatIcon
                                            defaultItem={
                                                <i
                                                    id="rs_data_download"
                                                    className={`${download_large} icon-lg color-primary-blue`}
                                                />
                                            }
                                            showUpdate={false}
                                            className="no_caret"
                                            alignRight
                                            onSelect={() => {}}
                                        />
                                    </span>
                                </RSTooltip>
                            </li>
                        </ul>
                    </Col>
                </Row>
                <ActivityLevel />
                <Top5Channels />
                <AudienceBehavior />
                <PersonPathConversion />
                <div ref={userRef}>
                    <Audience />
                </div>
                <small className="mb26 color-secondary-black">
                                <span className='font-bold'>{DATA_DISCALIMER}:</span>{' '}
                                {DATA_DISCLAIMER_FOOTER_TEXT}
                            </small>
            </Container>
            {/* Main page content block ends */}

            <SnapshotModal show={actionModal} handleClose={handleActionModal} />
            {actionModal === 'Email' && <SendMailModal show={actionModal} handleClose={handleActionModal} />}
        </div>
        // Content holder ends
    );
};

export default AudienceAnalytics;
