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
                <label className="block text-xs font-extrabold text-indigo-900 uppercase tracking-wider mb-1.5">
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
                          ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                          : 'bg-white border-indigo-100 text-indigo-950 hover:bg-purple-50'
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-lg shrink-0 ${
                          selectedDoctorId === doc.id ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">{doc.user.name}</h4>
                        <p className={`text-xs font-semibold ${selectedDoctorId === doc.id ? 'text-purple-100' : 'text-purple-600'}`}>{doc.specialization}</p>
                        <p className={`text-[11px] mt-1 ${selectedDoctorId === doc.id ? 'text-purple-200' : 'text-indigo-600/70'}`}>Room: {doc.roomNo}</p>
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
                <div className="flex justify-between p-2.5 rounded-lg bg-purple-50/60 border border-purple-100">
                  <span className="text-indigo-700">Doctor Name:</span>
                  <span className="font-bold text-indigo-950">{selectedDoctor.user.name}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-purple-50/60 border border-purple-100">
                  <span className="text-indigo-700">Specialization:</span>
                  <span className="font-bold text-purple-700">{selectedDoctor.specialization}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-purple-50/60 border border-purple-100">
                  <span className="text-indigo-700">Consultation Room:</span>
                  <span className="font-bold text-indigo-950">{selectedDoctor.roomNo}</span>
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
              <div className="p-8 text-center bg-white rounded-xl border border-indigo-100 shadow-sm my-4">
                <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-indigo-950">Doctor Not Available</h4>
                <p className="text-xs text-indigo-600/80 max-w-sm mx-auto mt-1">
                  {availability?.message || 'The selected doctor has no scheduled OPD hours on this date.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pb-2 border-b border-indigo-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
                    <span className="text-indigo-950">Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-200 inline-block" />
                    <span className="text-indigo-600/80">Booked / Occupied</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-indigo-100 inline-block" />
                    <span className="text-indigo-400">Passed</span>
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
                            ? 'bg-purple-600 text-white border-purple-600 ring-2 ring-purple-500/50 scale-105 shadow-md'
                            : slot.isBooked
                            ? 'bg-rose-50 border-rose-200 text-rose-400 cursor-not-allowed line-through'
                            : slot.isPast
                            ? 'bg-indigo-50/50 border-indigo-100 text-indigo-300 cursor-not-allowed'
                            : 'bg-white border-indigo-200 text-indigo-950 hover:border-purple-600 hover:text-purple-700 hover:bg-purple-50'
                        }`}
                      >
                        <span>{slot.timeSlot}</span>
                        {slot.isBooked && <span className="text-[9px] uppercase tracking-tighter">Booked</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-6 border-t border-indigo-100 flex items-center justify-between">
                  <div>
                    {selectedSlot ? (
                      <p className="text-sm font-semibold text-indigo-950">
                        Selected Slot: <span className="text-purple-600 font-bold">{selectedSlot}</span> on {selectedDate}
                      </p>
                    ) : (
                      <p className="text-xs text-indigo-600/80 font-medium">Please click a slot above to select time.</p>
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
            <div className="w-16 h-16 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center mx-auto text-purple-600 shadow-lg">
              <Check className="w-10 h-10" />
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-900">Daily Queue Token</p>
              <h2 className="text-4xl font-black text-purple-600 mt-1">TOKEN #{bookedAppointment.tokenNo}</h2>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 text-left text-xs space-y-2 text-indigo-950">
              <div className="flex justify-between">
                <span className="text-indigo-700">Doctor:</span>
                <span className="font-bold text-indigo-950">{bookedAppointment.doctor.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-700">Date:</span>
                <span className="font-bold text-indigo-950">
                  {new Date(bookedAppointment.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-700">Time Slot:</span>
                <span className="font-bold text-purple-600">{bookedAppointment.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-700">Consultation Room:</span>
                <span className="font-bold text-indigo-950">{bookedAppointment.doctor.roomNo}</span>
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
