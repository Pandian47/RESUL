
import { CANCEL, CONFIRM, DOWNLOAD_CSV, DOWNLOAD_LINK_SENT, ENTER_THE_OTP, OTP_CONTENT, RESET, SELECT, SELECT_USER, SEND_OTP_TO, YOUR_REQUEST_HAS_BEEN } from 'Constants/GlobalConstant/Placeholders';
import { restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import { otpThrough } from './Constant';
import { Col, Row } from 'react-bootstrap';
import RSOTPForm, { OtpModalAlerts } from 'Components/RSOTPForm';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { getUserInfoDetailsForOTP, requestKeyPersonOTP } from 'Reducers/globalState/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { validateMyProfileOTP } from 'Reducers/preferences/myProfile/request';
import {
    resetOtpState,
    restProfileData,
    updateOtpInValid,
    updateOtpValid,
} from 'Reducers/preferences/myProfile/reducer';

import {
    requestKeyPersonOTPAnalytics,
    submitAnalyticsOTP,
    validateAnalyticsOTP,
} from 'Reducers/analytics/details/request';
import { resetLoginFormState } from 'Reducers/login/existingUser/reducer';
import RSTooltip from 'Components/RSTooltip';
import { maskEmailTwoCharsBeforeAndAfterDomain, maskPhoneTwoDigitsInMiddle } from 'Utils/modules/masking';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

const DownloadCSV = ({
    show,
    handleClose,
    title = DOWNLOAD_CSV,
    onSuccess,
    isAnalytics = false,
    isForm = false,
    isDataCatalogue = false,
    isTargetlist = false,
    isDynamic = false,
    isSyncHistory = false,
    isTargetAdvanceDownload = false,
    isAnalyticsData = {},
    apiErrorMessage = '',
    requestOtpExtraPayload = {},
    isRMForm = false,
    fromUser = false,
}) => {
    const { control, setFocus, setValue, getValues, reset, watch } = useForm({
        mode: 'onChange',
        defaultValues: {
            user: '',
            otpBy: '',
        },
    });
    //  const { control, watch, setError, setValue, setFocus, clearErrors, reset } = useFormContext();
    const [OTPDataisAnalyticsData, setOTPDataisAnalyticsData] = useState({});
    const [OTPData, setOTPData] = useState('');
    const [keyData, setKeyData] = useState('');
    const [otpInput, setOTPInput] = useState(false);
    const [otpValue, setotpValue] = useState('');
    const [encryptedData, setEncryptedData] = useState(null);
    const [thanksmsg, setThanksMsg] = useState(false);
    const [prefix, setPrefix] = useState('');
    const { userOTPInfo, userOTPToken } = useSelector(({ globalstate }) => globalstate);
    const [user] = watch(['user']);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const dispatch = useDispatch();
    const requestKeyPersonOTPAPI = useApiLoader({ autoFetch: false });
    const validateOTPAPI = useApiLoader({ autoFetch: false });
    const submitCsvLoader = useApiLoader({ autoFetch: false });
    const keyPersonLoader = useApiLoader({ autoFetch: false });
    const ANALYTICS_FIELD_LOADER_CONFIG = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };
    const OTP_FIELD_LOADER_CONFIG = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };
    const [message, setMessage] = useState(null);
    const [otpSentSuccessMessage, setOtpSentSuccessMessage] = useState('');
    const [isOtpSectionVisible, setIsOtpSectionVisible] = useState(false);
    const { isOtp, flag, otpMessage } = useSelector(({ myProfileReducer = {} }) => myProfileReducer);
    const keyPersonList = Array.isArray(userOTPInfo?.keyPersonList) ? userOTPInfo.keyPersonList : [];
    const isOtpRequestLoading = requestKeyPersonOTPAPI.isLoading;
    const isOtpValidateLoading = validateOTPAPI.isLoading;
    const isKeyPersonLoading = keyPersonLoader.isLoading;
    useEffect(() => {
        if (Object.keys(isAnalyticsData)?.length) {
            setOTPDataisAnalyticsData({
                ...isAnalyticsData,
                email: user?.email || '',
                phoneNo: user?.phoneNo || '',
            });
        }
    }, [isAnalyticsData]);

    useEffect(() => {
        if (message) {
            setOtpSentSuccessMessage(message);
        }
    }, [message]);

    const getKeyPersonInfo = () => {
        keyPersonLoader.refetch({
            fetcher: () =>
                dispatch(
                    getUserInfoDetailsForOTP(
                        {
                            departmentId,
                            clientId,
                            userId,
                        },
                        false,
                    ),
                ),
            mode: 'create',
            loaderConfig: ANALYTICS_FIELD_LOADER_CONFIG,
            onSuccess: (res) => {
                if (
                    res?.status &&
                    Array.isArray(res?.data?.keyPersonList) &&
                    res.data.keyPersonList.length === 1
                ) {
                    setValue('user', res.data.keyPersonList[0]);
                }
            },
        });
    };

    const handleResetUser = () => {
        setValue('otpBy', '');
        setValue('user', '');
        setOTPInput(false);
        requestKeyPersonOTPAPI.reset();
        validateOTPAPI.reset();
        submitCsvLoader.reset();
        keyPersonLoader.reset();
        setEncryptedData(null);
        setOTPData('');
        setKeyData('');
        setotpValue('');
        setPrefix('');
        setMessage(null);
        setOtpSentSuccessMessage('');
        dispatch(restProfileData());
        dispatch(resetOtpState());
        dispatch(updateOtpInValid({ flag: false, otpMessage: null, isOtp: false }));
    };

    const handleValidateOTP = async (otpToUse) => {
        if (!userOTPToken || !otpToUse) return;

        const payload = {
            otpToken: userOTPToken,
            otp: otpToUse,
        };
        setotpValue(otpToUse);
        await validateOTPAPI.refetch({
            fetcher: () =>
                isAnalytics
                    ? dispatch(validateAnalyticsOTP({ payload, loading: false }))
                    : dispatch(validateMyProfileOTP({ payload, loading: false })),
            mode: 'create',
            loaderConfig: OTP_FIELD_LOADER_CONFIG,
        });
    };

    const getOTPData = async (value, resend) => {
        if (!value?.id || !user) return;

        dispatch(restProfileData());
        const formData = getValues();
        const selectedUser = formData?.user ?? user;
        if (!selectedUser) return;

        const payload = {
            ...OTPDataisAnalyticsData,
            email: selectedUser?.email || '',
            phoneNo: selectedUser?.phoneNo || '',
            departmentId,
            clientId,
            userId,
            type: isAnalytics ? (value.id === 'email' ? 2 : 1) : value.id,
            requestfrom: isAnalytics
                ? ''
                : isSyncHistory
                ? 'invalidcsv'
                : isDataCatalogue
                ? 'dataattributesdownload'
                : isTargetlist
                ? 'segmentdownload'
                : isTargetAdvanceDownload
                ? 'advancedetails'
                : isRMForm
                ? 'RM'
                : fromUser
                ? 'userdownload'
                : requestOtpExtraPayload?.requestfrom || '',
            source: isForm ? 'F' : isTargetlist ? 'T' : isDynamic ? 'D' : '',
            to:
                value.id === 'mobile'
                    ? `${selectedUser?.countrycodeMobile || ''}${selectedUser?.phoneNo || ''}`
                    : selectedUser?.email || '',
            name: selectedUser?.name || '',
            ...requestOtpExtraPayload,
        };
        setOTPData(value);
        setKeyData(selectedUser?.email || '');

        if (value.id === 'mobile') {
            setEncryptedData(maskPhoneTwoDigitsInMiddle(selectedUser?.phoneNo));
        } else if (value.id === 'email') {
            setEncryptedData(maskEmailTwoCharsBeforeAndAfterDomain(selectedUser?.email));
        }

        setOTPInput(true);
        const res = await requestKeyPersonOTPAPI.refetch({
            fetcher: () =>
                isAnalytics
                    ? dispatch(requestKeyPersonOTPAnalytics(payload, setMessage, resend, false))
                    : dispatch(requestKeyPersonOTP(payload, setMessage, resend, false)),
            mode: 'create',
            loaderConfig: OTP_FIELD_LOADER_CONFIG,
        });
        setPrefix(res?.prefix || '');
        if (res !== undefined && res !== null) {
            setOTPInput(true);
        }
    };

    const resendOTP = () => {
        // dispatch(restProfileData());
        getOTPData(OTPData, true);
    };

    const handleVerifyOTP = () => {
        // Vwerify otp and download csv
        reset((formState) => ({ ...formState, otpBy: '' }));
        setOTPInput(false);
        setEncryptedData(null);
        onSuccess(isForm ? { otpValue: otpValue, keyData: keyData } : keyData, userOTPToken);
        dispatch(
            updateOtpInValid({
                flag: false,
                otpMessage: null,
                isOtp: false,
            }),
        );
        if (!isSyncHistory)
            if (!isDataCatalogue) {
                handleModal();
            }
    };
    const handleSubmitCSV = async () => {
        const payload = {
            ...OTPDataisAnalyticsData,
            otpToken: userOTPToken,
            domainName: window.location?.origin,
            departmentId,
            clientId,
            userId,
        };
        await submitCsvLoader.refetch({
            fetcher: () => dispatch(submitAnalyticsOTP({ payload })),
            mode: 'create',
            loaderConfig: ANALYTICS_FIELD_LOADER_CONFIG,
            onSuccess: (res) => {
                if (res?.status) {
                    setThanksMsg(true);
                    setTimeout(() => {
                        handleModal();
                    }, 2000);
                } else {
                    setThanksMsg(false);
                }
            },
        });
    };

    const handleModal = () => {
        handleClose();
        dispatch(restProfileData());
        dispatch(resetLoginFormState());
        setPrefix('');
        reset((formState) => ({ ...formState, otpBy: '' }));
        setEncryptedData(null);
        setOTPInput(false);
        requestKeyPersonOTPAPI.reset();
        validateOTPAPI.reset();
        submitCsvLoader.reset();
        keyPersonLoader.reset();
        setOTPData('');
        setKeyData('');
        setotpValue('');
        setMessage(null);
        setOtpSentSuccessMessage('');
        dispatch(resetOtpState());
        setThanksMsg(false);
        dispatch(
            updateOtpInValid({
                flag: false,
                otpMessage: null,
                isOtp: false,
            }),
        );
    };
    useEffect(() => {
        if (show && !keyPersonList.length) {
            getKeyPersonInfo();
        }
        if (show && keyPersonList.length === 1) {
            setValue('user', keyPersonList[0]);
        }
    }, [show]);

    const showOtpSection = otpInput || isOtpRequestLoading;
    const showOtpStatusBand =
        isOtpRequestLoading ||
        Boolean(otpSentSuccessMessage) ||
        isOtpValidateLoading ||
        flag ||
        otpInput;

    useEffect(() => {
        if (!showOtpSection) {
            setIsOtpSectionVisible(false);
            return undefined;
        }

        const frameId = requestAnimationFrame(() => setIsOtpSectionVisible(true));
        return () => cancelAnimationFrame(frameId);
    }, [showOtpSection]);

    const selectedEncryptedData = encryptedData;
    return (
        <RSModal
            show={show}
            header={title}
            handleClose={handleModal}
            size={!thanksmsg ? 'lg' : 'md'}
            body={
                <Fragment>
                    {!thanksmsg ? (
                        <>
                            <div
                                className={`rs-otp-download-status-band ${
                                    showOtpStatusBand ? 'is-expanded' : ''
                                }`}
                            >
                                <div className="rs-otp-download-status-band__inner">
                                    {showOtpStatusBand ? (
                                        <OtpModalAlerts
                                            isOtpRequestLoading={isOtpRequestLoading}
                                            isOtpValidateLoading={isOtpValidateLoading}
                                            flag={flag}
                                            isOtp={isOtp}
                                            otpMessage={otpMessage}
                                            message={otpSentSuccessMessage}
                                            hideSuccessDuringValidation
                                            hideSuccessWhenFlag
                                            keepSlotMounted
                                            slotClassName="rs-otp-modal-alerts-slot has-alert rs-otp-crossfade"
                                            sendingAlertProps={{ className: 'mb0 border-r7', compact: false }}
                                            validatingAlertProps={{ className: 'mb0 border-r7', compact: false }}
                                            validationResultProps={{
                                                invalidVariant: 'warning',
                                                className: 'mb0 border-r7',
                                                compact: false,
                                            }}
                                            successAlertProps={{ className: 'mb0 border-r7', compact: false }}
                                        />
                                    ) : null}
                                </div>
                            </div>
                            <div className="form-group">
                                <p className='lh-base'>{OTP_CONTENT}</p>
                            </div>
                            <div className="form-group">
                                <Row>
                                    <Col sm={3} className="pr0">
                                        <label>{SELECT_USER}</label>
                                    </Col>
                                    <Col sm={3} className="pl0 ml-30">
                                        <RSKendoDropDownList
                                            data={keyPersonList}
                                            control={control}
                                            required
                                            textField={'name'}
                                            dataItemKey={'userID'}
                                            isLoading={isKeyPersonLoading}
                                            disabled={keyPersonList.length === 1 || Boolean(user)}
                                            name={'user'}
                                            label={SELECT}
                                        />
                                    </Col>
                                    {keyPersonList.length > 1 && user && (
                                        <Col sm={1} className="pl0">
                                            <RSTooltip className="d-inline" text={RESET}>
                                                <i
                                                    className={`${restart_medium} icon-md color-primary-blue cp`}
                                                    onClick={handleResetUser}
                                                />
                                            </RSTooltip>
                                        </Col>
                                    )}
                                </Row>
                                <Row className="mt30">
                                    <Col sm={3} className="pr0">
                                        <label>{SEND_OTP_TO}</label>
                                    </Col>
                                    <Col sm={3} className="pl0 ml-30">
                                        <RSKendoDropDownList
                                            data={otpThrough}
                                            control={control}
                                            required
                                            textField={'name'}
                                            disabled={!user}
                                            dataItemKey={'id'}
                                            handleChange={({ value }) => {
                                                if (value?.id) getOTPData(value, false);
                                            }}
                                            name={'otpBy'}
                                            label={SELECT}
                                        />
                                    </Col>
                                    {selectedEncryptedData && (
                                        <Col sm={6}>
                                            <TruncatedCell value={selectedEncryptedData} noTable />
                                        </Col>
                                    )}
                                </Row>
                            </div>
                            {showOtpSection && (
                                <Row
                                    className={`mt30 rs-otp-reveal ${
                                        isOtpSectionVisible ? 'is-visible' : ''
                                    }`}
                                >
                                    <Col sm={3} className="pr0">
                                        <label>{ENTER_THE_OTP}</label>
                                    </Col>
                                    <Col sm={7} className="pl0 ml-30 position-relative">
                                        <div
                                            className={
                                                isOtpValidateLoading ? 'pe-none click-off opacity-75' : ''
                                            }
                                        >
                                            <RSOTPForm
                                                isLoading={isOtpRequestLoading}
                                                otpMessage={false}
                                                isOTPValid={isOtp}
                                                disabled
                                                otpClass={'sessionOtp'}
                                                isResendOTPValid={(value) => {
                                                    if (isOtpValidateLoading) return;
                                                    resendOTP();
                                                    dispatch(
                                                        updateOtpInValid({
                                                            flag: false,
                                                        }),
                                                    );
                                                }}
                                                validateOTP={(otp, prefixedOtp) => {
                                                    if (isOtpValidateLoading) return;
                                                    const otpToUse =
                                                        prefixedOtp && prefixedOtp.length
                                                            ? prefixedOtp
                                                            : otp;
                                                    if (otp?.length === 6) {
                                                        handleValidateOTP(otpToUse);
                                                    } else if (isOtp) {
                                                        dispatch(updateOtpValid(false));
                                                    }
                                                }}
                                                prefix={prefix}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="text-center">{YOUR_REQUEST_HAS_BEEN}</p>
                            <p className="text-center">{DOWNLOAD_LINK_SENT}</p>
                        </>
                    )}
                </Fragment>
            }
            footer={
                <Fragment>
                    {apiErrorMessage && (
                        <div className="color-primary-red mr-auto">
                            <label>{apiErrorMessage}</label>
                        </div>
                    )}
                    <RSSecondaryButton className={thanksmsg ? 'd-none' : ''} onClick={handleModal}>
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        disabledClass={`${!isOtp || submitCsvLoader.isLoading ? 'pe-none click-off' : ''}`}
                        className={`${thanksmsg ? 'd-none' : ''}`}
                        isLoading={isAnalytics && submitCsvLoader.isLoading}
                        onClick={() => {
                            isAnalytics ? handleSubmitCSV() : handleVerifyOTP();
                        }}
                    >
                        {CONFIRM}
                    </RSPrimaryButton>
                </Fragment>
            }
        />
    );
};

DownloadCSV.propTypes = {
    isForm: PropTypes.bool,
    isAnalytics: PropTypes.bool,
    isAnalyticsData: PropTypes.object,
};
export default DownloadCSV;
