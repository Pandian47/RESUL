export const filterByChannel = (nodes, edges, channel) => {
  if (channel === "all") return { nodes, edges };

  const smsNodes = nodes.filter(n => n.data.channel === "sms");
  const allowed = new Set(smsNodes.map(n => n.id));

  edges.forEach(e => {
    if (allowed.has(e.source)) allowed.add(e.target);
  });

  return {
    nodes: nodes.filter(n => allowed.has(n.id)),
    edges: edges.filter(e =>
      allowed.has(e.source) && allowed.has(e.target)
    )
  };
};
