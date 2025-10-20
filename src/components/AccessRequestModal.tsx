import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AccessRequestModal({ onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: patientProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .eq('role', 'individual')
        .maybeSingle();

      if (profileError) throw profileError;

      if (!patientProfile) {
        setError('No patient found with this email address.');
        setLoading(false);
        return;
      }

      const { data: existingRequest, error: checkError } = await supabase
        .from('provider_access_requests')
        .select('*')
        .eq('provider_id', user!.id)
        .eq('patient_id', patientProfile.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingRequest) {
        setError('You already have a request for this patient.');
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from('provider_access_requests').insert({
        provider_id: user!.id,
        patient_id: patientProfile.id,
        reason,
        status: 'pending',
        access_level: 'read_only',
        data_categories: ['health_data'],
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit access request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Request Patient Access</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {success ? (
            <div className="alert alert-success">
              Access request sent successfully! Waiting for patient approval.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert-error">{error}</div>}

              <div className="form-group">
                <label htmlFor="email">Patient Email *</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="reason">Reason for Access *</label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you need access to this patient's health data..."
                  rows={4}
                  required
                />
              </div>

              <div className="info-card">
                <p>
                  The patient will receive a notification about your access request. They can approve, deny, or
                  ignore it.
                </p>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Send Request'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
