import { useContext } from 'react';
import { getSmoothStepPath, EdgeLabelRenderer, BaseEdge, useReactFlow } from 'reactflow';
import { EdgeLabel, BlastCountLabel, AudienceEdgeLable, getTooltipPlacement, getStaggerIndex, getPointAlongPath } from './EdgeLabel';
import CreateWorkFlowContext from '../../context';
import { createNavigateToAnalyticsHandler } from '../../constant';
import useQueryParams from 'Hooks/useQueryParams';
import { useNavigate } from 'react-router-dom';

/** Timer at t=0.65, blast at t=0.3 — same midpoint params as CustomEdge bezierMidpoint */
const TIMER_T = 0.65;
const BLAST_T = 0.3;

const SmoothStepEdge = ({
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
    ...otherParams
}) => {
    const {
        startLabel = null,
        endLabel = {},
        levelNumber = 0,
        label,
    } = data ?? {};
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

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
    const disableLable = isSubsegmentJoureny ? disableNodeList.includes(source) : false;
    const handleNavigateAnalytics = createNavigateToAnalyticsHandler({
        source,
        canvasState,
        locationState,
        navigate,
    });

    const { getEdges, getNodes } = useReactFlow();
    const siblingCount = getEdges().filter((e) => e.source === source).length;
    const staggerIndex = getStaggerIndex(getEdges(), getNodes(), source, id);
    // Same midpoint logic as CustomEdge: timer at t=0.65, stagger when multiple edges
    const clockT = siblingCount <= 1 ? TIMER_T : Math.min(0.75, Math.max(0.5, TIMER_T + staggerIndex * 0.05));
    const clockPoint = getPointAlongPath(edgePath, clockT) || {
        x: sourceX + (targetX - sourceX) * clockT,
        y: sourceY + (targetY - sourceY) * clockT,
    };
    // Blast at t=0.3, same as CustomEdge blastCountLabel
    const blastPoint = getPointAlongPath(edgePath, BLAST_T) || {
        x: sourceX + (targetX - sourceX) * BLAST_T,
        y: sourceY + (targetY - sourceY) * BLAST_T,
    };

    return (
        <>
            <BaseEdge curvature={1} id={id} path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                {data.startLabel !== null && (
                    <BlastCountLabel
                        transform={`translate(-50%, -50%) translate(${blastPoint.x}px,${blastPoint.y}px)`}
                        label={data.startLabel}
                        handleNavigateAnalytics={handleNavigateAnalytics}
                    />
                )}
                {data?.levelNumber !== 1 && Object.keys(data.endLabel)?.length > 0 && (
                    <EdgeLabel
                        transform={`translate(-50%, -50%) translate(${clockPoint.x}px,${clockPoint.y}px)`}
                        label={data.endLabel}
                        defaultShow={isShowScheduleTooltip ?? false}
                        disableLable={disableLable}
                        canvasState={canvasState}
                        tooltipPlacement={getEdges().filter((e) => e.source === source).length <= 1 ? 'top' : getTooltipPlacement(clockPoint.x, clockPoint.y, sourceX, sourceY, targetX, targetY)}
                    />
                )}
                {typeof data.label !== 'object' && data.label > 0 && typeof data.label === 'number' && (
                    <AudienceEdgeLable
                        transform={`translate(-170%, -50%) translate(${targetX}px,${targetY}px)`}
                        label={data.label}
                        disableLable={disableLable}
                    />
                )}
            </EdgeLabelRenderer>
        </>
    );
};

export default SmoothStepEdge;
