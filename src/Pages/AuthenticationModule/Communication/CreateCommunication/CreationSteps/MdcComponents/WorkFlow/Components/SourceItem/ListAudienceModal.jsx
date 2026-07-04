import { encodeUrl } from 'Utils/modules/crypto';
import { handleCustomNavigationDetails } from 'Utils/modules/navigation';
import { SELECT_LIST_TYPE } from 'Constants/GlobalConstant/ValidationMessage';
import { AUDIENCE, AUTO_REFRESH, AUTO_REFRESH_POP_HOVER_TEXT, CANCEL, EXISTING_DATE, GROUP_COMMUNICATIONS, GROUP_COMMUNICATIONS_PERSON, LIST_TYPE, NEW_AUDIENCE_LIST, NO, ONLY_SUBSEGMENT, SAVE, SELECT_SEGMENT_LIST, SUB_SEGMENT_JOURNEY, SUB_SEGMENT_JOURNEY_PERSON, SUB_SEGMENT_JOURNEY_TEXT, TARGET_SPECIFIC, YES } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, circle_plus_fill_medium, circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Container, Row, Col } from 'react-bootstrap';
import RSModal from 'Components/RSModal';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { RSSecondaryButton, RSPrimaryButton } from 'Components/Buttons';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { audienceListValidator } from 'Utils/HookFormValidate';
import { RecipientNameList } from './constant';
import { audienceTypeList, debouncedHandleMDCAudienceFilterChange, handleAutoRefreshClickOff, handlePersonalizationFetchApiCall, handlesubSegmentClickOff, handleCheckCTGT } from '../../../../Create/constant';
import { useDispatch, useSelector } from 'react-redux';
import useQueryParams from 'Hooks/useQueryParams';
import CreateWorkFlowContext, { CreateWorkFlowOtherContext } from '../../context';
import { useNavigate } from 'react-router-dom';

import { markAudienceRouteSkeleton } from 'Components/Skeleton/pages/audience';
import useApiLoader from 'Hooks/useApiLoader';
// import { updateGroupCampaign } from 'Reducers/communication/createCommunication/Mdc/Canvas/reducer';

