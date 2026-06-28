import { Fragment, useState } from 'react';
import WebAppCommunication from './WebAnalytics/WebAppCommunication';

const WebAppAnalytics = ({ type, isDownloadUI }) => {
    const [splitItem, setSplitItem] = useState('Google Analytics');
    const [slectedTab, seSelectedTab] = useState(0);


    const getData = (data) => setSplitItem(data.name);
    const tabbarData = [
        {
            id: 'communication',
            text: 'Communication'
        },
        {
            id: 'account',
            text: 'Account'
        }
    ]

    return (
        <Fragment>
            {/* <SplitHeader
                callbackSplit={getData}
                datePicker={false}
                splitView={false}
                colorfulHeader={true}
                splitData={WebAnalyticsData?.splitDataList}
                detailAnalytics
                isDownloadUI={isDownloadUI} 
                /> */}
            {/* <div className='float-end d-flex position-relative zIndex1 top10'>
                <ul className='mb0 rs-tabs row mini'>
                    {
                        tabbarData.map((item, index) => {
                            return (
                                <li
                                    className={`tabDefault tabTransparent  ${slectedTab === index ? 'active' : ''}`}
                                    key={index}
                                    onClick={() => { seSelectedTab(index) }}
                                >
                                    {item.text}
                                </li>
                            )
                        })
                    }
                </ul>
            </div> */}
            {
                slectedTab === 0
                    ? <WebAppCommunication type="communication" channelName={type} key={'communication'} splitItem={splitItem} infoIcon={true} />
                    : <WebAppCommunication type="account" channelName={type} key={'account'} splitItem={splitItem} infoIcon={true} />
            }

        </Fragment>
    );
};

export default WebAppAnalytics;
