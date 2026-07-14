import { ProjectProvider, useProject } from "./state/ProjectContext";
import TopBar from "./components/TopBar";
import SetupScreen from "./components/SetupScreen";
import DesignCanvas from "./components/DesignCanvas";
import BlockDesigner from "./components/BlockDesigner";
import FabricLibrary from "./components/FabricLibrary";
import CuttingReport from "./components/CuttingReport";
import PatternExport from "./components/PatternExport";

function Screens() {
  const { tab } = useProject();
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: tab === "canvas" ? "hidden" : "auto", display: "flex", flexDirection: "column" }}>
      {tab === "setup" && <SetupScreen />}
      {tab === "canvas" && <DesignCanvas />}
      {tab === "blockdesigner" && <BlockDesigner />}
      {tab === "fabrics" && <FabricLibrary />}
      {tab === "cutting" && <CuttingReport />}
      {tab === "export" && <PatternExport />}
    </div>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <div className="app-shell">
        <TopBar />
        <Screens />
      </div>
    </ProjectProvider>
  );
}
