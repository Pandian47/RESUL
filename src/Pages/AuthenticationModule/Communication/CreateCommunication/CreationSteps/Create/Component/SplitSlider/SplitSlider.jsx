import { numberWithCommas } from 'Utils/modules/formatters';
import { CANCEL, SAVE, SPLIT_SIZE, SPLIT_WINNING_COMMUNICATION } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import _isEmpty from 'lodash/isEmpty';
import { slider } from 'Assets/Images';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { boxText, colors, splitBoxClassName, imgSplitClassName } from './constant';


const BASE_PERCENTAGE = 2;
const BASE_WIDTH_PX = 40;
const SPLIT_CONSTRAINTS = {
    2: { min: 2, max: 10 },
    3: { min: 2, max: 7 },
    4: { min: 2, max: 5 },
};

const percentageToWidth = (percentage) => {
    return (percentage / BASE_PERCENTAGE) * BASE_WIDTH_PX;
};

const widthToPercentage = (widthInPx) => {
    return (widthInPx / BASE_WIDTH_PX) * BASE_PERCENTAGE;
};

const SplitSlider = ({
    audienceCount = 25000,
    splitTabs = [],
    handleClose = () => {},
    onSave = () => {},
    sliderData,
    isClickOff,
}) => {
    const dragging = useRef(false);
    const containerRef = useRef();
    const animationFrameRef = useRef();
    const percentageRef = useRef(BASE_PERCENTAGE);
    const widthRef = useRef(BASE_WIDTH_PX);
    const globalMouseMoveHandler = useRef(null);
    const globalMouseUpHandler = useRef(null);
    
    const [percentage, setPercentage] = useState(BASE_PERCENTAGE);
    const [width, setWidth] = useState(BASE_WIDTH_PX);
    
    let tabsCount = splitTabs?.length || 2;
    const constraints = SPLIT_CONSTRAINTS[tabsCount] || SPLIT_CONSTRAINTS[2];
    
    useEffect(() => {
        if (_isEmpty(sliderData)) {
            const initialPercentage = constraints.min;
            const initialWidth = percentageToWidth(initialPercentage);
            setPercentage(initialPercentage);
            setWidth(initialWidth);
            percentageRef.current = initialPercentage;
            widthRef.current = initialWidth;
        } else {
            const savedPercentage = sliderData.percentage || constraints.min;
            const savedWidth = percentageToWidth(savedPercentage);
            setPercentage(savedPercentage);
            setWidth(savedWidth);
            percentageRef.current = savedPercentage;
            widthRef.current = savedWidth;
        }
    }, [sliderData, constraints]);
    
    useEffect(() => {
        percentageRef.current = percentage;
        widthRef.current = width;
    }, [percentage, width]);
    
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (globalMouseMoveHandler.current) {
                window.removeEventListener('mousemove', globalMouseMoveHandler.current);
            }
            if (globalMouseUpHandler.current) {
                window.removeEventListener('mouseup', globalMouseUpHandler.current);
            }
        };
    }, []);

    const handleMouseMove = useCallback((pageX) => {
        if (!dragging.current || !containerRef.current) return;

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
            if (!dragging.current || !containerRef.current) return;
            
            const containerRect = containerRef.current.getBoundingClientRect();
            const containerLeft = containerRect.left;

            const mouseOffsetX = pageX - containerLeft;
            const newWidthPerSplit = Math.max(0, mouseOffsetX / tabsCount);
            let rawPercentage = widthToPercentage(newWidthPerSplit);
            let clampedPercentage = Math.max(constraints.min, Math.min(constraints.max, rawPercentage));
            let snappedPercentage = Math.round(clampedPercentage);
            if (clampedPercentage < 2.6) {
                snappedPercentage = 2;
            }
            const maxAllowedPerSplit = Math.floor(100 / tabsCount);
            snappedPercentage = Math.min(snappedPercentage, maxAllowedPerSplit);
            snappedPercentage = Math.max(constraints.min, snappedPercentage);
            let newWidth = percentageToWidth(snappedPercentage);
            newWidth = Math.max(BASE_WIDTH_PX, newWidth);
            const roundedWidth = Math.round(newWidth);
            
            if (snappedPercentage !== percentageRef.current) {
                setPercentage(snappedPercentage);
            }
            if (roundedWidth !== widthRef.current) {
                setWidth(roundedWidth);
            }
        });
    }, [tabsCount, constraints]);
    
    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        dragging.current = true;
        
        // Clean up any existing listeners first
        if (globalMouseMoveHandler.current) {
            window.removeEventListener('mousemove', globalMouseMoveHandler.current);
        }
        if (globalMouseUpHandler.current) {
            window.removeEventListener('mouseup', globalMouseUpHandler.current);
        }
        
        globalMouseMoveHandler.current = (e) => {
            if (dragging.current) {
                handleMouseMove(e.pageX);
            }
        };
        
        globalMouseUpHandler.current = () => {
            dragging.current = false;
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (globalMouseMoveHandler.current) {
                window.removeEventListener('mousemove', globalMouseMoveHandler.current);
                globalMouseMoveHandler.current = null;
            }
            if (globalMouseUpHandler.current) {
                window.removeEventListener('mouseup', globalMouseUpHandler.current);
                globalMouseUpHandler.current = null;
            }
        };
        
        window.addEventListener('mousemove', globalMouseMoveHandler.current);
        window.addEventListener('mouseup', globalMouseUpHandler.current);
    }, [handleMouseMove]);

    const perSplitCount = Math.round((audienceCount * percentage) / 100);
    const totalSplitCount = perSplitCount * tabsCount;
    const remainingCount = audienceCount - totalSplitCount;
    const remainingPercentage = 100 - (percentage * tabsCount);

    return (
        <Fragment>
            <div className="rs-split-overlay"></div>
            <div className="rs-overlay-page-modal-wrapper mb20">
                <div className="rs-split-top">
                    <span className="d-flex">
                        <label className="text-nowrap mb0 flex-shrink-0">{SPLIT_SIZE} :&nbsp;</label>
                        <div className="d-flex">
                            <input value={totalSplitCount.toLocaleString()} disabled  className='bg-quaternary-grey px5 border-r7 w-25 text-center'/>
                            <div className="d-flex">
                                <span className="mx5">/</span> {numberWithCommas(audienceCount)}
                            </div>
                        </div>
                    </span>
                    <span>
                        {SPLIT_WINNING_COMMUNICATION}{' '}
                        {remainingCount.toLocaleString()}{" "}({Math.round(remainingPercentage)})<span className='fs12'>%</span> of the audience.
                    </span>
                </div>
                <div
                    className={`rs-split-silder-canvas-wrapper ${isClickOff ? 'click-off' : ''}`}
                    ref={containerRef}
                    id="containerRef"
                    onMouseMove={(e) => {
                        if (dragging.current) {
                            handleMouseMove(e.pageX);
                        }
                    }}
                    onMouseUp={() => {
                        if (globalMouseUpHandler.current) {
                            globalMouseUpHandler.current();
                        }
                    }}
                    onMouseLeave={() => {
                        // Keep dragging active even when mouse leaves - global handlers will catch it
                    }}
                >
                    <div className="rs-split-wrapper">
                        {splitTabs.map((tab, index) => (
                            <span
                                className={`rssw-box ${splitBoxClassName(width)} bg-${colors[index]}`}
                                key={tab}
                                style={{
                                    width: width + 'px',
                                    transition: dragging.current ? 'none' : 'width 0.1s ease-out',
                                }}
                            >
                                <span className={`rs-split-box-lables color-${colors[index]}`}>
                                    {boxText[index]}
                                </span>
                            </span>
                        ))}
                        <img
                            src={slider}
                            className={imgSplitClassName(width)}
                            onMouseDown={handleMouseDown}
                            alt="split slider handle"
                        />
                    </div>
                </div>
                <div className="rs-split-slider-bottom">
                    <ul className="rs-list-inline rli-space-25 mt10">
                        {splitTabs.map((_, tabIndex) => {
                            const displayCount = perSplitCount;
                            const displayPercentage = Math.round(percentage);
                            return (
                                <li key={tabIndex}>
                                    <span className={`rs-split-bottom-label-round bg-${colors[tabIndex]}`}>
                                        {boxText[tabIndex]}
                                    </span>
                                    <span className="rs-split-bottom-label-number">
                                        {displayCount.toLocaleString()}
                                        <span className="rss-percentage">
                                            ({displayPercentage}<span className='fs11'>%</span>)
                                        </span>
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="buttons-holder mt10 mb0">
                    <RSSecondaryButton
                        type="button"
                        onClick={() => handleClose()}
                        id="rs_splitslider_Cancel"
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        type="button"
                        onClick={() =>
                            onSave({
                                count: perSplitCount,
                                totalCount: totalSplitCount,
                                tabs: splitTabs,
                                audienceCount,
                                percentage: Math.round(percentage),
                                width,
                            })
                        }
                        disabledClass={`${isClickOff ? 'click-off pe-none' : ''}`}
                        id="rs_splitslider_Save"
                    >
                        {SAVE}
                    </RSPrimaryButton>
                </div>
            </div>
        </Fragment>
    );
};

// "splitCount": {
//     "count": 3400,
//     "tabs": ["splitA", "splitB"],
//     "audienceCount": 25000
//     //percentage
//   },

export default SplitSlider;
