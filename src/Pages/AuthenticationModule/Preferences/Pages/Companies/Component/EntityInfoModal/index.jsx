import { GET_BU_DATA } from 'Constants/EndPoints';
import { memo, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import RSModal from 'Components/RSModal';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
import { getmasterData } from 'Utils/modules/masterData';
import request from 'Utils/Http';
import { getEntityInfo } from 'Reducers/preferences/Companies/request';
import { getSessionId } from 'Reducers/globalState/selector';

const BRANCH_LABELS = {
    1: 'Global HQ',
    2: 'Regional HQ',
    3: 'LOC',
    4: 'BU(s)'
};

const getBranchTypeName = (id) => BRANCH_LABELS[id] || 'BU(s)';

const getDescendantLabel = (branchTypeId) => {
    if (branchTypeId === 1) return 'Direct Regional HQs';
    if (branchTypeId === 2) return 'Direct LOC';
    return 'Direct BU(s)';
};

const TYPE_COLOR = {
    1: '#1565c0', // GHQ
    2: '#8bc63f', // RHQ
    3: '#f7931e', // LOC
    4: '#3ab2ac'  // BU(s)
};

const ENTITY_INFO_ROW_COUNT = 5;

const TREE_SKELETON_ROWS = [
    { indent: 0, typeWidth: 36, nameWidth: 120 },
    { indent: 0, typeWidth: 36, nameWidth: 100 },
    { indent: 0, typeWidth: 36, nameWidth: 110 },
    { indent: 0, typeWidth: 36, nameWidth: 90 },
    { indent: 0, typeWidth: 36, nameWidth: 130, hasArrow: true },
    { indent: 24, typeWidth: 36, nameWidth: 110 },
    { indent: 0, typeWidth: 36, nameWidth: 80 },
];

const EntityInfoModalSkeleton = () => (
    <div className="cim-body cim-modal-skeleton" aria-hidden="true">
        <div className="cim-panel">
            <h4 className="cim-panel-header">Entity Info</h4>
            <div className="cim-entity-list">
                {Array.from({ length: ENTITY_INFO_ROW_COUNT }, (_, idx) => (
                    <div key={idx} className="cim-entity-row">
                        <CommonSkeleton box height={20} width={90} stopAnimation />
                        <CommonSkeleton box height={20} width={72} stopAnimation />
                    </div>
                ))}
            </div>
        </div>

        <div className="cim-panel">
            <h4 className="cim-panel-header">Full Hierarchy Path</h4>
                <div className="cim-tree-wrapper css-scrollbar">
                {TREE_SKELETON_ROWS.map((row, idx) => (
                    <div
                        key={idx}
                        className="cim-tree-skeleton-row"
                        style={{ paddingLeft: row.indent }}
                    >
                        {row.hasArrow && <CommonSkeleton box height={12} width={12} stopAnimation />}
                        <CommonSkeleton box height={20} width={row.typeWidth} stopAnimation />
                        <CommonSkeleton box height={20} width={row.nameWidth} stopAnimation />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// Recursive Tree Node Component
const TreeNode = ({ node, selectedCompanyId, departmentsMap, onToggleExpand, expandedNodes }) => {
    const isLHQ = node.clientbranchTypeId === 3;
    const isExpanded = !!expandedNodes[node.clientId];

    // Determine children
    const childNodes = useMemo(() => {
        if (isLHQ) {
            const deps = departmentsMap[node.clientId] || [];
            return deps.map(d => ({
                clientId: `bu-${d.departmentId}`,
                clientName: d.departmentName,
                clientbranchTypeId: 4,
                children: []
            }));
        }
        return node.children || [];
    }, [node.children, isLHQ, departmentsMap, node.clientId]);

    const hasChildren = childNodes.length > 0 || (isLHQ && !departmentsMap[node.clientId]);

    const typeColor = TYPE_COLOR[node.clientbranchTypeId] || '#333';
    const typeLabel = node.clientbranchTypeId === 1 ? 'GHQ' :
        node.clientbranchTypeId === 2 ? 'RHQ' :
            node.clientbranchTypeId === 3 ? 'LOC' : 'BU(s)';

    const handleToggle = (e) => {
        e.stopPropagation();
        onToggleExpand(node.clientId, isLHQ);
    };

    return (
        <div>
            <div
                className="cim-tree-row"
                style={{ cursor: hasChildren ? 'pointer' : 'default' }}
                onClick={handleToggle}
            >
                {hasChildren ? (
                    <span className={`cim-tree-arrow ${isExpanded ? 'open' : ''}`}>&#9658;</span>
                ) : (
                    // <span className="cim-tree-arrow-placeholder" />
                    null
                )}
                <span className="cim-tree-type" style={{ color: typeColor }}>{typeLabel}</span>
                {/* <span 
                    className="cim-tree-name"
                    style={String(node.clientId) === String(selectedCompanyId) ? { fontWeight: 'bold', color: '#1565c0' } : {}}
                >
                    - {node.clientName}
                </span> */}
                <span className="cim-tree-name">
                    - {node.clientName}
                </span>
            </div>
            {isExpanded && childNodes.length > 0 && (
                <div className="cim-tree-children">
                    {childNodes.map(child => (
                        <TreeNode
                            key={child.clientId}
                            node={child}
                            selectedCompanyId={selectedCompanyId}
                            departmentsMap={departmentsMap}
                            onToggleExpand={onToggleExpand}
                            expandedNodes={expandedNodes}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const EntityInfoModal = ({ show, handleClose, companyName, clientId, companiesList = [] }) => {
    const dispatch = useDispatch();
    const { userId } = useSelector((state) => getSessionId(state));
    const [infoData, setInfoData] = useState(null);
    const [isEntityInfoLoading, setIsEntityInfoLoading] = useState(false);
    const [departmentsMap, setDepartmentsMap] = useState({});
    const [expandedNodes, setExpandedNodes] = useState({});

    // Fetch entity info when modal opens
    useEffect(() => {
        if (show && clientId) {
            setIsEntityInfoLoading(true);
            setInfoData(null);
            dispatch(getEntityInfo({ clientId }, (res) => {
                setIsEntityInfoLoading(false);
                if (res?.status && res?.data) {
                    setInfoData(res.data);
                }
            }));
        } else {
            setIsEntityInfoLoading(false);
            setInfoData(null);
            setDepartmentsMap({});
            setExpandedNodes({});
        }
    }, [show, clientId, dispatch]);

    // Build the tree data matching current workspace's companies hierarchy
    const treeData = useMemo(() => {
        if (!show || !companiesList.length || !clientId) return null;

        const list = (companiesList || [])
            .map((c) => ({
                clientId: String(c.clientId ?? c.clientid),
                clientName: c.clientName,
                logoPath: c.logoPath,
                clientbranchTypeId: parseInt(c.clientbranchTypeId, 10) || null,
                gid: c.gid > 0 ? Number(c.gid) : null,
                hid: c.hid != null ? Number(c.hid) : null,
                parentclientId: c.parentclientId ?? c.parentClientID ?? null
            }))
            .filter((c) => c.clientId != null);

        console.log('DEBUG: list of companies:', list);
        console.table(list.map(c => ({ name: c.clientName, id: c.clientId, parentId: c.parentclientId, type: c.clientbranchTypeId, gid: c.gid, hid: c.hid })));

        const byGid = new Map();
        list.forEach((c) => {
            if (c.gid == null) return;
            if (!byGid.has(c.gid)) byGid.set(c.gid, []);
            byGid.get(c.gid).push(c);
        });

        const resolveParentId = (company) => {
            // 1. Rule: If company is LOC/BU, look for parent node where parentNode.parentclientId matches company's gid
            // if (company.clientbranchTypeId === 3 || company.clientbranchTypeId === 4) {
            //     if (company.gid != null) {
            //         const parentNode = list.find(c => 
            //             c.clientId !== company.clientId &&
            //             (c.clientbranchTypeId || 0) < company.clientbranchTypeId &&
            //             c.parentclientId != null &&
            //             String(c.parentclientId) === String(company.gid)
            //         );
            //         if (parentNode) {
            //             return String(parentNode.clientId);
            //         }
            //     }
            // }
            // 
            // // 2. Try to resolve using parentclientId pointing to a node in the list first (accurate nesting)
            // if (company.parentclientId) {
            //     const parentNode = list.find(c => String(c.clientId) === String(company.parentclientId));
            //     if (parentNode) {
            //         return String(parentNode.clientId);
            //     }
            // }
            // 
            // // 3. Fallback: if gid is present, resolve to the group's GHQ
            // if (company.gid != null) {
            //     const group = byGid.get(company.gid) || [];
            //     const ghq = group.find((c) => c.clientbranchTypeId === 1);
            //     if (ghq && company.clientId !== ghq.clientId) {
            //         return String(ghq.clientId);
            //     }
            // }
            // 
            // const ghqByParentLink = list.find(
            //     (c) =>
            //         c.clientbranchTypeId === 1 &&
            //         c.clientId !== company.clientId &&
            //         String(company.gid) === String(c.parentclientId),
            // );
            // if (ghqByParentLink) {
            //     return String(ghqByParentLink.clientId);
            // }

            // 1. General Rule: If company's gid is not null and not 0, find a parent whose parentclientId matches company's gid
            if (company.gid != null && company.gid !== 0) {
                const parentNode = list.find(c => 
                    c.clientId !== company.clientId &&
                    c.parentclientId != null &&
                    String(c.parentclientId) === String(company.gid)
                );
                if (parentNode) {
                    return String(parentNode.clientId);
                }
            }

            // 2. Try to resolve using parentclientId pointing to a node in the list (accurate nesting)
            if (company.parentclientId) {
                const parentNode = list.find(c => String(c.clientId) === String(company.parentclientId));
                if (parentNode) {
                    return String(parentNode.clientId);
                }
            }

            return company.parentclientId ? String(company.parentclientId) : null;
        };

        const nodes = list.map(c => ({
            ...c,
            parentId: resolveParentId(c)
        }));

        let current = nodes.find(n => n.clientId === String(clientId));
        if (!current) return null;

        const visited = new Set();
        while (current && current.parentId && !visited.has(current.clientId)) {
            visited.add(current.clientId);
            const parent = nodes.find(n => n.clientId === current.parentId);
            if (!parent) break;
            current = parent;
        }

        if (current.clientbranchTypeId !== 1) {
            const groupGhq = nodes.find(n => n.clientbranchTypeId === 1 && (n.gid === current.gid || String(n.parentclientId) === String(current.gid)));
            if (groupGhq) {
                current = groupGhq;
            }
        }

        const buildNode = (item) => {
            const children = nodes.filter(n => n.parentId === item.clientId);
            return {
                ...item,
                children: children.map(buildNode)
            };
        };

        const result = buildNode(current);

        // Pre-expand path leading to the selected company
        // const initialExpanded = {};
        // const expandPath = (node) => {
        //     if (String(node.clientId) === String(clientId)) return true;
        //     if (node.children) {
        //         for (const child of node.children) {
        //             if (expandPath(child)) {
        //                 initialExpanded[node.clientId] = true;
        //                 return true;
        //             }
        //         }
        //     }
        //     return false;
        // };
        // expandPath(result);
        // if (result && result.clientId) {
        //     initialExpanded[result.clientId] = true;
        // }
        // setExpandedNodes(initialExpanded);

        const initialExpanded = {};
        const expandAll = (node) => {
            if (!node) return;
            if (node.clientId) {
                initialExpanded[node.clientId] = true;
            }
            if (node.children) {
                node.children.forEach(expandAll);
            }
        };
        expandAll(result);
        setExpandedNodes(initialExpanded);

        return result;
    }, [show, companiesList, clientId]);

    // Handle toggle node expand/collapse
    const handleToggleExpand = async (nodeId, isLHQ) => {
        setExpandedNodes(prev => {
            const next = { ...prev, [nodeId]: !prev[nodeId] };
            return next;
        });

        if (isLHQ && !departmentsMap[nodeId]) {
            // Fetch LOB/BU data for this LHQ
            try {
                const res = await dispatch(
                    request.post({
                        url: GET_BU_DATA,
                        payload: { userId, clientId: nodeId },
                        loading: false,
                    }),
                );
                if (res?.data?.status) {
                    setDepartmentsMap(prev => ({
                        ...prev,
                        [nodeId]: res.data.data || []
                    }));
                }
            } catch (err) {
                console.error('Failed to load LOB/BUs:', err);
            }
        }
    };

    // Pre-fetch departments for any LHQ nodes in the tree
    useEffect(() => {
        if (!treeData || !userId) return;
        const findLhqs = (node, acc = []) => {
            if (node.clientbranchTypeId === 3) {
                acc.push(node.clientId);
            }
            if (node.children) {
                node.children.forEach(child => findLhqs(child, acc));
            }
            return acc;
        };
        const lhqIds = findLhqs(treeData);
        lhqIds.forEach(id => {
            if (!departmentsMap[id]) {
                dispatch(
                    request.post({
                        url: GET_BU_DATA,
                        payload: { userId, clientId: id },
                        loading: false,
                    }),
                ).then((res) => {
                    if (res?.data?.status) {
                        setDepartmentsMap(prev => ({
                            ...prev,
                            [id]: res.data.data || []
                        }));
                    }
                }).catch(err => {
                    console.error('Failed to pre-fetch departments:', err);
                });
            }
        });
    }, [treeData, userId, dispatch]);

    // Map industry with defensive checks
    const industryName = useMemo(() => {
        if (!infoData?.IndustryID) return '';
        const { industryList = [] } = getmasterData() || {};
        const match = industryList.find(ind =>
            (ind.industryID != null && Number(ind.industryID) === Number(infoData.IndustryID)) ||
            (ind.industryId != null && Number(ind.industryId) === Number(infoData.IndustryID))
        );
        return match ? (match.industryName || match.industry || '') : '';
    }, [infoData]);

    const entityInfo = useMemo(() => {
        if (!infoData) return [];
        return [
            { label: 'Level', count: getBranchTypeName(infoData.ClientBranchTypeID) },
            { label: 'Region', count: infoData.Regionname || '—' },
            { label: 'Industry', count: industryName || '—' },
            { label: 'Parent', count: infoData.ParentClientName || '—' },
            { label: getDescendantLabel(infoData.ClientBranchTypeID), count: infoData.HierarchyCount || 0 },
        ];
    }, [infoData, industryName]);

    const bodyContent = (
        <div>
            {isEntityInfoLoading ? (
                <EntityInfoModalSkeleton />
            ) : (
                <div className="cim-body">
                    {/* Left Panel: Entity Info */}
                    <div className="cim-panel">
                        <h4 className="cim-panel-header">Entity Info</h4>
                        <div className="cim-entity-list">
                            {entityInfo.map((row, i) => (
                                <div key={i} className={`cim-entity-row ${i % 2 !== 0 ? 'alt' : ''}`}>
                                    <span className="cim-entity-label">{row.label}</span>
                                    <span className="cim-entity-count">{row.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel: Full Hierarchy Path */}
                    <div className="cim-panel">
                        <h4 className="cim-panel-header">Full Hierarchy Path</h4>
                        <div className="cim-tree-wrapper css-scrollbar">
                            {treeData ? (
                                <TreeNode
                                    node={treeData}
                                    selectedCompanyId={clientId}
                                    departmentsMap={departmentsMap}
                                    onToggleExpand={handleToggleExpand}
                                    expandedNodes={expandedNodes}
                                />
                            ) : (
                                <div className="d-flex align-items-center justify-content-center h-75 py-5">
                                    <span className="text-muted">No hierarchy available</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Legend */}
            <ul className="rs-legend justify-content-end mt0">
                <li><span className="rsl-status legend-ghq"></span>GHQ</li>
                <li><span className="rsl-status legend-rhq"></span>RHQ</li>
                <li><span className="rsl-status legend-lhq"></span>LOC</li>
                <li><span className="rsl-status legend-bu"></span>BU(s)</li>
            </ul>
        </div>
    );

    return (
        <RSModal
            show={show}
            size="lg"
            header={companyName}
            handleClose={handleClose}
            body={bodyContent}
            className="cim-modal"
        />
    );
};

export default memo(EntityInfoModal);
