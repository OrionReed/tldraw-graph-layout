import { calculateLinkDistance, createGraphFromSelection, step } from "./graphUtils";
import { Editor } from "@tldraw/tldraw";
import { useEffect } from "react";
import { Layout } from "webcola";
import { ColaLink } from "./types";


export const useGraphLayout = (editor: Editor, enabled: boolean) => {
	useEffect(() => {
		if (!enabled) return;

		const { colaNodes, colaLinks, constraints } = createGraphFromSelection(editor);

		// Deselect so that shapes can move when first enabling graph layout.
		// We freeze positions of selected shapes in the layout loop.
		editor.selectNone();

		// Create layout
		const layout = new Layout()
			.nodes(colaNodes)
			.links(colaLinks)
			.avoidOverlaps(true)
			.linkDistance((link) => calculateLinkDistance(link as ColaLink))
			.handleDisconnected(true)
			.constraints(constraints);

		// Compute layout
		let animFrame: number;
		const simLoop = () => {
			step(editor, layout);
			animFrame = requestAnimationFrame(simLoop);
		};

		simLoop();

		return () => {
			cancelAnimationFrame(animFrame);
		};
	}, [enabled]);
};
