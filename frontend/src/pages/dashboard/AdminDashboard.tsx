import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { adminService, AnalyticsOverview } from '../../services/adminService';
import { Users, Stethoscope, Calendar, FileText, Pill, AlertTriangle, ShieldCheck, UserCheck, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await adminService.getAnalyticsOverview();
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (!user) return null;

  if (loading) {
    return <Spinner size="lg" className="min-h-[50vh]" />;
  }

  const u = analytics?.users;
  const appts = analytics?.appointments;
  const med = analytics?.medical;
  const inv = analytics?.inventory;

  return (
    <div className="space-y-6">
      <Header
        title="BIT Health Center Administration Console"
        subtitle="System-wide management overview, user access controls, doctor rosters, and real-time operational metrics"
      />

      {/* Top Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable className="border-t-4 border-t-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">Total Registered Students</p>
              <h3 className="text-2xl font-black text-indigo-950 mt-1">{u?.totalStudents || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-t-4 border-t-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">Active Campus Doctors</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">{u?.totalDoctors || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Stethoscope className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-t-4 border-t-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">Completed Consultations</p>
              <h3 className="text-2xl font-black text-indigo-950 mt-1">{appts?.totalCompleted || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-t-4 border-t-amber-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">Dispensed Prescriptions</p>
              <h3 className="text-2xl font-black text-amber-700 mt-1">{med?.prescriptionsDispensed || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Pill className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Appointment Breakdown & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Appointment Operational Status Breakdown" className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center my-2">
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
              <p className="text-xs font-bold text-indigo-800">Today's Total Queue</p>
              <p className="text-3xl font-black text-indigo-950 mt-1">{appts?.todayTotal || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
              <p className="text-xs font-bold text-amber-900">In Queue (Confirmed)</p>
              <p className="text-3xl font-black text-amber-700 mt-1">{appts?.todayConfirmed || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200">
              <p className="text-xs font-bold text-rose-900">Cancelled Appointments</p>
              <p className="text-3xl font-black text-rose-700 mt-1">{appts?.totalCancelled || 0}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-indigo-100 flex justify-between items-center text-xs text-indigo-700">
            <span>Total Patient Visits Logged: <strong className="text-indigo-950 font-bold">{med?.totalVisits || 0} Visits</strong></span>
            <Link to="/admin/users" className="text-purple-600 hover:underline font-extrabold flex items-center gap-1">
              Manage All System Users →
            </Link>
          </div>
        </Card>

        {/* Quick Admin Actions Panel */}
        <Card title="Administrative Management Modules">
          <div className="space-y-3">
            <Link to="/admin/users" className="block">
              <div className="p-3.5 rounded-xl bg-white hover:bg-purple-50/70 border border-indigo-100 transition-all flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs font-bold text-indigo-950">User Management</p>
                    <p className="text-[11px] text-indigo-600/80">Activate/Deactivate, Reset Passwords</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-indigo-400" />
              </div>
            </Link>

            <Link to="/admin/doctors" className="block">
              <div className="p-3.5 rounded-xl bg-white hover:bg-purple-50/70 border border-indigo-100 transition-all flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-indigo-950">Doctor Roster & Schedules</p>
                    <p className="text-[11px] text-indigo-600/80">Room Numbers, Specializations</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-indigo-400" />
              </div>
            </Link>

            <Link to="/admin/medicines" className="block">
              <div className="p-3.5 rounded-xl bg-white hover:bg-purple-50/70 border border-indigo-100 transition-all flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <Pill className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-xs font-bold text-indigo-950">Inventory Catalog Control</p>
                    <p className="text-[11px] text-indigo-600/80">Master Stock Overrides & Alerts ({inv?.lowStockCount || 0} Low)</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-indigo-400" />
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
