import { memo } from 'react';
import { Col, Row } from 'react-bootstrap';

import { loginSkeletonCriticalCss } from './loginSkeletonCriticalCss';

const SkelBar = ({ className = '', style }) => (
    <span className={`skeleton-shimmer ${className}`.trim()} style={style} aria-hidden="true" />
);

/** Route refresh — `/` login card (logo + tab header + form fields). */
const LoginPageSkeleton = () => (
    <>
        <style>{loginSkeletonCriticalCss}</style>
        <div className="login-container login-skeleton-scope" aria-busy="true" aria-label="Loading login">
            <div className="login-resul-logo mt25">
                <SkelBar className="login-skeleton-logo" />
            </div>
            <Row className="login-info-container mx0">
                <Col className="tabBlock px0">
                    <Col>
                        <div className="loginTabs loginTabs-container">
                            <div className="login-skeleton-tab-head" aria-hidden="true" />
                            <div className="login-cont">
                                <div className="login-skeleton-form">
                                    <SkelBar className="login-skeleton-field login-skeleton-field--dropdown" />
                                    <SkelBar className="login-skeleton-field" />
                                    <SkelBar className="login-skeleton-field" />
                                    <div className="login-skeleton-actions">
                                        <SkelBar className="login-skeleton-remember" />
                                        <SkelBar className="login-skeleton-forgot" />
                                    </div>
                                    <SkelBar className="login-skeleton-submit" />
                                </div>
                            </div>
                            <SkelBar className="login-skeleton-new-user" />
                        </div>
                    </Col>
                </Col>
            </Row>
        </div>
    </>
);

export default memo(LoginPageSkeleton);
