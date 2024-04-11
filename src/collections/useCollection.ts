import { CollectionContext } from "./CollectionProvider";
import { useContext } from "react";

export const useCollection = (collectionId: string) => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context.getCollection(collectionId);
};
