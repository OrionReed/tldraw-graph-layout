import { useEditor } from "@tldraw/tldraw";
import { useEffect } from "react";
import "../css/dev-ui.css";
import { useCollection } from "../../tldraw-collections/src/useCollection";

export const GraphUi = () => {
	const editor = useEditor();
	const graphCollection = useCollection('graphLayout')

	const handleAdd = () => {
		if (graphCollection) {
			graphCollection.add(editor.getSelectedShapes())
			editor.selectNone()
		}
	}

	const handleRemove = () => {
		if (graphCollection) {
			graphCollection.remove(editor.getSelectedShapes())
			editor.selectNone()
		}
	}

	const handleShortcut = () => {
		if (!graphCollection) return
		const empty = graphCollection.getShapes().size === 0
		if (empty)
			graphCollection.add(editor.getCurrentPageShapes())
		else
			graphCollection.clear()
	};

	const handleHighlight = () => {
		if (graphCollection) {
			graphCollection.highlight()
		}
	}

	useEffect(() => {
		window.addEventListener('toggleGraphLayoutEvent', handleShortcut);

		return () => {
			window.removeEventListener('toggleGraphLayoutEvent', handleShortcut);
		};
	}, [handleShortcut]);

	return (
		<div className="custom-layout">
			<div className="custom-toolbar">
				<button
					type="button"
					title="Add Selected"
					className="custom-button"
					onClick={handleAdd}
				>
					Add
				</button>
				<button
					type="button"
					title="Remove Selected"
					className="custom-button"
					onClick={handleRemove}
				>
					Remove
				</button>
				<button
					type="button"
					title="Highlight Collection"
					className="custom-button"
					onClick={handleHighlight}
				>
					🔦
				</button>
			</div>
		</div>
	);
};
