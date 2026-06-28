import { UpdateState } from 'Utils/modules/misc';
import { statusIdCheck } from 'Utils/modules/campaignUtils';
import { mapAudienceWithChannelLabels } from 'Utils/modules/formatters';
import { ADD_OFFER, AUDIENCE, IGNORE_CHANNEL, OK } from 'Constants/GlobalConstant/Placeholders';
import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { ENTER_TRANSFER_METHOD } from 'Constants/GlobalConstant/ValidationMessage';
import { circle_plus_fill_medium, tag_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useMemo, useRef, useState } from 'react';
import _map from 'lodash/map';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import _find from 'lodash/find';
import _filter from 'lodash/filter';
import _uniqBy from 'lodash/uniqBy';
import { Row, Col } from 'react-bootstrap';
import { useForm, FormProvider } from 'react-hook-form';

import RSTooltip from 'Components/RSTooltip';

import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import SelectAttributeListboxModal from 'Components/SelectAttributeListboxModal';
import OfferModal from 'Pages/AuthenticationModule/Components/OfferModal/OfferModal';
import RSConfirmationModal from 'Components/ConfirmationModal';
import DownloadCSV from 'Pages/AuthenticationModule/Components/DownloadCSV/DownloadCSV';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

import { initialState, formInitialState } from './constant.jsx';
import {
    resetCreateCommunication,
    updateTab,
    updateVerticalTab,
    updateDirectMailList,
    updateDirtyState,
} from 'Reducers/communication/createCommunication/create/reducer';
import { getAudience, getDirectMailDetails } from 'Reducers/communication/createCommunication/Create/selectors.js';
import { useDispatch, useSelector } from 'react-redux';

