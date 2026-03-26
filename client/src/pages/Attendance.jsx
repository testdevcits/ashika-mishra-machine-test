import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [todayRecord, setTodayRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clock, setClock] = useState(new Date());
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    api.get('/employees').then((r) => {
      setEmployees(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedEmp) { setTodayRecord(null); setHistory([]); return; }
    loadHistory();
  }, [selectedEmp]);

  const loadHistory = async () => {
    try {
      const { data } = await api.get('/attendance', { params: { employeeId: selectedEmp } });
      setHistory(data);
      const today = new Date().toISOString().split('T')[0];
      setTodayRecord(data.find((r) => r.date === today) ?? null);
    } catch (e) {
      console.error(e);
    }
  };

  const doAction = async (endpoint) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post(`/attendance/${endpoint}`, { employeeId: selectedEmp });
      const msgs = {
        login: 'Clocked in successfully',
        logout: 'Clocked out successfully',
        'start-break': 'Break started',
        'end-break': 'Break ended',
      };
      setSuccess(msgs[endpoint]);
      await loadHistory();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
      setTimeout(() => setError(''), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const onBreak = todayRecord?.breaks?.some((b) => b.startTime && !b.endTime);
  const clockedIn = !!todayRecord?.loginTime;
  const clockedOut = !!todayRecord?.logoutTime;

  const fmt = (d) =>
    d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';

  const fmtHours = (h) => {
    if (!h) return '0h 0m';
    const hrs = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    return `${hrs}h ${mins}m`;
  };

  const statusInfo = () => {
    if (!clockedIn) return { label: 'Not clocked in', color: 'var(--text-dim)' };
    if (clockedOut) return { label: 'Shift complete', color: 'var(--blue)' };
    if (onBreak) return { label: 'On break', color: 'var(--amber)' };
    return { label: 'Clocked in', color: 'var(--accent)' };
  };

  if (loading) return <LoadingSpinner />;

  const si = statusInfo();

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-header__title">Attendance</div>
          <div className="page-header__sub">Track clock-ins, breaks and working hours</div>
        </div>
      </div>

      {/* Employee selector */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card__body">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Select Employee</label>
            <select value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)}>
              <option value="">— Choose an employee —</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.firstName} {e.lastName} · {e.department?.name ?? 'No Dept'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedEmp && (
        <>
          {error && <div className="alert alert--error">⚠ {error}</div>}
          {success && <div className="alert alert--success">✓ {success}</div>}

          {/* Hero clock */}
          <div className="att-hero">
            <div>
              <div className="att-hero__time">
                {clock.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </div>
              <div className="att-hero__date">
                {clock.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="att-hero__status">
                <span
                  className="att-hero__sdot"
                  style={{ background: si.color, boxShadow: `0 0 8px ${si.color}` }}
                />
                <span style={{ color: si.color }}>{si.label}</span>
              </div>
            </div>

            <div className="att-hero__actions">
              {!clockedIn && (
                <button className="clk-btn clk-btn--in" onClick={() => doAction('login')} disabled={actionLoading}>
                  ▶ Clock In
                </button>
              )}
              {clockedIn && !clockedOut && !onBreak && (
                <button className="clk-btn clk-btn--brk" onClick={() => doAction('start-break')} disabled={actionLoading}>
                  ⏸ Start Break
                </button>
              )}
              {clockedIn && !clockedOut && onBreak && (
                <button className="clk-btn clk-btn--brk-end" onClick={() => doAction('end-break')} disabled={actionLoading}>
                  ▶ End Break
                </button>
              )}
              {clockedIn && !clockedOut && (
                <button className="clk-btn clk-btn--out" onClick={() => doAction('logout')} disabled={actionLoading}>
                  ■ Clock Out
                </button>
              )}
              {clockedOut && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  Shift complete for today
                </div>
              )}
            </div>
          </div>

          {/* Today summary + Timeline */}
          <div className="dash-grid" style={{ marginBottom: 16 }}>
            {/* Today's summary */}
            <div className="card">
              <div className="card__header">
                <div className="card__title">Today's Summary</div>
              </div>
              <div className="card__body">
                {!todayRecord ? (
                  <div className="empty-state" style={{ padding: '28px 0' }}>
                    <div className="empty-state__icon">🕐</div>
                    <div className="empty-state__title">No activity today</div>
                    <div className="empty-state__sub">Clock in to start tracking</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { label: 'Clock In', value: fmt(todayRecord.loginTime), color: 'var(--accent)' },
                      { label: 'Clock Out', value: fmt(todayRecord.logoutTime), color: 'var(--red)' },
                      { label: 'Breaks', value: `${todayRecord.breaks?.length ?? 0} break(s)`, color: 'var(--amber)' },
                      { label: 'Hours Worked', value: fmtHours(todayRecord.totalWorkedHours), color: 'var(--blue)' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{label}</span>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color }}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="card">
              <div className="card__header">
                <div className="card__title">Activity Timeline</div>
              </div>
              <div className="card__body">
                {!todayRecord ? (
                  <div className="empty-state" style={{ padding: '28px 0' }}>
                    <div className="empty-state__icon">📋</div>
                    <div className="empty-state__title">No activity yet</div>
                  </div>
                ) : (
                  <div className="timeline">
                    {todayRecord.loginTime && (
                      <div className="tl-item">
                        <div className="tl-dot tl-dot--g">▶</div>
                        <div>
                          <div className="tl-label">Clocked In</div>
                          <div className="tl-time">{fmt(todayRecord.loginTime)}</div>
                        </div>
                      </div>
                    )}
                    {todayRecord.breaks?.map((b, i) => (
                      <div key={i}>
                        <div className="tl-item">
                          <div className="tl-dot tl-dot--a">⏸</div>
                          <div>
                            <div className="tl-label">Break Started</div>
                            <div className="tl-time">{fmt(b.startTime)}</div>
                          </div>
                        </div>
                        {b.endTime && (
                          <div className="tl-item">
                            <div className="tl-dot tl-dot--g">▶</div>
                            <div>
                              <div className="tl-label">Break Ended</div>
                              <div className="tl-time">{fmt(b.endTime)}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {todayRecord.logoutTime && (
                      <div className="tl-item">
                        <div className="tl-dot tl-dot--r">■</div>
                        <div>
                          <div className="tl-label">Clocked Out</div>
                          <div className="tl-time">{fmt(todayRecord.logoutTime)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="card">
            <div className="card__header">
              <div>
                <div className="card__title">Attendance History</div>
                <div className="card__sub">Past records for this employee</div>
              </div>
            </div>
            <div className="card__body--flush table-wrap">
              {history.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state__icon">📅</div>
                  <div className="empty-state__title">No history yet</div>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Breaks</th>
                      <th>Hours Worked</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((rec) => (
                      <tr key={rec._id}>
                        <td style={{ fontWeight: 600 }}>
                          {new Date(rec.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{fmt(rec.loginTime)}</td>
                        <td style={{ color: 'var(--red)', fontWeight: 600 }}>{fmt(rec.logoutTime)}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{rec.breaks?.length ?? 0}</td>
                        <td style={{ color: 'var(--blue)', fontWeight: 700 }}>{fmtHours(rec.totalWorkedHours)}</td>
                        <td>
                          {rec.logoutTime ? (
                            <span className="badge badge--green">Complete</span>
                          ) : rec.loginTime ? (
                            <span className="badge badge--amber">In Progress</span>
                          ) : (
                            <span className="badge badge--gray">Absent</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {!selectedEmp && (
        <div className="card">
          <div className="empty-state" style={{ padding: '72px 24px' }}>
            <div className="empty-state__icon">🕐</div>
            <div className="empty-state__title">Select an employee</div>
            <div className="empty-state__sub">Choose an employee above to view and manage their attendance</div>
          </div>
        </div>
      )}
    </>
  );
}
