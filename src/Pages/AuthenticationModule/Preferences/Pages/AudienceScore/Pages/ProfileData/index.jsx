import { data_transfer_medium, social_communication_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { FormProvider, useForm } from 'react-hook-form';
import { INITIAL_STATE, buildPayloadProfileData } from './constant';
import { setAudienceScoreTab } from 'Reducers/preferences/audienceScore/reducer';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import usePermission from 'Hooks/usePersmission';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    getProfileData,
    getProfileDataChannelName,
    getProfileDataClassficationAttributeById,
    SaveProfileData,
    UpdateProfileData,
} from 'Reducers/preferences/audienceScore/request';
import ProfileDataCard from '../Components/ProfileData';
import { worthLimit } from '../PurchasePattern/constant';
import GradingCard from '../Components/ProfileData/GradingCard';
import { parseAudienceJson } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import { handleProfileDataGradingTotal } from '../Components/constants';
import { AudienceScoreTabContentSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';



const ProfileData = () => {
    const methods = useForm(INITIAL_STATE);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { permissions } = usePermission();
    const { addAccess, updateAccess } = permissions || {};
    const { departmentId, clientId, userId, departmentName } = useSelector((state) => getSessionId(state));
    const { handleSubmit, getValues, setValue } = methods;
    const [profileData, setProfileData] = useState([]);
    const [channelNameData, setChannelNameData] = useState([]);
    const [classificationData, setClassificationData] = useState([]);
    const [submitAction, setSubmitAction] = useState(null);
    const pageLoadApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const saveProfileApi = useApiLoader({
        autoFetch: false,
        loaderConfig: fieldLoaderConfig,
        mode: profileData?.length ? 'edit' : 'create',
    });
    const isSaveButtonLoading = submitAction === 'save' && saveProfileApi.isFetching;
    const isNextButtonLoading = submitAction === 'next' && saveProfileApi.isFetching;
    const isSubmitting = saveProfileApi.isFetching;
    // console.log('profileData: ', profileData);
    // console.log('classificationData: ', classificationData);
    const { activeTab } = useSelector((state) => state.audienceScoreReducer);
    const getAllValues = getValues();

    const handleNavigation = (response, from) => {
        if (response?.status) {
            if (from === 'save') {
                navigate(`/preferences`);
            } else {
                dispatch(setAudienceScoreTab(activeTab + 1));
            }
        } else {
            return;
        }
    };

    const handleSave = async (data, from) => {
        if (isSubmitting) return;

        const currentUserDetail = {
            departmentId,
            clientId,
            userId,
        };

        const isUpdate = Boolean(profileData?.length);
        const payload = buildPayloadProfileData(profileData, data, currentUserDetail, !isUpdate);

        setSubmitAction(from === 'save' ? 'save' : 'next');
        const response = await saveProfileApi.refetch({
            fetcher: () =>
                dispatch(
                    isUpdate ? UpdateProfileData(payload, false) : SaveProfileData(payload, false),
                ),
            loaderConfig: fieldLoaderConfig,
            mode: isUpdate ? 'edit' : 'create',
        });

        if (response?.status) {
            handleNavigation(response, from);
        }
        setSubmitAction(null);
    };

    const bootstrapProfileData = useCallback(() => {
        if (!clientId || !departmentId || !userId) {
            return undefined;
        }
        const payload = { clientId, departmentId, userId };
        const classificationPayload = { listId: 5, departmentId, clientId, userId };
        return pageLoadApi.refetch({
            fetcher: async () => {
                const [profileRes, classificationRes, channelRes] = await Promise.all([
                    dispatch(getProfileData(payload)),
                    dispatch(getProfileDataClassficationAttributeById(classificationPayload)),
                    dispatch(getProfileDataChannelName(payload)),
                ]);
                return { profileRes, classificationRes, channelRes };
            },
            onSuccess: ({ profileRes, classificationRes, channelRes }) => {
                if (profileRes?.status) {
                    setProfileData(profileRes?.data ?? []);
                } else {
                    setProfileData([]);
                }
                if (classificationRes?.status) {
                    const getJsonParseData = parseAudienceJson(classificationRes?.data, {});
                    setClassificationData(Array.isArray(getJsonParseData?.data) ? getJsonParseData.data : []);
                } else {
                    setClassificationData([]);
                }
                if (channelRes?.status) {
                    setChannelNameData(channelRes?.data ?? []);
                } else {
                    setChannelNameData([]);
                }
            },
            onError: () => {
                setProfileData([]);
                setClassificationData([]);
                setChannelNameData([]);
            },
        });
    }, [clientId, departmentId, userId, dispatch, pageLoadApi.refetch]);

    useEffect(() => {
        bootstrapProfileData();
    }, [bootstrapProfileData]);

    const updateName = (name) => {
        const updatedName = name?.toLowerCase()?.replaceAll(/\s+/g, '');
        return updatedName;
    };

    const { referralviralityProfile, omnipresenceProfile, networkworthProfile, dataaugmentationProfile } = getAllValues;

    useEffect(() => {
        handleProfileDataGradingTotal(getAllValues, setValue);
    }, [referralviralityProfile, omnipresenceProfile, networkworthProfile, dataaugmentationProfile]);

    const getCurrentProfileData = (type) => {
        if (profileData?.length) {
            return profileData.find((item) => updateName(item?.dataSegmentKey) === updateName(type));
        }
    };

    const otherTypeKeyMapDetail = {
        textField: 'ChannelName',
        dataItemKey: 'ChannelID',
        campareId: 'byChannel',
    };

    return (
        <FormProvider {...methods}>
            <AudienceScoreTabContentSkeletonGate isLoading={pageLoadApi.isFetching} variant="profile">
            <form className="rsv-tabs-content" onSubmit={(event) => event.preventDefault()}>
                <div className="box-design bd-top-border">
                    {/* Content starts */}
                    <Row className="mb10">
                        <Col sm={8}>
                            <h4 className="m0">Profile Data</h4>
                        </Col>
                    </Row>
                    <Row>
                        <ProfileDataCard
                            name={'dataaugmentation'}
                            title={'By data'}
                            head={'Data augmentation'}
                            keyMapping={{
                                textField: 'uIPrintableName',
                                dataItemKey: 'dataAttributeId',
                                campareId: 'byData',
                            }}
                            profileData={getCurrentProfileData('Data augmentation')}
                            dropDownData={classificationData}
                            cardicons={data_transfer_medium}
                        />
                        <ProfileDataCard
                            name={'omnipresence'}
                            title={'By channel'}
                            head={'Omni presence'}
                            keyMapping={otherTypeKeyMapDetail}
                            profileData={getCurrentProfileData('Omni presence')}
                            dropDownData={channelNameData}
                            cardicons={social_communication_medium}
                        />
                        <ProfileDataCard
                            name={'referralvirality'}
                            title={'By channel'}
                            head={'Referral/virality'}
                            keyMapping={otherTypeKeyMapDetail}
                            profileData={getCurrentProfileData('Referral/virality')}
                            dropDownData={channelNameData}
                            cardicons={social_communication_medium}
                        />
                        <ProfileDataCard
                            name={'networkworth'}
                            title={'By channel'}
                            head={'Network worth'}
                            keyMapping={otherTypeKeyMapDetail}
                            profileData={getCurrentProfileData('Network worth')}
                            dropDownData={channelNameData}
                            cardicons={social_communication_medium}
                            isWorth
                        />
                        <GradingCard
                            name="grading"
                            gradingData={getCurrentProfileData('Grading')}
                            head="Grading"
                            title={'Total score'}
                            isGrading={true}
                            DurationData={worthLimit}
                        />
                        {/* <CommonCard
                            headName={'dataArguments'}
                            head={'Data augmentation'}
                            tooltip={'Data wise'}
                            cardicons={data_transfer_medium}
                            filpData={'Full profile information'}
                            constants={DATA_ARGUMENTATION}
                            // extraClass={'py25 px7'}
                        />
                        <CommonCard
                            head={'Omnichannel presence'}
                            cardicons={social_communication_medium}
                            headName={'omnichannel'}
                            tooltip={'Channel wise'}
                            filpData={'Overall value'}
                            constants={OMNI_CHANNEL}
                            // extraClass={'py25 px7'}
                        />
                        <CommonCard
                            head={'Referral & virality'}
                            cardicons={social_communication_medium}
                            headName={'referal'}
                            tooltip={'Channel wise'}
                            filpData={'Overall value'}
                            constants={OMNI_CHANNEL}
                            // extraClass={'py25 px7'}
                        />
                        <CommonCard
                            head={'Network worth'}
                            cardicons={social_communication_medium}
                            headName={'networkWorth'}
                            tooltip={'Channel wise'}
                            filpData={'Overall worth'}
                            constants={NETWORK_WORTH}
                            // extraClass={'py25 px7'}
                        />
                        <Grading head={'Gradings'} name={'grading'} constants={NETWORK_WORTH} /> */}
                    </Row>
                </div>
                {/* Buttons Row */}
                <div className="buttons-holder">
                    <RSSecondaryButton
                        blockInteraction={isSubmitting}
                        onClick={() => {
                            if (isSubmitting) return;
                            navigate(`/preferences`);
                        }}
                    >
                        Cancel
                    </RSSecondaryButton>
                    {(addAccess || updateAccess) && (
                        <>
                            <RSSecondaryButton
                                className={`color-primary-blue ${isNextButtonLoading ? 'pe-none click-off' : ''}`}
                                isLoading={isSaveButtonLoading}
                                blockBodyPointerEvents={isSaveButtonLoading}
                                onClick={handleSubmit((data) => {
                                    if (isSubmitting) return;
                                    handleSave(data, 'save');
                                })}
                            >
                                Save
                            </RSSecondaryButton>
                            <RSPrimaryButton
                                isLoading={isNextButtonLoading}
                                blockBodyPointerEvents={isNextButtonLoading}
                                disabledClass={isSaveButtonLoading ? 'pe-none click-off' : ''}
                                onClick={handleSubmit((data) => {
                                    if (isSubmitting) return;
                                    handleSave(data, 'next');
                                })}
                            >
                                Next
                            </RSPrimaryButton>
                        </>
                    )}
                </div>
            </form>
            </AudienceScoreTabContentSkeletonGate>
        </FormProvider>
    );
};

export default ProfileData;
