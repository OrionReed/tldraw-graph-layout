import { Layout } from 'webcola';
import { BaseCollection } from '../collections/BaseCollection';
import { Editor, Geometry2d, TLArrowShape, TLShape, TLShapeId } from '@tldraw/tldraw';

type ColaNode = {
  id: TLShapeId;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};
type ColaLink = {
  source: TLShapeId
  target: TLShapeId
};

type LinkTargets = {
  source: ColaNode
  target: ColaNode
}

export class GraphLayoutCollection extends BaseCollection {
  override id = 'graphLayout';
  graphSim: Layout;
  animFrame = -1;
  colaNodes: Map<TLShapeId, ColaNode> = new Map();
  colaLinks: Set<ColaLink> = new Set();
  colaConstraints: any[] = [];
  public isRunning = false

  constructor(editor: Editor) {
    super(editor)
    this.graphSim = new Layout();
    this.startSimulation();

    // TODO: think about other ways to do this kind of thing
    window.addEventListener('toggleGraphLayoutEvent', () => {
      if (this.isRunning) this.stopSimulation()
      else this.startSimulation()
    })
  }

  override onAdd(shapes: TLShape[]) {
    super.onAdd(shapes);
    for (const shape of shapes) {
      if (shape.type === "arrow")
        this.addArrow(shape as TLArrowShape);
      else
        this.addGeo(shape);

    }
    this.updateGraphElements();
  }

  override onRemove(shapes: TLShape[]) {
    super.onRemove(shapes);

    const removedShapeIds = new Set(shapes.map(shape => shape.id));

    for (const shape of shapes) {
      this.colaNodes.delete(shape.id);
    }

    this.colaLinks = new Set([...this.colaLinks].filter(
      link => !removedShapeIds.has(link.source) && !removedShapeIds.has(link.target)
    ));

    this.updateGraphElements();
  }

  override clear() {
    super.clear();
    this.stopSimulation();
  }

  step = () => {
    this.graphSim.start(1, 1, 1, 0, true, false);
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

      // TODO: batch updates?
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
      const link: ColaLink = {
        source: source.id,
        target: target.id
      };
      this.colaLinks.add(link);
    }
  }

  addGeo = (shape: TLShape) => {
    const geo = this.editor.getShapeGeometry(shape);
    const node: ColaNode = {
      id: shape.id,
      x: shape.x + geo.center.x,
      y: shape.y + geo.center.y,
      width: geo.center.x * 2,
      height: geo.center.y * 2,
      rotation: shape.rotation
    };
    this.colaNodes.set(shape.id, node);
  }

  updateGraphElements() {
    const nodes = [...this.colaNodes.values()];
    const nodeIdToIndex = new Map(nodes.map((n, i) => [n.id, i]));
    const links = [...this.colaLinks].map(l => ({
      source: nodeIdToIndex.get(l.source),
      target: nodeIdToIndex.get(l.target)
    }));

    this.graphSim
      .nodes(nodes)
      .links(links)
      .avoidOverlaps(true)
      .linkDistance((edge) => calcEdgeDistance(edge as LinkTargets))
      .handleDisconnected(true)
    // .constraints(this.colaConstraints);
  }
  startSimulation() {
    if (this.isRunning) return;
    this.isRunning = true;
    const simLoop = () => {
      this.step();
      this.animFrame = requestAnimationFrame(simLoop);
    };
    simLoop();
  }
  stopSimulation() {
    if (!this.isRunning) return;
    cancelAnimationFrame(this.animFrame);
    this.isRunning = false;
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

function calcEdgeDistance(edge: LinkTargets) {
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
