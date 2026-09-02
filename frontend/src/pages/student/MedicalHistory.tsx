import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { consultationService, PatientHistory } from '../../services/consultationService';
import { useToast } from '../../contexts/ToastContext';
import { FileText, Calendar, Stethoscope, Pill, HeartPulse } from 'lucide-react';

export const MedicalHistory: React.FC = () => {
  const [history, setHistory] = useState<PatientHistory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showError } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await consultationService.getMyMedicalHistory();
        setHistory(data);
      } catch (err: any) {
        showError('Failed to load your medical history records.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <Spinner size="lg" className="min-h-[50vh]" />;
  }

  const student = history?.student;
  const visits = history?.visits || [];

  return (
    <div className="space-y-6">
      <Header
        title="My Medical History & Health Records"
        subtitle="Complete record of your past health center visits, doctor consultations, diagnoses & prescribed treatments"
      />

      {/* Patient Health Profile Banner */}
      <Card className="border-l-4 border-l-emerald-500">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block">Student Name:</span>
            <span className="text-base font-bold text-slate-100">{student?.user.name}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block">Roll Number:</span>
            <span className="font-mono text-emerald-400 font-bold">{student?.rollNo}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block">Blood Group:</span>
            <Badge variant="success" size="md">
              {student?.bloodGroup}
            </Badge>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block">Known Allergies:</span>
            <span className="text-rose-400 font-bold">{student?.allergies || 'None'}</span>
          </div>
        </div>
      </Card>

      <Card title="Past Health Center Visits & Consultations">
        {visits.length === 0 ? (
          <div className="p-8 text-center glass-panel rounded-xl border border-slate-800 my-4">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-300">No Past Visit Records Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Your consultation history will automatically populate here after completing appointments with campus doctors.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => (
              <div key={visit.id} className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700/50 pb-3 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-sm font-bold text-slate-100">{visit.doctor.user.name}</h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Visit Date: {new Date(visit.createdAt).toLocaleDateString()} at {visit.appointment?.timeSlot}
                    </p>
                  </div>
                  <Badge variant="info">Token #{visit.appointment?.tokenNo || 1}</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 font-semibold block mb-1">Reported Symptoms:</span>
                    <p className="text-slate-200">{visit.symptoms}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 font-semibold block mb-1">Doctor Diagnosis:</span>
                    <p className="text-emerald-400 font-bold text-sm">{visit.diagnosis}</p>
                  </div>
                </div>

                {visit.notes && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <span className="font-semibold text-slate-400 block mb-1">Clinical Advice / Doctor Notes:</span>
                    <p className="text-slate-300 italic">{visit.notes}</p>
                  </div>
                )}

                {/* Linked Prescription Details */}
                {visit.prescriptions && visit.prescriptions.length > 0 && (
                  <div className="pt-3 border-t border-slate-700/50 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-amber-400" />
                        Prescribed Medicines
                      </span>
                      <Badge variant={visit.prescriptions[0].status === 'DISPENSED' ? 'success' : 'warning'}>
                        {visit.prescriptions[0].status === 'DISPENSED' ? 'Dispensed by Pharmacist' : 'Pending Dispense'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {visit.prescriptions[0].items.map((it) => (
                        <div key={it.id} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                          <p className="font-bold text-slate-100">{it.medicine.name}</p>
                          <p className="text-emerald-400 text-[11px] font-semibold mt-0.5">
                            Qty: {it.quantity} {it.medicine.unit} — {it.dosageInstructions}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
