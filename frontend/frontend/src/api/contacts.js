import client from './client';

export const getContacts = (listId, search) =>
  client.get(`/lists/${listId}/contacts`, { params: { search } }).then((r) => r.data);

export const addContact = (listId, data) =>
  client.post(`/lists/${listId}/contacts`, data).then((r) => r.data);

export const updateContact = (id, data) =>
  client.put(`/contacts/${id}`, data).then((r) => r.data);

export const deleteContact = (id) =>
  client.delete(`/contacts/${id}`).then((r) => r.data);
