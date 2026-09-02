import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { doctorService, Doctor, DoctorAvailability, TimeSlot } from '../../services/doctorService';
import { appointmentService, Appointment } from '../../services/appointmentService';
import { useToast } from '../../contexts/ToastContext';
import { Calendar, Clock, Stethoscope, CheckCircle2, UserCheck, ShieldAlert, Check } from 'lucide-react';

export const BookAppointment: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(true);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [booking, setBooking] = useState<boolean>(false);

  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Load doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const docs = await doctorService.getAllDoctors();
        setDoctors(docs);
        if (docs.length > 0) {
          setSelectedDoctorId(docs[0].id);
        }
      } catch (err: any) {
        showError('Failed to load doctor directory.');
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch slots whenever selected doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot('');
      try {
        const avail = await doctorService.getDoctorAvailability(selectedDoctorId, selectedDate);
        setAvailability(avail);
      } catch (err: any) {
        showError('Failed to fetch doctor availability slots.');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDoctorId, selectedDate]);

  const handleBook = async () => {
    if (!selectedDoctorId || !selectedDate || !selectedSlot) {
      showError('Please select a doctor, date, and time slot.');
      return;
    }

    setBooking(true);
    try {
      const result = await appointmentService.bookAppointment({
        doctorId: selectedDoctorId,
        date: selectedDate,
        timeSlot: selectedSlot,
      });

      setBookedAppointment(result);
      setShowSuccessModal(true);
      showSuccess(`Appointment confirmed! Token #${result.tokenNo}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to book appointment.';
      showError(msg);
    } finally {
      setBooking(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  if (loadingDoctors) {
    return <Spinner size="lg" className="min-h-[50vh]" />;
  }

  return (
    <div className="space-y-6">
      <Header
        title="Book Medical Appointment"
        subtitle="Select a campus medical specialist, choose an available date and time slot to generate your queue token"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selection Options Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="1. Select Specialist & Date">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Choose Campus Doctor
                </label>
                <div className="space-y-2">
                  {doctors.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                        selectedDoctorId === doc.id
                          ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-600/10'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-lg shrink-0 ${
                          selectedDoctorId === doc.id ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">{doc.user.name}</h4>
                        <p className="text-xs text-emerald-400 font-semibold">{doc.specialization}</p>
                        <p className="text-[11px] text-slate-400 mt-1">Room: {doc.roomNo}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Input
                  label="Appointment Date"
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  icon={<Calendar className="w-4 h-4" />}
                />
              </div>
            </div>
          </Card>

          {/* Doctor Profile Info Card */}
          {selectedDoctor && (
            <Card title="Doctor Working Hours">
              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-2.5 rounded-lg bg-slate-800/50">
                  <span className="text-slate-400">Doctor Name:</span>
                  <span className="font-bold text-slate-100">{selectedDoctor.user.name}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-slate-800/50">
                  <span className="text-slate-400">Specialization:</span>
                  <span className="font-bold text-emerald-400">{selectedDoctor.specialization}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-slate-800/50">
                  <span className="text-slate-400">Consultation Room:</span>
                  <span className="font-bold text-slate-100">{selectedDoctor.roomNo}</span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Slot Grid & Confirmation Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="2. Select Available Time Slot"
            subtitle={
              availability?.isWorkingDay
                ? `Showing slots for ${selectedDate} (${availability.workingHours})`
                : 'Doctor availability calculation'
            }
          >
            {loadingSlots ? (
              <Spinner size="md" className="py-12" />
            ) : !availability?.isWorkingDay ? (
              <div className="p-8 text-center glass-panel rounded-xl border border-slate-800 my-4">
                <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-200">Doctor Not Available</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  {availability?.message || 'The selected doctor has no scheduled OPD hours on this date.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-slate-300">Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/40 inline-block" />
                    <span className="text-slate-400">Booked / Occupied</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-700 inline-block" />
                    <span className="text-slate-500">Passed</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {availability.slots.map((slot) => {
                    const isSelected = selectedSlot === slot.timeSlot;
                    const isDisabled = slot.isBooked || slot.isPast;

                    return (
                      <button
                        key={slot.timeSlot}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setSelectedSlot(slot.timeSlot)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-500 text-white border-emerald-400 ring-2 ring-emerald-400/50 scale-105 shadow-lg shadow-emerald-500/20'
                            : slot.isBooked
                            ? 'bg-rose-950/20 border-rose-500/30 text-rose-400/60 cursor-not-allowed line-through'
                            : slot.isPast
                            ? 'bg-slate-800/40 border-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-emerald-500 hover:text-emerald-400'
                        }`}
                      >
                        <span>{slot.timeSlot}</span>
                        {slot.isBooked && <span className="text-[9px] uppercase tracking-tighter">Booked</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    {selectedSlot ? (
                      <p className="text-sm font-semibold text-slate-200">
                        Selected Slot: <span className="text-emerald-400 font-bold">{selectedSlot}</span> on {selectedDate}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">Please click a slot above to select time.</p>
                    )}
                  </div>

                  <Button
                    size="md"
                    disabled={!selectedSlot}
                    loading={booking}
                    onClick={handleBook}
                    icon={<CheckCircle2 />}
                  >
                    Confirm & Book Appointment
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Success Booking Modal */}
      {showSuccessModal && bookedAppointment && (
        <Modal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            navigate('/appointments');
          }}
          title="Appointment Confirmed!"
          maxWidth="md"
        >
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/20">
              <Check className="w-10 h-10" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Daily Queue Token</p>
              <h2 className="text-4xl font-extrabold text-emerald-400 mt-1">TOKEN #{bookedAppointment.tokenNo}</h2>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Doctor:</span>
                <span className="font-bold text-slate-100">{bookedAppointment.doctor.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="font-bold text-slate-100">
                  {new Date(bookedAppointment.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time Slot:</span>
                <span className="font-bold text-emerald-400">{bookedAppointment.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Consultation Room:</span>
                <span className="font-bold text-slate-100">{bookedAppointment.doctor.roomNo}</span>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/appointments');
              }}
            >
              View My Appointments
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
