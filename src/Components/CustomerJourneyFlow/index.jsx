import { memo, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
    Controls,
    ControlButton,
    useReactFlow,
    MarkerType,
} from 'reactflow';
import PropTypes from 'prop-types';
import 'reactflow/dist/base.css';

import ChannelNode from './ChannelNode';
import PageNode from './PageNode';
import GoalNode from './GoalNode';
import HeaderNode from './HeaderNode';
import DashedEdge from './DashedEdge';
import { initialNodes, initialEdges, transformApiDataToFlow } from './constants';
import RSTooltip from 'Components/RSTooltip';

import './style.scss';

const nodeTypes = {
    channelNode: ChannelNode,
    pageNode: PageNode,
    goalNode: GoalNode,
    headerNode: HeaderNode,
};

const edgeTypes = {
    dashedEdge: DashedEdge,
};

// Add arrow markers to edges
const processEdges = (edges) => {
    return edges.map((edge) => ({
        ...edge,
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 12,
            height: 12,
            color: '#9E9E9E',
        },
    }));
};

const CustomerJourneyFlow = ({ nodes: propNodes, edges: propEdges, data }) => {
    // If data prop is provided, transform it to nodes and edges
    const { nodes: transformedNodes, edges: transformedEdges } = useMemo(() => {
        if (data) {
            const result = transformApiDataToFlow(data);
            return result;
        }
        return { nodes: null, edges: null };
    }, [data]);

    const inputNodes = transformedNodes || propNodes || initialNodes;
    const inputEdges = transformedEdges || propEdges || initialEdges;

    const processedEdges = useMemo(() => processEdges(inputEdges), [inputEdges]);

    const [nodes, setNodes, onNodesChange] = useNodesState(inputNodes || []);
    const [edges, setEdges, onEdgesChange] = useEdgesState(processedEdges || []);
    const { fitView, getZoom, zoomTo } = useReactFlow();

    // Update nodes and edges when props change
    useEffect(() => {
        if (inputNodes && inputNodes.length > 0) {
            setNodes(inputNodes);
        }
        if (inputEdges && inputEdges.length > 0) {
            setEdges(processEdges(inputEdges));
        }
    }, [inputNodes, inputEdges, setNodes, setEdges]);

    // Fit view after nodes and edges are updated
    useEffect(() => {
        if (nodes && nodes.length > 0 && edges && edges.length > 0) {
            setTimeout(() => {
                fitView({ duration: 0, padding: 0.2 });
            }, 100);
        }
    }, [nodes, edges, fitView]);

    const handleZoomIn = useCallback(() => {
        const currentZoom = getZoom();
        const newZoom = Math.min(currentZoom + 0.2, 2);
        zoomTo(newZoom, { duration: 300 });
    }, [getZoom, zoomTo]);

    const handleZoomOut = useCallback(() => {
        const currentZoom = getZoom();
        const newZoom = Math.max(currentZoom - 0.2, 0.3);
        zoomTo(newZoom, { duration: 300 });
    }, [getZoom, zoomTo]);

    const handleFitView = useCallback(() => {
        fitView({ duration: 500, padding: 0.2 });
    }, [fitView]);

    const proOptions = useMemo(() => ({ hideAttribution: true }), []);

    return (
        <div className="customer-journey-flow-container" style={{ width: '100%', height: '500px', minHeight: '400px', position: 'relative' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                proOptions={proOptions}
                minZoom={0.3}
                maxZoom={2}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnDrag
                zoomOnScroll
                zoomOnPinch
                defaultEdgeOptions={{
                    type: 'dashedEdge',
                }}
            >
                <Controls
                    showZoom={false}
                    showFitView={false}
                    showInteractive={false}
                    position="bottom-right"
                    className="journey-flow-controls"
                >
                    <ControlButton onClick={handleZoomIn} className="journey-control-btn">
                        <RSTooltip text="Zoom in" position="top">
                            <i className="icon-rs-zoom-plus-medium icon-md color-primary-blue" />
                        </RSTooltip>
                    </ControlButton>
                    <ControlButton onClick={handleZoomOut} className="journey-control-btn">
                        <RSTooltip text="Zoom out" position="top">
                            <i className="icon-rs-zoom-minus-medium icon-md color-primary-blue" />
                        </RSTooltip>
                    </ControlButton>
                    <ControlButton onClick={handleFitView} className="journey-control-btn">
                        <RSTooltip text="Fit view" position="top">
                            <i className="icon-rs-window-fit-medium icon-md color-primary-blue" />
                        </RSTooltip>
                    </ControlButton>
                </Controls>
            </ReactFlow>
        </div>
    );
};

CustomerJourneyFlow.propTypes = {
    nodes: PropTypes.array,
    edges: PropTypes.array,
    data: PropTypes.shape({
        dimensions: PropTypes.array,
        step_summary: PropTypes.array,
    }),
};

const CustomerJourneyFlowWithProvider = (props) => {
    return (
        <ReactFlowProvider>
            <CustomerJourneyFlow {...props} />
        </ReactFlowProvider>
    );
};

export default memo(CustomerJourneyFlowWithProvider);
