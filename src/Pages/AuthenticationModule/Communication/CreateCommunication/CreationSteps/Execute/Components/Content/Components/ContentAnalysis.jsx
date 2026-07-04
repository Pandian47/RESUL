import { ch_tertiary_grey } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { LINK_VERIFICATION, SMART_LINK_SUMMARY } from 'Constants/GlobalConstant/Placeholders';
import { circle_info_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { CONTENT_ANALYSIS_DATA, CONTENT_ANALYSIS_DATA_MAP } from '../constant';
import { findIndex as _findIndex } from 'Utils/modules/lodashReplacements';
import SDKStatus from './SDKStatus';
import LinkVerification from './LinkVerification';
import { useSelector } from 'react-redux';
import RSTooltip from 'Components/RSTooltip';
import Carousel from 'react-bootstrap/Carousel';
const ContentAnalysis = ({ tab, value, setInfoToggle, allValues, onOpenSmartLinkSummary }) => {
    const [contentValues, setContentValues] = useState([]);
    const { channelDetails } = useSelector(({ communicationExecuteReducer }) => communicationExecuteReducer);
    const channelId = channelDetails[tab]?.channelId;

    useEffect(() => {
        // Guard against undefined value - only process if value is defined

        if (value) {
            const res = CONTENT_ANALYSIS_DATA_MAP(value, allValues);
            setContentValues([...res]);
        } else {
            setContentValues([]);
        }
    }, [tab, value, allValues]);

    var index = _findIndex(
        CONTENT_ANALYSIS_DATA,
        (e) => {
            return e.tab === tab;
        },
        0,
    );

    return (
        <>
            {/* <div className="portlet-body d-flex flex-column justify-content-around text-center"> */}
            <div
                className={`${value?.isCarousel ? 'css-scrollbar carousel-content-data' : ''
                    } portlet-body text-center`}
            >
                <ul className="d-flex campaign-lists">
                    {contentValues[index]?.data1?.map((data) => {
                        if (data?.title?.toLowerCase() === 'email footer') {
                            return (
                                <li key={data?.title}>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <p className="analytics-count mb0 mr5">{data?.title} :</p>
                                        <span className="mr5 color-primary-black">{data?.value}</span>
                                        <i className={`icon-md pe-none ${data.icon}`}></i>
                                    </div>
                                </li>
                            );
                        }
                        return (
                            <li key={data?.title}>
                                <p className="analytics-count">{data?.title}</p>
                                <div className="d-flex justify-content-center align-items-center pe-none">
                                    <h3>{data?.value}</h3>
                                    {data?.percent ? (
                                        <small className="color-primary-black font-bold font-md">%</small>
                                    ) : data?.customSymbol ? (
                                        <small className="color-primary-black font-bold font-md pr0 pl5">
                                            {data?.customSymbol}
                                        </small>
                                    ) : null}
                                    <i
                                        className={`icon-xs ${data.icon}
                                    `}
                                    ></i>
                                </div>
                            </li>
                        );
                    })}
                </ul>
                {contentValues[index]?.data2?.length && (
                    <>
                        <div className="text-center">
                            <hr className="my20 opacity-100" style={{ borderTopColor: ch_tertiary_grey }}></hr>
                        </div>
                        <ul className="d-flex campaign-lists">
                            {contentValues[index]?.data2?.map((data) => {
                                return (
                                    <li key={data?.title}>
                                        <p className="analytics-count">{data?.title}</p>
                                        <div className="d-flex justify-content-center align-items-center">
                                            <h3>{data?.value}</h3>
                                            {data?.percent ? (
                                                <small className="color-primary-black font-bold font-md">%</small>
                                            ) : null}
                                            <i
                                                className={`icon-md mt0 ${data.icon}
                                `}
                                            ></i>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}
                {contentValues[index]?.data3?.length && (
                    <>
                        <div className="text-center">
                            <hr className="my20 opacity-100" style={{ borderTopColor: ch_tertiary_grey }}></hr>
                        </div>
                        <ul className="d-flex campaign-lists mb13">
                            {contentValues[index]?.data3?.map((data) => {
                                return (
                                    <li key={data?.title}>
                                        <p className="analytics-count">{data?.title}</p>
                                        <div className="d-inline-grid position-relative">
                                            <div className="mr10 color-primary-black">{data?.value}</div>
                                            {data?.percent ? (
                                                <small className="color-primary-black font-bold font-md">%</small>
                                            ) : null}
                                            <span className="lh0">
                                                <i
                                                    className={`icon-md pe-none ${data.icon}
                                `}
                                                ></i>
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}
                <div
                    className={`sdk-status-carousel my5 position-relative ${
                        contentValues[index]?.data3?.length ? '' : 'mt20'
                    }`}
                >
                    <div className="custom-slide">
                        <Carousel
                            indicators={!value || !value?.links?.length ? false : true}
                            controls={!value || !value?.links?.length ? false : true}
                        >
                            {value && (
                                <Carousel.Item>
                                    <SDKStatus value={value} channelId={channelId} />
                                </Carousel.Item>
                            )}

                            {/* Link Verification Slide - Only show if links exist */}
                            {value?.links?.length > 0 && (
                                <Carousel.Item>
                                    <div className="bg-tertiary-blue p19 border-r7">
                                        <h4 className="mb10 text-left">{LINK_VERIFICATION}</h4>
                                        <ul className="justify-content-between pl15">
                                            <LinkVerification tab={tab} value={value} setInfoToggle={setInfoToggle} />
                                        </ul>
                                    </div>
                                </Carousel.Item>
                            )}
                        </Carousel>
                    </div>
                    {onOpenSmartLinkSummary ? (
                        <div className="bottom5 lh0 position-absolute right-1 bottom2">
                            <RSTooltip text={SMART_LINK_SUMMARY}>
                                <i
                                    className={`${circle_info_medium} icon-md color-primary-blue cp`}
                                    onClick={() => onOpenSmartLinkSummary()}
                                    id="rs_execute_smartlink_summary_info"
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            onOpenSmartLinkSummary();
                                        }
                                    }}
                                />
                            </RSTooltip>
                        </div>
                    ) : null}
                </div>
            </div>
        </>
    );
};

export default ContentAnalysis
