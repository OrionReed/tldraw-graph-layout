import { useEditor } from "@tldraw/tldraw";
import { useCallback, useEffect, useState } from "react";
import "../css/dev-ui.css";
import { useCollection } from "../collections/useCollection";

export const GraphUi = () => {
	const editor = useEditor();
	const graphCollection = useCollection('graphLayout')
	const [graphEnabled, setEnabled] = useState(false);

	const handleAdd = () => {
		if (graphCollection && graphEnabled) {
			graphCollection.add(editor.getSelectedShapes())
			editor.selectNone()
		}
	}

	const handleRemove = () => {
		if (graphCollection && graphEnabled) {
			graphCollection.remove(editor.getSelectedShapes())
			editor.selectNone()
		}
	}

	const handleToggle = useCallback(() => {

		setEnabled(!graphEnabled);
	}, [graphEnabled]);

	useEffect(() => {
		if (graphEnabled && graphCollection) {
			graphCollection.add(editor.getCurrentPageShapes())
		}
		else if (graphCollection) {
			graphCollection.clear()
		}
	}, [graphEnabled, graphCollection]);

	useEffect(() => {
		window.addEventListener('toggleGraphLayoutEvent', handleToggle);

		return () => {
			window.removeEventListener('toggleGraphLayoutEvent', handleToggle);
		};
	}, [handleToggle]);

	return (
		<div className="custom-layout">
			<div className="custom-toolbar">
				<button
					type="button"
					title="Toggle Graph Layout (G)"
					className="custom-button"
					data-isactive={graphEnabled}
					onClick={handleToggle}
				>
					Graph ({graphEnabled ? "on" : "off"})
				</button>
				<button
					type="button"
					title="Add Selected"
					className="custom-button"
					onClick={handleAdd}
				>
					+
				</button>
				<button
					type="button"
					title="Remove Selected"
					className="custom-button"
					onClick={handleRemove}
				>
					-
				</button>
			</div>
		</div>
	);
};
