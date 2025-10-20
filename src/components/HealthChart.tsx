import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Slash } from 'lucide-react';

interface DiagnosisData {
  diagnosis_count?: number;
  risk_level?: number;
  date?: string;
  patient_name?: string;
}

export default function HealthChart() {
  const [latest, setLatest] = useState<DiagnosisData | null>(null);
  const [last7, setLast7] = useState<DiagnosisData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const latestRes = await fetch('http://127.0.0.1:8000/patients/latest-diagnosis');
        const latestJson: DiagnosisData = await latestRes.json();
        setLatest(latestJson);

        const last7Res = await fetch('http://127.0.0.1:8000/patients/last7-diagnoses');
        const last7Json: DiagnosisData[] = await last7Res.json();
        setLast7(last7Json);
      } catch (err) {
        console.error('Error fetching diagnoses:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const calculateAverage = (field: keyof DiagnosisData) => {
    const values = last7.map(d => d[field]).filter((v): v is number => typeof v === 'number');
    if (!values.length) return 0;
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  };

  const getRiskIcon = (risk?: number) => {
    if (risk === undefined || risk === null) return <Slash size={20} />;
    if (risk >= 4) return <AlertCircle size={20} className="high-risk" />;
    if (risk >= 2) return <AlertCircle size={20} className="medium-risk" />;
    return <CheckCircle size={20} className="low-risk" />;
  };

  if (loading) {
    return (
      <div className="no-data">
        <p>Loading diagnosis data...</p>
      </div>
    );
  }

  if (!latest && last7.length === 0) {
    return (
      <div className="no-data">
        <p>No diagnosis data available yet.</p>
        <p className="hint">New diagnoses will appear here as they are recorded.</p>
      </div>
    );
  }

  return (
    <div className="health-summary">
      {/* Latest Diagnosis Card */}
      {latest && (
        <div className="summary-card">
          <h2>Latest Diagnosis</h2>
          <div className="card-content">
            <p><strong>Patient:</strong> {latest.patient_name || 'N/A'}</p>
            <p><strong>Diagnosis Count:</strong> {latest.diagnosis_count}</p>
            <p><strong>Risk Level:</strong> {latest.risk_level}/5 {getRiskIcon(latest.risk_level)}</p>
            <p><strong>Date:</strong> {new Date(latest.date || '').toLocaleString()}</p>
          </div>
        </div>
      )}

      <br/>

      {/* Last 7 Diagnoses Summary */}
      {last7.length > 0 && (
        <div className="summary-card">
          <h2>Last 7 Diagnoses Summary</h2>
          <div className="card-content">
            <p><strong>Average Diagnosis Count:</strong> {calculateAverage('diagnosis_count')}</p>
            <p><strong>Average Risk Level:</strong> {calculateAverage('risk_level')}/5</p>
            <p><strong>High Risk Patients:</strong> {last7.filter(d => (d.risk_level ?? 0) >= 4).length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
