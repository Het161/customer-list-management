import axios from 'axios';

// One axios instance for the whole app. Every request is sent relative to this
// base URL, so the backend address lives in a single place (overridable via a
// Vite env var for different environments).
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export default client;
