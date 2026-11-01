import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { StudentRegister } from './pages/auth/StudentRegister';
import { ProfilePage } from './pages/profile/ProfilePage';

// Dashboards
import { StudentDashboard } from './pages/dashboard/StudentDashboard';
import { DoctorDashboard } from './pages/dashboard/DoctorDashboard';
import { PharmacistDashboard } from './pages/dashboard/PharmacistDashboard';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';

// Phase 2 Pages
import { BookAppointment } from './pages/student/BookAppointment';
import { StudentAppointments } from './pages/student/StudentAppointments';
import { DoctorQueue } from './pages/doctor/DoctorQueue';
import { DoctorScheduleManager } from './pages/doctor/DoctorScheduleManager';

// Phase 3 Pages
import { DoctorConsultation } from './pages/doctor/DoctorConsultation';
import { MedicalHistory } from './pages/student/MedicalHistory';
import { StudentPrescriptions } from './pages/student/StudentPrescriptions';

// Phase 4 Pages
import { PharmacistDispense } from './pages/pharmacy/PharmacistDispense';
import { InventoryManager } from './pages/pharmacy/InventoryManager';
import { StockAlerts } from './pages/pharmacy/StockAlerts';
import { StockTransactions } from './pages/pharmacy/StockTransactions';

// Phase 5 Pages
import { AdminUserManagement } from './pages/admin/AdminUserManagement';
import { AdminDoctorManagement } from './pages/admin/AdminDoctorManagement';
import { AdminMedicineControl } from './pages/admin/AdminMedicineControl';

// Phase 6 Pages
import { ReportsCenter } from './pages/reports/ReportsCenter';

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'STUDENT':
      return <StudentDashboard />;
    case 'DOCTOR':
      return <DoctorDashboard />;
    case 'PHARMACIST':
      return <PharmacistDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const LayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f4f3ff] text-indigo-950 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<StudentRegister />} />

      {/* Protected Routes inside Application Shell */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={
            <LayoutShell>
              <DashboardRouter />
            </LayoutShell>
          }
        />
        <Route
          path="/profile"
          element={
            <LayoutShell>
              <ProfilePage />
            </LayoutShell>
          }
        />

        {/* Student Routes */}
        <Route
          path="/appointments/book"
          element={
            <LayoutShell>
              <BookAppointment />
            </LayoutShell>
          }
        />
        <Route
          path="/appointments"
          element={
            <LayoutShell>
              <StudentAppointments />
            </LayoutShell>
          }
        />
        <Route
          path="/history"
          element={
            <LayoutShell>
              <MedicalHistory />
            </LayoutShell>
          }
        />
        <Route
          path="/prescriptions"
          element={
            <LayoutShell>
              <StudentPrescriptions />
            </LayoutShell>
          }
        />

        {/* Doctor Routes */}
        <Route
          path="/doctor/queue"
          element={
            <LayoutShell>
              <DoctorQueue />
            </LayoutShell>
          }
        />
        <Route
          path="/doctor/schedule"
          element={
            <LayoutShell>
              <DoctorScheduleManager />
            </LayoutShell>
          }
        />
        <Route
          path="/doctor/consultation"
          element={
            <LayoutShell>
              <DoctorConsultation />
            </LayoutShell>
          }
        />

        {/* Pharmacist & Pharmacy Routes */}
        <Route
          path="/pharmacy/prescriptions"
          element={
            <LayoutShell>
              <PharmacistDispense />
            </LayoutShell>
          }
        />
        <Route
          path="/pharmacy/inventory"
          element={
            <LayoutShell>
              <InventoryManager />
            </LayoutShell>
          }
        />
        <Route
          path="/pharmacy/alerts"
          element={
            <LayoutShell>
              <StockAlerts />
            </LayoutShell>
          }
        />
        <Route
          path="/pharmacy/transactions"
          element={
            <LayoutShell>
              <StockTransactions />
            </LayoutShell>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/users"
          element={
            <LayoutShell>
              <AdminUserManagement />
            </LayoutShell>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <LayoutShell>
              <AdminDoctorManagement />
            </LayoutShell>
          }
        />
        <Route
          path="/admin/medicines"
          element={
            <LayoutShell>
              <AdminMedicineControl />
            </LayoutShell>
          }
        />

        {/* Reports Center (Admin, Doctor, Pharmacist) */}
        <Route
          path="/reports"
          element={
            <LayoutShell>
              <ReportsCenter />
            </LayoutShell>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
