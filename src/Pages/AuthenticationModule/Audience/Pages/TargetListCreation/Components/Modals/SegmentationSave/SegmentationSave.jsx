import { encodeUrl } from 'Utils/modules/crypto';
import { navigateBackToCommunicationCreation } from 'Utils/modules/navigation';
import { numberWithCommas } from 'Utils/modules/formatters';
import { CANCEL, CONFIRMATION, ENTER_LIST_NAME, POTENTIAL_AUDIENCE, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import { TargetListContext } from '../../..';
import { finalAPIData, finalSubsegmentAPIData } from '../../../constant';
import { useDispatch, useSelector } from 'react-redux';
import RSConfirmationModal from 'Components/ConfirmationModal';
import {
    updateAndSaveTargetList,
    updateAndSaveTargetList_Partner,
    saveSubSegment_Rule,
} from 'Reducers/audience/targetListCreation/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { update_target_list } from 'Reducers/audience/targetListCreation/reducer';
import useQueryParams from 'Hooks/useQueryParams';

const BASE_TYPE_OPTIONS = [
    { id: 1, label: 'All' },
    { id: 2, label: 'Original base' },
    { id: 3, label: 'Look-alike' },
];

const SegmentationSave = ({ show, handleClose, partnerData = false, isUniqueID = '', filterGroupRef = null, isUpdate = false }) => {
    const location = useLocation();
    const queryParams = useQueryParams('/audience');
    const locationState = useMemo(() => {
        const navigationState = location.state || {};
        if (!queryParams) {
            return Object.keys(navigationState).length ? navigationState : null;
        }
        if (queryParams.__v === 2 && queryParams.__sid) {
            return Object.keys(navigationState).length ? navigationState : null;
        }
        return { ...queryParams, ...navigationState };
    }, [queryParams, location.state]);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { getValues, setValue, control } = useFormContext();
    const { dispatchState, targetListState, updateId } = useContext(TargetListContext);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [isFailure, setIsFailure] = useState(false);
    const [showZeroCount, setShowZeroCount] = useState(true);
    const [warningMessage, setWarningMessage] = useState('');
    const { SubSegmentExp_List } = useSelector(({ dataTargetListReducer }) => dataTargetListReducer);
    const userInfoIds = { departmentId, clientId, userId };

    const { attributeTypes, isZeroDayFiles, filterGroups, isBQAudienceCount, calculateLater, lookAlikeRecAtts } = targetListState;

    const [potentialCount, setPotentialCount] = useState(0);
    const [finalAudCount, setFinalAudCount] = useState(0);
    const [selectedBaseType, setSelectedBaseType] = useState(BASE_TYPE_OPTIONS[0]);
    const [isSaving, setIsSaving] = useState(false);
    const attributes = getValues();
    const {
        attributeslistCount,
        inclusionAudience,
        zeroDayLists,
        filterLists,
        inclusionLists,
        exclusionLists,
        lookALikeAudLists,
        lookALikeAttrLists,
    } = attributes;

    useEffect(() => {
        if (show) {
            renderPotentialAudience();
        }
    }, [show]);

    const renderPotentialAudience = () => {
        const attrs = getValues();
        const {
            attributeslistCount: alCount,
            inclusionAudience: incAud,
            finalAudienceCount,
            zeroDayLists: zd,
            filterLists: fl,
            inclusionLists: il,
            exclusionLists: el,
            lookALikeAudLists: laa,
            lookALikeAttrLists: laaAttr,
        } = attrs;

        const lastListCount = (key) => (alCount?.[key]?.length ? alCount[key][alCount[key].length - 1]?.[0] : 0);

        let nextPotential = 0;
        if (!!fl?.length && !!zd?.length && !!il?.length && !!el?.length && !!laa?.length && !!laaAttr?.length) {
            nextPotential = lastListCount('exclusionLists');
        } else if (!!fl?.length && !!laaAttr?.length) {
            nextPotential = finalAudienceCount || lastListCount('lookALikeAttrLists');
        } else if (!!fl?.length && !!el?.length) {
            nextPotential = finalAudienceCount || 0;
        } else if (!!fl?.length && !!il?.length) {
            nextPotential = incAud;
        } else {
            nextPotential = lastListCount('filterLists');
        }
        setPotentialCount(nextPotential);
        setFinalAudCount(nextPotential);
    };

    const handleBaseTypeSelect = async (option) => {
        setSelectedBaseType(option);
        const isLookAlike = false;
        if (filterGroupRef?.current?.handleAudienceCount) {
            const countRes = await filterGroupRef.current.handleAudienceCount(isLookAlike, true, option);
            if (countRes && typeof countRes === 'object' && 'FinalAudienceCount' in countRes) {
                const finalCount = Number(countRes?.FinalAudienceCount);
                setFinalAudCount(Number.isNaN(finalCount) ? 0 : finalCount);
            }
        }
    };

    const saveTargetList = async () => {
        setIsSaving(true);
        try {
        let transformedData_SubSegmentExp = [],
            listType = 0;
        if (locationState?.isMDCSubSegment && SubSegmentExp_List?.length > 0) {
            // transformedData_SubSegmentExp = transformData_subsegment(SubSegmentExp_List);
            const SubSegmentListResponse = SubSegmentExp_List[0];
            listType = parseInt(SubSegmentListResponse?.listType, 10);
        }
        let finalData = {};
        if (locationState?.isMDCSubSegment) {
            finalData = finalSubsegmentAPIData(
                attributes,
                attributeslistCount,
                attributeTypes,
                updateId,
                isUpdate,
                userInfoIds,
                0,
                potentialCount,
                transformedData_SubSegmentExp,
                locationState,
                isUniqueID,
                SubSegmentExp_List,
                listType,
                filterGroups,
                partnerData,
                selectedBaseType,
            );
        } else {
            finalData = finalAPIData(
                attributes,
                attributeslistCount,
                attributeTypes,
                updateId,
                isUpdate,
                userInfoIds,
                0,
                partnerData,
                potentialCount,
                transformedData_SubSegmentExp,
                locationState,
                isUniqueID,
                filterGroups,
                selectedBaseType,
                lookAlikeRecAtts
            );
        }
        const res = partnerData
            ? await dispatch(updateAndSaveTargetList_Partner(finalData, false))
            : locationState?.isMDCSubSegment
            ? await dispatch(saveSubSegment_Rule(finalData, false))
            : await dispatch(updateAndSaveTargetList(finalData, false));
        setWarningMessage(res?.message);
        if (res?.status) {
            dispatchState({
                type: 'RESET',
            });
            dispatch(update_target_list({ field: 'leftPanelAtt', data: {} }));
            dispatch(update_target_list({ field: 'editList', data: {} }));
            dispatch(update_target_list({ field: 'SubSegmentExp_List', data: [] }));

            if (locationState?.isMDCSubSegment) {
                const queryParamData = {
                    ...locationState,
                    subsegmentFinalCount: parseInt(finalData.totalAudienceCount, 10) || 100,
                    isSubSegementSave: true,
                    saveTargetListId: res?.data ?? 0,
                    subSegmentGUID: finalData?.SubSegmentGUID ?? '',
                };
                const pageFrom = encodeUrl(queryParamData);
                navigate(`/communication/mdc-workflow?q=${pageFrom}`, { state: queryParamData });
            } else if(locationState?.backNavigationDetails?.isCustomNavigate && locationState?.backNavigationDetails?.backPathName){
                const navDetails = locationState?.backNavigationDetails;
                const backPath = navDetails?.backPathName
                if (navDetails?.locationState) {
                    const encryptState = encodeUrl(navDetails.locationState);
                    return navigate(`${backPath}?q=${encryptState}`, {
                        state: navDetails.locationState,
                    });
                } else {
                    return navigate(backPath, {
                        state: {},
                    });
                }
            } else if (
                !navigateBackToCommunicationCreation({
                    dispatch,
                    navigate,
                    navigationState: locationState,
                    extraReturnState: {
                        savedSegmentationListId: res?.data ?? 0,
                    },
                })
            ) {
                const url = '/audience';
                const index = 1;
                const state1 = { index };
                const encryptState = encodeUrl(state1);
                navigate(`${url}?q=${encryptState}`, {
                    state: { index },
                });
            }
        } else {
            // setIsFailure(true);
        }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Fragment>
            <div>
                {!isFailure &&
                    (potentialCount === 0 && !calculateLater && showZeroCount ? (
                        <RSConfirmationModal
                            show={show}
                            header={CONFIRMATION}
                            text="The potential audience count is zero. Do you still want to create this segment?"
                            primaryButtonText="Proceed"
                            handleConfirm={() => setShowZeroCount(false)}
                            handleClose={() => {
                                handleClose(false);
                                dispatchState({
                                    type: 'UPDATE',
                                    payload: false,
                                    field: 'calculateLater',
                                });
                            }}
                            secondaryButton={true}
                        />
                    ) : (
                        <RSModal
                            show={show}
                            size="md"
                            header={isUpdate ? 'Update' : 'Create'}
                            body={
                                <Fragment>
                                    {filterGroups?.groups?.includes('lookALikeAttrLists') && (
                                        <div className="d-flex align-items-center">
                                            <RSBootstrapdown
                                                data={BASE_TYPE_OPTIONS}
                                                isObject
                                                fieldKey="label"
                                                idKey="id"
                                                defaultItem={selectedBaseType}
                                                isActive
                                                className="text-start"
                                                onSelect={handleBaseTypeSelect}
                                            />
                                            <span className="font-bold font-md ml15 mb2">
                                                {numberWithCommas(finalAudCount)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="d-flex align-items-center justify-content-between mt10">
                                        <small className="">{ENTER_LIST_NAME}</small>
                                        {!isZeroDayFiles && (
                                            <small className="text-right mb0 ">
                                                {POTENTIAL_AUDIENCE}:
                                                <span className="ml5">{numberWithCommas(potentialCount)}</span>
                                            </small>
                                        )}
                                    </div>

                                    <RSInput
                                        control={control}
                                        name="segmentation.listName"
                                        // placeholder={ENTER_LIST_NAME}
                                        disabled
                                        required
                                    />
                                </Fragment>
                            }
                            footer={
                                <div className="d-flex justify-content-end">
                                    <RSSecondaryButton
                                        onClick={() => handleClose(false)}
                                        blockInteraction={isSaving}
                                    >
                                        {CANCEL}
                                    </RSSecondaryButton>
                                    <RSPrimaryButton
                                        onClick={saveTargetList}
                                        isLoading={isSaving}
                                        blockBodyPointerEvents={isSaving}
                                    >
                                        {SAVE}
                                    </RSPrimaryButton>
                                </div>
                            }
                            handleClose={() => {
                                if (isSaving) return;
                                handleClose(false);
                            }}
                            isCloseDisabled={isSaving}
                            lockBackground={isSaving}
                        />
                    ))}
            </div>
        </Fragment>
    );
};

export default SegmentationSave;