import useQueryParams from 'Hooks/useQueryParams.js';
import useApiLoader from 'Hooks/useApiLoader';
import AuthoringChannelEditSkeletonGate, {
    getAuthoringSaveButtonType,
    useAuthoringChannelEditLoader,
    useAuthoringChannelSaveLoader,
} from 'Components/Skeleton/pages/communication/authoring';
import { getSessionId } from 'Reducers/globalState/selector.js';
import {
    getAudienceList,
    getCDMTansferMethod,
    getVendorDetails,
    savDirectmail,
    getDirectmail,
} from 'Reducers/communication/createCommunication/Create/request.js';
import { useNavigate } from 'react-router-dom';
import {
    AudienceFieldRenderComponent,
    availableTabs,
    communicationChannels,
    getNextEligibleTabIndex,
    EMAIL_TAB_CHANNEL_MAP,
    handleAllChannelTimeZonePayload,
    getPreCampaignStatus,
    handlePersonalization,
    handleTotalAudienceCount
} from '../../constant.jsx';
import { updateSaveChannelsId } from 'Reducers/communication/createCommunication/plan/reducer';
import { AUTHORING_FIELD_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';

const DirectMail = () => {
    const channelId = 33;
    const methods = useForm(formInitialState);
    const {
        control,
        watch,
        handleSubmit,
        reset,
        clearErrors,
        setError,
        setValue,
        getValues,
        formState: { isValid, dirtyFields },
    } = methods;
    const dispatch = useDispatch();
    const audienceRef = useRef();

    const navigate = useNavigate();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const audienceList = useSelector((state) => getAudience(state));
    const { transferMethods = { data: [] }, vendors = [] } = useSelector((state) => getDirectMailDetails(state));
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const [navigate_confirm, setNavigate_confirm] = useState(false);

    let {
        personalization,
        listTypeWisePersonlization,
        tabsState: { email: tabEmailState },
        isDirty,
        activeTabs,
        verticalTab: { type: channelType, currentTab },
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { savedChannelsId } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const location = useQueryParams('/communication/create-communication');
    const { showEditSkeleton, isSavedChannel, runEditFetch, resetEditLoading } = useAuthoringChannelEditLoader({
        channelId,
        subChannelId: channelId,
    });
    const savedChannel = isSavedChannel;
    const { runSave, isSaveLoading, isNextLoading, isSendLoading, isSubmitting } = useAuthoringChannelSaveLoader();
    const [selectedColumnsData, setSelectedColumnData] = useState({ leftAttributes: [], rightAttributes: [] });
    const [statusId, setStatusId] = useState(null);

    const isEditCallRef = useRef(false);
    const [state, setState] = useState(initialState);
    const [showDownloadConfirmation, setShowDownloadConfirmation] = useState(false);
    const [downloadModal, setDownloadModal] = useState({
        show: false,
        showMessage: false,
    });
    let [audience, attachment, previewImage, watchTotalAudience] = watch(['audience', 'attachment', 'previewImage', 'totalAudience']);
    const transferMethod = watch('transferMethod', '');
    // Field-level loaders.
    // Create -> field-level loader (user can keep interacting with other fields).
    // Edit   -> global loader (form needs the list before it can bind selected values).
    const audienceLoader = useApiLoader();
    const transferMethodLoader = useApiLoader();
    useEffect(() => {
        if (_get(location, 'campaignType', '') === 'S' && audienceList?.length === 0) {
            audienceLoader.refetch({
                fetcher: ({ payload, isFilter = false } = {}) =>
                    dispatch(getAudienceList({ payload, isFilter, loading: false })),
                mode: savedChannel ? 'edit' : 'create',
                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                params: {
                    payload: {
                        clientId,
                        userId,
                        campaignId: location?.campaignId,
                        departmentId,
                        searchText: '',
                        segmentIds: [],
                        channelType: 'E',
                    },
                    isFilter: false,
                },
            });
        }
        if (!savedChannel) {
            transferMethodLoader.refetch({
                fetcher: ({ payload } = {}) =>
                    dispatch(getCDMTansferMethod({ payload, loading: false })),
                mode: 'create',
                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                params: {
                    payload: { clientId, userId, departmentId },
                },
            });
        }
    }, [location]);
    useEffect(() => {
        let listwise = handlePersonalization(
            personalization,
            location?.audience?.length ? location?.audience : watch('audience')?.length ? watch('audience') : audience,
            listTypeWisePersonlization,
        );

        let allData = [...listwise];
        let leftAtt = allData?.map((item, ind) => ({
            ...item,
            name: item?.attributeName,
            selected: false,
        }));
        setSelectedColumnData((prev) => ({ ...prev, leftAttributes: leftAtt, rightAttributes: [] }));
    }, [personalization, listTypeWisePersonlization]);
    let calucateAudienceCount = useMemo(
        () => audience?.reduce((prev, cur) => Number(prev) + Number(cur.recipientCountEmail), 0),
        [audience],
    );
    useEffect(() => {
        if (!isDirty && Object.keys(dirtyFields)?.length > 0) {
            dispatch(updateDirtyState(true));
        } else if (isDirty && Object.keys(dirtyFields)?.length === 0) {
            dispatch(updateDirtyState(false));
        }
    }, [JSON.stringify(dirtyFields)]);

    const handleNavigation = () => {
        dispatch(updateDirectMailList({ data: {}, field: 'campaignDetails' }));
        window.scrollTo(0, 0);
        const tabIndex = tabEmailState.currentIndex + 1;

        const handleVertcialNextTab = () => {
            const nextChannel = communicationChannels.find(
                (chan, index) => channelType !== chan && Object.hasOwn(activeTabs, chan) && index > currentTab,
            );
            if (!!nextChannel) {
                dispatch(
                    updateVerticalTab({
                        tabs: activeTabs?.[nextChannel] || {
                            type: 'messaging',
                            currentTab: 1,
                        },
                    }),
                );
            } else {
                const status = getPreCampaignStatus(savedChannelsId);
                if (status) {
                    navigate('/communication', {
                        index: 0,
                    });
                } else {
                    let url = '/communication/execute';
                    const encryptState = encodeUrl(location);
                    dispatch(resetCreateCommunication());
                    navigate(`${url}?q=${encryptState}`, {
                        state: location,
                    });
                }
            }
        };

        const nextEmailTabIndex = getNextEligibleTabIndex({
            startIndex: tabIndex,
            campaignType: location?.campaignType,
            eligibleChannelIds: location?.eligibleChannelType?.[0] || [],
            availableTabList: availableTabs['email'],
            tabChannelMap: EMAIL_TAB_CHANNEL_MAP,
        });

        if (availableTabs['email']?.length === nextEmailTabIndex) {
            handleVertcialNextTab();
        } else {
            dispatch(
                updateTab({
                    field: 'email',
                    data: {
                        tabName: availableTabs['email'][nextEmailTabIndex],
                        currentIndex: nextEmailTabIndex,
                    },
                }),
            );
        }
    };

    const getDirectMailCampaignByIdData = async () => {
        if (location?.campaignId) {
            return runEditFetch(() =>
                dispatch(
                    getDirectmail({
                        payload: {
                            userId,
                            clientId,
                            departmentId,
                            campaignId: location?.campaignId,
                        },
                        loading: false,
                    }),
                ),
            );
        }
    };

    const fetchEditDirectMail = async () => {
        if (!_isEmpty(location) && location?.campaignId && !isEditCallRef.current) {
            isEditCallRef.current = true;
            const res = await getDirectMailCampaignByIdData();
            if (res?.status) {
                const {
                    cdmTransferMethodID,
                    selectedDirectMailRecipients,
                    selectedDirectMailAttributes,
                    remoteSettingID,
                    statusId,
                    baseValue,
                    totalAudience
                } = res?.data;
                const status = (!!baseValue ? 5 : Number(statusId)) || null;
                setStatusId(Number(status) || null);
                dispatch(updateDirtyState(true));
                // Map selectedDirectMailRecipients to audience
                let editAudience = [];
                let audienceListData = audienceList?.length ? audienceList : [];
                if (!audienceListData?.length) {
                    const response = await dispatch(
                        getAudienceList({
                            payload: {
                                userId,
                                clientId,
                                campaignId: location?.campaignId,
                                departmentId,
                                searchText: '',
                                segmentIds: [],
                                channelType: 'E',
                            },
                        }),
                    );
                    if (response?.data) {
                        audienceListData = _map(response?.data, mapAudienceWithChannelLabels);
                    }
                }
                if (audienceListData?.length) {
                    audienceListData = _uniqBy(audienceListData, 'segmentationListId');
                }
                if (selectedDirectMailRecipients?.length && audienceListData?.length) {
                    const segmentationIds = selectedDirectMailRecipients.map((rec) => rec.SegmentationListID);
                    editAudience = _filter(audienceListData, (aud) => segmentationIds.includes(aud.segmentationListId));
                }

                // Map selectedDirectMailAttributes to selectedColumnsData
                let rightAttributes = [];
                if (selectedDirectMailAttributes?.length) {
                    rightAttributes = selectedDirectMailAttributes.map((attr) => {
                        // Find matching personalization attribute
                        const matchingAttr = personalization?.find((p) => p?.dataAttributeId === attr.DataAttributeID);

                        return {
                            ...matchingAttr,
                            name: attr.AttributeName || attr.UIPrintableName || matchingAttr?.attributeName,
                            selected: false,
                        };
                    });
                }
                const transferDetails = await dispatch(
                    getCDMTansferMethod({
                        payload: {
                            clientId,
                            userId,
                            departmentId,
                        },
                    }),
                );
                const transferMethods = transferDetails?.status ? transferDetails?.data : [];

                const selectedTransferMethod = _find(transferMethods, ['CDMTransferMethodID', cdmTransferMethodID]);

                const vendorDetails = await dispatch(
                    getVendorDetails({
                        payload: {
                            clientId,
                            userId,
                            departmentId,
                            databaseType: selectedTransferMethod?.TransferMethodName,
                        },
                    }),
                );
                const vendorData = vendorDetails?.status ? vendorDetails?.data : [];
                const selectedVendor = _find(vendorData, ['remoteSettingID', remoteSettingID]);
                // Update form with edit data
                reset((formState) => ({
                    ...formState,
                    audience: editAudience,
                    transferMethod: selectedTransferMethod || '',
                    friendlyNames: selectedVendor || '',
                    attributeList: rightAttributes,
                    totalAudience: totalAudience || 0
                }));

                // Update selectedColumnsData
                setSelectedColumnData((prev) => ({
                    ...prev,
                    rightAttributes: rightAttributes,
                }));
            }
        }
    };

    useEffect(() => {
        return () => {
            isEditCallRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (_get(location, 'campaignType', '') === 'S' && savedChannel) {
            fetchEditDirectMail();
        }
    }, [location, savedChannel]);

    async function formSubmitHandler(formState, type = 'form', otpValue = '') {
        if (statusIdCheck(statusId)) {
            const selectedDirectMailRecipients = (audience || []).map((aud) => ({
                SegmentationListID: aud?.segmentationListId || aud?.segmentationListID || 0,
                AudienceCount: Number(aud?.recipientCountEmail || aud?.recipientCount || 0),
            }));

            const selectedDirectMailAttributes = (selectedColumnsData?.rightAttributes || []).map((selectedAttr) => {
                if (selectedAttr?.dataAttributeId || selectedAttr?.dataAttributeID) {
                    return {
                        DataAttributeID: Number(selectedAttr?.dataAttributeId || selectedAttr?.dataAttributeID || 0),
                        AttributeName: selectedAttr?.attributeName || selectedAttr?.name || '',
                        UIPrintableName:
                            selectedAttr?.uIPrintableName || selectedAttr?.UIPrintableName || selectedAttr?.name || '',
                    };
                }

                const matchingAttr = personalization?.find(
                    (attr) => attr?.attributeName?.toLowerCase() === selectedAttr?.name?.toLowerCase(),
                );

                return {
                    DataAttributeID: Number(matchingAttr?.dataAttributeId || matchingAttr?.dataAttributeID || 0),
                    AttributeName: matchingAttr?.attributeName || selectedAttr?.name || '',
                    UIPrintableName:
                        matchingAttr?.uIPrintableName || matchingAttr?.UIPrintableName || selectedAttr?.name || '',
                };
            });
            const { timeZoneId = 0 } = getUserDetails();
            const payload = {
                clientId,
                userId,
                departmentId,
                directMailCampaignID: Number(location?.campaignId || 0),
                cdmTransferMethodID: Number(
                    formState?.transferMethod?.CDMTransferMethodID || transferMethod?.CDMTransferMethodID || 0,
                ),
                directMailStatusId: 1,
                isCopy: false,
                selectedDirectMailRecipients,
                selectedDirectMailAttributes,
                remoteSettingID: formState?.friendlyNames?.remoteSettingID || 0,
                timezoneId: handleAllChannelTimeZonePayload(
                    location?.campaignType,
                    location?.timeZoneId,
                    0,
                    timeZoneId,
                    location,
                ),
                splitType: '',
                baseValue: btoa(otpValue),
                totalAudience: calucateAudienceCount
            };

            const { status, data, message } = await runSave(getAuthoringSaveButtonType(type), () =>
                dispatch(savDirectmail({ payload, loading: false })),
            );

            if (status) {
                const finalSavedChannelId = { ...savedChannelsId };
                if (savedChannelsId[channelId]?.includes(channelId)) {
                    finalSavedChannelId[channelId] = [...savedChannelsId[channelId]];
                } else {
                    finalSavedChannelId[channelId] = [...(savedChannelsId[channelId] || []), channelId];
                }
                await dispatch(updateSaveChannelsId(finalSavedChannelId));

                if (type === 'save') {
                    dispatch(resetCreateCommunication());
                    navigate('/communication', {
                        replace: true,
                        state: {
                            index: 0,
                        },
                    });
                } else if (type === 'download') {
                    setDownloadModal({
                        show: false,
                        showMessage: true,
                    });
                    // Show popup on success
                    //setShowDownloadConfirmation(true);
                    // Auto-navigate after 3 seconds
                    // setTimeout(() => {
                    //     setShowDownloadConfirmation(false);
                    //     handleNavigation();
                    // }, 3000);
                } else {
                    handleNavigation();
                }
            }
        } else {
            if (type === 'save') {
                dispatch(resetCreateCommunication());
                navigate('/communication', {
                    replace: true,
                    state: {
                        index: 0,
                    },
                });
            } else {
                handleNavigation();
            }
        }
    }
    return (
        <FormProvider {...methods}>
            <AuthoringChannelEditSkeletonGate channelId={channelId} isLoading={showEditSkeleton && isSavedChannel}>
            <form
                className="tab-content rsv-tabs-content"
                onSubmit={handleSubmit((data) => formSubmitHandler(data, 'form'))}
            >
                <div className={`${!statusIdCheck(statusId) ? 'click-off' : ''} box-design bd-top-border`}>
                    {location.campaignType === 'S' && (
                        <div className="form-group mt20" ref={audienceRef}>
                            <AudienceFieldRenderComponent
                                type={'directmail'}
                                audienceList={audienceList}
                                methods={methods}
                                userDetails={{ departmentId, userId, clientId }}
                                audienceValidatorParam
                                isAudienceLoading={audienceLoader.isLoading}
                                children={
                                    <div className="align-items-center d-flex justify-content-end">
                                        <small>
                                            {AUDIENCE}:  {handleTotalAudienceCount({content: [{statusId}]}, watchTotalAudience, calucateAudienceCount)}
                                        </small>
                                    </div>
                                }
                            />
                        </div>
                    )}
                    <div className="form-group mb30">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">Attributes</label>
                            </Col>
                            <Col sm={6}>
                                <div className="pe-none click-off voice-tag-list">
                                    <RSMultiSelect
                                        control={control}
                                        name={'attributeList'}
                                        label={'Attribute'}
                                        data={selectedColumnsData?.rightAttributes}
                                        textField={'name'}
                                        dataItemKey={'dataAttributeId'}
                                        required
                                        rules={{
                                            required: 'Select attributes',
                                        }}
                                    />
                                </div>
                            </Col>
                            <Col sm={3} className={`p0 d-flex align-items-end `}>
                             <RSTooltip  text={'Add personalisation attributes'} className="lh0 position-relative bottom1">
                                <i
                                    className={`${circle_plus_fill_medium} icon-md color-primary-blue`}
                                    id="rs_data_circle_plus_fill"
                                    onClick={(e) => UpdateState(setState, 'showAttributesModal', true)}
                                />
                                </RSTooltip>
                            </Col>
                        </Row>
                    </div>

                    <div className="form-group fg-wl-icon mb30">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">Insert offer</label>
                            </Col>
                            <Col sm={6}>
                             <RSTooltip text={ADD_OFFER} className="lh0 d-inline-block">
                                <div className="pe-none click-off">
                                <i
                                    className={`${tag_medium} icon-md color-primary-blue`}
                                    onClick={(e) => UpdateState(setState, 'showOfferModal', true)}
                                />
                                </div>
                                </RSTooltip>
                            </Col>
                            <Col sm={3}>{state?.offerDetails}</Col>
                        </Row>
                    </div>

                    <div className="form-group">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">Transfer method</label>
                            </Col>
                            <Col sm={6}>
                                <RSKendoDropDownList
                                    control={control}
                                    name="transferMethod"
                                    label={'Transfer method'}
                                    data={transferMethods?.data || []}
                                    isLoading={transferMethodLoader.isLoading}
                                    rules={{
                                        required: ENTER_TRANSFER_METHOD,
                                    }}
                                    textField={'TransferMethodName'}
                                    dataItemKey={'CDMTransferMethodID'}
                                    handleChange={(e) => {
                                        const value = e.value;
                                        if (value?.CDMTransferMethodID === 1 || value?.CDMTransferMethodID === 3) {
                                            dispatch(
                                                getVendorDetails({
                                                    payload: {
                                                        clientId,
                                                        userId,
                                                        departmentId,
                                                        databaseType: value?.TransferMethodName,
                                                    },
                                                }),
                                            );
                                        }
                                        reset((formState) => ({
                                            ...formState,
                                            friendlyNames: '',
                                            vendor: '',
                                        }));
                                    }}
                                    required
                                />
                            </Col>
                        </Row>
                    </div>

                    {(transferMethod?.CDMTransferMethodID === 3 || transferMethod?.CDMTransferMethodID === 1) && (
                        <div className="form-group mb20">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">
                                        {transferMethod?.CDMTransferMethodID === 3 ? 'Friendly names' : 'Vendor'}
                                    </label>
                                </Col>
                                <Col sm={6}>
                                    <RSKendoDropDownList
                                        control={control}
                                        name="friendlyNames"
                                        label={transferMethod?.CDMTransferMethodID === 3 ? 'Friendly names' : 'Vendor'}
                                        data={vendors?.data || []}
                                        textField={'friendlyName'}
                                        dataItemKey={'remoteSettingID'}
                                        isLoading={vendors?.loading}
                                    />
                                </Col>
                            </Row>
                        </div>
                    )}
                    {/* {transferMethod?.CDMTransferMethodID === 1 && (
                        <div className="form-group mb20">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">Vendor</label>
                                </Col>
                                <Col sm={6}>
                                    <RSKendoDropDownList
                                        control={control}
                                        isLoading={vendors?.loading}
                                        name="vendor"
                                        label={'Vendor'}
                                        data={vendors?.data || []}
                                        textField={'friendlyName'}
                                        dataItemKey={'remoteSettingID'}
                                    />
                                </Col>
                            </Row>
                        </div>
                    )} */}
                    {!_isEmpty(transferMethod) && (
                        <Row>
                            <Col md={{ offset: 3, span: 6 }} className="d-flex justify-content-end">
                                <RSPrimaryButton
                                    type="button"
                                    onClick={() => {
                                        if (transferMethod?.CDMTransferMethodID === 2) {
                                            setDownloadModal({
                                                show: true,
                                                showMessage: false,
                                            });
                                        } else {
                                            handleSubmit((data) => formSubmitHandler(data, 'form'))();
                                        }
                                    }}
                                >
                                    {transferMethod?.CDMTransferMethodID === 2 ? 'Download' : 'Transfer'}
                                </RSPrimaryButton>
                            </Col>
                        </Row>
                    )}
                </div>
                <div className="buttons-holder">
                    <RSSecondaryButton
                        type="button"
                        onClick={() => {
                            dispatch(resetCreateCommunication());
                            navigate('/communication', {
                                replace: true,
                                state: {
                                    index: 0,
                                },
                            });
                        }}
                    >
                        Cancel
                    </RSSecondaryButton>
                    <RSSecondaryButton
                        className={`color-primary-blue`}
                        type="button"
                        onClick={() => {
                            handleSubmit((data) => formSubmitHandler(data, 'save'))();
                        }}
                        isLoading={isSaveLoading}
                        blockBodyPointerEvents
                        disabledClass={isSubmitting ? 'pe-none click-off' : ''}
                    >
                        Save
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        isLoading={isNextLoading}
                        blockBodyPointerEvents
                        disabledClass={isSubmitting ? 'pe-none click-off' : ''}
                        onClick={() => {
                            if (!isDirty && location.campaignType !== 'M' && !savedChannel && !watch('audience')?.length) {
                                setNavigate_confirm(true);
                                return;
                            }
                            handleSubmit((data) => formSubmitHandler(data, 'form'))();
                        }}
                    >
                        Next
                    </RSPrimaryButton>
                </div>
            </form>
            <SelectAttributeListboxModal
                getSelectedData={(data) => {
                    setSelectedColumnData({
                        leftAttributes: leftAttributes,
                        rightAttributes: rightAttributes,
                    });
                    setValue('attributeList', rightAttributes);
                    clearErrors('attributeList');
                    UpdateState(setState, 'showAttributesModal', false);
                }}
                leftAttributes={selectedColumnsData.leftAttributes}
                rightAttributes={selectedColumnsData.rightAttributes}
                show={state.showAttributesModal}
                handleClose={(status) => UpdateState(setState, 'showAttributesModal', false)}
            />
            <OfferModal
                show={state.showOfferModal}
                handleClose={(status) => UpdateState(setState, 'showOfferModal', false)}
                confirm={(data) => {
                    UpdateState(setState, ['showOfferModal', 'offerDetails'], [false, offer]);
                }}
            />
            {downloadModal?.show && (
                <DownloadCSV
                    show={downloadModal?.show}
                    handleClose={() => {
                        setDownloadModal({
                            show: false,
                            showMessage: false,
                        });
                    }}
                    onSuccess={async (otpData) => {
                        const { otpValue, keyData } = otpData;
                        await formSubmitHandler(getValues(), 'download', otpValue);
                    }}
                    isForm
                    requestOtpExtraPayload={{ requestfrom: 'directMail' }}
                />
            )}
            {downloadModal?.showMessage && (
                <RSConfirmationModal
                    show={downloadModal?.showMessage}
                    text="Your download request has been submitted successfully. The file will be securely generated and sent to your registered email address shortly. Thank you for your patience."
                    handleClose={() => {
                        handleNavigation();
                    }}
                    primaryButton={false}
                    secondaryButton={false}
                />
            )}
            {navigate_confirm && (
                <RSConfirmationModal
                    show={navigate_confirm}
                    text={IGNORE_CHANNEL}
                    primaryButtonText={OK}
                    handleClose={() => {
                        setNavigate_confirm(false);
                    }}
                    handleConfirm={() => {
                        handleNavigation();
                        setNavigate_confirm(false);
                    }}
                />
            )}
            {getWarningPopupMessage(failureApiErrors, dispatch)}
            </AuthoringChannelEditSkeletonGate>
        </FormProvider>
    );
};

export default DirectMail;
