import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow';
import { Dropdown } from 'react-bootstrap';
const formatFailPercentageLabel = (v) => {
    if (v === '' || v === null || v === undefined) return '0';
    const n = typeof v === 'number' ? v : parseFloat(String(v).trim());
    return Number.isFinite(n) ? n : '0';
};

// this is a little helper component to render the actual edge label
export const EdgeLabel = ({ transform, labelBgStyle, actionMenus, onEdgeClick, nodeData }) => {
    const { FailPercentage } = nodeData;
    return (
        <div
            style={{
                position: 'absolute',
                // background: 'transparent',
                textAlign: 'center',
                fontSize: '14px',
                //padding: 10,
                transform,
            }}
            className="fadsfasfafasd"
        >
            <Dropdown>
                <Dropdown.Toggle style={labelBgStyle}>{formatFailPercentageLabel(FailPercentage)}%</Dropdown.Toggle>
                <Dropdown.Menu>
                    {actionMenus.map((menu) => (
                        <Dropdown.Item key={menu} onClick={() => onEdgeClick(nodeData)}>
                            {menu}
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
};
export const AudienceEdgeLable = ({ transform, label }) => {
    return (
        <div
            style={{
                transform,
                position: 'absolute',
                textAlign: 'center',
            }}
            className="nodrag nopan rs-mdc-edge-label-block"
        >
            <span className="rsmelb-label">{label}</span>
        </div>
    );
};
const BazierEdge = (
    {
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
        labelBgStyle,
    },
    actionMenus,
    onEdgeClick,
) => {
    /* let [path, labelX, labelY, offsetX, offsetY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        curvature,
    });
    const handleList = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9'];

    let cords = path.split(',');

    var audLabelX = '',
        audLabelY = '',
        timerLabelX = '',
        timerLabelY = '',
        angleDeg;
    if (handleList.includes(sourceHandleId)) {
        switch (sourceHandleId) {
            case 'A8':
                path = `M${sourceX - 10},${sourceY - 2} C${sourceX + 350},${sourceY + 10} ${
                    targetX - 300
                },${targetY} ${targetX},${targetY}`;
                let x1 = sourceX - 10,
                    y1 = sourceY - 2,
                    cx1 = sourceX + 350,
                    cy1 = sourceY + 10,
                    cx2 = targetX - 300,
                    cy2 = targetY,
                    x2 = targetX,
                    y2 = targetY,
                    t = 0.5;
                var { audLabelX: timerLabelX, audLabelY: timerLabelY } = bezierMidpoint(
                    x1,
                    y1,
                    cx1,
                    cy1,
                    cx2,
                    cy2,
                    x2,
                    y2,
                    t,
                );
                angleDeg = calculateAngle(x1, y1, cx1, cy1, cx2, cy2, x2, y2, t);
                break;
            case 'A7':
                {
                    path = `M${sourceX - 10},${sourceY - 2} C${sourceX + 290},${sourceY + 10} ${
                        targetX - 300
                    },${targetY} ${targetX},${targetY}`;
                    let x1 = sourceX - 10,
                        y1 = sourceY - 2,
                        cx1 = sourceX + 290,
                        cy1 = sourceY + 10,
                        cx2 = targetX - 300,
                        cy2 = targetY,
                        x2 = targetX,
                        y2 = targetY,
                        t = 0.5;
                    var { audLabelX: timerLabelX, audLabelY: timerLabelY } = bezierMidpoint(
                        x1,
                        y1,
                        cx1,
                        cy1,
                        cx2,
                        cy2,
                        x2,
                        y2,
                        t,
                    );
                    angleDeg = calculateAngle(x1, y1, cx1, cy1, cx2, cy2, x2, y2, t);
                }
                break;
            case 'A6':
                {
                    path = `M${sourceX - 10},${sourceY - 2} C${sourceX + 290},${sourceY + 10} ${
                        targetX - 300
                    },${targetY} ${targetX},${targetY}`;
                    let x1 = sourceX - 10,
                        y1 = sourceY - 2,
                        cx1 = sourceX + 290,
                        cy1 = sourceY + 10,
                        cx2 = targetX - 300,
                        cy2 = targetY,
                        x2 = targetX,
                        y2 = targetY,
                        t = 0.5;
                    var { audLabelX: timerLabelX, audLabelY: timerLabelY } = bezierMidpoint(
                        x1,
                        y1,
                        cx1,
                        cy1,
                        cx2,
                        cy2,
                        x2,
                        y2,
                        t,
                    );
                    angleDeg = calculateAngle(x1, y1, cx1, cy1, cx2, cy2, x2, y2, t);
                }
                break;
            case 'A5': {
                path = `M${sourceX - 10},${sourceY - 2} C${sourceX + 290},${sourceY + 10} ${
                    targetX - 300
                },${targetY} ${targetX},${targetY}`;
                let x1 = sourceX - 10,
                    y1 = sourceY - 2,
                    cx1 = sourceX + 290,
                    cy1 = sourceY + 10,
                    cx2 = targetX - 300,
                    cy2 = targetY,
                    x2 = targetX,
                    y2 = targetY,
                    t = 0.5;
                var { audLabelX: timerLabelX, audLabelY: timerLabelY } = bezierMidpoint(
                    x1,
                    y1,
                    cx1,
                    cy1,
                    cx2,
                    cy2,
                    x2,
                    y2,
                    t,
                );
                angleDeg = calculateAngle(x1, y1, cx1, cy1, cx2, cy2, x2, y2, t);
            }
            case 'A4': {
                path = `M${sourceX - 10},${sourceY - 2} C${sourceX + 290},${sourceY + 10} ${
                    targetX - 300
                },${targetY} ${targetX},${targetY}`;
                let x1 = sourceX - 10,
                    y1 = sourceY - 2,
                    cx1 = sourceX + 290,
                    cy1 = sourceY + 10,
                    cx2 = targetX - 300,
                    cy2 = targetY,
                    x2 = targetX,
                    y2 = targetY,
                    t = 0.5;
                var { audLabelX: timerLabelX, audLabelY: timerLabelY } = bezierMidpoint(
                    x1,
                    y1,
                    cx1,
                    cy1,
                    cx2,
                    cy2,
                    x2,
                    y2,
                    t,
                );
                angleDeg = calculateAngle(x1, y1, cx1, cy1, cx2, cy2, x2, y2, t);
            }
            case 'A3':
                {
                    path = `M${sourceX - 10},${sourceY - 2} C${sourceX + 290},${sourceY + 10} ${
                        targetX - 300
                    },${targetY} ${targetX},${targetY}`;
                    let x1 = sourceX - 10,
                        y1 = sourceY - 2,
                        cx1 = sourceX + 290,
                        cy1 = sourceY + 10,
                        cx2 = targetX - 300,
                        cy2 = targetY,
                        x2 = targetX,
                        y2 = targetY,
                        t = 0.5;
                    var { audLabelX: timerLabelX, audLabelY: timerLabelY } = bezierMidpoint(
                        x1,
                        y1,
                        cx1,
                        cy1,
                        cx2,
                        cy2,
                        x2,
                        y2,
                        t,
                    );
                    angleDeg = calculateAngle(x1, y1, cx1, cy1, cx2, cy2, x2, y2, t);
                }
                break;
            case 'A2':
                {
                    path = `M${sourceX - 10},${sourceY - 2} C${sourceX + 290},${sourceY + 10} ${
                        targetX - 300
                    },${targetY} ${targetX},${targetY}`;
                    let x1 = sourceX - 10,
                        y1 = sourceY - 2,
                        cx1 = sourceX + 290,
                        cy1 = sourceY + 10,
                        cx2 = targetX - 300,
                        cy2 = targetY,
                        x2 = targetX,
                        y2 = targetY,
                        t = 0.5;
                    var { audLabelX: timerLabelX, audLabelY: timerLabelY } = bezierMidpoint(
                        x1,
                        y1,
                        cx1,
                        cy1,
                        cx2,
                        cy2,
                        x2,
                        y2,
                        t,
                    );
                    angleDeg = calculateAngle(x1, y1, cx1, cy1, cx2, cy2, x2, y2, t);
                }
                break;
            case 'A1':
                {
                    path = `M${sourceX - 10},${sourceY - 2} C${sourceX + 290},${sourceY + 10} ${
                        targetX - 300
                    },${targetY} ${targetX},${targetY}`;
                    let x1 = sourceX - 10,
                        y1 = sourceY - 2,
                        cx1 = sourceX + 290,
                        cy1 = sourceY + 10,
                        cx2 = targetX - 300,
                        cy2 = targetY,
                        x2 = targetX,
                        y2 = targetY,
                        t = 0.5;
                    var { audLabelX: timerLabelX, audLabelY: timerLabelY } = bezierMidpoint(
                        x1,
                        y1,
                        cx1,
                        cy1,
                        cx2,
                        cy2,
                        x2,
                        y2,
                        t,
                    );
                    angleDeg = calculateAngle(x1, y1, cx1, cy1, cx2, cy2, x2, y2, t);
                }
                break;
            default:
                path = `M${sourceX - 10},${sourceY - 2} C${sourceX + 290},${sourceY + 10} ${
                    targetX - 300
                },${targetY} ${targetX},${targetY}`;
        }
    } else {
        if (sourceHandleId == 'single') {
            path = path;
        } else {
            path = `M${sourceX},${sourceY} C${sourceX + 150},${sourceY - 10} ${targetX - 100},${
                targetY + 8
            } ${targetX},${targetY}`;
        }

        let cords = path.split(',');
        //  console.log('cords ary', cords);
        let x1 = cords[0].split('M')[1],
            y1 = cords[1].split(' ')[0],
            cx1 = cords[1].split('C')[1],
            cy1 = cords[2].split(' ')[0],
            cx2 = cords[2].split(' ')[1],
            cy2 = cords[3].split(' ')[0],
            x2 = cords[3].split(' ')[1],
            y2 = cords[4],
            t = 0.6;
        var { audLabelX: timerLabelX, audLabelY: timerLabelY } = bezierMidpoint(x1, y1, cx1, cy1, cx2, cy2, x2, y2, t);
    }*/

    const [path, labelX, labelY, offsetX, offsetY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });
    return (
        <>
            <BaseEdge curvature={1} id={id} path={path} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                {labelBgStyle && data && data.showFailLabel !== false && (
                    <EdgeLabel
                        labelBgStyle={labelBgStyle}
                        transform={`translate(-50%, -50%) translate(${labelX}px,${labelY}px) rotate(180deg) scaleX(-1)`}
                        actionMenus={actionMenus}
                        onEdgeClick={onEdgeClick}
                        nodeData={data}
                    />
                )}
            </EdgeLabelRenderer>
        </>
    );
};

export default BazierEdge;

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
