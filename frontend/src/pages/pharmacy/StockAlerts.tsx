import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { stockService, StockAlertsSummary } from '../../services/stockService';
import { useToast } from '../../contexts/ToastContext';
import { AlertTriangle, ShieldAlert, Clock, RefreshCw, ArrowDownRight } from 'lucide-react';

export const StockAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<StockAlertsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showError } = useToast();

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await stockService.getStockAlerts();
      setAlerts(data);
    } catch (err: any) {
      showError('Failed to fetch stock alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  if (loading) {
    return <Spinner size="lg" className="min-h-[50vh]" />;
  }

  const summary = alerts?.summary;

  return (
    <div className="space-y-6">
      <Header
        title="Stock & Expiry Alerts Console"
        subtitle="Automated inventory alert triggers for low-stock thresholds, near-expiry batches, and expired items"
        action={
          <Button variant="outline" icon={<RefreshCw />} onClick={fetchAlerts}>
            Refresh Alerts
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable className="border-t-4 border-t-rose-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase text-indigo-900">Low-Stock Warnings</p>
              <h3 className="text-2xl font-black text-rose-700 mt-1">{summary?.lowStockCount || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-t-4 border-t-amber-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase text-indigo-900">Near-Expiry (30 Days)</p>
              <h3 className="text-2xl font-black text-amber-700 mt-1">{summary?.nearExpiryCount || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-t-4 border-t-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase text-indigo-900">Expired Medicines</p>
              <h3 className="text-2xl font-black text-purple-700 mt-1">{summary?.expiredCount || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-t-4 border-t-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase text-indigo-900">Total Active Catalog</p>
              <h3 className="text-2xl font-black text-indigo-950 mt-1">{summary?.totalMedicines || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <RefreshCw className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Low-Stock Table */}
      <Card title="Low-Stock Alerts (Quantity ≤ Reorder Threshold)">
        {alerts?.lowStock.length === 0 ? (
          <p className="text-xs text-indigo-600/80 font-medium py-4 text-center">No low-stock alerts. All medicines have healthy quantity levels.</p>
        ) : (
          <div className="space-y-2">
            {alerts?.lowStock.map((med) => (
              <div key={med.id} className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-indigo-100 text-xs shadow-sm">
                <div>
                  <p className="font-bold text-indigo-950">{med.name} ({med.category})</p>
                  <p className="text-indigo-600/80 mt-0.5">Reorder Threshold: {med.reorderLevel} {med.unit}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="danger">Current Stock: {med.quantity} {med.unit}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Near-Expiry Table */}
      <Card title="Near-Expiry Alerts (Expiring Within 30 Days)">
        {alerts?.nearExpiry.length === 0 ? (
          <p className="text-xs text-indigo-600/80 font-medium py-4 text-center">No near-expiry alerts. All medicine batches are well within shelf life.</p>
        ) : (
          <div className="space-y-2">
            {alerts?.nearExpiry.map((med) => (
              <div key={med.id} className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-indigo-100 text-xs shadow-sm">
                <div>
                  <p className="font-bold text-indigo-950">{med.name} ({med.category})</p>
                  <p className="text-indigo-600/80 mt-0.5">Stock Available: {med.quantity} {med.unit}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="warning">Expires in {med.daysRemaining} days ({new Date(med.expiryDate).toLocaleDateString()})</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Expired Items Table */}
      {alerts?.expired && alerts.expired.length > 0 && (
        <Card title="Expired Medicines (Blocked from Dispensation)">
          <div className="space-y-2">
            {alerts.expired.map((med) => (
              <div key={med.id} className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs shadow-sm">
                <div>
                  <p className="font-bold text-rose-950">{med.name}</p>
                  <p className="text-rose-700/80 mt-0.5">Expired on: {new Date(med.expiryDate).toLocaleDateString()}</p>
                </div>
                <Badge variant="danger">EXPIRED (Quantity: {med.quantity})</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
