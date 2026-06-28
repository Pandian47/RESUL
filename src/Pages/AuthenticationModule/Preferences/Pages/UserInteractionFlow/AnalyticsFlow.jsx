import { useMemo, useState } from "react";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";

import data from "./data/apiResponse.json";
import { applyLayout } from "./layout/applyLayout";
import { conversion, dropOff, edgeColor, highestDropEdge } from "./utils/analyticsUtils";
import { filterByChannel } from "./utils/filterUtils";

import AnalyticsNode from "./components/AnalyticsNode";
import AnalyticsEdge from "./components/AnalyticsEdge";
import ChannelToggle from "./components/ChannelToggle";
import FlowLegend from "./components/FlowLegend";

const nodeTypes = { analyticsNode: AnalyticsNode };
const edgeTypes = { analyticsEdge: AnalyticsEdge };

export default function AnalyticsFlow() {
  const [channel, setChannel] = useState("all");

  const layoutedNodes = useMemo(
    () => applyLayout(data.nodes, data.edges),
    []
  );

  const enrichedEdges = useMemo(() => {
    return data.edges.map(e => {
      const s = data.nodes.find(n => n.id === e.source);
      const t = data.nodes.find(n => n.id === e.target);

      const conv = conversion(s.data.count, t.data.count);
      const drop = dropOff(s.data.count, t.data.count);

      return {
        ...e,
        type: "analyticsEdge",
        data: {
          conversion: conv,
          dropOff: drop,
          color: edgeColor(drop)
        }
      };
    });
  }, []);

  const highest = highestDropEdge(enrichedEdges);

  const finalEdges = enrichedEdges.map(e => ({
    ...e,
    data: { ...e.data, isHighest: e.id === highest?.id }
  }));

  const filtered = filterByChannel(layoutedNodes, finalEdges, channel);

  return (
       <div  className="position-relative reactFlowContainer css-scrollbar"
            style={{
                height: '415px',
                overflow: 'auto',
            }}> <ReactFlow nodes={filtered.nodes} edges={filtered.edges}
      nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView>
      <svg>
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10"
            refX="10" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
          </marker>
        </defs>
      </svg>
      <ChannelToggle value={channel} onChange={setChannel} />
      <FlowLegend />
    </ReactFlow></div> 
  );
}
