import { MAX_LENGTH15, MAX_LENGTH150 } from 'Constants/GlobalConstant/Regex';
import { INBOUND_MAX_LENGTH, INBOUND_NUMBER_ALREADY_EXISTS, SELECT_SENDER_ID, SELECT_VALUE, THIS_FIELD_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import { A2P_10_DLC, A2P_NUMBER_TYPE, ADD_INBOUND_NUMBER, CANCEL, ENTER_INBOUND_NUMBER, FRIENDLY_BRAND_NAME, INBOUND_NUMBERS, KEYWORDS_SETTINGS, NO_OPT_IN_OPT_OUT_SETTINGS, SAVE, SENDER_ID, TOLL_FREE, UPDATE } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_medium, close_medium, save_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { onlyNumbers } from 'Utils/modules/inputValidators';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import RSTabbar from 'Components/RSTabber';
import ListNameExists from 'Components/ListNameExists';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSTooltip from 'Components/RSTooltip';
import { RSSecondaryButton, RSPrimaryButton } from 'Components/Buttons';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { CommunicationSettingsEditSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';


import { NUMBER_FIELD_RULES } from 'Constants/GlobalConstant/Rules';
import { getSessionId } from 'Reducers/globalState/selector';
import { getInboundNoList, getSenderIDList, onboardOptInOut, getOptInOutByID, saveInboundNumbers, validateFriendlyName, getOnboardComplianceDetails, validateAtoPName } from 'Reducers/preferences/CommunicationSettings/request';
import { updateCommunicationSettings } from 'Reducers/preferences/CommunicationSettings/reducer';
import { getTABCONFIG, FORM_INITIAL_STATE } from './constant';
import ComplianceKeywords from './Components/ComplianceKeywords';
import FallbackMessage from './Components/FallbackMessage';

const KeywordManagementCreate = ({ config, isCreate, isUpdate, isView = false, handleCancel }) => {
    const dispatch = useDispatch();
    const { clientId, departmentId, userId } = useSelector((state) => getSessionId(state));
    const senderIDList = useSelector((state) => state.communicationSettingsReducer.optInOutSenderList);
    const inboundListLoading = useSelector((state) => state.communicationSettingsReducer.inboundListLoading);
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const methods = useForm(FORM_INITIAL_STATE);
    const { control, watch, setValue, handleSubmit, reset, formState: { isValid } } = methods;

    const [inboundListData, setInboundListData] = useState([]);
    const [editData, setEditData] = useState(null);
    const [showAddInbound, setShowAddInbound] = useState(false);
    const [senderNotMatched, setSenderNotMatched] = useState(false);
    const pageLoadApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'edit' });
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isSaveLoading = saveApi.isFetching;
    const showFieldLoader = pageLoadApi.isLoading && isCreate;
    const isEditLoading = !isCreate && (pageLoadApi.isFetching || (!editData && !senderNotMatched));
    const [a2pAutoDetected, setA2pAutoDetected] = useState(false);
    const inboundPrefilled = useRef(false);
    const addInboundMethods = useForm({ mode: 'onChange' });

    const handleFormSubmit = async (formState) => {
        if (saveApi.isFetching) return;
        const selectedSender = formState.senderID;
        const selectedInbound = formState.inboundNumber;

        let payload;

        if (isUpdate) {
            payload = {
                clientFriendlyName: formState.friendlyBrandName || '',
                clientSMSSenderID: editData?.clientSmsSender?.clientSMSSenderID || config?.clientSmsSenderID || 0,
                inboundNumbers: selectedInbound ? [{ inboundNo: Number(selectedInbound.inboundNo) }] : [],
            };
        } else {
            payload = {
                ClientSMSSenderName: selectedSender?.senderID || '',
                ServiceProviderID: selectedSender?.serviceProviderID || 0,
                ClientSMSSettingID: selectedSender?.clientSmsSettingID || 0,
                ClientSMSSenderID: 1,
                ClientFriendlyName: formState.friendlyBrandName || '',
                IsDLCNo: formState.a2pType === A2P_10_DLC,
                IsTollFreeNo: formState.a2pType === TOLL_FREE,
                inboundNo: selectedInbound?.inboundNo || '',
                clientId,
                departmentId,
                userId,
            };
        }

        const response = await saveApi.refetch({
            fetcher: () =>
                dispatch(isUpdate ? saveInboundNumbers(payload, false) : onboardOptInOut(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });

        if (response?.status) {
            handleCancel(true);
        }
    };

    const handleAddInboundSave = async () => {
        const isFormValid = await addInboundMethods.trigger('newInboundEntry');
        if (!isFormValid) return;
        const trimmed = String(addInboundMethods.getValues('newInboundEntry') || '').trim();
        if (!trimmed) return;
        const isDuplicate = inboundListData.some((item) => String(item.inboundNo) === trimmed);
        if (isDuplicate) {
            addInboundMethods.setError('newInboundEntry', { type: 'manual', message: INBOUND_NUMBER_ALREADY_EXISTS });
            return;
        }
        const newItem = { inboundNo: trimmed };
        setInboundListData((prev) => [...prev, newItem]);
        setValue('inboundNumber', newItem, { shouldValidate: true });
        addInboundMethods.reset();
        setShowAddInbound(false);
    };

    const selectedSenderID      = watch('senderID');
    const selectedA2PType       = watch('a2pType');
    const selectedInboundNumber = watch('inboundNumber');
    const showContent           = !!selectedSenderID && !!selectedA2PType;
    const isDLC                 = selectedA2PType === '10 DLC';

    const dropdownSenderList = useMemo(() => {
        if (isCreate) return senderIDList;
        if (!editData?.clientSmsSender) return [];
        const s = editData.clientSmsSender;
        return [{ senderID: s.clientSMSSenderName, clientSMSSettingID: s.clientSMSSettingID, serviceProviderID: s.serviceProviderID }];
    }, [isCreate, senderIDList, editData]);

    const clientSmsSenderID = isUpdate
        ? editData?.clientSmsSender?.clientSMSSenderID
        : selectedSenderID?.clientSmsSettingID;

    useEffect(() => {
        if (!isCreate || !clientId) return undefined;
        pageLoadApi.refetch({
            fetcher: () => dispatch(getSenderIDList({ clientId, departmentId, userId })),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
    }, [isCreate, clientId, departmentId, userId, dispatch, pageLoadApi.refetch]);

    const fetchInboundList = useCallback(async (clientSmsSenderID) => {
        const payload = { clientId, departmentId, userId, ClientSMSSenderID: clientSmsSenderID };
        const response = await dispatch(getInboundNoList(payload));
        if (response?.status && Array.isArray(response?.data)) {
            setInboundListData(response?.data?.map((item) => ({ ...item, inboundNo: String(item.inboundNo) })));
        } else {
            setInboundListData([]);
        }
    }, [clientId, departmentId, userId, dispatch]);

    useEffect(() => {
        if (selectedSenderID?.senderID) {
            fetchInboundList(selectedSenderID.senderID);
            setValue('inboundNumber', '');
        } else {
            setInboundListData([]);
            setValue('inboundNumber', '');
        }
        setShowAddInbound(false);
        addInboundMethods.reset();
        if (isCreate) {
            setA2pAutoDetected(false);
            setValue('a2pType', '');
            dispatch(updateCommunicationSettings({ field: 'complianceKeywordsList', payload: [] }));
            dispatch(updateCommunicationSettings({ field: 'fallbackMessageData', payload: [] }));
        }
    }, [selectedSenderID?.senderID]);

    useEffect(() => {
        if (!isCreate || !selectedInboundNumber?.inboundNo) {
            setA2pAutoDetected(false);
            return;
        }
        const validateInbound = async () => {
            const response = await dispatch(validateAtoPName({ clientId, departmentId, userId, phone: selectedInboundNumber.inboundNo }));
            if (response?.status && response?.message) {
                const msg = response?.message;
                if (msg === '10DLC') {
                    setValue('a2pType', A2P_10_DLC);
                    setA2pAutoDetected(true);
                } else if (msg === 'Toll-Free') {
                    setValue('a2pType', TOLL_FREE);
                    setA2pAutoDetected(true);
                } else {
                    setA2pAutoDetected(false);
                }
            } else {
                setA2pAutoDetected(false);
            }
        };
        validateInbound();
    }, [selectedInboundNumber?.inboundNo]);

    // In create mode, call the combined compliance details API when both senderID and a2pType are selected
    useEffect(() => {
        if (isCreate && clientSmsSenderID && selectedA2PType) {
            dispatch(getOnboardComplianceDetails({ clientId, departmentId, userId, ClientSmsSenderID: clientSmsSenderID }));
        }
    }, [clientSmsSenderID, selectedA2PType]);

    const isDisabled = isUpdate || isView;
    const isA2PDisabled = isDisabled || a2pAutoDetected;

    const bootstrapEditPage = useCallback(() => {
        if (isCreate || !config?.clientSmsSenderID) {
            return undefined;
        }
        return pageLoadApi.refetch({
            fetcher: () =>
                dispatch(
                    getOptInOutByID({
                        clientId,
                        departmentId,
                        userId,
                        ClientSMSSenderID: config.clientSmsSenderID,
                    }),
                ),
            loaderConfig: fieldLoaderConfig,
            mode: 'edit',
            onSuccess: (response) => {
                if (response?.status && response?.data) {
                    setEditData(response.data);
                    setSenderNotMatched(false);
                } else {
                    setEditData(null);
                    setSenderNotMatched(true);
                }
            },
            onError: () => {
                setEditData(null);
                setSenderNotMatched(true);
            },
        });
    }, [isCreate, config?.clientSmsSenderID, clientId, departmentId, userId, dispatch, pageLoadApi.refetch]);

    const bootstrapEditPageRef = useRef(bootstrapEditPage);
    bootstrapEditPageRef.current = bootstrapEditPage;

    useEffect(() => {
        if (isCreate) return undefined;
        bootstrapEditPageRef.current();
    }, [isCreate, config?.clientSmsSenderID, clientId, departmentId, userId]);

    // Pre-fill top fields once editData is ready (edit/view mode)
    useEffect(() => {
        if (!isCreate && editData) {
            const sender = editData.clientSmsSender;
            if (sender) {
                reset({
                    senderID: { senderID: sender.clientSMSSenderName, clientSMSSettingID: sender.clientSMSSettingID, serviceProviderID: sender.serviceProviderID },
                    friendlyBrandName: sender.clientFriendlyName || '',
                    a2pType: sender.isDLCNo ? A2P_10_DLC : TOLL_FREE,
                });
                setSenderNotMatched(false);
            } else {
                reset({ senderID: null });
                setSenderNotMatched(true);
            }
        }
    }, [editData, isCreate, reset]);

    // Pre-fill inbound number once inbound list has loaded (edit mode) — runs only on first load
    useEffect(() => {
        if (!isCreate && editData?.inboundNumbers?.length > 0 && inboundListData.length > 0 && !inboundPrefilled.current) {
            const firstInbound = String(editData.inboundNumbers[0].inboundNo);
            const matched = inboundListData.find((o) => o.inboundNo === firstInbound);
            if (matched) {
                setValue('inboundNumber', matched);
            }
            inboundPrefilled.current = true;
        }
    }, [inboundListData]);

    return (
        <FormProvider {...methods}>
            {getWarningPopupMessage(failureApiErrors, dispatch)}
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="rs-sub-heading">
                    <div className="rss-left">
                        <h4>{KEYWORDS_SETTINGS}</h4>
                    </div>
                </div>

                {senderNotMatched && !isEditLoading ? (
                    <RSSkeletonTable
                        count={0}
                        text
                        isCustombox
                        message={NO_OPT_IN_OPT_OUT_SETTINGS}
                    />
                ) : (
                    <CommunicationSettingsEditSkeletonGate isLoading={isEditLoading} isEditMode={!isCreate}>
                    <>
                        <div className="form-group mt20">
                            <Row>
                                <Col sm={4} id="rs_KeywordManagement_senderID">
                                    <RSKendoDropDownList
                                        name="senderID"
                                        data={dropdownSenderList}
                                        control={control}
                                        textField="senderID"
                                        dataItemKey="senderID"
                                        label={SENDER_ID}
                                        required={!isView}
                                        isLoading={showFieldLoader}
                                        rules={!isView ? { required: SELECT_SENDER_ID } : {}}
                                        disabled={isDisabled}
                                    />
                                </Col>
                                <Col sm={4} id="rs_KeywordManagement_friendlyBrandName">
                                    <ListNameExists
                                        name="friendlyBrandName"
                                        field="FriendlyName"
                                        placeholder={FRIENDLY_BRAND_NAME}
                                        settings={{ label: FRIENDLY_BRAND_NAME }}
                                        rules={ {required: THIS_FIELD_IS_REQUIRED} }
                                        customErrorMessage={THIS_FIELD_IS_REQUIRED}
                                        maxLength={MAX_LENGTH150}
                                        extraPayload={{
                                            clientSmsSettingID: selectedSenderID?.clientSmsSettingID || 0,
                                        }}
                                        apiCallback={validateFriendlyName}
                                        condition={(data) => !data?.status}
                                        disabled={isView}
                                        nameExists={isView}
                                    />
                                </Col>
                                <Col sm={4} id="rs_KeywordManagement_inboundNumber">
                                    {!showAddInbound && (
                                        <RSKendoDropDownList
                                            name="inboundNumber"
                                            data={inboundListData}
                                            control={control}
                                            textField="inboundNo"
                                            dataItemKey="inboundNo"
                                            isLoading={inboundListLoading}
                                            required={!isView}
                                            label={INBOUND_NUMBERS}
                                            rules={!isView ? { required: SELECT_VALUE } : {}}
                                            disabled={!selectedSenderID || isView}
                                            footer={
                                                !isView && selectedSenderID ? (
                                                    <div
                                                        className="tsh-icon-with-label p8 d-flex align-items-center cursor-pointer"
                                                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                        onClick={() => setShowAddInbound(true)}
                                                    >
                                                        <span>{ADD_INBOUND_NUMBER}</span>
                                                        <i className={`${circle_plus_medium} icon-md color-primary-blue ml5`} />
                                                    </div>
                                                ) : null
                                            }
                                        />
                                    )}
                                    {showAddInbound && !isView && selectedSenderID && (
                                        <div className="position-relative">
                                            <RSInput
                                                name="newInboundEntry"
                                                control={addInboundMethods.control}
                                                label={ENTER_INBOUND_NUMBER}
                                                className="pr60"
                                                maxLength={MAX_LENGTH15}
                                                autoFocus
                                                isKeyDownUpPrevent={false}
                                                rules={NUMBER_FIELD_RULES({ maxLengthValue: MAX_LENGTH15, maxLengthMessage: INBOUND_MAX_LENGTH })}
                                                onKeyDown={(e) => {
                                                    onlyNumbers(e);
                                                    if (e.key === 'Enter') { e.preventDefault(); handleAddInboundSave(); }
                                                    if (e.key === 'Escape') { addInboundMethods.reset(); setShowAddInbound(false); }
                                                }}
                                            />
                                            <div className="d-flex align-items-center position-absolute top4 right5 zIndex2">
                                                <RSTooltip position="top" text={SAVE} className="position-absolute right40 top0">
                                                    <i
                                                        className={`${save_mini} ${!addInboundMethods.formState.isValid ? 'click-off' : ''} icon-xs color-primary-blue cursor-pointer`}
                                                        onClick={handleAddInboundSave}
                                                    />
                                                </RSTooltip>
                                                <RSTooltip position="top" text={CANCEL} className="position-absolute top0 right5">
                                                    <i
                                                        className={`${close_medium} color-primary-red cursor-pointer`}
                                                        onClick={() => { addInboundMethods.reset(); setShowAddInbound(false); }}
                                                    />
                                                </RSTooltip>
                                            </div>
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </div>
                        <Row className="mt20 align-items-center">
                                <Col sm={2}>
                                    <label className="control-label-left mb0">{A2P_NUMBER_TYPE}</label>
                                </Col>
                                <Col sm={10} className={`d-flex align-items-center ${isA2PDisabled ? 'click-off' : ''}`}>
                                    <RSRadioButton
                                        name="a2pType"
                                        control={control}
                                        id="a2p_toll_free"
                                        labelName={TOLL_FREE}
                                        rules={!isView ? { required: THIS_FIELD_IS_REQUIRED } : {}}
                                        disabled={isA2PDisabled}
                                    />
                                    <RSRadioButton
                                        name="a2pType"
                                        control={control}
                                        id="a2p_dlc"
                                        labelName={A2P_10_DLC}
                                        rules={!isView ? { required: THIS_FIELD_IS_REQUIRED } : {}}
                                        disabled={isA2PDisabled}
                                        isError={false}
                                    />
                                </Col>
                            </Row>

                        {showContent && (
                            <div className="mt30">
                                {isDLC ? (
                                    <>
                                        <RSTabbar
                                            tabData={getTABCONFIG(clientSmsSenderID, isCreate)}
                                            defaultTab={0}
                                            defaultClass="col-md-2 tabTransparent"
                                            className="rs-tabs row"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <ComplianceKeywords clientSmsSenderID={clientSmsSenderID} isCreate={isCreate} />
                                    
                                    </>
                                )}
                                <FallbackMessage clientSmsSenderID={clientSmsSenderID} isCreate={isCreate} />
                            </div>  
                        )}
                    </>
                    </CommunicationSettingsEditSkeletonGate>
                )}

                <div className="buttons-holder pref-cs-buttons-outside mt20">
                    <RSSecondaryButton
                        type="button"
                        blockInteraction={isSaveLoading}
                        onClick={() => {
                            if (isSaveLoading) return;
                            handleCancel(true);
                        }}
                        id="rs_KeywordManagement_Cancel"
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    {!isView && !senderNotMatched && !isEditLoading && (
                        <RSPrimaryButton
                            type="submit"
                            isLoading={isSaveLoading}
                            blockBodyPointerEvents={isSaveLoading}
                            id="rs_KeywordManagement_Save"
                            disabledClass={!isValid ? 'pe-none click-off' : ''}
                        >
                            {isUpdate ? UPDATE : SAVE}
                        </RSPrimaryButton>
                    )}
                </div>
            </form>
        </FormProvider>
    );
};

export default KeywordManagementCreate;
