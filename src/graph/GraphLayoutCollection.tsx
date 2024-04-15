import { Layout } from 'webcola';
import { BaseCollection } from '@collections';
import { Editor, TLArrowShape, TLGeoShape, TLShape, TLShapeId } from '@tldraw/tldraw';

type ColaNode = {
  id: TLShapeId;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color?: string;
};
type ColaIdLink = {
  source: TLShapeId
  target: TLShapeId
};
type ColaNodeLink = {
  source: ColaNode
  target: ColaNode
};

type AlignmentConstraint = {
  type: 'alignment',
  axis: 'x' | 'y',
  offsets: { node: TLShapeId, offset: number }[]
}

type ColaConstraint = AlignmentConstraint

export class GraphLayoutCollection extends BaseCollection {
  override id = 'graph';
  graphSim: Layout;
  animFrame = -1;
  colaNodes: Map<TLShapeId, ColaNode> = new Map();
  colaLinks: Map<TLShapeId, ColaIdLink> = new Map();
  colaConstraints: ColaConstraint[] = [];

  constructor(editor: Editor) {
    super(editor)
    this.graphSim = new Layout();
    const simLoop = () => {
      this.step();
      this.animFrame = requestAnimationFrame(simLoop);
    };
    simLoop();
  }

  override onAdd(shapes: TLShape[]) {
    for (const shape of shapes) {
      if (shape.type !== "arrow") {
        this.addGeo(shape);
      }
      else {
        this.addArrow(shape as TLArrowShape);
      }
    }
    this.refreshGraph();
  }

  override onRemove(shapes: TLShape[]) {
    const removedShapeIds = new Set(shapes.map(shape => shape.id));

    for (const shape of shapes) {
      this.colaNodes.delete(shape.id);
      this.colaLinks.delete(shape.id);
    }

    // Filter out links where either source or target has been removed
    for (const [key, link] of this.colaLinks) {
      if (removedShapeIds.has(link.source) || removedShapeIds.has(link.target)) {
        this.colaLinks.delete(key);
      }
    }

    this.refreshGraph();
  }

  override onShapeChange(prev: TLShape, next: TLShape) {
    if (prev.type === 'geo' && next.type === 'geo') {
      const prevShape = prev as TLGeoShape
      const nextShape = next as TLGeoShape
      // update color if its changed and refresh constraints which use this
      if (prevShape.props.color !== nextShape.props.color) {
        const existingNode = this.colaNodes.get(next.id);
        if (existingNode) {
          this.colaNodes.set(next.id, {
            ...existingNode,
            color: nextShape.props.color,
          });
        }
        this.refreshGraph();
      }
    }
  }

  step = () => {
    this.graphSim.start(1, 0, 0, 0, true, false);
    for (const node of this.graphSim.nodes() as ColaNode[]) {

      const shape = this.editor.getShape(node.id);
      const { w, h } = this.editor.getShapeGeometry(node.id).bounds
      if (!shape) continue;

      const { x, y } = getCornerToCenterOffset(w, h, shape.rotation);

      // Fix positions if we're dragging them
      if (this.editor.getSelectedShapeIds().includes(node.id)) {
        node.x = shape.x + x;
        node.y = shape.y + y;
      }

      // Update shape props
      node.width = w;
      node.height = h;
      node.rotation = shape.rotation;

      this.editor.updateShape({
        id: node.id,
        type: "geo",
        x: node.x - x,
        y: node.y - y,
      });
    }
  };

  addArrow = (arrow: TLArrowShape) => {
    const source = arrow.props.start.type === 'binding' ? this.editor.getShape(arrow.props.start.boundShapeId) : undefined;
    const target = arrow.props.end.type === 'binding' ? this.editor.getShape(arrow.props.end.boundShapeId) : undefined;
    if (source && target) {
      const link: ColaIdLink = {
        source: source.id,
        target: target.id
      };
      this.colaLinks.set(arrow.id, link);
    }
  }

  addGeo = (shape: TLShape) => {
    const { w, h } = this.editor.getShapeGeometry(shape).bounds
    const { x, y } = getCornerToCenterOffset(w, h, shape.rotation)
    const node: ColaNode = {
      id: shape.id,
      x: shape.x + x,
      y: shape.y + y,
      width: w,
      height: h,
      rotation: shape.rotation,
      color: (shape.props as any).color
    };
    this.colaNodes.set(shape.id, node);
  }

