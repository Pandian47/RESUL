import { charNumDot, onlyNumbers } from 'Utils/modules/inputValidators';
import { findDuplicates } from 'Utils/modules/dateTime';
import { selectIcon } from 'Utils/modules/display';
import { MAX_LENGTH10, MAX_LENGTH5, MAX_LENGTH63, NUMBER_REGEX } from 'Constants/GlobalConstant/Regex';
import { DUPLICATE_VALUE, ENTER_AVAILABLE_AUDIENCE, ENTER_CLUSTER, ENTER_DOMAIN, ENTER_HIGH, ENTER_LOW, ENTER_MEDIUM, ENTER_NUMBER, ENTER_POTENTIAL_BASE, ENTER_SENDER_NAME, ENTER_SENDER_USERNAME, ENTER_SERVER, ENTER_VOLUME, ENTER_WARMUP } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL, SAVE, SELECT_DOMAIN_NAME, VOLUME } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useState } from 'react';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import RSInput from 'Components/FormFields/RSInput';

import RSTooltip from 'Components/RSTooltip';
import { ActionsType } from '../../..';
import { DOMAIN_SETTINGS_VALUE } from '../../../constants';
import {
    checkSMTPDomainExists,
    getSmtpDomainSettingsById,
    updateSmtpSettings,
} from 'Reducers/preferences/CommunicationSettings/request';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import RSPPophover from 'Components/RSPPophover';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';



