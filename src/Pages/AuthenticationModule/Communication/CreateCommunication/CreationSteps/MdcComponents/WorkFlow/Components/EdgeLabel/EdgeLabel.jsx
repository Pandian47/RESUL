import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { useState, useEffect, useRef, useContext, memo } from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge, useReactFlow } from 'reactflow';
import RSMdcTooltip from 'Components/RSTooltip/RSMdcTooltip';

import CreateWorkFlowContext from '../../context';
import { createNavigateToAnalyticsHandler } from '../../constant';
import useQueryParams from 'Hooks/useQueryParams';
import { useNavigate } from 'react-router-dom';

/** Get point at parameter t (0–1) along SVG path — same midpoint concept as bezierMidpoint for any path */
export const getPointAlongPath = (path, percentage) => {
    if (!path || typeof path !== 'string') return null;
    try {
        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathElement.setAttribute('d', path);
        const pathLength = pathElement.getTotalLength();
        if (!Number.isFinite(pathLength) || pathLength <= 0) return null;
        const t = Math.max(0, Math.min(1, percentage));
        const point = pathElement.getPointAtLength(pathLength * t);
        return { x: point.x, y: point.y };
    } catch (error) {
        return null;
    }
};

// this is a little helper component to render the actual edge label
const getPlacementAwayFrom = (labelX, labelY, nodeX, nodeY) => {
    const lx = Number(labelX);
    const ly = Number(labelY);
    const nx = Number(nodeX);
    const ny = Number(nodeY);
    if (Number.isNaN(lx) || Number.isNaN(ly) || Number.isNaN(nx) || Number.isNaN(ny)) return 'top';
    if (Math.abs(ny - ly) >= Math.abs(nx - lx)) return ly < ny ? 'top' : 'bottom';
    return lx < nx ? 'left' : 'right';
};

export const getTooltipPlacement = (labelX, labelY, sourceX, sourceY, targetX, targetY) => {
    const x = Number(labelX);
    const y = Number(labelY);
    const sx = Number(sourceX);
    const sy = Number(sourceY);
    const tx = Number(targetX);
    const ty = Number(targetY);
    if (Number.isNaN(x) || Number.isNaN(y)) return 'top';
    const distToSource = (x - sx) ** 2 + (y - sy) ** 2;
    const distToTarget = (x - tx) ** 2 + (y - ty) ** 2;
    if (Number.isNaN(distToSource) || Number.isNaN(distToTarget)) return 'top';
    return distToSource < distToTarget
        ? getPlacementAwayFrom(labelX, labelY, sourceX, sourceY)
        : getPlacementAwayFrom(labelX, labelY, targetX, targetY);
};

export const STAGGER_Y = 36;
export const getStaggerIndex = (edges, nodes, source, edgeId) => {
    const siblings = edges.filter((e) => e.source === source);
    if (siblings.length <= 1) return 0;
    const nodeY = (id) => Number(nodes.find((n) => n.id === id)?.position?.y ?? 0);
    const sorted = [...siblings].sort((a, b) => nodeY(a.target) - nodeY(b.target) || (a.target || '').localeCompare(b.target || ''));
    const i = sorted.findIndex((e) => e.id === edgeId);
    return i >= 0 ? i : 0;
};

export const EdgeLabel = memo(({ transform, label, defaultShow, disableLable = false, canvasState, tooltipPlacement = 'top' }) => {
    if (!label || typeof label !== 'object') {
        return null;
    }
    const [isVisible, setVisible] = useState(defaultShow);
    const containerRef = useRef();
    const isCurveLine = canvasState?.Campaign?.MdcFlowConfig?.isCurveLine;
    const isShowScheduleTooltip = canvasState?.Campaign?.MdcFlowConfig?.isShowScheduleTooltip;
    const shouldDefaultShow = !!defaultShow;
    useEffect(() => {
        if (!shouldDefaultShow) {
            setVisible(false);
            return;
        }
        setVisible(false);
        const t1 = setTimeout(() => setVisible(true), 150);
        return () => clearTimeout(t1);
    }, [isCurveLine, isShowScheduleTooltip]);
    return (
        <div
            style={{
                position: 'absolute',
                // background: 'transparent',
                textAlign: 'center',
                fontSize: '12px',
                //padding: 10,
                transform,
            }}
            className={`nodrag nopan mdc-edge-timer-block ${disableLable ? 'click-off' : ''}`}
            ref={containerRef}
        >
            {/* <div>{label.actionName}</div>
            <i className="icon-rs-timer-medium icon-md color-primary-blue bg-white"></i>
            <div>{label.dayOrHourText}</div>
            <div>{label.date}</div> */}
            <RSMdcTooltip
                position={tooltipPlacement}
                isDefaultShow={shouldDefaultShow ? isVisible : undefined}
                //isDefaultShow={true}
                transform={transform}
                container={containerRef}
                text={
                    <div className="RS-MDC-Tooltip-UI">
                        {label.actionName ? (
                            <div className="RSpopupHeading">{label.actionName}</div>
                        ) : null}
                        <div className="RSpopupSubHeading"> Wait for {label.dayOrHourText || ''}</div>
                        {/* <div className="RSpopupDate"> {getDateWithDay(label.date)}</div> */}
                        <div className="RSpopupDate">
                            {label.date ? getUserCurrentFormat(label.date)?.dateFormat : ''}
                        </div>
                    </div>
                }
            >
                <i className="icon-rs-timer-medium icon-md color-primary-blue "></i>
            </RSMdcTooltip>
        </div>
    );
});

