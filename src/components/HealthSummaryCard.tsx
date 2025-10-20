import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Slash } from "lucide-react";

interface DiagnosisData {
  diagnosis_count?: number;
  risk_level?: number;
  date?: string;
  notes?: string;
  patient_name?: string; // optional, for display
}

export default function DiagnosisSummaryCard() {
  const [latest, setLatest] = useState<DiagnosisData | null>(null);
  const [weekData, setWeekData] = useState<DiagnosisData[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // fetch latest diagnosis (all patients)
        const latestRes = await fetch(`https://agentic-ai-backend-bzagh0fzfdc5g4ae.canadacentral-01.azurewebsites.net/patients/latest-diagnosis`);
        const latestData = await latestRes.json();
        // assume backend returns one aggregated/latest entry for display
        setLatest(latestData);

        // fetch last 7 diagnoses (all patients)
        const weekRes = await fetch(`https://agentic-ai-backend-bzagh0fzfdc5g4ae.canadacentral-01.azurewebsites.net/patients/last7-diagnoses`);
        const weekData = await weekRes.json();
        setWeekData(weekData);
      } catch (error) {
        console.error("Error fetching diagnoses:", error);
      }
    }
    fetchData();
  }, []);

  const getRiskIcon = (risk?: number) => {
    if (risk === undefined || risk === null) return <Slash size={24} />;
    if (risk >= 4) return <AlertCircle size={24} className="high-risk" />;
    if (risk >= 2) return <AlertCircle size={24} className="medium-risk" />;
    return <CheckCircle size={24} className="low-risk" />;
  };

  const calculateAverage = (field: keyof DiagnosisData) => {
    const values = weekData.map((d) => d[field]).filter((v): v is number => typeof v === "number");
    if (!values.length) return 0;
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  };

  return (
    <div className="summary-card">
      <h2>Latest Diagnosis Summary</h2>

      {!latest ? (
        <div className="no-data">
          <p>No diagnoses recorded yet.</p>
          <p className="hint">New diagnoses will appear here as they are logged.</p>
        </div>
      ) : (
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-icon count-icon">
              <CheckCircle size={24} />
            </div>
            <div className="summary-info">
              <span className="summary-label">Diagnosis Count</span>
              <span className="summary-value">{latest.diagnosis_count || 0}</span>
            </div>
          </div>

          <div className="summary-item">
            <div className="summary-icon risk-icon">{getRiskIcon(latest.risk_level)}</div>
            <div className="summary-info">
              <span className="summary-label">Risk Level</span>
              <span className="summary-value">{latest.risk_level || 0}/5</span>
            </div>
          </div>
        </div>
      )}

      {weekData.length > 0 && (
        <>
          <h3>Last 7 Diagnoses Average</h3>
          <div className="week-stats">
            <div className="week-stat">
              <span className="week-stat-label">Diagnosis Count</span>
              <span className="week-stat-value">{calculateAverage("diagnosis_count")}</span>
            </div>
            <div className="week-stat">
              <span className="week-stat-label">Risk Level</span>
              <span className="week-stat-value">{calculateAverage("risk_level")}/5</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
