import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import PropTypes from 'prop-types';

const PageNode = memo(({ data }) => {
    const { label, count, hasDownloadIcon } = data;

    return (
        <div className="page-node">
            <div className="page-count-badge">
                {count}
            </div>
            <div className="flowchart-page-content">
                <div className="page-icon-container">
                    <div className="page-lines">
                        <div className="page-line" />
                        <div className="page-line" />
                        <div className="page-line short" />
                    </div>
                </div>
            </div>
            <div className="page-label">{label}</div>
            {hasDownloadIcon && (
                <div className="page-download-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 16L7 11H10V4H14V11H17L12 16Z"
                            fill="currentColor"
                        />
                        <path d="M5 18H19V20H5V18Z" fill="currentColor" />
                    </svg>
                </div>
            )}
            <Handle
                type="target"
                position={Position.Left}
                style={{ visibility: 'hidden' }}
            />
            <Handle
                type="source"
                position={Position.Right}
                style={{ visibility: 'hidden' }}
            />
        </div>
    );
});

PageNode.displayName = 'PageNode';

PageNode.propTypes = {
    data: PropTypes.shape({
        label: PropTypes.string,
        count: PropTypes.string,
        hasDownloadIcon: PropTypes.bool,
    }),
};

export default PageNode;
