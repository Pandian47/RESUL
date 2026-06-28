import { TOP_5_CHANNELS, TOP_5_CHANNELS_HEADING } from 'Constants/GlobalConstant/Placeholders';
import { menu_dot_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
import { getChannelId } from 'Utils/modules/communicationChannels';
import { parseAnalyticsJsonArray } from 'Pages/AuthenticationModule/Analytics/analyticsDefaults';
import { useSelector } from 'react-redux';
import { A360Top5ChannelsBodySkeleton } from 'Components/Skeleton/pages/analytics';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell.jsx'

const Top5Channels = () => {
    const [channels, setChannels] = useState('Reach');
    const [channelsData, setChannelsData] = useState([]);
    const { overView, overView_loading } = useSelector(({ aa360ViewReducer }) => aa360ViewReducer);
    const isTop5Loading = Boolean(overView_loading);

    useEffect(() => {
        let channelTopData = [];
        if (channels === 'Reach') {
            channelTopData = parseAnalyticsJsonArray(overView?.reachTopChannel, []);
        } else if (channels === 'Engagement') {
            channelTopData = parseAnalyticsJsonArray(overView?.engTopChannel, []);
        } else if (channels === 'Conversion') {
            channelTopData = parseAnalyticsJsonArray(overView?.convTopChannel, []);
        }
        const tempData = (channelTopData ?? []).map((item) => {
            const iconValue = getChannelId(item?.name);
            return {
                id: item?.name,
                icon: iconValue?.icon_xl,
                label: iconValue?.label,
                percentage: item?.value,
                description: iconValue?.content,
                bgColor: iconValue?.color,
            };
        });

        const sortedData = tempData?.sort((a, b) => b.percentage - a.percentage);

        const filledData = sortedData?.concat(Array(5 - sortedData?.length).fill(null));

        setChannelsData(filledData);
    }, [channels, overView]);

    const hasTop5Data = channelsData?.some((channel) => channel != null);
    const showTop5Skeleton = isTop5Loading || !hasTop5Data;

    return (
        <div className="portlet-container portlet-md channelList">
            <div className="portlet-header">
                <h4> {TOP_5_CHANNELS}</h4>
                <div className="float-end">
                    <BootstrapDropdown
                        data={['Reach', 'Engagement', 'Conversion']}
                        flatIcon
                        defaultItem={<i className={`${menu_dot_medium} icon-md`} id="rs_Top5Channels_menu" />}
                        showUpdate={true}
                        className="no_caret"
                        alignRight
                        onSelect={(channel) => setChannels(channel)}
                        isCustomDefaultIcon
                    />
                </div>
            </div>
            {/* <p className="mb15">{TOP_5_CHANNELS_HEADING}</p> */}
            <div className={`portlet-body${showTop5Skeleton ? ' an-sk-a360-portlet-body' : ''}`}>
                {isTop5Loading ? (
                    <A360Top5ChannelsBodySkeleton />
                ) : !hasTop5Data ? (
                    <A360Top5ChannelsBodySkeleton isError />
                ) : (
                <Row className="m0">
                    {channelsData.map((channel, index) => (
                            <Col
                                className={`channelListView ${!channel ? 'noDataAvailable' : ''} `}
                                key={index}
                                style={{
                                    '--channelBgColor': channel?.bgColor,
                                }}
                            >
                                {channel ? (
                                    <div className="d-flex align-items-center">
                                        <div className="float-start icon-container">
                                            <i className={`${channel?.icon} icon-xl white`} />
                                        </div>
                                        <div className="float-end ml15">
                                            <h2 className="white lh-1" style={{width: "155px"}}>  <TruncatedCell value = {channel?.label} noTable= {true}/></h2>
                                            <h1 className="white lh-1 font-xl font-bold">
                                                {channel.percentage}
                                                <span className="fs28 font-semi-bold">%</span>
                                            </h1>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="d-flex align-items-center">
                                        <div className="float-start icon-container">
                                            <i className={` icon-xl white`} />
                                        </div>
                                        <div className="float-end ml15">
                                            <h2 className="white lh-1"></h2>
                                            <h1 className="white lh-1 font-xl font-bold">
                                                <span className="font-lg font-semi-bold"></span>
                                            </h1>
                                        </div>
                                    </div>
                                )}
                                {channel ? (
                                    <div className="mt15">
                                        <p className="font-xs lh-sm white">{channel?.description}</p>
                                    </div>
                                ) : (
                                    <div className="mt15">
                                        <p className="font-xs lh-sm white"></p>
                                        <p className="font-xs lh-sm white"></p>
                                    </div>
                                )}
                            </Col>
                        ))}
                </Row>
                )}
            </div>
        </div>
    );
};

export default Top5Channels;
