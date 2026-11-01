import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { prescriptionService, Prescription } from '../../services/prescriptionService';
import { stockService } from '../../services/stockService';
import { useToast } from '../../contexts/ToastContext';
import { Pill, CheckCircle2, AlertTriangle, Stethoscope, RefreshCw, User, PackageCheck } from 'lucide-react';

export const PharmacistDispense: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Dispense modal state
  const [dispenseTarget, setDispenseTarget] = useState<Prescription | null>(null);
  const [dispensing, setDispensing] = useState<boolean>(false);

  const { showSuccess, showError } = useToast();

  const fetchPendingPrescriptions = async () => {
    setLoading(true);
    try {
      const data = await prescriptionService.getAllPrescriptions('PENDING_DISPENSE');
      setPrescriptions(data);
    } catch (err: any) {
      showError('Failed to fetch pending prescriptions queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPrescriptions();
  }, []);

  const handleDispenseConfirm = async () => {
    if (!dispenseTarget) return;
    setDispensing(true);
    try {
      await stockService.dispensePrescription(dispenseTarget.id);
      showSuccess(`Prescription for ${dispenseTarget.appointment.student.user.name} dispensed successfully! Inventory stock updated.`);
      setDispenseTarget(null);
      fetchPendingPrescriptions();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Dispensation failed.');
    } finally {
      setDispensing(false);
    }
  };

  if (loading) {
    return <Spinner size="lg" className="min-h-[50vh]" />;
  }

  return (
    <div className="space-y-6">
      <Header
        title="Pharmacy Prescription Dispensing Queue"
        subtitle="Verify digital prescriptions issued by doctors and execute atomic inventory stock deduction"
        action={
          <Button variant="outline" icon={<RefreshCw />} onClick={fetchPendingPrescriptions}>
            Refresh Queue
          </Button>
        }
      />

      <Card title="Pending Prescriptions Awaiting Dispensation">
        {prescriptions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-indigo-100 my-4 shadow-sm">
            <PackageCheck className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-indigo-950">No Prescriptions Awaiting Dispensation</h4>
            <p className="text-xs text-indigo-600/80 max-w-sm mx-auto mt-1">
              When doctors complete consultations and issue prescriptions, they will arrive here for verification and stock reduction.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="p-5 rounded-2xl bg-white border border-indigo-100 space-y-4 shadow-sm hover:border-purple-200 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-indigo-100 pb-3 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-600" />
                      <h4 className="text-base font-bold text-indigo-950">
                        {rx.appointment.student.user.name} ({rx.appointment.student.rollNo})
                      </h4>
                    </div>
                    <p className="text-xs text-indigo-600/80 mt-0.5">
                      Prescribed by <span className="font-bold text-indigo-950">{rx.appointment.doctor.user.name}</span> on{' '}
                      {new Date(rx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="warning">PENDING DISPENSE</Badge>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={<CheckCircle2 />}
                      onClick={() => setDispenseTarget(rx)}
                    >
                      Dispense Medicines
                    </Button>
                  </div>
                </div>

                {rx.visit && (
                  <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-xs">
                    <span className="text-indigo-700 font-semibold block mb-0.5">Diagnosis:</span>
                    <p className="text-emerald-700 font-bold">{rx.visit.diagnosis}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">
                    Prescribed Items Verification
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {rx.items.map((item) => {
                      const hasEnoughStock = item.medicine.quantity >= item.quantity;
                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-xl border space-y-1 ${
                            hasEnoughStock
                              ? 'bg-indigo-50/50 border-indigo-100'
                              : 'bg-rose-50 border-rose-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-950">{item.medicine.name}</span>
                            <span className="text-emerald-700 font-extrabold font-mono">
                              Need: {item.quantity} {item.medicine.unit}
                            </span>
                          </div>
                          <p className="text-[11px] text-indigo-700/80 italic">Dosage: {item.dosageInstructions}</p>

                          <div className="pt-1 flex items-center justify-between text-[11px]">
                            <span className="text-indigo-600/80">Current Stock: {item.medicine.quantity} {item.medicine.unit}</span>
                            {hasEnoughStock ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                ✓ Available
                              </span>
                            ) : (
                              <span className="text-rose-700 font-bold flex items-center gap-1">
                                ⚠ Insufficient Stock
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Dispense Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(dispenseTarget)}
        onClose={() => setDispenseTarget(null)}
        onConfirm={handleDispenseConfirm}
        title="Confirm Dispense & Deduct Inventory"
        message={`Are you sure you want to dispense medicines for ${dispenseTarget?.appointment.student.user.name}? This will atomically deduct the prescribed quantities from inventory stock.`}
        confirmLabel="Yes, Dispense Now"
        variant="primary"
        loading={dispensing}
      />
    </div>
  );
};
