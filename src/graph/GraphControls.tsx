import { track, useEditor } from "@tldraw/tldraw";
import { useEffect, useState } from "react";
import "../css/dev-ui.css";
import { useGraphLayout } from "./useGraphLayout.js";
import { useCollection } from "../collections/useCollection.js";

export const GraphUi = track(() => {
	const editor = useEditor();
	const graphCollection = useCollection('graphLayout')
	const [graphEnabled, setEnabled] = useState(false);

	useEffect(() => {
		if (graphCollection) {
			if (graphEnabled) {
				graphCollection.add(editor.getSelectedShapes())
			}
			else {
				graphCollection.clear()
			}
		}
	}, [graphEnabled]);

	// useGraphLayout(editor, graphEnabled);

	// useEffect(() => {
	// 	const toggleGraph = () => {
	// 		setGraph(prev => !prev);
	// 	};

	// 	window.addEventListener('toggleGraphLayoutEvent', toggleGraph);

	// 	return () => {
	// 		window.removeEventListener('toggleGraphLayoutEvent', toggleGraph);
	// 	};
	// }, []);

	return (
		<div className="custom-layout">
			<div className="custom-toolbar">
				<button
					type="button"
					title="Toggle Graph Layout (G)"
					className="custom-button"
					data-isactive={graphEnabled}
					onClick={() => setEnabled(!graphEnabled)}
				>
					Graph
				</button>
			</div>
		</div>
	);
});
