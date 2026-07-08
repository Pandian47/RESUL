import { BACK_TO_LOGIN, METHOD_TO_AUTHENTICATE } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card } from 'react-bootstrap';
import { RSSecondaryButton } from 'Components/Buttons';
import { VERIFICATION_METHODS } from './constant';
import EmailOTPSetup from './Component/EmailOTPSetup';
import AuthenticatorSetup from './Component/AuthenticatorSetup';
import { globalStateSelector } from 'Utils/Selectors/app';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
        },
    },
};

const VerificationModule = ({ onStepChange }) => {
    const navigate = useNavigate();
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [showOTPForm, setShowOTPForm] = useState(false);
    const [showAuthenticatorForm, setShowAuthenticatorForm] = useState(false);
    const { showSessionModal } = useSelector((state) => globalStateSelector(state));
    useEffect(() => {
       if (showAuthenticatorForm) {
            onStepChange && onStepChange('authenticatorSetup');
        } else if (showOTPForm) {
            onStepChange && onStepChange('emailOTPSetup');
        } else {
            onStepChange && onStepChange('choose2FA');
        }
    }, [showAuthenticatorForm, showOTPForm, onStepChange]);

    const handleMethodSelect = (method) => {
        setSelectedMethod(method);
        if (method === 'email') {
            setShowOTPForm(true);
        } else if (method === 'authenticator') {
            setShowAuthenticatorForm(true);
        }
    };

    const handleBackFromOTP = () => {
        setShowOTPForm(false);
        setShowAuthenticatorForm(false);
        setSelectedMethod(null);
    };

    const handleBackToSetup = () => {
        navigate(-1);
    };

    const handleOTPComplete = (otp) => {
            };

    const handleAuthenticatorComplete = (otp) => {
            };
    if (showAuthenticatorForm && selectedMethod === 'authenticator') {
        return (
            <AuthenticatorSetup
                onBack={handleBackFromOTP}
                onComplete={handleAuthenticatorComplete}
            />
        );
    }

    if (showOTPForm && selectedMethod === 'email') {
        return (
            <EmailOTPSetup
                onBack={handleBackFromOTP}
                onComplete={handleOTPComplete}
            />
        );
    }

    return (
        <div className="rs-login-wrapper">
            <div className={`login-panel ${showSessionModal ? 'p0': ''}`}>
                <motion.div
                    className="verification-module-container"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ width: '100%' }}
                >
                    <motion.div variants={itemVariants} className="text-center sp-mb-space-sm">
                        <p>{METHOD_TO_AUTHENTICATE}</p>
                    </motion.div>

                    <div className="form-group mb0">
                        {VERIFICATION_METHODS.map((method) => (
                            <motion.div key={method.id} variants={itemVariants}>
                                <Row>
                                    <Col md={12}>
                                        <motion.div
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        >
                                            <Card
                                                className={`verification-method-card mb10 cursor-pointer ${
                                                    selectedMethod === method.id ? 'border-primary' : ''
                                                }`}
                                                onClick={() => handleMethodSelect(method.id)}
                                            >
                                                <Card.Body className="d-flex mt-5 p15">
                                                    <div className="method-icon me-3">
                                                        <i className={` ${method.icon} icon-lg color-primary-blue`}></i>
                                                    </div>
                                                    <div className="method-content flex-grow-1">
                                                        <h5 className="font-semi-bold mb5">{method.title}</h5>
                                                        <small className='fs14 lh-sm'>
                                                            {method.description}
                                                        </small>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </motion.div>
                                    </Col>
                                </Row>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div variants={itemVariants} className="text-center">
                        <RSSecondaryButton
                            type="button"
                            id="rs_verification_back"
                            className="p-0 color-primary-blue"
                            onClick={handleBackToSetup}
                        >
                           {BACK_TO_LOGIN}
                        </RSSecondaryButton>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default VerificationModule;

