import {
	Editor,
	Geometry2d,
	TLArrowShape,
	TLShape,
	TLShapeId,
} from "@tldraw/tldraw";
import { useEffect } from "react";
import { Layout } from "webcola";
import { ANIMATE, LINK_DISTANCE } from "./config";

type GraphNode = {
	id: TLShapeId;
	x: number;
	y: number;
	width: number;
	height: number;
};
type GraphEdgeIndexPair = { source: number; target: number };
type BoundArrow = {
	props: { start: { boundShapeId: string }; end: { boundShapeId: string } };
};
type ColaLink = {
	source: { x: number; y: number; width: number; height: number; };
	target: { x: number; y: number; width: number; height: number; };
}

const calculateLinkDistance = (link: ColaLink) => {
	// Calculate horizontal and vertical distances between centers
	const dx = Math.abs(link.target.x - link.source.x);
	const dy = Math.abs(link.target.y - link.source.y);

	// Calculate edge-to-edge distances
	const horizontalGap = Math.max(
		0,
		dx - (link.source.width + link.target.width) / 2,
	);
	const verticalGap = Math.max(
		0,
		dy - (link.source.height + link.target.height) / 2,
	);

	// Calculate straight-line distance between the centers of the nodes
	const centerToCenterDistance = Math.sqrt(dx * dx + dy * dy);

	// Adjust the distance by subtracting the edge-to-edge distance and adding the desired travel distance
	const adjustedDistance =
		centerToCenterDistance -
		Math.sqrt(horizontalGap * horizontalGap + verticalGap * verticalGap) +
		LINK_DISTANCE;

	return adjustedDistance;
}

const createGraphFromSelection = (editor: Editor) => {
	const arrowShapes: TLArrowShape[] = [];
	const nodeShapes: TLShape[] = [];
	const constrainVertical: Set<number> = new Set();
	const colaNodes: GraphNode[] = [];
	const colaLinks: GraphEdgeIndexPair[] = [];
	const indexLookup = new Map<TLShapeId, number>();

	// Sort shapes into arrows and geo shapes
	for (const shape of editor.getSelectedShapes()) {
		if (shape.type === "arrow") {
			arrowShapes.push(shape as TLArrowShape);
		} else {
			nodeShapes.push(shape);
		}
	}

	// Create graph nodes
	nodeShapes.forEach((s, i) => {
		const geo = editor.getShapeGeometry(s);
		const graphNode = {
			// index, x, y, width, height are used by cola.js
			index: i,
			x: s.x + geo.center.x,
			y: s.y + geo.center.y,
			width: geo.center.x * 2,
			height: geo.center.y * 2,
			// these are used to update the shape positions after layout
			id: s.id,
			fixed: "color" in s.props && s.props.color === "red" ? 1 : 0,
			color: "color" in s.props ? s.props.color : "black",
		};
		colaNodes.push(graphNode);
		indexLookup.set(s.id, i);
	});

	for (const arrow of arrowShapes as (TLArrowShape & BoundArrow)[]) {
		const startIndex = indexLookup.get(
			arrow.props.start.boundShapeId as TLShapeId,
		);
		const endIndex = indexLookup.get(
			arrow.props.end.boundShapeId as TLShapeId,
		);

		// Skip if either start or end shape is not in the selection
		if (startIndex === undefined || endIndex === undefined) return;

		// Add constraints for light-blue arrows
		// TODO: make this parametrised/more interesting
		if (arrow.props.color === "light-blue") {
			constrainVertical.add(startIndex);
			constrainVertical.add(endIndex);
			return;
		}
		colaLinks.push({ source: startIndex, target: endIndex });
	};

	// Setup constraints
	const constraints =
		constrainVertical.size > 0
			? [
				{
					type: "alignment",
					axis: "x",
					offsets: [...constrainVertical].map((nodeIndex) => ({
						node: nodeIndex,
						offset: 0,
					})),
				},
			]
			: [];
	return { colaNodes, colaLinks, constraints };
}

const step = (editor: Editor, layout: Layout) => {
	layout.start(1, 1, 1, 0, true, false);
	for (const node of layout.nodes() as GraphNode[]) {

		// Update positions if we're dragging them
		// TODO: avoid this expensive check
		if (editor.getSelectedShapeIds().includes(node.id)) {
			const shape = editor.getShape(node.id);
			if (!shape) continue;
			node.x = shape.x + node.width / 2;
			node.y = shape.y + node.height / 2;
		}

		// Update shape sizes if they've changed
		// TODO: avoid this expensive check
		const geo = editor.getShapeGeometry(node.id);
		node.width = geo.center.x * 2;
		node.height = geo.center.y * 2;

		// TODO: batch updates?
		if (!ANIMATE) {
			editor.updateShape({
				id: node.id,
				type: "geo",
				x: node.x - node.width / 2,
				y: node.y - node.height / 2,
			});
		}
		else {
			editor.animateShape({ id: node.id, type: 'geo', x: node.x - node.width / 2, y: node.y - node.height / 2 }, { duration: 50, easing: (t) => t * t })
		}
	}
}

export const useGraphLayout = (editor: Editor, enabled: boolean) => {
	useEffect(() => {
		if (!enabled) return;

		const { colaNodes, colaLinks, constraints } = createGraphFromSelection(editor);

		// Deselect so that shapes can move when first enabling graph layout.
		// We freeze positions of selected shapes in the layout loop.
		editor.selectNone();

		// Create layout
		const layout = new Layout()
			.nodes(colaNodes)
			.links(colaLinks)
			.avoidOverlaps(true)
			.linkDistance((link) => calculateLinkDistance(link as ColaLink))
			.handleDisconnected(true)
			.constraints(constraints);

		// Compute layout
		let animFrame: number;
		const simLoop = () => {
			step(editor, layout);
			animFrame = requestAnimationFrame(simLoop);
		};

		simLoop();

		return () => {
			cancelAnimationFrame(animFrame);
		};
	}, [enabled]);
};
