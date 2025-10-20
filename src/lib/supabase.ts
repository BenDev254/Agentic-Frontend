import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'individual' | 'provider';
  created_at: string;
  updated_at: string;
}

export interface HealthData {
  id: string;
  user_id: string;
  date: string;
  mood_score: number | null;
  anxiety_level: number | null;
  stress_level: number | null;
  sleep_hours: number | null;
  sleep_quality: number | null;
  pain_level: number | null;
  energy_level: number | null;
  exercise_minutes: number | null;
  steps: number | null;
  heart_rate_avg: number | null;
  notes: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface CareCircle {
  id: string;
  user_id: string;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  relationship: string;
  can_view_health_data: boolean;
  notify_on_critical: boolean;
  created_at: string;
}

export interface ProviderAccessRequest {
  id: string;
  provider_id: string;
  patient_id: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  access_level: 'read_only' | 'read_write';
  data_categories: string[];
  reason: string;
  expires_at: string | null;
  requested_at: string;
  responded_at: string | null;
}
