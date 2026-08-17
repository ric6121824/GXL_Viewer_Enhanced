# 01 — Map Node Sizes to Degree & Add Scale Slider

**What to build:** The graph nodes scale proportionally to their connection count (degree), instantly highlighting structural hubs. The UI gains a slider to adjust the intensity of this scaling.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] A slider is added to the control panel for "Node Scale" (range 1-20, default 5).
- [ ] Nodes are sized dynamically based on their calculated degree upon graph load.
- [ ] Changing the slider immediately recalculates node sizes and refreshes the canvas.
