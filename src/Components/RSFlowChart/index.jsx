import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import ReactFlow, {
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
    ControlButton,
    Controls,
} from 'reactflow';
import 'reactflow/dist/base.css';
import './style.css';
import BazierEdge from './BazierEdge';
import CustomNode from './CustomNode';
import { chartDataConstructor, RenderZoomSize } from './Constants';
import RSTooltip from 'Components/RSTooltip';
const nodeTypes = {
    customNode: CustomNode,
};
const RSFlowChart = ({ chartData = {}, actionMenus = [], onEdgeClick = () => {} }) => {
    const [nodes, setNodes] = useNodesState([]);
    const [edges, setEdges] = useEdgesState([]);
    const containerRef = useRef(null);

    const { setViewport, fitView, zoomIn, zoomOut, getZoom, zoomTo } = useReactFlow();

    const edgeTypes = useMemo(
        () => ({
            // buttonedge: (props) => ButtonEdge(props, actionMenus, onEdgeClick),
            BazierEdge: (props) => BazierEdge(props, actionMenus, onEdgeClick),
        }),
        [],
    );

    useEffect(() => {
        const { nodesDat, edgesDat } = chartDataConstructor(chartData);
        setNodes(nodesDat);
        setEdges(edgesDat);
    }, [chartData]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 0);
        }
    }, [nodes, edges]);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, type: 'buttonedge' }, eds)),
        [],
    );

    useEffect(() => {
        const zoomSize = RenderZoomSize(chartData);
        setViewport({ x: 20, y: 0, zoom: zoomSize }, { duration: 1000 });
    }, [setViewport]);
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e) => {
            // If Ctrl key is pressed, handle zooming
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                e.stopPropagation();
                
                const deltaY = -e.deltaY;
                const currentZoom = getZoom();
                const zoomIntensity = 0.1;
                
                if (deltaY > 0) {
                    // Zoom in
                    const newZoom = Math.min(currentZoom + zoomIntensity, 2); // Max zoom 2x
                    zoomTo(newZoom, { duration: 100 });
                } else {
                    // Zoom out
                    const newZoom = Math.max(currentZoom - zoomIntensity, 0.1); // Min zoom 0.1x
                    zoomTo(newZoom, { duration: 100 });
                }
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            const deltaY = -e.deltaY;
            container.scrollTop += deltaY * 0.5; // Adjust sensitivity as needed
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        
        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, [getZoom, zoomTo]);

    // Improved zoom handlers with bounds checking
    const handleZoomIn = useCallback(() => {
        const currentZoom = getZoom();
        const newZoom = Math.min(currentZoom + 0.2, 2); // Max zoom 2x
        zoomTo(newZoom, { duration: 300 });
    }, [getZoom, zoomTo]);

    const handleZoomOut = useCallback(() => {
        const currentZoom = getZoom();
        const newZoom = Math.max(currentZoom - 0.2, 0.1); // Min zoom 0.1x
        zoomTo(newZoom, { duration: 300 });
    }, [getZoom, zoomTo]);

    const handleFitView = useCallback(() => {
        fitView({ duration: 500, padding: 0.1 });
    }, [fitView]);

    return (
        <div
            ref={containerRef}
            className="position-relative reactFlowContainer css-scrollbar"
            style={{
                height: '415px',
                overflow: 'auto',
            }}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onConnect={onConnect}
                edgeTypes={edgeTypes}
                nodeTypes={nodeTypes}
                className='left100'
                // onNodesChange={onNodesChange}
                //  onEdgesChange={onEdgesChange}
                disableKeyboardA11y={true}
                autoPanOnNodeDrag={false}
                panOnDrag={true}
                panOnScroll={false}
                zoomOnScroll={true}  // Enable zoom on scroll
                zoomOnPinch={true}   // Enable zoom on pinch
                zoomOnDoubleClick={true}  // Enable zoom on double click
                preventScrolling={false}  // Allow scroll events to be processed
                nodesConnectable={false}
                nodesFocusable={false}
                proOptions={{ hideAttribution: true }}
                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                minZoom={0.1}  // Set minimum zoom level
                maxZoom={2}    // Set maximum zoom level
            ></ReactFlow>
            <Controls
                showZoom={false}
                showFitView={false}
                showInteractive={false}
                position="bottom-right"
                className="rsFlowChartControlsContainer"
            >
                <ControlButton
                    onClick={handleZoomIn}
                    className="rsFlowChartControlsZoomIn"
                >
                    <RSTooltip text={'Zoom in'} position="bottom">
                        <i className="icon-rs-zoom-plus-medium icon-md color-primary-blue"></i>
                    </RSTooltip>
                </ControlButton>

                <ControlButton
                    onClick={handleZoomOut}
                    className="rsFlowChartControlsZoomOut"
                >
                    <RSTooltip text={'Zoom out'} position="bottom">
                        <i className="icon-rs-zoom-minus-medium icon-md color-primary-blue"></i>
                    </RSTooltip>
                </ControlButton>

                <ControlButton
                    onClick={handleFitView}
                    className="rsFlowChartControlsFitWindow"
                >
                    <RSTooltip text={'Fit view'} position="bottom">
                        <i className="icon-rs-window-fit-medium icon-md color-primary-blue"></i>
                    </RSTooltip>
                </ControlButton>
            </Controls>
        </div>
    );
};

RSFlowChart.propTypes = {
    chartData: PropTypes.object.isRequired,
    actionMenus: PropTypes.array,
    onEdgeClick: PropTypes.func,
};

const FlowWithProvider = (props) => {
    // console.log('props', props);
    return (
        <ReactFlowProvider>
            <RSFlowChart {...props} />
        </ReactFlowProvider>
    );
};

export default memo(FlowWithProvider);
