import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  PlusCircle,
  Calendar,
  MessageCircle,
  BarChart3,
  Activity,
} from 'lucide-react';
import AccessRequestModal from '../components/AccessRequestModal';
import CreatePatientModal from '../components/CreatePatientModal';
import ProviderAssistant from '../components/ProviderAssistant';
import VisitPlanner from '../components/VisitPlanner';
import CareCircleModal from '../components/CareCircleModal';
import PatientDataView from '../components/PatientDataView';

// Imported from IndividualDashboard
import HealthInputForm from '../components/HealthInputForm';
import HealthSummaryCard from '../components/HealthSummaryCard';
import HealthChart from '../components/HealthChart';
import CommunityPanel from '../components/CommunityPanel';
import DataSharingToggle from '../components/DataSharingToggle';

interface PatientWithAccess {
  id: string;
  full_name: string;
  email: string;
  access_id?: string;
  access_level?: string;
}

interface HealthData {
  date: string;
  value: number;
}

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientWithAccess[]>([]);
  const [selectedTab, setSelectedTab] = useState('patients');
  const [selectedPatient, setSelectedPatient] = useState<PatientWithAccess | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showCareCircle, setShowCareCircle] = useState(false);
  const [loading, setLoading] = useState(true);

  // For health data (overview/log data tabs)
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [todayData, setTodayData] = useState<HealthData | null>(null);

  useEffect(() => {
    if (user) {
      fetchPatientsFromBackend();
      // loadHealthData(); // keep Supabase for health data or change similarly
    }
  }, [user]);

  // Fetch patients from backend
  async function fetchPatientsFromBackend() {
    setLoading(true);
    try {
      const res = await fetch('https://agentic-ai-backend-bzagh0fzfdc5g4ae.canadacentral-01.azurewebsites.net/patients/');
      if (!res.ok) {
        throw new Error('Failed to fetch patients');
      }
      const data: PatientWithAccess[] = await res.json();
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }

  const renderContent = () => {
    if (selectedPatient) {
      return (
        <div className="dashboard-content">
          <button className="btn btn-secondary " style={{ marginTop: '1.5rem', marginBottom: '1.5rem', marginLeft: '0.5rem', marginRight: '0.5rem' }} onClick={() => setSelectedPatient(null)}>
            ← Back
          </button>
          <PatientDataView patient={selectedPatient} />
        </div>
      );
    }

    switch (selectedTab) {
      case 'patients':
        return (
          <div className="patients-section">
            <div className="section-header">
              <h2>My Patients ({patients.length})</h2>
            </div>

            {/* Show message if no patients */}
            {patients.length === 0 && (
              <div className="no-data flex flex-col items-center gap-4 mb-4">
                <Users size={48} />
                <p>No patients found. Add new patients to get started.</p>
              </div>
            )}

            {/* Patients Grid */}
            {patients.length > 0 && (
              <div className="patients-grid">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    className="patient-card cursor-pointer"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="patient-avatar">
                      {patient.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3>{patient.full_name}</h3>
                      <p>{patient.email}</p>
                      {patient.access_level && (
                        <p className="text-sm text-gray-500">Access: {patient.access_level}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Persistent New Patient Button - below the grid */}
            <div className="flex justify-center mt-12">
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateModal(prev => !prev)}
              >
                <PlusCircle size={18} /> New Patient
              </button>
            </div>

            {/* Conditionally show Create Patient Form */}
            {showCreateModal && selectedTab === 'patients' && (
              <CreatePatientModal
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchPatientsFromBackend}
              />
            )}
          </div>
        );

      case 'overview':
        return (
          <div className="overview-grid">
            <HealthSummaryCard data={todayData} weekData={healthData.slice(0, 7)} />
            <HealthChart data={healthData} />
          </div>
        );

      case 'input':
        return (
          <div className="input-section">
            <HealthInputForm todayData={todayData} onSave={() => {}} />
          </div>
        );

      case 'assistant':
        return <ProviderAssistant />;

      case 'community':
        return <CommunityPanel />;

      case 'calendar':
        return <VisitPlanner />;

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Healthcare Provider Dashboard</h1>
          <p>Manage patients, health data, and AI insights</p>
        </div>
        <DataSharingToggle />
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${selectedTab === 'patients' ? 'active' : ''}`}
          onClick={() => setSelectedTab('patients')}
        >
          <Users size={18} /> Admit Patient
        </button>
        <button
          className={`tab-button ${selectedTab === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedTab('overview')}
        >
          <BarChart3 size={18} /> Overview
        </button>
        <button
          className={`tab-button ${selectedTab === 'input' ? 'active' : ''}`}
          onClick={() => setSelectedTab('input')}
        >
          <Activity size={18} /> Log Health Data
        </button>
        <button
          className={`tab-button ${selectedTab === 'assistant' ? 'active' : ''}`}
          onClick={() => setSelectedTab('assistant')}
        >
          <MessageCircle size={18} /> Smart Assistant
        </button>
        <button
          className={`tab-button ${selectedTab === 'community' ? 'active' : ''}`}
          onClick={() => setSelectedTab('community')}
        >
          👥 Care Circle
        </button>
        <button
          className={`tab-button ${selectedTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setSelectedTab('calendar')}
        >
          <Calendar size={18} /> Visit Planner
        </button>
      </div>

      {renderContent()}

      {/* Other Modals */}
      {showRequestModal && (
        <AccessRequestModal
          onClose={() => setShowRequestModal(false)}
          onSuccess={fetchPatientsFromBackend}
        />
      )}
      {showCareCircle && <CareCircleModal onClose={() => setShowCareCircle(false)} />}
    </div>
  );
}