  refreshGraph() {
    // TODO: remove this hardcoded behaviour
    this.editor.selectNone()
    this.refreshConstraints();
    const nodes = [...this.colaNodes.values()];
    const nodeIdToIndex = new Map(nodes.map((n, i) => [n.id, i]));
    // Convert the Map values to an array for processing
    const links = Array.from(this.colaLinks.values()).map(l => ({
      source: nodeIdToIndex.get(l.source),
      target: nodeIdToIndex.get(l.target)
    }));

    const constraints = this.colaConstraints.map(constraint => {
      if (constraint.type === 'alignment') {
        return {
          ...constraint,
          offsets: constraint.offsets.map(offset => ({
            node: nodeIdToIndex.get(offset.node),
            offset: offset.offset
          }))
        };
      }
      return constraint;
    });

    this.graphSim
      .nodes(nodes)
      // @ts-ignore
      .links(links)
      .constraints(constraints)
      // you could use .linkDistance(250) too, which is stable but does not handle size/rotation
      .linkDistance((edge) => calcEdgeDistance(edge as ColaNodeLink))
      .avoidOverlaps(true)
      .handleDisconnected(true)
  }

  refreshConstraints() {
    const alignmentConstraintX: AlignmentConstraint = {
      type: 'alignment',
      axis: 'x',
      offsets: [],
    };
    const alignmentConstraintY: AlignmentConstraint = {
      type: 'alignment',
      axis: 'y',
      offsets: [],
    };

    // Iterate over shapes and generate constraints based on conditions
    for (const node of this.colaNodes.values()) {
      if (node.color === "red") {
        // Add alignment offset for red shapes
        alignmentConstraintX.offsets.push({ node: node.id, offset: 0 });
      }
      if (node.color === "blue") {
        // Add alignment offset for red shapes
        alignmentConstraintY.offsets.push({ node: node.id, offset: 0 });
      }
    }

    const constraints = [];
    if (alignmentConstraintX.offsets.length > 0) {
      constraints.push(alignmentConstraintX);
    }
    if (alignmentConstraintY.offsets.length > 0) {
      constraints.push(alignmentConstraintY);
    }
    this.colaConstraints = constraints;
  }
}

function getCornerToCenterOffset(w: number, h: number, rotation: number) {

  // Calculate the center coordinates relative to the top-left corner
  const centerX = w / 2;
  const centerY = h / 2;

  // Apply rotation to the center coordinates
  const rotatedCenterX = centerX * Math.cos(rotation) - centerY * Math.sin(rotation);
  const rotatedCenterY = centerX * Math.sin(rotation) + centerY * Math.cos(rotation);

  return { x: rotatedCenterX, y: rotatedCenterY };
}

function calcEdgeDistance(edge: ColaNodeLink) {
  const LINK_DISTANCE = 100;

  // horizontal and vertical distances between centers
  const dx = edge.target.x - edge.source.x;
  const dy = edge.target.y - edge.source.y;

  // the angles of the nodes in radians
  const sourceAngle = edge.source.rotation;
  const targetAngle = edge.target.rotation;

  // Calculate the rotated dimensions of the nodes
  const sourceWidth = Math.abs(edge.source.width * Math.cos(sourceAngle)) + Math.abs(edge.source.height * Math.sin(sourceAngle));
  const sourceHeight = Math.abs(edge.source.width * Math.sin(sourceAngle)) + Math.abs(edge.source.height * Math.cos(sourceAngle));
  const targetWidth = Math.abs(edge.target.width * Math.cos(targetAngle)) + Math.abs(edge.target.height * Math.sin(targetAngle));
  const targetHeight = Math.abs(edge.target.width * Math.sin(targetAngle)) + Math.abs(edge.target.height * Math.cos(targetAngle));

  // Calculate edge-to-edge distances
  const horizontalGap = Math.max(0, Math.abs(dx) - (sourceWidth + targetWidth) / 2);
  const verticalGap = Math.max(0, Math.abs(dy) - (sourceHeight + targetHeight) / 2);

  // Calculate straight-line distance between the centers of the nodes
  const centerToCenterDistance = Math.sqrt(dx * dx + dy * dy);

  // Adjust the distance by subtracting the edge-to-edge distance and adding the desired travel distance
  const adjustedDistance = centerToCenterDistance -
    Math.sqrt(horizontalGap * horizontalGap + verticalGap * verticalGap) +
    LINK_DISTANCE;

  return adjustedDistance;
};
