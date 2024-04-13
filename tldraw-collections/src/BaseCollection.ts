import { Editor, TLShape, TLShapeId } from '@tldraw/tldraw';

/**
 * A PoC abstract collections class for @tldraw.
 */
export abstract class BaseCollection {
  /** A unique identifier for the collection. */
  abstract id: string;
  /** A map containing the shapes that belong to this collection, keyed by their IDs. */
  protected shapes: Map<TLShapeId, TLShape> = new Map();
  /** A reference to the \@tldraw Editor instance. */
  protected editor: Editor;

  // TODO: Maybe pass callback to replace updateShape so only CollectionProvider can call it
  public constructor(editor: Editor) {
    this.editor = editor;
  }

  /**
   * Called when shapes are added to the collection.
   * @param shapes The shapes being added to the collection.
   */
  protected onAdd(_shapes: TLShape[]): void { }

  /**
   * Called when shapes are removed from the collection.
   * @param shapes The shapes being removed from the collection.
   */
  protected onRemove(_shapes: TLShape[]) { }

  /**
   * Called when the collection is cleared.
   */
  protected onClear() { }

  /**
   * Called when the membership of the collection changes (i.e., when shapes are added or removed).
   */
  protected onMembershipChange() { }


  /**
   * Called when the properties of a shape belonging to the collection change.
   * @param prev The previous version of the shape before the change.
   * @param next The updated version of the shape after the change.
   */
  protected onShapeChange(_prev: TLShape, _next: TLShape) { }

  /**
   * Adds the specified shapes to the collection.
   * @param shapes The shapes to add to the collection.
   */
  public add(shapes: TLShape[]) {
    shapes.forEach(shape => {
      this.shapes.set(shape.id, shape)
    });
    this.onAdd(shapes);
    this.onMembershipChange();
  }

  /**
   * Removes the specified shapes from the collection.
   * @param shapes The shapes to remove from the collection.
   */
  public remove(shapes: TLShape[]) {
    shapes.forEach(shape => {
      this.shapes.delete(shape.id);
    });
    this.onRemove(shapes);
    this.onMembershipChange();
  }

  /**
   * Clears all shapes from the collection.
   */
  public clear() {
    this.shapes.clear()
    this.onClear()
    this.onMembershipChange()
  }

  /**
   * Returns the map of shapes in the collection.
   * @returns The map of shapes in the collection, keyed by their IDs.
   */
  public getShapes(): Map<TLShapeId, TLShape> {
    return this.shapes;
  }

  public get size(): number {
    return this.shapes.size;
  }

  public _onShapeChange(prev: TLShape, next: TLShape) {
    this.shapes.set(next.id, next)
    this.onShapeChange(prev, next)
  }
}