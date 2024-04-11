import { Editor, TLArrowShape, TLShape, TLShapeId } from "@tldraw/tldraw";
import { ColaLink, ColaNode, BoundArrow } from "./types";

const LINK_DISTANCE = 100;

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
