import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ListsPage from './pages/ListsPage';
import ContactsPage from './pages/ContactsPage';
import ImportPage from './pages/ImportPage';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<ListsPage />} />
          <Route path="/lists/:listId" element={<ContactsPage />} />
          <Route path="/lists/:listId/import" element={<ImportPage />} />
        </Routes>
      </main>
    </>
  );
}
