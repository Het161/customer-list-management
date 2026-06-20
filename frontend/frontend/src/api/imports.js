import client from './client';

// Kick off a bulk import. Returns { message, importJobId }.
export const startImport = (listId, contacts) =>
  client.post(`/lists/${listId}/import`, { contacts }).then((r) => r.data);

// Read the current status/counters of an import job (used for polling).
export const getImportStatus = (id) =>
  client.get(`/import/${id}`).then((r) => r.data);
