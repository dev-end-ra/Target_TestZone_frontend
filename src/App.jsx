import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import MockTests from './pages/MockTests';
import Results from './pages/Results';
import Exam from './pages/Exam';
import ResultAnalysis from './pages/ResultAnalysis';
import SolutionReview from './pages/SolutionReview';
import AdminDashboard from './pages/AdminDashboard';
import PendingApproval from './pages/PendingApproval';
import Profile from './pages/Profile';

// Protected Route: requires JWT
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Approved Route: requires approved status (admin bypasses)
const ApprovedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  
  if (user.role === 'admin') return children; // Admins always pass
  if (user.status !== 'approved') return <Navigate to="/pending" replace />;
  return children;
};

// Admin Only Route
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  if (user.role !== 'admin') return <Navigate to="/home" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      
      {/* Pending Approval (logged in but not approved) */}
      <Route path="/pending" element={<ProtectedRoute><PendingApproval /></ProtectedRoute>} />

      {/* Protected + Layout wrapped pages */}
      <Route path="/home" element={<ApprovedRoute><Layout><Home /></Layout></ApprovedRoute>} />
      <Route path="/tests" element={<ApprovedRoute><Layout><MockTests /></Layout></ApprovedRoute>} />
      <Route path="/results" element={<ApprovedRoute><Layout><Results /></Layout></ApprovedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="/result/:id" element={<ApprovedRoute><Layout><ResultAnalysis /></Layout></ApprovedRoute>} />
      <Route path="/review/:id" element={<ApprovedRoute><Layout><SolutionReview /></Layout></ApprovedRoute>} />
      
      {/* Exam - no Navbar, fullscreen */}
      <Route path="/exam" element={<ApprovedRoute><Exam /></ApprovedRoute>} />

      {/* Admin only */}
      <Route path="/admin" element={<AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute>} />

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/dashboard" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
