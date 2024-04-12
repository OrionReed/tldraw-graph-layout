import { useEditor } from "@tldraw/tldraw";
import { useEffect, useState } from "react";
import "../css/dev-ui.css";
import { useCollection } from "../../tldraw-collections/src/useCollection";

export const GraphUi = () => {
	const editor = useEditor();
	const graphCollection = useCollection('graphLayout')
	const [size, setSize] = useState(0)

	const updateSize = () => {
		setSize(graphCollection.getShapes().size)
	}

	const handleAdd = () => {
		if (graphCollection) {
			graphCollection.add(editor.getSelectedShapes())
			editor.selectNone()
			updateSize()
		}
	}

	const handleRemove = () => {
		if (graphCollection) {
			graphCollection.remove(editor.getSelectedShapes())
			editor.selectNone()
			updateSize()
		}
	}

	const handleShortcut = () => {
		if (!graphCollection) return
		const empty = graphCollection.getShapes().size === 0
		if (empty)
			graphCollection.add(editor.getCurrentPageShapes())
		else
			graphCollection.clear()
		updateSize()
	};

	const handleHighlight = () => {
		if (graphCollection) {
			editor.setHintingShapes([...graphCollection.getShapes().values()])
			updateSize()
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
				<div>{size} shapes</div>
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