export const BlastCountLabel = ({ transform, label, handleNavigateAnalytics }) => {
    return (
        <div
            style={{
                transform,
                position: 'absolute',
                textAlign: 'center',
            }}
            onClick={handleNavigateAnalytics}
            className="nodrag nopan rs-mdc-edge-label-block cp"
        >
            <span className="rsmelb-label">{label}</span>
        </div>
    );
};
export const AudienceEdgeLable = ({ transform, label, disableLable = false }) => {
    return (
        <div
            style={{
                transform,
                position: 'absolute',
                textAlign: 'center',
            }}
            className={`nodrag nopan rs-mdc-edge-label-block ${disableLable ? 'click-off' : ''}`}
            title={numberDecimalForamtter(label)}
        >
            <span className="rsmelb-label">{numberForamtterShort(label)}</span>
        </div>
    );
};

const numberDecimalForamtter = (count) => {
    if (count.toString().includes(',')) count = count.replace(/,/g, '');

    return new Intl.NumberFormat().format(count);
};

const numberForamtterShort = (count) => {
    if (count.toString().includes(',')) count = count.replace(/,/g, '');

    const numberFormatter = new Intl.NumberFormat('en', { notation: 'compact' });
    const formattedTotal = numberFormatter.format(count);
    return formattedTotal;
};
const CustomEdge = memo(({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    markerEnd,
    style,
    curvature,
    sourceHandleId,
    source,
    target,
}) => {
    const {
        startLabel = null,
        endLabel = {},
        levelNumber = 0,
        label,
    } = data ?? {};
    const { getEdges } = useReactFlow();
    // let [edgePath, labelX, labelY, interactionWidth, pathOptions] = getSmoothStepPath({
    //     sourceX,
    //     sourceY,
    //     sourcePosition,
    //     targetX,
    //     targetY,
    //     targetPosition,
    // });

    let [path, labelX, labelY, offsetX, offsetY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        curvature,
    });
    const translateXPos = parseInt(targetX, 10) - 60;
    const translateYPos = parseInt(targetY, 10) + 10;
    // console.log('custom edge M197,246 C197,290 228,334 259,334', path, id);
    // //let dpath = `M${sourceX},${sourceY} C${sourceX + 50},${sourceY + 100} ${sourceX},${targetY} ${targetX},${targetY}`;
    // let dpath = `M396,233 C500,233 500,317 571,317`;
    //if (id === 'edges-3') {
            var audLabelX = '',
        audLabelY = '',
        timerLabelX = '',
        timerLabelY = '',
        blastCountLabelX = '',
        blastCountLabelY = '',
        angleDeg;
    if (sourceHandleId === 'A1') {
        path = `M${sourceX},${sourceY} C${sourceX + 100},${sourceY + 10} ${targetX - 120},${
            targetY - 10
        } ${targetX},${targetY}`;
        let x1 = sourceX,
            y1 = sourceY,
            cx1 = sourceX + 100,
            cy1 = sourceY + 10,
            cx2 = targetX - 120,
            cy2 = targetY - 5,
            x2 = targetX,
            y2 = targetY,
            t = 0.6;
        var { audLabelX, audLabelY } = bezierMidpoint(x1, y1, cx1, cy1, cx2, cy2, x2, y2, t);
        angleDeg = calculateAngle(x1, y1, cx1, cy1, cx2, cy2, x2, y2, t);
    } else if (sourceHandleId === 'A2' || sourceHandleId === 'A3' || sourceHandleId === 'A4') {
        path = `M${sourceX},${sourceY} C${sourceX + 100},${sourceY} ${targetX - 100},${targetY} ${targetX},${targetY}`;
        let x1 = sourceX,
            y1 = sourceY,
            cx1 = sourceX + 100,
            cy1 = sourceY + 10,
            cx2 = targetX - 100,
            cy2 = targetY - 5,
            x2 = targetX,
            y2 = targetY,
            t = 0.6;
        var { audLabelX, audLabelY } = bezierMidpoint(x1, y1, cx1, cy1, cx2, cy2, x2, y2, t);
        angleDeg = calculateAngle(x1, y1, cx1, cy1, cx2, cy2, x2, y2, t);
    } else {
        if (sourceHandleId == 'single' || sourceHandleId == 'shandle') {
            path = path;
        } else {
            path = `M${sourceX},${sourceY} C${sourceX + 210},${sourceY - 10} ${targetX - 100},${
                targetY + 8
            } ${targetX},${targetY}`;
        }

        let cords = path.split(',');
                let x1 = cords[0].split('M')[1],
            y1 = cords[1].split(' ')[0],
            cx1 = cords[1].split('C')[1],
            cy1 = cords[2].split(' ')[0],
            cx2 = cords[2].split(' ')[1],
            cy2 = cords[3].split(' ')[0],
            x2 = cords[3].split(' ')[1],
            y2 = cords[4],
            t = 0.65,
            t1 = 0.3;
        var { audLabelX: timerLabelX, audLabelY: timerLabelY } = bezierMidpoint(x1, y1, cx1, cy1, cx2, cy2, x2, y2, t);
        var { audLabelX: blastCountLabelX, audLabelY: blastCountLabelY } = bezierMidpoint(
            x1,
            y1,
            cx1,
            cy1,
            cx2,
            cy2,
            x2,
            y2,
            t1,
        );
    }
    let audienceLableTransform = `translate(-170%, -50%) translate(${targetX}px,${targetY}px)`;

    const { canvasState } = useContext(CreateWorkFlowContext);
    const locationState = useQueryParams();
    const navigate = useNavigate();
    const {
        disableNodeList,
        dataSource: { isSubsegmentJoureny },
        Campaign: {
            MdcFlowConfig: { isShowScheduleTooltip },
        },
    } = canvasState;
    const disableLabel = isSubsegmentJoureny ? disableNodeList.includes(source) : false;
    const handleNavigateAnalytics = createNavigateToAnalyticsHandler({
        source,
        canvasState,
        locationState,
        navigate,
    });
    return (
        <>
            {/* <BezierEdge
                sourceX={sourceX}
                sourceY={sourceY}
                targetX={targetX}
                targetY={targetY}
                path={`M379,233 C475,233 475,317 571,317`}
                markerEnd={markerEnd}
                sourcePosition={sourcePosition}
                targetPosition={targetPosition}
                style={style}
                // pathOptions={{ curvature: 1,offS }}
            /> */}
            <BaseEdge curvature={1} id={id} path={path} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                {data.startLabel !== null && (
                    <BlastCountLabel
                        transform={`translate(-50%, -50%) translate(${blastCountLabelX}px,${blastCountLabelY}px)`}
                        label={data.startLabel}
                        handleNavigateAnalytics={handleNavigateAnalytics}
                    />
                )}
                {data?.levelNumber !== 1 && data?.endLabel && Object.keys(data.endLabel).length > 0 && (
                    <EdgeLabel
                        transform={`translate(-50%, -50%) translate(${timerLabelX}px,${timerLabelY}px)`}
                        label={data.endLabel}
                        defaultShow={isShowScheduleTooltip}
                        disableLable={disableLabel}
                        canvasState={canvasState}
                        tooltipPlacement={getEdges().filter((e) => e.source === source).length <= 1 ? 'top' : getTooltipPlacement(timerLabelX, timerLabelY, sourceX, sourceY, targetX, targetY)}
                    />
                )}
                {typeof data.label !== 'object' && data.label > 0 && typeof data.label === 'number' && (
                    <AudienceEdgeLable
                        transform={audienceLableTransform}
                        label={data.label}
                        disableLable={disableLabel}
                    />
                )}
            </EdgeLabelRenderer>
        </>
    );
});

