import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { prescriptionService, Prescription } from '../../services/prescriptionService';
import { useToast } from '../../contexts/ToastContext';
import { Pill, Clock, CheckCircle2, Stethoscope, AlertTriangle } from 'lucide-react';

export const StudentPrescriptions: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { showError } = useToast();

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const data = await prescriptionService.getAllPrescriptions();
        setPrescriptions(data);
      } catch (err: any) {
        showError('Failed to fetch digital prescriptions.');
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  if (loading) {
    return <Spinner size="lg" className="min-h-[50vh]" />;
  }

  return (
    <div className="space-y-6">
      <Header
        title="My Digital Prescriptions"
        subtitle="View digital prescriptions issued by campus doctors and track pharmacy dispensing status"
      />

      <Card title="Issued Digital Prescriptions List">
        {prescriptions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-indigo-100 my-4 shadow-sm">
            <Pill className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-indigo-950">No Prescriptions Found</h4>
            <p className="text-xs text-indigo-600/80 max-w-sm mx-auto mt-1">
              When campus doctors issue digital prescriptions during your visits, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="p-5 rounded-2xl bg-white border border-indigo-100 space-y-4 shadow-sm hover:border-purple-200 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-indigo-100 pb-3 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-purple-600" />
                      <h4 className="text-sm font-bold text-indigo-950">{rx.appointment.doctor.user.name}</h4>
                    </div>
                    <p className="text-xs text-indigo-600/80 mt-0.5">
                      Issued Date: {new Date(rx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={rx.status === 'DISPENSED' ? 'success' : 'warning'}>
                    {rx.status === 'DISPENSED' ? 'Dispensed by Pharmacist' : 'Pending Dispense at Pharmacy'}
                  </Badge>
                </div>

                {rx.visit && (
                  <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-xs">
                    <span className="text-indigo-700 font-semibold block mb-0.5">Associated Diagnosis:</span>
                    <p className="text-emerald-700 font-bold">{rx.visit.diagnosis}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    Prescribed Medicines ({rx.items.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {rx.items.map((item) => (
                      <div key={item.id} className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-950">{item.medicine.name}</span>
                          <span className="text-emerald-700 font-extrabold font-mono">
                            Qty: {item.quantity} {item.medicine.unit}
                          </span>
                        </div>
                        <p className="text-[11px] text-indigo-700/80 italic">
                          Dosage: {item.dosageInstructions}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
