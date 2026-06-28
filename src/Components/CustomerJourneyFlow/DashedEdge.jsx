import { getBezierPath } from 'reactflow';
import PropTypes from 'prop-types';

const DashedEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
}) => {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <path
            id={id}
            className="react-flow__edge-path animated-dash"
            d={edgePath}
            markerEnd={markerEnd}
            style={{
                strokeDasharray: '5,5',
                stroke: '#9E9E9E',
                strokeWidth: 1.5,
                fill: 'none',
            }}
        />
    );
};

DashedEdge.propTypes = {
    id: PropTypes.string,
    sourceX: PropTypes.number,
    sourceY: PropTypes.number,
    targetX: PropTypes.number,
    targetY: PropTypes.number,
    sourcePosition: PropTypes.string,
    targetPosition: PropTypes.string,
    markerEnd: PropTypes.string,
};

export default DashedEdge;
