import { useContext } from "react";
import { CollectionContext } from "./CollectionProvider";
import { BaseCollection } from "./BaseCollection";

export const useCollection = <T extends BaseCollection = BaseCollection>(collectionId: string): T => {
  const context = useContext(CollectionContext);

  if (!context) {
    throw new Error("CollectionContext not found.");
  }

  const collection = context.get(collectionId);

  if (!collection) {
    throw new Error(`Collection with id '${collectionId}' not found`);
  }

  return collection as T;
};