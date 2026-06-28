import { getChannelId } from 'Utils/modules/communicationChannels';
import { getCreatedDate, getYYMMDD } from 'Utils/modules/dateTime';
import { Fragment, useState } from 'react';
import SocialAnalytics from './SocialAnalytics/SocialAnalytics';
import SocialAnalyticsPage from './SocialAnalytics/SocialAnalyticsPage';
import SplitHeader from '../../Components/SplitHeader';
import socialMedia from './data';
import { getDetailReport_ChannelDetails, getDetailReport_OverviewDetails } from 'Reducers/analyticsTwins/details/request';
import { useDispatch, useSelector } from 'react-redux';

import useQueryParams from 'Hooks/useQueryParams';
import { getSessionId } from 'Reducers/globalState/selector';
const SocialMedia = ({ type, isDownloadUI }) => {
    const dispatch = useDispatch();
    const locationData = useQueryParams('/analyticsTwins/detail-analytics');
    const { analyticsDetatils } = useSelector(({ analyticsListingReducer }) => analyticsListingReducer);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const channelId = getChannelId(type)?.id;
    const { overviewDetail, channelDetail, segmentDetail } = useSelector(({ analyticsDetails }) => analyticsDetails);
    const [splitItem, setSplitItem] = useState('facebook');
    const getValue = 'Facebook';
    const [slectedTab, seSelectedTab] = useState(0);
    const [filterDetails, setFilterDetails] = useState({});

    // const getData = (data) => setSplitItem(data?.id);
    const getData = async (filterData) => {
        let splitData;
        if (filterData?.splitData === 'Actual communication') {
            splitData = 'ACT';
        } else if (filterData?.splitData?.startsWith('Split ')) {
            splitData = filterData.splitData.replace('Split ', '').trim();
        } else {
            splitData = undefined;
        }
        const payload = {
            channelId,
            clientId,
            departmentId,
            userId,
            campaignId: locationData?.campaignId, // analyticsDetatils?.campaignId,
            blastID: filterData?.blastShortCode || analyticsDetatils?.blastId,
            startDate: getYYMMDD(filterData?.selectedDate?.startDate),
            endDate: getYYMMDD(filterData?.selectedDate?.endDate),
            segment: filterData?.filterSelectedData,
            split: !!filterData?.splitData ? splitData : undefined,
        };
        await dispatch(getDetailReport_ChannelDetails({ payload }));
        await dispatch(getDetailReport_OverviewDetails({ payload }));
        setSplitItem(filterData?.splitData);
        setFilterDetails(filterData);
    };
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

    const {
        reach,
        engagement,
        conversion,
        reachPerformanceJson,
        reachPerformanceHrsJson,
        topBrowserValue,
        topBrowser,
        keyMetrics,
        enagegementPerformanceJson,
        enagegementPerformanceHrsJson,
        conversionPerformanceJson,
        blastAudienceJson,
        clientInfoJson,
        deviceInfoJson,
        topOsValue,
        topOs,
        activityStatus,
        jobDateTime,
        isSplitEnabled,
    } = overviewDetail || defaultValues;
    const dateField = getCreatedDate(jobDateTime, 'datetime');
    return (
        <Fragment>
            <SplitHeader
                callbackSplit={getData}
                colorfulHeader={true}
                datePicker={true}
                splitData={socialMedia?.headerValue}
                // detailAnalytics
                startDate={channelDetail?.startDate}
                endDate={channelDetail?.endDate}
                isDownloadUI={isDownloadUI}
                channelId={locationData?.channelId}
            />
            <div>
                <div className="float-end d-flex position-relative zIndex1 top12">
                    <ul className="mb0 rs-tabs row mini">
                        {splitItem !== 'facebookApp' &&
                            tabbarData.map((item, index) => {
                                return (
                                    <li
                                        className={`tabDefault tabTransparent  ${slectedTab === index ? 'active' : ''}`}
                                        key={index}
                                        onClick={() => {
                                            seSelectedTab(index);
                                        }}
                                    >
                                        {item.text}
                                    </li>
                                );
                            })}
                    </ul>
                </div>
            </div>
            {slectedTab === 0 ? (
                <SocialAnalytics type={type} key={'post'} splitValue={getValue} infoIcon={true} filterDetails={filterDetails} />
            ) : (
                <SocialAnalyticsPage type={type} key={'page'} splitValue={getValue} infoIcon={true} filterDetails={filterDetails} />
            )}
        </Fragment>
    );
};

export default SocialMedia;
