import { BaseCollection } from '../collections/BaseCollection';
import { Editor, TLShape } from '@tldraw/tldraw';

export class GraphLayoutCollection extends BaseCollection {
  override id = 'graphLayout';

  constructor(editor: Editor) {
    super(editor)
    console.log('constructed');
  }

  override onAdd(shape: TLShape) {
    super.onAdd(shape);
    console.log(`adding shape ${shape.id}`);
    // Update the graph layout when a shape is added
    // ...
  }

  override onRemove(shape: TLShape) {
    super.onRemove(shape);
    console.log(`removing shape ${shape.id}`);
    // Update the graph layout when a shape is removed
    // ...
  }
}