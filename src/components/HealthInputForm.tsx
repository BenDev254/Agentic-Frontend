import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Envoy {
  id: number;
  name: string;
  department?: string;
  role?: string;
}

interface Patient {
  id: number;
  name: string;
  hadm_id: number;
}

interface LocalDiagnosis {
  subject_id?: number | null;
  hadm_id?: number | null;
  icd_code: string;
  icd_version: number;
  seq_num: number;
  diagnosis_count: number;
  risk_level: number;
}

interface Props {
  todayDiagnosis: LocalDiagnosis | null;
  patientHadmId: number;
  onSave: () => void;
}

export default function DiagnosisInputForm({ todayDiagnosis, patientHadmId, onSave }: Props) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    subject_id: '',
    icd_code: '',
    icd_version: '10',
    seq_num: '1',
    diagnosis_count: '',
    risk_level: '',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // --- Envoy + Patient state ---
  const [envoys, setEnvoys] = useState<Envoy[]>([]);
  const [selectedEnvoy, setSelectedEnvoy] = useState<number | null>(null);
  const [hadmSearch, setHadmSearch] = useState('');
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [formEnabled, setFormEnabled] = useState(false);

  // Fetch envoys list from backend
  useEffect(() => {
    const fetchEnvoys = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://agentic-ai-backend-bzagh0fzfdc5g4ae.canadacentral-01.azurewebsites.net/list_envoys");
        if (!res.ok) throw new Error(`Error fetching envoys: ${res.statusText}`);
        const data = await res.json();
        setEnvoys(data || []);
      } catch (error: any) {
        console.error("Error fetching envoys:", error);
        setEnvoys([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEnvoys();
  }, []);

  // Populate form if diagnosis exists
  useEffect(() => {
    if (todayDiagnosis) {
      setFormData({
        subject_id: todayDiagnosis.subject_id?.toString() || '',
        icd_code: todayDiagnosis.icd_code || '',
        icd_version: todayDiagnosis.icd_version?.toString() || '10',
        seq_num: todayDiagnosis.seq_num?.toString() || '1',
        diagnosis_count: todayDiagnosis.diagnosis_count?.toString() || '',
        risk_level: todayDiagnosis.risk_level?.toString() || '',
      });
    }
  }, [todayDiagnosis]);

  // Handle patient search
  async function handlePatientSearch() {
    if (!hadmSearch.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://agentic-ai-backend-bzagh0fzfdc5g4ae.canadacentral-01.azurewebsites.net/patients/search-by-hadm/${hadmSearch}`);
      if (!res.ok) throw new Error('Patient not found');
      const data = await res.json();

      setFoundPatient({
        id: data.id,
        name: `${data.first_name} ${data.last_name}`,
        hadm_id: data.hadm_id,
      });

      setFormEnabled(true);
      setMessage('');
    } catch (err: any) {
      setFoundPatient(null);
      setFormEnabled(false);
      setMessage(err.message || 'No patient found with that HADM ID.');
    } finally {
      setLoading(false);
    }
  }

  // Save diagnosis to backend
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    if (!foundPatient) {
      setMessage('No patient selected');
      setSaving(false);
      return;
    }

    if (!selectedEnvoy) {
      setMessage('Please select an Envoy.');
      setSaving(false);
      return;
    }

    // --- Prepare payload matching FastAPI DiagnosisIn model ---
    const payload = [
      {
        subject_id: formData.subject_id ? formData.subject_id.toString() : undefined,
        hadm_id: foundPatient?.hadm_id?.toString() || patientHadmId.toString(),
        icd_code: formData.icd_code || '',
        icd_version: formData.icd_version ? parseInt(formData.icd_version) : 10,
        seq_num: formData.seq_num ? parseInt(formData.seq_num) : 1,
        diagnosis_count: formData.diagnosis_count ? parseInt(formData.diagnosis_count) : 0,
        risk_level: formData.risk_level ? parseInt(formData.risk_level) : 0,
        created_at: new Date().toISOString() 
      }
    ];



    try {
      const url = `https://agentic-ai-backend-bzagh0fzfdc5g4ae.canadacentral-01.azurewebsites.net/envoy/${selectedEnvoy}/add-diagnoses`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errMsg = 'Failed to save diagnosis';
        try {
          const errData = await res.json();
          console.log('Backend error response:', errData);  // Already printed
          if (Array.isArray(errData.detail)) {
            errMsg = errData.detail.map((d: any) => `${d.loc.join(' → ')}: ${d.msg}`).join('; ');
          } else if (errData.detail) {
            errMsg = errData.detail;
          }
        } catch { }
        throw new Error(errMsg);
      }




      const result = await res.json();
      setMessage(result.message || 'Diagnosis saved successfully!');
      onSave();

    } catch (err: any) {
      console.error('Error saving diagnosis:', err);
      setMessage('Error saving diagnosis: ' + (err?.message || JSON.stringify(err)));

    } finally {
      setSaving(false);
    }
  }


  return (
    <div>
      {/* --- Envoy + Patient Lookup --- */}
      <div className="health-form-card">
        <h2>Envoy & Patient Lookup</h2>
        <div className="health-form">
          <div className="form-group">
            <label htmlFor="envoy">Select Envoy</label>
            <select
              id="envoy"
              value={selectedEnvoy || ''}
              onChange={(e) => setSelectedEnvoy(Number(e.target.value))}
              className="form-control"
            >
              <option value="">-- Choose an Envoy --</option>
              {envoys.map((env) => (
                <option key={env.id} value={env.id}>
                  {env.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="hadm_search">Search Patient by HADM ID</label>
              <input
                id="hadm_search"
                type="text"
                value={hadmSearch}
                onChange={(e) => setHadmSearch(e.target.value)}
                placeholder="Enter HADM ID"
              />
            </div>
            <div className="form-group" style={{ alignSelf: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePatientSearch}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {foundPatient && (
            <div className="alert alert-success">
              Found: {foundPatient.name} (HADM ID: {foundPatient.hadm_id})
            </div>
          )}
          {message && !foundPatient && (
            <div className="alert alert-error">{message}</div>
          )}
        </div>
      </div>

      {/* --- Diagnosis Form --- */}
      <div
        className={`health-form-card ${!formEnabled ? 'disabled-form' : ''}`}
        style={{ opacity: formEnabled ? 1 : 0.5, pointerEvents: formEnabled ? 'auto' : 'none', marginTop: '2rem' }}
      >
        <h2>{todayDiagnosis ? 'Update' : 'Add'} Diagnosis Record</h2>

        {message && foundPatient && (
          <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="health-form">

          {/* Subject ID */}
          <div className="form-group">
            <label htmlFor="subject_id">Subject ID</label>
            <input
              id="subject_id"
              type="text"
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              placeholder="e.g., 1"
            />
          </div>

          {/* HADM ID */}
          <div className="form-group">
            <label htmlFor="hadm_id">HADM ID</label>
            <input
              id="hadm_id"
              type="text"
              value={foundPatient?.hadm_id || patientHadmId}
              disabled
            />
          </div>

          {/* ICD Code & Version */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="icd_code">ICD Code</label>
              <input
                id="icd_code"
                type="text"
                value={formData.icd_code}
                onChange={(e) => setFormData({ ...formData, icd_code: e.target.value })}
                placeholder="e.g., F32.9"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="icd_version">ICD Version</label>
              <input
                id="icd_version"
                type="number"
                min="1"
                value={formData.icd_version}
                onChange={(e) => setFormData({ ...formData, icd_version: e.target.value })}
              />
            </div>
          </div>

          {/* Sequence # & Diagnosis Count */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="seq_num">Sequence #</label>
              <input
                id="seq_num"
                type="number"
                min="1"
                value={formData.seq_num}
                onChange={(e) => setFormData({ ...formData, seq_num: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="diagnosis_count">Diagnosis Count</label>
              <input
                id="diagnosis_count"
                type="number"
                min="0"
                value={formData.diagnosis_count}
                onChange={(e) => setFormData({ ...formData, diagnosis_count: e.target.value })}
                placeholder="e.g., 2"
              />
            </div>
          </div>

          {/* Risk Level */}
          <div className="form-group">
            <label htmlFor="risk_level">Risk Level (1–10)</label>
            <input
              id="risk_level"
              type="number"
              min="1"
              max="10"
              value={formData.risk_level}
              onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
              placeholder="e.g., 7"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : todayDiagnosis ? 'Update Record' : 'Save Record'}
          </button>
        </form>
      </div>
    </div>
  );
}
