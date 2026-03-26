import { useState, useEffect } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const ICONS = ['🏢', '💻', '🎨', '📊', '⚙️', '🔬', '📣', '💼', '🛡️', '📦'];

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get('/departments');
      setDepartments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({ name: '', description: '' }); setError(''); setModal('add'); };
  const openEdit = (dept) => {
    setSelected(dept);
    setForm({ name: dept.name, description: dept.description ?? '' });
    setError('');
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setSelected(null); setError(''); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (modal === 'add') {
        await api.post('/departments', form);
      } else {
        await api.put(`/departments/${selected._id}`, form);
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
      await api.delete(`/departments/${id}`);
      setDeleteId(null);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-header__title">Departments</div>
          <div className="page-header__sub">{departments.length} departments</div>
        </div>
        <button className="btn btn--primary" onClick={openAdd}>+ New Department</button>
      </div>

      {departments.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state__icon">🏢</div>
            <div className="empty-state__title">No departments yet</div>
            <div className="empty-state__sub">Create your first department to organise your team</div>
          </div>
        </div>
      ) : (
        <div className="dept-grid">
          {departments.map((dept, i) => (
            <div className="dept-card" key={dept._id}>
              <div className="dept-card__top">
                <div className="dept-card__icon">{ICONS[i % ICONS.length]}</div>
                <div className="actions">
                  <button className="act-btn" onClick={() => openEdit(dept)} title="Edit">✏</button>
                  <button className="act-btn act-btn--del" onClick={() => setDeleteId(dept._id)} title="Delete">🗑</button>
                </div>
              </div>
              <div className="dept-card__name">{dept.name}</div>
              <div className="dept-card__desc">
                {dept.description || 'No description provided.'}
              </div>
              <div className="dept-card__footer">
                <span style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>
                  Created {new Date(dept.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <span className="badge badge--green">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal__header">
              <div className="modal__title">{modal === 'add' ? 'New Department' : 'Edit Department'}</div>
              <button className="modal__close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal__body">
                {error && <div className="alert alert--error">⚠ {error}</div>}
                <div className="form-group">
                  <label>Department Name</label>
                  <input
                    placeholder="e.g. Engineering"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description (optional)</label>
                  <textarea
                    placeholder="Brief description of this department…"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal__footer">
                <button type="button" className="btn btn--secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Saving…' : modal === 'add' ? 'Create' : 'Save Changes'}
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
              <div className="modal__title">Delete Department</div>
              <button className="modal__close" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="modal__body">
              <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>
                Deleting this department is permanent. Employees assigned to it will need to be reassigned.
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
