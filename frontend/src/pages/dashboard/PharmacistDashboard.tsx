import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { prescriptionService, Prescription } from '../../services/prescriptionService';
import { stockService, StockAlertsSummary } from '../../services/stockService';
import { Pill, AlertTriangle, Clock, ShieldAlert, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PharmacistDashboard: React.FC = () => {
  const { user } = useAuth();
  const [pendingPrescriptions, setPendingPrescriptions] = useState<Prescription[]>([]);
  const [alertsSummary, setAlertsSummary] = useState<StockAlertsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pending, alerts] = await Promise.all([
          prescriptionService.getAllPrescriptions('PENDING_DISPENSE'),
          stockService.getStockAlerts(),
        ]);
        setPendingPrescriptions(pending);
        setAlertsSummary(alerts);
      } catch (err) {
        console.error('Error loading pharmacist dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!user) return null;

  const columns: Column<Prescription>[] = [
    {
      header: 'Prescription ID',
      cell: (item) => <span className="font-mono text-xs font-bold text-indigo-950">#{item.id.substring(0, 8)}</span>,
    },
    {
      header: 'Student Name',
      cell: (item) => (
        <div>
          <p className="font-bold text-indigo-950">{item.appointment.student.user.name}</p>
          <p className="text-xs text-indigo-600/80 font-mono">Roll: {item.appointment.student.rollNo}</p>
        </div>
      ),
    },
    {
      header: 'Prescribing Doctor',
      cell: (item) => <span className="text-xs font-semibold text-indigo-800">{item.appointment.doctor.user.name}</span>,
    },
    {
      header: 'Medicines Count',
      cell: (item) => <span className="text-xs font-extrabold text-emerald-700">{item.items.length} Items</span>,
    },
    {
      header: 'Status',
      cell: () => <Badge variant="warning">PENDING DISPENSE</Badge>,
    },
  ];

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
        <Card hoverable className="border-t-4 border-t-amber-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">Pending Dispense</p>
              <h3 className="text-2xl font-black text-amber-700 mt-1">{pendingPrescriptions.length}</h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-t-4 border-t-rose-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">Low Stock Alerts</p>
              <h3 className="text-2xl font-black text-rose-700 mt-1">{alertsSummary?.summary.lowStockCount || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-t-4 border-t-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">Near-Expiry (30d)</p>
              <h3 className="text-2xl font-black text-purple-700 mt-1">{alertsSummary?.summary.nearExpiryCount || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-t-4 border-t-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">Total Medicines</p>
              <h3 className="text-2xl font-black text-indigo-950 mt-1">{alertsSummary?.summary.totalMedicines || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Pill className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Pending Prescriptions Awaiting Dispensation" className="lg:col-span-2">
          <Table
            columns={columns}
            data={pendingPrescriptions}
            keyExtractor={(item) => item.id}
            emptyMessage="No prescriptions awaiting dispensation at pharmacy."
            loading={loading}
          />
        </Card>

        <Card title="Active Low Stock Alerts Summary" className="lg:col-span-1">
          <div className="space-y-3">
            {alertsSummary?.lowStock.length === 0 ? (
              <p className="text-xs text-indigo-600/80 font-medium">No low-stock items.</p>
            ) : (
              alertsSummary?.lowStock.map((med) => (
                <div key={med.id} className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-indigo-950">{med.name}</p>
                    <p className="text-indigo-600/80 text-[11px]">Reorder Level: {med.reorderLevel} {med.unit}</p>
                  </div>
                  <Badge variant="danger">Qty: {med.quantity}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
