import { ch_draft, ch_primary_green, ch_primary_red, ch_secondary_green, ch_white, cyanColor } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { MarkerType } from 'reactflow';
const nodeDataC = (data, x, y, bgColor) => {
    return {
        ...data,
        id: 'node-' + data.WindowID,
        sourcePosition: 'right',
        targetPosition: 'left',
        data: { label: data.FriendlyName },
        position: { x: x || (data.WindowID - 1) * 150, y: y ?? -((data.WindowID - 1) * 75) },
        style: {
            background: bgColor ?? (+data.SuccessPercentage > 0 ? ch_secondary_green : ch_draft),
            color: ch_white,
            fillOpacity: 0.7,
            minHeight: '50px',
        },
    };
};

// export const chartDataConstructor = (chartData) => {
//     let nodesDat = [];
//     console.log(nodeDataC(chartData.Parent, 0, 0, cyanColor))

//     nodesDat.push(nodeDataC(chartData.Parent, 0, 0, cyanColor))
//     nodesDat.push(...chartData.Child.map(child => (nodeDataC(child))));
//     const endData = chartData.EndPoint;
//     console.log(nodeDataC(endData, ((endData.WindowID - 2) * 150), 0, ch_primary_red))
//     nodesDat.push(nodeDataC(endData, ((endData.WindowID - 2) * 150), 0, ch_primary_red))
//     let edgesDat = [];
//     nodesDat.forEach((node, index) => {
//         if (index < nodesDat?.length - 2) {
//             const nextItem = nodesDat[index + 1];
//             const success = +(nextItem?.SuccessPercentage) > 0;

//             edgesDat.push({
//                 id: "edge-" + node.id + "-" + nextItem.id,
//                 source: node.id,
//                 target: nextItem.id,
//                 type: 'step',
//                 style: {
//                     strokeWidth: 1,
//                     stroke: success ? ch_secondary_green : ch_draft,
//                 },
//                 markerEnd: {
//                     type: MarkerType.ArrowClosed,
//                     width: 20,
//                     height: 20,
//                     color: success ? ch_secondary_green : ch_draft,
//                 }
//             });
//             const failure = +node?.FailPercentage > 0;
//             edgesDat.push({
//                 id: "edge-" + node.id + "-" + endData.WindowID,
//                 source: node.id,
//                 target: 'node-' + endData.WindowID,
//                 type: "buttonedge",
//                 style: {
//                     strokeWidth: 1,
//                     "stroke-dasharray": "5,5",
//                     stroke: failure ? ch_primary_red : ch_draft,
//                 },
//                 markerEnd: {
//                     type: MarkerType.ArrowClosed,
//                     width: 20,
//                     height: 20,
//                     color: failure ? ch_primary_red : ch_draft,
//                 },
//                 ...(failure) && {
//                     labelBgStyle: {
//                         backgroundColor: ch_primary_red,
//                         color: ch_white,
//                         fontSize: '12px',
//                         padding: '5px',
//                         cursor: 'pointer',
//                         border: 'inherit',
//                         borderRadius: '5px'
//                     },
//                     label: node?.FailPercentage + '%'
//                 },
//             })
//         }
//     });
//     return { nodesDat, edgesDat };
// }

export const chartDataConstructor = (chartData) => {
        const nodesDat = [];
    const edgesDat = [];
    if (chartData && Object.keys(chartData)?.length) {
        const nodeRslt = GenerateNode(chartData);
        const { Parent, Child, EndPoint } = nodeRslt;
        const nodeList = [Parent, ...Child, EndPoint];
        const edgeList = GenerateEdge(nodeRslt);
        return { nodesDat: nodeList, edgesDat: edgeList };
    } else {
        return { nodesDat: [], edgesDat: [] };
    }
};

export const GenerateNode = (chartData) => {
        //const { Day30, Day60, Day90 } = chartData;
    let { Parent, Child, EndPoint } = chartData;
    Parent = {
        ...Parent,
        id: `goalPath-${Parent.WindowID}`,
        position: { x: 0, y: 0 },
        sourcePosition: 'right',
        type: 'customNode',
        data: { 
            friendlyName: Parent.FriendlyName, 
            eleType: 'root',
            audienceCount: Parent.AudienceCount,
            successPercentage: Parent.SuccessPercentage,
            actualCount: Parent.ActualCount,
            query: Parent.Query
        },
        className: 'RootNode',
    };
    let x = 0,
        y = 0;
    Child = Child.map((item) => {
        x = x + 250;
        y = y + 150;
        return {
            ...item,
            id: `goalPath-${item.WindowID}`,
            sourcePosition: 'right',
            targetPosition: 'left',
            type: 'customNode',
            position: { x, y },
            data: { 
                friendlyName: item.FriendlyName, 
                eleType: 'child',
                audienceCount: item.AudienceCount,
                successPercentage: item.SuccessPercentage,
                actualCount: item.ActualCount,
                query: item.Query
            },
            className: 'ChildNode',
        };
    });

    EndPoint = {
        ...EndPoint,
        id: `goalPath-${EndPoint.WindowID}`,
        position: { x, y: 0 },
        targetPosition: 'left',
        type: 'customNode',
        data: { 
            friendlyName: EndPoint.FriendlyName, 
            eleType: 'end',
            audienceCount: 'N/A' 
        },
        className: 'TargetNode',
    };
    const nodeList = { Parent, Child, EndPoint };

    return nodeList;
};

