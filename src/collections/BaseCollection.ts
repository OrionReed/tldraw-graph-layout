import { Editor, TLShape, TLShapeId } from '@tldraw/tldraw';

/**
 * BaseCollection is an abstract class that serves as a base for creating named collections of shapes in \@tldraw.
 * It provides a set of methods and properties that allow you to manage the membership and behavior of shapes within a collection.
 */
export abstract class BaseCollection {
  /** A unique identifier for the collection. */
  abstract id: string;
  /** A set containing the shapes that belong to this collection. */
  protected shapes: Map<TLShapeId, TLShape> = new Map();
  /** A reference to the \@tldraw Editor instance. */
  protected editor: Editor;

  public constructor(editor: Editor) {
    this.editor = editor;
  }

  /**
   * Called when a shape is added to the collection.
   * @param shape The shape being added to the collection.
   */
  protected onAdd(shapes: TLShape[]) {
    this.onMembershipChange();
  }

  /**
   * Called when a shape is removed from the collection.
   * @param shape The shape being removed from the collection.
   */
  protected onRemove(shapes: TLShape[]) {
    this.onMembershipChange();
  }

  /**
   * Called when the membership of the collection changes (i.e., when shapes are added or removed).
   */
  protected onMembershipChange() { }

  /**
   * Called when the properties of a shape belonging to the collection change.
   * @param shape The shape whose properties have changed.
   */
  protected onShapePropsChange(shape: TLShape) { }

  public add(shapes: TLShape[]) {
    shapes.forEach(shape => {
      this.shapes.set(shape.id, shape)
      this.onAdd(shapes);
    });
  }

  public remove(shapes: TLShape[]) {
    shapes.forEach(shape => {
      this.shapes.delete(shape.id);
    });
    this.onRemove(shapes);
  }

  public clear() {
    this.shapes.clear()
    this.onMembershipChange()
  }

  public getShapes(): Map<TLShapeId, TLShape> {
    return this.shapes;
  }

  public updateShapes(shapes: TLShape[]) {
    shapes.forEach(shape => {
      this.shapes.set(shape.id, shape)
      this.onShapePropsChange(shape)
    })
  }
}