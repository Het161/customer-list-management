import client from './client';

export const getLists = () => client.get('/lists').then((r) => r.data);
export const getList = (id) => client.get(`/lists/${id}`).then((r) => r.data);
export const createList = (data) => client.post('/lists', data).then((r) => r.data);
export const updateList = (id, data) => client.put(`/lists/${id}`, data).then((r) => r.data);
export const deleteList = (id) => client.delete(`/lists/${id}`).then((r) => r.data);
