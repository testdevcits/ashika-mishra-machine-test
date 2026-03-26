import { useState, useEffect } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', phone: '',
  department: '', position: '', dateOfJoining: '',
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (deptFilter) params.department = deptFilter;
      const [empRes, deptRes] = await Promise.all([
        api.get('/employees', { params }),
        api.get('/departments'),
      ]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, deptFilter]);

  const openAdd = () => { setForm(EMPTY_FORM); setError(''); setModal('add'); };
  const openEdit = (emp) => {
    setSelected(emp);
    setForm({
      firstName: emp.firstName, lastName: emp.lastName,
      email: emp.email, phone: emp.phone,
      department: emp.department?._id ?? '',
      position: emp.position,
      dateOfJoining: emp.dateOfJoining?.slice(0, 10) ?? '',
    });
    setError('');
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setSelected(null); setError(''); };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (modal === 'add') {
        await api.post('/employees', form);
      } else {
        await api.put(`/employees/${selected._id}`, form);
      }
      closeModal();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/employees/${id}`);
      setDeleteId(null);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const avatarColors = ['', '--blue', '--purple', '--amber', '--red'];
  const getInitials = (emp) =>
    `${emp.firstName?.[0] ?? ''}${emp.lastName?.[0] ?? ''}`.toUpperCase();

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-header__title">Employees</div>
          <div className="page-header__sub">{employees.length} team members</div>
        </div>
        <button className="btn btn--primary" onClick={openAdd}>+ Add Employee</button>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-sel"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="card__body--flush table-wrap">
          {employees.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">👥</div>
              <div className="empty-state__title">No employees found</div>
              <div className="empty-state__sub">Try adjusting your search or add a new employee</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, i) => (
                  <tr key={emp._id}>
                    <td>
                      <div className="emp-cell">
                        <div className={`avatar ${avatarColors[i % avatarColors.length]}`}>
                          {getInitials(emp)}
                        </div>
                        <div>
                          <div className="emp-cell__name">{emp.firstName} {emp.lastName}</div>
                          <div className="emp-cell__email">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{emp.phone}</td>
                    <td>
                      <span className="badge badge--blue">{emp.department?.name ?? '—'}</span>
                    </td>
                    <td style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{emp.position}</td>
                    <td style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                      {emp.dateOfJoining
                        ? new Date(emp.dateOfJoining).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td>
                      <div className="actions">
                        <button className="act-btn" onClick={() => openEdit(emp)} title="Edit">✏</button>
                        <button className="act-btn act-btn--del" onClick={() => setDeleteId(emp._id)} title="Delete">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal modal--wide">
            <div className="modal__header">
              <div className="modal__title">{modal === 'add' ? 'Add New Employee' : 'Edit Employee'}</div>
              <button className="modal__close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal__body">
                {error && <div className="alert alert--error">⚠ {error}</div>}
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input placeholder="John" value={form.firstName} onChange={set('firstName')} required />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input placeholder="Doe" value={form.lastName} onChange={set('lastName')} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="john@company.com" value={form.email} onChange={set('email')} required />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input placeholder="+1 234 567 8900" value={form.phone} onChange={set('phone')} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Department</label>
                    <select value={form.department} onChange={set('department')} required>
                      <option value="">Select department</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Position</label>
                    <input placeholder="e.g. Software Engineer" value={form.position} onChange={set('position')} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Date of Joining</label>
                  <input type="date" value={form.dateOfJoining} onChange={set('dateOfJoining')} />
                </div>
              </div>
              <div className="modal__footer">
                <button type="button" className="btn btn--secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Saving…' : modal === 'add' ? 'Add Employee' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="modal">
            <div className="modal__header">
              <div className="modal__title">Delete Employee</div>
              <button className="modal__close" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="modal__body">
              <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>
                This action cannot be undone. The employee record will be permanently removed.
              </p>
            </div>
            <div className="modal__footer">
              <button className="btn btn--secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn--danger" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
