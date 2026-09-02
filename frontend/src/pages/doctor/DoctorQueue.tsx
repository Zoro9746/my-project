import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { appointmentService, DoctorQueueData, Appointment } from '../../services/appointmentService';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Clock, CheckCircle2, XCircle, RefreshCw, HeartPulse, User, Stethoscope } from 'lucide-react';

export const DoctorQueue: React.FC = () => {
  const navigate = useNavigate();
  const [queueData, setQueueData] = useState<DoctorQueueData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { showSuccess, showError } = useToast();

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getDoctorTodayQueue();
      setQueueData(data);
    } catch (err: any) {
      showError('Failed to load today queue console.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleStatusChange = async (appointmentId: string, newStatus: 'COMPLETED' | 'CANCELLED') => {
    try {
      if (newStatus === 'CANCELLED') {
        await appointmentService.cancelAppointment(appointmentId);
        showSuccess('Appointment marked as Cancelled.');
      }
      fetchQueue();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update appointment status.');
    }
  };

  if (loading) {
    return <Spinner size="lg" className="min-h-[50vh]" />;
  }

  const columns: Column<Appointment>[] = [
    {
      header: 'Token #',
      cell: (item) => (
        <span className="font-extrabold text-lg text-emerald-400">#{item.tokenNo}</span>
      ),
    },
    {
      header: 'Patient Name & Roll No',
      cell: (item) => (
        <div>
          <p className="font-bold text-slate-100">{item.student.user.name}</p>
          <p className="text-xs text-slate-400 font-mono">Roll: {item.student.rollNo}</p>
        </div>
      ),
    },
    {
      header: 'Department & Blood Group',
      cell: (item) => (
        <div className="text-xs">
          <p className="text-slate-200">{item.student.department}</p>
          <Badge variant="success" size="sm">
            {item.student.bloodGroup}
          </Badge>
        </div>
      ),
    },
    {
      header: 'Time Slot',
      cell: (item) => (
        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/30">
          {item.timeSlot}
        </span>
      ),
    },
    {
      header: 'Allergies / Alert',
      cell: (item) => (
        <span className="text-xs text-rose-400 font-medium">
          {item.student.allergies || 'None'}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (item) => {
        switch (item.status) {
          case 'CONFIRMED':
            return <Badge variant="warning">In Queue</Badge>;
          case 'COMPLETED':
            return <Badge variant="success">Completed</Badge>;
          case 'CANCELLED':
            return <Badge variant="danger">Cancelled</Badge>;
          default:
            return <Badge variant="neutral">{item.status}</Badge>;
        }
      },
    },
    {
      header: 'Actions',
      cell: (item) => {
        if (item.status === 'COMPLETED' || item.status === 'CANCELLED') {
          return <span className="text-xs text-slate-500 italic">Done</span>;
        }

        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              icon={<Stethoscope />}
              onClick={() => navigate('/doctor/consultation', { state: { appointment: item } })}
            >
              Start Consultation
            </Button>
            <Button
              size="sm"
              variant="danger"
              icon={<XCircle />}
              onClick={() => handleStatusChange(item.id, 'CANCELLED')}
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
        title="Doctor OPD Queue Console"
        subtitle={`Live token order for today (${queueData?.todayDate}) | Room: ${queueData?.roomNo}`}
        action={
          <Button variant="outline" icon={<RefreshCw />} onClick={fetchQueue}>
            Refresh Queue
          </Button>
        }
      />

      {/* Metrics Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable className="border-l-4 border-l-sky-500">
          <p className="text-xs font-bold uppercase text-slate-400">Total Tokens Today</p>
          <h3 className="text-2xl font-extrabold text-white mt-1">{queueData?.metrics.total || 0}</h3>
        </Card>

        <Card hoverable className="border-l-4 border-l-amber-500">
          <p className="text-xs font-bold uppercase text-slate-400">Pending Patients</p>
          <h3 className="text-2xl font-extrabold text-amber-400 mt-1">{queueData?.metrics.pending || 0}</h3>
        </Card>

        <Card hoverable className="border-l-4 border-l-emerald-500">
          <p className="text-xs font-bold uppercase text-slate-400">Completed Consultations</p>
          <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">{queueData?.metrics.completed || 0}</h3>
        </Card>

        <Card hoverable className="border-l-4 border-l-rose-500">
          <p className="text-xs font-bold uppercase text-slate-400">Cancelled / No Show</p>
          <h3 className="text-2xl font-extrabold text-rose-400 mt-1">{queueData?.metrics.cancelled || 0}</h3>
        </Card>
      </div>

      <Card title="Today's Live Appointment Token Queue">
        <Table
          columns={columns}
          data={queueData?.queue || []}
          keyExtractor={(item) => item.id}
          emptyMessage="No patient appointments scheduled in queue for today."
          loading={loading}
        />
      </Card>
    </div>
  );
};
