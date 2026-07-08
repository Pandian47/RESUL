import { bubbleChartOptions } from 'Constants/Charts';
import { AUDIENCE_BEHAVIOR, GAIN_INSIGNTS_AUDIENCE } from 'Constants/GlobalConstant/Placeholders';
import { menu_dot_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
import { getWeekName } from 'Utils/modules/communicationChannels';

import { A360AudienceBehaviorBodySkeleton } from 'Components/Skeleton/pages/analytics';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
const AudienceBehavior = () => {
    const [channels, setChannels] = useState('Reach');
    const [audienceBehaviourData, setAudienceBehaviourData] = useState([]);
    const { overView, overView_loading } = useSelector(({ aa360ViewReducer }) => aa360ViewReducer);
    const isBehaviorLoading = Boolean(overView_loading);
    const hasBehaviorData = audienceBehaviourData?.length > 0;
    const showBehaviorSkeleton = isBehaviorLoading || !hasBehaviorData;
    const tempData = [];
    let audienceBehaviourTempData = [];
    useEffect(() => {
        if (channels === 'Reach') {
            audienceBehaviourTempData = overView?.reachPropensity?.split('|');
        } else if (channels === 'Engagement') {
            audienceBehaviourTempData = overView?.engPropensity?.split('|');
        } else if (channels === 'Conversion') {
            audienceBehaviourTempData = overView?.convPropensity?.split('|');
        }
        {
            audienceBehaviourTempData?.map((item, index) => {
                const weekValue = getWeekName(item?.split(':')[0]);
                if (parseFloat(item?.split(':')[1]) > 0) {
                    tempData.push({
                        name: weekValue?.label,
                        className: weekValue?.short,
                        value: parseFloat(item?.split(':')[1]).toFixed(2),
                    });
                }
            });
            setAudienceBehaviourData(tempData);
        }
    }, [channels, overView]);
    // console.log('audienceBehaviourData: ', audienceBehaviourData);

    const ch_data = bubbleChartOptions({
        series: audienceBehaviourData,
        packedbubble: {
            minSize: '110px',
            maxSize: '140px',
            layoutAlgorithm: {
                gravitationalConstant: 0.01,
            },
        },
    });
    const getSizeBasedOnValue = (value, sortedValues) => {
        const minSize = 100;
        const maxSize = 160;
        sortedValues.sort((a, b) => a - b);
        const position = sortedValues.indexOf(value);
        const size = minSize + position * 10;

        return Math.min(Math.max(size, minSize), maxSize);
    };
    return (
        <div
            className={`portlet-container portlet-md areaspline-x-axis-labels${
                showBehaviorSkeleton ? ' pref-a360-skel-behavior' : ''
            }`}
        >
            <div className="portlet-header">
                <h4>{AUDIENCE_BEHAVIOR}</h4>
                <div className="float-end">
                    <BootstrapDropdown
                        data={['Reach', 'Engagement', 'Conversion']}
                        flatIcon
                        defaultItem={<i className={`${menu_dot_medium} icon-md`} id="rs_AudienceBehavior_menu" />}
                        showUpdate={true}
                        className="no_caret"
                        alignRight
                        onSelect={(channel) => setChannels(channel)}
                        isActive
                        isCustomDefaultIcon
                    />
                </div>
            </div>
            {/* <p className="mb15">{GAIN_INSIGNTS_AUDIENCE}</p> */}
            <div className="portlet-body bubble-audience-behaviour-del">
                {/* <RSHighchartsContainer
                    options={ch_data}
                    isError={!!ch_data && ch_data?.series?.length !== 0 ? false : true}
                /> */}
                {showBehaviorSkeleton ? (
                    <A360AudienceBehaviorBodySkeleton isError={!isBehaviorLoading && !hasBehaviorData} />
                ) : (
                    <div className="bubble-chart-custom">
                        <ul key={channels}>
                            {audienceBehaviourData.map((channel, index) => {
                                const sortedValues = audienceBehaviourData.map((channel) => parseFloat(channel.value));
                                const value = parseFloat(channel.value);
                                const size = getSizeBasedOnValue(value, sortedValues);
                                return (
                                    <motion.li
                                        key={index}
                                        className={`bubble-chart-list b-${channel.className}`}
                                        style={{
                                            width: `${size}px`,
                                            height: `${size}px`,
                                        }}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 100,
                                            damping: 12,
                                            delay: index * 0.08,
                                        }}
                                    >
                                        <h2 className="b-title">
                                            {/* {Math.round(channel.value)} */}
                                            {value}
                                            <small>%</small>
                                        </h2>
                                        <p className="text-capitalize"> {channel.className}</p>
                                    </motion.li>
                                );
                            })}
                            {/* <li className="bubble-chart-list b-mon">
                                <h2 className="b-title">
                                    6<small>%</small>
                                </h2>
                                <p>Mon</p>
                            </li>
                            <li className="bubble-chart-list b-tue">
                                <h2 className="b-title">
                                    8<small>%</small>
                                </h2>
                                <p>Tue</p>
                            </li>
                            <li className="bubble-chart-list b-wed">
                                <h2 className="b-title">
                                    6<small>%</small>
                                </h2>
                                <p>Wed</p>
                            </li>
                            <li className="bubble-chart-list b-thu">
                                <h2 className="b-title">
                                    3<small>%</small>
                                </h2>
                                <p>Thu</p>
                            </li>
                            <li className="bubble-chart-list b-fri">
                                <h2 className="b-title">
                                    5<small>%</small>
                                </h2>
                                <p>Fri</p>
                            </li>
                            <li className="bubble-chart-list b-sat">
                                <h2 className="b-title">
                                    38<small>%</small>
                                </h2>
                                <p>Sat</p>
                            </li>
                            <li className="bubble-chart-list b-sun">
                                <h2 className="b-title">
                                    31<small>%</small>
                                </h2>
                                <p>Sun</p>
                            </li> */}
                        </ul>
                    </div>
                )}
                {/* <RSHighchartsContainer options={ch_data} /> */}
            </div>
        </div>
    );
};

export default AudienceBehavior;
