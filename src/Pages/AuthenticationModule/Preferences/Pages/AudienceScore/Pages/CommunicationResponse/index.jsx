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
const CommunicationResponse = () => {
    const navigate = useNavigate();
    const methods = useForm(INITIAL_STATE);
    const dispatch = useDispatch();
    const { permissions } = usePermission();
    const { addAccess, updateAccess } = permissions || {};
    const { departmentId, clientId, userId, departmentName } = useSelector((state) => getSessionId(state));
    const { control, handleSubmit, setValue } = methods;
    const { activeTab } = useSelector((state) => state.audienceScoreReducer);
    const [payloads] = useState([
        { clientId, departmentId, userId, campaigntarget: 'Reach' },
        { clientId, departmentId, userId, campaigntarget: 'Engagement' },
        { clientId, departmentId, userId, campaigntarget: 'Leads' },
    ]);
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

    const fetchCampaignResponse = async (payload) => {
        const response = await dispatch(getCampaignResponse(payload));

        if (response?.status) {
            switch (payload.campaigntarget) {
                case 'Reach':
                    setReachDropDownData(customDropdownData(response?.data));
                    setReachData(commuResponseChannelData(commuResponseAllChannel, response?.data));
                    setAllReachData(response?.data);
                    break;
                case 'Engagement':
                    setEngagementDropDownData(customDropdownData(response?.data));
                    setEngagementData(commuResponseChannelData(commuResponseAllChannel, response?.data));
                    setAllEngagementData(response?.data);
                    break;
                case 'Leads':
                    setConversionDropDownData(customDropdownData(response?.data));
                    setConversionData(commuResponseChannelData(commuResponseAllChannel, response?.data));
                    setAllConversionData(response?.data);
                    break;
                default:
                    break;
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
                const sentimentRes = await dispatch(get_LadderSentimentKeys(payload));
                const channelRes = await dispatch(getCampaignResponseData(payload));
                const attributesRes = await dispatch(getCommunicationAttributes({ payload }));
                const periodRes = await dispatch(getPeriodKeys(payload));
                return { sentimentRes, channelRes, attributesRes, periodRes };
            },
            onSuccess: ({ sentimentRes, channelRes, attributesRes, periodRes }) => {
                if (sentimentRes?.status) {
                    setSentimentKeys(sentimentRes?.data ?? []);
                }
                if (channelRes?.status) {
                    setCommuResponseAllChannel(channelRes?.data ?? []);
                }
                if (attributesRes?.status && attributesRes?.data?.length > 0) {
                    setCustomAttribute(getCommuAttribute(attributesRes.data));
                    setCommuAttribute(attributesRes.data);
                }
                if (periodRes?.status) {
                    setPeriodkeys(periodRes?.data?.map((item) => item?.attributeName) ?? []);
                }
            },
        });
    }, [clientId, departmentId, userId, dispatch, pageLoadApi.refetch]);

    useEffect(() => {
        bootstrapCommunicationResponse();
    }, [bootstrapCommunicationResponse]);

    useEffect(() => {
        const scoreDepreciation = commuResponseAllChannel.find(
            (item) => item.campaignGoalPeriodRange === 'year' && item.responseScore === 0,
        );
        const goalFrequency = commuResponseAllChannel.find(
            (item) => item.campaignSegment === 'Goalfrequency' && item.campaignGoalPeriodRange === 'Week',
        );
        setGoalFrequencyData(goalFrequency);
        if (scoreDepreciation) setValue('depreciation', scoreDepreciation?.campaignSegmentRule?.Percentage);
    }, [commuResponseAllChannel]);

    useEffect(() => {
        setValue('priority', periodkeys[0]);
    }, [periodkeys]);

    useEffect(() => {
        if (commuResponseAllChannel?.length > 0) payloads.forEach(fetchCampaignResponse);
    }, [payloads, commuResponseAllChannel]);

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
                        />
                        <CommunicaitionCard
                            name={'engagement'}
                            head={'Engagement'}
                            constants={engagementData}
                            allChannel={commuResponseAllChannel}
                            dropDownData={engagementDropDownData}
                        />
                        <CommunicaitionCard
                            name={'conversion'}
                            head={'Conversion'}
                            constants={conversionData}
                            allChannel={commuResponseAllChannel}
                            dropDownData={conversionDropDownData}
                        />

                        <CommunicaitionCard
                            name={'CampaingDetails'}
                            head={'Communication details'}
                            constants={customCommuAttribute}
                            allChannel={commuResponseAllChannel}
                            dropDownData={customCommuAttribute}
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
