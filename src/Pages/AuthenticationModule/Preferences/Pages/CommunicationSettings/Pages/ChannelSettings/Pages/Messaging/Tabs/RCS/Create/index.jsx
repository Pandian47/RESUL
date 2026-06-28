import { findDuplicates } from 'Utils/modules/dateTime';
import { selectIcon } from 'Utils/modules/display';
import { MAX_LENGTH10, MAX_LENGTH100, MAX_LENGTH256, MAX_LENGTH50, MAX_LENGTH500, MAXL_LENGTH1024, URLPATTERN } from 'Constants/GlobalConstant/Regex';
import { ACCESS_POINT as ACCESS_POINT_MSG, DUPLICATE_VALUE, ENTER_AUTHORIZATION_KEY, ENTER_PASSWORD, ENTER_SENDER_ID, ENTER_SENDER_NAME, ENTER_TEMPLATE_ID, ENTER_TEMPLATE_NAME, ENTER_USERNAME, ENTER_VALID_ACCESS_POINT, SELECT_PROVIDER } from 'Constants/GlobalConstant/ValidationMessage';
import { ACCESS_POINT, AUTHORIZATION_KEY, CANCEL, PASSWORD, PROVIDER, SENDER_DETAILS, SENDER_ID, SENDER_NAME, TEMPLATE, TEMPLATE_NAME, USER_NAME } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { useForm, FormProvider, useFieldArray, useWatch } from 'react-hook-form';
import _find from 'lodash/find';

import RSTooltip from 'Components/RSTooltip';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import { FORM_INITIAL_STATE } from '../constants';

import usePermission from 'Hooks/usePersmission';
import {
    createCSRCSSettings,
    getCSRCSCreateProviders,
    getCSRCSUpdateGet,
} from 'Reducers/preferences/CommunicationSettings/request';
import { getCSServiceProvidersData } from 'Reducers/preferences/CommunicationSettings/selector';
import { getSessionId } from 'Reducers/globalState/selector';
import useOnlyDepChangeEffect from 'Hooks/useOnlyDepChangeEffect';

