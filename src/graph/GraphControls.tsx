import { track, useEditor } from "@tldraw/tldraw";
import { useEffect, useState } from "react";
import "../css/dev-ui.css";
import { useCollection } from "../collections/useCollection";

export const GraphUi = track(() => {
	const editor = useEditor();
	const graphCollection = useCollection('graphLayout')
	const [graphEnabled, setEnabled] = useState(false);

	const addSelectedToGraph = () => {
		if (graphCollection && graphEnabled) {
			graphCollection.add(editor.getSelectedShapes())
			editor.selectNone()
		}
	}

	const removeSelectedFromGraph = () => {
		if (graphCollection && graphEnabled) {
			graphCollection.remove(editor.getSelectedShapes())
			editor.selectNone()
		}
	}

	useEffect(() => {
		if (graphEnabled) {
			editor.selectAll()
			addSelectedToGraph()
		}
		else if (graphCollection) {
			graphCollection.clear()
		}
	}, [graphEnabled]);


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
				<button
					type="button"
					title="Add Selected"
					className="custom-button"
					onClick={addSelectedToGraph}
				>
					+
				</button>
				<button
					type="button"
					title="Remove Selected"
					className="custom-button"
					onClick={removeSelectedFromGraph}
				>
					-
				</button>
			</div>
		</div>
	);
});
