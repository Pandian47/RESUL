import { ACCOUNT_ALREADY_ACTIVATED, INFO, INVALID_ACTIVATION, OK, VALIDATING_LICENSE_KEY } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, circle_key_fill_large, circle_tick_medium, in_progress_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import { Container, Col, Row } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { get as _get, find as _find } from 'Utils/modules/lodashReplacements';
import RSPageHeader from 'Components/RSPageHeader';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';
import {
    submitLicenseKey,
    validateLicenseKey,
    agencyValidateLicenseKey,
    agencySubmitLicenseKey,
} from 'Reducers/login/existingUser/request';
import { resetLoginFormState, updateValidLicenseKey } from 'Reducers/login/existingUser/reducer';
import { companiesSubmitLicenskey, getCompanyDetails } from 'Reducers/preferences/Companies/request';
import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import { getGlobalClientList, getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import { getUserDetails } from 'Utils/modules/crypto';
import { replacePlusWithEncoded } from 'Utils/modules/display';
import { globalStateSelector } from 'Utils/Selectors/app';
import RSConfirmationModal from 'Components/ConfirmationModal';
let licencekeyValue = '';

const SetUpComplete = () => {
    const { isLicenseKey, isValidLicenseKey, isKeyData } = useSelector(({ loginReducer }) => loginReducer);
    const clientList = useSelector((state) => getGlobalClientList(state));
    const {accountAdmin, parentClientId , companyList } = useSelector(({ globalstate }) => globalstate);
    const { userId } = useSelector((state) => getSessionId(state));
    const { isAuth} = useSelector((state) => globalStateSelector(state));
    const dispatch = useDispatch();
    const { location } = useLocation();
    const state = useQueryParams('/account-activate');
    const navigate = useNavigate();
    const { control, setFocus, setValue, handleSubmit: formSubmit } = useForm();
    const [licenseValid, setLicenseValid] = useState(false);
    const [licenseShow, setLicenseShow] = useState(false);
    const validateLicenseLoader = useApiLoader({ autoFetch: false });
    const submitLicenseLoader = useApiLoader({ autoFetch: false });
    const fromCompanies = _get(state, 'from', '') === 'companies';
    const lastValidatedKeyRef = useRef(null);
    const [ clientErr, setClientErr] = useState({
        status: false,
        message: ''
    })
    const validateParentId = async () => {
        if(isAuth && state?.isMailActivation){
            const { licenseTypeId, isAgency, isEnterprisePlus } = getUserDetails();
            let currentCompanies = companyList;
            if((isEnterprisePlus || isAgency) && !currentCompanies?.length){
                const payload = {
                    clientId: accountAdmin?.clientId,
                    userId,
                    departmentId: 0,
                };
              const res =  await dispatch(getCompanyDetails({ payload , loading: true}));
              if(res?.status) currentCompanies = res?.data;
            }
            let parentClientId = accountAdmin?.clientId
            let currentCompany = _find(currentCompanies,  ['clientId', state?.clientId]);
            if(((Number(state?.urlParentId) === Number(parentClientId)) && state?.isLicenseKeyValue && !currentCompany?.isActivated)){
                const sanitized = state?.isLicenseKeyValue?.replace(/[^a-zA-Z0-9]/g, ''); 
                setValue('first', sanitized.substring(0, 3));
                setValue('second', sanitized.substring(3, 6));
                setValue('third', sanitized.substring(6, 9));
                validateLicense(`${sanitized.substring(0, 3)}-${sanitized.substring(3, 6)}-${sanitized.substring(6, 9)}`); 
                licencekeyValue = `${sanitized.substring(0, 3)}-${sanitized.substring(3, 6)}-${sanitized.substring(6, 9)}`; 
                return
            }
            if((Number(state?.urlParentId) === Number(parentClientId)) && currentCompany?.isActivated){
                setClientErr({
                    status: true,
                    message:  ACCOUNT_ALREADY_ACTIVATED
                })
                return
            }
            if((Number(state?.urlParentId) !== Number(parentClientId))){
                setClientErr({
                    status: true,
                    message: INVALID_ACTIVATION 
                })
                return
            }
        }else if(state?.isLicenseKeyValue && _get(state, 'from', '') === 'login'){
            setFocus('first');
            const sanitized = state?.isLicenseKeyValue?.replace(/[^a-zA-Z0-9]/g, ''); 
            setValue('first', sanitized.substring(0, 3));
            setValue('second', sanitized.substring(3, 6));
            setValue('third', sanitized.substring(6, 9));
            validateLicense(`${sanitized.substring(0, 3)}-${sanitized.substring(3, 6)}-${sanitized.substring(6, 9)}`); 
            licencekeyValue = `${sanitized.substring(0, 3)}-${sanitized.substring(3, 6)}-${sanitized.substring(6, 9)}`; 
        }
    }
    useEffect(() => {
        // let currentCompany = _find(companyList,  ['clientId', state?.clientId]);
        // if((isAuth && state?.isMailActivation && (Number(state?.urlParentId) === Number(parentClientId)) && state?.isLicenseKeyValue && !currentCompany?.isActivated) ||
        // state?.isLicenseKeyValue && _get(state, 'from', '') === 'login'){
        //     const sanitized = state?.isLicenseKeyValue?.replace(/[^a-zA-Z0-9]/g, ''); 
        //     setValue('first', sanitized.substring(0, 3));
        //     setValue('second', sanitized.substring(3, 6));
        //     setValue('third', sanitized.substring(6, 9));
        //     validateLicense(`${sanitized.substring(0, 3)}-${sanitized.substring(3, 6)}-${sanitized.substring(6, 9)}`); 
        //     licencekeyValue = `${sanitized.substring(0, 3)}-${sanitized.substring(3, 6)}-${sanitized.substring(6, 9)}`; 
        // }
        // if(isAuth && state?.isMailActivation && (Number(state?.urlParentId) === Number(parentClientId)) && currentCompany?.isActivated){
        //     setClientErr({
        //         status: true,
        //         message: 'Account alerady activated'
        //     })
        // }
        // if(isAuth && state?.isMailActivation && (Number(state?.urlParentId) !== Number(parentClientId))){
        //     setClientErr({
        //         status: true,
        //         message: 'Client id mismatch'
        //     })
        // }
        validateParentId()
    }, [state]);


    const sanitizeInput = (e) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, ''); 
        e.target.value = value;
    };

    const tabChangeValue = (val, next, e, prev) => {
        sanitizeInput(e); 

        let ele = document.querySelectorAll('.licenseValue');
        if (ele[0]?.value != '' && ele[0]?.value?.length === 3) {
            let tempValue = [];
            ele.forEach((element) => {
                tempValue.push(element.value);
            });

            if (ele[val - 1]?.value != '' && ele[val - 1]?.value?.length === 3) {
                setFocus(next);
            } else if (e.key === 'Backspace' && e.target.value?.length < 1) {
                setFocus(prev);
                setLicenseValid(false);
                setLicenseShow(true);
            }
            if (tempValue.join('')?.length === 9) {
                const finalKey = tempValue.join('-');
                validateLicense(finalKey);
                licencekeyValue = finalKey;
                setLicenseShow(true);
            } else {
                lastValidatedKeyRef.current = null;
            }
        } else {
            setFocus('first');
            lastValidatedKeyRef.current = null;
        }
    };

    const validateLicense = (data) => {
        if (!data || data === lastValidatedKeyRef.current) return;
        lastValidatedKeyRef.current = data;
        const payload = {
            clientId: state?.clientId,
            licenseKey: data,
        };
        validateLicenseLoader.refetch({
            fetcher: () =>
                state?.isAgency
                    ? dispatch(agencyValidateLicenseKey({ payload }))
                    : dispatch(validateLicenseKey({ payload })),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD },
        });
    };

    const submitLicense = (licencekeyValue) => {
        const payload = {
            clientId: state?.clientId,
            licensekey: licencekeyValue,
            data: isKeyData,
            LoginName: state?.LoginName,
            LoginPassword: state?.LoginPassword,
            ipAddress: state?.ipAddress,
            countryName: state?.countryName,
            countryCode: state?.countryCode,
            hashval: replacePlusWithEncoded(state?.hashval),
            hashval1: state?.hashval,
            userAgent: state?.userAgent,
        };

        submitLicenseLoader.refetch({
            fetcher: () => {
                if (fromCompanies) {
                    const newCompany = _find(companyList, ['clientId', state?.clientId]);
                    const tempCompanies = [...clientList, newCompany];
                    return dispatch(
                        companiesSubmitLicenskey(
                            {
                                clientId: state?.clientId,
                                licensekey: licencekeyValue,
                                data: isKeyData,
                            },
                            navigate,
                            tempCompanies,
                            false,
                        ),
                    );
                }
                if (state?.isAgency) {
                    return dispatch(agencySubmitLicenseKey({ payload, navigate, fromCompanies, loading: false }));
                }
                return dispatch(submitLicenseKey({ payload, navigate, loading: false }));
            },
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD },
        });
    };

    useComponentWillUnmount(() => {
        dispatch(updateValidLicenseKey());
    }, []);

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('Text').replace(/[^a-zA-Z0-9]/g, '');

        if (pastedText.length >= 3) {
            const first = pastedText.substring(0, 3);
            const second = pastedText.substring(3, 6);
            const third = pastedText.substring(6, 9);

            setValue('first', first);
            setValue('second', second);
            setValue('third', third);

            setTimeout(() => {
                if (third) setFocus('third');
                else if (second) setFocus('second');
                else setFocus('first');
            }, 0);

            const finalKey = [first, second, third].join('-');
            if (finalKey.replace(/-/g, '').length === 9) {
                validateLicense(finalKey);
                licencekeyValue = finalKey;
                setLicenseShow(true);
            }
        }
    };

    return (
        <div className="page-content-holder">
            <RSPageHeader title="Activate your account"  />

            <Container fluid >
                   <div className="page-content">
                <Container className='px0'>
                     <div className="box-design mt20 py40 rs-box-min-height-acc d-flex align-items-center justify-content-center text-center">
                    <Row>
                        <Col>
                            <div className="rs-license-key-activation-page">
                                
                                <p className="mb10">Enter your license key below to activate your account and gain access to RESUL.</p>
                                <i
                                    className={`${circle_key_fill_large} fs90 mb32 d-inline-block ${
                                        isLicenseKey ? 'color-primary-green' : 'color-primary-grey'
                                    }`}
                                ></i>
                                <p className="mb32">Your account has been registered.</p>
                                {validateLicenseLoader.isLoading && (
                                    <div className="alert alert-inProgress mb32 border-r7">
                                        <i
                                            className={`position-relative mr10 p5 white ${in_progress_medium} bg-blue-medium icon-md`}
                                        ></i>
                                        <span>{VALIDATING_LICENSE_KEY}</span>
                                    </div>
                                )}
                                {isValidLicenseKey && !validateLicenseLoader.isLoading && (
                                    <div className={`alert mb32 ${isLicenseKey ? 'alert-success' : 'alert-danger'}`}>
                                        <i
                                            className={`position-relative mr10 p5 white ${
                                                isLicenseKey ? circle_tick_medium : alert_medium
                                            }  ${isLicenseKey ? 'bg-primary-green' : 'bg-primary-red'} icon-md `}
                                        ></i>
                                        <span>{isLicenseKey ? 'License key validated successfully' : 'Invalid license key'}</span>
                                    </div>
                                )}
                                <div id="otp" className="inputs rs-otp-container rs-license-key-inputs-wrapper">
                                    <ul>
                                        <li>
                                            <RSInput
                                                className="text-center licenseValue"
                                                name="first"
                                                control={control}
                                                type="text"
                                                id="licencekey.first"
                                                maxLength="3"
                                                disabled={isLicenseKey ? true : false}
                                                handleOnPaste={handlePaste}
                                                onKeyUp={(e) => tabChangeValue(1, 'second', e, '')}
                                                disableMaxLengthWarning={true}
                                            />
                                        </li>
                                        <li className="rslki-sep"></li>
                                        <li>
                                            <RSInput
                                                className="text-center licenseValue"
                                                name="second"
                                                control={control}
                                                type="text"
                                                disabled={isLicenseKey ? true : false}
                                                id="licencekey.second"
                                                maxLength="3"
                                                handleOnPaste={handlePaste}
                                                onKeyUp={(e) => tabChangeValue(2, 'third', e, 'first')} 
                                                disableMaxLengthWarning={true}
                                            />
                                        </li>
                                        <li className="rslki-sep"></li>
                                        <li>
                                            <RSInput
                                                className="text-center licenseValue"
                                                name="third"
                                                control={control}
                                                type="text"
                                                id="licencekey.third"
                                                maxLength="3"
                                                disabled={isLicenseKey ? true : false}
                                                handleOnPaste={handlePaste}
                                                onKeyUp={(e) => tabChangeValue(3, '', e, 'second')} 
                                                disableMaxLengthWarning={true}
                                            />
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
                <div className="buttons-holder">
                    <RSSecondaryButton
                        onClick={() => {
                            if (fromCompanies) {
                                dispatch(resetLoginFormState());
                                navigate('/preferences/company-list');
                            } else {
                                dispatch(resetLoginFormState());
                                navigate('/');
                            }
                        }}
                    >
                        Cancel
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        className={`${isLicenseKey ? '' : 'click-off'} ml15`}
                        onClick={() => submitLicense(licencekeyValue)}
                        isLoading={submitLicenseLoader.isLoading}
                        blockBodyPointerEvents={submitLicenseLoader.isLoading}
                    >
                        Activate Account
                    </RSPrimaryButton>
                </div>
                </Container>
            </div>
            </Container>
            {clientErr?.status &&
                <RSConfirmationModal
                    show={clientErr?.status}
                    header={INFO}
                    text={clientErr?.message}
                    primaryButtonText={OK}
                    handleClose={() => {
                        setClientErr({
                            status: false,
                            message: ''
                        })
                        navigate('/preferences/company-list');
                    }}
                    handleConfirm={(status) => {
                        if(status){
                            setClientErr({
                                status: false,
                                message: ''
                            })
                            navigate('/preferences/company-list');
                        }
                    }}
                    secondaryButton={false}
                    isCloseButton={true}
                    isBorder
                />
            }
        </div>
    );
};

export default SetUpComplete;
