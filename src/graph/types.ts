import { TLShapeId } from "@tldraw/tldraw";

export type ColaNode = {
  id: TLShapeId;
  x: number;
  y: number;
  width: number;
  height: number;
};
export type ColaLink = {
  source: { x: number; y: number; width: number; height: number; };
  target: { x: number; y: number; width: number; height: number; };
};
export type BoundArrow = {
  props: { start: { boundShapeId: string; }; end: { boundShapeId: string; }; };
};
