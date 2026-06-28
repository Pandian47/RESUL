import { getChannelId } from 'Utils/modules/communicationChannels';
import { useEffect, useMemo, useState } from 'react';
import SocialAnalyticsPost from './SocialAnalytics/SocialAnalyticsPost';
import SocialAnalyticsPage from './SocialAnalytics/SocialAnalyticsPage';
import SplitHeader from '../../Components/SplitHeader';
import SocialAnalyticsFbApp from './SocialAnalytics/SocialAnalyticsFbApp';
import useQueryParams from 'Hooks/useQueryParams';
import { useDispatch, useSelector } from 'react-redux';

import { getSessionId } from 'Reducers/globalState/selector';
import { getDetailReport_OverviewDetails } from 'Reducers/analyticsSSR/details/request';
import { Container } from 'react-bootstrap';
import { DetailAnalyticsChannelPortletLoader } from 'Components/Skeleton/Skeleton';
import { updateDetailsMainList } from 'Reducers/analyticsSSR/details/reducer';

const tabbarData = [
    {
        id: 'communication',
        text: 'Communication (Post)',
    },
    {
        id: 'page',
        text: 'Page',
    },
];

const SocialMedia = ({ type, isDownloadUI }) => {
    const dispatch = useDispatch();
    const { analyticsDetatils } = useSelector(({ analyticsListingSSRReducer }) => analyticsListingSSRReducer);
    const locationData = useQueryParams('/analytics/detail-analytics');
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const channelId = getChannelId(type)?.id;
    const { overviewDetail, channelDetail, segmentDetail, isLoading } = useSelector(
        ({ analyticsDetailsSSR }) => analyticsDetailsSSR,
    );
    const [splitItem, setSplitItem] = useState('facebook');
    const [slectedTab, seSelectedTab] = useState(0);
    const [isDownloadLocal, setIsDownloadLocal] = useState(false);
    const [filterDetails, setFilterDetails] = useState({});
    
    const filteredChannelInfos = useMemo(() => {
        if (channelDetail?.channelInfos && Array.isArray(channelDetail.channelInfos)) {
            return channelDetail?.channelInfos?.filter((item) => item?.channelId === 7) ?? [];
        }
        return [];
    }, [channelDetail?.channelInfos]);
    
    useEffect(() => {
        if (filteredChannelInfos.length > 0) {
            const defaultItem = filteredChannelInfos.find(item => item.subchannelId === locationData?.subChannelId) || filteredChannelInfos[0];
            dispatch(updateDetailsMainList({ field: 'defaultItemSplitHeader', data: defaultItem }));
        }
    }, [filteredChannelInfos.length, dispatch]);
    
    // const getData = (data) => setSplitItem(data?.id);
    const getData = async (filterData) => {
        //debugger
        let splitData;
        if (filterData?.splitData === 'Actual communication') {
            splitData = 'ACT';
        } else if (filterData?.splitData?.startsWith('Split ')) {
            splitData = filterData.splitData.replace('Split ', '').trim();
        } else {
            splitData = undefined;
        }
        const payload = {
            channelId: 7,
            clientId,
            departmentId,
            userId,
            campaignId: locationData?.campaignId, // analyticsDetatils?.campaignId,
            blastID: filterData?.blastShortCode || analyticsDetatils?.blastId,
            subSegmentLevel: locationData?.subSegmentLevel || 0,
            // startDate: getYYMMDD(filterData?.selectedDate?.startDate),
            // endDate: getYYMMDD(filterData?.selectedDate?.endDate),
            // segment: filterData?.filterSelectedData,
            // split: !!filterData?.splitData ? splitData : undefined,
        };
        // console.log('filterData: ', filterData);
        // console.log("@@@@@@@@@@@@@@@@@@@@@@@");
        const overViewPayload = { ...payload, subChannelId: filterData?.subchannelId };
        // Don't call getDetailReport_ChannelDetails as channel details are already loaded
        // await dispatch(getDetailReport_ChannelDetails({ payload }));
        await dispatch(getDetailReport_OverviewDetails({ payload: overViewPayload }));
        await dispatch(updateDetailsMainList({ field: 'defaultItemSplitHeader', data: filterData }));
        setSplitItem(filterData?.splitData);
        setFilterDetails(filterData);
    };
    return (
        <div className={`page-content ${isDownloadLocal ? 'download-page-setup-detail' : ''}`}>
            <Container className='px0'>
            {Object.keys(overviewDetail)?.length && !isLoading ? (
                <div className="rs-csr-wrapper">
                    <SplitHeader
                        callbackSplit={getData}
                        colorfulHeader={true}
                        datePicker={false}
                        splitData={filteredChannelInfos}
                        // splitData={socialMedia?.headerValue}
                        detailAnalytics
                        isDownloadUI={(flag) => {
                            setIsDownloadLocal(flag);
                            setTimeout(() => {
                                setIsDownloadLocal(false);
                            }, 10000);
                            isDownloadUI(flag);
                        }}
                        startDate={channelDetail?.startDate}
                        endDate={channelDetail?.endDate}
                        channelId={7}
                    />
                    <div>
                        <div className="float-end d-flex position-relative zIndex1 top12 d-none">
                            <ul className="mb0 rs-tabs row mini">
                                {splitItem !== 'facebookApp' &&
                                    tabbarData.map((item, index) => {
                                        return (
                                            <li
                                                className={`tabDefault tabTransparent  ${
                                                    slectedTab === index ? 'active' : ''
                                                }`}
                                                key={item.id}
                                                onClick={() => seSelectedTab(index)}
                                            >
                                                {item.text}
                                            </li>
                                        );
                                    })}
                            </ul>
                        </div>
                    </div>
                    {splitItem === 'facebookApp' ? (
                        <SocialAnalyticsFbApp
                            type={type}
                            key={'fbApp'}
                            typeOf="fbApp"
                            splitItem={splitItem}
                            infoIcon={true}
                            filterDetails={filterDetails}
                        />
                    ) : slectedTab === 0 ? (
                        <SocialAnalyticsPost
                            type={type}
                            key={'post'}
                            typeOf="post"
                            splitItem={splitItem}
                            infoIcon={true}
                            filterDetails={filterDetails}
                        />
                    ) : (
                        <SocialAnalyticsPage
                            type={type}
                            key={'page'}
                            typeOf="page"
                            splitItem={splitItem}
                            infoIcon={true}
                            filterDetails={filterDetails}
                        />
                    )}
                </div>
            ) : (
                <DetailAnalyticsChannelPortletLoader isError={!isLoading} />
            )}
            </Container>
        </div>
    );
};

export default SocialMedia;
