import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Heart, LogOut, Sun, Moon } from 'lucide-react';

export default function Navigation() {
  const { user, profile, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  if (!user || !profile) return null;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="navbar-brand">
          <Heart size={28} />
          <span>Health Companion</span>
        </Link>

        <div className="navbar-actions">
          <div className="user-info">
            <div className="user-avatar">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{profile.full_name}</span>
              <span className="user-role">
                {profile.role === 'individual'
                  ? 'Patient'
                  : profile.role === 'learner'
                  ? 'Learning Center'
                  : 'Healthcare Provider'}
              </span>
            </div>
          </div>

          <button className="btn btn-icon" onClick={toggleTheme} title="Toggle theme">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button className="btn btn-secondary" onClick={handleSignOut}>
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
