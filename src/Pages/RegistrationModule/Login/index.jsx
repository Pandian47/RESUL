import { useEffect, useRef, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import ResulticksLogoBlue from 'Assets/Images/resulticks-logo-blue.svg';


import DisablePluginModal from './Component/DisablePluginModal';

import { useDispatch, useSelector } from 'react-redux';
import { resetNewUserFormState } from 'Reducers/login/newUser/reducer';
import { updateForgotPwd } from 'Reducers/login/existingUser/reducer';

import ExistingUser from './Pages/ExistingUser';
import NewUser from './Pages/NewUser';
import LoginPopup from './Pages/ExistingUser/Component/LoginPopup';
import LoginOTPExisting from './Pages/ExistingUser/Component/LoginOTP';
import LoginOTP from './Pages/NewUser/Component/LoginOTP';
import VerificationModule from './Pages/VerificationModule';
import content from 'Constants/GlobalConstant/Content/content.json';
import { motion, AnimatePresence } from 'framer-motion';

const DISABLE_PLUGIN_HOURS = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

const Login = () => {
  const [disableModal, setDisableModal] = useState(false);
  const [isNewUser, setNewUser] = useState(false);
  const [verificationStep, setVerificationStep] = useState('choose2FA');
  const [isAuthFlowLoading, setIsAuthFlowLoading] = useState(false);
  const [height, setHeight] = useState('auto');
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setHeight(entry.contentRect.height);
        }
      });
      resizeObserver.observe(contentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const captchaCheck = parseInt(localStorage.getItem('captchaRetry'), 10) > 2;

  const { isForgotPwd, isLoginValid } = useSelector(({ loginReducer }) => loginReducer);
  const { isOtpModalShow } = useSelector(({ newUserReducer }) => newUserReducer);
  const  isOtpRequired  = false;
  const dispatch = useDispatch();

  const getActiveViewKey = () => {
    if (isLoginValid && isForgotPwd) return 'otp-existing';
    if (isLoginValid) return 'verif-mod';
    if (isForgotPwd) return 'login-popup';
    if (isOtpModalShow) return isNewUser ? 'otp-new' : 'otp-existing-2';
    return isNewUser ? 'new-user' : 'existing-user';
  };

  const checkPopupVisibility = (DISABLE_PLUGIN_HOURS) => {
    const lastShownTime = localStorage.getItem('disable_plugin_last_shown');
    const currentTime = new Date();
    if (lastShownTime === null || lastShownTime === undefined) {
        setDisableModal(true);
    } else {
        const parsedDate1 = new Date(lastShownTime);
        const parsedDate2 = new Date(currentTime);
        const timeDifference = Math.abs(parsedDate2 - parsedDate1);
        // if ((!lastShownTime || currentTime - Number(lastShownTime) > DISABLE_PLUGIN_HOURS)|| lastShownTime===null) {
        if (timeDifference > DISABLE_PLUGIN_HOURS) {
            setDisableModal(true);
        } else {
            setDisableModal(false);
        }
    }
};

  useEffect(() => {
    checkPopupVisibility(DISABLE_PLUGIN_HOURS);
  }, []);

  const handleNewUser = () => {
    if (isAuthFlowLoading) {
      return;
    }
    if (isForgotPwd) {
      dispatch(updateForgotPwd(false));
    } else {
      setNewUser(!isNewUser);
    }
    dispatch(resetNewUserFormState());
  };

  const renderLoginComponent = () => {
    if (isLoginValid && isForgotPwd) return <LoginOTPExisting />;
    if (isLoginValid) return <VerificationModule onStepChange={setVerificationStep} />;
    if (isForgotPwd) return <LoginPopup />;
    if (isOtpModalShow) return isNewUser ? <LoginOTP /> : <LoginOTPExisting />;
    return isNewUser ? (
      <NewUser onAuthLoadingChange={setIsAuthFlowLoading} />
    ) : (
      <ExistingUser onAuthLoadingChange={setIsAuthFlowLoading} />
    );
  };

  const renderHeader = () =>{
    if (isLoginValid && isForgotPwd) {
        return content.enterotp
    }
    if (isLoginValid) {
        return content.enterotp
        }
    if(isOtpRequired){
        switch(verificationStep){
            case 'choose2FA':
                return content.choose2FA
            case 'emailOTPSetup':
                return content.emailOTPSetup
            case 'authenticatorSetup':
                return content.authenticatorSetup
            default:
                return content.choose2FA
        }
    }
    if(isOtpModalShow){
        return content.enterotp
    }
    if (isForgotPwd) {
        return content.requestNewPassword
    }
    if(isNewUser){
        return content.newUser
    }
    else{
        return content.login
    }
  }

  return (
    <>
      <div className="login-container">
      <div className={`login-resul-logo mt25`}>
      <img src={ResulticksLogoBlue} alt={'RESUL'} className="login-logo-image" />
        </div>
        <Row className="login-info-container mx0">
          <Col className="tabBlock px0">
            <Col>
              <div className="loginTabs loginTabs-container">
              <ul className='rs-chart-tab pointer-event-none mini mb0'>
                        <li className='tabDefault single-tab d-block'>
                            <span className='tab-label' style={{ display: 'block', overflow: 'hidden' }}>
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={renderHeader()}
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 5 }}
                                  transition={{ duration: 0.15 }}
                                  style={{ display: 'inline-block' }}
                                >
                                  {renderHeader()}
                                </motion.div>
                              </AnimatePresence>
                            </span>
                        </li>
                        
                    </ul>
                <motion.div 
                  className='login-cont login-cont--loadable'
                  animate={{ height }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{
                    overflow: 'hidden',
                    transition: 'none'
                  }}
                >
                <div ref={contentRef} className='tabs-content d-flex' style={{ position: 'relative' }}>
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={getActiveViewKey()}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ width: '100%' }}
                    >
                      {renderLoginComponent()}
                    </motion.div>
                  </AnimatePresence>
                </div>
                </motion.div>
                {!isLoginValid && (
                                    <span
                                        className={`d-table mx-auto mt15 ${
                                            isAuthFlowLoading
                                                ? 'pe-none click-off opacity-50'
                                                : 'cursor-pointer'
                                        }`}
                                        onClick={handleNewUser}
                                        style={{ height: '24px', display: 'table', overflow: 'hidden' }}
                                    >
                                      <AnimatePresence mode="wait">
                                        <motion.span
                                          key={isForgotPwd ? 'forgot' : isOtpModalShow ? 'otp' : isNewUser ? 'existing' : 'new'}
                                          initial={{ opacity: 0, y: 5 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: -5 }}
                                          transition={{ duration: 0.15 }}
                                          style={{ display: 'block' }}
                                        >
                                          {isForgotPwd
                                              ? ''
                                              : isOtpModalShow
                                              ? ''
                                              : isNewUser
                                              ? 'Existing user'
                                              : 'New user?'}
                                        </motion.span>
                                      </AnimatePresence>
                                    </span>
                                )}
              </div>
            </Col>
          </Col>
        </Row>
      </div>
      {disableModal && (
        <DisablePluginModal show={disableModal} handleConfirm={() => setDisableModal(false)} />
      )}
    </>
  );
};

export default Login;
