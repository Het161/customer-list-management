import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Modal from '../components/Modal';
import { getMessage } from '../utils/error';
import { getList } from '../api/lists';
import * as contactsApi from '../api/contacts';

const emptyForm = { name: '', phone: '', email: '' };

export default function ContactsPage() {
  // The :listId segment from the URL (/lists/:listId).
  const { listId } = useParams();

  const [list, setList] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // Load the list's name once, so we can show it in the header.
  useEffect(() => {
    getList(listId)
      .then(setList)
      .catch((err) => setError(getMessage(err)));
  }, [listId]);

  // Reload contacts whenever the list or the search term changes. The 300ms
  // timer debounces typing so we don't fire a request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setContacts(await contactsApi.getContacts(listId, search));
        setError('');
      } catch (err) {
        setError(getMessage(err));
      } finally {
        setLoading(false);
      }
    }, 300);

    // Cancel the pending timer if the effect re-runs before it fires.
    return () => clearTimeout(timer);
  }, [listId, search]);

  const reload = async () => {
    setContacts(await contactsApi.getContacts(listId, search));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (contact) => {
    setEditing(contact);
    setForm({ name: contact.name, phone: contact.phone, email: contact.email || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await contactsApi.updateContact(editing._id, form);
      } else {
        await contactsApi.addContact(listId, form);
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      // Most likely a duplicate phone (409) — show the server's message.
      setError(getMessage(err));
    }
  };

  const handleDelete = async (contact) => {
    if (!window.confirm(`Delete ${contact.name}?`)) return;
    try {
      await contactsApi.deleteContact(contact._id);
      reload();
    } catch (err) {
      setError(getMessage(err));
    }
  };

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/">← All lists</Link>
      </div>

      <div className="page-header">
        <h1>{list ? list.name : 'Contacts'}</h1>
        <div className="header-actions">
          <Link to={`/lists/${listId}/import`} className="btn">
            Import
          </Link>
          <button className="btn primary" onClick={openCreate}>
            + Add Contact
          </button>
        </div>
      </div>

      <input
        className="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, phone or email"
      />

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : contacts.length === 0 ? (
        <p className="muted">No contacts found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.email || '—'}</td>
                <td className="row-actions">
                  <button className="btn small" onClick={() => openEdit(c)}>
                    Edit
                  </button>
                  <button className="btn small danger" onClick={() => handleDelete(c)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <Modal
          title={editing ? 'Edit Contact' : 'Add Contact'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="form">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Optional"
              />
            </label>
            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn primary">
                {editing ? 'Save' : 'Add'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
