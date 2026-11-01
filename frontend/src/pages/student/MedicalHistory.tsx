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
      <Card className="border-t-4 border-t-purple-600">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-indigo-600/80 font-semibold block">Student Name:</span>
            <span className="text-base font-bold text-indigo-950">{student?.user.name}</span>
          </div>
          <div>
            <span className="text-indigo-600/80 font-semibold block">Roll Number:</span>
            <span className="font-mono text-purple-700 font-bold">{student?.rollNo}</span>
          </div>
          <div>
            <span className="text-indigo-600/80 font-semibold block">Blood Group:</span>
            <Badge variant="success" size="md">
              {student?.bloodGroup}
            </Badge>
          </div>
          <div>
            <span className="text-indigo-600/80 font-semibold block">Known Allergies:</span>
            <span className="text-rose-700 font-bold">{student?.allergies || 'None'}</span>
          </div>
        </div>
      </Card>

      <Card title="Past Health Center Visits & Consultations">
        {visits.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-indigo-100 my-4 shadow-sm">
            <FileText className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-indigo-950">No Past Visit Records Found</h4>
            <p className="text-xs text-indigo-600/80 max-w-sm mx-auto mt-1">
              Your consultation history will automatically populate here after completing appointments with campus doctors.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => (
              <div key={visit.id} className="p-5 rounded-2xl bg-white border border-indigo-100 space-y-4 shadow-sm hover:border-purple-200 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-indigo-100 pb-3 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-purple-600" />
                      <h4 className="text-sm font-bold text-indigo-950">{visit.doctor.user.name}</h4>
                    </div>
                    <p className="text-xs text-indigo-600/80 mt-0.5">
                      Visit Date: {new Date(visit.createdAt).toLocaleDateString()} at {visit.appointment?.timeSlot}
                    </p>
                  </div>
                  <Badge variant="info">Token #{visit.appointment?.tokenNo || 1}</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                    <span className="text-indigo-700 font-semibold block mb-1">Reported Symptoms:</span>
                    <p className="text-indigo-950">{visit.symptoms}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                    <span className="text-indigo-700 font-semibold block mb-1">Doctor Diagnosis:</span>
                    <p className="text-emerald-700 font-bold text-sm">{visit.diagnosis}</p>
                  </div>
                </div>

                {visit.notes && (
                  <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-xs">
                    <span className="font-semibold text-indigo-700 block mb-1">Clinical Advice / Doctor Notes:</span>
                    <p className="text-indigo-950 italic">{visit.notes}</p>
                  </div>
                )}

                {/* Linked Prescription Details */}
                {visit.prescriptions && visit.prescriptions.length > 0 && (
                  <div className="pt-3 border-t border-indigo-100 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-amber-600" />
                        Prescribed Medicines
                      </span>
                      <Badge variant={visit.prescriptions[0].status === 'DISPENSED' ? 'success' : 'warning'}>
                        {visit.prescriptions[0].status === 'DISPENSED' ? 'Dispensed by Pharmacist' : 'Pending Dispense'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {visit.prescriptions[0].items.map((it) => (
                        <div key={it.id} className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100">
                          <p className="font-bold text-indigo-950">{it.medicine.name}</p>
                          <p className="text-emerald-700 text-[11px] font-semibold mt-0.5">
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
