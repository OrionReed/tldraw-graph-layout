import React, { createContext, useEffect, useState } from 'react';
import { TLShape, TLRecord, Editor } from '@tldraw/tldraw';
import { BaseCollection } from './src/BaseCollection';

interface CollectionContextValue {
  collections: BaseCollection[];
  getCollection: (id: string) => BaseCollection | undefined;
}

type Collection = (new (editor: Editor) => BaseCollection)

interface CollectionProviderProps {
  /** An instance of the \@tldraw editor, should be passed from onMount in <Tldraw>. */
  editor: Editor | undefined;
  /** A list of collections which should extend BaseCollection */
  collections: Collection[];
  showBounds?: boolean
  children: React.ReactNode;
}

const CollectionContext = createContext<CollectionContextValue | undefined>(undefined);

/**
 * CollectionProvider is a React component that manages the lifecycle and behavior of collections in @tldraw.
 * It instantiates the provided collection classes, associates them with the editor, and handles shape changes and deletions.
 */
const CollectionProvider: React.FC<CollectionProviderProps> = ({ editor, collections: collectionClasses, showBounds, children, }) => {
  const [_collections, setCollections] = useState<BaseCollection[]>([]);

  // Instantiate collection classes and call onCreate when the editor and collectionClasses change
  useEffect(() => {
    if (editor && collectionClasses.length > 0) {
      const instantiatedCollections = collectionClasses.map(ColClass => new ColClass(editor));
      setCollections(instantiatedCollections);
    }
  }, [editor, collectionClasses]);

  // Handle shape property changes
  const handleShapeChange = (prev: TLShape, next: TLShape) => {
    for (const col of _collections) {
      if (col.getShapes().has(next.id)) {
        col._onShapeChange(prev, next);
      }
    }
  };

  // Subscribe to shape changes in the editor
  useEffect(() => {
    if (editor) {
      editor.store.onAfterChange = (prev: TLRecord, next: TLRecord) => {
        const prevShape = prev as TLShape;
        const nextShape = next as TLShape;
        if (prevShape.props !== nextShape.props) {
          handleShapeChange(prevShape, nextShape);
        }
      };
    }
  }, [editor, handleShapeChange]);

  // Handle shape deletions
  const handleShapeDelete = (shape: TLShape) => {
    for (const col of _collections) {
      col.remove([shape]);
    }
  };

  // Subscribe to shape deletions in the editor
  useEffect(() => {
    if (editor) {
      editor.store.onAfterDelete = (prev: TLRecord, _: string) => {
        if (prev.typeName === 'shape')
          handleShapeDelete(prev);
      };
    }
  }, [editor, handleShapeDelete]);

  // Get a collection by its ID
  const getCollection = (id: string) => {
    return _collections.find((collection) => collection.id === id);
  };

  const value: CollectionContextValue = {
    collections: _collections,
    getCollection,
  };

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
};

export { CollectionContext, CollectionProvider, type Collection };