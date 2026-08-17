# Domain Terms: GXL Graph Visualization

- **ForceAtlas2**: A continuous, force-directed layout algorithm designed to pull dense clusters apart and separate hubs, making it much better for large/dense networks than Fruchterman-Reingold.
- **Degree-based Node Sizing (Relative Size)**: A visualization technique where the size of a node is proportional to its degree (number of connected edges), allowing structural hubs to stand out visually from leaf nodes.
- **Mapping Normalization (Size Slider)**: A user control that scales the visual difference between the maximum degree node and minimum degree node.
- **Edge Transparency**: Applying low opacity (alpha channel) to edges to prevent overlapping connections from obscuring nodes, creating a "heat map" effect where dense highways are darker.
- **Neighborhood Highlighting**: An interactive state where hovering over a node dims all unrelated elements, highlighting only the node and its immediate neighbors (1st-degree connections).