export const GenerateEdge = (nodeList) => {
    const { Parent, Child, EndPoint } = nodeList;
    const defaultEdgeProp = {
        type: 'bezier',
        source: '',
        target: '',
        id: 'edge-root',
        //label: 'bezier',
        style: {
            strokeWidth: 1,
            stroke: ch_primary_green,
        },
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 40,
            height: 40,
            color: ch_primary_green,
        },
    };
    
    let edgeList = [];
    if (Child && Child?.length > 0) {
        edgeList = [
            {
                ...defaultEdgeProp,
                type: 'BazierEdge',
                source: Parent.id,
                target: Child[0].id,
                id: 'edge-1',
                //label: 'bezier',
            },
        ];
        
        const failEdgeProps = (item, index) => ({
            ...defaultEdgeProp,
            type: 'BazierEdge',
            sourceHandle: `A${index + 1}`,
            source: item.id,
            target: EndPoint.id,
            id: `edge-${index + 1}b`,
            style: {
                ...defaultEdgeProp.style,
                'stroke-dasharray': '5,5',
                stroke: ch_primary_red,
            },
            markerEnd: {
                ...defaultEdgeProp.markerEnd,
                color: ch_primary_red,
            },
            labelBgStyle: {
                backgroundColor: ch_primary_red,
                color: ch_white,
                fontSize: '14px',
                padding: '5px',
                cursor: 'pointer',
                border: 'inherit',
                borderRadius: '5px',
            },
            data: {
                ActualCounty: item.ActualCounty,
                AudienceCount: item.AudienceCount,
                FailPercentage: item.FailPercentage,
                FriendlyName: item.FriendlyName,
                Query: item.Query,
                SuccessPercentage: item.SuccessPercentage,
                WindowID: item.WindowID,
                ActualCount: item.ActualCount,
            },
        });

        Child.forEach((item, index) => {
            if (index >= Child.length - 1) return;
            edgeList = [
                ...edgeList,
                {
                    ...defaultEdgeProp,
                    type: 'BazierEdge',
                    source: item.id,
                    target: Child[index + 1].id,
                    id: `edge-${index + 1}a`,
                },
                failEdgeProps(item, index),
            ];
        });

        edgeList = [
            ...edgeList,
            {
                ...defaultEdgeProp,
                type: 'BazierEdge',
                source: Parent.id,
                target: EndPoint.id,
                id: 'edge-parent-fail',
                style: {
                    ...defaultEdgeProp.style,
                    'stroke-dasharray': '5,5',
                    stroke: ch_primary_red,
                },
                markerEnd: {
                    ...defaultEdgeProp.markerEnd,
                    color: ch_primary_red,
                },
                labelBgStyle: {
                    backgroundColor: ch_primary_red,
                    color: ch_white,
                    fontSize: '14px',
                    padding: '5px',
                    cursor: 'pointer',
                    border: 'inherit',
                    borderRadius: '5px',
                },
                data: {
                    FailPercentage: Parent.FailPercentage,
                    FriendlyName: Parent.FriendlyName,
                    Query: Parent.Query,
                    AudienceCount: Parent.AudienceCount,
                    ActualCount: Parent.ActualCount,
                    SuccessPercentage: Parent.SuccessPercentage,
                    WindowID: Parent.WindowID,
                },
            },
        ];
    } else {
        // If no child nodes, create direct edge from Parent to EndPoint
        edgeList = [
            {
                ...defaultEdgeProp,
                type: 'smoothstep',
                source: Parent.id,
                target: EndPoint.id,
                id: 'edge-direct',
                //label: 'bezier',
                style: {
                    ...defaultEdgeProp.style,
                    'stroke-dasharray': '5,5',
                    stroke: ch_primary_red,
                },
                markerEnd: {
                    ...defaultEdgeProp.markerEnd,
                    color: ch_primary_red,
                },
            },
        ];
    }
    return edgeList;
};

export const RenderZoomSize = (chartData) => {
    //  const { Day30, Day60, Day90 } = chartData;
    const { Parent, Child, EndPoint } = chartData;

    let size = 1;
    if (Child && Object.keys(Child)?.length) {
        switch (Child?.length) {
            case 3:
                size = 0.8;
                break;
            case 4:
                size = 0.7;
                break;
            case 5:
                size = 0.6;
                break;
            case 6:
                size = 0.51;
                break;
            case 7:
                size = 0.45;
                break;
            case 8:
                size = 0.4;
                break;
            case 9:
                size = 0.35;
                break;
            case 10:
                size = 0.32;
                break;
            default:
                size = 0.8;
        }
    }
    return size;
};