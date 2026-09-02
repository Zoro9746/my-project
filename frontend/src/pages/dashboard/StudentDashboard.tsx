import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { appointmentService, Appointment } from '../../services/appointmentService';
import { Calendar, FileText, Pill, HeartPulse, Clock, ArrowRight } from 'lucide-react';
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
      header: 'Token #',
      cell: (item) => <span className="font-extrabold text-emerald-400">#{item.tokenNo}</span>,
    },
    {
      header: 'Doctor',
      cell: (item) => (
        <div>
          <p className="font-bold text-slate-100">{item.doctor.user.name}</p>
          <p className="text-xs text-slate-400">{item.doctor.specialization}</p>
        </div>
      ),
    },
    {
      header: 'Date & Time',
      cell: (item) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-200">{new Date(item.date).toLocaleDateString()}</p>
          <p className="text-emerald-400 font-mono font-bold mt-0.5">{item.timeSlot}</p>
        </div>
      ),
    },
    {
      header: 'Status',
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
        title={`Welcome back, ${user.name}!`}
        subtitle="BIT Student Health Portal — Book appointments, view medical history & active prescriptions"
        action={
          <Link to="/appointments/book">
            <Button icon={<Calendar />}>Book Appointment</Button>
          </Link>
        }
      />

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Upcoming Appointments</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">{upcoming.length}</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Visits</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">{completed.length}</h3>
            </div>
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Prescriptions</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">{activePrescriptionsCount}</h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <Pill className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card hoverable className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Health Profile</p>
              <p className="text-sm font-bold text-emerald-400 mt-1">
                {user.student?.bloodGroup || 'A+'} | Verified
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <HeartPulse className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Upcoming Appointment Queue" className="lg:col-span-2">
          <Table
            columns={columns}
            data={upcoming}
            keyExtractor={(item) => item.id}
            emptyMessage="No active appointments scheduled. Click 'Book Appointment' to schedule a consultation."
            loading={loading}
          />
        </Card>

        <Card title="Student Health Summary" className="lg:col-span-1">
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <p className="text-slate-400 font-semibold">Roll Number</p>
              <p className="text-sm font-bold text-slate-100 mt-0.5">{user.student?.rollNo || 'N/A'}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <p className="text-slate-400 font-semibold">Department</p>
              <p className="text-sm font-bold text-slate-100 mt-0.5">{user.student?.department || 'N/A'}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <p className="text-slate-400 font-semibold">Emergency Contact</p>
              <p className="text-sm font-bold text-slate-100 mt-0.5">{user.student?.emergencyContact || 'N/A'}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <p className="text-slate-400 font-semibold">Registered Allergies</p>
              <p className="text-sm font-bold text-rose-400 mt-0.5">
                {user.student?.allergies || 'No known allergies'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
