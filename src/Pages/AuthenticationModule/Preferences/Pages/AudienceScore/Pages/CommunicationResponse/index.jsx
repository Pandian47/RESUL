import { onlyNumbersDecimalWithoutSpecialCharacters } from 'Utils/modules/inputValidators';
import { ENTER_VALID_DATA, SHOULD_BE_LESS } from 'Constants/GlobalConstant/ValidationMessage';
import { AUDIENCE_SCORE_DEPRECIATION, CANCEL, COMMUNICATION_RESPONSE, NEXT, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { useCallback, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { INITIAL_STATE, commuResponseChannelData, getCommuAttribute, buildPayload, customDropdownData } from './constant';
import CommonCard from '../Components/CommonCards';
import CompareCard from '../Components/CompareCard';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import { setAudienceScoreTab } from 'Reducers/preferences/audienceScore/reducer';

import usePermission from 'Hooks/usePersmission';
import { getSessionId } from 'Reducers/globalState/selector';
import CommunicaitionCard from '../Components/Communication';
import {
    getCampaignResponse,
    getCampaignResponseData,
    getPeriodKeys,
    get_LadderSentimentKeys,
} from 'Reducers/preferences/audienceScore/request';
import { getCommunicationAttributes } from 'Reducers/communication/createCommunication/plan/request';
import { AudienceScoreTabContentSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import {
    getAudienceScoreListFromResponse,
} from '../Components/constants';
const CommunicationResponse = () => {
    const navigate = useNavigate();
    const methods = useForm(INITIAL_STATE);
    const dispatch = useDispatch();
    const { permissions } = usePermission();
    const { addAccess, updateAccess } = permissions || {};
    const { departmentId, clientId, userId, departmentName } = useSelector((state) => getSessionId(state));
    const { control, handleSubmit, setValue } = methods;
    const { activeTab } = useSelector((state) => state.audienceScoreReducer);
    const [commuResponseAllChannel, setCommuResponseAllChannel] = useState([]);

    const [reachData, setReachData] = useState([]);
    const [allReachData, setAllReachData] = useState([]);
    const [reachDropDownData, setReachDropDownData] = useState([]);

    const [engagementData, setEngagementData] = useState([]);
    const [allEngagementData, setAllEngagementData] = useState([]);
    const [engagementDropDownData, setEngagementDropDownData] = useState([]);

    const [conversionData, setConversionData] = useState([]);
    const [allConversionData, setAllConversionData] = useState([]);
    const [conversionDropDownData, setConversionDropDownData] = useState([]);

    const [goalFrequencyData, setGoalFrequencyData] = useState([]);
    const [sentimentKeys, setSentimentKeys] = useState([]);

    const [commuAttribute, setCommuAttribute] = useState([]);
    const [customCommuAttribute, setCustomAttribute] = useState([]);
    const [periodkeys, setPeriodkeys] = useState([]);
    const pageLoadApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });

    const applyCampaignResponseState = (allChannel, response, setters) => {
        if (!response?.status || !Array.isArray(response?.data)) {
            setters.setDropDown([]);
            setters.setChannelData([]);
            setters.setAllData([]);
            return;
        }

        setters.setDropDown(customDropdownData(response.data));
        setters.setChannelData(commuResponseChannelData(allChannel, response.data));
        setters.setAllData(response.data);
    };

    const handleSave = (data, from) => {
        // debugger;
                const payload = buildPayload(
            departmentId,
            clientId,
            userId,
            data,
            commuResponseAllChannel,
            allReachData,
            allEngagementData,
            allConversionData,
            commuAttribute,
        );

        
        if (true) {
            if (from === 'save') navigate(`/preferences`);
            else {
                dispatch(setAudienceScoreTab(activeTab + 1));
            }
        }
    };

    const bootstrapCommunicationResponse = useCallback(() => {
        if (!clientId || !departmentId || !userId) {
            return undefined;
        }
        const payload = { clientId, departmentId, userId };
        return pageLoadApi.refetch({
            fetcher: async () => {
                const [
                    sentimentRes,
                    channelRes,
                    attributesRes,
                    periodRes,
                    reachRes,
                    engagementRes,
                    leadsRes,
                ] = await Promise.all([
                    dispatch(get_LadderSentimentKeys(payload)),
                    dispatch(getCampaignResponseData(payload)),
                    dispatch(getCommunicationAttributes({ payload })),
                    dispatch(getPeriodKeys(payload)),
                    dispatch(getCampaignResponse({ ...payload, campaigntarget: 'Reach' })),
                    dispatch(getCampaignResponse({ ...payload, campaigntarget: 'Engagement' })),
                    dispatch(getCampaignResponse({ ...payload, campaigntarget: 'Leads' })),
                ]);
                return { sentimentRes, channelRes, attributesRes, periodRes, reachRes, engagementRes, leadsRes };
            },
            onSuccess: ({
                sentimentRes,
                channelRes,
                attributesRes,
                periodRes,
                reachRes,
                engagementRes,
                leadsRes,
            }) => {
                const allChannel = getAudienceScoreListFromResponse(channelRes);

                setSentimentKeys(getAudienceScoreListFromResponse(sentimentRes));
                setCommuResponseAllChannel(allChannel);
                if (attributesRes?.status && Array.isArray(attributesRes?.data) && attributesRes.data.length > 0) {
                    setCustomAttribute(getCommuAttribute(attributesRes.data));
                    setCommuAttribute(attributesRes.data);
                } else {
                    setCustomAttribute([]);
                    setCommuAttribute([]);
                }
                setPeriodkeys(
                    getAudienceScoreListFromResponse(periodRes)
                        ?.map((item) => item?.attributeName)
                        ?.filter(Boolean) ?? [],
                );

                applyCampaignResponseState(allChannel, reachRes, {
                    setDropDown: setReachDropDownData,
                    setChannelData: setReachData,
                    setAllData: setAllReachData,
                });
                applyCampaignResponseState(allChannel, engagementRes, {
                    setDropDown: setEngagementDropDownData,
                    setChannelData: setEngagementData,
                    setAllData: setAllEngagementData,
                });
                applyCampaignResponseState(allChannel, leadsRes, {
                    setDropDown: setConversionDropDownData,
                    setChannelData: setConversionData,
                    setAllData: setAllConversionData,
                });
            },
            onError: () => {
                setSentimentKeys([]);
                setCommuResponseAllChannel([]);
                setCustomAttribute([]);
                setCommuAttribute([]);
                setPeriodkeys([]);
                setReachData([]);
                setAllReachData([]);
                setReachDropDownData([]);
                setEngagementData([]);
                setAllEngagementData([]);
                setEngagementDropDownData([]);
                setConversionData([]);
                setAllConversionData([]);
                setConversionDropDownData([]);
                setGoalFrequencyData(undefined);
            },
        });
    }, [clientId, departmentId, userId, dispatch, pageLoadApi.refetch]);

    useEffect(() => {
        bootstrapCommunicationResponse();
    }, [bootstrapCommunicationResponse]);

    useEffect(() => {
        if (!Array.isArray(commuResponseAllChannel) || !commuResponseAllChannel.length) {
            return;
        }
        const scoreDepreciation = commuResponseAllChannel.find(
            (item) => item?.campaignGoalPeriodRange === 'year' && item?.responseScore === 0,
        );
        const goalFrequency = commuResponseAllChannel.find(
            (item) => item?.campaignSegment === 'Goalfrequency' && item?.campaignGoalPeriodRange === 'Week',
        );
        setGoalFrequencyData(goalFrequency);
        if (scoreDepreciation) setValue('depreciation', scoreDepreciation?.campaignSegmentRule?.Percentage);
    }, [commuResponseAllChannel, setValue]);

    useEffect(() => {
        if (periodkeys?.length) {
            setValue('priority', periodkeys[0]);
        }
    }, [periodkeys, setValue]);

    // console.log(commuAttribute,customCommuAttribute);

    return (
        <FormProvider {...methods}>
            <AudienceScoreTabContentSkeletonGate isLoading={pageLoadApi.isFetching} variant="communication">
            <form className="rsv-tabs-content" onSubmit={handleSubmit(handleSave)}>
                <div className="box-design bd-top-border">
                    {/* Content starts */}
                    <Row className="mb10">
                        <Col sm={8}>
                            <h4 className="m0">{COMMUNICATION_RESPONSE}</h4>
                        </Col>
                    </Row>
                    <Row>
                        <CommunicaitionCard
                            name={'reach'}
                            head={'Reach'}
                            constants={reachData}
                            allChannel={commuResponseAllChannel}
                            dropDownData={reachDropDownData}
                            isLoading={pageLoadApi.isFetching}
                        />
                        <CommunicaitionCard
                            name={'engagement'}
                            head={'Engagement'}
                            constants={engagementData}
                            allChannel={commuResponseAllChannel}
                            dropDownData={engagementDropDownData}
                            isLoading={pageLoadApi.isFetching}
                        />
                        <CommunicaitionCard
                            name={'conversion'}
                            head={'Conversion'}
                            constants={conversionData}
                            allChannel={commuResponseAllChannel}
                            dropDownData={conversionDropDownData}
                            isLoading={pageLoadApi.isFetching}
                        />

                        <CommunicaitionCard
                            name={'CampaingDetails'}
                            head={'Communication details'}
                            constants={customCommuAttribute}
                            allChannel={commuResponseAllChannel}
                            dropDownData={customCommuAttribute}
                            isLoading={pageLoadApi.isFetching}
                        />

                        <CompareCard
                            name={'goal'}
                            head={'Goal frequency'}
                            lessLabel="Once"
                            moreLabel="More than"
                            constants={goalFrequencyData}
                            periodkeys={periodkeys}
                            allChannel={commuResponseAllChannel}
                        />

                        <CommonCard
                            name={'brandSentiment'}
                            headName={'brandSentiment'}
                            head={'Brand Sentiment'}
                            constants={sentimentKeys}
                            allChannel={commuResponseAllChannel}
                        />

                        {/* <CommunicaitionCard name={'reach'} head={'Communication response'} constants={reachData} /> */}
                        {/* <CampainCard name={'reach'} head={'Reach'} constants={CAMPAIN_DATA} />
                        <CampainCard name={'engagement'} head={'Engagement'} constants={CAMPAIN_DATA} />
                        <CampainCard name={'conversion'} head={'Conversion'} constants={CAMPAIN_DATA} />
                        <CampainCard name={'campaignDetails'} head={'Communication details'} constants={CAMPAIN_DATA} />
                        <CompareCard name={'goal'} head={'Goal frequency'} lessLabel="Once" moreLabel="More than" />
                        <CommonCard name={'brandSentiment'} head={'Brand Sentiment'} constants={BRAND_SENTIMENT} /> */}
                    </Row>
                    {commuResponseAllChannel?.length > 0 && periodkeys?.length > 0 && (
                        <Row className='mb15'>
                            <Col
                                sm={{ span: 8, offset: 2 }}
                                className="d-flex align-items-center justify-content-center"
                            >
                                <div>{AUDIENCE_SCORE_DEPRECIATION}</div>
                                <div className="width15p mx10">
                                    <RSInput
                                        // defaultValue={5}
                                        control={control}
                                        name={`depreciation`}
                                        onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                        rules={{
                                            required: ENTER_VALID_DATA,
                                            validate: (value) => (Number(value) <= 100 ? true : SHOULD_BE_LESS),
                                        }}
                                    />
                                </div>
                                <div className="mr5">% per</div>
                                <div className="width15p mx10">
                                    <RSKendoDropDownList
                                        control={control}
                                        name="priority"
                                        data={periodkeys}
                                        // label="Priority"
                                        defaultValue={periodkeys[2]}
                                    />
                                </div>
                            </Col>
                        </Row>
                    )}
                </div>
                {/* Buttons Row */}
                <div className="buttons-holder">
                    <RSSecondaryButton onClick={() => navigate(`/preferences`)}>{CANCEL}</RSSecondaryButton>
                    {(addAccess || updateAccess) && (
                        <>
                            <RSSecondaryButton type="submit" className="color-primary-blue">
                                {SAVE}
                            </RSSecondaryButton>
                            <RSPrimaryButton type="submit">{NEXT}</RSPrimaryButton>
                        </>
                    )}
                </div>
            </form>
            </AudienceScoreTabContentSkeletonGate>
        </FormProvider>
    );
};

export default CommunicationResponse;
