import { track, useEditor } from "@tldraw/tldraw";
import { useEffect, useState } from "react";
import "../css/dev-ui.css";
import { useGraphLayout } from "./graphLayout.js";

export const DevUi = track(() => {
	const editor = useEditor();
	const [graphEnabled, setGraph] = useState(false);

	useGraphLayout(editor, graphEnabled);

	useEffect(() => {
		const toggleGraph = () => {
			setGraph(prev => !prev);
		};

		window.addEventListener('toggleGraphLayoutEvent', toggleGraph);

		return () => {
			window.removeEventListener('toggleGraphLayoutEvent', toggleGraph);
		};
	}, []);

	return (
		<div className="custom-layout">
			<div className="custom-toolbar">
				<button
					type="button"
					title="Toggle Graph Layout (G)"
					className="custom-button"
					data-isactive={graphEnabled}
					onClick={() => setGraph(!graphEnabled)}
				>
					Graph
				</button>
			</div>
		</div>
	);
});
