import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { appointmentService, DoctorQueueData, Appointment } from '../../services/appointmentService';
import { Users, Calendar, CheckCircle2, XCircle, Clock, Stethoscope, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [queueData, setQueueData] = useState<DoctorQueueData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const data = await appointmentService.getDoctorTodayQueue();
        setQueueData(data);
      } catch (err) {
        console.error('Error fetching doctor queue:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  if (!user) return null;

  const queue = queueData?.queue || [];

  const columns: Column<Appointment>[] = [
    {
      header: 'Token #',
      cell: (item) => <span className="font-extrabold text-purple-700">#{item.tokenNo}</span>,
    },
    {
      header: 'Student Name',
      cell: (item) => (
        <div>
          <p className="font-bold text-indigo-950">{item.student.user.name}</p>
          <p className="text-xs text-indigo-600/80 font-mono">Roll: {item.student.rollNo}</p>
        </div>
      ),
    },
    {
      header: 'Time Slot',
      cell: (item) => <span className="font-mono text-purple-700 font-bold">{item.timeSlot}</span>,
    },
    {
      header: 'Department',
      cell: (item) => <span className="text-xs text-indigo-800 font-medium">{item.student.department}</span>,
    },
    {
      header: 'Status',
      cell: (item) => (
        <Badge variant={item.status === 'CONFIRMED' ? 'warning' : item.status === 'COMPLETED' ? 'success' : 'danger'}>
          {item.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Header
        title={`Doctor Console — ${user.name}`}
        subtitle={`Specialization: ${user.doctor?.specialization || 'General Medicine'} | Room: ${user.doctor?.roomNo || 'HC-101'} | Date: ${queueData?.todayDate || new Date().toISOString().split('T')[0]}`}
        action={
          <Link to="/doctor/queue">
            <Button icon={<Stethoscope />}>Open Patient Queue</Button>
          </Link>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card hoverable className="border-t-4 border-t-purple-600">
          <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">Total Today</p>
          <h3 className="text-2xl font-black text-indigo-950 mt-1">{queueData?.metrics.total || 0}</h3>
        </Card>

        <Card hoverable className="border-t-4 border-t-amber-600">
          <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">Pending Queue</p>
          <h3 className="text-2xl font-black text-amber-700 mt-1">{queueData?.metrics.pending || 0}</h3>
        </Card>

        <Card hoverable className="border-t-4 border-t-emerald-600">
          <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">Completed</p>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">{queueData?.metrics.completed || 0}</h3>
        </Card>

        <Card hoverable className="border-t-4 border-t-rose-600">
          <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">Cancelled</p>
          <h3 className="text-2xl font-black text-rose-700 mt-1">{queueData?.metrics.cancelled || 0}</h3>
        </Card>

        <Card hoverable className="border-t-4 border-t-indigo-600">
          <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">Active Slots</p>
          <h3 className="text-2xl font-black text-indigo-950 mt-1">32</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Today's Patient Appointment Queue" className="lg:col-span-2">
          <Table
            columns={columns}
            data={queue}
            keyExtractor={(item) => item.id}
            emptyMessage="No patient appointments scheduled in queue for today."
            loading={loading}
          />
        </Card>

        <Card title="Consultation Quick Info" className="lg:col-span-1">
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
              <span className="text-indigo-700 font-semibold block">OPD Hours:</span>
              <span className="text-indigo-950 font-bold">09:00 AM – 05:00 PM</span>
            </div>
            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
              <span className="text-indigo-700 font-semibold block">Slot Duration:</span>
              <span className="text-indigo-950 font-bold">15 Minutes / Token</span>
            </div>
            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
              <span className="text-indigo-700 font-semibold block">Emergency Hotline:</span>
              <span className="text-purple-700 font-bold">+91 98765 43210</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
