import { useState, useEffect } from 'react';
import { supabase, HealthData } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import HealthInputForm from '../components/HealthInputForm';
import HealthSummaryCard from '../components/HealthSummaryCard';
import HealthChart from '../components/HealthChart';
import SmartAssistant from '../components/SmartAssistant';
import CommunityPanel from '../components/CommunityPanel';
import DataSharingToggle from '../components/DataSharingToggle';

export default function IndividualDashboard() {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [todayData, setTodayData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'input' | 'assistant' | 'community'>('overview');

  useEffect(() => {
    if (user) {
      loadHealthData();
    }
  }, [user]);

  async function loadHealthData() {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: allData, error: allError } = await supabase
        .from('health_data')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(30);

      if (allError) throw allError;
      setHealthData(allData || []);

      const { data: todayEntry, error: todayError } = await supabase
        .from('health_data')
        .select('*')
        .eq('user_id', user!.id)
        .eq('date', today)
        .maybeSingle();

      if (todayError) throw todayError;
      setTodayData(todayEntry);
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading your healthcare provider data...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Health Care Provider Dashboard</h1>
        <DataSharingToggle />
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'input' ? 'active' : ''}`}
          onClick={() => setActiveTab('input')}
        >
          Log Health Data
        </button>
        <button
          className={`tab-button ${activeTab === 'assistant' ? 'active' : ''}`}
          onClick={() => setActiveTab('assistant')}
        >
          Smart Assistant
        </button>
        <button
          className={`tab-button ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          Care Circle
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <HealthSummaryCard data={todayData} weekData={healthData.slice(0, 7)} />
            <HealthChart data={healthData} />
          </div>
        )}

        {activeTab === 'input' && (
          <div className="input-section">
            <HealthInputForm todayData={todayData} onSave={loadHealthData} />
          </div>
        )}

        {activeTab === 'assistant' && (
          <div className="assistant-section">
            <SmartAssistant />
          </div>
        )}

        {activeTab === 'community' && (
          <div className="community-section">
            <CommunityPanel />
          </div>
        )}
      </div>
    </div>
  );
}
