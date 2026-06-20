import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMessage } from '../utils/error';
import { startImport, getImportStatus } from '../api/imports';

const SAMPLE = `Ravi Patel, 9876543210, ravi@example.com
Neha Shah, 9123456780, neha@example.com
Amit Joshi, 9988776655`;

// Turn pasted CSV text into an array of { name, phone, email }. Each non-empty
// line is "name, phone, email" (email optional). Done on the client so we can
// send clean JSON to the import API.
function parseCsv(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = '', phone = '', email = ''] = line.split(',').map((p) => p.trim());
      return { name, phone, email };
    });
}

export default function ImportPage() {
  const { listId } = useParams();
  const [raw, setRaw] = useState('');
  const [error, setError] = useState('');
  const [job, setJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Holds the polling interval id so we can clear it when the job finishes
  // or when the user leaves the page.
  const pollRef = useRef(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  // Clean up the interval if the component unmounts mid-import.
  useEffect(() => stopPolling, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRaw(reader.result);
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const contacts = parseCsv(raw);
    if (contacts.length === 0) {
      setError('Please add at least one contact row.');
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      const { importJobId } = await startImport(listId, contacts);

      // Poll the job status every second until it is no longer running.
      pollRef.current = setInterval(async () => {
        try {
          const status = await getImportStatus(importJobId);
          setJob(status);
          if (status.status === 'Completed' || status.status === 'Failed') {
            stopPolling();
          }
        } catch (err) {
          setError(getMessage(err));
          stopPolling();
        }
      }, 1000);
    } catch (err) {
      setError(getMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const done = job && (job.status === 'Completed' || job.status === 'Failed');

  return (
    <div>
      <div className="breadcrumb">
        <Link to={`/lists/${listId}`}>← Back to contacts</Link>
      </div>

      <h1>Import Contacts</h1>
      <p className="muted">
        One contact per line: <code>Name, Phone, Email</code> (email optional).
      </p>

      <form onSubmit={handleSubmit} className="form">
        <textarea
          className="csv-input"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={SAMPLE}
          rows={10}
        />
        <div className="form-actions">
          <input type="file" accept=".csv,.txt" onChange={handleFile} />
          <button type="submit" className="btn primary" disabled={submitting}>
            {submitting ? 'Starting…' : 'Start Import'}
          </button>
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      {job && (
        <div className="job-status">
          <h3>
            Status: <span className={`badge ${job.status.toLowerCase()}`}>{job.status}</span>
          </h3>
          <div className="stats">
            <Stat label="Total" value={job.total} />
            <Stat label="Inserted" value={job.inserted} />
            <Stat label="Duplicates" value={job.duplicates} />
            <Stat label="Failed" value={job.failed} />
          </div>
          {!done && <p className="muted">Processing… this updates automatically.</p>}
          {done && (
            <Link to={`/lists/${listId}`} className="btn primary">
              View contacts
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="stat-value">{value ?? 0}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
