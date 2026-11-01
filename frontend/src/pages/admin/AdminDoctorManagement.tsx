import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { adminService, DoctorRosterItem } from '../../services/adminService';
import { useToast } from '../../contexts/ToastContext';
import { Stethoscope, Edit, Calendar, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDoctorManagement: React.FC = () => {
  const [doctors, setDoctors] = useState<DoctorRosterItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Edit doctor modal state
  const [editTarget, setEditTarget] = useState<DoctorRosterItem | null>(null);
  const [editForm, setEditForm] = useState({
    specialization: '',
    roomNo: '',
    phone: '',
  });
  const [updating, setUpdating] = useState<boolean>(false);

  const { showSuccess, showError } = useToast();

  const fetchRoster = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDoctorsRoster();
      setDoctors(data);
    } catch (err: any) {
      showError('Failed to load doctor roster information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    setUpdating(true);
    try {
      await adminService.updateDoctorInfo(editTarget.id, editForm);
      showSuccess(`Doctor details for ${editTarget.name} updated successfully!`);
      setEditTarget(null);
      fetchRoster();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update doctor profile.');
    } finally {
      setUpdating(false);
    }
  };

  const columns: Column<DoctorRosterItem>[] = [
    {
      header: 'Doctor Name & Contact',
      cell: (item) => (
        <div>
          <p className="font-bold text-indigo-950">{item.name}</p>
          <p className="text-xs text-indigo-600/80">{item.email} | Phone: {item.phone}</p>
        </div>
      ),
    },
    {
      header: 'Specialization & Room',
      cell: (item) => (
        <div>
          <Badge variant="success" size="sm">{item.specialization}</Badge>
          <p className="text-xs text-emerald-700 font-mono font-bold mt-1">Room: {item.roomNo}</p>
        </div>
      ),
    },
    {
      header: 'Consultation Stats',
      cell: (item) => (
        <div className="text-xs">
          <span className="font-bold text-indigo-950">{item.completedAppointments} Completed</span>
          <span className="text-indigo-600/70 block">({item.totalAppointments} Total Appointments)</span>
        </div>
      ),
    },
    {
      header: 'OPD Schedule Roster',
      cell: (item) => (
        <Badge variant={item.activeSchedulesCount > 0 ? 'info' : 'neutral'}>
          {item.activeSchedulesCount} Active Working Days
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<Edit className="w-3.5 h-3.5" />}
            onClick={() => {
              setEditTarget(item);
              setEditForm({
                specialization: item.specialization,
                roomNo: item.roomNo,
                phone: item.phone,
              });
            }}
          >
            Edit Info
          </Button>

          <Link to="/doctor/schedule">
            <Button size="sm" variant="outline" icon={<Calendar className="w-3.5 h-3.5" />}>
              Schedules
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Doctor Roster & OPD Room Management"
        subtitle="Manage campus medical officer specializations, consultation rooms, and weekly schedule rosters"
        action={
          <Button variant="outline" icon={<RefreshCw />} onClick={fetchRoster}>
            Refresh Roster
          </Button>
        }
      />

      <Card title="Campus Medical Officers Directory">
        <Table
          columns={columns}
          data={doctors}
          keyExtractor={(item) => item.id}
          emptyMessage="No doctors registered in system."
          loading={loading}
        />
      </Card>

      {/* Edit Doctor Info Modal */}
      {editTarget && (
        <Modal
          isOpen={Boolean(editTarget)}
          onClose={() => setEditTarget(null)}
          title={`Edit Doctor Profile — ${editTarget.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              label="Specialization *"
              placeholder="e.g. General Medicine, Dermatology"
              value={editForm.specialization}
              onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
              required
            />

            <Input
              label="OPD Consultation Room Number *"
              placeholder="e.g. HC-101, Room A"
              value={editForm.roomNo}
              onChange={(e) => setEditForm({ ...editForm, roomNo: e.target.value })}
              required
            />

            <Input
              label="Contact Phone Number"
              placeholder="e.g. +91 98765 43210"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-indigo-100">
              <Button variant="ghost" onClick={() => setEditTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={updating} icon={<CheckCircle2 />}>
                Save Doctor Details
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