const ListAudienceModal = ({
    show,
    handleClose,
    selectedAudienceList,
    recipientList,
    handleSaveAudienceList,
    disableSave,
    audiencePayload,
    isAutoRefresh,
    saveAudienceApiError,
    isAudienceLoading = false,
    isAudienceSaving = false,
}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const audienceFilterLoader = useApiLoader({ autoFetch: false });

    const locationState = useQueryParams('/communication') || {};

    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);
    const { setIsWorkflowNavigating } = useContext(CreateWorkFlowOtherContext);
    const {
        Campaign,
        subSegment: { subSegmentList },
        nodeState,
        dataSource,
        defaultEle,
    } = canvasState;

    const { savedChannelStatusId } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const { listTypeWisePersonlization, personalization } = useSelector(
        ({ createCommunicationReducer }) => createCommunicationReducer,
    );

    const [recipientNameList, setRecipientNameList] = useState([]);
    const [audienceClickoff, setAudienceClickoff] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isRemoveSubSegmentStateConfirmation, setIsRemoveSubSegmentStateConfirmation] = useState(false);
    const [nextButtonCGTGModal, setNextButtonCGTGModal] = useState(false);
    const [pendingSaveData, setPendingSaveData] = useState(null);
    const [isCGTGConfirm, setIsCGTGConfirm] = useState(false);
    const {
        control,
        formState: { errors },
        handleSubmit,
        watch,
        setValue,
        setError,
    } = useForm({
        defaultValues: {
            audienceList: selectedAudienceList,
            isAutoRefresh: isAutoRefresh,
            isJourney: canvasState?.dataSource?.isSubsegmentJoureny,
            isGroupedCampaign: canvasState?.dataSource?.isGroupCommunication,
        },
        mode: 'all',
    });
    const [audience, isSubSegmentJounery, isGroupCampaign, audienceType] = watch([
        'audienceList',
        'isJourney',
        'isGroupedCampaign',
        'audienceType',
    ]);
    const addAudienceList = () => {
        handleClose();
        const navigationState = {
            mode: 'add',
            ...locationState,
            ...handleCustomNavigationDetails(locationState),
        };
        const encryptState = encodeUrl(navigationState);
        setIsWorkflowNavigating?.(true);
        markAudienceRouteSkeleton();
        navigate(`/audience/create-target-list?q=${encryptState}`, { state: navigationState });
    };
    const finalAudienceList = useMemo(() => {
        if (!audienceType?.length) return recipientList;

        const availableType = audienceType.map((type) => type?.id);

        const filteredList = availableType.includes(0)
            ? recipientList
            : recipientList?.filter((list) => availableType.includes(list?.listType));

        return recipientList || Array.from(new Map(filteredList.map((item) => [item.segmentationListId, item])).values());
    }, [audienceType, recipientList]);

    useEffect(() => {
        if (!recipientList?.length) return;

        const getList = async () => {
            const uniqueList = Array.from(
                new Map(recipientList.map((item) => [item.segmentationListId, item])).values(),
            );

            const result = await RecipientNameList(uniqueList);
            setRecipientNameList(result);
        };

        getList();
    }, [recipientList]);

    const shouldDisableAutoRefresh = handleAutoRefreshClickOff(audience);
    const shouldDisablesubSegment = handlesubSegmentClickOff(audience);

    useEffect(() => {
        setValue('isAutoRefereshenabled', !shouldDisableAutoRefresh);
        setValue('issubSegmentenabled', shouldDisablesubSegment);
        if (shouldDisablesubSegment) {
            setValue('isJourney', false);
            setValue('isGroupedCampaign', false);
        }
    }, [audience]);

    useEffect(() => {
        if (!show) {
            audienceFilterLoader.reset();
        }
    }, [show]);

    useEffect(() => {
        const matchAudienceType = audienceTypeList?.filter((typeList) =>
            selectedAudienceList?.map((aud) => aud?.listType)?.includes(typeList?.id),
        );
        setValue('audienceType', matchAudienceType?.length ? matchAudienceType : [audienceTypeList[0]]);
    }, [selectedAudienceList]);

    const handlesubSegmentListUpdateClickOff = () => {
        if (canvasState?.subSegment.subSegmentList.length) {
            const atleastOneSegmentSave = canvasState?.subSegment.subSegmentList?.find(
                (segment) => segment?.data?.isSubSegmentSave,
            );
            return atleastOneSegmentSave;
        } else {
            return false;
        }
    };

    useEffect(() => {
        if (handlesubSegmentListUpdateClickOff()) {
            setValue('isJourney', canvasState?.dataSource?.isSubsegmentJoureny ?? false);
            setAudienceClickoff(true);
        } else {
            setValue('isJourney', canvasState?.dataSource?.isSubsegmentJoureny ?? false);
            setAudienceClickoff(false);
        }
    }, [canvasState]);

    useEffect(() => {
        if (!isSubSegmentJounery) {
            setAudienceClickoff(false);
        } else {
            if (handlesubSegmentListUpdateClickOff()) {
                setAudienceClickoff(true);
            } else {
                setAudienceClickoff(false);
            }
        }
    }, [isSubSegmentJounery]);

    const isModalLocked = isAudienceSaving || isAudienceLoading || audienceFilterLoader.isLoading;

    const submitAudienceSave = async (isCGTGEnabledValue) => {
        await handleSubmit(async (data) => {
            await handleSaveAudienceList(
                data,
                isRemoveSubSegmentStateConfirmation ? true : undefined,
                isCGTGEnabledValue,
            );
        })();
    };

    const handleSave = async () => {
        if (isAudienceSaving) return;

        if (audience?.length > 1 && isSubSegmentJounery) {
            setError('audienceList', {
                type: 'custom',
                message: ONLY_SUBSEGMENT,
            });
            return;
        }

        // Check for CG/TG conflicts
        const isCTGTConfirm = handleCheckCTGT(audience);
        const hasUserConfirmed = isCGTGConfirm === true;

        // If only 1 audience is selected, use its isCGTGEnabled value directly
        let isCGTGEnabledValue = false;
        if (audience?.length === 1) {
            isCGTGEnabledValue = audience[0]?.isCGTGEnabled ?? false;
        } else if (audience?.length >= 2) {
            // For 2+ audiences, when user confirms (clicks "Proceed"), set to false
            isCGTGEnabledValue = false;
        }

        const shouldShowConfirmation =
            !showConfirmation &&
            ((isSubSegmentJounery &&
                (Campaign?.CanvasChannel?.Placeholder?.length || Campaign?.CanvasChannel?.activeChannel?.length) &&
                !subSegmentList?.length) ||
                !isSubSegmentJounery);

        const shouldSubmitAudienceList =
            (!isSubSegmentJounery && !Campaign?.CanvasChannel?.activeChannel?.length && !subSegmentList?.length) ||
            (!subSegmentList?.length && !isSubSegmentJounery);

        // Check CG/TG conflict before proceeding
        if (isCTGTConfirm && !hasUserConfirmed) {
            // Store the save data to proceed after confirmation
            const saveData = {
                shouldSubmitAudienceList,
                shouldShowConfirmation,
            };
            setPendingSaveData(saveData);
            setNextButtonCGTGModal(true);
            return;
        }

        if (shouldSubmitAudienceList) {
            await submitAudienceSave(isCGTGEnabledValue);
        } else if (shouldShowConfirmation) {
            setShowConfirmation(true);
        } else {
            await submitAudienceSave(isCGTGEnabledValue);
        }
    };

    const handleViewStatus = () => {
        const isCompletedOneChannel = !savedChannelStatusId?.length
            ? false
            : savedChannelStatusId?.some((savedChannel) => {
                  const findActiveChannel = Campaign?.CanvasChannel?.activeChannel?.find(
                      (matchActive) => matchActive?.ChannelDetailID === savedChannel.channelDetailId,
                  );
                  if (findActiveChannel) {
                      // completed , onhold , alert , inprogress
                      if (
                          savedChannel.statusId === 5 ||
                          savedChannel.statusId === 9 ||
                          savedChannel.statusId === 52 ||
                          savedChannel.statusId === 12
                      ) {
                          return true;
                      }
                  } else {
                      return false;
                  }
              });

        return isCompletedOneChannel;
    };

    return (
        <>
        <RSModal
            size={'md'}
            show={show}
            // isCloseButton={false}
            header={AUDIENCE}
            isMarginTop={false}
            className={'mdcAudienceListPopup'}
            lockBackground={isAudienceSaving}
            isCloseDisabled={isModalLocked}
            // headerRightContent={}
            handleClose={() => {
                if (isAudienceSaving) return;
                handleClose();
            }}
            body={
                <Container className={isAudienceSaving ? 'pe-none click-off' : ''}>
                    {showConfirmation ? (
                        isRemoveSubSegmentStateConfirmation ? (
                            <Row className="mb15">
                                <Col sm={12}>
                                    <p>{EXISTING_DATE}</p>
                                </Col>
                            </Row>
                        ) : (
                            <Row className="mb15">
                                <Col sm={12}>
                                    <p className="text-center">{`Are you sure want to ${
                                        subSegmentList?.length > 0 && !isSubSegmentJounery ? 'remove' : 'convert to'
                                    } subsegment?`}</p>
                                </Col>
                            </Row>
                        )
                    ) : (
                        <>
                            {/* <div className="form-group">
                                <Row>
                                    <Col sm={11}>
                                        <RSMultiSelect
                                            control={control}
                                            name={'audienceType'}
                                            textField={'type'}
                                            dataItemKey={'id'}
                                            label={LIST_TYPE}
                                            required
                                            defaultValue={[audienceTypeList[0]]}
                                            rules={{
                                                required: SELECT_LIST_TYPE,
                                                validate: (value) => {
                                                    const combinationStatus = ListTypeCombinationCheck(
                                                        value?.map((val) => val.id),
                                                    );
                                                    if (!combinationStatus?.status) {
                                                        return combinationStatus?.message;
                                                    }
                                                },
                                            }}
                                            data={audienceTypeList}
                                            handleChange={async ({ value }) => {
                                                const combinationCheck = ListTypeCombinationCheck(
                                                    value?.map((val) => val.id),
                                                );
                                                if (
                                                    combinationCheck?.status &&
                                                    value?.length
                                                ) {
                                                    let payload = {
                                                        ...audiencePayload,
                                                        searchText: '',
                                                        segmentIds: [],
                                                        channelType: '',
                                                        listType: value?.map((val) => val.id)?.join(','),
                                                    };
                                                    await dispatch(
                                                        getRecipientList({
                                                            payload,
                                                        }),
                                                    );
                                                }
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </div> */}
                            <Row>
                                {/* <Col sm="4">
                            <label>Audience list</label>
                        </Col> */}
                                <Col
                                    sm="12"
                                    id="rs_ListAudienceModal_audienceList"
                                    className={`${
                                        disableSave || audienceClickoff || handlesubSegmentListUpdateClickOff()
                                            ? 'pe-none click-off'
                                            : ''
                                    } mb15`}
                                >
                                    <RSMultiSelect
                                        name="audienceList"
                                        defaultValue={selectedAudienceList}
                                        data={recipientNameList}
                                        textField={'recipientsBunchName'}
                                        dataItemKey={'segmentationListId'}
                                        control={control}
                                        label={SELECT_SEGMENT_LIST}
                                        required
                                        loading={isAudienceLoading || audienceFilterLoader.isLoading}
                                        rules={{
                                            required: SELECT_SEGMENT_LIST,
                                            validate: (audienceList) => audienceListValidator(audienceList, true),
                                        }}
                                        footer={() => (
                                            <div
                                                className="d-flex align-items-center justify-content-between px-10 py-8 cp rs-kendo-footer-add-new"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={(e) => {
                                                    if (disableSave) return;
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    addAudienceList();
                                                }}
                                            >
                                                <span className="text-primary-blue">{NEW_AUDIENCE_LIST}</span>
                                                <i
                                                    className={`${circle_plus_fill_medium} icon-md color-primary-blue`}
                                                    id="rs_ListAudienceModal_multiselect_new_list_footer"
                                                />
                                            </div>
                                        )}
                                        handleFilterChange={(event) => {
                                            let payload = {
                                                ...audiencePayload,
                                                searchText: event?.filter?.value ?? '',
                                                segmentIds: [],
                                                channelType: '',
                                            };
                                            debouncedHandleMDCAudienceFilterChange(
                                                audienceFilterLoader.refetch,
                                                dispatch,
                                                payload,
                                            );
                                        }}
                                        disabled={disableSave || audienceClickoff}
                                        handleOnBlur={() => {
                                            // If only 1 audience is selected, set isCGTGEnabled directly from that audience
                                            if (audience?.length === 1) {
                                                setIsCGTGConfirm(false); // Reset confirmation
                                            } else {
                                                // Reset CG/TG confirmation when audience changes (for 2+ audiences)
                                                setIsCGTGConfirm(false);
                                            }
                                            
                                            if (isSubSegmentJounery) {
                                                if (subSegmentList?.length) {
                                                    const isSaveSubSegmentExist = subSegmentList?.find(
                                                        (list) => list?.data.isSubSegmentSave,
                                                    );
                                                    if (isSaveSubSegmentExist && audience?.length) {
                                                        const isSameState =
                                                            JSON.stringify(audience) ===
                                                            JSON.stringify(Campaign?.PotentialRecipients?.Recipients);
                                                        if (!isSameState) {
                                                            setShowConfirmation(true);
                                                            setIsRemoveSubSegmentStateConfirmation(true);
                                                        }
                                                        // else {
                                                        //     handleSubmit(handleSaveAudienceList)();
                                                        // }
                                                    }
                                                }
                                            } else {
                                                setIsRemoveSubSegmentStateConfirmation(false);
                                            }
                                        }}
                                        handleChange={async (e) => {
                                            setIsCGTGConfirm(false);
                                            const dd = audienceListValidator(e.value, false);
                                            const payloadParams = {
                                                ...audiencePayload,
                                            };
                                            const hasAnyTargetListData = Object.keys(listTypeWisePersonlization || {})
                                                .filter((key) => key.startsWith('5|'))
                                                .some((key) => listTypeWisePersonlization[key]?.length > 0);

                                            const hasType5 = Object.keys(listTypeWisePersonlization || {}).some((key) =>
                                                key.startsWith('5|'),
                                            );

                                            const shouldCallAdhocApi = e.value?.some((item) => {
                                                if (item.listType === 1) {
                                                    const key = `1|${item.segmentListId}`;
                                                    return !listTypeWisePersonlization[key]?.length;
                                                }
                                                return false;
                                            });

                                            const shouldCallTargetApi =
                                                !hasType5 && !hasAnyTargetListData && !personalization?.length;
                                            if ((shouldCallTargetApi || shouldCallAdhocApi) && dd === true) {
                                                await handlePersonalizationFetchApiCall({
                                                    audience: e.value,
                                                    errors,
                                                    dispatch,
                                                    payloadParams,
                                                    listTypeWisePersonlization,
                                                });
                                            }
                                        }}
                                    />
                                </Col>
                                <span className={`mb10`}>
                                    <RSCheckbox
                                        control={control}
                                        name="isAutoRefresh"
                                        labelName={AUTO_REFRESH}
                                        popover
                                        popover_icon={`${circle_question_mark_mini} icon-xs color-primary-blue top2`}
                                        popover_position="top"
                                        popover_content={AUTO_REFRESH_POP_HOVER_TEXT}
                                        disabled={shouldDisableAutoRefresh || handleViewStatus()}
                                    />
                                </span>
                            </Row>
                            {/* subSegment flow */}

                            <Row>
                                <Col sm={12} className="mb10">
                                    <span className={''}>
                                        <RSCheckbox
                                            control={control}
                                            name="isJourney"
                                            labelName={SUB_SEGMENT_JOURNEY}
                                            popover
                                            popover_icon={`${circle_question_mark_mini} icon-xs color-primary-blue`}
                                            popover_position="top"
                                            popover_content={TARGET_SPECIFIC}
                                            disabled={shouldDisablesubSegment || handleViewStatus()}
                                        />
                                    </span>
                                </Col>
                            </Row>

                            {isSubSegmentJounery && (
                                <Row>
                                <Col sm={10} className="ml30 border border-r5 p10 mb10">
                                        <RSCheckbox
                                            control={control}
                                            name="restrictContactsToOneSegment"
                                            labelName={SUB_SEGMENT_JOURNEY_PERSON}                                            
                                            checked={true}
                                        />
                                    <small>{SUB_SEGMENT_JOURNEY_TEXT}</small>
                                </Col>
                                    <Col
                                        sm={12}
                                        className={`${handleViewStatus() ? 'pe-none click-off' : ''} ${
                                            saveAudienceApiError?.current ? 'mb10' : ''
                                        } d-flex`}
                                    >
                                        <RSCheckbox
                                            control={control}
                                            name="isGroupedCampaign"
                                            labelName={GROUP_COMMUNICATIONS}
                                            popover
                                            popover_icon={`${circle_question_mark_mini} icon-xs color-primary-blue`}
                                            popover_position="top"
                                            popover_content={GROUP_COMMUNICATIONS_PERSON}
                                            disabledchk={handleViewStatus()}
                                        />
                                        {isGroupCampaign && (
                                            <span className="priority-badge">
                                                ID: {`CE${locationState.campaignId}`}{' '}
                                            </span>
                                        )}
                                    </Col>
                                </Row>
                            )}
                            {saveAudienceApiError?.current && (
                                <Row>
                                    <Col>
                                        <div className={`alert mt15 ${'alert-danger'}`}>
                                            <i
                                                className={`position-relative mr10 p5 white ${
                                                    alert_medium
                                                }  ${'bg-primary-red'} icon-md `}
                                            ></i>
                                            {<span>{saveAudienceApiError?.current}</span>}
                                        </div>
                                    </Col>
                                </Row>
                            )}
                        </>
                    )}
                </Container>
            }
            footer={
                <div>
                    {showConfirmation ? (
                        <>
                            <RSSecondaryButton
                                onClick={() => {
                                    if (isAudienceSaving) return;
                                    if (isRemoveSubSegmentStateConfirmation) {
                                        setValue(
                                            'audienceList',
                                            canvasState?.Campaign?.PotentialRecipients?.Recipients,
                                        );
                                    }
                                    setShowConfirmation(false);
                                }}
                                blockInteraction={isAudienceSaving}
                            >
                                {NO}
                            </RSSecondaryButton>
                            <RSPrimaryButton
                                onClick={handleSave}
                                isLoading={isAudienceSaving}
                                blockBodyPointerEvents
                                disabledClass={isAudienceSaving ? 'pe-none click-off' : ''}
                            >
                                {YES}
                            </RSPrimaryButton>
                        </>
                    ) : (
                        <>
                            <RSSecondaryButton
                                onClick={() => {
                                    if (isAudienceSaving) return;
                                    handleClose();
                                }}
                                blockInteraction={isAudienceSaving}
                            >
                                {CANCEL}
                            </RSSecondaryButton>
                            <RSPrimaryButton
                                onClick={handleSave}
                                isLoading={isAudienceSaving}
                                blockBodyPointerEvents
                                disabledClass={
                                    isAudienceSaving || errors?.audienceList ? 'pe-none click-off' : ''
                                }
                            >
                                {SAVE}
                            </RSPrimaryButton>
                        </>
                    )}
                </div>
            }
        />
        <RSConfirmationModal
            show={nextButtonCGTGModal}
            header="Mixed Control Group Settings Detected"
            text="Selected lists have different Control Group settings and won't be applied now. Enable it in Pre-Campaign Summary to apply to all lists."
            primaryButtonText="Proceed"
            secondaryButtonText="Cancel"
            handleClose={() => {
                setNextButtonCGTGModal(false);
                setPendingSaveData(null);
            }}
            handleConfirm={async () => {
                setNextButtonCGTGModal(false);
                setIsCGTGConfirm(true);

                if (pendingSaveData) {
                    const { shouldSubmitAudienceList, shouldShowConfirmation } = pendingSaveData;

                    if (shouldSubmitAudienceList) {
                        await submitAudienceSave(false);
                    } else if (shouldShowConfirmation) {
                        setShowConfirmation(true);
                    } else {
                        await submitAudienceSave(false);
                    }
                    setPendingSaveData(null);
                }
            }}
        />
        </>
    );
};

export default ListAudienceModal;
