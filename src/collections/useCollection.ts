import { BaseCollection } from "./BaseCollection";
import { Collection, CollectionContext } from "./CollectionProvider";
import { useContext } from "react";

export const useCollection = <T extends BaseCollection>(collectionId: string) => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context.getCollection(collectionId) as T;
};

