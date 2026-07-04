import { encodeUrl } from 'Utils/modules/crypto';
import { SELECTED_ATTRIBUTES } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD, ADD_ATTRIBUTES, ATTRIBUTES, CANCEL, DESCRIPTION, EDIT, I_AGREE_TO_TRANSFER, PROVIDER, WEBHOOK, WEBHOOK_DESCRIPTION } from 'Constants/GlobalConstant/Placeholders';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTextarea from 'Components/FormFields/RSTextarea';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSTooltip from 'Components/RSTooltip';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { circle_plus_fill_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import AttributeModal from './Components/AttributeModal';
import {
    getWebhookList,
    getWebhookAttributeList,
    SaveWebhookCommunication,
    getWebhookCommunicationById,
} from 'Reducers/communication/createCommunication/Mdc/Canvas/request';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import { buildPayload } from './Components/constant';

import { SELECT_VALID_TYPE, AGREE_TO_TRANSFER_DATA, ENTER_DESCRIPTION } from 'Constants/GlobalConstant/ValidationMessage';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
const Webhooks = () => {
    const [isShow, setShow] = useState(false);
    const [campaignId, setCampaignId] = useState(0);
    const [campaignType, setCampaignType] = useState('');
    const [webhookList, setWebhookList] = useState([]);
    const [attributeList, setAttributeList] = useState({
        selectedAttributeList: [],
        availableAttributeList: [],
    });
    
    const [mdcContentSetupDetails, setMdcContentSetupDetails] = useState({});
    const [levelNumber, setLevelNumber] = useState(1);
    const [actionId, setActionId] = useState(0);
    const [mdcChannelDetailId, setMdcChannelDetailId] = useState(0);
    const [mdcAudience, setMdcAudience] = useState([]);
    const [mdcButtonText, setMdcButtonText] = useState(`Create`);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const locationState = useQueryParams('/communication') || {};
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const methods = useForm();
    const {
        control,
        setError,
        formState: { defaultValues, dirtyFields, isValid, errors },
        clearErrors,
        reset,
        handleSubmit,
        watch,
        setValue,
    } = methods;
    const attributeError = _get(errors, `attributeError.message`, '');
    useEffect(() => {
        if (locationState && Object.keys(locationState)?.length) {
            const { campaignId } = locationState;

            const mdcContentSetupDetails = _get(locationState, 'mdcContentSetupDetails', {});
            const levelNumber = _get(mdcContentSetupDetails, 'levelNumber', 1);
            const actionId = _get(mdcContentSetupDetails, 'actionId', 0);
            const mdcChannelDetailId = _get(mdcContentSetupDetails, 'channelDetailId', 0);
            const mdcAudience = _get(mdcContentSetupDetails, 'audience', []);
            const mdcButtonText = mdcChannelDetailId ? 'Update' : 'Create';
            const campaignType = _get(locationState, 'campaignType', '');

            setCampaignType(campaignType);
            setCampaignId(campaignId);
            setMdcContentSetupDetails(mdcContentSetupDetails);
            setLevelNumber(levelNumber);
            setActionId(actionId);
            setMdcAudience(mdcAudience);
            setMdcButtonText(mdcButtonText);
            setMdcChannelDetailId(mdcChannelDetailId);
        }
    }, [locationState]);

    const fetchWebhookList = async (payload) => {
        return await dispatch(getWebhookList({ payload }));
    };
    const fetchWebhookAttributeList = async (payload) => {
        return await dispatch(getWebhookAttributeList({ payload }));
    };
    useEffect(() => {
        const payload = { userId, clientId, departmentId };

        Promise.all([fetchWebhookList(payload), fetchWebhookAttributeList(payload)]).then((resultData) => {
            const [rslt1, rslt2] = resultData;
            if (rslt1.status) setWebhookList(rslt1.data);
            if (rslt2.status) setAttributeList({ availableAttributeList: rslt2.data, selectedAttributeList: [] });

            if (
                _get(locationState, 'campaignId', 0) > 0 &&
                _get(locationState, 'mdcContentSetupDetails.channelDetailId', 0) > 0
            ) {
                const payload = {
                    userId,
                    clientId,
                    departmentId,
                    campaignId: _get(locationState, 'campaignId', 0),
                    webHookId: _get(locationState, 'mdcContentSetupDetails.channelDetailId', 0),
                };
                const fetchWebhookCommunnication = async () => {
                    const { data, message, status } = await dispatch(getWebhookCommunicationById({ payload }));
                                        if (status) {
                        const { webHookSettingId, selectedwebhookattributes, description, isOptInEnabled } = data[0];
                        setValue('isAgree', isOptInEnabled);
                        setValue('description', description);
                        const webHook = rslt1.data.filter((item) => item.webHookSettingId === webHookSettingId)[0];
                        setValue('webhookSetting', webHook);
                        let selectedAttributeIdList = [];
                        let availableAttributeIdList = [];
                        let selectedAttr = [],
                            availableAttr = [];

                        if (selectedwebhookattributes?.length) {
                            selectedwebhookattributes.forEach((item) => {
                                selectedAttributeIdList = [...selectedAttributeIdList, item.dataAttributeId];
                            });
                        }
                                                if (rslt2.data?.length) {
                            rslt2.data.forEach((item) => {
                                if (selectedAttributeIdList.includes(item.dataAttributeId)) {
                                    selectedAttr = [...selectedAttr, item];
                                } else {
                                    availableAttr = [...availableAttr, item];
                                }
                            });
                        }
                        setAttributeList({
                            availableAttributeList: availableAttr,
                            selectedAttributeList: selectedAttr,
                        });
                    }
                };
                fetchWebhookCommunnication();
            }
        });
    }, [userId, locationState?.campaignId > 0]);

    useEffect(() => {
        if (attributeList?.selectedAttributeList?.length) {
            setValue('availableAttributes', attributeList?.selectedAttributeList);
        } else {
            setValue('availableAttributes', []);
        }
    }, [JSON.stringify(attributeList?.selectedAttributeList)]);

    const handleCancel = () => {
        setShow(false);
    };
    const handleUpdateAttributeList = (data) => {
                setAttributeList(data);
        setShow(false);
    };
    const handleCreateWebhook = async (formData) => {
        if (!attributeList?.selectedAttributeList?.length) {
            setError('attributeError', {
                type: 'custom',
                message: SELECTED_ATTRIBUTES,
            });
            return;
        }
        formData = { ...formData, userId, clientId, departmentId, campaignType, campaignId };
                const payload = buildPayload({ data: formData, mdcContentSetupDetails, attributeList });
        const { status, data } = await dispatch(SaveWebhookCommunication({ payload }));
                if (status) {
            handleMdcNavigation({ data });
        }
    };

    const handleMdcNavigation = ({ data }) => {
        const { webHookConfigId: channelResponseDetailId } = data;

        const mdcCanvasUrl = `/communication/mdc-workflow`;
        const state = { ...locationState, channelResponseDetailId, mode: `update` };
        const encryptState = encodeUrl(state);
        channelResponseDetailId &&
            navigate(`${mdcCanvasUrl}?q=${encryptState}`, {
                state,
            });
    };
    return (
        <FormProvider {...methods}>
            <form className="rsv-tabs-content position-relative">
                <div className="box-design bd-top-border">
                    <div className="form-group mt20">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">{WEBHOOK}</label>
                            </Col>
                            <Col sm={6}>
                                <RSKendoDropDownList
                                    control={control}
                                    name={'webhookSetting'}
                                    data={webhookList}
                                    textField={'webHookName'}
                                    dataItemKey={'webHookSettingId'}
                                    label={WEBHOOK}
                                    rules={{ required: SELECT_VALID_TYPE }}
                                    required
                                />
                            </Col>
                            <Col sm={1} className="fg-icons-wrapper pl0 d-none">
                                <div className="fg-icons click-off">
                                    <RSTooltip text={ADD}>
                                        <i className={`${circle_plus_fill_medium} color-primary-blue icon-md`}></i>
                                    </RSTooltip>
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">{ATTRIBUTES}</label>
                            </Col>
                            <Col sm={6}>
                                {!!attributeError && (
                                    <p className="color-primary-red fs15 position-absolute top-25">{attributeError}</p>
                                )}
                                <div className='mdc-webhook-attribute-data'>
                                    {/* {attributeList?.selectedAttributeList?.length ? (
                                        <ul>
                                            {attributeList.selectedAttributeList.map((item) => {
                                                return <li>{item.uiPrintableName}</li>;
                                            })}
                                        </ul>
                                    ) : (
                                        <></>
                                        // <ul className="d-flex pe-none">
                                        //     <li className="p10 w-50 mb0"></li>
                                        //     <li className="p10 w-20 mb0"></li>
                                        //     <li className="p10 w-20 mb0"></li>
                                        // </ul>
                                    )} */}

                                    <RSMultiSelect
                                        control={control}
                                        name={'availableAttributes'}
                                        data={attributeList?.selectedAttributeList}
                                        textField={'uiPrintableName'}
                                        dataItemKey={'dataAttributeId'}
                                        required
                                        label={ATTRIBUTES}
                                        rules={{
                                            required: ADD_ATTRIBUTES
                                        }}
                                    />
                                </div>
                            </Col>
                            <Col sm={1} className="fg-icons-wrapper pl0">
                                <div className="fg-icons">
                                    <RSTooltip
                                        text={`${
                                            attributeList?.selectedAttributeList?.length
                                                ? EDIT
                                                : ADD
                                        }`}
                                    >
                                        <i
                                            className={`${
                                                attributeList?.selectedAttributeList?.length
                                                    ? pencil_edit_medium
                                                    : circle_plus_fill_medium
                                            } color-primary-blue icon-md`}
                                            onClick={() => {
                                                setShow(true);
                                                clearErrors('attributeError');
                                            }}
                                        ></i>
                                    </RSTooltip>
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">{DESCRIPTION}</label>
                            </Col>
                            <Col sm={6} className="addAudienceTextarea">
                                <RSTextarea
                                    control={control}
                                    name={'description'}
                                    placeholder={WEBHOOK_DESCRIPTION}
                                    rows={6}
                                    label={'PROVIDER'}
                                    rules={{ required: ENTER_DESCRIPTION }}
                                    required
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={5} className="offset-3">
                                <RSCheckbox
                                    control={control}
                                    labelName={I_AGREE_TO_TRANSFER}
                                    name={'isAgree'}
                                    rules={{ required: AGREE_TO_TRANSFER_DATA }}
                                />
                            </Col>
                        </Row>
                    </div>
                </div>

                <div className="buttons-holder">
                    <RSSecondaryButton
                        onClick={() => {
                            const mdcCanvasUrl = `/communication/mdc-workflow`;
                            const state = { ...locationState };
                            delete state.mdcContentSetupDetails;

                            const encryptState = encodeUrl(state);
                            navigate(`${mdcCanvasUrl}?q=${encryptState}`, {
                                state,
                            });
                        }}
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    {/* <RSSecondaryButton color="blue">Save</RSSecondaryButton> */}
                    <RSPrimaryButton
                        type="button"
                        onClick={handleSubmit((data) => {
                                                        handleCreateWebhook(data);
                        })}
                    >
                        {mdcButtonText} Webhook content
                    </RSPrimaryButton>
                </div>
            </form>
            {isShow ? (
                <AttributeModal
                    show={isShow}
                    onCancel={handleCancel}
                    attributeList={attributeList}
                    updateAttributeList={handleUpdateAttributeList}
                    isWebHook
                />
            ) : null}
        </FormProvider>
    );
};

export default Webhooks;
