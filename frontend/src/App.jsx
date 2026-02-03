import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import QcmPage from './pages/QcmPage';
import Login from './pages/Login';
import Register from './pages/Register';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/student">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/qcm/:id" element={<QcmPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
