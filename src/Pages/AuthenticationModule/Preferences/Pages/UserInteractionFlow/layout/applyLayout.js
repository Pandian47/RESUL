import dagre from "dagre";

const nodeWidth = 180;
const nodeHeight = 70;

export const applyLayout = (nodes, edges) => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", ranksep: 90 });

  nodes.forEach(n =>
    g.setNode(n.id, { width: nodeWidth, height: nodeHeight })
  );

  edges.forEach(e => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return nodes.map(n => {
    const { x, y } = g.node(n.id);
    return {
      ...n,
      position: { x: x - nodeWidth / 2, y: y - nodeHeight / 2 }
    };
  });
};
