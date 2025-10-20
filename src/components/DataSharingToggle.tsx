import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Shield } from 'lucide-react';

type SharingLevel = 'minimal' | 'standard' | 'comprehensive';

export default function DataSharingToggle() {
  const { user, profile } = useAuth();
  const [level, setLevel] = useState<SharingLevel>('standard');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user && profile?.role === 'individual') {
      loadPreferences();
    }
  }, [user, profile]);

  async function loadPreferences() {
    try {
      const { data, error } = await supabase
        .from('consent_settings')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        if (data.share_device_data && data.share_screen_time) {
          setLevel('comprehensive');
        } else if (data.share_activity_data || data.share_sleep_data) {
          setLevel('standard');
        } else {
          setLevel('minimal');
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }

  async function updateLevel(newLevel: SharingLevel) {
    setLoading(true);
    try {
      const settings = {
        share_mood_data: newLevel !== 'minimal',
        share_activity_data: newLevel === 'standard' || newLevel === 'comprehensive',
        share_sleep_data: newLevel === 'standard' || newLevel === 'comprehensive',
        share_diet_data: newLevel === 'standard' || newLevel === 'comprehensive',
        share_device_data: newLevel === 'comprehensive',
        share_screen_time: newLevel === 'comprehensive',
      };

      const { error } = await supabase
        .from('consent_settings')
        .update(settings)
        .eq('user_id', user!.id);

      if (error) throw error;

      setLevel(newLevel);
      setShowModal(false);
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setLoading(false);
    }
  }

  if (profile?.role !== 'individual') {
    return null;
  }

  return (
    <>
      <button className="data-sharing-toggle" onClick={() => setShowModal(true)}>
        <Shield size={20} />
        <span>Health Sync: {level.charAt(0).toUpperCase() + level.slice(1)}</span>
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Data Sharing Preferences</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Choose how much health data you want to share with your healthcare providers.
              </p>

              <div className="sharing-options">
                <button
                  className={`sharing-option ${level === 'minimal' ? 'active' : ''}`}
                  onClick={() => updateLevel('minimal')}
                  disabled={loading}
                >
                  <h3>Minimal</h3>
                  <p>Only essential health metrics</p>
                  <ul>
                    <li>Basic health summary</li>
                    <li>Critical alerts only</li>
                  </ul>
                </button>

                <button
                  className={`sharing-option ${level === 'standard' ? 'active' : ''}`}
                  onClick={() => updateLevel('standard')}
                  disabled={loading}
                >
                  <h3>Standard</h3>
                  <p>Daily health entries</p>
                  <ul>
                    <li>Mood and stress levels</li>
                    <li>Sleep and activity data</li>
                    <li>Manual entries</li>
                  </ul>
                </button>

                <button
                  className={`sharing-option ${level === 'comprehensive' ? 'active' : ''}`}
                  onClick={() => updateLevel('comprehensive')}
                  disabled={loading}
                >
                  <h3>Comprehensive</h3>
                  <p>Full health profile</p>
                  <ul>
                    <li>All standard data</li>
                    <li>Device sync data</li>
                    <li>Steps, heart rate</li>
                    <li>Screen time</li>
                  </ul>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
