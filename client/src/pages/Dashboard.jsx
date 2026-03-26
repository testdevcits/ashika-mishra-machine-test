import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const [stats, setStats] = useState({ employees: 0, departments: 0 });
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [empRes, deptRes] = await Promise.all([
          api.get('/employees'),
          api.get('/departments'),
        ]);
        setEmployees(empRes.data);
        setDepartments(deptRes.data);
        setStats({ employees: empRes.data.length, departments: deptRes.data.length });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  const avatarColors = ['', '--blue', '--purple', '--amber', '--red'];
  const getInitials = (emp) =>
    `${emp.firstName?.[0] ?? ''}${emp.lastName?.[0] ?? ''}`.toUpperCase();

  const deptMap = {};
  employees.forEach((e) => {
    const name = e.department?.name ?? 'Unknown';
    deptMap[name] = (deptMap[name] || 0) + 1;
  });

  return (
    <>
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--sc': 'var(--accent)', '--si': 'var(--accent-dim)' }}>
          <div className="stat-card__top">
            <div className="stat-card__icon">👥</div>
            <span className="stat-card__tag">Total</span>
          </div>
          <div className="stat-card__value">{stats.employees}</div>
          <div className="stat-card__label">Total Employees</div>
        </div>

        <div className="stat-card" style={{ '--sc': 'var(--blue)', '--si': 'var(--blue-dim)' }}>
          <div className="stat-card__top">
            <div className="stat-card__icon">🏢</div>
            <span className="stat-card__tag">Active</span>
          </div>
          <div className="stat-card__value">{stats.departments}</div>
          <div className="stat-card__label">Departments</div>
        </div>

        <div className="stat-card" style={{ '--sc': 'var(--purple)', '--si': 'var(--purple-dim)' }}>
          <div className="stat-card__top">
            <div className="stat-card__icon">📋</div>
            <span className="stat-card__tag">Roles</span>
          </div>
          <div className="stat-card__value">
            {[...new Set(employees.map((e) => e.position))].length}
          </div>
          <div className="stat-card__label">Unique Positions</div>
        </div>

        <div className="stat-card" style={{ '--sc': 'var(--amber)', '--si': 'var(--amber-dim)' }}>
          <div className="stat-card__top">
            <div className="stat-card__icon">📅</div>
            <span className="stat-card__tag">This Month</span>
          </div>
          <div className="stat-card__value">
            {employees.filter((e) => {
              const d = new Date(e.dateOfJoining || e.createdAt);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length}
          </div>
          <div className="stat-card__label">New Hires</div>
        </div>
      </div>

      {/* Grid */}
      <div className="dash-grid">
        {/* Recent Employees */}
        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Recent Employees</div>
              <div className="card__sub">Latest team members</div>
            </div>
            <Link to="/employees" className="btn btn--ghost btn--sm">View all →</Link>
          </div>
          <div className="card__body">
            {employees.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">👥</div>
                <div className="empty-state__title">No employees yet</div>
                <div className="empty-state__sub">Add your first employee to get started</div>
              </div>
            ) : (
              employees.slice(0, 6).map((emp, i) => (
                <div className="recent-item" key={emp._id}>
                  <div className={`avatar ${avatarColors[i % avatarColors.length]}`}>
                    {getInitials(emp)}
                  </div>
                  <div className="recent-item__info">
                    <div className="recent-item__name">{emp.firstName} {emp.lastName}</div>
                    <div className="recent-item__meta">{emp.position} · {emp.department?.name}</div>
                  </div>
                  <div className="recent-item__right">
                    <span className="badge badge--gray">{emp.department?.name ?? '—'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Departments breakdown */}
        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Department Breakdown</div>
              <div className="card__sub">Headcount per department</div>
            </div>
            <Link to="/departments" className="btn btn--ghost btn--sm">Manage →</Link>
          </div>
          <div className="card__body">
            {departments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">🏢</div>
                <div className="empty-state__title">No departments yet</div>
                <div className="empty-state__sub">Create departments to organise your team</div>
              </div>
            ) : (
              departments.map((dept) => {
                const count = deptMap[dept.name] || 0;
                const max = Math.max(...Object.values(deptMap), 1);
                const pct = Math.round((count / max) * 100);
                return (
                  <div key={dept._id} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{dept.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{count} employees</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
