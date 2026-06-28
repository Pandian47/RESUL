import { circle_arrow_right_mini } from 'Constants/GlobalConstant/Glyphicons';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { RSPrimaryButton } from 'Components/Buttons';
import { LICENSE_TYPES } from 'Pages/RegistrationModule/Login/Pages/NewUser/Pages/LicenseType/constant';

// Plan hierarchy for filtering upgrade options
const PLAN_HIERARCHY = {
    'Pro': 1,
    'Enterprise': 2,
};

/**
 * SubscriptionPlans component - Displays all available subscription plans
 */
const SubscriptionPlans = ({
    onPlanSelect,
    currentPlan,
    lisenceId,
    isPaymentLoading = false,
    loadingPlanName = null,
}) => {
    // Filter plans to show only higher tier plans than the current plan
    const getUpgradePlans = () => {
        return LICENSE_TYPES.filter(plan => plan?.licenseId > lisenceId);
    };

    return (

              <div className='subscription-plans-modal'>
              <div className="subscription-plans-container ">
                    <div className="rs-license-selection-page">
                        <Row className='d-flex justify-content-center'>
                            {getUpgradePlans().map(({ mainHeading, type, tag, details, licenseId, buttonText, price, descritpionText }) => (
                                <Col sm={4} key={type}>
                                    <div className={`box-design p20 pt60 rs-account-setup-license-plans ${type}`}>
                                        <img src={tag} className="licenseTag" />
                                        <div className="plan-header">
                                            <h1>{mainHeading}</h1>
                                            <h5>Starts from</h5>
                                            <h3>USD</h3>
                                            <h1 className="price-tag">
                                                {price}/mo.<sup>*</sup>
                                            </h1>
                                            <h6>* Annual commitment</h6>
                                        </div>
                                        <div className={`descripiton-text text-center ${licenseId === 1 ? 'mb55' : ''}`}>
                                            <h4>{descritpionText}</h4>
                                        </div>
                                        <ul>
                                            {details.map(({ text }) => (
                                                <li key={text}>
                                                    <i
                                                        className={`${circle_arrow_right_mini} icon-xs color-primary-grey`}
                                                    ></i>
                                                    {text}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="text-center mb20">
                                            <RSPrimaryButton
                                                id={`rs_InApp_Selectplan_${type}`}
                                                type="submit"
                                                isLoading={isPaymentLoading && loadingPlanName === mainHeading}
                                                blockBodyPointerEvents={
                                                    isPaymentLoading && loadingPlanName === mainHeading
                                                }
                                                className={
                                                    isPaymentLoading && loadingPlanName !== mainHeading
                                                        ? 'click-off'
                                                        : ''
                                                }
                                                onClick={() => {
                                                    if (isPaymentLoading) return;
                                                    onPlanSelect?.(mainHeading);
                                                }}
                                            >
                                                {buttonText}
                                            </RSPrimaryButton>
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </div></div>
    );
};

SubscriptionPlans.propTypes = {
    onPlanSelect: PropTypes.func,
    currentPlan: PropTypes.string,
    lisenceId: PropTypes.number,
    isPaymentLoading: PropTypes.bool,
    loadingPlanName: PropTypes.string,
};

export default SubscriptionPlans;
