import { onlyNumbers } from 'Utils/modules/inputValidators';
import { validateIsCustomNavigate } from 'Utils/modules/navigation';
import { updateQueryParams } from 'Utils/modules/urlQuery';
import { DOMAIN_NAME_EXISTS } from 'Constants/GlobalConstant/ValidationMessage';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { parse } from 'tldts';
import { getSessionId } from 'Reducers/globalState/selector';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSConfirmationModal from 'Components/ConfirmationModal';
import ListNameExists from 'Components/ListNameExists';
import RSInput from 'Components/FormFields/RSInput';

import { Row, Col } from 'react-bootstrap';
import useApiLoader from 'Hooks/useApiLoader';
import useQueryParams from 'Hooks/useQueryParams';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { CommunicationSettingsDomainEditSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';

import { checkDomainExist, getDkimValues, sendDkimDetailsMail, restoreDomainName } from 'Reducers/preferences/CommunicationSettings/request';
import { ActionsType } from '../..';



const STEP_INPUT = 'input';
const STEP_CONNECT = 'connect';

const CREATE_COMM_DOMAIN_QUERY_KEYS_TO_CLEAR = {
    backNavigationDetails: null,
    backAction: null,
    mode: null,
    from: null,
    campaignType: null,
};

function getQuickAddDomainPrimaryButtonState({
    isEditMode,
    domainCheckedAndValid,
    errors,
    currentVolumeStr,
}) {
    const hasFieldErrors = !!(errors?.quickDomainName || errors?.volume);
    const baseInvalid = !domainCheckedAndValid || hasFieldErrors;

    const disabled = isEditMode
        ? baseInvalid
        : baseInvalid || !currentVolumeStr;

    return {
        disabled,
        disabledClass: disabled ? 'click-off pe-none' : '',
    };
}

const QuickAddDomain = ({ mode, settingsId, domainStatus }) => {
    const [authToken, setAuthToken] = useState('');
    const [validatedDomainName, setValidatedDomainName] = useState('');
    const [openExistDomainModal, setOpenExistDomainModal] = useState(false);
    const [openAlertModal, setOpenAlertModal] = useState(false);
    const [dkimFailModal, setDkimFailModal] = useState({
        show: false
    });
    const [domainCheckedAndValid, setDomainCheckedAndValid] = useState(false);
    const [domainValidationResult, setDomainValidationResult] = useState(null);
    const [originalDomainName, setOriginalDomainName] = useState('');
    const [originalVolume, setOriginalVolume] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const queryState = useQueryParams('/preferences/communication-settings');
    const isNavigatingBackRef = useRef(false);
    const isCreateCommDomainFlow =
        queryState?.from === 'CreateCommunication' && queryState?.mode === 'add';
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const { setActions } = useContext(ActionsType);
    const isEditMode = mode === 'edit' && settingsId;
    const sessionReady = Boolean(clientId && userId != null && departmentId != null);
    const domainEditApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'edit' });
    const domainSubmitApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const domainStatusNorm =
        domainStatus != null && String(domainStatus).trim() !== ''
            ? String(domainStatus).trim().toUpperCase()
            : '';
    const domainNameFieldClickOff =
        isEditMode && domainStatusNorm !== 'PENDING';

    const methods = useForm({
        defaultValues: { quickDomainName: '', volume: '' },
        mode: 'onTouched',
    });
    const {
        getValues,
        watch,
        setError,
        setValue,
        reset,
        control,
        trigger,
        formState: { errors },
    } = methods;
    const watchedDomain = watch('quickDomainName');
    const watchedVolume = watch('volume');

    useEffect(() => {
        setDomainCheckedAndValid(false);
        setDomainValidationResult(null);
    }, [watchedDomain]);

    const applyRestoreDomainResponse = useCallback(
        (res) => {
            if (res?.status === false || res == null || typeof res !== 'object') {
                return;
            }
            const data = res?.data;
            if (data == null || typeof data !== 'object') {
                return;
            }
            const domainName = data.domainName || '';
            const firstLowThrottle = data.lowThrottleList && data.lowThrottleList[0];
            const volume =
                firstLowThrottle?.volume != null
                    ? String(firstLowThrottle.volume)
                    : data.volume != null
                      ? String(data.volume)
                      : '';
            setOriginalDomainName(domainName);
            setOriginalVolume(volume);
            reset({ quickDomainName: domainName, volume: volume || '' });
            setValidatedDomainName(domainName);
            setDomainCheckedAndValid(!!domainName);
        },
        [reset],
    );

    const loadDomainForEdit = useCallback(() => {
        if (!isEditMode || !settingsId || !sessionReady) {
            return undefined;
        }
        return domainEditApi.refetch({
            fetcher: () =>
                dispatch(
                    restoreDomainName({
                        smtpDomainSettingId: settingsId,
                        clientId,
                        userId,
                        departmentId,
                    }),
                ),
            loaderConfig: fieldLoaderConfig,
            mode: 'edit',
            onSuccess: applyRestoreDomainResponse,
        });
    }, [
        isEditMode,
        settingsId,
        sessionReady,
        clientId,
        userId,
        departmentId,
        dispatch,
        domainEditApi.refetch,
        applyRestoreDomainResponse,
    ]);

    useEffect(() => {
        loadDomainForEdit();
    }, [loadDomainForEdit]);
    const currentDomainTrimmed = (watchedDomain && watchedDomain.trim()) || '';
    const currentVolumeStr = (watchedVolume != null && watchedVolume !== '') ? String(watchedVolume).trim() : '';
    const isDomainSameAndVolumeChanged =
        isEditMode &&
        (
            currentDomainTrimmed !== originalDomainName.trim() ||
            currentVolumeStr !== String(originalVolume).trim()
        );

    useEffect(() => {
        if (isEditMode && originalDomainName && currentDomainTrimmed === originalDomainName.trim()) {
            setDomainCheckedAndValid(true);
        }
    }, [isEditMode, originalDomainName, currentDomainTrimmed]);

    const primaryButtonState = getQuickAddDomainPrimaryButtonState({
        isEditMode,
        domainCheckedAndValid,
        errors,
        currentVolumeStr,
        isDomainSameAndVolumeChanged,
    });

    const runTldtsCheck = (value) => {
        const trimmed = value?.trim?.();
        if (!trimmed) {
            setDomainValidationResult(null);
            return;
        }
        const parsed = parse(trimmed);
        if (!parsed.isIcann || !parsed.hostname) {
            setDomainValidationResult(null);
            return;
        }
        const isRootDomain = parsed.subdomain === null || parsed.subdomain === '';
        if (isRootDomain) {
            setDomainValidationResult({
                isValid: true,
                isRootDomain: true,
                isSubdomain: false,
                message: 'Use a dedicated subdomain (e.g., mail.yourdomain.com) to protect your reputation.',
            });
        } else {
            setDomainValidationResult({
                isValid: true,
                isRootDomain: false,
                isSubdomain: true,
                message: '',
            });
        }
    };

    useEffect(() => {
        fetchToken();
        const handleOnEntriClose = (event) => {
            const detail = event.detail || {};
            if (detail.success) {
                sendDKIMMailDetails(detail.domain);
            } else if (isCreateCommDomainFlow && !isEditMode) {
                handleReturn();
            } else {
                handleReturnToDomainSettings();
            }
        };
        window.addEventListener('onEntriClose', handleOnEntriClose, false);
        return () => {
            window.removeEventListener('onEntriClose', handleOnEntriClose);
            if (isCreateCommDomainFlow && !isEditMode && !isNavigatingBackRef.current) {
                updateQueryParams(CREATE_COMM_DOMAIN_QUERY_KEYS_TO_CLEAR);
            }
        };
    }, []);

    const fetchToken = async () => {
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
            }
        } catch (err) {
        }
    };

    const sendDKIMMailDetails = async (domainName) => {
        const payload = { domainName, userId, clientId, departmentId };
        const { status } = await dispatch(sendDkimDetailsMail(payload));
        if (isCreateCommDomainFlow && !isEditMode) {
            handleReturn();
            return;
        }
        if (status) {
            setOpenAlertModal(true);
        }
        handleReturnToDomainSettings();
    };

    const handleReturnToDomainSettings = () => {
        setActions({
            type: 'Domain Settings',
            state: {},
        });
    };

    const handleReturn = () => {
        if (isCreateCommDomainFlow && !isEditMode) {
            isNavigatingBackRef.current = true;
            validateIsCustomNavigate(queryState, queryState, navigate, handleReturnToDomainSettings, { dispatch });
            return;
        }
        handleReturnToDomainSettings();
    };

    const handleListNameValid = (isValid) => {
        setDomainCheckedAndValid(!!isValid);
        if (isValid) {
            const domain = getValues('quickDomainName')?.trim() || '';
            setValidatedDomainName(domain);
            runTldtsCheck(domain);
        } else {
            setDomainValidationResult(null);
        }
    };

    const handleAddDomain = async () => {
        const formOk = await trigger(['quickDomainName', 'volume']);
        if (!formOk) return;
        if (!domainCheckedAndValid) return;
        if (domainSubmitApi.isFetching) return;

        const volume = getValues('volume')?.trim() || '';
        const payload = { domainName: validatedDomainName, userId, clientId, departmentId, volume };

        await domainSubmitApi.refetch({
            fetcher: async () => {
                const resExist = await dispatch(checkDomainExist(payload, false));
                return runDomainSubmitAfterExistCheck(resExist, payload, volume);
            },
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
    };

    const runDomainSubmitAfterExistCheck = async (resExist, payload, volume) => {
        const dkimPayload = {
            ...payload,
            smtpdomainSettingId: isEditMode && settingsId ? settingsId : 0,
        };

        let domainRequestData = validatedDomainName.replaceAll('.', '');
        let spfRequestData = '@';
        let subDomainData = '';
        let dmarcDomainName = validatedDomainName;
        let dmarcHostName = '';

        if (validatedDomainName.split('.').length > 2) {
            let listDomainSplit = validatedDomainName.split('.');
            subDomainData = '.' + listDomainSplit[0];
            spfRequestData = listDomainSplit[0];
            dmarcHostName = '.' + listDomainSplit[0];
        }

        if (domainCheckedAndValid) {
            let resDkim = await dispatch(getDkimValues(dkimPayload));
            if (resDkim?.status) {
                resDkim = {
                    status: resDkim?.status || false,
                    message: resDkim?.message || 'success',
                    data: {
                        ipSpfRecord: resDkim?.data?.ipSpfRecord,
                        spfRecord: resDkim?.data?.spfRecord || '',
                        dkimRecord:
                            resDkim?.data.dkimRecord || '', // 'v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq6lCu+gloo+V7AIsrhud VYGORn9NY0Iclu6hJJdbS+AAOSnhZ6TdvCn1cje1R4hyzAv4ePM41U1WjElviX3g nq0PGVfOFC/NosEBnfZMDcfSrNAHfIwMtwx+ZfJ2vSUzmWrYEjSNUsG7OHoLtN6I hdHYb5n+f9SPMvpCBO6Ytz+z/8ZQLTNzji7wKD2rkd29MvqOy8UMJDuYqi81RZnU O/k2Li2YLkqV9XJdy2Qu0LKAV7fd36nVwY6aSxMpi56UTOZm4RkDaYa7+jEJBpk0 IE0+anilrF/rMYOvyIespSZAOlRYltFuOBbavzD2fp0+a+Q5W8KhLg958NZ8WeLK RQIDAQAB ',
                        dkimSelector: resDkim?.data.dkimSelector || '', //'mailrrco._domainkey',
                        dmarcRecord: resDkim?.data.dmarcRecord || '', //'Does not exists',
                        aRecords: resDkim?.data.aRecords || [],
                        // [
                        //     {
                        //         domain: 'rr.co',
                        //         host: 'res01090',
                        //         type: 'A',
                        //         ttl: 'Default',
                        //         value: '216.22.1.90',
                        //     },
                        //     {
                        //         domain: 'rr.co',
                        //         host: 'res01068',
                        //         type: 'A',
                        //         ttl: 'Default',
                        //         value: '216.22.1.68',
                        //     },
                        // ],
                        mxRecords: resDkim?.data.mxRecords || [],
                        //  [
                        //     {
                        //         domain: 'rr.co',
                        //         host: 'res01090',
                        //         type: 'MX',
                        //         priority: '5',
                        //         value: 'res01090.rr.co',
                        //     },
                        //     {
                        //         domain: 'rr.co',
                        //         host: 'res01068',
                        //         type: 'MX',
                        //         priority: '5',
                        //         value: 'res01068.rr.co',
                        //     },
                        // ],
                    },
                };
                if (window.entri && authToken !== '') {
                    window.entri.showEntri(
                        devtestConfig({
                            dKimRecordData: resDkim.data.dkimRecord,
                            domainNameData: domainRequestData,
                            spfHostName: spfRequestData,
                            subDomain: subDomainData,
                            dmarcDomainName,
                            dmarcHostName,
                            isSpfRecordExist: resDkim.data.spfRecord !== '',
                            isDmarcRecordExist: resDkim.data.dmarcRecord !== '',
                            aRecords: resDkim.data.aRecords,
                            mxRecords: resDkim.data.mxRecords,
                            ipSpfRecord: resDkim.data.ipSpfRecord,
                            spfRecord: resDkim.data.spfRecord
                        }),
                    );
                }
            } else {
                const message = resDkim?.message || 'Failed to fetch DKIM details, please try again.';
                const domainName = getValues('quickDomainName') || '';
                const volumeVal = getValues('volume') || 0;
                const smtpStatus = resDkim?.smtpStatus ?? false;
                if (smtpStatus) {
                    setDkimFailModal({
                        show: true,
                        domain: domainName,
                        volume: volumeVal,
                    });
                } else {
                    setDkimFailModal({
                        show: false
                    });
                    setError('quickDomainName', {
                        type: 'server',
                        message,
                    });
                }
            }
        }
    };

    const handleRestoreDomain = async () => {
        const payload = { domainName: validatedDomainName };
        const res = await dispatch(restoreDomainName(payload));
        if (res?.status !== false) {
            setOpenExistDomainModal(false);
        }
    };

    const devtestConfig = ({
        dKimRecordData,
        domainNameData,
        spfHostName,
        subDomain,
        dmarcDomainName,
        dmarcHostName,
        isSpfRecordExist,
        isDmarcRecordExist,
        aRecords = [],
        mxRecords = [],
        ipSpfRecord = [],
        spfRecord = ''
    }) => {
        let dnsRecordsTemp = [
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
                value: spfRecord || 'v=spf1 include:spf1.resulticks.in ~all',
                ttl: 300,
            });
        }
        if (ipSpfRecord?.length) {
            ipSpfRecord?.forEach((record) => {
                dnsRecordsTemp.push({
                    type: 'TXT',
                    host: record?.host,
                    value: record?.value,
                    ttl: 300,
                })
            })
        }
        if (isDmarcRecordExist) {
            dnsRecordsTemp.push({
                type: 'TXT',
                host: `_dmarc${dmarcHostName}`,
                value: `v=DMARC1;p=none;rua=mailto:dmc@${dmarcDomainName}; fo=1`,
                ttl: 300,
            });
        }
        if (aRecords && aRecords.length > 0) {
            aRecords.forEach((item) => {
                dnsRecordsTemp.push({
                    type: 'A',
                    host: item.host,
                    value: item.value,
                    ttl: item.ttl === 'Default' ? 300 : parseInt(item.ttl) || 300,
                });
            });
        }
        if (mxRecords && mxRecords.length > 0) {
            mxRecords.forEach((item) => {
                dnsRecordsTemp.push({
                    type: 'MX',
                    host: item.host,
                    priority: parseInt(item.priority) || 5,
                    value: item.value,
                    ttl: item.ttl === 'Default' ? 300 : parseInt(item.ttl) || 300,
                });
            });
        }
        return {
            applicationId: 'resulticks',
            token: authToken,
            userId: 'user12345',
            prefilledDomain: validatedDomainName,
            dnsRecords: dnsRecordsTemp,
            enableDkim: true,
            whiteLabel: {
                hideEntriLogo: true,
                hideConfetti: true,
                logo: 'https://reacuix.resul.io/assets/resulticks-logo-blue-bff3c259.svg',
                theme: { fg: '#ffffff', bg: '#07fa13ff' },
                removeLogoBorder: true,
            },
        };
    };

    const generateDynamicConfig = (domainNameData, spfHostName, subDomain, dmarcDomainName, dmarcHostName) => {
        return {
            applicationId: 'resulticks',
            token: authToken,
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
            whiteLabel: {
                hideEntriLogo: true,
                hideConfetti: true,
                logo: 'https://reacuix.resul.io/assets/resulticks-logo-blue-bff3c259.svg',
                theme: { fg: '#ffffff', bg: '#fb26fa' },
                removeLogoBorder: true,
            },
        };
    };

    const isDomainFormLoading = isEditMode && domainEditApi.isFetching;
    const isDomainSubmitting = domainSubmitApi.isFetching;

    return (
        <>
            <CommunicationSettingsDomainEditSkeletonGate isLoading={isDomainFormLoading} isEditMode={isEditMode}>
            <form>
                <FormProvider
                    {...methods}
                    key={
                        isEditMode
                            ? `edit-domain-${settingsId}-${domainStatus ?? ''}`
                            : 'add-domain'
                    }
                >
                    <div className="box-design bd-top-border">
                        <div className="SMTP-grouping-block">
                            <div className="rs-sub-heading">
                                <div className="align-items-center d-flex justify-content-between">
                                    <h4 className="mb0">Domain settings</h4>
                                </div>
                            </div>
                            <div className="form-group">
                                <Row>
                                    <Col sm={6} className={domainNameFieldClickOff ? 'click-off pe-none' : ''}>
                                        <ListNameExists
                                            name="quickDomainName"
                                            field="domainName"
                                            apiCallback={({ payload }) => checkDomainExist(payload)}
                                            condition={(data) => !data?.status}
                                            customError={DOMAIN_NAME_EXISTS}
                                            placeholder="Enter domain name"
                                            isDomain
                                            onValid={handleListNameValid}
                                            currentValue={isEditMode ? originalDomainName : ''}
                                            extraPayload={isEditMode && settingsId ? { smtpDomainSettingId: settingsId } : {}}
                                            rules={{
                                                required: 'Enter domain name',
                                                pattern: {
                                                    value: /^\s*([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}\s*$/i,
                                                    message: 'Invalid domain format',
                                                },
                                            }}
                                        />
                                        {domainValidationResult && <small>{domainValidationResult.message}</small>}
                                    </Col>
                                    <Col sm={6}>
                                        <RSInput
                                            control={control}
                                            name="volume"
                                            placeholder="Volume per day"
                                            maxLength={10}
                                            onKeyDown={(e) => onlyNumbers(e)}
                                            rules={{
                                                required: ' Enter volume per day',
                                                pattern: {
                                                    value: /^\d+$/,
                                                    message: 'Only numbers allowed',
                                                },
                                                validate: (value) => {
                                                    const num = parseInt(value, 10);
                                                    if (Number.isNaN(num) || num <= 0) return ' Enter valid volume.';
                                                    if (num < 100) return 'Enter volume greater than 100';
                                                    return true;
                                                },
                                            }}
                                            required
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>

                    <div className="buttons-holder">
                        <RSSecondaryButton
                                    blockInteraction={isDomainSubmitting}
                            onClick={() => {
                                        if (isDomainSubmitting) return;
                                handleReturn();
                            }}
                        >
                            {'Cancel'}
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            id="rs_quick_domain_add"
                            type="button"
                            disabled={primaryButtonState.disabled || isDomainSubmitting}
                            disabledClass={
                                primaryButtonState.disabled || isDomainSubmitting
                                    ? 'click-off pe-none'
                                    : primaryButtonState.disabledClass
                            }
                                    isLoading={isDomainSubmitting}
                                    blockBodyPointerEvents={isDomainSubmitting}
                            onClick={handleAddDomain}
                        >
                            {isEditMode ? 'Update domain' : 'Add domain'}
                        </RSPrimaryButton>
                    </div>
                </FormProvider>
            </form>
            </CommunicationSettingsDomainEditSkeletonGate>
            {openAlertModal && (
                <RSConfirmationModal
                    show={openAlertModal}
                    text="Your domain will be integrated within the next 12 hours."
                    primaryButtonText="Ok"
                    secondaryButton={false}
                    handleConfirm={() => {
                        setOpenAlertModal(false);
                    }}
                    header="Information"
                />
            )}
            {openExistDomainModal && (
                <RSConfirmationModal
                    show={openExistDomainModal}
                    text="The domain already exists, Do you want to restore?"
                    primaryButtonText="Ok"
                    secondaryButtonText="Cancel"
                    handleClose={() => setOpenExistDomainModal(false)}
                    handleConfirm={handleRestoreDomain}
                    header="Confirm"
                />
            )}
            {dkimFailModal?.show && (
                <RSConfirmationModal
                    show={dkimFailModal?.show}
                    htmlContent={
                        <p className="text-center">
                            The domain <b className='font-bold'>{dkimFailModal.domain}</b> is not yet mapped to a sending server. A sending
                            server allocation request has been raised based on the provided volume{' '}
                            <b className='font-bold'>({dkimFailModal.volume} emails/day)</b>. You will be notified once the setup is complete.
                        </p>
                    }
                    primaryButtonText="Ok"
                    secondaryButton={false}
                    handleConfirm={() => {
                        setDkimFailModal(null);
                        if (isCreateCommDomainFlow && !isEditMode) {
                            handleReturn();
                        } else {
                            handleReturnToDomainSettings();
                        }
                    }}
                    handleClose={() => {
                        setDkimFailModal(null);
                        if (isCreateCommDomainFlow && !isEditMode) {
                            handleReturn();
                        } else {
                            handleReturnToDomainSettings();
                        }
                    }}
                    header="Domain setup"
                />
            )}
        </>
    );
};

export default QuickAddDomain;
