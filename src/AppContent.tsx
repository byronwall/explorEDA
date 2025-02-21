import { CsvUpload } from "./components/CsvUpload";
import { PlotManager } from "./components/PlotManager";
import { ProjectViewManager } from "./components/ProjectViewManager";
import { useDataLayer } from "./providers/DataLayerProvider";

export function AppContent() {
  const data = useDataLayer((state) => state.data);
  const fileName = useDataLayer((state) => state.fileName);
  const hasData = data.length > 0;

  return (
    <div className="flex flex-col items-center p-8 gap-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">CSV File Upload</h1>
        {hasData && (
          <>
            <span className="text-gray-600">({fileName})</span>
            <CsvUpload compact />
            <ProjectViewManager />
          </>
        )}
      </div>
      <div className={`w-full max-w-xl ${hasData ? "hidden" : ""}`}>
        <CsvUpload />
      </div>
      {hasData && <PlotManager />}
    </div>
  );
}
