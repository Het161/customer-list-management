import client from './client';

export const startImport = (listId, contacts) =>
  client.post(`/lists/${listId}/import`, { contacts }).then((r) => r.data);

export const getImportStatus = (id) =>
  client.get(`/import/${id}`).then((r) => r.data);
