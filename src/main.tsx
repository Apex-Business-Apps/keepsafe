import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initWebVitals } from "./utils/webVitals";

// Initialize Core Web Vitals monitoring
initWebVitals();

createRoot(document.getElementById("root")!).render(<App />);
