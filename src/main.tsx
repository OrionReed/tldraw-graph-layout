import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./css/index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
	ReactDOM.createRoot(rootElement).render(
		// <React.StrictMode>
		<App />
		// </React.StrictMode>
	);
}