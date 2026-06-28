import { useEffect, useMemo, useState } from 'react';
import ReactFlow, { Controls, MiniMap, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import RSTabbar from 'Components/RSTabber';

import { SyncHistoryPipeLineGraphSkeleton } from 'Components/Skeleton/Skeleton';

import RSTooltip from 'Components/RSTooltip';
import { getUserCurrentFormatWithSeconds } from 'Utils/modules/dateTime';

const API_BASE_URL = 'https://ingapi.resul.team';
//const API_BASE_URL = 'http://ingapi.resul.team:5001';

// Drop millisecond/fractional-second precision from raw duration values like "1.150000", "1.15s", or "00:00:01.150".
const stripDurationMilliseconds = (value) => {
    if (value === null || value === undefined) return value;
    const raw = String(value).trim();
    if (!raw) return raw;
    if (raw.includes(':')) {
        return raw.replace(/\.\d+/g, '');
    }
    const match = raw.match(/^(\d+)(?:\.\d+)?(.*)$/);
    if (match) return `${match[1]}${match[2]}`;
    return raw;
};

const getStatusColor = (state) => {
    switch (state) {
        case 'success':
            return '#379904';
        case 'running':
            return '#99cc03';
        case 'failed':
            return '#F44336';
        case 'upstream_failed':
            return '#FF5722';
        case 'skipped':
            return '#9E9E9E';
        case 'up_for_retry':
            return '#FFC107';
        case 'up_for_reschedule':
            return '#9C27B0';
        case 'queued':
            return '#00BCD4';
        case 'scheduled':
            return '#673AB7';
        case 'deferred':
            return '#a3cccc';
        case 'removed':
            return '#795548';
        case 'restarting':
            return '#FF9800';
        default:
            return '#e2e2e2';
    }
};

const NodeLabel = ({ labelText }) => {
    return (
        <div
            style={{
                fontWeight: '600',
                fontSize: '14px',
                marginBottom: '0px',
                color: '#1e293b',
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}
        >
            {labelText}
        </div>
    );
};

const CustomNode = ({ data }) => {
    const borderColor = getStatusColor(data.state);
    const detailText = data?.detail || data?.details || data?.task?.detail || data?.task?.details || 'NA';
    const labelText = String(data?.label || 'NA');

    const formatDateTime = (date) => {
        if (!date) return 'NA';
        return getUserCurrentFormatWithSeconds(date)?.dateTimeFormat ?? '';
    };

    const tooltipContent = `
        <div style="min-width: 300px; max-width: 420px; text-align: left; font-size: 12px; line-height: 1.55; color: #f8fafc;">
            <div style="padding-bottom: 10px; border-bottom: ${data.task?.ERROR ? '1px solid rgba(148,163,184,0.35)' : 'none'};">
                <div style="display: grid; grid-template-columns: 116px 1fr; gap: 6px 10px; align-items: start;">
                    <span style="font-weight: 600; color: #cbd5e1;">Name</span>
                    <span style="word-break: break-word; color: #ffffff;">${labelText}</span>
                    <span style="font-weight: 600; color: #cbd5e1;">Start date & time</span>
                    <span style="word-break: break-word; color: #ffffff;">${formatDateTime(data.start_date)}</span>
                    <span style="font-weight: 600; color: #cbd5e1;">End date & time</span>
                    <span style="word-break: break-word; color: #ffffff;">${formatDateTime(data.task?.end_date)}</span>
                    <span style="font-weight: 600; color: #cbd5e1;">Detail</span>
                    <span style="word-break: break-word; color: #ffffff;">${detailText}</span>
                </div>
            </div>

            ${data.task?.ERROR
            ? `
                <div style="margin-top: 10px;">
                    <div style="margin-bottom: 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.2px;">
                        Error details
                    </div>
                    <div style="display: grid; grid-template-columns: 70px 1fr; gap: 6px 10px; align-items: start;">
                        <span style="font-weight: 600; color: #cbd5e1;">Type</span>
                        <span style="word-break: break-word; color: #ffffff;">${data.task.ERROR.exception_type || 'NA'}</span>
                        <span style="font-weight: 600; color: #cbd5e1;">Message</span>
                        <span style="word-break: break-word; color: #ffffff;">${data.task.ERROR.exception_message || 'NA'}</span>
                        <span style="font-weight: 600; color: #cbd5e1;">Function</span>
                        <span style="word-break: break-word; font-family: Consolas, monospace; color: #e2e8f0;">${data.task.ERROR.function || 'NA'}</span>
                        <span style="font-weight: 600; color: #cbd5e1;">File</span>
                        <span style="word-break: break-all; font-family: Consolas, monospace; color: #e2e8f0;">${data.task.ERROR.error_file || 'NA'}</span>
                    </div>
                </div>
                `
            : ''
        }
        </div>
    `;

    return (
        <RSTooltip
            customText={tooltipContent}
            position="top"
            innerContent={false}
            tooltipOverlayClass="syncHistoryNodeTooltip toolTipOverlayZindexCSS"
        >
            <div
                style={{
                    padding: '12px 15px 15px',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    width: '215px',
                    minWidth: '180px',
                    textAlign: 'left',
                    position: 'relative',
                    // border: `1px solid ${borderColor}`,
                }}
            >
                <Handle type="target" position={Position.Left} style={{ background: 'transparent', border: 'none' }} />

                <NodeLabel labelText={labelText} />

                <div style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column-reverse' }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: borderColor,
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: '500',
                            textTransform: 'capitalize',
                            lineHeight: '1.4',
                        }}
                    >
                        {data.state || 'Unknown'}
                    </div>

                    {data.duration && (
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>
                            Duration: {stripDurationMilliseconds(data.duration)}
                        </div>
                    )}
                </div>

                <Handle type="source" position={Position.Right} style={{ background: 'transparent', border: 'none' }} />
            </div>
        </RSTooltip>
    );
};

