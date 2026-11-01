import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { consultationService, PatientHistory, PrescriptionItemInput } from '../../services/consultationService';
import { medicineService, Medicine } from '../../services/medicineService';
import { Appointment } from '../../services/appointmentService';
import { useToast } from '../../contexts/ToastContext';
import { Stethoscope, FileText, Pill, Plus, Trash2, CheckCircle2, History, AlertTriangle, ShieldAlert } from 'lucide-react';

export const DoctorConsultation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const appointment = location.state?.appointment as Appointment | undefined;

  const [activeTab, setActiveTab] = useState<'consult' | 'history'>('consult');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  // Prescription items state
  const [medicinesCatalog, setMedicinesCatalog] = useState<Medicine[]>([]);
  const [prescriptionItems, setPrescriptionItems] = useState<
    {
      medicineId: string;
      medicineName: string;
      unit: string;
      availableStock: number;
      quantity: number;
      dosageInstructions: string;
    }[]
  >([]);

  // Item selector state
  const [selectedMedId, setSelectedMedId] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [dosageInstructions, setDosageInstructions] = useState<string>('1 tab twice daily after meals');

  // History state
  const [patientHistory, setPatientHistory] = useState<PatientHistory | null>(null);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (!appointment) {
      navigate('/doctor/queue');
      return;
    }

    // Fetch medicines catalog
    const fetchCatalog = async () => {
      try {
        const meds = await medicineService.getAllMedicines();
        setMedicinesCatalog(meds);
        if (meds.length > 0) {
          setSelectedMedId(meds[0].id);
        }
      } catch (err) {
        showError('Failed to load medicines catalog.');
      }
    };

    // Fetch patient historical visits
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const hist = await consultationService.getPatientHistory(appointment.studentId);
        setPatientHistory(hist);
      } catch (err) {
        console.error('Error fetching patient history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchCatalog();
    fetchHistory();
  }, [appointment, navigate]);

  const handleAddPrescriptionItem = () => {
    if (!selectedMedId) {
      showError('Please select a medicine');
      return;
    }

    const med = medicinesCatalog.find((m) => m.id === selectedMedId);
    if (!med) return;

    if (itemQuantity <= 0) {
      showError('Quantity must be greater than zero');
      return;
    }

    if (itemQuantity > med.quantity) {
      showError(`Quantity exceeds available stock (${med.quantity} ${med.unit} available)`);
      return;
    }

    // Check if item already added
    if (prescriptionItems.some((it) => it.medicineId === selectedMedId)) {
      showError('Medicine is already added to prescription. Remove it first to update.');
      return;
    }

    setPrescriptionItems((prev) => [
      ...prev,
      {
        medicineId: med.id,
        medicineName: med.name,
        unit: med.unit,
        availableStock: med.quantity,
        quantity: itemQuantity,
        dosageInstructions,
      },
    ]);

    // Reset item inputs
    setItemQuantity(1);
    setDosageInstructions('1 tab twice daily after meals');
  };

  const handleRemovePrescriptionItem = (index: number) => {
    setPrescriptionItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmitConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    if (!symptoms || !diagnosis) {
      showError('Please fill in both symptoms and diagnosis fields.');
      return;
    }

    setSubmitting(true);
    try {
      const itemsPayload: PrescriptionItemInput[] = prescriptionItems.map((it) => ({
        medicineId: it.medicineId,
        quantity: it.quantity,
        dosageInstructions: it.dosageInstructions,
      }));

      await consultationService.completeConsultation({
        appointmentId: appointment.id,
        symptoms,
        diagnosis,
        notes,
        prescriptionItems: itemsPayload,
      });

      showSuccess('Consultation completed! Digital prescription created (Pending Dispense).');
      navigate('/doctor/queue');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to complete consultation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!appointment) return null;

  return (
    <div className="space-y-6">
      <Header
        title={`Consultation — Token #${appointment.tokenNo}`}
        subtitle={`Patient: ${appointment.student.user.name} (${appointment.student.rollNo}) | Dept: ${appointment.student.department}`}
        action={
          <Button variant="outline" onClick={() => navigate('/doctor/queue')}>
            ← Back to Queue
          </Button>
        }
      />

      {/* Patient Vitals & Profile Banner */}
      <Card className="border-t-4 border-t-purple-600">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-indigo-600/80 font-semibold block">Patient Name:</span>
            <span className="text-base font-bold text-indigo-950">{appointment.student.user.name}</span>
          </div>
          <div>
            <span className="text-indigo-600/80 font-semibold block">Roll Number:</span>
            <span className="font-mono text-purple-700 font-bold">{appointment.student.rollNo}</span>
          </div>
          <div>
            <span className="text-indigo-600/80 font-semibold block">Blood Group:</span>
            <Badge variant="success" size="md">
              {appointment.student.bloodGroup}
            </Badge>
          </div>
          <div>
            <span className="text-indigo-600/80 font-semibold block">Known Allergies:</span>
            <span className="text-rose-700 font-bold">{appointment.student.allergies || 'None'}</span>
          </div>
        </div>
      </Card>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-3 border-b border-indigo-100 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('consult')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'consult'
              ? 'bg-purple-600 text-white shadow-sm border border-purple-600'
              : 'text-indigo-700 hover:bg-purple-50 bg-white border border-indigo-100'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          Conduct Consultation & Issue Prescription
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-purple-600 text-white shadow-sm border border-purple-600'
              : 'text-indigo-700 hover:bg-purple-50 bg-white border border-indigo-100'
          }`}
        >
          <History className="w-4 h-4" />
          Patient Medical History ({patientHistory?.visits.length || 0} Visits)
        </button>
      </div>

      {activeTab === 'consult' ? (
        <form onSubmit={handleSubmitConsultation} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Symptoms & Diagnosis */}
            <Card title="Clinical Diagnosis & Notes">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-indigo-900 uppercase tracking-wider mb-1.5">
                    Chief Symptoms / Complaints *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. High fever (102°F), severe body ache, sore throat for 2 days"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-xl text-indigo-950 placeholder-indigo-300 text-sm p-3 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-indigo-900 uppercase tracking-wider mb-1.5">
                    Diagnosis / Medical Impression *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Acute Viral Pharyngitis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-xl text-indigo-950 placeholder-indigo-300 text-sm p-3 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-indigo-900 uppercase tracking-wider mb-1.5">
                    Doctor Advice / Clinical Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Drink warm fluids, 3 days complete rest, re-visit if fever persists"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-xl text-indigo-950 placeholder-indigo-300 text-sm p-3 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/20"
                  />
                </div>
              </div>
            </Card>

            {/* Right Column: Digital Prescription Items Builder */}
            <Card title="Issue Digital Prescription (Live Inventory)">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-3">
                  <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    Add Medicine Item from Live Stock
                  </p>

                  <Select
                    label="Select Available Medicine"
                    value={selectedMedId}
                    onChange={(e) => setSelectedMedId(e.target.value)}
                    options={medicinesCatalog.map((med) => ({
                      label: `${med.name} (${med.category}) — Stock: ${med.quantity} ${med.unit}`,
                      value: med.id,
                    }))}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <Input
                        label="Quantity"
                        type="number"
                        min={1}
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(Number(e.target.value))}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        label="Dosage Instructions"
                        placeholder="e.g. 1 tab 2x daily after food"
                        value={dosageInstructions}
                        onChange={(e) => setDosageInstructions(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    icon={<Plus />}
                    onClick={handleAddPrescriptionItem}
                  >
                    Add Medicine to Prescription
                  </Button>
                </div>

                {/* Added Medicines Table */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2">
                    Prescription Medicines List ({prescriptionItems.length})
                  </h4>

                  {prescriptionItems.length === 0 ? (
                    <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-center text-xs text-indigo-600/80">
                      No medicines added to this prescription yet. (Optional)
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {prescriptionItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-white border border-indigo-100 text-xs shadow-sm"
                        >
                          <div>
                            <p className="font-bold text-indigo-950">{item.medicineName}</p>
                            <p className="text-emerald-700 text-[11px] font-medium">
                              Qty: {item.quantity} {item.unit} | {item.dosageInstructions}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePrescriptionItem(idx)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="flex justify-end pt-4 border-t border-indigo-100">
            <Button type="submit" size="lg" loading={submitting} icon={<CheckCircle2 />}>
              Complete Consultation & Save Record
            </Button>
          </div>
        </form>
      ) : (
        /* Patient Medical History Tab */
        <Card title="Historical Consultations & Prescriptions">
          {loadingHistory ? (
            <Spinner size="md" />
          ) : !patientHistory || patientHistory.visits.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-indigo-100 shadow-sm">
              <FileText className="w-10 h-10 text-indigo-300 mx-auto mb-2" />
              <p className="text-xs text-indigo-600/80">No previous medical visits recorded for this student.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {patientHistory.visits.map((visit) => (
                <div key={visit.id} className="p-4 rounded-xl bg-white border border-indigo-100 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-2 text-xs">
                    <div>
                      <span className="font-bold text-indigo-950">
                        Visit Date: {new Date(visit.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-indigo-600/80 ml-2">Doctor: {visit.doctor.user.name}</span>
                    </div>
                    <Badge variant="info">Token #{visit.appointment?.tokenNo || 1}</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-indigo-700 font-semibold block">Symptoms:</span>
                      <p className="text-indigo-950">{visit.symptoms}</p>
                    </div>
                    <div>
                      <span className="text-indigo-700 font-semibold block">Diagnosis:</span>
                      <p className="text-emerald-700 font-bold">{visit.diagnosis}</p>
                    </div>
                  </div>

                  {visit.notes && (
                    <p className="text-xs text-indigo-950 bg-purple-50/60 p-2.5 rounded-lg border border-purple-100">
                      <span className="font-semibold text-indigo-700">Advice Notes:</span> {visit.notes}
                    </p>
                  )}

                  {/* Prescribed items if present */}
                  {visit.prescriptions && visit.prescriptions.length > 0 && (
                    <div className="pt-2 border-t border-indigo-100 text-xs">
                      <p className="font-semibold text-indigo-700 mb-1">Prescribed Medicines:</p>
                      <div className="flex flex-wrap gap-2">
                        {visit.prescriptions[0].items.map((it) => (
                          <span
                            key={it.id}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-950 border border-indigo-100 font-medium"
                          >
                            {it.medicine.name} x {it.quantity} ({it.dosageInstructions})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
