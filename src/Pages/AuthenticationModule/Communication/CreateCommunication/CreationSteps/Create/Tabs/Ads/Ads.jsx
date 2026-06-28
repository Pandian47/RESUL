import { checkTrigger, statusIdCheck } from 'Utils/modules/campaignUtils';
import { encodeUrl } from 'Utils/modules/crypto';
import { truncateTitle } from 'Utils/modules/displayCore';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { SELECT_AD_TYPE, SELECT_POST_ON } from 'Constants/GlobalConstant/ValidationMessage';
import { AD_TYPE, CANCEL, COPY, COPY_AND_PASTE, COPYIED, IGNORE_CHANNEL, NEXT, OK, POST_NAME, SAVE, YOUR_SMART_LINK_IS } from 'Constants/GlobalConstant/Placeholders';
import { copy_large } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useState } from 'react';
import _isEmpty from 'lodash/isEmpty';
import _cloneDeep from 'lodash/cloneDeep';
import { Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { availableTabs, communicationChannels, getPreCampaignStatus, ADS_TAB_CONFIG } from '../../constant';
import AdsName from './Component/AdsName';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import { resetCreateCommunication, updateVerticalTab } from 'Reducers/communication/createCommunication/create/reducer';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { FORM_INITIAL_STATE, getPostChannelId, getSmartPostChannelId, getSocialPostId } from './constant';
import { updateDirtyState, updateTab } from 'Reducers/communication/createCommunication/Create/reducer';
import {
    getAdListTypes,
    getPaidMediaSavedData,
    paidMediaPost,
    saveAndUpdatePaidMedia,
} from 'Reducers/communication/createCommunication/Create/request';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import SmartLinkEnable from '../../Component/SmartLinkEnable/SmartLinkEnable';
import { getSmartLinksListWithLabels } from 'Reducers/communication/createCommunication/smartlink/selectors';
import { updateSmartLinkModalState, updateSmartLinkAutoAdd } from 'Reducers/communication/createCommunication/Create/reducer';
import { MAX_SMART_LINKS } from 'Constants/GlobalConstant/InputLimit';
import { updateSmartLinkShow } from 'Reducers/communication/createCommunication/execute/reducer';
import { getSmartUrl, getSmartUrlDetailByChannel } from 'Reducers/communication/createCommunication/smartlink/request';
import { useNavigate } from 'react-router-dom';
import { showTabsSmartlink } from 'Reducers/communication/createCommunication/smartlink/reducer';

import RSConfirmationModal from 'Components/ConfirmationModal';

import RSTooltip from 'Components/RSTooltip';
import { updateSaveChannelsId } from 'Reducers/communication/createCommunication/plan/reducer';
import AuthoringChannelEditSkeletonGate, {
    AUTHORING_FIELD_LOADER_CONFIG,
    getAuthoringEditApiLoaderConfig,
    getAuthoringSaveButtonType,
    useAuthoringChannelEditLoader,
    useAuthoringChannelSaveLoader,
} from 'Components/Skeleton/pages/communication/authoring';

const Ads = ({ type, isMutiField }) => {
    const [adTypesOfList, setAdTypesOfList] = useState([]);
    const adTypeLoader = useApiLoader();
    const smartLinkInsertLoader = useApiLoader();

    const [postOnList, setPostOnList] = useState([]);
    const [isSmartLink, setIsSmartLink] = useState(false);
    const [copyUrl, setCopyUrl] = useState(null);
    const [isGetAdsFail, setIsGetAdsFail] = useState(false);

    const locationAds = useQueryParams('/communication');

    const dispatch = useDispatch();
    const {
        ads,
        tabsState: { ads: adsTabState },
        activeTabs,
        verticalTab: { type: channelType, currentTab },
        isDirty,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { savedChannelsId } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);

    const methods = useForm(FORM_INITIAL_STATE);
    const {
        control,
        reset,
        formState: { dirtyFields, isValid, errors },
        handleSubmit,
        watch,
        setValue,
        resetField,
        clearErrors
    } = methods;
    const { showSmartLink } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const navigate = useNavigate();
    const dirty = { ...dirtyFields };
    const campaignId = locationAds?.campaignId || 0;
    const subChannelId = getPostChannelId(type);
    const channelId = 10;
    const { showEditSkeleton, isSavedChannel, beginEditSkeleton, finishEditSkeleton, isEditContentLoading } =
        useAuthoringChannelEditLoader({
            channelId,
            subChannelId,
        });
    const editFieldLoaderConfig = getAuthoringEditApiLoaderConfig(showEditSkeleton);
    const { runSave, isSaveLoading, isNextLoading, isSendLoading, isSubmitting } = useAuthoringChannelSaveLoader();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const smartLinks = useSelector((state) => getSmartLinksListWithLabels(state));
    const { tabSmartLink_Flag, smartLink1 } = useSelector(({ smartLinkReducer }) => smartLinkReducer);

    const handleOpenWithAdd = () => {
        if (smartLinks.length > 0) {
            dispatch(updateSmartLinkAutoAdd(true));
        }
        dispatch(updateSmartLinkModalState(true));
    };
    const [navigate_confirm, setNavigate_confirm] = useState(false);
    const [paidAdsData, setPaidAdsData] = useState({});
    const [isCommunicationEditable, setIsCommunicationEditable] = useState(false);
    const [adInputValue, setAdInputValue] = useState(null);
    const [smartLinkLoadingIndex, setSmartLinkLoadingIndex] = useState(null);
    const [adType, postOn] = watch(['adType', 'postOn']);
    // useComponentWillUnmount(() => {
    //     dispatch(resetSmartLink());
    // });
    const adsName = useWatch({
        control,
        name: 'adsName',
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'adsName',
    });
    // useEffect(() => {
    //     if (!smartLink1 || !smartLink2) {
    //         if (locationAds && campaignId > 0) getSmartLink();
    //     }
    // }, [locationAds, isSmartLink]);

    // const getSmartLink = async () => {
    //     if (smartLink1 !== '') {
    //         const payload = { clientId, departmentId, userId, campaignId };
    //         const res = await dispatch(getSmartUrl({ payload }));
    //         if (!res?.status) {
    //             setIsSmartLink(true);
    //             dispatch(updateSmartLinkShow(false));
    //         } else {
    //             setIsSmartLink(false);
    //             dispatch(updateSmartLinkShow(true));
    //         }
    //     }
    // }

    useEffect(() => {
        setTimeout(() => {
            setCopyUrl(null);
        }, 5000);
        // return () => {
        //     dispatch(resetSmartLink());
        // };
    }, [copyUrl]);

    useEffect(() => {
        async function getSmartLink() {
            const payload = { clientId, departmentId, userId, campaignId };
            const res = await dispatch(getSmartUrl({ payload, reduceLoad: true }));
            if (!res?.status) {
                setIsSmartLink(true);
                dispatch(updateSmartLinkShow(false));
            } else {
                setIsSmartLink(false);
                dispatch(updateSmartLinkShow(true));
            }
        }
        // if (smartLink1 === '') {
        if (smartLink1 === '' && !tabSmartLink_Flag) {
            if (locationAds && campaignId > 0)
                //getSmartLink();
                setIsSmartLink(false);
            dispatch(showTabsSmartlink(false));
        } else {
            setIsSmartLink(false);
        }
    }, [locationAds]);

    useEffect(() => {
        if (!isDirty && Object.keys(dirty)?.length > 0) {
            dispatch(updateDirtyState(true));
        } else if (isDirty && Object.keys(dirty)?.length === 0) {
            dispatch(updateDirtyState(false));
        }
    }, [dirty]);

    useEffect(() => {
        if (!_isEmpty(ads[type])) {
            reset(ads[type]);
        } else {
            reset(
                _cloneDeep({
                    adType: '',
                    adsName: [{ name: '', url: '' }],
                }),
            );
        }
    }, [type]);

    useEffect(() => {
        if (!smartLink1 && !smartLinks?.length) {
            setIsSmartLink(true);
        } else {
            setIsSmartLink(false);
        }
    }, [smartLink1, smartLinks, showSmartLink]);
    useEffect(() => {
        handleGetPaidAdList();
    }, [type]);
    useEffect(() => {
        let rslt = statusIdCheck(paidAdsData?.statusId ? paidAdsData?.statusId : null,locationAds?.campaignType,paidAdsData);
        setIsCommunicationEditable(rslt);
    
    }, [paidAdsData, locationAds?.statusId]);

    useEffect(() => {
        if (isSavedChannel) {
            if (!adTypesOfList?.length) {
                if (!isEditContentLoading) {
                    beginEditSkeleton();
                }
                return;
            }
            handleGetPaidMedia();
        } else {
            reset((prev) => ({
                ...prev,
                adType: '',
                adsName: [{ name: '', url: '' }],
            }));
            setPaidAdsData({});
            setAdInputValue(null);
        }
    }, [campaignId, adTypesOfList, isSavedChannel]);

    const handleGetPaidMedia = async () => {
        if (campaignId !== 0 && adTypesOfList?.length !== 0) {
            const payload = {
                clientId,
                departmentId,
                userId,
                campaignId,
                postMediaChannelId: subChannelId,
            };
            if (!isEditContentLoading) {
                beginEditSkeleton();
            }
            try {
                const { data, status } = await dispatch(getPaidMediaSavedData({ ...payload, loading: false }));
                if (status) {
                    setPaidAdsData(data);
                    const adNameObject = adTypesOfList?.find((item) => item?.adName === data?.adType);
                    const isPostName = [4, 9, 10].includes(adNameObject?.postMediaAdTypeId);
                    let postName;
                    if (isPostName) {
                        const postNamesData = await handleSelectItem(adNameObject?.postMediaAdTypeId);
                        postName = postNamesData.find((item) => item?.postName === data?.postName);
                    }
                    const savedAds = Array.isArray(data?.ads) ? data.ads : [];
                    reset((prev) => ({
                        ...prev,
                        postOn: isPostName ? postName : '',
                        adType: adNameObject,
                        adsName: savedAds.map((res) => ({
                            ...res,
                            name: res.addName,
                            url: res.smartlinkurl,
                        })),
                    }));
                } else {
                    reset((prev) => ({
                        ...prev,
                        adType: '',
                        adsName: [{ name: '', url: '' }],
                    }));
                    setPaidAdsData({});
                    setIsGetAdsFail(true);
                }
            } finally {
                finishEditSkeleton();
            }
        }
    };

    const handleGetPaidAdList = async () => {
        let payload = { clientId, departmentId, userId, postMediaChannelId: subChannelId };
        const savedChannel = savedChannelsId[10]?.includes(subChannelId) ? true : false;
        const { status, data } =
            (await adTypeLoader.refetch({
                fetcher: ({ payload: adPayload } = {}) =>
                    dispatch(getAdListTypes(adPayload, { loading: false })),
                mode: savedChannel ? 'edit' : 'create',
                loaderConfig: editFieldLoaderConfig,
                params: { payload },
            })) || {};
        if (status) {
            setAdTypesOfList(data);
        } else {
            setAdTypesOfList([]);
        }
    };

    const handleSelectItem = async (selectedId) => {
        clearErrors('postOn');
        resetField('postOn', { defaultValue: '' });

        const id = [4, 9, 10].includes(selectedId) && getSocialPostId(type);
        let payload = { clientId, departmentId, userId, channelId: id };
        const { status, data } = await dispatch(
            paidMediaPost({ ...payload, loading: false }),
        );
        if (status) {
            setPostOnList(data);
            return data;
        }
        setPostOnList([]);
        return [];
    };

    const handleSmartLink = async (addName, adNameIndex, currentIndex) => {
        let payload = {
            clientId,
            departmentId,
            userId,
            blastType: '',
            campaignId,
            channelId: getSmartPostChannelId(`${type + 'AddName' + currentIndex}`),
            goalNo: 1,
            blastNo: locationAds?.campaignType === 'S' || locationAds?.campaignType === 'T' ? 1 : 0,
            parentChannelDetailId: 0,
            actionId: 0,
            subSegmentId: 0,
        };
        setSmartLinkLoadingIndex(currentIndex);
        const { status, data = {} } =
            (await smartLinkInsertLoader.refetch({
                fetcher: ({ payload } = {}) => dispatch(getSmartUrlDetailByChannel({ payload, loading: false })),
                mode: 'create',
                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                params: { payload },
            })) || {};
        setSmartLinkLoadingIndex(null);
        const { urlName, smartCode, blastSC } = data;
        if (status) {
            let tmpUrlList;
            if (type === 'google') {
                tmpUrlList = googleAdSmartURL;
            } else {
                tmpUrlList = urlName + smartCode + blastSC;
            }
            update(currentIndex, { name: addName, url: tmpUrlList });
            setAdInputValue({
                [currentIndex]: addName.trim(),
            });
        }
    };

    const handleSmartLinkDropdown = async (selectedItem, currentIndex) => {
        const goalNo = selectedItem?.goalNo ?? 1;
        
        let payload = {
            clientId,
            departmentId,
            userId,
            blastType: '',
            campaignId,
            channelId: getSmartPostChannelId(`${type + 'AddName' + currentIndex}`),
            goalNo,
            blastNo: locationAds?.campaignType === 'S' || locationAds?.campaignType === 'T' ? 1 : 0,
            parentChannelDetailId: 0,
            actionId: 0,
            subSegmentId: 0,
        };
        setSmartLinkLoadingIndex(currentIndex);
        const { status, data } =
            (await smartLinkInsertLoader.refetch({
                fetcher: ({ payload } = {}) => dispatch(getSmartUrlDetailByChannel({ payload, loading: false })),
                mode: 'create',
                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                params: { payload },
            })) || {};
        setSmartLinkLoadingIndex(null);
        if (status) {
            let tmpUrlList;
            if (type === 'google') {
                tmpUrlList = googleAdSmartURL;
            } else {
                const { urlName, smartCode, blastSC } = data;
                tmpUrlList = urlName + smartCode + blastSC;
            }
            // Update only the URL, keep the name
            const currentAd = adsName?.[currentIndex];
            update(currentIndex, { name: currentAd?.name || '', url: tmpUrlList });
        }
    };
    const handleSaveChannelsId = async () => {
        const finalSavedChannelId = { ...savedChannelsId };
        const channelID = 10;
        if (savedChannelsId[channelID]?.includes(subChannelId)) {
            finalSavedChannelId[channelID] = [...savedChannelsId[channelID]];
        } else {
            finalSavedChannelId[channelID] = [...(savedChannelsId[channelID] || []), subChannelId];
        }
        await dispatch(updateSaveChannelsId(finalSavedChannelId));
    };

    const onFormSubmit = async (event, type) => {
        const adURL = fields?.map((item, index) => ({
            ad: item.name,
            smartLinkurl: item?.url,
        }));

        const payload = {
            clientId,
            departmentId,
            userId,
            addPaidMediaDetail: {
                campaignId,
                postMediaChannelId: subChannelId,
                postMediaAdTypeId: adType?.postMediaAdTypeId,
                postMediaPostNameId: postOn?.socialMediaPostId === undefined ? 0 : postOn?.socialMediaPostId,
                adurl: adURL,
            },
        };
        const { status, data } = await runSave(getAuthoringSaveButtonType(type), () =>
            dispatch(saveAndUpdatePaidMedia(payload, { loading: false })),
        );
        if (status) {
            await handleSaveChannelsId();
            if (type === 'save') {
                dispatch(resetCreateCommunication());
                navigate('/communication', {
                    index: 0,
                });
            } else {
                handleTapNavigation();
            }
        }
    };
    const sortedAdTypesOfList = adTypesOfList?.sort((a, b) => {
        const nameA = a.adName.toLowerCase();
        const nameB = b.adName.toLowerCase();

        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });
    const handleTapNavigation = () => {
        window.scrollTo(0, 0);
        let tabIndex = adsTabState.currentIndex + 1;
        const adsTabConfig = ADS_TAB_CONFIG();

        // Find the next enabled tab
        while (tabIndex < adsTabConfig?.length && adsTabConfig?.[tabIndex]?.disable === true) {
            tabIndex++;
        }

        if (tabIndex >= availableTabs['ads']?.length) {
            const nextChannel = communicationChannels.find(
                (chan, index) => channelType !== chan && Object.hasOwn(activeTabs, chan) && index > currentTab,
            );
            if (!!nextChannel) {
                dispatch(
                    updateVerticalTab({
                        tabs: activeTabs?.[nextChannel] || {
                            type: 'qr',
                            currentTab: 6,
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
                    const encryptState = encodeUrl(locationAds);
                    dispatch(resetCreateCommunication());
                    navigate(`${url}?q=${encryptState}`, {
                        state: locationAds,
                    });
                }
            }
        } else {
            dispatch(
                updateTab({
                    field: 'ads',
                    data: {
                        tabName: availableTabs['ads'][tabIndex],
                        currentIndex: tabIndex,
                    },
                }),
            );
        }
    };

    const handleErrClose = () => {
        if (isGetAdsFail) {
            navigate('/communication', {
                index: 0,
            });
        }
    };
    return (
        <AuthoringChannelEditSkeletonGate channelId={channelId} isLoading={showEditSkeleton && isSavedChannel}>
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit((data) => onFormSubmit(data, 'form'))}
                className="rsv-tabs-content  position-relative"
            >
                <div className={`box-design bd-top-border`}>
                    {isSmartLink && isCommunicationEditable && (
                        <SmartLinkEnable
                            secondaryButton={false}
                            onSave={() => setIsSmartLink(false)}
                            onReject={() => {
                                dispatch(showTabsSmartlink(true));
                                setIsSmartLink(true);
                            }}
                            isPaidMedia={true}
                            isSmartLink={isSmartLink}
                        />
                    )}
                    <div
                        className={`form-group mt20 ${
                            checkTrigger(locationAds?.campaignType, locationAds?.endDate)
                                ? 'pe-none click-off'
                                : !isCommunicationEditable
                                ? 'pe-none click-off'
                                : ''
                        }`}
                    >
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">{AD_TYPE}</label>
                            </Col>
                            <Col sm={6} id="rs_Ads_adType">
                                <RSKendoDropDownList
                                    control={control}
                                    name={'adType'}
                                    data={sortedAdTypesOfList}
                                    dataItemKey={'postMediaAdTypeId'}
                                    textField={'adName'}
                                    label={AD_TYPE}
                                    isLoading={adTypeLoader.isLoading}
                                    required
                                    handleChange={(selectedItem) => {
                                        const selectedId = selectedItem?.value?.postMediaAdTypeId;
                                        clearErrors('postOn');
                                        resetField('postOn', { defaultValue: '' });
                                        if (selectedId === 9 || selectedId === 4 || selectedId === 10) {
                                            handleSelectItem(selectedId);
                                        } else {
                                            setPostOnList([]);
                                        }
                                    }}
                                    rules={{
                                        required: SELECT_AD_TYPE,
                                    }}
                                />
                            </Col>
                        </Row>

                        {(adType?.postMediaAdTypeId === 4 ||
                            adType?.postMediaAdTypeId === 9 ||
                            adType?.postMediaAdTypeId === 10) && (
                            <div className="form-group mt30">
                                <Row>
                                    <Col sm={{ offset: 1, span: 2 }}>
                                        <label className="control-label-left">{POST_NAME}</label>
                                    </Col>
                                    <Col sm={6}>
                                        <RSKendoDropDownList
                                            control={control}
                                            name={'postOn'}
                                            data={postOnList}
                                            textField={'postName'}
                                            dataItemKey={'socialMediaPostId'}
                                            label={POST_NAME}
                                            required={postOnList?.length > 0}
                                            rules={
                                                postOnList?.length > 0
                                                    ? { required: SELECT_POST_ON }
                                                    : undefined
                                            }
                                            handleChange={() => {
                                                clearErrors('postOn');
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </div>
                    <div
                        className={`form-group mt20 ${
                            checkTrigger(locationAds?.campaignType, locationAds?.endDate)
                                ? 'pe-none click-off'
                                : !isCommunicationEditable
                                ? 'pe-none click-off'
                                : ''
                        }`}
                    >
                        {isMutiField && (
                            <AdsName
                                fieldName={'adsName'}
                                formState={adsName}
                                fields={fields}
                                append={append}
                                remove={remove}
                                updateSmartLink={(value, adNameIndex, currentIndex) => {
                                    handleSmartLink(value, adNameIndex, currentIndex);
                                }}
                                setAdInputValue={setAdInputValue}
                                adInputValue={adInputValue}
                                smartLinks={smartLinks}
                                smartLinkLoading={smartLinkInsertLoader.isLoading}
                                smartLinkLoadingIndex={smartLinkLoadingIndex}
                                handleSmartLinkDropdown={handleSmartLinkDropdown}
                                handleOpenWithAdd={handleOpenWithAdd}
                                maxSmartLinksReached={smartLinks?.length >= MAX_SMART_LINKS}
                            />
                        )}
                    </div>
                    {adsName?.[0]?.name?.length > 0 && (
                        <Row>
                            <Col sm={{ span: 9, offset: 1 }}>
                                <div className="rs-smartlink-box pe-auto">
                                    <div>
                                        <h2 className="text-center">{YOUR_SMART_LINK_IS}</h2>
                                        <p className="text-center">{COPY_AND_PASTE}</p>
                                    </div>
                                    {adsName?.map((ads, idx) => (
                                        <Fragment key={ads.name + idx}>
                                            {ads.name && ads?.url && !adsName?.[idx] && (
                                                <div className="rssb-block  ">
                                                    <Row className="align-items-center">
                                                        <Col sm={3}>
                                                            <span className="rssbb-ad-name">
                                                                {ads?.name?.length > 20 ? (
                                                                    <RSTooltip text={ads?.name} className="ellispis">
                                                                        {truncateTitle(ads?.name, 20)}
                                                                    </RSTooltip>
                                                                ) : (
                                                                    ads?.name
                                                                )}
                                                            </span>
                                                        </Col>
                                                        <Col sm={7}>
                                                            {ads?.name?.length > 0 && ads?.url?.length > 50 ? (
                                                                <RSTooltip text={ads?.url} className="ellispis">
                                                                    <span>{truncateTitle(ads?.url, 50)}</span>
                                                                </RSTooltip>
                                                            ) : (
                                                                <span>{ads?.url}</span>
                                                            )}
                                                        </Col>
                                                        {ads?.url && !adsName?.[idx] && (
                                                            <Col sm={2}>
                                                                <div className="positio-relative">
                                                                    {copyUrl === idx ? (
                                                                        <span className="position-relative">
                                                                            <small className="copied-text ml5">
                                                                                {COPYIED}
                                                                            </small>
                                                                        </span>
                                                                    ) : (
                                                                        ''
                                                                    )}
                                                                    <span
                                                                        className="cp flex-right color-secondary-blue"
                                                                        onClick={(e) => {
                                                                            setCopyUrl(idx);
                                                                            navigator.clipboard.writeText(ads?.url);
                                                                        }}
                                                                    >
                                                                        {/* <span className="link-underline-hover">Copy</span>  */}
                                                                        <RSTooltip
                                                                            text={COPY}
                                                                            position="top"
                                                                            className="lh0"
                                                                        >
                                                                            <i
                                                                                className={`${copy_large} icon-md color-primary-blue`}
                                                                            />
                                                                        </RSTooltip>
                                                                    </span>
                                                                </div>
                                                            </Col>
                                                        )}
                                                    </Row>
                                                </div>
                                            )}
                                        </Fragment>
                                    ))}
                                </div>
                            </Col>
                        </Row>
                    )}
                </div>
                <div className="buttons-holder">
                    <RSSecondaryButton
                        onClick={() => {
                            dispatch(resetCreateCommunication());
                            navigate('/communication', {
                                replace: true,
                                state: {
                                    index: 0,
                                },
                            });
                        }}
                        id="rs_Ads_Cancel"
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSSecondaryButton
                        className={
                            Object.keys(errors)?.length > 0 ? 'click-off color-secondary-blue' : 'color-secondary-blue'
                        }
                        onClick={() => {
                            handleSubmit((data) => onFormSubmit(data, 'save'))();
                        }}
                        name="saveButton"
                        id="rs_Ads_Save"
                        isLoading={isSaveLoading}
                        blockBodyPointerEvents
                        disabledClass={isSubmitting ? 'pe-none click-off' : ''}
                    >
                        {SAVE}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        className={Object.keys(errors)?.length > 0 ? 'click-off' : ''}
                        isLoading={isNextLoading}
                        blockBodyPointerEvents
                        disabledClass={isSubmitting ? 'pe-none click-off' : ''}
                        onClick={() => {
                            if (!isDirty && !isValid) {
                                setNavigate_confirm(true);
                            } else {
                                handleSubmit((data) => onFormSubmit(data, 'next'))();
                            }
                        }}
                        name="nextButton"
                        id="rs_Ads_Next"
                    >
                        {NEXT}
                    </RSPrimaryButton>
                </div>
            </form>
            <RSConfirmationModal
                show={navigate_confirm}
                text={IGNORE_CHANNEL}
                primaryButtonText={OK}
                handleClose={() => {
                    setNavigate_confirm(false);
                }}
                handleConfirm={() => {
                    handleTapNavigation();
                    setNavigate_confirm(false);
                }}
            />
            {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
        </FormProvider>
        </AuthoringChannelEditSkeletonGate>
    );
};

export default Ads;
