/*** Linkurious.js optimized default values ***/
// https://github.com/Linkurious/linkurious.js/wiki/Settings-by-Linkurious

/*** Object representing the application itself ***/
var myApp = angular.module('myApp', []);

/*** Controller managing the graph ***/
myApp.controller('controller', ['$scope', function($scope) {	
	/** Graph object **/
	var currentGraph = null;
	var graphName = "";
	
	/** Sigma.js instance **/
	var sig = new sigma({
		graph: {nodes: [], edges: []},
		//container: 'graph',
		//type: 'canvas'
		renderer: {
			container: 'graph',
			type: 'canvas'
		},
		settings: {
			drawLabels: false,
			drawEdgeLabels: false,
			doubleClickEnabled: true,
			enableEdgeHovering: true,
			edgeHoverPrecision: 1,	// default=10
			edgeHoverColor: 'edge',
			defaultEdgeHoverColor: '#000',
			edgeHoverSizeRatio: 1,
			edgeHoverExtremities: true,
			minNodeSize: 1,
			maxNodeSize: 20,
			minEdgeSize: 0.1,
			maxEdgeSize: 0.5,
		}
	});


	/** 
	 * Function to load features file
	 **/
	$scope.importGraph = function(type)
	{
		// Get calling button
		var file = document.getElementById("import").files[0];

		/* The file selecter should not be empty and the path must be entered */
		if ( file != null )
		{	
			// Clear existing graph if re-import
			if (sig)
				$scope.clearGraph(false);

			// Getting the uploaded file
			graphName = file.name;
			var parts = graphName.split(".");
			var extension = parts[parts.length - 1];

			// Process only gxl files
			if (extension == 'gxl') {

				// Use FileReader API
				var reader = new FileReader();

				reader.addEventListener('load', function() {

					// Get content of the file
					var content = reader.result;

					// Read content as json graph
					var jsonGraph = $scope.gxl2json(content);

					// Debug
					//console.log(jsonGraph);

					// Load as sigmajs graph
					currentGraph = JSON.parse(jsonGraph);
					sig.graph.read(currentGraph);

					// Init the visualisation
					$scope.init();

					// Display the graph
					$scope.display();

				}, false);
			
			// Reading the file after setting the event listener because of asynchronous reading
			reader.readAsText(file);

				
			}
		    else {
		   		alert('Error: Please only import *.gxl file.');
		    }	
		}
	}


	$scope.nodeScale = 5;



	/** 
	 * Function to layout the graph using ForceAtlas2 algorithm
	 **/
	$scope.layoutGraph = function()
	{
		if (sig.isForceAtlas2Running && sig.isForceAtlas2Running()) {
			sig.stopForceAtlas2();
			return;
		}
		
		// [DEBUG-hub1] Verify FA2 sees all edges
		console.log('[DEBUG-hub1] FA2 start: total nodes in graph:', sig.graph.nodes().length);
		console.log('[DEBUG-hub1] FA2 start: total edges in graph:', sig.graph.edges().length);
		var synthEdges = sig.graph.edges().filter(function(e) { return e.label === 'synth'; });
		console.log('[DEBUG-hub1] FA2 start: synthetic edges:', synthEdges.length);
		if (synthEdges.length > 0) {
			console.log('[DEBUG-hub1] FA2 start: sample synth edge weight:', synthEdges[0].weight, typeof synthEdges[0].weight);
		}

		sig.startForceAtlas2({
			worker: true,
			barnesHutOptimize: true,
			slowDown: 10,
			iterationsPerRender: 1,
			edgeWeightInfluence: 1,
			strongGravityMode: true,
			gravity: 10
		});
		
		// Stop automatically after 3 seconds
		setTimeout(function() {
			if (sig.isForceAtlas2Running()) {
				sig.stopForceAtlas2();
			}
		}, 3000);
	}


	/** 
	 * Function to layout the graph using Fruchterman-Reingolg algorithm
	 **/
	$scope.exportGraph = function()
	{
		// Convert to gxl
		var exportedGraph = $scope.json2gxl(sig);

		// Compute outfile name
		var filename = graphName + "_layout.gxl";
		
		// Save the file
		var blob = new Blob([exportedGraph], {type: "text/plain;charset=utf-8"});
		saveAs(blob, filename);
	}


	/** 
	 * Function to save as png image
	 **/
	$scope.saveImage = function()
	{
		var container = document.getElementById('graph');
		var canvases = container.getElementsByTagName('canvas');
		if (canvases.length === 0) return;

		var width = canvases[0].width;
		var height = canvases[0].height;

		var offscreen = document.createElement('canvas');
		offscreen.width = width;
		offscreen.height = height;
		var ctx = offscreen.getContext('2d');

		// Fill white background
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, width, height);

		// Draw each sigma canvas layer in order
		for (var i = 0; i < canvases.length; i++) {
			ctx.drawImage(canvases[i], 0, 0);
		}

		var dataURL = offscreen.toDataURL('image/png');
		var a = document.createElement('a');
		a.href = dataURL;
		a.download = (graphName && graphName !== "") ? (graphName.replace(".gxl", ".png")) : "graph.png";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}


	/** 
	 * Function to clear the graph
	 **/
	$scope.clearGraph = function(clear_io)
	{
		/* Resetting the displaying */
		sig.graph.clear();

		// Refresh the view
		sig.refresh();

		// Clear IO related elements
		if (clear_io)
			document.getElementById("import").value = "";

		// Reset globals
		currentGraph = null;
		graphName = "";
	}


	/* Function to display the About overlay */
	$scope.openAbout = function()
	{
   	 	document.getElementById("about").style.width = "100%";
	}

	/* Close when someone clicks on the "x" symbol inside the overlay */
	$scope.closeAbout = function()
	{
    	document.getElementById("about").style.width = "0%";
	}



	/* ---------------------------- */
	/* IMPORT/EXPORT FUNCTIONS      */
	/* ---------------------------- */

	/** 
	 * Function that convert a gxl string to json
	 **/
	$scope.gxl2json = function(gxl)
	{
		// Helper: match element by nodeName or localName (handles XML namespaces)
		function isTag(el, name) {
			return el.nodeName === name || (el.localName && el.localName === name);
		}

		// Get DOM parser
		var parser = new window.DOMParser();
		var xmlDoc = parser.parseFromString(gxl, "text/xml");

		var graphObj = {
			directed: false,
			graph: [],
			multigraph: false,
			nodes: [],
			edges: []
		};

		// Getting the <graph> — try childNode scan first, then getElementsByTagName fallback
		var graphElement = null;
		var XMLnodes = xmlDoc.firstElementChild.childNodes;
		for (var k = 0; k < XMLnodes.length; k++) {
			if (isTag(XMLnodes[k], "graph")) {
				graphElement = XMLnodes[k];
				break;
			}
		}
		if (!graphElement) {
			// Namespace-aware fallback: getElementsByTagName ignores namespace prefixes
			var byTag = xmlDoc.getElementsByTagName("graph");
			if (byTag.length > 0) {
				graphElement = byTag[0];
			}
		}
		if (!graphElement) {
			console.error("GXL Viewer: <graph> element not found in the file.");
			return JSON.stringify(graphObj);
		}

		var graphChildren = graphElement.childNodes;

		// Getting nodes and edges
		var nodes = [];
		var edges = [];
		for (var i = 0; i < graphChildren.length; i++)
		{
			if (isTag(graphChildren[i], "node"))
				nodes.push(graphChildren[i]);
			else if (isTag(graphChildren[i], "edge"))
				edges.push(graphChildren[i]);
		}

		for (i = 0 ; i < nodes.length ; i++)
		{
			var n = nodes[i];
			var nodeObj = {};
			
			// Getting the id of the node
			nodeObj.id = n.getAttribute("id");

			var label = "";
			var x_ = null;
			var y_ = null;

			var data = n.childNodes;
			for (var j = 0 ; j < data.length; j++)
			{
				if(isTag(data[j], "attr"))
				{
					var attrName = data[j].getAttribute("name");
					var firstEl = data[j].firstElementChild;
					// Guard: some <attr> elements may have no child element
					if (!firstEl) continue;
					var attrValue = firstEl.textContent;
					
					if (attrName == "x")
					{
						x_ = parseFloat(attrValue);
					}
					else if (attrName == "y")
					{
						y_ = parseFloat(attrValue);
					}
					else
					{
						nodeObj[attrName] = attrValue;
						label += attrName + " = " + attrValue + " | ";
					}
				}
			}

			// Reassign label if specified in the input file
			if (n.getAttribute("label"))
				label = n.getAttribute("label");

			nodeObj.label = label;

			// Assign default position if not specified in the input file
			if (x_ === null || isNaN(x_))
				x_ = Math.random() * 50;
			if (y_ === null || isNaN(y_))
				y_ = Math.random() * 50;

			// Default values
			nodeObj.x = x_;
			nodeObj.y = y_;
			nodeObj.size = 1;
			nodeObj.color = "#000000";

			graphObj.nodes.push(nodeObj);
		}

		var nbEdges = 0;
		for (i = 0 ; i < edges.length ; i++)
		{
			var e = edges[i];
			
			var edgeObj = {};
			edgeObj.id = "e" + nbEdges;
			edgeObj.label = "e" + nbEdges;
			edgeObj.source = e.getAttribute("from");
			edgeObj.target = e.getAttribute("to");
			edgeObj.weight = "1";
			edgeObj.color = "rgba(0, 0, 0, 0.6)"; // low-transparency black
			edgeObj.size = "0.1"; // thinner

			// Getting the attributes of the edge
			var eData = e.childNodes;
			for (var j = 0 ; j < eData.length ; j++) {
				if(isTag(eData[j], "attr")) {
					var attrName = eData[j].getAttribute("name");
					var firstEl = eData[j].firstElementChild;
					if (!firstEl) continue;
					edgeObj[attrName] = firstEl.textContent;
				}
			}
			
			graphObj.edges.push(edgeObj);
			nbEdges++;
		}
		
		// Generate Synthetic File Hubs for Clustering
		var fileHubs = {};
		var palette = ["#FF5733", "#33FF57", "#3357FF", "#F033FF", "#33FFF0", "#FFC733", "#FF3333", "#33FFB8", "#8D33FF", "#FF338D", "#8B4513", "#2E8B57", "#4682B4", "#D2691E", "#9ACD32", "#4B0082", "#FF1493", "#00CED1", "#FF8C00", "#7CFC00"];
		var colorIndex = 0;
		var originalNodeCount = graphObj.nodes.length;

		for (var k = 0; k < originalNodeCount; k++) {
			var n = graphObj.nodes[k];
			var file = n["Source.File"];
			if (file && file.trim() !== "") {
				if (!fileHubs[file]) {
					var hubId = "hub_" + colorIndex + "_" + file.replace(/[^a-zA-Z0-9]/g, '');
					var fileColor = palette[colorIndex % palette.length];
					colorIndex++;
					
					fileHubs[file] = {
						id: hubId,
						color: fileColor
					};
					
					graphObj.nodes.push({
						id: hubId,
						label: file,
						x: Math.random() * 50,
						y: Math.random() * 50,
						size: 0.1,
						color: "transparent",
						hidden: true
					});
				}
				
				// Apply file color to the real node
				n.color = fileHubs[file].color;
				
				// Create synthetic edge to the hub
				graphObj.edges.push({
					id: "e" + nbEdges++,
					label: "synth",
					source: n.id,
					target: fileHubs[file].id,
					weight: "100",
					color: "transparent",
					size: "0",
					hidden: true
				});
			}
		}

		// [DEBUG-hub1] Verify synthetic hub generation
		var hubCount = Object.keys(fileHubs).length;
		var synthEdgeCount = graphObj.edges.length - edges.length;
		console.log('[DEBUG-hub1] Unique files: ' + hubCount);
		console.log('[DEBUG-hub1] Synthetic edges added: ' + synthEdgeCount);
		console.log('[DEBUG-hub1] Total nodes (with hubs): ' + graphObj.nodes.length);
		console.log('[DEBUG-hub1] Total edges (with synth): ' + graphObj.edges.length);
		if (hubCount === 0) {
			console.warn('[DEBUG-hub1] No Source.File attributes found! Checking first 3 nodes:');
			for (var dbg = 0; dbg < Math.min(3, graphObj.nodes.length); dbg++) {
				console.log('[DEBUG-hub1] Node keys:', Object.keys(graphObj.nodes[dbg]));
			}
		} else {
			console.log('[DEBUG-hub1] File hubs:', JSON.stringify(fileHubs));
			// Log a sample synthetic edge
			var lastEdge = graphObj.edges[graphObj.edges.length - 1];
			console.log('[DEBUG-hub1] Sample synth edge:', JSON.stringify(lastEdge));
		}

		return JSON.stringify(graphObj);
	}


	/** 
	 * Function that convert a json string to gxl
	 **/
	$scope.json2gxl = function(sig)
	{
		// GXL header
		var exportedGraph = "<?xml version=\"1.0\"?>\n";
		exportedGraph += "<!DOCTYPE gxl SYSTEM \"http://www.gupro.de/GXL/gxl-1.0.dtd\">\n";
		exportedGraph += "<gxl>\n";
		exportedGraph += "\t<graph>\n";

		// Export nodes
		sig.graph.nodes().forEach(function(n) 
		{
			exportedGraph += "\t\t<node id=\"" + "node_id" + "\">\n";

			// TODO
			// get attributes
			exportedGraph += "\t\t</node>\n";
		});

		// Export edges
		sig.graph.edges().forEach(function(e) 
		{
			exportedGraph += "\t\t<edge id=\"" + "edge_id" + "\">\n";

			// TODO
			// get attributes
			exportedGraph += "\t\t</edge>\n";
		});

		// Finalise the GXL string 
		exportedGraph += "\t</graph>\n";
		exportedGraph += "</gxl>";

		return exportedGraph;


	}


	/* ---------------------------- */
	/* GRAPH UI FUNCTIONS           */
	/* ---------------------------- */

	/** Function to deselect node (restore original colors) **/
	$scope.deselectNode = function()
	{
		sig.graph.nodes().forEach(function(n) {
			n.color = n.originalColor || n.color;
			n.size = n.originalSize || n.size;
		});
		sig.graph.edges().forEach(function(e) {
			e.color = e.originalColor || e.color;
			e.size = e.originalSize || e.size;
		});
		sig.refresh();
	};

	/** Function to initialize the graph **/
	$scope.init = function()
	{

		/* Preprocessing each node */
		sig.graph.nodes().forEach(function(n) {

			// Set the shape of the node as square
			n.type = "square";	
			
			// Set size based on degree statically
			n.size = sig.graph.degree(n.id) || 1;
			
			// Save original attributes
			n.originalColor = (n.color)? n.color : sig.settings('defaultNodeColor');
			n.originalSize = (n.size)? n.size : sig.settings('minNodeSize');
			n.originalLabel = (n.label)? n.label : "";
		});
				
		/* Preprocessing each edge*/
		sig.graph.edges().forEach(function(e) {
		
			// Save original attributes
			e.originalColor = (e.color)? e.color : sig.settings('defaultEdgeColor');
			e.originalSize = (e.size)? e.size : sig.settings('minNodeSize');
			e.originalLabel = (e.label)? e.label : "";

		});

		// SET LISTENERS
		
		// Neighborhood highlighting on hover
		sig.bind('overNode', function(e) {
			var nodeId = e.data.node.id;
			var neighbors = {};
			
			// Find all neighbors
			sig.graph.edges().forEach(function(edge) {
				if (edge.source === nodeId || edge.target === nodeId) {
					neighbors[edge.source] = 1;
					neighbors[edge.target] = 1;
				}
			});
			neighbors[nodeId] = 1;
			
			// Dim non-neighbors
			sig.graph.nodes().forEach(function(n) {
				if (!neighbors[n.id]) {
					n.color = '#eeeeee';
				}
			});
			
			// Dim non-connected edges
			sig.graph.edges().forEach(function(edge) {
				if (edge.source !== nodeId && edge.target !== nodeId) {
					edge.color = 'transparent';
				} else {
					edge.color = '#333333'; // Highlight connected edges
				}
			});
			
			sig.refresh();
		});

		sig.bind('outNode', function(e) {
			sig.graph.nodes().forEach(function(n) {
				n.color = n.originalColor || n.color;
			});
			sig.graph.edges().forEach(function(edge) {
				edge.color = edge.originalColor || edge.color;
			});
			sig.refresh();
		});

		// When the background is left clicked, not for dragging
		sig.bind('clickStage', function(e) {
			if (!e.data.captor.isDragging){
				// Deselecting the node
				$scope.deselectNode();
				
				// Resetting the camera
				sigma.misc.animation.camera(
					sig.camera, 
					{
						x: 0, 
						y: 0,
						ratio: 1
					}, 
					{duration: 300}
				);
			}
		});
		
		// Apply initial node sizing based on slider
		$scope.updateNodeSizes();
	};


	/** Function that display a graph that has been load by sigma **/
	$scope.display = function()
	{
		// Resetting the displaying
		sigma.misc.animation.camera(
			sig.camera, 
			{
				x: 0, 
				y: 0,
				ratio: 1
			}, 
			{duration: 1}
		);

		// Displaying the graph
		sig.refresh();
	}


}]);