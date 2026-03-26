import { useLocation } from 'react-router-dom';

const titles = {
  '/dashboard':  { title: 'Dashboard',   sub: 'Overview of your organisation' },
  '/employees':  { title: 'Employees',   sub: 'Manage your team members' },
  '/departments':{ title: 'Departments', sub: 'Manage company departments' },
  '/attendance': { title: 'Attendance',  sub: 'Track time and attendance' },
};

export default function Navbar() {
  const { pathname } = useLocation();
  const info = titles[pathname] ?? { title: 'PulseHR', sub: '' };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <header className="navbar">
      <div>
        <div className="navbar__title">{info.title}</div>
        <div className="navbar__sub">{info.sub}</div>
      </div>
      <div className="navbar__right">
        <span className="navbar__date">{today}</span>
        <div className="navbar__status">
          <span className="navbar__dot" />
          Live
        </div>
      </div>
    </header>
  );
}
