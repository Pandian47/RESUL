import { useDrop } from 'react-dnd';
import { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, { ReactFlowProvider, addEdge, useNodesState, useEdgesState, Background, BackgroundVariant, useReactFlow, useUpdateNodeInternals } from 'reactflow';

import { useDispatch, useSelector } from 'react-redux';

import dagre from 'dagre';

import _mapKeys from 'lodash/mapKeys';
import _camelCase from 'lodash/camelCase';
import _cloneDeep from 'lodash/cloneDeep';
import _ from 'lodash';

import Placeholder from '../Placeholder';
import SourceItem from '../SourceItem';
import DynamicItem from '../SourceItem/DynamicItem';
import ChannelItem from '../ChannelItem';
import ActionItem from '../ActionItem';
import CustomEdge from '../EdgeLabel/EdgeLabel';
import SmoothStepEdge from '../EdgeLabel/SmoothStepEdge';
import AddonItem from '../AddonItem';
import SubSegmentItem from '../SubSegementItem/SubSegmentItem';
import GoalPlaceholder from '../Placeholder/GoalPlaceholder';
import GoalItem from '../GoalItem';
import CreateWorkFlowContext, { CreateWorkFlowOtherContext } from '../../context';
import { GenerateEdgeObject, buildCanvasDataSavePayload, isSameCanvasSaveData, serializeCanvasStateForAutoSave, UpdateEdgeObject } from '../../constant';
import { CanvasCollapseExpand, GenerateMiniMapPos } from './CanvasConst';
import {
    saveMdcCanvasData,
    updateCascadingSchedule,
} from 'Reducers/communication/createCommunication/Mdc/Canvas/request';
import { getSessionId } from 'Reducers/globalState/selector';

import 'reactflow/dist/style.css';
import useQueryParams from 'Hooks/useQueryParams';
import WindowNavigate, { CustomDragLayer } from './WindowNavigate';
import { updateMiniMapPos } from 'Reducers/communication/createCommunication/Mdc/Canvas/reducer';
import useOnlyDepChangeEffect from 'Hooks/useOnlyDepChangeEffect';

export const getLayoutedElements = (nodes, edges, direction = 'LR', canvasReference) => {
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
        return { nodes: [], edges: edges || [] };
    }

    if (!edges || !Array.isArray(edges)) {
        edges = [];
    }

    if (!canvasReference || !canvasReference.current) {
        return { nodes, edges };
    }

    if (nodes?.find((item) => item?.type === 'SubSegmentItem')) {
        if (!canvasReference?.current) return { nodes, edges };

        const isHorizontal = direction === 'LR';
        const canvasHeight = canvasReference.current.offsetHeight;
        const canvasMid = canvasHeight / 2;

        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setGraph({
            rankdir: direction,
            nodesep: 100,
            marginx: 30,
            marginy: 30,
        });
        dagreGraph.setDefaultEdgeLabel(() => ({}));

        const getNodeSize = (type) => (type === 'AddonItem' ? { width: 140, height: 80 } : { width: 220, height: 80 });

        nodes.forEach((node) => {
            const { width, height } = getNodeSize(node.type);
            dagreGraph.setNode(node.id, { width, height });
        });

        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target, { minlen: 1 });
        });

        dagre.layout(dagreGraph);

        let updatedNodes = nodes.map((node, index) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            const { width, height } = getNodeSize(node.type);
            const existingX = node?.position?.x;
            const existingY = node?.position?.y;
            const fallbackX = Number.isFinite(existingX) ? existingX : index * 200;
            const fallbackY = Number.isFinite(existingY) ? existingY : 100;

            if (
                !nodeWithPosition ||
                !Number.isFinite(nodeWithPosition.x) ||
                !Number.isFinite(nodeWithPosition.y)
            ) {
                return {
                    ...node,
                    position: { x: fallbackX, y: fallbackY },
                    targetPosition: isHorizontal ? 'left' : 'top',
                    sourcePosition: isHorizontal ? 'right' : 'bottom',
                };
            }

            return {
                ...node,
                position: {
                    x: Math.round(nodeWithPosition.x - width / 2),
                    y: Math.round(nodeWithPosition.y - height / 2 + canvasMid),
                },
                targetPosition: isHorizontal ? 'left' : 'top',
                sourcePosition: isHorizontal ? 'right' : 'bottom',
            };
        });

        return { nodes: updatedNodes, edges };
    }

    const dagreGraph = new dagre.graphlib.Graph();

    dagreGraph.setDefaultEdgeLabel(() => ({}));
    let nodeWidth = 150;
    const nodeHeight = 150;
    // Reset positions of nodes
    dagreGraph.nodes().forEach((node) => {
        const nodeInfo = dagreGraph.node(node);
        nodeInfo.x = 0; // Reset x-coordinate
        nodeInfo.y = 0; // Reset y-coordinate
    });

    const canvasElementHeight = canvasReference.current.offsetHeight;
    const canvasMidPosition = canvasElementHeight / 2;
    const isHorizontal = direction === 'LR';
    
    const nodesByParent = {};
    nodes.forEach((node) => {
        const parentId = node?.data?.parentWindowId;
        if (parentId) {
            if (!nodesByParent[parentId]) {
                nodesByParent[parentId] = [];
            }
            nodesByParent[parentId].push(node);
        }
    });
    
    const maxChildrenCount = Math.max(
        ...Object.values(nodesByParent).map((children) => children.length),
        1
    );
    
    const baseRankSep = 60; 
    let dynamicRankSep = baseRankSep;
    
    // Adjust spacing based on number of children for better alignment
    if (maxChildrenCount === 4) {
        dynamicRankSep = 100; // Increased spacing for 4 actions
    } else if (maxChildrenCount >= 5) {
        dynamicRankSep = 120; // Even more spacing for 5+ actions
    } else if (maxChildrenCount === 3) {
        dynamicRankSep = 80; // Slightly increased for 3 actions
    }
    
    const nodesep = 40; // Horizontal spacing between nodes in same rank
    const ranksep = dynamicRankSep; // Vertical spacing between ranks
    
    dagreGraph.setGraph({ 
        rankdir: direction,
        nodesep: nodesep,
        ranksep: ranksep,
        marginx: 30,
        marginy: 30,
    });

    nodes.forEach((node) => {
        // Safety check for node
        if (!node || !node.id) {
            return;
        }
        
        // nodeWidth = node.type === 'AddonItem' ? 100 : 150;
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight, x: 0, y: 0 });
    });

    edges.forEach((edge) => {
        // Safety check for edge
        if (!edge || !edge.source || !edge.target) {
            return;
        }

        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    // Get the dimensions of the graph
    const graphWidth = dagreGraph.graph().width;
    const graphHeight = dagreGraph.graph().height;

    // Assuming you have access to the page width and height
    //const pageWidth = /* Calculate page width */;
    const pageHeight = canvasElementHeight; /* Calculate page height */

    // Calculate the x-coordinate to align the graph with the left center of the page
    const leftCenterX = 0; // Align with the left edge
    const centerY = (pageHeight - graphHeight) / 2;

    // Update node positions with the calculated x and y coordinates
    dagreGraph.nodes().forEach((node) => {
        const nodeInfo = dagreGraph.node(node);

        // Safety check for nodeInfo
        if (nodeInfo && typeof nodeInfo.x === 'number' && typeof nodeInfo.y === 'number') {
            nodeInfo.x += leftCenterX;
            nodeInfo.y += centerY;
        } else {
        }
    });
    nodes.forEach((node, index) => {
        // Safety check for node and node.id
        if (!node || !node.id) {
            return;
        }

        const nodeWithPosition = dagreGraph.node(node.id);

        // Safety check for nodeWithPosition
        if (!nodeWithPosition) {
            // Provide default position for new nodes (like placeholders)
            node.position = { x: index * 200, y: 100 };
            node.targetPosition = isHorizontal ? 'left' : 'top';
            node.sourcePosition = isHorizontal ? 'right' : 'bottom';
            return;
        }

        node.targetPosition = isHorizontal ? 'left' : 'top';
        node.sourcePosition = isHorizontal ? 'right' : 'bottom';

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        // Dagre uses center-based coordinates, so we need to subtract half the node dimensions
        const finalX = nodeWithPosition.x ? Math.round(nodeWithPosition.x - nodeWidth / 2) : (index * 200);
        const finalY = nodeWithPosition.y ? Math.round(nodeWithPosition.y - nodeHeight / 2) : 100;

        node.position = {
            x: finalX,
            y: finalY
        };

        return node;
    });

    return { nodes, edges };
};

// const nodeTypes = {
//     Placeholder: Placeholder,
//     SourceItem: SourceItem,
//     DynamicItem: DynamicItem,
//     ChannelItem: ChannelItem,
//     ActionItem: ActionItem,
//     AddonItem: AddonItem,
//     GoalPlaceholder: GoalPlaceholder,
//     GoalItem: GoalItem,
// };
const nodeExtent = [
    [0, -9999999],
    [Infinity, Infinity],
];
const Flow = ({ wrapperWidth, canvasReference }) => {
    //  const { setViewport, zoomIn, zoomOut } = useReactFlow();

    const { setViewport, zoomIn, zoomOut, getZoom, zoomTo } = useReactFlow();
    const dispatch = useDispatch();
    const updateNodeInternals = useUpdateNodeInternals();
    const [campaignId, setCampaignId] = useState(0);
    const [isNodeClicked, setNodeClicked] = useState(false);
    const [fitViewConfig, setFitViewConfig] = useState({ minZoom: 0, maxZoom: 1, duration: 1000 });

    //    const { state: locationState } = useLocation();
    const locationState = useQueryParams('/communication') || {};
    //const { campaignId } = locationState;
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const { MiniMapPos } = useSelector(({ mdcCanvasFlowReducer }) => mdcCanvasFlowReducer);

    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);
    const { isAlign = false, setAlign } = useContext(CreateWorkFlowOtherContext);
    //console.log('get value from context',canvasState)
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [prevNodePositions, setPrevNodePositions] = useState({});
    // const [isAlign, setAlign] = useState(false);
    // console.log('@@@@isAlign: ', isAlign);
    const [isMdcLock, setMdcLock] = useState(false);
    const [isDefaultShow, setDefaultShow] = useState(
        canvasState?.Campaign?.MdcFlowConfig?.isShowScheduleTooltip ?? false,
    );
    const [miniMapCollapse, setMiniMapCollapse] = useState(false);

    const [defaultControlPos, setDefaultControlPos] = useState('top-right');
    const [zoomVal, setZoomPercentage] = useState(1);

    const [left, setLeft] = useState(10);
    const [top, setTop] = useState(10);
    const [isCurveLine, setIsCurveLine] = useState(!canvasState?.Campaign?.MdcFlowConfig?.isCurveLine);

    const [helperLines, setHelperLines] = useState({ vertical: null, horizontal: null });
    const SNAP_THRESHOLD = 15; // Increased for better visual feedback
    const alignGridCallRef = useRef(true);
    const prevNodeLengthRef = useRef(0);
    const currentNodeIdCollapseDetailRef = useRef({});
    const saveCanvasDebounceRef = useRef(null);
    const canvasStateRef = useRef(canvasState);
    const lastSavedCanvasDataRef = useRef('');

    useEffect(() => {
        canvasStateRef.current = canvasState;
    }, [canvasState]);

    useEffect(() => {
        lastSavedCanvasDataRef.current = '';
    }, [campaignId]);

    useEffect(() => {
        if (!canvasState?.nodeState?.length) return;

        const loadedSnapshot = serializeCanvasStateForAutoSave(canvasState);
        if (loadedSnapshot && !lastSavedCanvasDataRef.current) {
            lastSavedCanvasDataRef.current = loadedSnapshot;
        }
    }, [campaignId, canvasState?.MdcType, canvasState?.nodeState?.length]);

    useEffect(() => {
        if (MiniMapPos?.x && MiniMapPos?.y) {
            setLeft(MiniMapPos.x);
            setTop(MiniMapPos.y);
        }
    }, []);

    const nodeTypes = useMemo(
        () => ({
            Placeholder: Placeholder,
            SourceItem: SourceItem,
            DynamicItem: DynamicItem,
            ChannelItem: ChannelItem,
            ActionItem: ActionItem,
            AddonItem: AddonItem,
            GoalPlaceholder: GoalPlaceholder,
            GoalItem: GoalItem,
            SubSegmentItem: SubSegmentItem,
        }),
        [],
    );

    const edgeTypes = useMemo(() => {
        return {
            CustomEdge: canvasState?.Campaign?.MdcFlowConfig?.isCurveLine ? CustomEdge : SmoothStepEdge,
            default: CustomEdge,
        };
    }, [canvasState?.Campaign?.MdcFlowConfig?.isCurveLine]);
    useEffect(() => {
        if (localStorage.getItem('CONTROL_POS')) {
            let pos = localStorage.getItem('CONTROL_POS');
            setDefaultControlPos(pos);
        }
    }, []);
    useEffect(() => {
        if (!MiniMapPos.x) {
            let leftPos = wrapperWidth - 220;
            setLeft(leftPos);
        }
    }, [wrapperWidth]);
    const locationCampaignId = locationState?.campaignId || 0;
    useEffect(() => {
        setCampaignId((prev) => (prev === locationCampaignId ? prev : locationCampaignId));
    }, [locationCampaignId]);
    useEffect(() => {
        let { nodeState, edgeState } = canvasState;
        // console.log(nodeState)
        nodeState = nodeState.map((item, index) => {
            const x = item?.position?.x;
            const y = item?.position?.y;
            const position =
                Number.isFinite(x) && Number.isFinite(y)
                    ? item.position
                    : { x: Number.isFinite(x) ? x : index * 200, y: Number.isFinite(y) ? y : 100 };

            return {
                ...item,
                position,
                data: {
                    ...item.data,
                    CascadeUpdate: handleCascadeUpdate,
                    ToggleCollapse: handleCanvasCollapseExpand,
                    updateEdge: handleUpdateEdge,
                    alignGridCallRef: alignGridCallRef,
                },
            };
        });
        setNodes(nodeState);
        if (nodeState?.length > 1) {
            let edgeList = GenerateEdgeObject(canvasState);
            setEdges(edgeList);
            dispatchState({
                type: 'UPDATE_EDGES',
                payload: edgeList,
            });
        }
        // setDefaultShow(false);
    }, [canvasState?.nodeState]);

    const handleSaveMDC = useCallback(async () => {
        const currentCanvasState = canvasStateRef.current;
        if (!clientId || !campaignId || !currentCanvasState) return;

        if (isSameCanvasSaveData(lastSavedCanvasDataRef.current, currentCanvasState)) {
            return;
        }

        const saveCanvasPayload = buildCanvasDataSavePayload({
            userId,
            departmentId,
            clientId,
            campaignId,
            canvasState: currentCanvasState,
        });

        await dispatch(saveMdcCanvasData({ saveCanvasPayload }));
        lastSavedCanvasDataRef.current = serializeCanvasStateForAutoSave(currentCanvasState);
    }, [userId, departmentId, clientId, campaignId, dispatch]);

    const scheduleCanvasAutoSave = useCallback(() => {
        if (isSameCanvasSaveData(lastSavedCanvasDataRef.current, canvasStateRef.current)) {
            return;
        }

        if (saveCanvasDebounceRef.current) {
            clearTimeout(saveCanvasDebounceRef.current);
        }
        saveCanvasDebounceRef.current = setTimeout(() => {
            handleSaveMDC();
            saveCanvasDebounceRef.current = null;
        }, 400);
    }, [handleSaveMDC]);

    useEffect(() => {
        return () => {
            if (saveCanvasDebounceRef.current) {
                clearTimeout(saveCanvasDebounceRef.current);
            }
        };
    }, []);

    useOnlyDepChangeEffect(() => {
        scheduleCanvasAutoSave();
        if (canvasState['nodeState']?.length === 0 || canvasState['nodeState']?.length === 1) {
            handleFitView();
        }
    }, [serializeCanvasStateForAutoSave(canvasState)]);

    useEffect(() => {
        const cloneCanvasState = _.cloneDeep(canvasState);
        const disableNodeList = canvasState.disableNodeList || [];

        const updatedSubSegments = _.map(canvasState?.subSegment?.subSegmentList, (segment) => ({
            ...segment,
            isSubSegmentDisable: disableNodeList.includes(segment.id),
        }));

        const updateActiveChannels = (channels) => {
            return _.map(channels, (channel) => {
                const updated = {
                    ...channel,
                    isChannelDisable: disableNodeList.includes(channel.DomId),
                };

                if (_.isArray(channel.activeChannel) && channel.activeChannel.length > 0) {
                    updated.activeChannel = updateActiveChannels(channel.activeChannel);
                }

                return updated;
            });
        };

        const originalChannels = _.get(cloneCanvasState, 'Campaign.CanvasChannel.activeChannel', []);
        const updatedChannels = updateActiveChannels(originalChannels);

        const updatedCanvasState = {
            ...cloneCanvasState,
            Campaign: {
                ...cloneCanvasState.Campaign,
                CanvasChannel: {
                    ...cloneCanvasState.Campaign.CanvasChannel,
                    activeChannel: updatedChannels,
                },
            },
            subSegment: {
                ...cloneCanvasState.subSegment,
                subSegmentList: updatedSubSegments,
            },
        };

        dispatchState({
            type: 'UPDATE_CANVASE_STATE',
            payload: updatedCanvasState,
        });
    }, [JSON.stringify(canvasState.disableNodeList)]);

    const handleCascadeUpdate = (data) => {
        let updateDayTimeList = data.map((item) => _mapKeys(item, (v, k) => _camelCase(k)));
        const payload = { userId, departmentId, clientId, campaignId, channels: [...updateDayTimeList] };

        dispatch(updateCascadingSchedule({ payload }));
    };

    const handleUpdateEdge = (data) => {
        if (
            (data?.['parent']['ChannelDetailType'] === 'LP1' || data?.['parent']['ChannelDetailType'] === 'LP2') &&
            data?.value?.actionOption?.value === 22
        ) {
            let edge = UpdateEdgeObject(edges, data);
            setEdges(edge);
        }
    };
    // const handleCanvasCollapseExpand = (isCollapse, currentNodeId) => {
    //     const rslt = CanvasCollapseExpand(currentNodeId, canvasState);
    //     console.log(rslt, canvasState);
    //     let { nodeState, edgeState } = canvasState;
    //     nodeState = nodeState.map((item) => {
    //         return {
    //             ...item,
    //             data: {
    //                 ...item.data,
    //                 CascadeUpdate: handleCascadeUpdate,
    //                 ToggleCollapse: handleCanvasCollapseExpand,
    //                 updateEdge: handleUpdateEdge,
    //             },
    //         };
    //     });
    //     let cloneNodes = _cloneDeep(nodeState);
    //     let cloneEdges = _cloneDeep(GenerateEdgeObject(canvasState));

    //     if (!isCollapse) {
    //         if (rslt?.length) {
    //             if (canvasState['dataSource']['DomId'] === currentNodeId) {
    //                 let childSourceEdgeIndex = cloneEdges.findIndex((edge) => edge.source === currentNodeId);
    //                 if (childSourceEdgeIndex >= 0) cloneEdges[childSourceEdgeIndex]['hidden'] = true;
    //             }
    //             rslt.forEach((nodeId) => {
    //                 let childNodeIndex = cloneNodes.findIndex((node) => node.id === nodeId);

    //                 if (childNodeIndex >= 0) cloneNodes[childNodeIndex]['hidden'] = true;

    //                 let childEdgeIndex = cloneEdges.findIndex((edge) => edge.target === nodeId);

    //                 if (childEdgeIndex >= 0) cloneEdges[childEdgeIndex]['hidden'] = true;
    //             });

    //             setNodes(cloneNodes);
    //             setEdges(cloneEdges);
    //         }
    //     } else {
    //         if (rslt?.length) {
    //             rslt.forEach((nodeId) => {
    //                 let childNodeIndex = cloneNodes.findIndex((node) => node.id === nodeId);

    //                 if (childNodeIndex >= 0) cloneNodes[childNodeIndex]['hidden'] = false;

    //                 let childEdgeIndex = cloneEdges.findIndex((edge) => edge.target === nodeId);

    //                 if (childEdgeIndex >= 0) cloneEdges[childEdgeIndex]['hidden'] = false;
    //             });

    //             setNodes(cloneNodes);
    //             setEdges(cloneEdges);
    //         }
    //     }
    // };

    const handleCanvasCollapseExpand = (isCollapse, currentNodeId) => {
        const currentNodeIdCollapseDetail = currentNodeIdCollapseDetailRef.current;
        const rslt = CanvasCollapseExpand(currentNodeId, canvasState);
        currentNodeIdCollapseDetail[currentNodeId] = rslt?.filter(Boolean);

        let { nodeState } = canvasState;
        let hiddenNodeList = [];
        let nonHiddenNodeList = [];

        if (isCollapse) {
            Object.entries(currentNodeIdCollapseDetail).forEach(([key, value]) => {
                key === currentNodeId ? nonHiddenNodeList.push(...value) : hiddenNodeList.push(...value);
            });

            if (canvasState?.dataSource?.isSubsegmentJoureny && canvasState?.dataSource?.DomId === currentNodeId) {
                canvasState?.subSegment.subSegmentList?.forEach((segment) => {
                    nonHiddenNodeList.push(segment.id);
                });
            }

            currentNodeIdCollapseDetail[currentNodeId] = [];
        } else {
            hiddenNodeList.push(...Object.values(currentNodeIdCollapseDetail).flat());

            if (canvasState?.dataSource?.isSubsegmentJoureny && canvasState?.dataSource?.DomId === currentNodeId) {
                canvasState?.subSegment.subSegmentList?.forEach((segment) => {
                    hiddenNodeList.push(segment.id);
                });
            }
        }
        let cloneNodes = _cloneDeep(nodeState).map((node) => ({
            ...node,
            hidden: hiddenNodeList.includes(node.id),
            data: {
                ...node.data,
                CascadeUpdate: handleCascadeUpdate,
                ToggleCollapse: handleCanvasCollapseExpand,
                updateEdge: handleUpdateEdge,
            },
        }));

        let cloneEdges = _cloneDeep(GenerateEdgeObject(canvasState)).map((edge) => ({
            ...edge,
            hidden: hiddenNodeList.includes(edge.target),
        }));
        setNodes(cloneNodes);
        setEdges(cloneEdges);
    };
    const handleNodeDrag = (event, node) => {
        const {
            position: { x, y },
        } = node;
    };

    const onNodeDrag = useCallback(
        (event, node) => {
            // Get all other nodes
            const otherNodes = nodes.filter((n) => n.id !== node.id);

            let verticalLine = null;
            let horizontalLine = null;

            // Check alignment with other nodes
            otherNodes.forEach((otherNode) => {
                // Check vertical alignment (x-axis)
                if (Math.abs(node.position.x - otherNode.position.x) < SNAP_THRESHOLD) {
                    verticalLine = {
                        x: otherNode.position.x,
                        start: Math.min(node.position.y, otherNode.position.y),
                        end: Math.max(
                            node.position.y + (node.height || 0),
                            otherNode.position.y + (otherNode.height || 0),
                        ),
                    };
                }

                // Check horizontal alignment (y-axis)
                if (Math.abs(node.position.y - otherNode.position.y) < SNAP_THRESHOLD) {
                    horizontalLine = {
                        y: otherNode.position.y,
                        start: Math.min(node.position.x, otherNode.position.x),
                        end: Math.max(
                            node.position.x + (node.width || 0),
                            otherNode.position.x + (otherNode.width || 0),
                        ),
                    };
                }
            });

            setHelperLines({ vertical: verticalLine, horizontal: horizontalLine });
        },
        [nodes],
    );
    const onNodeDragStart = useCallback((_, node) => {
        setPrevNodePositions((prevPositions) => ({
            ...prevPositions,
            [node.id]: { x: node.position.x, y: node.position.y },
        }));
    }, []);

    const onNodeDragStop = useCallback(
        (_, node) => {
            const { id: currentWindowId, position, type: nodeType } = node;
            const prevPosition = prevNodePositions[node.id];
            if (prevPosition.x !== position?.x || prevPosition.y !== position?.y) {

                dispatchState({
                    type: 'UPDATE_NODE_POSTION',
                    payload: { currentWindowId, position, nodeType },
                });
            }
            setHelperLines({ vertical: null, horizontal: null });
        },
        [prevNodePositions],
    );

    const handleNodeDragStop = (event, node, nodes) => {
        if (!isNodeClicked) {
            const { id: currentWindowId, position, type: nodeType } = node;
            let prevNode = nodes.filter((item) => item.id === currentWindowId);
            if (prevNode?.[0]?.position.x !== position?.x || prevNode?.[0]?.position.y !== position?.y) {
                dispatchState({
                    type: 'UPDATE_NODE_POSTION',
                    payload: { currentWindowId, position, nodeType },
                });
            }
        }
        setNodeClicked(false);
    };

    const handleNodeClick = useCallback((event, node, edge) => {
        let { nodeState, edgeState } = canvasState;
        nodeState = nodeState.map((item) => {
            return {
                ...item,
                data: {
                    ...item.data,
                    CascadeUpdate: handleCascadeUpdate,
                    ToggleCollapse: handleCanvasCollapseExpand,
                    updateEdge: handleUpdateEdge,
                },
            };
        });
        let cloneNodes = _cloneDeep(nodeState);
        if (event.target.classList.contains('channelActionMeduDot')) {
            cloneNodes = cloneNodes.map((item) => {
                return item.id === node.id
                    ? { ...item, data: { ...item.data, disableRest: false } }
                    : { ...item, data: { ...item.data, disableRest: true } };
            });

            setNodes(cloneNodes);
        } else {
            cloneNodes = cloneNodes.map((item) => {
                return { ...item, data: { ...item.data, disableRest: false } };
            });
            setNodes(cloneNodes);
        }
    });

    const handleSelectionDragStop = (event, nodes) => {
        let multiNode = nodes.map((node) => {
            const { id: currentWindowId, position, type: nodeType } = node;
            return { currentWindowId, position, nodeType };
        });

        if (multiNode?.length) {
            dispatchState({
                type: 'UPDATE_MULTI_NODE_POSTION',
                payload: multiNode,
            });
        }
    };
    const onLayout = useCallback(
        ({ direction, canvasReference }) => {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                nodes,
                edges,
                direction,
                canvasReference,
            );

            // setNodes([...layoutedNodes]);
            // setEdges([...layoutedEdges]);
            dispatchState({
                type: 'UPDATE_GRID_ALIGNMENT_POSTION',
                payload: { layoutedNodes, layoutedEdges },
            });
        },
        [nodes, edges],
    );
    useEffect(() => {
        if (isAlign) {
            onLayout({ direction: 'LR', canvasReference: canvasReference });
            setAlign(false);
        }
    }, [isAlign]);
    const handleDefaultActionInfo = () => {
        let cloneEdges = _cloneDeep(edges);

        if (!isDefaultShow) {
            cloneEdges = cloneEdges.map((item) => {
                if (
                    item.hasOwnProperty('data') &&
                    item.data.hasOwnProperty('endLabel') &&
                    Object.keys(item.data.endLabel)?.length
                ) {
                    return { ...item, data: { ...item.data, defaultShow: true } };
                }
                return item;
            });
        } else {
            cloneEdges = cloneEdges.map((item) => {
                if (
                    item.hasOwnProperty('data') &&
                    item.data.hasOwnProperty('endLabel') &&
                    Object.keys(item.data.endLabel)?.length
                ) {
                    return { ...item, data: { ...item.data, defaultShow: false } };
                }
                return item;
            });
        }
        const updatedCanvasState = {
            ...canvasState,
            Campaign: {
                ...canvasState.Campaign,
                MdcFlowConfig: {
                    ...canvasState.Campaign.MdcFlowConfig,
                    isShowScheduleTooltip: !isDefaultShow,
                },
            },
        };

        dispatchState({
            type: 'UPDATE_CANVASE_STATE',
            payload: updatedCanvasState,
        });

        setDefaultShow(!isDefaultShow);
        setEdges(cloneEdges);
    };
    const handleFitView = useCallback(() => {
        setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 1000 });
    }, [setViewport]);

    useEffect(() => {
        if (canvasState?.nodeState?.length && alignGridCallRef.current) {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                canvasState?.nodeState,
                canvasState?.edgeState,
                'LR',
                canvasReference,
            );
            dispatchState({
                type: 'UPDATE_GRID_ALIGNMENT_POSTION',
                payload: { layoutedNodes, layoutedEdges },
            });
            alignGridCallRef.current = false;
        }
    }, [canvasState?.nodeState, alignGridCallRef]);

    useEffect(() => {
        const currentLength = canvasState?.nodeState?.length ?? 0;
        const prevLength = prevNodeLengthRef.current;
        const isNodeRemoval = currentLength < prevLength;

        if (
            canvasState?.MdcType === 'RecursivelyTraverse' &&
            currentLength > 0 &&
            !alignGridCallRef.current &&
            !isNodeRemoval &&
            currentLength > prevLength
        ) {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                canvasState?.nodeState,
                canvasState?.edgeState,
                'LR',
                canvasReference,
            );
            if (layoutedNodes && layoutedNodes.length > 0) {
                dispatchState({
                    type: 'UPDATE_GRID_ALIGNMENT_POSTION',
                    payload: { layoutedNodes, layoutedEdges },
                });
            }
        }

        prevNodeLengthRef.current = currentLength;
    }, [canvasState?.MdcType, canvasState?.nodeState?.length]);

    const [, drop] = useDrop(
        () => ({
            accept: 'd',
            drop(item, monitor) {
                const delta = monitor.getDifferenceFromInitialOffset();
                const left = Math.round(item.left + delta.x);
                const top = Math.round(item.top + delta.y);
                const { x, y } = GenerateMiniMapPos({ left, top });
                const payload = { x, y };
                dispatch(updateMiniMapPos(payload));
                setLeft(x);
                setTop(y);
                return undefined;
            },
        }),
        [],
    );
    const handlePanceScroll = (event) => {
        // onWheelCapture = { handlePanceScroll };
    };
    const handleEdgeTypes = () => {
        const updatedCanvasState = {
            ...canvasState,
            Campaign: {
                ...canvasState.Campaign,
                MdcFlowConfig: {
                    ...canvasState.Campaign.MdcFlowConfig,
                    isCurveLine: !canvasState?.Campaign?.MdcFlowConfig?.isCurveLine,
                },
            },
        };

        dispatchState({
            type: 'UPDATE_CANVASE_STATE',
            payload: updatedCanvasState,
        });
        setIsCurveLine(!canvasState?.Campaign?.MdcFlowConfig?.isCurveLine);
    };
    const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params }, eds)), []);

    return (
        <>
            <div style={{ height: '100%', width: '100%' }}>
                <ReactFlow
                    ref={drop}
                    maxZoom={500}
                    minZoom={0.25}
                    nodesConnectable={true}
                    elementsSelectable={true}
                    nodesDraggable={true}
                    nodeTypes={nodeTypes}
                    nodes={nodes}
                    edges={edges}
                    onConnect={onConnect}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeDrag={onNodeDrag}
                    onNodeDragStart={onNodeDragStart}
                    onNodeDragStop={onNodeDragStop}
                    edgeTypes={edgeTypes}
                    deleteKeyCode={null}
                    snapToGrid={true}
                    snapGrid={[10, 10]} // Optimized grid size for better node alignment
                    zoomOnPinch={false}
                    zoomOnDoubleClick={false}
                    zoomOnScroll={false}
                    panOnScroll={true}
                    panOnScrollMode={'vertical'}
                    panOnDrag={true}
                    selectionOnDrag={true}
                    onSelectionDragStop={handleSelectionDragStop}
                    autoPanOnNodeDrag={true}
                    nodeExtent={nodeExtent}
                    proOptions={{ hideAttribution: true }}
                    disableKeyboardA11y={false}
                    nodesFocusable={true}
                    // Optimized connection line styling
                    connectionLineStyle={{
                        stroke: '#0096fd',
                        strokeWidth: 1.5,
                        strokeDasharray: '3,3',
                        opacity: 0.7,
                    }}
                    connectionMode={'loose'}
                    // Better edge routing
                    defaultEdgeOptions={{
                        type: 'smoothstep',
                        style: { strokeWidth: 2, stroke: '#0096fd' },
                        animated: false,
                    }}
                    className={
                        isMdcLock === true
                            ? 'mdc-canvas-locked overflow-x-auto css-scrollbar'
                            : 'mdc-canvas-no-lock overflow-x-auto css-scrollbar'
                    }
                // connectionLineStyle={{ color: '#004fdf', width: 100 }}
                // connectionMode={'loose'}
                // onPaneClick={handlePanceScroll}
                //onPaneScroll={handlePanceScroll()}
                >
                    <Background id="1" gap={22} color="#009dbf" variant={BackgroundVariant.Dots} />
                    <svg
                        className="helper-lines"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            pointerEvents: 'none',
                            zIndex: 1000,
                        }}
                    >
                        {helperLines.vertical && (
                            <line
                                x1={helperLines.vertical.x}
                                y1={helperLines.vertical.start}
                                x2={helperLines.vertical.x}
                                y2={helperLines.vertical.end}
                                stroke="#0096fd"
                                strokeWidth={2}
                                strokeDasharray="8,4"
                                opacity={0.8}
                            />
                        )}
                        {helperLines.horizontal && (
                            <line
                                x1={helperLines.horizontal.start}
                                y1={helperLines.horizontal.y}
                                x2={helperLines.horizontal.end}
                                y2={helperLines.horizontal.y}
                                stroke="#0096fd"
                                strokeWidth={2}
                                strokeDasharray="8,4"
                                opacity={0.8}
                            />
                        )}
                    </svg>
                </ReactFlow>

                <WindowNavigate
                    handleEdgeTypes={handleEdgeTypes}
                    handleFitView={handleFitView}
                    handleDefaultActionInfo={handleDefaultActionInfo}
                    lockStatus={isMdcLock}
                    toggleMdcLock={() => {
                        setMdcLock(!isMdcLock);
                    }}
                    zoomIn={() => {
                        //zoomIn({ duration: 800 });
                        let size = getZoom();
                        // size = ClosestDivisibleBy5(size);
                        if (size >= 1 && size < 1.1) {
                            size = size + 0.1;
                        } else {
                            size = size + 0.25;
                        }

                        size = Number.parseFloat(size).toFixed(1);
                        if (size > 2) size = 2;
                        if (size <= 2) {
                            zoomTo(size, { duration: 1000 });
                            setZoomPercentage(size);
                        }
                    }}
                    zoomOut={() => {
                        // zoomOut({ duration: 800 });
                        let size = getZoom();
                        // size = ClosestDivisibleBy5(size);
                        if (size > 1) size = size - 0.25;
                        else size = size - 0.1;
                        size = Number.parseFloat(size).toFixed(1);
                        if (size < 0.25) size = 0.25;
                        if (size >= 0.25) {
                            zoomTo(size, { duration: 1000 });
                            setZoomPercentage(size);
                        }
                    }}
                    left={left}
                    top={top}
                    setZoom={(val) => {
                        //zoomTo({ zoomLevel: val, options: { duration: 800 } });
                        setViewport({ x: 100, y: 100, zoom: val });
                    }}
                    zoomVal={zoomVal}
                    alignToGrid={() => {
                        setAlign(true);
                    }}
                    isDefaultShow={canvasState?.Campaign?.MdcFlowConfig?.isShowScheduleTooltip ?? false}
                    isCollapse={miniMapCollapse}
                    updateMiniMapCollapseState={(val) => {
                        setMiniMapCollapse(val);
                    }}
                    isCurveLine={!canvasState?.Campaign?.MdcFlowConfig?.isCurveLine}
                    wrapperWidth={wrapperWidth}
                />
                <CustomDragLayer>
                    <WindowNavigate isCollapse={miniMapCollapse} wrapperWidth={wrapperWidth} />
                </CustomDragLayer>
            </div>
        </>
    );
};

const Canvas = ({ canvasReference }) => {
    const reactFlowWrapper = useRef(null);
    const [wrapperWidth, setWidth] = useState(0);
    const handleResize = () => {
        setWidth(reactFlowWrapper.current.offsetWidth);
    };
    useEffect(() => {
        setWidth(reactFlowWrapper.current.offsetWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <ReactFlowProvider>
            <div ref={reactFlowWrapper} className="wrapper">
                <Flow wrapperWidth={wrapperWidth} canvasReference={canvasReference} />
            </div>
        </ReactFlowProvider>
    );
};
export default memo(Canvas);
