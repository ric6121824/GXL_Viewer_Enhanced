# 02 — Implement Edge Transparency

**What to build:** The default edges switch from solid black to a highly transparent light grey. This prevents the "solid ink blob" effect and turns overlapping connections into visual density maps without hiding the nodes beneath.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Edges parsed from the GXL file are assigned a transparent grey default color (e.g., `rgba(150, 150, 150, 0.2)`) instead of `#000000`.
- [ ] Edge `size` is scaled appropriately to reduce visual dominance.
