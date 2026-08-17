# 04 — Migrate Layout Engine to ForceAtlas2

**What to build:** Clicking "Layout Graph" spins up the ForceAtlas2 algorithm (with a 3-second auto-stop timer) instead of Fruchterman-Reingold, effectively pushing hubs apart and clustering related leaf nodes tightly.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Fruchterman-Reingold plugin script tags are removed from `index.html`.
- [ ] ForceAtlas2 plugin `worker.js` and `supervisor.js` script tags are added.
- [ ] The `layoutGraph()` scope function starts ForceAtlas2 with appropriate configuration parameters.
- [ ] A timer stops the layout automatically after ~3000ms to prevent infinite background execution.
