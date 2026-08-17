# GXL Viewer Enhanced

This is a customized fork of the original frayer/GXL_Viewer, with modifications to handle dense and complex GXL graphs more effectively. 

## Live Demo
The tool is automatically deployed via GitHub Pages and can be accessed directly here:
**[https://ric6121824.github.io/GXL_Viewer_Enhanced/](https://ric6121824.github.io/GXL_Viewer_Enhanced/)**

## Key Modifications

*   **ForceAtlas2 Physics Layout**: Replaced the default layout algorithm with a finely-tuned ForceAtlas2 implementation (`strongGravityMode` enabled) to aggressively organize chaotic graphs.
*   **File-Based Clustering**: The parser now automatically reads `Source.File` attributes, generates synthetic gravitational hubs, and forces nodes from the same file to cluster tightly together.
*   **Auto-Coloring**: Nodes are automatically color-coded based on their source file, making it easy to visually separate distinct modules.
*   **Visual Density Tweaks**: 
    *   Node sizes scale statically based on their degree of connectivity.
    *   Edges are rendered as thin, low-transparency lines to reduce visual clutter.
    *   Hovering over a node highlights its immediate neighborhood and dims the rest of the graph.
*   **Native Image Export**: Ripped out the broken third-party snapshot plugin and replaced it with a native HTML5 Canvas export feature that reliably saves the current view.
*   **Automated Deployment**: Includes a GitHub Actions workflow (`.github/workflows/pages.yml`) that automatically builds and deploys the viewer to GitHub Pages whenever code is pushed to `main`.

## How to Run Locally

Since this is a static web application, it needs to be served over a local HTTP server to bypass CORS restrictions when parsing local GXL files.

If you have Python 3 installed, simply run:
```bash
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.

## Technologies Used
*   HTML / CSS / JavaScript
*   [Linkurious.js](https://github.com/Linkurious/linkurious.js) (Sigma.js fork) 
