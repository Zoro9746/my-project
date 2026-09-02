import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Users, Stethoscope, Pill, Calendar, BarChart3, AlertTriangle, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <Header
        title="Admin Control Center"
        subtitle="System-wide health operations, user management, doctor schedules, medicine inventory & reports"
        action={
          <Link to="/admin/users">
            <Button icon={<Users />}>Manage Accounts</Button>
          </Link>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered Students</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">2</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Doctors</p>
              <h3 className="text-2xl font-extrabold text-sky-400 mt-1">2</h3>
            </div>
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400">
              <Stethoscope className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Medicine Catalog</p>
              <h3 className="text-2xl font-extrabold text-amber-400 mt-1">6 Items</h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <Pill className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">System Health</p>
              <Badge variant="success">100% Operational</Badge>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Quick Management Actions" className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/admin/users"
              className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all flex items-start gap-3 group"
            >
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                  User Account Controls
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Activate or deactivate student, doctor, or staff accounts.</p>
              </div>
            </Link>

            <Link
              to="/admin/schedules"
              className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all flex items-start gap-3 group"
            >
              <div className="p-3 rounded-lg bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-sky-400 transition-colors">
                  Doctor Rosters & Schedules
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Configure consultation hours and slot durations.</p>
              </div>
            </Link>

            <Link
              to="/admin/medicines"
              className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all flex items-start gap-3 group"
            >
              <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                  Medication Catalog
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Manage medicines, reorder thresholds & stock transactions.</p>
              </div>
            </Link>

            <Link
              to="/admin/reports"
              className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all flex items-start gap-3 group"
            >
              <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-purple-400 transition-colors">
                  Analytics & Reports
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Generate and export PDF/Excel reports for health administration.</p>
              </div>
            </Link>
          </div>
        </Card>

        <Card title="System Audit Logs" className="lg:col-span-1">
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-emerald-400 font-bold block">Seeded Demo Environment</span>
              <span className="text-slate-400">All 4 roles pre-loaded with realistic campus data.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-slate-200 font-bold block font-mono">DATABASE_URL</span>
              <span className="text-slate-400">Prisma ORM SQLite / MySQL Ready</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-slate-200 font-bold block font-mono">AUTH_SECURITY</span>
              <span className="text-slate-400">bcrypt password hashing + JWT Bearer RBAC</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
