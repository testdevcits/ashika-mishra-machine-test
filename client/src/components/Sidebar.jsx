import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/dashboard', icon: '▦', label: 'Dashboard' },
  { to: '/employees', icon: '👥', label: 'Employees' },
  { to: '/departments', icon: '🏢', label: 'Departments' },
  { to: '/attendance', icon: '🕐', label: 'Attendance' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <NavLink to="/dashboard" className="sidebar__logo">
          <div className="sidebar__logo-mark">P</div>
          <span className="sidebar__logo-text">
            Pulse<span>HR</span>
          </span>
        </NavLink>
      </div>

      <nav className="sidebar__nav">
        <div className="sidebar__label">Main Menu</div>
        {nav.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              'sidebar__link' + (isActive ? ' active' : '')
            }
          >
            <span className="sidebar__icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">{initials}</div>
          <div className="sidebar__uinfo">
            <div className="sidebar__uname">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="sidebar__urole">Administrator</div>
          </div>
          <button className="sidebar__logout-btn" onClick={handleLogout} title="Logout">
            ⎋
          </button>
        </div>
      </div>
    </aside>
  );
}
