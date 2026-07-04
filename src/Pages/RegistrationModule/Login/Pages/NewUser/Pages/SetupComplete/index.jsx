import { CLIENT_UPGRADE_SUCCESS, CONTACT_US, INVOICE_GENERATED, PAYMENT_FAILED, PAYMENT_SUCCESS, REDIRECTING_IN, SETTING_UP_ACCOUNT, SETUP_GREETING_1, SETUP_GREETING_3, SETUP_GREETING_4, SETUP_GREETING_5, SETUP_GREETING_6, SETUP_GREETING_7, SETUP_GREETING_8, SIGNING_UP, SUPPORT_RESUL } from 'Constants/GlobalConstant/Placeholders';
import { useCallback, useEffect, useState } from 'react';
import RSPageHeader from 'Components/RSPageHeader';
import { Container, Col, Row } from 'react-bootstrap';
import { RSSecondaryButton } from 'Components/Buttons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import AccountThumbsUp from 'Assets/Images/account-thumbsup.svg';
import AccountThumbsDown from 'Assets/Images/account-thumbsdown.svg';
import { navigateToLoginAfterSessionClear } from 'Reducers/login/existingUser/request';

const SetUpComplete = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { state } = useLocation();
    const isInvoice = state?.isInvoice || false
    const fromClientUpgrade = state?.fromClientUpgrade || false
        const [countdown, setCountdown] = useState(15);

    const navigateToLogin = useCallback(() => {
        navigateToLoginAfterSessionClear(dispatch, navigate);
    }, [dispatch, navigate]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);
    useEffect(() => {
        if (state?.from === 'companies') {
            const timeoutId = setTimeout(() => navigate('/preferences/company-list'), 15000);
            return () => clearTimeout(timeoutId);
        }

        const timeoutId = setTimeout(() => navigateToLogin(), 15000);
        return () => clearTimeout(timeoutId);
    }, [navigate, navigateToLogin, state?.from]);

    return (
        // Contend holder starts
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader
                title={isInvoice ? INVOICE_GENERATED : state?.isLicense ? 'Payment completed' : 'Account settings completed'}
            />
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <Container className="page-content px0">
                <div className="box-design mt20 py40 rs-box-min-height-acc d-flex align-items-center justify-content-center text-center position-relative">
                    <Row>
                        <Col>
                            {state?.status === 'success' ? (
                                <img src={AccountThumbsUp} alt="Success" className="d-inline-block" />
                            ) : (
                                <img src={AccountThumbsDown} alt="Failed" className="d-inline-block" />
                            )}
                            {fromClientUpgrade && state?.status === 'success' ?
                                <h2 className="my30">{CLIENT_UPGRADE_SUCCESS}</h2>  
                            :isInvoice && state?.status === 'success' ? 
                             <h2 className="my30">{INVOICE_GENERATED}</h2> 
                             : state?.status === 'success' && (state?.isPayment !== undefined || state?.isLicense) ? (
                                <h2 className="my30">{PAYMENT_SUCCESS}</h2>
                            ) : state?.status === 'failure' && state?.isPayment !== undefined ? (
                                <h2 className="my30">{PAYMENT_FAILED}</h2>
                            ) : state?.status === 'success' && state?.isSignUp ? (
                                <h2 className="my30">{SIGNING_UP}</h2>
                            ) : (
                                <h2 className="my30">{SETTING_UP_ACCOUNT}</h2>
                            )}
                            
                            {fromClientUpgrade && state?.status === 'success' ?  (
                                <h4 className="mb0">
                                    {SETUP_GREETING_8}
                                    <RSSecondaryButton
                                        onClick={() => {
                                            setTimeout(() => navigateToLogin(), 3000);
                                            window.location.href = 'mailto:support@resul.us';
                                        }}
                                        id="rs_SetUpComplete_supportSuccess"
                                    >
                                        {SUPPORT_RESUL}
                                    </RSSecondaryButton>
                                </h4>
                            ) : state?.isPayment !== undefined ? (
                                <h4>
                                    {CONTACT_US}
                                    <RSSecondaryButton
                                        onClick={() => {
                                            setTimeout(() => navigateToLogin(), 3000);
                                            window.location.href = 'mailto:support@resul.us';
                                        }}
                                        id="rs_SetUpComplete_supportContact"
                                    >
                                        {SUPPORT_RESUL}
                                    </RSSecondaryButton>
                                </h4>
                            ) : state?.status === 'success' && state?.isSignUp ? (
                                <h4 className="mb0">
                                    {SETUP_GREETING_1}
                                    <br />
                                    {SETUP_GREETING_3}
                                    <br />
                                    {SETUP_GREETING_4}
                                    <RSSecondaryButton
                                        onClick={() => {
                                            setTimeout(() => navigateToLogin(), 3000);
                                            window.location.href = 'mailto:support@resul.us';
                                        }}
                                        id="rs_SetUpComplete_supportSuccess"
                                    >
                                        {SUPPORT_RESUL}
                                    </RSSecondaryButton>
                                </h4>
                            ) :  isInvoice && state?.status === 'success' ?  (
                                <h4 className="mb0">
                                    {SETUP_GREETING_5}
                                    <br />
                                    {SETUP_GREETING_6}
                                    <br />
                                    {SETUP_GREETING_7}
                                    <RSSecondaryButton
                                        onClick={() => {
                                            setTimeout(() => navigateToLogin(), 3000);
                                            window.location.href = 'mailto:support@resul.us';
                                        }}
                                        id="rs_SetUpComplete_supportSuccess"
                                    >
                                        {SUPPORT_RESUL}
                                    </RSSecondaryButton>
                                </h4>
                            ):(
                                <h4 className="mb0">
                                    {SETUP_GREETING_3}
                                    <br />
                                    {SETUP_GREETING_4}
                                    <RSSecondaryButton
                                        onClick={() => {
                                            setTimeout(() => navigateToLogin(), 3000);
                                            window.location.href = 'mailto:support@resul.us';
                                        }}
                                        id="rs_SetUpComplete_supportSuccess"
                                    >
                                        {SUPPORT_RESUL}
                                    </RSSecondaryButton>
                                </h4>
                            )}
                        </Col>
                        <small className="bottom10 position-absolute right-0 text-end">
                            {REDIRECTING_IN}:{countdown.toString().padStart(2, '0')}
                        </small>
                    </Row>
                </div>
            </Container>
            {/* Main page content block ends */}
        </div>
        // Content holder ends
    );
};

export default SetUpComplete;
