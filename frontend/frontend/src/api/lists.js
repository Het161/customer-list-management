import client from './client';

// Each function returns just the response body (r.data) so components don't
// have to dig through the axios response object.
export const getLists = () => client.get('/lists').then((r) => r.data);
export const getList = (id) => client.get(`/lists/${id}`).then((r) => r.data);
export const createList = (data) => client.post('/lists', data).then((r) => r.data);
export const updateList = (id, data) => client.put(`/lists/${id}`, data).then((r) => r.data);
export const deleteList = (id) => client.delete(`/lists/${id}`).then((r) => r.data);
