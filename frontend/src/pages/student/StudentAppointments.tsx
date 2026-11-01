import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { appointmentService, Appointment } from '../../services/appointmentService';
import { doctorService, DoctorAvailability } from '../../services/doctorService';
import { useToast } from '../../contexts/ToastContext';
import { Calendar, Clock, XCircle, RefreshCw, Stethoscope, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cancellation state
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<boolean>(false);

  // Reschedule state
  const [rescheduleAppointmentObj, setRescheduleAppointmentObj] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [newSlot, setNewSlot] = useState<string>('');
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [rescheduling, setRescheduling] = useState<boolean>(false);

  const { showSuccess, showError } = useToast();

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getAppointments();
      setAppointments(data);
    } catch (err: any) {
      showError('Failed to fetch appointments list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // When reschedule modal opens & date changes, fetch doctor availability
  useEffect(() => {
    if (!rescheduleAppointmentObj || !newDate) return;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setNewSlot('');
      try {
        const avail = await doctorService.getDoctorAvailability(rescheduleAppointmentObj.doctorId, newDate);
        setAvailability(avail);
      } catch (err: any) {
        showError('Failed to load slots for rescheduling.');
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [rescheduleAppointmentObj, newDate]);

  const handleCancelConfirm = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await appointmentService.cancelAppointment(cancelId);
      showSuccess('Appointment cancelled successfully. Time slot released.');
      setCancelId(null);
      fetchAppointments();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleAppointmentObj || !newDate || !newSlot) {
      showError('Please select a new date and time slot.');
      return;
    }
    setRescheduling(true);
    try {
      const result = await appointmentService.rescheduleAppointment(
        rescheduleAppointmentObj.id,
        newDate,
        newSlot
      );
      showSuccess(`Appointment rescheduled successfully! New Token #${result.tokenNo}`);
      setRescheduleAppointmentObj(null);
      fetchAppointments();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to reschedule appointment.');
    } finally {
      setRescheduling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="success">Confirmed</Badge>;
      case 'COMPLETED':
        return <Badge variant="info">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="warning">{status}</Badge>;
    }
  };

  const columns: Column<Appointment>[] = [
    {
      header: 'Token #',
      cell: (item) => (
        <span className="font-extrabold text-purple-700 text-sm">#{item.tokenNo}</span>
      ),
    },
    {
      header: 'Doctor & Specialization',
      cell: (item) => (
        <div>
          <p className="font-bold text-indigo-950">{item.doctor.user.name}</p>
          <p className="text-xs text-indigo-600/80">{item.doctor.specialization}</p>
        </div>
      ),
    },
    {
      header: 'Date & Time Slot',
      cell: (item) => (
        <div className="text-xs">
          <p className="font-semibold text-indigo-950">
            {new Date(item.date).toLocaleDateString()}
          </p>
          <p className="text-purple-600 font-mono font-bold mt-0.5">{item.timeSlot}</p>
        </div>
      ),
    },
    {
      header: 'Consultation Room',
      cell: (item) => <span className="text-xs font-medium text-indigo-800">{item.doctor.roomNo}</span>,
    },
    {
      header: 'Status',
      cell: (item) => getStatusBadge(item.status),
    },
    {
      header: 'Actions',
      cell: (item) => {
        if (item.status === 'CANCELLED' || item.status === 'COMPLETED') {
          return <span className="text-xs text-indigo-400 italic">No actions available</span>;
        }

        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={<RefreshCw />}
              onClick={() => {
                setRescheduleAppointmentObj(item);
                setNewDate(new Date(item.date).toISOString().split('T')[0]);
              }}
            >
              Reschedule
            </Button>

            <Button
              size="sm"
              variant="danger"
              icon={<XCircle />}
              onClick={() => setCancelId(item.id)}
            >
              Cancel
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="My Medical Appointments"
        subtitle="View and manage your upcoming consultation bookings and past visit records"
        action={
          <Link to="/appointments/book">
            <Button icon={<Calendar />}>Book New Appointment</Button>
          </Link>
        }
      />

      <Card>
        <Table
          columns={columns}
          data={appointments}
          keyExtractor={(item) => item.id}
          emptyMessage="No appointments scheduled yet. Click 'Book New Appointment' to schedule a consultation."
          loading={loading}
        />
      </Card>

      {/* Confirm Cancellation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(cancelId)}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancelConfirm}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? Your reserved time slot will be released immediately for other students."
        confirmLabel="Yes, Cancel Slot"
        loading={cancelling}
      />

      {/* Reschedule Modal */}
      {rescheduleAppointmentObj && (
        <Modal
          isOpen={Boolean(rescheduleAppointmentObj)}
          onClose={() => setRescheduleAppointmentObj(null)}
          title="Reschedule Appointment"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <p className="text-xs text-indigo-800">
              Rescheduling for <span className="font-bold text-indigo-950">{rescheduleAppointmentObj.doctor.user.name}</span>
            </p>

            <Input
              label="Select New Date"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              icon={<Calendar className="w-4 h-4" />}
            />

            <div>
              <label className="block text-xs font-extrabold text-indigo-900 uppercase tracking-wider mb-2">
                Available Time Slots
              </label>
              {loadingSlots ? (
                <div className="py-6 text-center text-xs text-indigo-500">Loading available slots...</div>
              ) : !availability?.isWorkingDay ? (
                <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  Doctor is not available on this day.
                </p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                  {availability.slots.map((slot) => {
                    const isSelected = newSlot === slot.timeSlot;
                    const isDisabled = slot.isBooked || slot.isPast;

                    return (
                      <button
                        key={slot.timeSlot}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setNewSlot(slot.timeSlot)}
                        className={`p-2 rounded-lg text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600'
                            : isDisabled
                            ? 'bg-indigo-50/50 text-indigo-300 border-indigo-100 cursor-not-allowed'
                            : 'bg-white text-indigo-950 border-indigo-200 hover:border-purple-600 hover:bg-purple-50'
                        }`}
                      >
                        {slot.timeSlot}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-indigo-100">
              <Button variant="ghost" onClick={() => setRescheduleAppointmentObj(null)}>
                Cancel
              </Button>
              <Button
                disabled={!newSlot}
                loading={rescheduling}
                onClick={handleRescheduleSubmit}
                icon={<CheckCircle2 />}
              >
                Confirm Reschedule
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
