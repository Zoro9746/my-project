import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { authService } from '../../services/authService';
import { User, Mail, Shield, BookOpen, Phone, Activity, HeartPulse } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.student?.department || '',
    bloodGroup: user?.student?.bloodGroup || '',
    allergies: user?.student?.allergies || '',
    emergencyContact: user?.student?.emergencyContact || '',
    specialization: user?.doctor?.specialization || '',
    roomNo: user?.doctor?.roomNo || '',
    phone: user?.doctor?.phone || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updateProfile(formData);
      await refreshUser();
      showSuccess('Profile updated successfully!');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Header
        title="My Health Profile"
        subtitle="Manage your personal information, emergency contact, and health details"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Identity Overview Card */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-20 h-20 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-purple-500/20 mb-4 border border-purple-400/30">
              {user.name.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-indigo-950">{user.name}</h3>
            <p className="text-xs text-indigo-600/80 mt-1 flex items-center gap-1 font-medium">
              <Mail className="w-3.5 h-3.5 text-purple-600" />
              {user.email}
            </p>

            <div className="mt-4 flex items-center gap-2">
              <Badge variant="success">{user.role}</Badge>
              <Badge variant={user.isActive ? 'info' : 'danger'}>
                {user.isActive ? 'Active Account' : 'Deactivated'}
              </Badge>
            </div>

            <div className="w-full mt-6 pt-6 border-t border-indigo-100 space-y-3 text-left text-xs text-indigo-950">
              {user.student && (
                <>
                  <div className="flex justify-between">
                    <span className="text-indigo-600/80">Roll Number:</span>
                    <span className="font-semibold text-indigo-950">{user.student.rollNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-600/80">Department:</span>
                    <span className="font-semibold text-indigo-950 text-right">{user.student.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-600/80">Blood Group:</span>
                    <span className="font-semibold text-emerald-700">{user.student.bloodGroup}</span>
                  </div>
                </>
              )}

              {user.doctor && (
                <>
                  <div className="flex justify-between">
                    <span className="text-indigo-600/80">Specialization:</span>
                    <span className="font-semibold text-indigo-950">{user.doctor.specialization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-600/80">Consultation Room:</span>
                    <span className="font-semibold text-indigo-950">{user.doctor.roomNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-600/80">Phone Ext:</span>
                    <span className="font-semibold text-indigo-950">{user.doctor.phone}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Profile Edit Form Card */}
        <Card title="Update Profile Details" className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              icon={<User className="w-4 h-4" />}
              required
            />

            {user.role === 'STUDENT' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    icon={<BookOpen className="w-4 h-4" />}
                  />
                  <Input
                    label="Blood Group"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    icon={<Activity className="w-4 h-4" />}
                  />
                </div>

                <Input
                  label="Emergency Contact Info"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  icon={<Phone className="w-4 h-4" />}
                />

                <Input
                  label="Allergies / Medical Notes"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  icon={<HeartPulse className="w-4 h-4" />}
                />
              </>
            )}

            {user.role === 'DOCTOR' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                />
                <Input
                  label="Room Number"
                  value={formData.roomNo}
                  onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                />
                <Input
                  label="Contact Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <Button type="submit" loading={saving}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
