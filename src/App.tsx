import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import Home from './pages/public/Home';
import Buses from './pages/public/Buses';
import RoutesPage from './pages/public/Routes';
import PQR from './pages/public/PQR';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import BusesAdmin from './pages/admin/BusesAdmin';
import ConductorsAdmin from './pages/admin/ConductorsAdmin';
import RoutesAdmin from './pages/admin/RoutesAdmin';
import PQRAdmin from './pages/admin/PQRAdmin';
import AdminsAdmin from './pages/admin/AdminsAdmin';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="buses" element={<Buses />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="pqr" element={<PQR />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="buses" element={<BusesAdmin />} />
          <Route path="conductors" element={<ConductorsAdmin />} />
          <Route path="routes" element={<RoutesAdmin />} />
          <Route path="pqr" element={<PQRAdmin />} />
          <Route path="admins" element={<AdminsAdmin />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
