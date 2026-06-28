import { useEffect, useMemo, useState } from 'react';
import ContentAnalysis from './ContentAnalysis';
import { useSelector } from 'react-redux';
import RSTabSlide from 'Components/RSTabSlide';

const ContentData = ({ tab, value, setInfoToggle, onOpenSmartLinkSummary, selectedCarouselTab, setSelectedCarouselTab }) => {
    const { channelDetails } = useSelector(({ communicationExecuteReducer }) => communicationExecuteReducer);
    const channelId = channelDetails[tab]?.channelId;
    const [activeTab, setActiveTab] = useState(selectedCarouselTab || 0);
    
    useEffect(() => {
        setActiveTab(selectedCarouselTab || 0);
    }, [selectedCarouselTab]);
    
    const buildCarouselTabs = useMemo(() => {
        if (value?.isCarousel && value?.carousalsplits?.length > 0) {
            let carouselData = value?.carousalsplits;
            let temp = [];
            for (let i = 0; i < carouselData?.length; i++) {
                let tempValue = {...value, ...carouselData[i], isCarousel: value?.isCarousel};
                const allValues = value
                let text = `Carousel ${tempValue?.splitType}`;
                temp.push({
                    id: i + 1,
                    text: text,
                    disable: false,
                    data: carouselData[i],
                    splitType: true,
                    component: () => (
                        <ContentAnalysis
                            tab={tab}
                            value={tempValue}
                            allValues={allValues}
                            setInfoToggle={setInfoToggle}
                            onOpenSmartLinkSummary={onOpenSmartLinkSummary}
                        />
                    ),
                });
            }
            // setActiveTab(0)
            return temp;
        }
        return [];
    }, [tab, value, setInfoToggle, onOpenSmartLinkSummary]);

    return (
        <>
            {/* <div className="portlet-body d-flex flex-column justify-content-around text-center"> */}
            {value?.isCarousel ? (
                <RSTabSlide
                    dynamicTab={`res-content-tabs-split mx0`}
                    activeClass={`active`}
                    customClassName='default-tab-wrapper no-scroll-rs-content-tabs'
                    flatTabs
                    tabData={buildCarouselTabs}
                    defaultTab={activeTab}
                    callBack={(tab, ind) => {
                        setActiveTab(ind);
                        setSelectedCarouselTab(ind);
                    }}
                />
            ) : (
                <ContentAnalysis
                    tab={tab}
                    value={value}
                    allValues={value}
                    setInfoToggle={setInfoToggle}
                    onOpenSmartLinkSummary={onOpenSmartLinkSummary}
                />
            )}
        </>
    );
};

export default ContentData;
