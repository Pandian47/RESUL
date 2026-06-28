import { charNumDot, onlyNumbers } from 'Utils/modules/inputValidators';
import { IPADDRESS_REGEX, NEW_EMAIL_REGEX, PORT_LENGTH, PORTNUMBER_REGEX } from 'Constants/GlobalConstant/Regex';
import { DOMAIN_KEY as DOMAIN_KEY_MSG, ENTER_PASSWORD, ENTER_SEVER_NAME_IP_ADDRESS, ENTER_VALID_EMAIL, ENTER_VALID_IP_ADDRESS, ENTER_VALID_PORT_NUMBER, PORT_NUMBER as PORT_NUMBER_MSG, SELECT_DOMAIN_NAME as SELECT_DOMAIN_NAME_MSG, SERVER_BOUNCE as SERVER_BOUNCE_MSG, SERVER_EMAIL as SERVER_EMAIL_MSG, SMPT_HOUSING as SMPT_HOUSING_MSG, THROTTLE_SETTINGS } from 'Constants/GlobalConstant/ValidationMessage';
import { DETICATE, DKIM, DOMAIN_KEY, EMAILADDRESS, PASSWORD, PORT_NUMBER, SELECT_DOMAIN_NAME, SERVER_BOUNCE, SERVER_EMAIL, SETTINGS, SEVER_NAME_IP_ADDRESS, SHARED, SMPT_HOUSING, SPAM_SETTINGS, SPF_RECORE } from 'Constants/GlobalConstant/Placeholders';
import { circle_tick_medium, close_medium, close_mini, lock_medium, tick_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useContext, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';

import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import RSRadioButton from 'Components/FormFields/RSRadioButton';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { FORM_INITIAL_STATE } from './constant';
import { ActionsType } from '../../..';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    checkDomainExist,
    dkimValidation,
    getClientSMTPById,
    getDkimValues,
    getDomainSmtpDomain,
    getHouseList,
    getThrottleList,
    restoreDomainName,
    sendDkimDetailsMail,
    updateClientSmtpSettings,
} from 'Reducers/preferences/CommunicationSettings/request';
import SMTPServerSettings from '../Components/SMTPServerSettings';
import RSModal from 'Components/RSModal';
import resulLogo from 'Assets/Images/resul-logo-new.svg';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { CommunicationSettingsEditSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';



const Edit = () => {
    const methods = useForm(FORM_INITIAL_STATE);
    const {
        control,
        watch,
        reset,
        handleSubmit,
        setValue,
        trigger,
        formState: { isValid },
        getValues,
        setError,
    } = methods;

    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [smtpListOfData, setSmtpListOfData] = useState({
        domainList: [],
        throttleList: [],
        houseList: [],
    });
    const [validationSettingStatus, setValidationSettingStatus] = useState({
        status: false,
        validateStatusCheck: false,
        mxRecord: false,
        sslCertificate: false,
        rdns: false,
        spfRecord: false,
    });
    // console.log('smtpListOfData: ', smtpListOfData);
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);

    const { smtpToggle, setActions, actions, setFailedApi } = useContext(ActionsType);
    const [SMTPType, transactionCommunication] = watch(['smtpType', 'transactionCommunication']);
    const dispatch = useDispatch();
    const [settingsModal, setSettingsModal] = useState(false);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [authToken, setAuthToken] = useState('');
    const [showDomainIntegratedModal, setShowDomainIntegratedModal] = useState(false);
    const [showRestoreDomainModal, setShowRestoreDomainModal] = useState(false);

    const isEditMode = actions?.state?.mode === 'edit';
    const sessionReady = Boolean(clientId && userId != null && departmentId != null);
    const pageLoadApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const validateSettingsApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isSaveLoading = saveApi.isFetching;
    const isValidateSettingsLoading = validateSettingsApi.isFetching;
    const showFieldLoader = pageLoadApi.isLoading && !isEditMode;

    useEffect(() => {
        fetchEntriToken();
        window.addEventListener('onEntriClose', handleOnEntriClose, false);
        return () => {
            window.removeEventListener('onEntriClose', handleOnEntriClose, false);
        };
    }, []);

    const updateSmtpDomain = async (data) => {
        if (saveApi.isFetching) return;
        // console.log('data: ', data);

        let payload = {
            clientSmtpId: actions?.state?.mode === 'edit' ? actions?.state?.smtpId : 0,
            smtpDomainSettingId: data?.drpsenderdomainname?.smtpdomainSettingId,
            smtpDomainSettingName: data?.drpsenderdomainname?.domainName || '',
            userId,
            clientId,
            departmentId,
            smtpServer: data?.smtpServer,
            smtpPort: Number(data?.smtpPort),
            smtpUser: data?.smtpUser,
            smtpPassword: data?.smtpPassword,
            serverfromMail: data?.serverfromMail,
            serverbounceEmail: data?.serverbounceEmail,

            domainKey: data?.domainKey,
            smtpThrottle: data?.smtpThrottle?.smtpThrottleId,
            smtpType: data?.smtpType === 'Dedicated' ? 1 : 2,
            smtpHouseId: data?.smtphousing?.smtpHouseId,
            isSpamSettings: data?.transactionCommunication || false,
            SpamSetting: {
                defaultConfig: data?.smtpServerSettings?.checkSMTPConfiguration,
                SmtpConfig: {
                    serverName: data?.smtpServerSettings?.serverNameIP,
                    portNo: data?.smtpServerSettings?.portNumber,
                },
                Credentials: data?.smtpServerSettings?.credentials,
            },
        };
        const res = await saveApi.refetch({
            fetcher: () => dispatch(updateClientSmtpSettings(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
        // console.log('RESponse :::::: ', res);
        if (res?.status) {
            setActions({ type: 'SMTP Grid', state: {} });
        }
    };

    const fetchEntriToken = async () => {
        try {
            const response = await fetch('https://api.goentri.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    applicationId: 'resulticks',
                    secret: '9f8b29e317854f3762889bedc46c7d7a23d22afc2e4fde13adfd55233f624cf7',
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setAuthToken(data.auth_token);
                return data.auth_token;
            }
        } catch (err) {
        }
        return '';
    };

    const handleOnEntriClose = (event) => {
        if (event?.detail?.success) {
            dispatch(sendDkimDetailsMail({ domainName: event.detail?.domain }));
            setShowDomainIntegratedModal(true);
        }
    };

    const buildEntriConfig = ({
        token,
        dKimRecordData,
        domainNameData,
        spfHostName,
        subDomain,
        dmarcDomainName,
        dmarcHostName,
        isSpfRecordExist,
        isDmarcRecordExist,
    }) => {
        const dnsRecordsTemp = [
            {
                type: 'TXT',
                host: `mail${domainNameData}._domainkey${subDomain}`,
                value: dKimRecordData,
                ttl: 300,
            },
        ];

        if (isSpfRecordExist) {
            dnsRecordsTemp.push({
                type: 'TXT',
                host: `${spfHostName}`,
                value: 'v=spf1 include:spf1.resulticks.in ~all',
                ttl: 300,
            });
        }

        if (isDmarcRecordExist) {
            dnsRecordsTemp.push({
                type: 'TXT',
                host: `_dmarc${dmarcHostName}`,
                value: `v=DMARC1;p=none;rua=mailto:dmc@${dmarcDomainName}; fo=1`,
                ttl: 300,
            });
        }

        return {
            applicationId: 'resulticks',
            token: token,
            userId: 'user12345',
            prefilledDomain: domainNameData,
            dnsRecords: dnsRecordsTemp,
            enableDkim: true,
            customProperties: {},
            whiteLabel: {
                hideEntriLogo: true,
                hideConfetti: true,
                theme: {
                    fg: '#ffffff',
                    bg: '#ce7800',
                },
                logoBackgroundColor: '#ffffff',
                removeLogoBorder: true,
            },
        };
    };

    const buildDefaultEntriConfig = ({
        token,
        domainNameData,
        spfHostName,
        subDomain,
        dmarcDomainName,
        dmarcHostName,
    }) => {
        return {
            applicationId: 'resulticks',
            token: token,
            userId: 'user12345',
            prefilledDomain: domainNameData,
            dnsRecords: [
                {
                    type: 'TXT',
                    host: `${spfHostName}`,
                    value: 'v=spf1 include:spf1.resulticks.in ~all',
                    ttl: 300,
                },
                {
                    type: 'TXT',
                    host: `mail${domainNameData}._domainkey${subDomain}`,
                    value: '',
                    ttl: 300,
                },
                {
                    type: 'TXT',
                    host: `_dmarc${dmarcHostName}`,
                    value: `v=DMARC1;p=none;rua=mailto:dmc@${dmarcDomainName};ruf=mailto:dmcfr@${dmarcDomainName};pct=100;`,
                    ttl: 300,
                },
            ],
            enableDkim: true,
            customProperties: {},
            whiteLabel: {
                hideEntriLogo: true,
                hideConfetti: true,
                theme: {
                    fg: '#ffffff',
                    bg: '#ce7800',
                },
                logoBackgroundColor: '#ffffff',
                removeLogoBorder: true,
            },
        };
    };

    const handleEntriLaunch = async (domainExistResult) => {
        const domainNameDetails = getValues('drpsenderdomainname');
        const domainName = domainNameDetails?.domainName;
        if (!domainName) return;

        const token = authToken || (await fetchEntriToken());

        const { status, message } =
            domainExistResult ??
            (await dispatch(checkDomainExist({ domainName, userId, clientId, departmentId }, false)));
        if (status) {
            if (message === 'The domain name already exists.') {
                setShowRestoreDomainModal(true);
            } else {
                setError('drpsenderdomainname', { type: 'manual', message });
            }
            return;
        }

        const response = await dispatch(getDkimValues({ domainName }));
        let domainRequestData = domainName.replaceAll('.', '');
        let spfRequestData = '@';
        let subDomainData = '';
        let dmarcDomainName = domainName;
        let dmarcHostName = '';
        if (domainName.split('.').length > 2) {
            const listDomainSplit = domainName.split('.');
            subDomainData = `.${listDomainSplit[0]}`;
            spfRequestData = listDomainSplit[0];
            dmarcHostName = `.${listDomainSplit[0]}`;
        }

        if (!response?.status) {
            if (window.entri && token) {
                window.entri.showEntri(
                    buildDefaultEntriConfig({
                        token,
                        domainNameData: domainRequestData,
                        spfHostName: spfRequestData,
                        subDomain: subDomainData,
                        dmarcDomainName,
                        dmarcHostName,
                    }),
                );
            }
            return;
        }

        if (window.entri && token) {
            window.entri.showEntri(
                buildEntriConfig({
                    token,
                    dKimRecordData: response?.data?.dkimRecord || '',
                    domainNameData: domainRequestData,
                    spfHostName: spfRequestData,
                    subDomain: subDomainData,
                    dmarcDomainName,
                    dmarcHostName,
                    isSpfRecordExist: response?.data?.spfRecord !== '',
                    isDmarcRecordExist: response?.data?.dmarcRecord !== '',
                }),
            );
        }
    };

    const handleValidateSetting = async () => {
        const domainNameDetails = getValues('drpsenderdomainname');
        const portValue = getValues('smtpPort');
        const smtpServer = getValues('smtpServer');
        const domainKeyValue = getValues('domainKey');
        const finalDomainKeyValue = domainKeyValue?.includes('._domainkey')
            ? domainKeyValue?.split('._domainkey')[0]
            : '';
        const payload = {
            SmtpServer: domainNameDetails?.domainName ?? '',
            SmtpPort: portValue ?? 0,
            DkeyRecord: finalDomainKeyValue,
            ServerHost:smtpServer ?? '',
        };

        try {
            const response = await dispatch(dkimValidation(payload));
            if (!response) {
                setValidationSettingStatus({
                    validateStatusCheck: true,
                    status: false,
                    mxRecord: false,
                    rdns: false,
                    spfRecord: false,
                    sslCertificate: false,
                });
            }
            if (response?.status) {
                const responseData = response?.data;
                setValidationSettingStatus({
                    validateStatusCheck: true,
                    status: true,
                    mxRecord: responseData?.mxRecord || false,
                    rdns: responseData?.rdns || false,
                    spfRecord: responseData?.spfRecord || false,
                    sslCertificate: responseData?.sslCertificate || false,
                });
            } else {
                setValidationSettingStatus({
                    validateStatusCheck: true,
                    status: false,
                    mxRecord: false,
                    rdns: false,
                    spfRecord: false,
                    sslCertificate: false,
                });
            }
        } catch (error) {
            setValidationSettingStatus({
                validateStatusCheck: true,
                status: false,
                mxRecord: false,
                rdns: false,
                spfRecord: false,
                sslCertificate: false,
            });
        }
    };

    const handleContinueValidation = async () => {
        if (!isValid || isValidateSettingsLoading) return;

        setShowValidationModal(false);

        const domainCheckRes = await validateSettingsApi.refetch({
            fetcher: async () => {
                await handleValidateSetting();
                const domainName = getValues('drpsenderdomainname')?.domainName;
                if (!domainName) return null;
                return dispatch(checkDomainExist({ domainName, userId, clientId, departmentId }, false));
            },
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });

        await handleEntriLaunch(domainCheckRes);
    };

    const applyClientSmtpEdit = useCallback(
        async (domains = [], throttle2 = [], housing = []) => {
            const payload = {
                clientsmtpId: actions?.state?.smtpId,
                userId,
                clientId,
            };
            const { status, data } = await dispatch(getClientSMTPById(payload));
            if (status) {
                const smtphousing = housing?.filter((item) => item?.smtpHouseId === data?.smtpHouseId);
                const throttle = throttle2?.filter((item) => item?.smtpThrottleId === data?.smtpThrottle);
                const domainName = domains?.filter(
                    (item) => item?.smtpdomainSettingId === data?.smtpDomainSettingId,
                );

                reset({
                    drpsenderdomainname: domainName?.[0],
                    smtpServer: data?.smtpServer,
                    smtpPort: data?.smtpPort,
                    smtpUser: data?.smtpUser,
                    smtpPassword: data?.smtpPassword,
                    serverfromMail: data?.serverFromMail,
                    serverbounceEmail: data?.serverBounceEmail,
                    transactionCommunication: data?.isSpamSettings,
                    domainKey: data?.domainKey,
                    smtpThrottle: throttle?.[0],
                    smtpType: data?.smtpType === 1 ? 'Dedicated' : 'Shared',
                    smtphousing: smtphousing?.[0],
                    clientSetup: {
                        domainKey: 'DKIM',
                        spfRecord: 'SPF Record',
                    },
                });
                await handleValidateSetting();
            } else {
                setFailedApi('GetClientSmtpbyId');
            }
        },
        [actions?.state?.smtpId, userId, clientId, dispatch, reset, setFailedApi],
    );

    const bootstrapPage = useCallback(() => {
        if (!sessionReady) {
            return undefined;
        }
        const payload = { clientId, userId, departmentId };

        return pageLoadApi.refetch({
            fetcher: async () => {
                const [domainRes, throttleRes, houseRes] = await Promise.all([
                    dispatch(getDomainSmtpDomain(payload)),
                    dispatch(getThrottleList(payload)),
                    dispatch(getHouseList(payload)),
                ]);

                const domains = Array.isArray(domainRes?.data) ? domainRes.data : [];
                const throttleList = Array.isArray(throttleRes?.data) ? throttleRes.data : [];
                const houseList = Array.isArray(houseRes?.data) ? houseRes.data : [];

                setSmtpListOfData({
                    domainList: domainRes?.status ? domains : [],
                    throttleList: throttleRes?.status ? throttleList : [],
                    houseList: houseRes?.status ? houseList : [],
                });

                if (isEditMode) {
                    await applyClientSmtpEdit(domains, throttleList, houseList);
                }

                return { domainRes, throttleRes, houseRes };
            },
            loaderConfig: fieldLoaderConfig,
            mode: isEditMode ? 'edit' : 'create',
        });
    }, [
        sessionReady,
        clientId,
        userId,
        departmentId,
        dispatch,
        pageLoadApi.refetch,
        isEditMode,
        applyClientSmtpEdit,
    ]);

    useEffect(() => {
        bootstrapPage();
    }, [bootstrapPage]);

    const validationItems = [
        { name: 'MX Record', status: validationSettingStatus.mxRecord },
        { name: 'SSL Certificate', status: validationSettingStatus.sslCertificate },
        { name: 'RDNS', status: validationSettingStatus.rdns },
        { name: 'SPF Record', status: validationSettingStatus.spfRecord },
    ];

    const getIconClass = (status) => {
        return ` ${status ? tick_medium : close_mini} icon color-primary-${status ? 'green' : 'red'} 
        } ml5 position-relative top2 mr3 cursor-normal`;
    };

    const isSmtpTypeDisabled = smtpToggle === 'edit';

    return (
        <CommunicationSettingsEditSkeletonGate isLoading={pageLoadApi.isFetching} isEditMode={isEditMode}>
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(updateSmtpDomain)}>
                <div className="box-design bd-top-border">
                    <Row className='mt5'>
                        <Col sm={6}>
                        <div className="rs-sub-heading">
                            <h4>SMTP</h4>
                            </div>
                            <div className="form-group" id="rs_Edit_drpsenderdomainname">
                                <RSKendoDropDownList
                                    control={control}
                                    name="drpsenderdomainname"
                                    label={SELECT_DOMAIN_NAME}
                                    data={smtpListOfData?.domainList}
                                    textField={'domainName'}
                                    dataItemKey={'smtpdomainSettingId'}
                                    required
                                    isLoading={showFieldLoader}
                                    rules={{
                                        required: SELECT_DOMAIN_NAME_MSG,
                                    }}
                                    disabled={smtpToggle === 'edit'}
                                />
                            </div>
                            <div className="form-group">
                                <RSInput
                                    control={control}
                                    name={'smtpServer'}
                                    id="rs_Edit_smtpServer"
                                    placeholder={SEVER_NAME_IP_ADDRESS}
                                    required
                                    disabled={smtpToggle === 'edit'}
                                    // onKeyDown={(e) => onlyNumbersDecimalWithoutSpecialCharacters(e)}
                                    onKeyDown={(e) => charNumDot(e)}
                                    rules={{
                                        required: ENTER_SEVER_NAME_IP_ADDRESS,
                                        // pattern: {
                                        //     value: IPADDRESS_REGEX,
                                        //     message: ENTER_VALID_IP_ADDRESS,
                                        // },
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <RSInput
                                    control={control}
                                    name={'smtpPort'}
                                    id="rs_Edit_smtPort"
                                    placeholder={PORT_NUMBER}
                                    required
                                    maxLength={PORT_LENGTH}
                                    onKeyDown={(e) => onlyNumbers(e)}
                                    disabled={smtpToggle === 'edit'}
                                    rules={{
                                        required: PORT_NUMBER_MSG,
                                        pattern: {
                                            value: PORTNUMBER_REGEX,
                                            message: ENTER_VALID_PORT_NUMBER,
                                        },
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <RSInput
                                    control={control}
                                    name={'smtpUser'}
                                    id="rs_Edit_smtUser"
                                    placeholder={EMAILADDRESS}
                                    type={'email'}
                                    required
                                    disabled={smtpToggle === 'edit'}
                                    rules={{
                                        required: ENTER_VALID_EMAIL,
                                        pattern: {
                                            value: NEW_EMAIL_REGEX,
                                            message: ENTER_VALID_EMAIL,
                                        }
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <RSInput
                                    control={control}
                                    name={'smtpPassword'}
                                    id="rs_Edit_smtPassword"
                                    placeholder={PASSWORD}
                                    required
                                    viewEye
                                    disabled={smtpToggle === 'edit'}
                                    type="password"
                                    rules={{
                                        required: ENTER_PASSWORD,
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <RSInput
                                    control={control}
                                    name={'serverfromMail'}
                                    id="rs_Edit_serverfromMail"
                                    placeholder={SERVER_EMAIL}
                                    type={'email'}
                                    required
                                    disabled={smtpToggle === 'edit'}
                                    rules={{
                                        required: SERVER_EMAIL_MSG,
                                        pattern: {
                                            value: NEW_EMAIL_REGEX,
                                            message: ENTER_VALID_EMAIL,
                                        }
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <RSInput
                                    control={control}
                                    name={'serverbounceEmail'}
                                    id="rs_Edit_serverbounceEmail"
                                    placeholder={SERVER_BOUNCE}
                                    type={'email'}
                                    required
                                    disabled={smtpToggle === 'edit'}
                                    rules={{
                                        required: SERVER_BOUNCE_MSG,
                                        pattern: {
                                            value: NEW_EMAIL_REGEX,
                                            message: ENTER_VALID_EMAIL,
                                        },
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <RSInput
                                    control={control}
                                    name={'domainKey'}
                                    id="rs_Edit_domainKey"
                                    maxLength={256}
                                    placeholder={DOMAIN_KEY}
                                    required
                                    disabled={smtpToggle === 'edit'}
                                    rules={{
                                        required: DOMAIN_KEY_MSG,
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <RSCheckbox
                                    control={control}
                                    name={`transactionCommunication`}
                                    labelName={SPAM_SETTINGS}
                                    disabled={smtpToggle === 'edit'}
                                    handleChange={(e) => setSettingsModal(e?.target?.checked)}
                                />
                            </div>
                        </Col>
                        <Col sm={6}>
                        <div className="rs-sub-heading">
                            <h4>Throttle setting</h4></div>
                            <div className="form-group " id="rs_Edit_smtpThrottle">
                                <RSKendoDropDownList
                                    data={smtpListOfData?.throttleList} // By Stephen
                                    control={control}
                                    name="smtpThrottle"
                                    label={SETTINGS}
                                    textField={'smtpThrottleName'}
                                    dataItemKey={'smtpThrottleId'}
                                    required
                                    isLoading={showFieldLoader}
                                    rules={{
                                        required: THROTTLE_SETTINGS,
                                    }}
                                    disabled={smtpToggle === 'edit'}
                                />
                            </div>
                            <div className="form-group">
                                <Row className="align-items-center">
                                    <Col sm={3} className="d-flex align-items-center pr0">
                                        <label className="control-label-left mb0">SMTP type</label>
                                    </Col>
                                    <Col sm={7} className='pl0'>
                                        <ul
                                            className={`rs-list-inline rli-space-10 d-flex align-items-center mb0${isSmtpTypeDisabled ? ' cursor-not-allowed' : ''}`}
                                        >
                                            <li className="d-flex align-items-center">
                                                <RSRadioButton
                                                    control={control}
                                                    name="smtpType"
                                                    labelName={DETICATE}
                                                    defaultValue={SMTPType}
                                                    disabled={isSmtpTypeDisabled}
                                                    id="rs_Edit_smtpTypeDedicated"
                                                    radio_wrapper_class="mb0 mt0"
                                                    customLabelclassName={isSmtpTypeDisabled ? 'cursor-not-allowed' : ''}
                                                />
                                            </li>
                                            <li className="d-flex align-items-center">
                                                <RSRadioButton
                                                    control={control}
                                                    name="smtpType"
                                                    id="rs_Edit_smtpTypeShared"
                                                    labelName={SHARED}
                                                    defaultValue={SMTPType}
                                                    disabled={isSmtpTypeDisabled}
                                                    isError={false}
                                                    radio_wrapper_class="mb0 mt0"
                                                    customLabelclassName={isSmtpTypeDisabled ? 'cursor-not-allowed' : ''}
                                                />
                                            </li>
                                        </ul>
                                    </Col>
                                </Row>
                            </div>
                            {/* <h4 className="mt20 mb30">SMTP housing</h4> */}
                            <div className="form-group" id="rs_Edit_smtphousing">
                                <RSKendoDropDownList
                                    data={smtpListOfData.houseList} // smtpListOfData.houseList
                                    control={control}
                                    name="smtphousing"
                                    label={SMPT_HOUSING}
                                    textField={'smtpHouseName'}
                                    dataItemKey={'smtpHouseId'}
                                    required
                                    isLoading={showFieldLoader}
                                    rules={{
                                        required: SMPT_HOUSING_MSG,
                                    }}
                                    disabled={smtpToggle === 'edit'}
                                />
                            </div>
                            {/* <h4 className="mt20 mb31">DKIM</h4> */}
                            <div className="form-group mt-2">
                                <RSInput
                                    control={control}
                                    id="rs_Edit_DKIM"
                                    name={'clientSetup.domainKey'}
                                    placeholder={DKIM}
                                    label={'DKIM'}
                                    disabled={true}
                                />
                            </div>
                            {/* <h4 className="mt20 mb31">SPF record</h4> */}
                            <div className="form-group mt-2">
                                <RSInput
                                    control={control}
                                    name={'clientSetup.spfRecord'}
                                    placeholder={SPF_RECORE}
                                    id="rs_Edit_SPFrecord"
                                    label={'SPF record'}
                                    disabled={true}
                                />
                            </div>
                            {validationSettingStatus?.validateStatusCheck && (
                                <div className="form-group">
                                    <p
                                        className={`alert ${
                                            validationSettingStatus?.status ? 'alert-success' : 'alert-danger'
                                        } p5 bottom9`}
                                    >
                                        <i
                                            className={`${
                                                validationSettingStatus?.status ? tick_medium : close_medium
                                            } icon-md 'color-primary-${
                                                validationSettingStatus?.status ? 'green' : 'red'
                                            }' mr5 ml10 cursor-normal`}
                                        ></i>
                                        {`SMTP server validation ${
                                            validationSettingStatus?.status ? 'success' : 'fail'
                                        }. `}
                                    </p>
                                </div>
                            )}
                        </Col>
                    </Row>
                    <div className="buttons-holder">
                        <RSPrimaryButton
                            id="rs_Edit_Validate"
                            disabledClass={`${
                                !isValid || smtpToggle === 'edit' || isValidateSettingsLoading ? 'pe-none click-off' : ''
                            }`}
                            isLoading={isValidateSettingsLoading}
                            blockBodyPointerEvents={isValidateSettingsLoading}
                            onClick={() => {
                                if (!isValid || isValidateSettingsLoading) return;
                                setShowValidationModal(true);
                            }}
                        >
                            Validate settings
                        </RSPrimaryButton>
                    </div>
                    {validationSettingStatus?.status && (
                        <ul className="rs-list-inline rli-space-15 mt10">
                            {validationItems.map((item, index) => (
                                <li key={index}>
                                    <i className={getIconClass(item.status)} />
                                    {item.name}
                                </li>
                            ))}
                        </ul>
                    )}
                    {/* </div> */}
                    <SMTPServerSettings
                        show={settingsModal}
                        handleClose={(data) => {
                            setValue('transactionCommunication', data);
                            setSettingsModal(false);
                        }}
                        handleSave={(data) => {
                            setSettingsModal(false);
                        }}
                    />
                    <RSModal
                        show={showValidationModal}
                        size="lg"
                        handleClose={() => setShowValidationModal(false)}
                        header={false}
                        isCloseButton={false}
                        isCustomScroll={false}
                        className="rs-smtp-validate-modal"
                        body={
                            <div className="rs-smtp-validate-modal__body">
                                <button
                                    type="button"
                                    className="rs-smtp-validate-modal__close"
                                    onClick={() => setShowValidationModal(false)}
                                    aria-label="Close"
                                >
                                    <i className={`${close_mini} icon-md`} />
                                </button>
                                <div className="rs-smtp-validate-modal__logo">
                                    <img src={resulLogo} alt="Resul" />
                                </div>
                                <h2 className="rs-smtp-validate-modal__title">
                                    Connect your domain to your website
                                </h2>
                                <p className="rs-smtp-validate-modal__subtitle">
                                    You're a few steps away from setting up your domain
                                </p>
                                <div className="rs-smtp-validate-modal__items">
                                    <div className="rs-smtp-validate-modal__item">
                                        <i className={`${lock_medium} rs-smtp-validate-modal__icon`} />
                                        <div>
                                            <div className="rs-smtp-validate-modal__item-title">Secure</div>
                                            <div className="rs-smtp-validate-modal__item-text">
                                                Encrypted login protects your personal data
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rs-smtp-validate-modal__item">
                                        <i className={`${circle_tick_medium} rs-smtp-validate-modal__icon`} />
                                        <div>
                                            <div className="rs-smtp-validate-modal__item-title">Easy</div>
                                            <div className="rs-smtp-validate-modal__item-text">
                                                No developer needed, automatically configure your domain settings to work
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <RSPrimaryButton
                                    className={`rs-smtp-validate-modal__continue ${!isValid || isValidateSettingsLoading ? 'click-off' : ''}`}
                                    isLoading={isValidateSettingsLoading}
                                    blockBodyPointerEvents={isValidateSettingsLoading}
                                    onClick={handleContinueValidation}
                                >
                                    Continue
                                </RSPrimaryButton>
                                <div className="rs-smtp-validate-modal__footer">
                                    By selecting "Continue" you agree to the Entri Terms of Service and Privacy Policy
                                </div>
                            </div>
                        }
                        footer={false}
                    />
                    <RSConfirmationModal
                        show={showDomainIntegratedModal}
                        header={'Domain integration'}
                        text="Your domain will be integrated within the next 12 hours."
                        primaryButtonText="Ok"
                        secondaryButton={false}
                        handleClose={() => setShowDomainIntegratedModal(false)}
                        handleConfirm={() => {
                            setShowDomainIntegratedModal(false);
                        }}
                    />
                    <RSConfirmationModal
                        show={showRestoreDomainModal}
                        header={'Restore domain'}
                        text="The domain already exists, Do you want to restore?"
                        primaryButtonText="Ok"
                        secondaryButtonText="Cancel"
                        handleClose={() => setShowRestoreDomainModal(false)}
                        handleConfirm={async () => {
                            const domainNameDetails = getValues('drpsenderdomainname');
                            const domainName = domainNameDetails?.domainName;
                            if (domainName) {
                                await dispatch(restoreDomainName({ domainName }));
                            }
                            setShowRestoreDomainModal(false);
                        }}
                    />
                </div>
                <div className="buttons-holder">
                    <RSSecondaryButton
                        blockInteraction={isSaveLoading}
                        onClick={() => {
                            if (isSaveLoading) return;
                            setActions({ type: 'SMTP Grid', state: {} });
                        }}
                        id="rs_Edit_Cancel"
                    >
                        Cancel
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        type="submit"
                        isLoading={isSaveLoading}
                        blockBodyPointerEvents={isSaveLoading}
                        disabledClass={`${smtpToggle === 'edit' ? 'pe-none click-off' : ''}`}
                        className={`${
                            validationSettingStatus?.validateStatusCheck && validationSettingStatus?.status ? '' : 'click-off'
                        }`}
                        id="rs_Edit_Submit"
                    >
                        Save
                    </RSPrimaryButton>
                </div>
            </form>
        </FormProvider>
        </CommunicationSettingsEditSkeletonGate>
    );
};

export default Edit;
