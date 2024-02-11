import { ANIMATE, LINK_DISTANCE } from "./config";
import { Editor, TLArrowShape, TLShape, TLShapeId } from "@tldraw/tldraw";
import { Layout } from "webcola";
import { ColaLink, ColaNode, BoundArrow } from "./types";

export const calculateLinkDistance = (link: ColaLink) => {
  // Calculate horizontal and vertical distances between centers
  const dx = Math.abs(link.target.x - link.source.x);
  const dy = Math.abs(link.target.y - link.source.y);

  // Calculate edge-to-edge distances
  const horizontalGap = Math.max(
    0,
    dx - (link.source.width + link.target.width) / 2
  );
  const verticalGap = Math.max(
    0,
    dy - (link.source.height + link.target.height) / 2
  );

  // Calculate straight-line distance between the centers of the nodes
  const centerToCenterDistance = Math.sqrt(dx * dx + dy * dy);

  // Adjust the distance by subtracting the edge-to-edge distance and adding the desired travel distance
  const adjustedDistance = centerToCenterDistance -
    Math.sqrt(horizontalGap * horizontalGap + verticalGap * verticalGap) +
    LINK_DISTANCE;

  return adjustedDistance;
};

export const createGraphFromSelection = (editor: Editor) => {
  const arrowShapes: TLArrowShape[] = [];
  const nodeShapes: TLShape[] = [];
  const constrainVertical: Set<number> = new Set();
  const colaNodes: ColaNode[] = [];
  const colaLinks: { source: number; target: number; }[] = [];
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
      arrow.props.start.boundShapeId as TLShapeId
    );
    const endIndex = indexLookup.get(
      arrow.props.end.boundShapeId as TLShapeId
    );

    // Skip if either start or end shape is not in the selection
    if (startIndex === undefined || endIndex === undefined) continue;

    // Add constraints for light-blue arrows
    // TODO: make this parameterised/more interesting
    if (arrow.props.color === "light-blue") {
      constrainVertical.add(startIndex);
      constrainVertical.add(endIndex);
      continue;
    }
    colaLinks.push({ source: startIndex, target: endIndex });
  };

  // Setup constraints
  const constraints = constrainVertical.size > 0
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
};
export const step = (editor: Editor, layout: Layout) => {
  layout.start(1, 1, 1, 0, true, false);
  for (const node of layout.nodes() as ColaNode[]) {

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
        x: node.x - geo.center.x,
        y: node.y - geo.center.y,
      });
    }
    else {
      editor.animateShape({ id: node.id, type: 'geo', x: node.x - geo.center.x, y: node.y - geo.center.y }, { duration: 20, easing: (t) => t * t });
    }
  }
};

