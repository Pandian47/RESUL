import { ADD_OFFER, ADD_OFFER_SAME_OFFER, ADD_OFFER_UNIQUE_OFFER, CANCEL, OFFER_CODE_TYPE, OFFER_LIST_VOLUME_ERROR_MSG, RESET, SAVE, SAVING, SELECT_OFFER } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_medium, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useForm, useWatch } from 'react-hook-form';
import _get from 'lodash/get';

import RSModal from 'Components/RSModal';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSPPophover from 'Components/RSPPophover';
import RSRadioButton from 'Components/FormFields/RSRadioButton';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getSessionId } from 'Reducers/globalState/selector';
import { useDispatch, useSelector } from 'react-redux';
import { getOfferNameList, getOfferType, offerCodeCountApi, saveBestOffer } from 'Reducers/preferences/OfferManagements/request';
import { getOfferManagement } from 'Reducers/preferences/OfferManagements/reducer';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import RSTooltip from 'Components/RSTooltip';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
import { AUTHORING_FIELD_LOADER_CONFIG, AUTHORING_SAVE_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';

const OfferModal = ({ show, handleClose, confirm, split = '', audienceCount = 0, fromSmartLink = false }) => {
    const [isShow, setShow] = useState(false);
    const dispatch = useDispatch();
    const locationState = useQueryParams('/communication');
    const campaignId = _get(locationState, 'campaignId');
    const { verticalTab, tabsState } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const [isFailure, setIsFailure] = useState(false);
    const INITIAL_VALUES = {
        defaultValues: {
            offer: {
                offerCodeType: '',
                offerType: '',
                offerList: '',
            },
            offerCodeCount: '',
        },
    };
    const { control, watch, handleSubmit, setValue, reset } = useForm(INITIAL_VALUES);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { getOfferTypeData, getOfferNameListData, getBestOffer } = useSelector(
        (state) => state.offerMangementReducer,
    );
    const {totalAudienceCount} = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    
    const actualAudienceCount = totalAudienceCount || audienceCount;
    const [isRefresh, setIsRefresh] = useState(false);
    const [isEnableSave, setIsEnableSave] = useState(false);
    const offerTypeLoader = useApiLoader();
    const offerNameLoader = useApiLoader();
    const offerCodeCountLoader = useApiLoader({ autoFetch: false });
    const offerSaveApi = useApiLoader({ autoFetch: false });
    const isSavingOffer = offerSaveApi.isFetching;
    const watchingFields = watch('offer');
    const offerFields = useWatch({ control, name: 'offer' });
    const watchOfferCodeType = watch('offer.offerCodeType');
    const hasOfferCodeTypeSelected =
        watchOfferCodeType === 'Common' || watchOfferCodeType === 'Unique';
    const offerCodeCount = watch('offerCodeCount');
    const [offerCount, setOfferCount] = useState(0);
    const resetOfferFormState = useCallback(() => {
        reset(INITIAL_VALUES.defaultValues);
        setValue('offerCodeCount', '');
        setOfferCount(0);
        setIsFailure(false);
        setIsEnableSave(false);
        setIsRefresh(false);
        dispatch(getOfferManagement({ field: 'getOfferNameListData', data: [] }));
    }, [dispatch, reset, setValue]);
    useEffect(() => {
        async function fetchDetails() {
            const payload = { departmentId, clientId, userId };
            const offerTypeRes = await offerTypeLoader.refetch({
                fetcher: ({ payload: offerPayload } = {}) =>
                    dispatch(getOfferType(offerPayload, false, { loading: false })),
                mode: 'create',
                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                params: { payload },
            });
            if (offerTypeRes?.status) {
                dispatch(getOfferManagement({ field: 'getOfferTypeData', data: offerTypeRes?.data }));
            } else {
                dispatch(getOfferManagement({ field: 'getOfferTypeData', data: [] }));
            }
        }
        if (show) fetchDetails();
    }, [show]);

   useEffect(() => {
        setShow(show);
        return () => {
            //debugger;
            if(!show)
            reset((state) => ({ ...state, ...INITIAL_VALUES.defaultValues }));
        };
    }, [show])
    useEffect(() => {
        const hasOfferTypeChanged = watchOfferCodeType && watchOfferCodeType !== INITIAL_VALUES.defaultValues.offer.offerCodeType;
        if (hasOfferTypeChanged && isShow) setIsRefresh(true);
        else setIsRefresh(false);
    }, [watchOfferCodeType, isShow]);

    const handleOfferCodeTypeChange = useCallback(() => {
        setValue('offer.offerType', '');
        setValue('offer.offerList', '');
        setValue('offerCodeCount', '');
        setOfferCount(0);
        setIsFailure(false);
        setIsEnableSave(false);
        dispatch(getOfferManagement({ field: 'getOfferNameListData', data: [] }));
    }, [dispatch, setValue]);

    const handleChange = async (event) => {
        setValue('offer.offerList', {});
        const {
            target: {
                name,
                value: { offerTypeId },
            },
        } = event;
        setValue('offerCodeCount', '');
        const payload = {
            departmentId,
            clientId,
            userId,
            offerTypeId: offerTypeId,
            offerCodeType: watchingFields?.offerCodeType === 'Common' ? 0 : 1,
            campaignId: campaignId,
        };
        const { status, data } =
            (await offerNameLoader.refetch({
                fetcher: ({ payload: namePayload } = {}) =>
                    dispatch(getOfferNameList(namePayload, { loading: false })),
                mode: 'create',
                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                params: { payload },
            })) || {};
        if (status) {
            dispatch(getOfferManagement({ field: 'getOfferNameListData', data: data }));
        } else {
            dispatch(getOfferManagement({ field: 'getOfferNameListData', data: [] }));
        }
    };
    const handleOfferCount = async (event) => {
        if (watchingFields?.offerCodeType !== 'Common') {
            const {
                target: {
                    value: { offerId },
                },
            } = event;
            setValue('offerCodeCount', '');
            const payload = {
                offerId,
                campaignId,
            };
            const { status, data, message } =
                (await offerCodeCountLoader.refetch({
                    fetcher: () => dispatch(offerCodeCountApi(payload, { loading: false })),
                    mode: 'create',
                    loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                    params: { payload },
                })) || {};
            if (status) {
                setValue('offerCodeCount', data + ' ' + message);
                setOfferCount(data);
                setIsFailure(false);
            } else {
                setValue('offerCodeCount', message);
                setIsFailure(true);
            }
        }
    };

    const getChannel = () => {
        let key = tabsState[verticalTab.type === 'notifications' ? 'notification' : verticalTab.type];
        switch (key?.tabName) {
            case 'email':
                return '1';
            case 'sms':
                return '2';
            case 'whatsapp':
                return '21';
            case 'vms':
                return '25';
            case 'web':
                return '8';
            case 'mobile':
                return '14';
            default:
                return '1';
        }
    };

    const handleOnSubmit = async ({ offer }) => {
        if (isSavingOffer) return;
        let {
            offerList: { offerName, offerId },
            offerType: { offerTypeId },
        } = offer;
        let channelId = getChannel();
        let payload = {
            userId,
            departmentId,
            campaignId,
            offerId: offerId,
            selectedoffers: [
                {
                    offerTypeId: offerTypeId,
                    offerCodeType: watchingFields?.offerCodeType === 'Common' ? 0 : 1,
                    offerName: offerName,
                    channelId: +channelId,
                    SplitType: split,
                },
            ],
        };
        const res = await offerSaveApi.refetch({
            fetcher: () => dispatch(saveBestOffer(payload, { loading: false })),
            mode: 'create',
            loaderConfig: AUTHORING_SAVE_LOADER_CONFIG,
            params: { payload },
        });
        if (res?.status) {
            const trimOfferName = offerName.trim().replace(/\s+/g, '');
            confirm({
                ...res?.data,
                offerVal: fromSmartLink ? `URL_OFFER_CODE_${offerId}_${trimOfferName}` : `TEXT_OFFER_CODE_${offerId}_${trimOfferName}`,
            });
            setValue('offerCodeCount', ' ');
        } else {
            handleClose();
        }
    };

    const onSubmit = async (data) => {
        if (isSavingOffer) return;
        await handleOnSubmit(data);
    };

    useEffect(() => {
        if (watchingFields === '') {
            setIsEnableSave(false);
        } else {
            const status = Object.values(watchingFields).every(
                (item) => item !== '' && item !== undefined && Object.keys(item)?.length > 0,
            );
            setIsEnableSave(status);
        }
    }, [offerFields, watchingFields]);

    return (
        <RSModal
            show={isShow}
            size="lg"
            header={ADD_OFFER}
            lockBackground={isSavingOffer}
            handleClose={() => {
                resetOfferFormState();
                handleClose();
            }}
            body={
                <div>
                    <div className="form-group fg-wl-radio-group">
                        <Row>
                            <Col sm={3} className="text-right">
                                <label className="control-label-left mt3">{OFFER_CODE_TYPE}</label>
                            </Col>
                            <Col sm={7} className="d-flex rg ">
                                <div className={`${isRefresh ? 'pe-none click-off' : ''}`}>
                                    <RSRadioButton
                                        control={control}
                                        name="offer.offerCodeType"
                                        labelName={'Common'}
                                        defaultValue={watchingFields?.offerCodeType}
                                        radio_wrapper_class={'m0'}
                                        handleChange={handleOfferCodeTypeChange}
                                    />
                                </div>
                                <div className={`${isRefresh ? 'pe-none click-off' : ''}`}>
                                    <RSRadioButton
                                        control={control}
                                        name="offer.offerCodeType"
                                        labelName={'Unique'}
                                        defaultValue={watchingFields?.offerCodeType}
                                        radio_wrapper_class={'m0'}
                                        handleChange={handleOfferCodeTypeChange}
                                    />
                                </div>

                                <div className='mt-3'>

                                <RSPPophover
                                    pophover={
                                        <ul className="rs-tooltip-text-multi">
                                            <li>
                                                <span>{ADD_OFFER_UNIQUE_OFFER}</span>
                                            </li>
                                            <li>
                                                <span>{ADD_OFFER_SAME_OFFER}</span>
                                            </li>
                                        </ul>
                                    }
                                    popover_overlay_class={'modalOverlayZindexCSS'}
                                >
                                    <i
                                        className={`${circle_question_mark_medium} icon-md color-primary-blue cp mr15`}
                                        id="circle_question_mark"
                                    ></i>
                                </RSPPophover>

                                {hasOfferCodeTypeSelected && (
                                    <RSTooltip
                                        position="top"
                                        className="d-inline-flex "
                                        text={RESET}
                                    >
                                        <i
                                            id="rs_data_refresh"
                                            className={`${restart_medium} icon-md color-primary-blue`}
                                            onClick={() => {
                                                resetOfferFormState();
                                            }}
                                        />
                                    </RSTooltip>
                                )}
                                </div>
                            </Col>
                            <Col></Col>
                        </Row>
                    </div>

                    <div className="form-group mb0">
                        <Row>
                            <Col sm={3} className="text-right">
                                <label className="control-label-left">{SELECT_OFFER}</label>
                            </Col>
                            <Col sm={8}>
                                <Row>
                                    <Col
                                        sm={6}
                                        className={hasOfferCodeTypeSelected ? '' : 'pe-none click-off'}
                                    >
                                        <RSKendoDropDownList
                                            control={control}
                                            name="offer.offerType"
                                            data={getOfferTypeData}
                                            required
                                            textField="offerName"
                                            dataItemKey="offerTypeId"
                                            label={`${SELECT_OFFER} type`}
                                            isLoading={offerTypeLoader.isLoading}
                                            handleChange={handleChange}
                                        />
                                    </Col>
                                    <Col
                                        sm={6}
                                        className={
                                            hasOfferCodeTypeSelected && watchingFields?.offerType !== ''
                                                ? ''
                                                : 'pe-none click-off'
                                        }
                                    >
                                        <RSKendoDropDownList
                                            control={control}
                                            name="offer.offerList"
                                            textField="offerName"
                                            required
                                            dataItemKey="offerId"
                                            data={getOfferNameListData}
                                            label={`${SELECT_OFFER} list`}
                                            isLoading={offerNameLoader.isLoading}
                                            handleChange={handleOfferCount}
                                        />
                                    </Col>
                                    {watchingFields?.offerCodeType !== 'Common' &&
                                        watchingFields?.offerList &&
                                        Object.keys(watchingFields?.offerList)?.length > 0 &&
                                        (offerCodeCountLoader.isLoading ? (
                                            <div className="mt5">
                                                <CommonSkeleton box width={200} height={14} />
                                            </div>
                                        ) : (
                                            <>
                                                {actualAudienceCount > offerCount ? (
                                                    <div className={'color-primary-red'}>
                                                        {OFFER_LIST_VOLUME_ERROR_MSG}
                                                    </div>
                                                ) : (
                                                    <div className={isFailure ? 'color-primary-red' : ''}>
                                                        {offerCodeCount && offerCodeCount}
                                                    </div>
                                                )}
                                            </>
                                        ))}
                                </Row>
                            </Col>
                        </Row>
                    </div >
                </div >
            }
            footer={
                <>
                    <RSSecondaryButton
                        onClick={() => {
                            if (isSavingOffer) return;
                            resetOfferFormState();
                            handleClose(false);
                        }}
                        blockInteraction={isSavingOffer}
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={handleSubmit(onSubmit)}
                        isLoading={isSavingOffer}
                        loadingText={SAVING}
                        disabledClass={
                            isSavingOffer || !isEnableSave || isFailure ? 'pe-none click-off' : ''
                        }
                        blockBodyPointerEvents
                    >
                        {SAVE}
                    </RSPrimaryButton>
                </>
            }
        />
    );
};

export default OfferModal;
