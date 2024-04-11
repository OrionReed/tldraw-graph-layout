import { Layout } from 'webcola';
import { BaseCollection } from '../collections/BaseCollection';
import { Editor, TLArrowShape, TLShape, TLShapeId } from '@tldraw/tldraw';

type ColaNode = {
  id: TLShapeId;
  x: number;
  y: number;
  width: number;
  height: number;
};
type ColaLink = {
  source: TLShapeId
  target: TLShapeId
};

type LinkTargets = {
  source: {
    x: number
    y: number
    width: number
    height: number
  }
  target: {
    x: number
    y: number
    width: number
    height: number
  }
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
    const { colaNodes, colaLinks } = this.addShapes(shapes);

    for (const node of colaNodes) {
      this.colaNodes.set(node.id, node);
    }

    for (const link of colaLinks) {
      this.colaLinks.add(link);
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

      // Fix positions if we're dragging them
      // TODO: avoid this expensive check
      if (this.editor.getSelectedShapeIds().includes(node.id)) {
        const shape = this.editor.getShape(node.id);
        if (!shape) continue;
        node.x = shape.x + node.width / 2;
        node.y = shape.y + node.height / 2;
      }

      // Update shape sizes if they've changed
      // TODO: avoid this expensive check
      const geo = this.editor.getShapeGeometry(node.id);
      node.width = geo.center.x * 2;
      node.height = geo.center.y * 2;

      // TODO: batch updates?
      this.editor.updateShape({
        id: node.id,
        type: "geo",
        x: node.x - geo.center.x,
        y: node.y - geo.center.y,
      });
    }
  };

  addShapes = (shapes: TLShape[]) => {
    const colaNodes: ColaNode[] = [];
    const colaLinks: ColaLink[] = [];

    for (const shape of shapes) {
      if (shape.type === "arrow") {
        const arrow = shape as TLArrowShape;
        const source = arrow.props.start.type === 'binding' ? this.editor.getShape(arrow.props.start.boundShapeId) : undefined;
        const target = arrow.props.end.type === 'binding' ? this.editor.getShape(arrow.props.end.boundShapeId) : undefined;
        if (source && target) {
          const link: ColaLink = {
            source: source.id,
            target: target.id
          };
          colaLinks.push(link);
        }
      } else {
        const geo = this.editor.getShapeGeometry(shape);
        const node: ColaNode = {
          id: shape.id,
          x: shape.x + geo.center.x,
          y: shape.y + geo.center.y,
          width: geo.center.x * 2,
          height: geo.center.y * 2
        };
        colaNodes.push(node);
      }
    }

    return { colaNodes, colaLinks };
  };

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
      .linkDistance((edge) => this.calcEdgeDistance(edge as LinkTargets))
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

  calcEdgeDistance(edge: LinkTargets) {
    const LINK_DISTANCE = 100;
    // Calculate horizontal and vertical distances between centers
    const dx = Math.abs(edge.target.x - edge.source.x);
    const dy = Math.abs(edge.target.y - edge.source.y);

    // Calculate edge-to-edge distances
    const horizontalGap = Math.max(
      0,
      dx - (edge.source.width + edge.target.width) / 2
    );
    const verticalGap = Math.max(
      0,
      dy - (edge.source.height + edge.target.height) / 2
    );

    // Calculate straight-line distance between the centers of the nodes
    const centerToCenterDistance = Math.sqrt(dx * dx + dy * dy);

    // Adjust the distance by subtracting the edge-to-edge distance and adding the desired travel distance
    const adjustedDistance = centerToCenterDistance -
      Math.sqrt(horizontalGap * horizontalGap + verticalGap * verticalGap) +
      LINK_DISTANCE;

    return adjustedDistance;
  };

}

