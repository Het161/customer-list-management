import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import { getMessage } from '../utils/error';
import * as listsApi from '../api/lists';

export default function ListsPage() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // editing = the list being edited, or null when creating a new one
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const loadLists = async () => {
    try {
      setLoading(true);
      setLists(await listsApi.getLists());
      setError('');
    } catch (err) {
      setError(getMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (list) => {
    setEditing(list);
    setForm({ name: list.name, description: list.description || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await listsApi.updateList(editing._id, form);
      } else {
        await listsApi.createList(form);
      }
      setModalOpen(false);
      loadLists();
    } catch (err) {
      setError(getMessage(err));
    }
  };

  const handleDelete = async (list) => {
    if (!window.confirm(`Delete "${list.name}" and all of its contacts?`)) return;
    try {
      await listsApi.deleteList(list._id);
      loadLists();
    } catch (err) {
      setError(getMessage(err));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Customer Lists</h1>
        <button className="btn primary" onClick={openCreate}>
          + New List
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : lists.length === 0 ? (
        <p className="muted">No lists yet. Create your first one.</p>
      ) : (
        <div className="grid">
          {lists.map((list) => (
            <div key={list._id} className="card">
              <Link to={`/lists/${list._id}`} className="card-title">
                {list.name}
              </Link>
              <p className="muted">{list.description || 'No description'}</p>
              <div className="card-actions">
                <button className="btn" onClick={() => openEdit(list)}>
                  Edit
                </button>
                <button className="btn danger" onClick={() => handleDelete(list)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal
          title={editing ? 'Edit List' : 'New List'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="form">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. VIP Customers"
                required
              />
            </label>
            <label>
              Description
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional"
                rows={3}
              />
            </label>
            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn primary">
                {editing ? 'Save' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
