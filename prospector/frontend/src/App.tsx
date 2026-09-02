import { useState } from "react";
import type { Page } from "./types";
import { ControlPanel } from "./pages/ControlPanel";
import { Processing } from "./pages/Processing";
import { Leads } from "./pages/Leads";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";
import { CRMBoard } from "./pages/CRMBoard";

const NAV: { key: Page; label: string }[] = [
  { key: "control", label: "Painel" },
  { key: "leads", label: "Leads" },
  { key: "crm", label: "CRM" },
  { key: "history", label: "Histórico" },
  { key: "settings", label: "Configurações" },
];

export default function App() {
  const [page, setPage] = useState<Page>("control");
  const [activeSearchId, setActiveSearchId] = useState<number | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  function handleSearchStarted(searchId: number) {
    setActiveSearchId(searchId);
    setErrorBanner(null);
    setPage("processing");
  }

  function handleProcessingDone() {
    setPage("leads");
  }

  function handleProcessingError(message: string) {
    setErrorBanner(message);
    setPage("control");
  }

  function handleOpenHistorySearch(searchId: number) {
    setActiveSearchId(searchId);
    setPage("leads");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 24px", borderBottom: "1px solid var(--border)",
      }}>
        <div className="mono" style={{ color: "var(--green)", fontWeight: 700, fontSize: 15 }}>
          [ SYS::PROSPECTOR ]
        </div>
        <nav style={{ display: "flex", gap: 6 }}>
          {NAV.map((item) => (
            <button
              key={item.key}
              className={`nav-pill ${page === item.key || (item.key === "leads" && page === "processing") ? "active" : ""}`}
              onClick={() => {
                if (item.key === "leads") setActiveSearchId(null);
                setPage(item.key);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main style={{ flex: 1, padding: "28px 24px", maxWidth: "min(1900px, 96vw)", width: "100%", margin: "0 auto" }}>
        {errorBanner && (
          <div className="card" style={{ borderColor: "var(--red)", color: "var(--red)", marginBottom: 20 }}>
            {errorBanner}
          </div>
        )}

        {page === "control" && <ControlPanel onSearchStarted={handleSearchStarted} />}
        {page === "processing" && activeSearchId && (
          <Processing searchId={activeSearchId} onDone={handleProcessingDone} onError={handleProcessingError} />
        )}
        {page === "leads" && <Leads searchId={activeSearchId} />}
        {page === "crm" && <CRMBoard />}
        {page === "history" && <History onOpenSearch={handleOpenHistorySearch} />}
        {page === "settings" && <Settings />}
      </main>
    </div>
  );
}
