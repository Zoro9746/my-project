import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Pill, AlertTriangle, Clock, ShieldAlert, ArrowRight, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PharmacistDashboard: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <Header
        title="Pharmacy & Inventory Console"
        subtitle="Manage medicine stocks, verify prescriptions & execute atomic stock dispensing"
        action={
          <Link to="/pharmacy/prescriptions">
            <Button icon={<PackageCheck />}>Dispense Prescriptions</Button>
          </Link>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Dispense</p>
              <h3 className="text-2xl font-extrabold text-amber-400 mt-1">0</h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Low Stock Alerts</p>
              <h3 className="text-2xl font-extrabold text-rose-400 mt-1">1</h3>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Near-Expiry (30d)</p>
              <h3 className="text-2xl font-extrabold text-purple-400 mt-1">1</h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Medicines</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">6</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Pill className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Pending Prescriptions" className="lg:col-span-2">
          <div className="p-8 text-center glass-panel rounded-xl border border-slate-800">
            <Pill className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-300">No Prescriptions Awaiting Dispensation</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
              When doctors issue prescriptions during patient consultations, they will arrive here for verification and stock reduction.
            </p>
          </div>
        </Card>

        <Card title="Active Inventory Summary" className="lg:col-span-1">
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-200">Cetirizine 10mg</p>
                <p className="text-slate-400 text-[11px]">Reorder: 25 Units</p>
              </div>
              <Badge variant="danger">Qty: 8</Badge>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-200">Azithromycin 500mg</p>
                <p className="text-slate-400 text-[11px]">Expiring in 15 Days</p>
              </div>
              <Badge variant="warning">Near Expiry</Badge>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-200">Paracetamol 500mg</p>
                <p className="text-slate-400 text-[11px]">Stock Healthy</p>
              </div>
              <Badge variant="success">Qty: 250</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
