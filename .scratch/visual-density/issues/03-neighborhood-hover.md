# 03 — Add Neighborhood Hover Highlighting

**What to build:** When the user hovers over a node, the graph instantly dims all non-connected nodes and edges, isolating the neighborhood structure of the target node.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] The Sigma instance binds event listeners for `overNode` and `outNode`.
- [ ] On `overNode`, all unrelated nodes are dimmed to light grey and unrelated edges become transparent. The neighbors and the target node retain their original color.
- [ ] On `outNode`, all elements restore their `originalColor`.
