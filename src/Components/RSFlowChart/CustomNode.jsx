import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { createPortal } from 'react-dom';
export default memo(({ data, isConnectable }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const handleMouseEnter = (e) => {
        if (data.eleType === "end" && data.friendlyName === "Failed") {
            return;
        }
        
        setTooltipPosition({
            x: e.clientX + 20,
            y: e.clientY
        });
        setShowTooltip(true);
    };
    
    const handleMouseMove = (e) => {
        if (showTooltip) {
            setTooltipPosition({
                x: e.clientX + 20, 
                y: e.clientY
            });
        }
    };
    
    const handleMouseLeave = () => {
        setShowTooltip(false);
    };
    
    const renderTooltip = () => {
        if (!showTooltip) return null;
        
        const tooltipContent = (
            <div
                className="flow-chart-tooltip"
                style={{
                    left: tooltipPosition.x,
                    top: tooltipPosition.y
                }}
            >
                <div>Actual Count: {data?.actualCount || '0'}</div>
            </div>
        );
        
        return createPortal(tooltipContent, document.body);
    };
    
    return (
        <>
            <Handle
                type="target"
                position={Position.Left}
                style={{ bottom: 'auto', top: 33, left: -3, right: 'auto', visibility: 'hidden' }}
                onConnect={(params) => {}}
                isConnectable={isConnectable}
            />
            <div 
                className="reTargetNode" 
                style={{ cursor: 'default' }}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {data.friendlyName}
            </div>
            
            {renderTooltip()}

            <Handle
                type="source"
                position={Position.Right}
                style={{
                    bottom: 'auto',
                    top: 33,
                    left: 'auto',
                    right: -2,
                    visibility: 'hidden',
                }}
                isConnectable={isConnectable}
            />
        </>
    );
});
