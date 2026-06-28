import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import PropTypes from 'prop-types';

const ChannelNode = memo(({ data }) => {
    const { icon, count, color, backgroundColor, label } = data;

    return (
        <div className={`channel-node-wrapper${label ? ' channel-node-wrapper--labeled' : ''}`}>
            <div
                className="channel-node"
                style={{
                    '--channel-bg-color': backgroundColor || '#4CAF50',
                    '--channel-border-color': color || '#388E3C',
                }}
            >
                <div className="channel-icon">
                    <i className={icon} />
                </div>
                <div className="channel-count">
                    {count}
                </div>
                <Handle
                    type="source"
                    position={Position.Right}
                    style={{ visibility: 'hidden' }}
                />
            </div>
            {label ? (
                <div className="channel-dimension-label" title={label}>
                    {label}
                </div>
            ) : null}
        </div>
    );
});

ChannelNode.displayName = 'ChannelNode';

ChannelNode.propTypes = {
    data: PropTypes.shape({
        icon: PropTypes.string,
        count: PropTypes.string,
        color: PropTypes.string,
        backgroundColor: PropTypes.string,
        label: PropTypes.string,
    }),
};

export default ChannelNode;
