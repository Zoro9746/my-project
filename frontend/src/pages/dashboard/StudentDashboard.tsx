import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { appointmentService, Appointment } from '../../services/appointmentService';
import { Calendar, FileText, Pill, HeartPulse, Clock, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await appointmentService.getAppointments();
        setAppointments(data);
      } catch (err) {
        console.error('Error fetching student appointments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (!user) return null;

  const upcoming = appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'PENDING');
  const completed = appointments.filter((a) => a.status === 'COMPLETED');
  const activePrescriptionsCount = appointments.filter((a) => a.prescription && a.prescription.status === 'PENDING_DISPENSE').length;

  const columns: Column<Appointment>[] = [
    {
      header: 'TOKEN #',
      cell: (item) => <Badge variant="purple_pill">#{item.tokenNo}</Badge>,
    },
    {
      header: 'DOCTOR & SPECIALIZATION',
      cell: (item) => (
        <div>
          <p className="font-bold text-indigo-950">{item.doctor.user.name}</p>
          <p className="text-xs text-indigo-600/80 font-medium">{item.doctor.specialization}</p>
        </div>
      ),
    },
    {
      header: 'APPOINTMENT DATE & TIME',
      cell: (item) => (
        <div className="text-xs">
          <p className="font-bold text-indigo-950">{new Date(item.date).toLocaleDateString()}</p>
          <p className="text-purple-600 font-mono font-bold mt-0.5">{item.timeSlot}</p>
        </div>
      ),
    },
    {
      header: 'STATUS',
      cell: (item) => (
        <Badge variant={item.status === 'CONFIRMED' ? 'success' : item.status === 'CANCELLED' ? 'danger' : 'info'}>
          {item.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Header
        title={`${user.name.toUpperCase()} — Health Lifecycle Portal`}
        subtitle={`${user.student?.department || 'Information Science & Engineering'} - Roll No: ${user.student?.rollNo || '7376211CS101'}`}
        action={
          <Link to="/appointments/book">
            <Button icon={<Calendar />}>Book Appointment</Button>
          </Link>
        }
      />

      {/* PCDP Stat Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bit-stat-card p-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-indigo-900">UPCOMING</p>
          <h3 className="text-2xl font-black text-indigo-950 mt-1">{upcoming.length}</h3>
          <p className="text-[10px] text-indigo-600/70 font-semibold">Scheduled slots</p>
        </div>

        <div className="bit-stat-card p-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-indigo-900">VISITS</p>
          <h3 className="text-2xl font-black text-purple-600 mt-1">{completed.length}</h3>
          <p className="text-[10px] text-indigo-600/70 font-semibold">Completed visits</p>
        </div>

        <div className="bit-stat-card p-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-indigo-900">PRESCRIPTIONS</p>
          <h3 className="text-2xl font-black text-indigo-600 mt-1">{activePrescriptionsCount}</h3>
          <p className="text-[10px] text-indigo-600/70 font-semibold">Pending dispense</p>
        </div>

        <div className="bit-stat-card p-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-indigo-900">BLOOD GROUP</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{user.student?.bloodGroup || 'A+'}</h3>
          <p className="text-[10px] text-indigo-600/70 font-semibold">Verified record</p>
        </div>

        <div className="bit-stat-card p-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-indigo-900">CANCELLED</p>
          <h3 className="text-2xl font-black text-rose-500 mt-1">
            {appointments.filter((a) => a.status === 'CANCELLED').length}
          </h3>
          <p className="text-[10px] text-indigo-600/70 font-semibold">Released slots</p>
        </div>

        <div className="bit-stat-card p-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-indigo-900">STATUS</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">ACTIVE</h3>
          <p className="text-[10px] text-indigo-600/70 font-semibold">Campus registered</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Mapped Appointment Schedules & Queue" className="lg:col-span-2">
          <Table
            columns={columns}
            data={upcoming}
            keyExtractor={(item) => item.id}
            emptyMessage="No active appointments scheduled. Click 'Book Appointment' to schedule a consultation."
            loading={loading}
          />
        </Card>

        <Card title="Student Profile & Vitals" className="lg:col-span-1">
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
              <p className="text-indigo-900 font-bold uppercase text-[10px]">ROLL NUMBER</p>
              <p className="text-sm font-black text-purple-700 font-mono mt-0.5">{user.student?.rollNo || 'N/A'}</p>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
              <p className="text-indigo-900 font-bold uppercase text-[10px]">DEPARTMENT</p>
              <p className="text-sm font-bold text-indigo-950 mt-0.5">{user.student?.department || 'N/A'}</p>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
              <p className="text-indigo-900 font-bold uppercase text-[10px]">EMERGENCY CONTACT</p>
              <p className="text-sm font-bold text-indigo-950 mt-0.5">{user.student?.emergencyContact || 'N/A'}</p>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <p className="text-rose-700 font-bold uppercase text-[10px]">REGISTERED ALLERGIES</p>
              <p className="text-sm font-bold text-rose-800 mt-0.5">
                {user.student?.allergies || 'No known allergies'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
