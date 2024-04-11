import { track, useEditor } from "@tldraw/tldraw";
import { useEffect, useState } from "react";
import "../css/dev-ui.css";
import { useCollection } from "../collections/useCollection";

export const GraphUi = track(() => {
	const editor = useEditor();
	const graphCollection = useCollection('graphLayout')
	const [graphEnabled, setEnabled] = useState(false);

	useEffect(() => {
		if (graphCollection) {
			if (graphEnabled) {
				graphCollection.add(editor.getSelectedShapes())
				editor.selectNone()
			}
			else {
				graphCollection.clear()
			}
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
			</div>
		</div>
	);
});
