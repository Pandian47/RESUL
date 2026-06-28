import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import { CONTENT, CONTENT_ANALYSIS, LINK_VERIFICATION_STATUS, NOT_VERIFIED, VERIFIED } from 'Constants/GlobalConstant/Placeholders';
import { bold_close_medium, checkbox_medium, circle_tick_medium, close_medium, link_medium, popup_close_circle_fill_medium, popup_close_circle_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import RSTabber from 'Components/RSTabber';

import SDKStatus from './Components/SDKStatus';
import LinkVerification from './Components/LinkVerification';
import { useDispatch, useSelector } from 'react-redux';
import ContentData from './Components/ContentData.jsx';
import RSIcon from 'Components/RSIcon';
import RSTooltip from 'Components/RSTooltip/index.jsx';
import SmartLinkSummaryModal from './SmartLinkSummaryModal.jsx';
import { update_campaign_details } from 'Reducers/communication/createCommunication/execute/reducer.js';
import { truncateTitle } from 'Utils/index.jsx';

const Content = ({ tab, subSegLevel }) => {
    const [infoToggle, setInfoToggle] = useState(false);
    const [showSmartLinkSummary, setShowSmartLinkSummary] = useState(false);
    const [currentSplitABSelect, setCurrentSplitABSelect] = useState({});
    const [selectedSplitIndex, setSelectedSplitIndex] = useState(0);
    const [carouselTabsByIndex, setCarouselTabsByIndex] = useState({});
    // const [tabContent, setTabContent] = useState();
    const [filters, setFilters] = useState({ level: null, friendlyName: null });
    const dispatch = useDispatch();
    const { channelDetails, campaignDetails } = useSelector(
        ({ communicationExecuteReducer }) => communicationExecuteReducer,
    );
    const approvalStatus = channelDetails[tab]?.contentDetail?.approvalStatus?.campaignApprovalStatus;
    const value = channelDetails[tab]?.contentDetail;

    const ContentDatas = useMemo(() => {
        return Array.isArray(value?.content) ? value?.content : [];
    }, [value?.content]);

    const channelId = channelDetails[tab]?.channelId;

    const handleMDCApprovalStatus = useCallback(
        (levelNumber, data) => {
            let finalApprovalList;
            if (data?.data?.channelDetailId) {
                finalApprovalList = approvalStatus?.filter(
                    (item) =>
                        Number(item?.levelNumber) === Number(levelNumber) &&
                        item?.channelDetailId === data?.data?.channelDetailId,
                );
            } else {
                finalApprovalList = approvalStatus?.filter((item) => Number(item?.levelNumber) === Number(levelNumber));
            }
            dispatch(update_campaign_details({ data: finalApprovalList, field: 'approvalStatusByLevel' }));
        },
        [approvalStatus, dispatch],
    );

    useEffect(() => {
        if (value?.content?.length) {
            if (value?.content?.length === 1)
                dispatch(update_campaign_details({ data: approvalStatus, field: 'approvalStatusByLevel' }));
            else handleMDCApprovalStatus(1);
        }
    }, [value?.content, approvalStatus, dispatch, handleMDCApprovalStatus]);

    const getMDCLevels = useMemo(() => {
        return [...new Set(ContentDatas.map((item) => item.levelNumber))].map((level) => ({
            label: `Level${level}`,
            value: Number(level),
        }));
    }, [ContentDatas]);

    const getMDCFriendlyName = useMemo(() => {
        let filteredData = ContentDatas;
        if (filters.level !== null) {
            filteredData = ContentDatas.filter((item) => Number(item.levelNumber) === filters.level);
        }
        return [...new Set(filteredData.map((item) => item.friendlyName))].map((friendlyName) => ({
            label: friendlyName,
            value: friendlyName,
        }));
    }, [filters.level, ContentDatas]);

    const filteredContentDatas = useMemo(() => {
        let filtered = ContentDatas;
        if (filters.level !== null) {
            filtered = filtered.filter((item) => Number(item.levelNumber) === filters.level);
        }
        if (filters.friendlyName !== null) {
            filtered = filtered.filter((item) => item.friendlyName === filters.friendlyName);
        }
        return filtered;
    }, [filters.level, filters.friendlyName, ContentDatas]);

    const buildTabData = useMemo(() => {
        const dataToUse = filteredContentDatas?.length > 0 ? filteredContentDatas : ContentDatas;
        if (dataToUse?.length > 1) {
            let temp = [];
            for (let i = 0; i < dataToUse?.length; i++) {
                let tempValue = dataToUse[i];
                let text = tempValue?.issplitAB ? 'Split ' + tempValue?.splitType : tempValue?.friendlyName;
                const carouselTab = carouselTabsByIndex[i] || 0;
                temp.push({
                    id: i + 1,
                    text: text,
                    disable: false,
                    data: dataToUse[i],
                    splitType: true,
                                                    component: () => (
                                                        <ContentData
                                                            tab={tab}
                                                            value={tempValue}
                                                            setInfoToggle={setInfoToggle}
                                                            onOpenSmartLinkSummary={() => setShowSmartLinkSummary(true)}
                                                            selectedCarouselTab={carouselTab}
                                                            setSelectedCarouselTab={(tabIndex) => {
                                                                setCarouselTabsByIndex((prev) => ({
                                                                    ...prev,
                                                                    [i]: tabIndex,
                                                                }));
                                                            }}
                                                        />
                                                    ),
                });
            }
            return temp;
        }
        return [];
    }, [filteredContentDatas, ContentDatas, tab, setInfoToggle, carouselTabsByIndex]);

    const filtersInitializedRef = useRef(false);
    const prevContentDatasRef = useRef(ContentDatas);

    useEffect(() => {
        const contentDatasChanged = prevContentDatasRef.current !== ContentDatas;

        if (contentDatasChanged || !filtersInitializedRef.current) {
            prevContentDatasRef.current = ContentDatas;

            if (ContentDatas && ContentDatas.length > 0) {
                const levels = [...new Set(ContentDatas.map((item) => item.levelNumber))].map((level) => ({
                    label: `Level${level}`,
                    value: Number(level),
                }));

                if (levels.length > 0) {
                    const firstLevel = levels[0].value;
                    const filteredByLevel = ContentDatas.filter((item) => Number(item.levelNumber) === firstLevel);
                    const firstFriendlyName =
                        filteredByLevel.length > 0 && filteredByLevel[0].friendlyName
                            ? filteredByLevel[0].friendlyName
                            : null;
                    setFilters({ level: firstLevel, friendlyName: firstFriendlyName });
                    filtersInitializedRef.current = true;
                } else {
                    setFilters({ level: null, friendlyName: null });
                    filtersInitializedRef.current = true;
                }
            } else {
                setFilters({ level: null, friendlyName: null });
                filtersInitializedRef.current = true;
            }
        }
    }, [tab, ContentDatas]);

    const prevLevelRef = useRef(filters.level);

    useEffect(() => {
        if (
            prevLevelRef.current !== filters.level &&
            filters.level !== null &&
            ContentDatas &&
            ContentDatas.length > 0
        ) {
            prevLevelRef.current = filters.level;

            const filteredByLevel = ContentDatas.filter((item) => Number(item.levelNumber) === filters.level);
            const friendlyNames = [...new Set(filteredByLevel.map((item) => item.friendlyName))];

            setFilters((prev) => {
                if (friendlyNames.length > 0) {
                    if (prev.friendlyName === null || !friendlyNames.includes(prev.friendlyName)) {
                        return { ...prev, friendlyName: friendlyNames[0] };
                    }
                } else {
                    if (prev.friendlyName !== null) {
                        return { ...prev, friendlyName: null };
                    }
                }
                return prev;
            });
        }
    }, [filters.level, ContentDatas]);
    useEffect(() => {
    if (
        buildTabData?.length
    ) {
        setCurrentSplitABSelect({
            data: buildTabData[0],
            index: 0,
        });
    }
}, [buildTabData]);

    return (
        <Fragment>
            {!!value ? (
                <div key={campaignDetails?.isSubSegmentEnabled ? `${tab}-${subSegLevel}` : tab}>
                    {infoToggle ? (
                        <div className="portlet-container  portlet-md">
                            <div className="portlet-header">
                                <h4 className="mb0">{LINK_VERIFICATION_STATUS}</h4>
                                {/* <div className="float-end">
                                    <i
                                        className={`${close_medium} icon-md color-primary-blue`}
                                        onClick={() => setInfoToggle(false)}
                                    ></i>
                                </div> */}
                                <div onClick={() => setInfoToggle(false)} className="position-absolute right-15 top-10">
                                    <RSIcon
                                        className="icon-md"
                                        color="color-primary-blue cp"
                                        innerCloseContent={false}
                                        customCloseClass={'top5 right5 bg-transparent'}
                                        defaultItem={popup_close_circle_medium}
                                        hoverItem={popup_close_circle_fill_medium}
                                    />
                                </div>
                            </div>
                            <div className="portlet-body css-scrollbar">
                                {
                                    value?.content?.length >= 1
                                        ? value?.content[0]?.links?.map(({ link, isValid, smartlinkFriendlyname }, idx) => {
                                              // Check if link contains { or } and process accordingly
                                              const specialLink = link?.includes('{') || link?.includes('}');
                                              const processedLink = specialLink
                                                  ? link?.replace(/https?:\/\/+[:\/]*/, 'https://')
                                                  : link;
                                              const finalIsValid = specialLink ? true : isValid;

                                              return (
                                                  <div className="d-flex mb19" key={idx}>
                                                      <i
                                                          className={`${link_medium} icon-md color-primary-blue cursor-default mr5`}
                                                      />
                                                      <a
                                                          href={processedLink}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className="color-primary-blue"
                                                      >
                                                          {processedLink?.length > 50 ? (
                                                              <RSTooltip
                                                                  text={
                                                                      smartlinkFriendlyname
                                                                          ? `${smartlinkFriendlyname} — ${processedLink}`
                                                                          : processedLink
                                                                  }
                                                              >
                                                                  <span>{truncateTitle(processedLink, 50)}</span>
                                                              </RSTooltip>
                                                          ) : smartlinkFriendlyname ? (
                                                              <RSTooltip text={`${smartlinkFriendlyname} — ${processedLink}`}>
                                                                  <span>{processedLink}</span>
                                                              </RSTooltip>
                                                          ) : (
                                                              processedLink
                                                          )}
                                                      </a>
                                                      <RSTooltip
                                                          text={
                                                              finalIsValid
                                                                  ? VERIFIED
                                                                  : NOT_VERIFIED
                                                          }
                                                          position="top"
                                                          className="lh0 ml10"
                                                      >
                                                          <i
                                                              className={
                                                                  finalIsValid
                                                                      ? `${checkbox_medium} color-primary-green icon-md cursor-default`
                                                                      : `${bold_close_medium} color-primary-red icon-md cursor-default`
                                                              }
                                                          />
                                                      </RSTooltip>
                                                  </div>
                                              );
                                          })
                                        : null
                                    // value?.content?.map(({ links }) => {
                                    //       return links.map(({ link, isValid }, idx) => (
                                    //           <div className="d-flex mb15" key={idx}>
                                    //               <i
                                    //                   className={`${link_medium} icon-md color-primary-blue cursor-default`}
                                    //               />
                                    //               <a href={link} target="_blank" className="px5">
                                    //                   {link}{' '}
                                    //               </a>
                                    //               <i
                                    //                   className={
                                    //                       isValid
                                    //                           ? `${circle_tick_medium} color-primary-green icon-md cursor-default`
                                    //                           : `${circle_tick_medium} color-primary-red icon-md cursor-default`
                                    //                   }
                                    //               />
                                    //           </div>
                                    //       ));
                                    //   })
                                }

                                <SDKStatus value={value?.content[0]} channelId={channelId} isInfo />
                            </div>
                        </div>
                    ) : (
                        <div className="portlet-container portlet-md pfooter">
                            <div className="portlet-header">
                                <h4>{CONTENT_ANALYSIS}</h4>
                                <div className="gap-3 d-flex">
                                    {campaignDetails?.campaignType === 'M' && (
                                        <RSBootstrapdown
                                            data={getMDCLevels}
                                            defaultItem={
                                                filters.level !== null
                                                    ? getMDCLevels.find((item) => item.value === filters.level) ||
                                                      getMDCLevels[0]
                                                    : getMDCLevels[0]
                                            }
                                            fieldKey="label"
                                            className=""
                                            isObject
                                            isActive
                                            alignRight
                                            onSelect={(e) => {
                                                setFilters({ level: e.value, friendlyName: null });
                                                handleMDCApprovalStatus(e.value);
                                            }}
                                        />
                                    )}
                                    {campaignDetails?.campaignType === 'M' && (
                                        <RSBootstrapdown
                                            data={getMDCFriendlyName}
                                            defaultItem={
                                                getMDCFriendlyName.length > 0 && filters.friendlyName !== null
                                                    ? getMDCFriendlyName.find(
                                                          (item) => item.value === filters.friendlyName,
                                                      ) || getMDCFriendlyName[0]
                                                    : getMDCFriendlyName.length > 0
                                                    ? getMDCFriendlyName[0]
                                                    : null
                                            }
                                            fieldKey="label"
                                            className=""
                                            isObject
                                            isActive
                                            alignRight
                                            onSelect={(e) => {
                                                setFilters((prev) => ({ ...prev, friendlyName: e.value }));
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            {tab !== 'QR' ? (
                                <>
                                    {(() => {
                                        const dataToUse =
                                            filteredContentDatas?.length > 0 ? filteredContentDatas : ContentDatas;
                                        return dataToUse?.length > 1 ? (
                                            <>
                                                <div className="portlet-body">
                                                    <div className={`portlet-fluid-tab mt-10 ${currentSplitABSelect?.data?.data?.isCarousel ? 'carousel-tab-wrapper' :  'default-tab-wrapper'} no-scroll-rs-content-tabs`}>
                                                        <RSTabber
                                                            dynamicTab={`res-content-tabs-split`}
                                                            flatTabs
                                                            activeClass={`active`}
                                                            tabData={buildTabData}
                                                            className=""
                                                            componentClassName={currentSplitABSelect?.data?.data?.isCarousel ? 'tab-contetnt-scroll' : `css-scrollbar tab-contetnt-scroll`}
                                                            defaultTab={selectedSplitIndex}
                                                            // isCommuSummary
                                                            callBack={(data, index) => {
                                                                if (data) {
                                                                    setCurrentSplitABSelect(() => ({
                                                                        data: data,
                                                                        index: index,
                                                                    }));
                                                                    setSelectedSplitIndex(index);
                                                                }
                                                            }}
                                                        />
                                                        {/* <RSTabbarFluid
                                                            dynamicTab={`mb0 mini detail-analytics-tab`}
                                                            activeClass={`active`}
                                                            tabData={buildTabData()}
                                                            className="rs-tabs row detail-tabs "
                                                            defaultTab={0}
                                                            // isCommuSummary
                                                            callBack={(data) => {
                                                                handleMDCApprovalStatus(levelNumber, data);
                                                            }}
                                                            count={3}
                                                            remTabs={
                                                                buildTabData()?.length > 3 ? buildTabData()?.length - 3 : 0
                                                            }
                                                        /> */}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <ContentData
                                                tab={tab}
                                                value={dataToUse[0]}
                                                setInfoToggle={setInfoToggle}
                                                onOpenSmartLinkSummary={() => setShowSmartLinkSummary(true)}
                                                selectedCarouselTab={carouselTabsByIndex[0] || 0}
                                                setSelectedCarouselTab={(tabIndex) => {
                                                    setCarouselTabsByIndex((prev) => ({
                                                        ...prev,
                                                        0: tabIndex,
                                                    }));
                                                }}
                                            />
                                        );
                                    })()}
                                </>
                            ) : (
                                <>
                                    <SDKStatus value={value?.content[0]} channelId={channelId} />
                                    <LinkVerification tab={tab} value={value?.content[0]} />
                                </>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="portlet-container portlet-md ">
                    <div className="portlet-header">
                        <h4>{CONTENT}</h4>
                    </div>
                    <HorizontalSkeleton />
                </div>
            )}
            <SmartLinkSummaryModal
                show={showSmartLinkSummary}
                handleClose={() => setShowSmartLinkSummary(false)}
                channelDetailsList={campaignDetails?.channelDetails}
            />
        </Fragment>
    );
};

export default Content;
