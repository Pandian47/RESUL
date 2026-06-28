import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import PropTypes from 'prop-types';

const GoalNode = memo(({ data }) => {
    const { label, count } = data;

    return (
        <div className="goal-node">
            <div className="goal-count-badge">
                {count}
            </div>
            <div className="goal-flag">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M5 3V21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <path
                        d="M5 4H17L14 8L17 12H5V4Z"
                        fill="currentColor"
                    />
                </svg>
            </div>
            <div className="goal-content">
                <div className="page-lines">
                    <div className="page-line" />
                    <div className="page-line" />
                    <div className="page-line short" />
                </div>
            </div>
            <div className="goal-label">{label}</div>
            <Handle
                type="target"
                position={Position.Left}
                style={{ visibility: 'hidden' }}
            />
        </div>
    );
});

GoalNode.displayName = 'GoalNode';

GoalNode.propTypes = {
    data: PropTypes.shape({
        label: PropTypes.string,
        count: PropTypes.string,
    }),
};

export default GoalNode;
