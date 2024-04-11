import { Editor, Tldraw, track, useEditor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { GraphUi } from "./graph/GraphControls";
import { useYjsStore } from "./useYjsStore";
// import { uiOverrides } from "./graph/__uiOverrides";
import { Collection, CollectionProvider } from "./collections/CollectionProvider";
import { useState } from "react";
import { GraphLayoutCollection } from "./graph/GraphLayoutCollection";

const collections: Collection[] = [GraphLayoutCollection]

const store = () => {
	const hostUrl = import.meta.env.DEV
		? "ws://localhost:1234"
		: import.meta.env.VITE_PRODUCTION_URL.replace("https://", "ws://"); // remove protocol just in case
	const roomId =
		new URLSearchParams(window.location.search).get("room") || "42";
	return useYjsStore({
		roomId: roomId,
		hostUrl: hostUrl,
	});
}

export default function Canvas() {
	const [editor, setEditor] = useState<Editor | undefined>();
	return (
		<div className="tldraw__editor">
			<CollectionProvider editor={editor} collections={collections}>
				<Tldraw
					autoFocus
					// store={store()}
					shareZone={<NameEditor />}
					// overrides={uiOverrides}
					onMount={setEditor}
					persistenceKey="tldraw-graph"
				>
					<GraphUi />
				</Tldraw>
			</CollectionProvider>
		</div>
	);
}

const NameEditor = track(() => {
	const editor = useEditor();

	const { color, name } = editor.user.getUserPreferences();

	return (
		<div
			style={{
				// TODO: style this properly and consistently with tldraw
				pointerEvents: "all",
				display: "flex",
				width: "148px",
				margin: "4px 8px",
				border: "none",
			}}
		>
			<input
				style={{
					borderRadius: "9px 0px 0px 9px",
					border: "none",
					backgroundColor: "white",
					boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.25)",
				}}
				type="color"
				value={color}
				onChange={(e) => {
					editor.user.updateUserPreferences({
						color: e.currentTarget.value,
					});
				}}
			/>
			<input
				style={{
					width: "100%",
					borderRadius: "0px 9px 9px 0px",
					border: "none",
					backgroundColor: "white",
					boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.25)",
				}}
				value={name}
				onChange={(e) => {
					editor.user.updateUserPreferences({
						name: e.currentTarget.value,
					});
				}}
			/>
		</div>
	);
});
