import { useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
    Controls,
    Handle,
    Position,
    BaseEdge,
    Background,
    BackgroundVariant,
    getSmoothStepPath
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';

import { Building } from 'Assets/Images';

const nodeWidth = 280;
const nodeHeight = 96;

const BRANCH = { GHQ: 1, RHQ: 2, LOC: 3 };

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const toNum = (value) => (value == null || value === '' ? null : Number(value));

const getLogoSrc = (logoPath) => {
    if (!logoPath) return null;
    if (String(logoPath).startsWith('data:')) return logoPath;
    return `data:image/jpeg;base64,${logoPath}`;
};

const getLayoutedElements = (nodes, edges, layout = {}) => {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({
        rankdir: 'TB',
        nodesep: layout.nodesep ?? 56,
        ranksep: layout.ranksep ?? 110,
        marginx: layout.marginx ?? 80,
        marginy: layout.marginy ?? 60
    });

    nodes.forEach((n) => g.setNode(n.id, { width: nodeWidth, height: nodeHeight }));
    edges.forEach((e) => g.setEdge(e.source, e.target));
    dagre.layout(g);

    return {
        nodes: nodes.map((n) => {
            const { x, y } = g.node(n.id);
            return {
                ...n,
                targetPosition: Position.Top,
                sourcePosition: Position.Bottom,
                position: { x: x - nodeWidth / 2, y: y - nodeHeight / 2 }
            };
        }),
        edges
    };
};

const OrgChartEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition
}) => {
    const [path] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: 20
    });

    return (
        <BaseEdge
            id={id}
            path={path}
            style={{
                stroke: '#90caf9',
                strokeWidth: 2,
                strokeLinecap: 'round',
                strokeLinejoin: 'round'
            }}
        />
    );
};

const edgeTypes = { curved: OrgChartEdge };

const CompanyLogo = ({ logoPath, typeClass }) => {
    const initialSrc = getLogoSrc(logoPath);
    const [imgSrc, setImgSrc] = useState(initialSrc || Building);
    const isCircle = typeClass === 'loc';

    useEffect(() => {
        setImgSrc(getLogoSrc(logoPath) || Building);
    }, [logoPath]);

    const handleError = (e) => {
        e.target.onerror = null;
        setImgSrc(Building);
        e.target.classList.add('hierarchy-avatar-img--fallback');
    };

    return (
        <div
            className={`hierarchy-avatar ${isCircle ? 'hierarchy-avatar--circle' : ''}`}
        >
            <img
                src={imgSrc}
                alt=""
                className={`hierarchy-avatar-img ${imgSrc === Building ? 'hierarchy-avatar-img--fallback' : ''}`}
                onError={handleError}
            />
        </div>
    );
};

const TYPE_META = {
    GHQ: { typeClass: 'ghq', label: 'GHQ' },
    RHQ: { typeClass: 'rhq', label: 'RHQ' },
    LOC: { typeClass: 'loc', label: 'LOC' },
    BU: { typeClass: 'bu', label: 'BU(s)' }
};

const HierarchyNodeName = ({ name }) => (
    <div className="hierarchy-node-name" title={name || ''}>
        {name}
    </div>
);

const CustomNode = ({ data }) => {
    const meta = TYPE_META[data.type] || TYPE_META.BU;
    const { typeClass, label } = meta;
    const isBU = data.type === 'BU';

    return (
        <div className="hierarchy-node-card nopan nodrag">
            <Handle type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: 'none' }} />

            {!isBU && <CompanyLogo logoPath={data.logoPath} typeClass={typeClass} />}

            <div className="hierarchy-node-text">
                <HierarchyNodeName name={data.label} />
                {!isBU && (
                    <div className={`hierarchy-node-type ${typeClass}`}>{label}</div>
                )}

                {isBU && <div className={`hierarchy-node-type ${typeClass}`}>- BU(s)</div>}
            </div>

            <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
        </div>
    );
};

const nodeTypes = { custom: CustomNode };

const mapBranchTypeToGraphType = (clientbranchTypeId) => {
    const t = parseInt(clientbranchTypeId, 10);
    if (t === 1) return 'GHQ';
    if (t === 2) return 'RHQ';
    if (t === 3) return 'LOC';
    return 'BU';
};

const getGHQInGroup = (group) => {
    const byType = group.find((c) => c.clientbranchTypeId === BRANCH.GHQ);
    if (byType) return byType;
    const hids = group.map((c) => c.hid).filter((h) => h != null);
    if (!hids.length) return group[0];
    const minHid = Math.min(...hids);
    return group.find((c) => c.hid === minHid) || group[0];
};

const isSameId = (a, b) => a != null && b != null && String(a) === String(b);