const AddDomainName = ({ mode, settingsId }) => {
    // console.log('mode: ', mode);
        const { setDomainToggle, setActions, domainToggle, actions, setFailedApi } = useContext(ActionsType);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    // const { clientId, licenseTypeId, isAgency, userId, departmentId } = getUserDetails();
    const [domainSettings, setDomainSettings] = useState([]);
    const [domainState, setDomainState] = useState({
        loading: false,
        isValid: false,
    });
    const {
        control,
        handleSubmit,
        trigger,
        reset,
        setError,
        setValue,
        formState: { isValid },
    } = useForm(DOMAIN_SETTINGS_VALUE);
    const dispatch = useDispatch();
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isSaveLoading = saveApi.isFetching;

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'lowThrottleList',
    });
    const domainVolumeWatch = useWatch({
        control,
        name: 'lowThrottleList',
    });

    useEffect(() => {
        
        if (actions?.state?.mode === 'edit') {
                        smtpDomainSettings();
        }
    }, []);

    const addLowThrottle = (index) => {
        if (index === 0) {
            let validationState = domainVolumeWatch.findIndex((list) => {
                let values = Object.values(list);
                return values.includes('');
            });
            if (validationState === -1) {
                append({ domainName: '', volume: 0, isDeleted: false });
            } else {
                trigger(`lowThrottleList[${validationState}]`);
            }
        } else {
            let temp = domainVolumeWatch[index];
            temp.isDeleted = true;

            setDomainSettings(temp.hasOwnProperty('lowThrottleSetupId') && [...domainSettings, temp]);

            remove(index);
        }
    };

    const createDomainSettings = async (settings) => {
        debugger
        if (saveApi.isFetching) return;
                        let tempActions = settings?.lowThrottleList?.map((item, idx) => ({
            domainName: item?.domainName,
            lowThrottleSetupId: item?.lowThrottleSetupId || 0,
            volume: item?.volume,
            isDeleted: false,
        }));

                let tempdomainSettings = domainSettings?.length > 0 ? tempActions.concat(domainSettings) : tempActions;
        let payload = {
            smtpDomainSettingId: mode === 'edit' ? settingsId : 0,
            domainName: settings.domainName,
            potentialBase: Number(settings.potentialBase),
            availableAudience: Number(settings.availableAudience),
            noc: Number(settings.noc),
            nos: Number(settings.nos),
            throttleWarmup: Number(settings.throttleWarmup),
            throttleLow: Number(settings.throttleLow),
            throttleMedium: Number(settings.throttleMedium),
            throttleHigh: Number(settings.throttleHigh),
            clientId,
            userId: userId,
            senderName: settings.senderName,
            senderEmailId: settings.SenderemailUsername + '@' + settings.SenderemailDomain,
            // LowThrottleList: [...settings.lowThrottleList, domainSettings],
            LowThrottleList: tempdomainSettings, //[...tempActions, domainSettings],
            departmentId,
        };
        const res = await saveApi.refetch({
            fetcher: () => dispatch(updateSmtpSettings(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
        const { status } = res || {};
        if (status) {
            setActions({
                type: 'Domain Settings',
                state: {},
            });
        } else trigger();
    };

    const checkDomainName = async (value) => {
        const payload = {
            domainName: value,
            clientId,
            userId,
            departmentId,
        };
        setDomainState({
            loading: true,
            isValid: false
        })
        const { status, message } = await dispatch(checkSMTPDomainExists(payload));
        if (!status) {
            setError('domainName', {
                type: 'custom',
                message: message,
            });
            setDomainState({
                loading: false,
                isValid: false
            })
        }
        else {
            setDomainState({
                loading: false,
                isValid: true
            })
            setValue('SenderemailDomain', value);
        }
    };

    const smtpDomainSettings = async () => {
        let payload = {
            smtpDomainSettingId: actions?.state?.settingsId,
            clientId,
            userId: userId,
            departmentId: departmentId,
        };
        let { status, data } = await dispatch(getSmtpDomainSettingsById(payload));
        if (status) {
            let {
                domainName,
                potentialBase,
                availableAudience,
                noc,
                nos,
                throttleWarmup,
                throttleLow,
                throttleMedium,
                throttleHigh,
                lowThrottleList,
                senderName,
                senderEmailId,
                SenderemailDomain,
                SenderemailUsername,
            } = data;
            reset({
                domainName,
                potentialBase,
                availableAudience,
                noc,
                nos,
                throttleWarmup,
                throttleLow,
                throttleMedium,
                throttleHigh,
                lowThrottleList,
                senderName: !senderName  ? '' : senderName,
                senderEmailId,
                SenderemailDomain :domainName,
                SenderemailUsername : !senderEmailId ? '': senderEmailId.split('@')[0]
            });
        } else {
            setFailedApi('GetSmtpDomainbyID');
        }
    };

    return (
        <form onSubmit={handleSubmit(createDomainSettings)}>
            <div className="box-design bd-top-border">
                <div className="SMTP-grouping-block">
                    <div className="rs-sub-heading">
                        <div class="align-items-center d-flex justify-content-between">
                            <h4 class="mb0">Domain settings</h4>
                        </div>
                    </div>
                    <div className="form-group">
                        <Row>
                            {/* Column 1: Domain Name */}
                            <Col sm={3} className="position-relative">
                                <RSInput
                                    control={control}
                                    name={'domainName'}
                                    id="rs_AddDomainName_domainName"
                                    required
                                    placeholder="Domain name"
                                    defaultValue={domainToggle === 'edit' ? 'https::' : ''}
                                    disabled={domainToggle === 'edit'}
                                    isLoading={domainState.loading}
                                    isValidIcon={domainState.isValid}
                                    onKeyDown={charNumDot}
                                    maxLength={MAX_LENGTH63}
                                    rules={{
                                        required: ENTER_DOMAIN,
                                    }}
                                    handleOnBlur={(e) => {
                                        const { value } = e?.target;
                                        if (value?.length > 3) checkDomainName(value);
                                    }}
                                />
                                <RSPPophover position="top" text={'Only domain name'}>
                                    <i
                                        className={`${circle_question_mark_mini} icon-xs blue cp color-primary-blue position-absolute right15 bottom-20`}
                                        id="circle_question_mark"
                                    ></i>
                                </RSPPophover>
                            </Col>
                            <Col sm={3} className="position-relative">
                                <RSInput
                                    control={control}
                                    name={'potentialBase'}
                                    id="rs_AddDomainName_potentialBase"
                                    placeholder="Potential base"
                                    required
                                    maxLength={MAX_LENGTH10}
                                    onKeyDown={(e) => onlyNumbers(e)}
                                    rules={{
                                        required: ENTER_POTENTIAL_BASE,
                                        pattern: {
                                            value: NUMBER_REGEX,
                                            message: ENTER_NUMBER,
                                        },
                                    }}
                                />
                                <small className="position-absolute right15">Total base 100%</small>
                            </Col>

                            <Col sm={3}>
                                <RSInput
                                    control={control}
                                    name="nos"
                                    id="rs_AddDomainName_nos"
                                    placeholder="Number of servers"
                                    required
                                    maxLength={5}
                                    onKeyDown={(e) => onlyNumbers(e)}
                                    rules={{
                                        required: ENTER_SERVER,
                                        pattern: {
                                            value: NUMBER_REGEX,
                                            message: ENTER_NUMBER,
                                        },
                                    }}
                                />
                            </Col>

                            {/* Column 4: Available Audience */}
                            <Col sm={3} className="position-relative">
                                <RSInput
                                    control={control}
                                    name={'availableAudience'}
                                    id="rs_AddDomainName_availableAudience"
                                    placeholder="Volume of available audience"
                                    required
                                    maxLength={MAX_LENGTH10}
                                    onKeyDown={(e) => onlyNumbers(e)}
                                    rules={{
                                        required: ENTER_AVAILABLE_AUDIENCE,
                                        pattern: {
                                            value: NUMBER_REGEX,
                                            message: ENTER_NUMBER,
                                        },
                                    }}
                                />
                                <small className="position-absolute right15">/Day</small>
                            </Col>
                        </Row>

                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={12}>
                                <Row>
                                    <Col sm={3}>
                                        <RSInput
                                            control={control}
                                            id="rs_Email_senderName"
                                            name="senderName"
                                            placeholder="Sender name"
                                            required
                                            rules={{
                                                required: ENTER_SENDER_NAME,
                                            }}
                                        />
                                    </Col>

                                    <Col sm={6} className="position-relative">
                                        <Row className="align-items-center position-relative">
                                            <Col sm={6} className="pr-2">
                                                <RSInput
                                                    control={control}
                                                    name="SenderemailUsername"
                                                    onChange={(e) => {
                                                        const newValue = e.target.value;
                                                        setEmailParts((prev) => ({ ...prev, username: newValue }));
                                                        setValue('SenderemailUsername', `${newValue}@${emailParts.domain}`);
                                                    }}
                                                    placeholder="Sender email username"
                                                    required
                                                    rules={{
                                                        required: ENTER_SENDER_USERNAME,
                                                    }}
                                                />
                                            </Col>

                                            {/* Positioned @ symbol */}
                                            <span className='emailDomain-symbol'> @</span>

                                            <Col sm={6} className="pl-2">
                                                <RSInput
                                                    control={control}
                                                    name="SenderemailDomain"
                                                    placeholder="Sender email domain"
                                                    disabled={true}
                                                    required
                                                />
                                            </Col>
                                        </Row>
                                    </Col>



                                    <Col sm={3}>
                                        <RSInput
                                            control={control}
                                            name="noc"
                                            placeholder="Number of clusters"
                                            id="rs_AddDomainName_noc"
                                            required
                                            maxLength={MAX_LENGTH5}
                                            onKeyDown={(e) => onlyNumbers(e)}
                                            rules={{
                                                required: ENTER_CLUSTER,
                                                pattern: {
                                                    value: NUMBER_REGEX,
                                                    message: ENTER_NUMBER,
                                                },
                                            }}
                                        />
                                    </Col>


                                </Row>
                            </Col>
                        </Row>
                    </div>
                </div>
                <div className="SMTP-grouping-block">
                    <div className="rs-sub-heading">
                        <div class="align-items-center d-flex">
                            <h4 class="mb0">Throttle slab/daily</h4>&nbsp; <small>(Throttle volume per day)</small>
                        </div>
                    </div>

                    <div className="form-group">
                        <Row>
                            <Col sm={6}>
                                <Row>
                                    <Col sm={6}>
                                        <RSInput
                                            control={control}
                                            name={'throttleWarmup'}
                                            id="rs_AddDomainName_throttleWarmup"
                                            placeholder="Warmup"
                                            defaultValue={''}
                                            required
                                            maxLength={MAX_LENGTH10}
                                            onKeyDown={(e) => onlyNumbers(e)}
                                            rules={{
                                                required: ENTER_WARMUP,
                                                pattern: {
                                                    value: NUMBER_REGEX,
                                                    message: ENTER_NUMBER,
                                                },
                                            }}
                                        />
                                    </Col>
                                    <Col sm={6}>
                                        <RSInput
                                            control={control}
                                            name={'throttleLow'}
                                            id="rs_AddDomainName_throttleLow"
                                            placeholder="Low"
                                            defaultValue={''}
                                            required
                                            maxLength={MAX_LENGTH10}
                                            onKeyDown={(e) => onlyNumbers(e)}
                                            rules={{
                                                required: ENTER_LOW,
                                                pattern: {
                                                    value: NUMBER_REGEX,
                                                    message: ENTER_NUMBER,
                                                },
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </Col>
                            <Col sm={6}>
                                <Row>
                                    <Col sm={6}>
                                        <RSInput
                                            control={control}
                                            name={'throttleMedium'}
                                            id="rs_AddDomainName_throttleMedium"
                                            placeholder="Medium"
                                            defaultValue={''}
                                            required
                                            maxLength={MAX_LENGTH10}
                                            onKeyDown={(e) => onlyNumbers(e)}
                                            rules={{
                                                required: ENTER_MEDIUM,
                                                pattern: {
                                                    value: NUMBER_REGEX,
                                                    message: ENTER_NUMBER,
                                                },
                                            }}
                                        />
                                    </Col>
                                    <Col sm={6}>
                                        <RSInput
                                            control={control}
                                            name={'throttleHigh'}
                                            id="rs_AddDomainName_throttleHigh"
                                            placeholder="High"
                                            defaultValue={''}
                                            required
                                            maxLength={MAX_LENGTH10}
                                            onKeyDown={(e) => onlyNumbers(e)}
                                            rules={{
                                                required: ENTER_HIGH,
                                                pattern: {
                                                    value: NUMBER_REGEX,
                                                    message: ENTER_NUMBER,
                                                },
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>
                </div>
                {fields?.length  && (  <div className="rs-sub-heading">
                    <div class="align-items-center d-flex justify-content-between">
                        <h4 class="mb0">Low throttle setup</h4>
                    </div>
                </div>)}
                <div className="form-group">
                    <Row>
                        {fields.map((field, index) => (
                            <div key={field.id} className="thorttleContainer">
                                <Row>
                                    <Col sm={6}>
                                        <RSInput
                                            control={control}
                                            name={`lowThrottleList[${index}].domainName`}
                                            id="rs_AddDomainName_lowThrottleListdomainName"
                                            placeholder={SELECT_DOMAIN_NAME}
                                            defaultValue={domainToggle === 'edit' ? 'https::' : ''}
                                            // disabled={domainToggle === 'edit'}
                                            required
                                            rules={{
                                                required: ENTER_DOMAIN,
                                                validate: () => {
                                                    const [status, _] = findDuplicates(domainVolumeWatch, 'domainName');
                                                    return status ? DUPLICATE_VALUE : true;
                                                },
                                            }}
                                        />
                                    </Col>
                                    <Col sm={6}>
                                        <Row>
                                            <Col sm={11} className="position-relative pr0">
                                                <RSInput
                                                    control={control}
                                                    name={`lowThrottleList[${index}].volume`}
                                                    id="rs_AddDomainName_lowThrottleListdomainvolume"
                                                    placeholder={VOLUME}
                                                    defaultValue={domainToggle === 'edit' ? 'https::' : ''}
                                                    // disabled={domainToggle === 'edit'}
                                                    required
                                                    maxLength={MAX_LENGTH10}
                                                    onKeyDown={(e) => onlyNumbers(e)}
                                                    rules={{
                                                        required: ENTER_VOLUME,
                                                        pattern: {
                                                            value: NUMBER_REGEX,
                                                            message: ENTER_NUMBER,
                                                        },
                                                    }}
                                                />
                                                <small className="position-absolute right0">/hour</small>
                                            </Col>
                                            <Col sm={1} className="pr0 pl9">
                                                <div className="position-relative  ml0 mt6 d-flex">
                                                    <RSTooltip
                                                        text={index === 0 ? 'Add' : 'Delete'}
                                                        position="top"
                                                        className="lh0"
                                                    >
                                                        <i
                                                            onClick={() => addLowThrottle(index)}
                                                            className={`${selectIcon(index)} icon-md cp ${
                                                                fields?.length > 4 && index == 0 ? 'click-off' : ''
                                                            }`}
                                                        ></i>
                                                    </RSTooltip>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        ))}
                    </Row>
                </div>
            </div>
            {/* </div> */}
            <div className="buttons-holder">
                <RSSecondaryButton
                    blockInteraction={isSaveLoading}
                    onClick={() => {
                        if (isSaveLoading) return;
                        setActions({
                            type: 'Domain Settings',
                            state: {},
                        });
                    }}
                    id="rs_AddDomainName_Cancel"
                >
                    {CANCEL}
                </RSSecondaryButton>
                <RSPrimaryButton
                    type="submit"
                    isLoading={isSaveLoading}
                    blockBodyPointerEvents={isSaveLoading}
                    className={isValid ? '' : 'click-off'}
                    id="rs_AddDomainName_Save"
                >
                    {SAVE}
                </RSPrimaryButton>
            </div>
        </form>
    );
};

export default AddDomainName;
