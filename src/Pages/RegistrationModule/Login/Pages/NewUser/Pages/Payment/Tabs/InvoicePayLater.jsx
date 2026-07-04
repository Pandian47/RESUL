import { CANCEL, ENTER_MOBILE_NO, INVALID_KEY, INVOICE_AND_PAY_LATER, KEY_EXPIRED, PROCEED, VALIDATING_KEY, VALID_KEY } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, circle_tick_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';
import RSTimer from 'Components/RSTimer';
import { OtpValidatingAlert } from 'Components/RSOTPForm';

import { getAuthorizationCode, verifyAuthorizationCode } from 'Reducers/login/payment/request';
import { ENTER_AUTHENTICATION_CODE } from 'Constants/GlobalConstant/ValidationMessage';
import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import { resetLoginFormState, updateInvoiceInitial, updatePaymentState } from 'Reducers/login/existingUser/reducer';

const InvoicePay = ({ licenseTypeID, clientId, userId, clientName, handleCancel= () => {}, isInvoicePayLater =false }) => {
    const dispatch = useDispatch();
    const authCodeLoader = useApiLoader({ autoFetch: false });
    const verifyAuthCodeLoader = useApiLoader({ autoFetch: false });
    const isVerifyAuthCodeLoading = verifyAuthCodeLoader.isLoading;
    const { isInvoice, ispaymentEnable, isPaymentAuthCode, otpMessage } = useSelector(
        ({ loginReducer }) => loginReducer,
    );
    const { control, setError, setValue, clearErrors } = useForm({
        mode: 'onTouched',
        defaultValues: {
            authenticationcode: ''
        }
    });

    const requestAuthorizationCode = () => {
        if (authCodeLoader.isLoading || isVerifyAuthCodeLoading) return;

        const payload = {
            clientId,
            userId,
            clientName,
            licenseTypeID: licenseTypeID,
        };
        authCodeLoader.refetch({
            fetcher: () => dispatch(getAuthorizationCode({ payload, loading: false })),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD },
        });
    };

    const handleVerifyAuthorizationCode = (authKey) => {
        if (!authKey?.length || isVerifyAuthCodeLoading) return;

        verifyAuthCodeLoader.refetch({
            fetcher: () =>
                dispatch(
                    verifyAuthorizationCode({
                        payload: { clientId, authKey },
                        setError,
                        clearErrors,
                        loading: false,
                    }),
                ),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD },
            onSettled: () => {
                if (otpMessage) clearErrors('authenticationcode');
            },
        });
    };
    const [otpShow, setOtpShow] = useState(false);
    const [isResend, setisResend] = useState(false)
        useComponentWillUnmount(() => {
        dispatch(updateInvoiceInitial());
    }, []);

    useEffect(() => {
        if (!!otpMessage) {
            clearErrors('authenticationcode');
            setValue('authenticationcode', '');
            // if (AuthCodeRef.current) {
            //     AuthCodeRef.current.blur();
            // }
            const timer = setTimeout(() => {
                const inputEl = document.querySelector('.rs-input-wrapper-required input');
                if (inputEl) {
                    inputEl.blur();
                }
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [otpMessage]);

    useEffect(() => {
        return () => {
            dispatch(updateInvoiceInitial());
            dispatch(resetLoginFormState());
        };
    }, []);
    return (
        <>
            {!isInvoice && (
                <div className="rs-invoice-block">
                    <p>{INVOICE_AND_PAY_LATER}</p>
                    <div className="buttons-holder mr-11">
                    <RSSecondaryButton  onClick={() => handleCancel()}>
                        {CANCEL}
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            type="submit"
                            onClick={() => requestAuthorizationCode()}
                            isLoading={authCodeLoader.isLoading}
                            blockBodyPointerEvents={authCodeLoader.isLoading}
                        >
                            {PROCEED}
                        </RSPrimaryButton>
                    </div>
                </div>
            )}
            {isInvoice && (
                <div className="">
                    {' '}
                    <p>{ENTER_MOBILE_NO}</p>
                    <OtpValidatingAlert
                        show={isVerifyAuthCodeLoading}
                        message={VALIDATING_KEY}
                        className="mt10 mb31 border-r7"
                    />
                    {!!otpMessage && !isResend && !isVerifyAuthCodeLoading ? (
                        <div className="alert mt10 mb31 alert-danger">
                            <i
                                className={`position-relative p5 mr10 white icon-md bg-primary-red ${alert_medium}`}
                            ></i>
                            <span>{KEY_EXPIRED}</span>
                        </div>
                     ):isPaymentAuthCode && !isVerifyAuthCodeLoading ? (
                            <div className={`alert mt10 mb31 ${ispaymentEnable ? 'alert-success' : 'alert-danger'}`}>
                                <i
                                    className={`position-relative p5 mr10 white ${
                                        ispaymentEnable ? circle_tick_medium : alert_medium
                                    }  ${ispaymentEnable ? 'bg-primary-green' : 'bg-primary-red'} icon-md `}
                                ></i>
                                <span>{ispaymentEnable ? VALID_KEY : INVALID_KEY}</span>
                            </div>
                        ) :null}  
                    <div className="form-group mb0 mt17">
                        {/* <span className="color-primary-red">{!!otpMessage ? 'Authentication code expired' : ''}</span> */}
                        <div className={``}>
                            <RSInput
                                // ref={AuthCodeRef}
                                type={'text'}
                                name={'authenticationcode'}
                                control={control}
                                className={`${ispaymentEnable || isVerifyAuthCodeLoading ? 'click-off' : ''}`}
                                required
                                //classWrapper="errorContainer"
                                // disabled={otpShow}
                                maxLength={10}
                                placeholder={'Authentication code'}
                                rules={{
                                    required: ENTER_AUTHENTICATION_CODE,
                                }}
                                handleOnBlur={({ target: { value } }) => handleVerifyAuthorizationCode(value)}
                            />
                        </div>
                        {!ispaymentEnable && (
                            <RSTimer
                                isPayment
                                resendEnable={(value) => {
                                    if (value) {
                                        setOtpShow(value);
                                        requestAuthorizationCode();
                                        setValue('authenticationcode', '');
                                        dispatch(
                                            updatePaymentState({
                                                ispaymentEnable: false,
                                                isPaymentAuthCode: false,
                                            }),
                                        );
                                         setisResend(false)
                                    }
                                    setisResend(true)
                                }}
                            />
                        )}

                        {/* {isPaymentAuthCode && (
                            <div className={`alert p5 mt30 ${ispaymentEnable ? 'alert-success' : 'alert-danger'}`}>
                                <i
                                    className={`position-relative mr5 ${
                                        ispaymentEnable ? icons.tick_medium : alert_medium
                                    }  ${ispaymentEnable ? 'color-primary-green' : 'color-primary-red'} icon-md `}
                                ></i>
                                <span>{ispaymentEnable ? VALID_KEY : INVALID_KEY}</span>
                            </div>
                        )} */}
                    </div>
                </div>
            )}
        </>
    );
};

export default InvoicePay;