export default CustomEdge;

function bezierMidpoint(x1, y1, cx1, cy1, cx2, cy2, x2, y2, t) {
    // Bézier function
    const bx = (1 - t) ** 3 * x1 + 3 * (1 - t) ** 2 * t * cx1 + 3 * (1 - t) * t ** 2 * cx2 + t ** 3 * x2;
    const by = (1 - t) ** 3 * y1 + 3 * (1 - t) ** 2 * t * cy1 + 3 * (1 - t) * t ** 2 * cy2 + t ** 3 * y2;

    return { audLabelX: bx, audLabelY: by };
}

const calculateAngle = (x1, y1, cx1, cy1, cx2, cy2, x2, y2, t) => {
    // Calculate the derivative of the Bézier function
    const dx = 3 * (1 - t) ** 2 * (cx1 - x1) + 6 * (1 - t) * t * (cx2 - cx1) + 3 * t ** 2 * (x2 - cx2);
    const dy = 3 * (1 - t) ** 2 * (cy1 - y1) + 6 * (1 - t) * t * (cy2 - cy1) + 3 * t ** 2 * (y2 - cy2);

    // Calculate the angle in radians
    const angleRad = Math.atan2(dy, dx);

    // Convert radians to degrees
    const angleDeg = angleRad * (180 / Math.PI);

    return angleDeg;
};