const resolveParentId = (company, list, byGid) => {
    // 1. Rule: If company is LOC/BU, look for parent node where parentNode.parentclientId matches company's gid
    // if (company.clientbranchTypeId === 3 || company.clientbranchTypeId === 4) {
    //     if (company.gid != null) {
    //         const parentNode = list.find(c => 
    //             c.clientId !== company.clientId &&
    //             (c.clientbranchTypeId || 0) < company.clientbranchTypeId &&
    //             c.parentclientId != null &&
    //             isSameId(c.parentclientId, company.gid)
    //         );
    //         if (parentNode) {
    //             return String(parentNode.clientId);
    //         }
    //     }
    // }
    // 
    // // 2. Try to resolve using parentclientId pointing to a node in the list first (accurate nesting)
    // if (company.parentclientId) {
    //     const parentNode = list.find(c => isSameId(c.clientId, company.parentclientId));
    //     if (parentNode) {
    //         return String(parentNode.clientId);
    //     }
    // }
    // 
    // // 3. Fallback: resolve to group's GHQ
    // if (company.gid != null) {
    //     const group = byGid.get(company.gid) || [];
    //     const ghq = group.length ? getGHQInGroup(group) : null;
    //     if (ghq && company.clientId !== ghq.clientId) {
    //         return String(ghq.clientId);
    //     }
    // }
    // 
    // const ghqByParentLink = list.find(
    //     (c) =>
    //         c.clientbranchTypeId === BRANCH.GHQ &&
    //         c.clientId !== company.clientId &&
    //         isSameId(company.gid, c.parentclientId),
    //     );
    // if (ghqByParentLink) {
    //     return String(ghqByParentLink.clientId);
    // }

    // 1. General Rule: If company's gid is not null and not 0, find a parent whose parentclientId matches company's gid
    if (company.gid != null && company.gid !== 0) {
        const parentNode = list.find(c => 
            c.clientId !== company.clientId &&
            c.parentclientId != null &&
            isSameId(c.parentclientId, company.gid)
        );
        if (parentNode) {
            return String(parentNode.clientId);
        }
    }

    // 2. Try to resolve using parentclientId pointing to a node in the list (accurate nesting)
    if (company.parentclientId) {
        const parentNode = list.find(c => isSameId(c.clientId, company.parentclientId));
        if (parentNode) {
            return String(parentNode.clientId);
        }
    }

    return company.parentclientId ? String(company.parentclientId) : null;
};

const buildGraphData = (companies) => {
    const list = (companies || [])
        .map((c) => ({
            clientId: c.clientId ?? c.clientid,
            clientName: c.clientName,
            logoPath: c.logoPath,
            clientbranchTypeId: parseInt(c.clientbranchTypeId, 10) || null,
            gid: c.gid > 0 ? toNum(c.gid) : null,
            hid: toNum(c.hid),
            parentclientId: c.parentclientId ?? c.parentClientID ?? null
        }))
        .filter((c) => c.clientId != null);

    const byGid = new Map();
    list.forEach((c) => {
        if (c.gid == null) return;
        if (!byGid.has(c.gid)) byGid.set(c.gid, []);
        byGid.get(c.gid).push(c);
    });

    const graphNodes = [];
    const seenIds = new Set();

    list.forEach((company) => {
        if (seenIds.has(company.clientId)) return;
        seenIds.add(company.clientId);

        const parentId = resolveParentId(company, list, byGid);

        graphNodes.push({
            id: String(company.clientId),
            name: company.clientName,
            logoPath: company.logoPath,
            type: mapBranchTypeToGraphType(company.clientbranchTypeId),
            parentId
        });
    });

    return graphNodes;
};

const CompanyHierarchyGraph = ({ companies = [] }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const wrapperRef = useRef(null);
    const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });

    const graphData = useMemo(() => buildGraphData(companies), [companies]);

    const layoutConfig = useMemo(() => {
        const width = wrapperSize.width || 0;
        if (!width || !graphData?.length) {
            return { nodesep: 56, ranksep: 110, marginx: 80, marginy: 60 };
        }

        const childrenByParent = new Map();
        for (const n of graphData) {
            const pid = n.parentId ?? '__root__';
            if (!childrenByParent.has(pid)) childrenByParent.set(pid, []);
            childrenByParent.get(pid).push(n.id);
        }

        let maxSiblings = 1;
        childrenByParent.forEach((kids) => {
            maxSiblings = Math.max(maxSiblings, kids.length);
        });

        const sidePad = clamp(Math.round(width * 0.06), 48, 160);
        const available = Math.max(400, width - sidePad * 2);
        const ideal = Math.floor((available - maxSiblings * nodeWidth) / Math.max(maxSiblings - 1, 1));
        const nodesep = clamp(isFinite(ideal) ? ideal : 56, 48, 280);
        const ranksep = clamp(Math.round(90 + nodesep * 0.35), 100, 180);

        return { nodesep, ranksep, marginx: sidePad, marginy: 60 };
    }, [graphData, wrapperSize.width]);

    useEffect(() => {
        if (!wrapperRef.current) return;
        const el = wrapperRef.current;

        const ro = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            const cr = entry.contentRect;
            setWrapperSize((prev) => {
                const w = Math.round(cr.width);
                const h = Math.round(cr.height);
                if (prev.width === w && prev.height === h) return prev;
                return { width: w, height: h };
            });
        });

        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const initNodes = graphData.map((item) => ({
            id: String(item.id),
            type: 'custom',
            data: {
                label: item.name,
                type: item.type,
                logoPath: item.logoPath
            },
            position: { x: 0, y: 0 }
        }));

        const initEdges = graphData
            .filter((item) => item.parentId != null)
            .map((item) => ({
                id: `e${item.parentId}-${item.id}`,
                source: String(item.parentId),
                target: String(item.id),
                type: 'curved'
            }));

        const { nodes: ln, edges: le } = getLayoutedElements(initNodes, initEdges, layoutConfig);
        setNodes(ln);
        setEdges(le);
    }, [graphData, layoutConfig]);

    return (
        <div
            ref={wrapperRef}
            className="box-design mt0 w-100 rs-companies-hierarchy-graph"
            style={{ height: 'calc(100vh - 200px)' }}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{ padding: 0.2, includeHiddenNodes: false }}
                minZoom={0.35}
                maxZoom={1.25}
                zoomOnScroll={false}
                zoomOnDoubleClick={false}
                panOnDrag
                panOnScroll
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
            >
                <Controls showInteractive={false} />
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#c5d9f0" />
            </ReactFlow>
        </div>
    );
};

export default CompanyHierarchyGraph;