const RCSCreate = ({ type, config, handleCancel, setFailedApi }) => {
    const dispatch = useDispatch();
    const methods = useForm(FORM_INITIAL_STATE);
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const [senderAndResponse, setSenderAndResponse] = useState({
        sender: [],
        response: [],
    });

    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const providers = useSelector((state) => getCSServiceProvidersData(state));
    const isUpdate = type === 'edit';

    const { control, handleSubmit, trigger, setValue, reset } = methods;

    const {
        fields: senderFields,
        append: senderAppend,
        remove: senderRemove,
    } = useFieldArray({
        control,
        name: 'senderDetails',
    });

    const senderDetailsWatch = useWatch({
        control,
        name: 'senderDetails',
    });

    useEffect(() => {
        dispatch(getCSRCSCreateProviders({ type: 'R', departmentId, clientId, userId }));
        if (isUpdate) getUpdateData();
    }, []);

    const getUpdateData = async () => {
        const res = await dispatch(
            getCSRCSUpdateGet({ clientRCSSettingID: config?.clientRCSSettingId, departmentId, clientId, userId }),
        );
        const { status, data } = res;
        if (status) {
            let { accessPoint, authorizationKey, rcsResponse, rcsSender, serviceProviderId, userName, password } = data;
            let tempProvider = providers?.filter((item) => item?.serviceProviderId === serviceProviderId);
            reset(
                (prev) => ({
                    ...prev,
                    authorizationKey,
                    accessPoint,
                    userName,
                    password,
                    rcsResponse: rcsResponse?.map((res) => ({
                        ...res,
                        isDelete: false,
                    })),
                    senderDetails: rcsSender?.map((res) => ({
                        ...res,
                        isDelete: false,
                    })),
                    provider: tempProvider?.[0],
                }),
                { keepIsValid: true },
            );
        } else {
            setFailedApi('GetRCSSettigByID');
        }
    };

    useOnlyDepChangeEffect(() => {
        if (isUpdate) setValue('provider', _find(providers, ['serviceProviderId', config?.serviceProviderId]));
    }, [providers]);

    const addsenderDetails = (index) => {
        if (index === 0) {
            let validationState = senderDetailsWatch.findIndex((list) => {
                let values = Object.values(list);
                return values.includes('');
            });

            if (validationState === -1) {
                senderAppend({ senderId: '', senderName: '', isDelete: false });
            } else {
                trigger(`senderDetails[${validationState}]`);
            }
        } else {
            let temp = senderDetailsWatch[index];
            temp.isDelete = true;
            setSenderAndResponse((prev) => ({
                ...prev,
                sender: [...senderAndResponse?.sender, temp],
            }));
            senderRemove(index);
        }
    };

    const {
        fields: responseFields,
        append: responseAppend,
        remove: responseRemove,
    } = useFieldArray({
        control,
        name: 'rcsResponse',
    });

    const rcsResponseWatch = useWatch({
        control,
        name: 'rcsResponse',
    });

    const addrcsResponse = (index) => {
        if (index === 0) {
            let validationState = rcsResponseWatch.findIndex((list) => {
                let values = Object.values(list);
                return values.includes('');
            });
            if (validationState === -1) {
                responseAppend({ template: '', templateName: '', isDelete: false });
            } else {
                trigger(`rcsResponse[${validationState}]`);
            }
        } else {
            let temp = rcsResponseWatch[index];
            temp.isDelete = true;
            setSenderAndResponse((prev) => ({
                ...prev,
                response: [...senderAndResponse?.response, temp],
            }));
            responseRemove(index);
        }
    };

    const handleFormSubmit = (formState) => {
        let rcsSender = formState.senderDetails?.map((res) => ({
            clientrcsSenderID: isUpdate ? res.clientrcsSenderId : 0,
            senderId: res.senderId,
            senderName: res.senderName,
            isDelete: isUpdate ? res?.isDelete : false,
        }));
        let rcsResponse = formState.rcsResponse?.map((res) => ({
            clientrcsResponseID: isUpdate ? res.clientRCSResponseId : 0,
            template: res.template,
            templateName: res.templateName,
            isDelete: isUpdate ? res?.isDelete : false,
        }));
        const payload = {
            departmentId,
            clientId,
            userId,
            clientrcsSettingId: isUpdate ? config.clientRCSSettingId : 0,
            accessPoint: formState.accessPoint,
            authorizationKey: formState.authorizationKey,
            serviceProviderId: formState.provider.serviceProviderId,
            userName: formState.userName,
            password: formState.password,
            rcsSender: [...rcsSender, ...senderAndResponse?.sender],
            rcsResponse: [...rcsResponse, ...senderAndResponse?.response],
        };
        dispatch(createCSRCSSettings(payload, handleCancel));
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="box-design bd-top-border">
                    <div className="rs-sub-heading mt5">
                        <div className="rss-left">
                            <h4>{'RCS settings'}</h4>
                        </div>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={6} id="rs_RCSCreate_provider">
                                <RSKendoDropDownList
                                    name={'provider'}
                                    data={providers}
                                    control={control}
                                    textField={'serviceProviderName'}
                                    dataItemKey={'serviceProviderId'}
                                    label={PROVIDER}
                                    required
                                    rules={{
                                        required: SELECT_PROVIDER,
                                    }}
                                />
                            </Col>
                            <Col sm={6}>
                                <RSInput
                                    type={'text'}
                                    name={'accessPoint'}
                                    id="rs_RCSCreate_accesspoint"
                                    placeholder={ACCESS_POINT}
                                    control={control}
                                    required
                                    maxLength={MAXL_LENGTH1024}
                                    rules={{
                                        required: ACCESS_POINT_MSG,
                                        pattern: {
                                            value: URLPATTERN,
                                            message: ENTER_VALID_ACCESS_POINT,
                                        },
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={6}>
                                <RSInput
                                    type={'text'}
                                    name={'authorizationKey'}
                                    id="rs_RCSCreate_authorizationKey"
                                    placeholder={AUTHORIZATION_KEY}
                                    control={control}
                                    required
                                    maskValue={(value) => maskingString(value, 3, value?.length - 3)}
                                    rules={{ required: ENTER_AUTHORIZATION_KEY }}
                                    maxLength={MAX_LENGTH256}
                                />
                            </Col>{' '}
                            <Col sm={6}>
                                <RSInput
                                    type={'text'}
                                    name={'userName'}
                                    id="rs_RCSCreate_UserName"
                                    placeholder={USER_NAME}
                                    control={control}
                                    required
                                    rules={{ required: ENTER_USERNAME }}
                                    maxLength={MAX_LENGTH50}
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={6}>
                                <RSInput
                                    type={'password'}
                                    name={'password'}
                                    id="rs_RCSCreate_password"
                                    placeholder={PASSWORD}
                                    control={control}
                                    required
                                    viewEye
                                    rules={{ required: ENTER_PASSWORD }}
                                     maxLength={MAX_LENGTH100}
                                />
                            </Col>
                        </Row>
                    </div>
                    {senderFields?.length && (
                        <div className="rs-sub-heading">
                        <div className="rss-left">
                            <h4>{SENDER_DETAILS}</h4>
                        </div>
                    </div>
                    )}
                    {senderFields.map(
                        (field, index) =>
                            !field?.isDelete && (
                                <div className="senderDetailsContainer form-group rs-mb-nm0" key={field.id}>
                                    <Row>
                                        <Col sm={6}>
                                            <RSInput
                                                control={control}
                                                name={`senderDetails[${index}].senderId`}
                                                placeholder={SENDER_ID}
                                                id="rs_RCSCreate_senderId"
                                                required
                                                maxLength={MAX_LENGTH10}
                                                rules={{
                                                    required: ENTER_SENDER_ID,
                                                    validate: () => {
                                                        const [status, _] = findDuplicates(
                                                            senderDetailsWatch,
                                                            'senderId',
                                                        );
                                                        return status ? 'Duplicate value' : true;
                                                    },
                                                }}
                                            />
                                        </Col>
                                        <Col sm={6}>
                                            <Row>
                                                <Col sm={11} className={'pr0'}>
                                                    <RSInput
                                                        control={control}
                                                        name={`senderDetails[${index}].senderName`}
                                                        id="rs_RCSCreate_senderName"
                                                        placeholder={SENDER_NAME}
                                                        required
                                                        maxLength={MAX_LENGTH50}
                                                        rules={{
                                                            required: ENTER_SENDER_NAME,
                                                        }}
                                                    />
                                                </Col>
                                                <Col sm={1} className="fg-icons-wrapper position-relative right8">
                                                    <div className="fg-icons">
                                                        <RSTooltip text={index === 0 ? 'Add' : 'Delete'} position="top">
                                                            <i
                                                                onClick={() => addsenderDetails(index)}
                                                                className={`${selectIcon(index)} icon-md cp ${
                                                                    senderFields?.length > 4 && index == 0
                                                                        ? 'click-off'
                                                                        : ''
                                                                }`}
                                                            ></i>
                                                        </RSTooltip>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </div>
                            ),
                    )}
                    <div className="rs-sub-heading">
                        <div className="rss-left">
                            <h4>{'RCS responses'}</h4>
                        </div>
                    </div>
                    {responseFields.map(
                        (field, index) =>
                            !field?.isDelete && (
                                <div className="rcsResponseContainer form-group rs-mb-nm0 mb30" key={field.id}>
                                    <Row>
                                        <Col sm={6}>
                                            <RSInput
                                                control={control}
                                                name={`rcsResponse[${index}].template`}
                                                placeholder={TEMPLATE}
                                                id="rs_RCSCreate_Template"
                                                required
                                                rules={{
                                                    required: ENTER_TEMPLATE_ID,
                                                    validate: () => {
                                                        const [status, _] = findDuplicates(
                                                            rcsResponseWatch,
                                                            'template',
                                                        );
                                                        return status ? DUPLICATE_VALUE : true;
                                                    },
                                                }}
                                                maxLength = {MAX_LENGTH500}
                                            />
                                        </Col>
                                        <Col sm={6}>
                                            <Row>
                                                <Col sm={11} className='pr0'>
                                                    <RSInput
                                                        control={control}
                                                        name={`rcsResponse[${index}].templateName`}
                                                        placeholder={TEMPLATE_NAME}
                                                        id="rs_RCSCreate_TemplateName"
                                                        required
                                                        rules={{
                                                            required: ENTER_TEMPLATE_NAME,
                                                        }}
                                                        maxLength = {MAX_LENGTH100}
                                                    />
                                                </Col>
                                                <Col sm={1} className="fg-icons-wrapper position-relative right8">
                                                    <div className="fg-icons">
                                                        <RSTooltip text={index === 0 ? 'Add' : 'Delete'} position="top">
                                                            <i
                                                                onClick={() => addrcsResponse(index)}
                                                                className={`${selectIcon(index)} icon-md cp ${
                                                                    responseFields?.length > 4 && index == 0
                                                                        ? 'click-off'
                                                                        : ''
                                                                }`}
                                                            ></i>
                                                        </RSTooltip>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </div>
                            ),
                    )}
                </div>
                <div className="buttons-holder">
                    <RSSecondaryButton type="button" onClick={() => handleCancel(true)} id="rs_RCSCreate_Cancel">
                       {CANCEL}
                    </RSSecondaryButton>
                    {addAccess && (
                        <RSPrimaryButton type="submit" className={``} id="rs_RCSCreate_Update">
                            {isUpdate ? 'Update' : 'Save'}
                        </RSPrimaryButton>
                    )}
                </div>
            </form>
        </FormProvider>
    );
};

export default RCSCreate;