const nodeTypes = {
    custom: CustomNode,
};

const miniMapNodeColor = (node) => {
    return getStatusColor(node.data?.state);
};

const GraphAndLogs = ({ dagId, runId }) => {
    const [activeTab, setActiveTab] = useState('Graph');
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [graphError, setGraphError] = useState(false);

    useEffect(() => {
        let ignore = false;
        const ac = new AbortController();
        const timeoutId = setTimeout(() => ac.abort('timeout'), 45000);

        async function fetchGraphData() {
            if (!runId) return;
            setIsLoading(true);
            try {
                const url = `${API_BASE_URL}/drawGraph?dag_id=${encodeURIComponent(
                    dagId,
                )}&dag_run_id=${encodeURIComponent(runId)}`;
                const response = await fetch(url, { signal: ac.signal });
                if (!response.ok) throw new Error('Failed to fetch graph data');
                const json = await response.json();

                if (ignore || !json) return;

                if (json.nodes) {
                    let styledNodes = json.nodes.map((node) => ({
                        ...node,
                        data: {
                            ...node.data,
                            task: node.task, // Pass task details into data for CustomNode
                        },
                        type: 'custom', // Ensure we use our CustomNode
                        sourcePosition: Position.Right,
                        targetPosition: Position.Left,
                    }));

                    // Keep linear pipelines on a single horizontal row so straight edges stay perfectly horizontal.
                    const yPositions = styledNodes
                        .map((node) => node?.position?.y)
                        .filter((y) => Number.isFinite(y));

                    if (yPositions.length > 1) {
                        const minY = Math.min(...yPositions);
                        const maxY = Math.max(...yPositions);
                        const linearLayoutThreshold = 120;

                        if (maxY - minY <= linearLayoutThreshold) {
                            const medianY = [...yPositions].sort((a, b) => a - b)[Math.floor(yPositions.length / 2)];
                            styledNodes = styledNodes.map((node) => ({
                                ...node,
                                position: {
                                    ...node.position,
                                    y: medianY,
                                },
                            }));
                        }
                    }

                    setNodes(styledNodes);
                } else {
                    setNodes([]);
                }

                if (json.edges) {
                    const styledEdges = json.edges.map((edge) => ({
                        ...edge,
                        type: 'straight',
                        style: { stroke: '#b1b1b7', strokeWidth: 2 },
                    }));
                    setEdges(styledEdges);
                } else {
                    setEdges([]);
                }

                if (!json.nodes && !json.edges) {
                    setGraphError(true);
                } else {
                    setGraphError(false);
                }
            } catch (e) {
                if (ignore || e?.name === 'AbortError') return;
                setNodes([]);
                setEdges([]);
                setGraphError(true);
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }
        fetchGraphData();
        return () => {
            ignore = true;
            clearTimeout(timeoutId);
            ac.abort();
        };
    }, [dagId, runId]);

    // Tasks come from the drawGraph API nodes. We print each task one-by-one
    // in execution order (left-to-right by position.x, then by start_date).
    const orderedTaskNodes = useMemo(() => {
        if (!Array.isArray(nodes) || nodes.length === 0) return [];
        return [...nodes].sort((a, b) => {
            const ax = Number.isFinite(a?.position?.x) ? a.position.x : 0;
            const bx = Number.isFinite(b?.position?.x) ? b.position.x : 0;
            if (ax !== bx) return ax - bx;
            const aTime = a?.data?.start_date ? new Date(a?.data?.start_date).getTime() : 0;
            const bTime = b?.data?.start_date ? new Date(b?.data?.start_date).getTime() : 0;
            return aTime - bTime;
        });
    }, [nodes]);

    const renderTaskLogs = () => {
        if (orderedTaskNodes.length === 0) {
            return (
                <div className="text-center py-5" style={{ color: '#64748b' }}>
                    <i className="icon-file-text mb-3" style={{ fontSize: '24px', opacity: 0.5 }}></i>
                    <p className="mb-0">No logs or additional details found for this run.</p>
                </div>
            );
        }

        return (
            <ul className="logListCss css-scrollbar">
                {orderedTaskNodes.map((node, idx) => {
                    const task = node?.data?.task || node?.task || {};
                    return (
                        <li key={node?.id || idx} style={{ whiteSpace: 'normal', margin: 0, wordBreak: 'break-word', lineHeight:'1.8' }}>
                            {JSON.stringify(task)}
                        </li>
                    );
                })}
            </ul>
        );
    };

    const tabData = [
        {
            id: 1,
            text: 'Graph',
            disable: false,
            component: () => (
                <div>
                    {isLoading && <div className=''><SyncHistoryPipeLineGraphSkeleton isError={false} /></div>}
                    {!isLoading && graphError && (
                            <SyncHistoryPipeLineGraphSkeleton isError={true} />
                    )}

                    <div
                        id="jsonGraph"
                        className="col-xs-12 no-padding react-flow-static-container"
                        style={{ height: '600px', position: 'relative', display: (!isLoading && !graphError) ? 'block' : 'none' }}
                    >
                        {(!isLoading && !graphError) && (
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                nodeTypes={nodeTypes}
                                attributionPosition="bottom-right"
                                zoomOnScroll={false}
                                defaultViewport={{ x: 20, y: 300, zoom: 1 }}
                            >
                                <MiniMap nodeColor={miniMapNodeColor} nodeStrokeWidth={3} zoomable pannable />
                                <Controls />
                            </ReactFlow>
                        )}
                    </div> </div>
            ),
        },
        {
            id: 2,
            text: 'Logs',
            disable: false,
            component: () => (
                <div id="jsonDescription" className="col-xs-12 no-padding pt-3">
                    {renderTaskLogs()}
                </div>
            ),
        },
    ];

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
    };

    return (
        <div id="pipeline-table" className="clearfix">
            <style>
                {`
                    .syncHistoryNodeTooltip {
                        z-index: 10000 !important;
                    }
                    .syncHistoryNodeTooltip .tooltip-inner {
                        max-width: 420px !important;
                        width: max-content;
                        text-align: left;
                        border-radius: 8px;
                        padding: 10px 12px;
                    }
                    .react-flow__edge-path {
                        stroke-width: 2px;
                    }
                    .react-flow__node.react-flow__node-custom,
                    .react-flow__node .react-flow__node-custom {
                        padding: 0 !important;
                        background: transparent !important;
                    }
                    .inline-loader#loading,
                    .inline-loader.rsloading,
                    .inline-loader .loading {
                        position: absolute !important;
                        border-radius: 8px;
                    }
                `}
            </style>
            <div className="tabs-right-align pageSub_tab">
                <RSTabbar
                    defaultClass="col-md-2 tabTransparent"
                    dynamicTab="mb0 mini"
                    activeClass="active"
                    tabData={tabData}
                    className="rs-tabs row"
                    componentClassName="mt20"
                    defaultTab={0}
                    onTabChange={handleTabChange}
                />
            </div>
        </div>
    );
};

export default GraphAndLogs;
