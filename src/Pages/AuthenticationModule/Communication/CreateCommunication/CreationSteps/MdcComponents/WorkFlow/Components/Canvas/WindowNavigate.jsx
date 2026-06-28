import { comment_medium, mdc_curved_medium, mdc_straight_line_medium, uncomment_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useDrag, useDragLayer } from 'react-dnd';
import { useState, useEffect, useRef } from 'react';
import { ControlButton, MiniMap } from 'reactflow';
import { GetMiniMapConfig, GetMiniMapComponent } from './CanvasConst';
import RSTooltip from 'Components/RSTooltip';
const WindowNavigate = ({
    handleFitView,
    handleDefaultActionInfo,
    toggleMdcLock,
    zoomIn,
    zoomOut,
    left,
    top,
    lockStatus,
    setZoom,
    zoomVal,
    alignToGrid,
    isDefaultShow,
    isCollapse,
    updateMiniMapCollapseState,
    isCurveLine,
    handleEdgeTypes,
    wrapperWidth,
}) => {
    // const [isCollapse, setCollapse] = useState(false);
    const [zoomPercentage, setZoomPercentage] = useState(0);
    useEffect(() => {
        if (zoomVal) {
            setZoomPercentage(zoomVal);
            localStorage.setItem('zoomPercentage', zoomVal);
        } else {
            setZoomPercentage(localStorage.getItem('zoomPercentage'));
        }
    }, [zoomVal]);

    const [{ opacity, isDragging, initialOffset, currentOffset }, drag, preview] = useDrag(
        () => ({
            type: 'd',
            item: { left, top, type: 'miniMap' },
            collect: (monitor) => ({
                opacity: monitor.isDragging() ? 0.4 : 1,
                isDragging: monitor.isDragging(),
                initialOffset: monitor.getInitialSourceClientOffset(),
                currentOffset: monitor.getSourceClientOffset(),
            }),
        }),
        [left, top],
    );

    const handleStyle = {
        cursor: 'move',
    };
    // Create an empty image for hiding the drag preview
    const emptyImage = useRef(new Image());
    emptyImage.current.src = '';

    // Set the drag preview to the empty image
    preview(emptyImage.current);

    if (isDragging && currentOffset.x > 220) {
        return null;
        // return <div ref={preview} className="minimapReferenceBlock"></div>;
    }

    return (
        <>
            <div
                className="mdc-minimap"
                style={{
                    left: ` ${left < 22 ? 21 : left > wrapperWidth - 270 ? wrapperWidth - 270 : left}px`,
                    top: `${top}px`,
                }}
            >
                <div className="mdc-controls-right-top">
                    <div className="react-flow__controls">
                        <ControlButton>
                            <RSTooltip text={'Move'} position="bottom">
                                <i
                                    className="icon-rs-move-arrow-medium icon-md color-primary-black"
                                    ref={drag}
                                    style={handleStyle}
                                ></i>
                            </RSTooltip>
                        </ControlButton>
                        <ControlButton>
                            <RSTooltip text={`${isCurveLine ? 'Straight line' : 'Curve line'}`} position="bottom">
                                <i
                                    className={`${
                                        isCurveLine
                                            ? `${mdc_straight_line_medium} color-blue-heavy-dark`
                                            : mdc_curved_medium
                                    } icon-md color-primary-black`}
                                    onClick={handleEdgeTypes}
                                ></i>
                            </RSTooltip>
                        </ControlButton>
                        <ControlButton>
                            <RSTooltip text={`${isDefaultShow ? 'Hide schedule' : 'Show schedule'}`} position="bottom">
                                <i
                                    className={`${
                                        isDefaultShow ? comment_medium : uncomment_medium
                                    } icon-md color-primary-black`}
                                    onClick={handleDefaultActionInfo}
                                ></i>
                            </RSTooltip>
                        </ControlButton>

                        <ControlButton
                            onClick={() => {
                                alignToGrid(true);
                            }}
                        >
                            <RSTooltip text={'Align grid'} position="bottom">
                                <i className="icon-rs-align-medium icon-md color-primary-black"></i>
                            </RSTooltip>
                        </ControlButton>

                        <ControlButton
                            onClick={() => {
                                toggleMdcLock();
                            }}
                        >
                            <RSTooltip
                                text={`${lockStatus ? 'Interactivity OFF' : 'Interactivity ON'}`}
                                position="bottom"
                            >
                                <i
                                    className={`${
                                        lockStatus ? 'icon-rs-lock-medium' : 'icon-rs-unlock-medium'
                                    } icon-md color-primary-black`}
                                ></i>
                            </RSTooltip>
                        </ControlButton>
                        <ControlButton
                            onClick={() => {
                                handleFitView();
                                setZoomPercentage(1);
                            }}
                        >
                            <RSTooltip text={'Fit view'} position="bottom">
                                <i className="icon-rs-window-fit-medium icon-md color-primary-black"></i>
                            </RSTooltip>
                        </ControlButton>

                        <ControlButton
                            onClick={() => {
                                // setCollapse(!isCollapse);
                                updateMiniMapCollapseState(!isCollapse);
                            }}
                        >
                            <RSTooltip text={`${!isCollapse ? 'Collapse' : 'Expand'}`} position="bottom">
                                <i
                                    className={`${
                                        !isCollapse ? 'icon-rs-arrow-double-up-mini' : 'icon-rs-arrow-double-down-mini'
                                    } icon-md color-primary-black`}
                                ></i>
                            </RSTooltip>
                        </ControlButton>
                    </div>
                </div>
                <MiniMap
                    position={'top-right'}
                    pannable={true}
                    maskColor={'#fff'}
                    maskStrokeColor={'#004fdf'}
                    maskStrokeWidth={10}
                    //style={{ margin: '0',}}
                    nodeComponent={GetMiniMapComponent}
                    nodeColor={GetMiniMapConfig}
                    ariaLabel={'Navigator'}
                    className={`${isCollapse ? 'hide' : ''}`}
                />
                <div className={`mdc-controls-right-bottom ${isCollapse ? 'hide' : ''}`}>
                    <div className="react-flow__controls">
                        <ControlButton
                            onClick={() => {
                                zoomOut();
                            }}
                        >
                            <RSTooltip text={'Zoom out'} position="bottom">
                                <i className="icon-rs-zoom-minus-medium icon-md color-primary-black"></i>
                            </RSTooltip>
                        </ControlButton>
                        <ControlButton className="rsRangeBar">
                            <input
                                name="zoom-percentage"
                                type="range"
                                min="0.25"
                                max="2.00"
                                step="0.25"
                                value={zoomPercentage}
                                onChange={(e) => {
                                    //  console.log(e.target.value);
                                    setZoom(e.target.value);
                                    setZoomPercentage(e.target.value);
                                    localStorage.setItem('zoomPercentage', e.target.value);
                                }}
                            />
                            <span className="zoom-percent-text">{Math.round(zoomPercentage * 100)}%</span>
                        </ControlButton>
                        <ControlButton
                            onClick={() => {
                                zoomIn();
                            }}
                        >
                            <RSTooltip text={'Zoom in'} position="bottom">
                                <i className="icon-rs-zoom-plus-medium icon-md color-primary-black"></i>
                            </RSTooltip>
                        </ControlButton>
                        {/* </Controls> */}
                    </div>
                </div>
            </div>
        </>
    );
};

export default WindowNavigate;

export const CustomDragLayer = (props) => {
    const { isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
        isDragging: monitor.isDragging(),
        item: monitor.getItem(),
        initialOffset: monitor.getInitialSourceClientOffset(),
        currentOffset: monitor.getSourceClientOffset(),
    }));

    if (
        !isDragging ||
        currentOffset?.x < 220 ||
        currentOffset?.x > props?.children?.props?.wrapperWidth - 22 ||
        item.type !== 'miniMap'
    ) {
        return null;
    }
    return (
        <div
            style={{
                position: 'fixed',
                pointerEvents: 'none',
                zIndex: 100,
                left: 0,
                top: 0,
                transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`,
                cursor: 'grab',
            }}
        >
            {props.children}
        </div>
    );
};
