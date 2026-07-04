import { memo } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import { accountSetupSkeletonCriticalCss } from './accountSetupSkeletonCriticalCss';

const ACCOUNT_SETUP_PROGRESS_STEPS = [
    'Account type',
    'Contact details',
    'Details',
    'Localization settings',
];

const toSkelSize = (value) => (typeof value === 'number' ? `${value}px` : value);

const SkelBar = ({
    className = '',
    style,
    width,
    height,
    circle = false,
}) => {
    const hasDimensions = width != null || height != null || circle;

    return (
        <span
            className={`skeleton-shimmer${hasDimensions ? ' acc-setup-skel-bar--sized' : ''}${circle ? ' broderradis50%' : ''} ${className}`.trim()}
            style={{
                ...(hasDimensions && { display: 'inline-block' }),
                ...(width != null && {
                    width: toSkelSize(width),
                    minWidth: toSkelSize(width),
                    maxWidth: toSkelSize(width),
                }),
                ...(height != null && {
                    height: toSkelSize(height),
                    minHeight: toSkelSize(height),
                    maxHeight: toSkelSize(height),
                }),
                ...(circle && { borderRadius: '50%' }),
                ...style,
            }}
            aria-hidden="true"
        />
    );
};

const AccountSetupProgressStepsSkeleton = () => (
    <ul className="acc-setup-skel-progress" aria-hidden="true">
        {ACCOUNT_SETUP_PROGRESS_STEPS.map((label) => (
            <li key={label} className="acc-setup-skel-step">
                <SkelBar width={46} height={46} circle className="acc-setup-skel-step__circle" />
                <SkelBar className="acc-setup-skel-step__label" />
            </li>
        ))}
    </ul>
);

const InputSkeleton = ({ extraBars = [] }) => (
    <div className="acc-setup-skel-form-group">
        <SkelBar className="acc-setup-skel-input" />
        {extraBars.map((barProps, index) => (
            <SkelBar key={`acc-setup-skel-extra-${index}`} {...barProps} />
        ))}
    </div>
);

const AccountSetupContactFormSkeleton = () => (
    <div>
        <div className="acc-setup-skel-card rs-box rs-box-min-height">
            <Row>
                <Col md={3} sm={4} className="accountsetup-image-upload">
                    <SkelBar className="acc-setup-skel-avatar" />
                    <SkelBar className="acc-setup-skel-hint" />
                </Col>
                <Col md={9} sm={8} className="acc-setup-skel-fields-col accountsetup-contact-info d-flex align-items-center">
                    <div className="w-100 acc-setup-skel-fields">
                        <Row>
                            <Col sm={6} xs={12}>
                                <InputSkeleton />
                            </Col>
                            <Col sm={6} xs={12}>
                                <InputSkeleton />
                            </Col>
                            <Col sm={6} xs={12}>
                                <InputSkeleton extraBars={[{ width: 15, height: 15, circle: true, className: 'acc-setup-skel-field-icon' }]} />
                            </Col>
                            <Col sm={6} xs={12}>
                                <InputSkeleton />
                            </Col>
                            <Col sm={6} xs={12}>
                                <InputSkeleton />
                            </Col>
                            <Col sm={6} xs={12}>
                                <InputSkeleton extraBars={[{ width: 150, height: 15, className: 'acc-setup-skel-field-hint' }]} />
                            </Col>
                            <Col md={{ span: 6, offset: 6 }}>
                                <InputSkeleton />
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>
        </div>
        <div className="buttons-holder">
            <SkelBar className="acc-setup-skel-btn-back" />
            <SkelBar className="acc-setup-skel-btn-next" />
        </div>
    </div>
);

/** Route refresh — `/account-setup` (wizard step 1: account type). */
const AccountSetupPageSkeleton = () => (
    <>
        <style>{accountSetupSkeletonCriticalCss}</style>
        <div className="page-content-holder account-setup-skeleton-scope" aria-busy="true" aria-label="Loading account setup">
            <Container fluid className="main-heading-wrapper mb0">
                <Container className="mhw-container">
                    <SkelBar className="acc-setup-skel-page-title" />
                </Container>
            </Container>
            <Container fluid>
                <div className="page-content">
                    <Container className="px0">
                        <Row>
                            <Col sm={12}>
                                <AccountSetupProgressStepsSkeleton />
                                <AccountSetupContactFormSkeleton />
                            </Col>
                        </Row>
                    </Container>
                </div>
            </Container>
        </div>
    </>
);

export { AccountSetupContactFormSkeleton };
export default memo(AccountSetupPageSkeleton);
