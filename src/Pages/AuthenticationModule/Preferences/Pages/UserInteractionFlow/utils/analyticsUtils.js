export const conversion = (from, to) =>
  ((to / from) * 100).toFixed(1);

export const dropOff = (from, to) =>
  (100 - (to / from) * 100).toFixed(1);

export const edgeColor = (drop) => {
  if (drop < 30) return "#2ecc71";
  if (drop < 60) return "#f1c40f";
  return "#e74c3c";
};

export const highestDropEdge = (edges) =>
  edges.reduce(
    (max, e) => e.data.dropOff > (max?.data.dropOff ?? 0) ? e : max,
    null
  );
