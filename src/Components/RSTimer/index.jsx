import { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { updateOtpValidState } from 'Reducers/login/existingUser/reducer';
import { updateOtpValidState as updateAddNewUserOtpValidState } from 'Reducers/preferences/users/reducer';
import { updateOtpValidState as updateNewUserOtpValidState } from 'Reducers/login/newUser/reducer';
import { useDispatch } from 'react-redux';
const RSTimer = ({
    initialTime = 300,
    retryTime = 300,
    resendEnable,
    isPayment = false,
    isEventSetup = false,
    isUserBlocked =  false,
    scenarioType = 'loginUser',
    handleTimerComplete = () =>{}
}) => {
    const [time, setTime] = useState(initialTime);
    const [startTime, setStartTime] = useState(Date.now());
    const timerRef = useRef(null);
    const dispatch = useDispatch();

    const handleOtpExpiry = () => {
        const actionPayload = {
            isOtpValid: false,
            showFlag: false,
            otpMessage: 'OTP expired',
        };
        if (scenarioType === 'newUser') {
            dispatch(updateNewUserOtpValidState(actionPayload));
        } else if (scenarioType === 'addUser') {
            dispatch(updateAddNewUserOtpValidState(actionPayload));
        } else {
            dispatch(updateOtpValidState(actionPayload));
        }
    };

    const handleResendState = () => {
        const resetPayload = {
            showFlag: false,
            otpMessage: '',
            isOtpValid: false,
        };
        if (scenarioType === 'newUser') {
            dispatch(updateNewUserOtpValidState(resetPayload));
        } else if (scenarioType === 'addUser') {
            dispatch(updateAddNewUserOtpValidState(resetPayload));
        } 
        else if (scenarioType === 'loginUser') {
            dispatch(
                updateOtpValidState({
                    showFlag: false,
                    otpMessage: 'OTP resent successfully',
                    isOtpValid: false,
                }),
            );
        }
    };

    useEffect(() => {
        if(isUserBlocked && time === 0){
            handleTimerComplete()
        }
        if (time === 0) {
            handleOtpExpiry()
        }
    }, [time, isUserBlocked, dispatch]);

    useEffect(() => {
        const updateRemainingTime = () => {
            // debugger
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000);
            setTime(initialTime - elapsed);
        };

        timerRef.current = setInterval(updateRemainingTime, 1000);

        return () => clearInterval(timerRef.current);
    }, [startTime, initialTime]);

    useEffect(() => {
        if (time <= 0) {
            clearInterval(timerRef.current);
        }
    }, [time]);

    return (
        <>
            <div>
                {time > 0 && (
                    <small className={`${isEventSetup ? '' : 'position-absolute-del'} ${isUserBlocked  ? '' :'mt5'}`}>
                        {isEventSetup ? (
                            <>
                                Session will end in {`${Math.floor(time / 60)}`.padStart(2, '0')}:
                                {`${time % 60}`.padStart(2, '0')}
                            </>
                        ) : isUserBlocked ? (
                            <>
                            Please login after {`${Math.floor(time / 60)}`.padStart(2, '0')}:
                            {`${time % 60}`.padStart(2, '0')}
                        </>
                        ): (
                            <>
                                {/* OTP is valid for 5 minutes {`${Math.floor(time / 60)}`.padStart(2, 0)}: */}
                                {isPayment ? 'Code will expire in' : `Expires in`}  {`${Math.floor(time / 60)}`.padStart(2, 0)}:
                                {`${time % 60}`.padStart(2, 0)}
                            </>
                        )}
                    </small>
                )}
            </div>
            {time === 0 && !isEventSetup && !isUserBlocked && (
                <small
                    onClick={() => {
                        setTime(retryTime);
                        resendEnable(true);
                        setStartTime(Date.now());
                        handleResendState();
                    }}
                    className="position-relative d-flex justify-content-end cp mt5 link-orange"
                >
                    Resend?
                </small>
            )}

            {/* <small
                onClick={() => {
                    setTime(retryTime);
                    resendEnable(true);
                }}
                className="position-absolute cp color-primary-orange mt5"
            >
                Resend? in {`${time % 60}`.padStart(2, 0)}
            </small> */}
        </>
    );
};

RSTimer.propTypes = {
    initialTime: PropTypes.number,
    retryTime: PropTypes.number,
    isPayment: PropTypes.bool,
    isEventSetup: PropTypes.bool,
    isUserBlocked: PropTypes.bool,
    handleTimerComplete : PropTypes.func
};

export default memo(RSTimer);

