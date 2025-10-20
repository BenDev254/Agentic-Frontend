import React, { useState, useEffect, useRef } from 'react';
import LearnerChat from '../components/LearnerChat';
import LearnerQuiz from '../components/LearnerQuiz';
import StudyPlanBuilder from '../components/StudyPlanBuilder';
import SuggestedStudyPlan from '../components/SuggestedStudyPlan';
import { useAuth } from '../contexts/AuthContext';

const LearnerDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'quiz' | 'plan'>('chat');
  const contentRef = useRef<HTMLDivElement>(null);

  if (!profile) return <div>Loading learner profile...</div>;

  // Scroll to top of the dashboard content when switching tabs
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div className="dashboard-header" style={{ padding: '20px 30px', borderBottom: '1px solid #e5e5e5' }}>
        <h1 style={{ margin: 0 }}>Welcome back, {profile.full_name.split(' ')[0]} 👋</h1>
        <p className="text-secondary" style={{ marginTop: '5px', color: '#6b7280' }}>
          Let’s continue your learning journey today!
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation" style={{ display: 'flex', gap: '15px', padding: '15px 30px', borderBottom: '1px solid #e5e5e5' }}>
        <button
          className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: activeTab === 'chat' ? '#3b82f6' : '#f3f4f6',
            color: activeTab === 'chat' ? 'white' : '#111827',
            fontWeight: 500,
          }}
        >
          💬 Chat with AI
        </button>
        <button
          className={`tab-button ${activeTab === 'quiz' ? 'active' : ''}`}
          onClick={() => setActiveTab('quiz')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: activeTab === 'quiz' ? '#3b82f6' : '#f3f4f6',
            color: activeTab === 'quiz' ? 'white' : '#111827',
            fontWeight: 500,
          }}
        >
          🧠 Random Quiz
        </button>
        {/* <button
          className={`tab-button ${activeTab === 'plan' ? 'active' : ''}`}
          onClick={() => setActiveTab('plan')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: activeTab === 'plan' ? '#3b82f6' : '#f3f4f6',
            color: activeTab === 'plan' ? 'white' : '#111827',
            fontWeight: 500,
          }}
        >
          📚 Study Plans
        </button> */}
      </div>

      {/* Main Content */}
      <div
        className="dashboard-content"
        ref={contentRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {activeTab === 'chat' && (
          <div className="assistant-container">
            <LearnerChat />
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="chart-card">
            <h2>Random Knowledge Quiz</h2>
            <LearnerQuiz />
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="overview-grid" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div className="health-form-card" style={{ flex: 1, minWidth: '300px' }}>
              <StudyPlanBuilder />
            </div>
            <div className="health-form-card" style={{ flex: 1, minWidth: '300px' }}>
              <SuggestedStudyPlan />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnerDashboard;
