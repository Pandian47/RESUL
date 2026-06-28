import { CANCEL, CG, SAVE, SPLIT_SIZE, TG } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { slider } from 'Assets/Images';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
const SplitSlider = ({
    cgTgCount = 100,
    splitTabs = [],
    handleClose = () => {},
    onSave = () => {},
    cgValue,
    disableClass = '',
    isSaving = false,
    initialCgtgEnabled = false,
}) => {
    // console.log('cgValue: ', cgValue);
    // console.log('cgTgCount: ', cgTgCount);
    const dragging = useRef(false);
    const lastPoint = useRef(0);
    const offsetRef = useRef(0);
    const boxRef = useRef(null);
    const containerRef = useRef(null);
    const MIN_CG_PERCENTAGE = 2; // Minimum allowed CG percentage
    const MAX_CG_PERCENTAGE = 20; // Maximum allowed CG percentage
    
    const initialCount = useMemo(() => {
        return Math.max(MIN_CG_PERCENTAGE, Math.min(cgValue ?? 0, MAX_CG_PERCENTAGE));
    }, [cgValue]);

    // Initialize count within min/max bounds
    const [count, setCount] = useState(initialCount);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        // Set initial count from props, constrained to min/max
        setCount(initialCount);
        
        const handleResize = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [initialCount]);

    const hasChanged = count !== initialCount;

    const handleMouseMove = ({ pageX }) => {
        if (!dragging.current || !containerRef.current) return;

        const containerLeft = containerRef.current.getBoundingClientRect().left;
        const containerWidth = containerRef.current.offsetWidth;
        let newPosition = pageX - containerLeft;
        let newPercentage = Math.round((newPosition / containerWidth) * 100);
        newPercentage = Math.max(MIN_CG_PERCENTAGE, Math.min(newPercentage, MAX_CG_PERCENTAGE));
        
        setCount(newPercentage);
    };

    const handleMouseUp = () => {
        dragging.current = false;
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        dragging.current = true;
    };

    // Calculate widths based on percentage
    const cgWidth = `${count}%`;
    const tgWidth = `${100 - count}%`;

    return (
        <Fragment>
            <div className="rs-overlay-page-modal-wrapper border-0 p0  w-100">
                <div className="rs-split-top">
                    <span className="d-flex split_wi">
                        <label className="text-nowrap mb0 flex-shrink-0">{SPLIT_SIZE}:&nbsp;</label>
                        <div className="d-flex align-items-center">
                            <span className='ml5 mr8'>{CG}</span>{" "}
                            <input value={`${count}%`} disabled />
                          <span className="d-flex ml5">/&nbsp;<span><span className='mx7'>{TG}</span>{100 - count}<span className='pl1'>%</span></span>
                            </span>
                        </div>
                    </span>
                </div>
                <div
                    className={`rs-split-silder-canvas-wrapper mt10 ${disableClass}`}
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div className="rs-split-wrapper">
                        <span
                            className="rssw-box bg-primary-blue"
                            style={{
                                width: cgWidth,
                            }}
                        >
                            <div className="d-flex flex-column text-white align-items-center">
                                {/* <span>{CG}</span>
                                <span className='d-flex'>{count}<span className="fs12 left1 position-relative top5 white">%</span></span> */}
                            </div>
                        </span>
                        <img 
                            src={slider} 
                            onMouseDown={handleMouseDown} 
                            id="rs_SplitSlider_Sliderimg"
                            style={{ left: cgWidth }}
                            className="rs-split-slider-handle"
                        />
                        <span
                            className="bg-primary-orange text-center"
                            style={{
                                width: tgWidth,
                            }}
                        >
                            <div className="d-flex flex-column text-white align-items-center">
                                {/* <span>{TG}</span>
                                <span className='d-flex'>{100 - count}<span className="fs12 left1 position-relative top5 white">%</span></span> */}
                            </div>
                        </span>
                    </div>
                </div>
            </div>

            <div className="rsmdc-footer modal-footer custom_modal_footer_button p0 mt30">
                <RSSecondaryButton
                    type="button"
                    onClick={() => handleClose()}
                    id="rs_SplitSlider_Cancel"
                    blockInteraction={isSaving}
                >
                    {CANCEL}
                </RSSecondaryButton>
                <RSPrimaryButton
                    className={disableClass}
                    disabledClass={initialCgtgEnabled && !hasChanged ? 'pe-none click-off' : ''}
                    type="button"
                    onClick={() => {
                        onSave({ count: count });
                    }}
                    id="rs_SplitSlider_Save"
                    isLoading={isSaving}
                    blockBodyPointerEvents={isSaving}
                >
                    {SAVE}
                </RSPrimaryButton>
            </div>
        </Fragment>
    );
};

export default SplitSlider;
