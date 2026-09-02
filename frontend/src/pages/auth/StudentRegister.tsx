import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { HeartPulse, Mail, Lock, User as UserIcon, ShieldAlert, Phone, BookOpen, Activity } from 'lucide-react';

export const StudentRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    rollNo: '',
    department: 'Computer Science and Engineering',
    bloodGroup: 'O+',
    allergies: '',
    emergencyContact: '',
  });

  const [loading, setLoading] = useState(false);
  const { registerStudent } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerStudent({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        rollNo: formData.rollNo,
        department: formData.department,
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies,
        emergencyContact: formData.emergencyContact,
      });
      showSuccess('Student profile registered successfully! Welcome.');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden py-12">
      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/20 mx-auto mb-3">
            <HeartPulse className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Student Registration</h1>
          <p className="text-xs text-slate-400 mt-1">BIT Health Center Patient Portal Account</p>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-700/60">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                placeholder="e.g. A. Rahul"
                value={formData.name}
                onChange={handleChange}
                icon={<UserIcon className="w-4 h-4" />}
                required
              />

              <Input
                label="BIT Roll Number"
                name="rollNo"
                placeholder="e.g. 211CS101"
                value={formData.rollNo}
                onChange={handleChange}
                icon={<BookOpen className="w-4 h-4" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Campus Email"
                name="email"
                type="email"
                placeholder="e.g. 7376211cs101@bitsathy.ac.in"
                value={formData.email}
                onChange={handleChange}
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <Select
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                options={[
                  { label: 'Computer Science & Engg (CSE)', value: 'Computer Science and Engineering' },
                  { label: 'Information Technology (IT)', value: 'Information Technology' },
                  { label: 'Electronics & Comm (ECE)', value: 'Electronics and Communication Engineering' },
                  { label: 'Electrical & Electronics (EEE)', value: 'Electrical and Electronics Engineering' },
                  { label: 'Mechanical Engineering (MECH)', value: 'Mechanical Engineering' },
                  { label: 'Biotechnology (BT)', value: 'Biotechnology' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Blood Group"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                options={[
                  { label: 'A +ve', value: 'A+' },
                  { label: 'A -ve', value: 'A-' },
                  { label: 'B +ve', value: 'B+' },
                  { label: 'B -ve', value: 'B-' },
                  { label: 'O +ve', value: 'O+' },
                  { label: 'O -ve', value: 'O-' },
                  { label: 'AB +ve', value: 'AB+' },
                  { label: 'AB -ve', value: 'AB-' },
                ]}
              />

              <Input
                label="Emergency Contact Phone"
                name="emergencyContact"
                placeholder="e.g. +91 98765 43210 (Parent)"
                value={formData.emergencyContact}
                onChange={handleChange}
                icon={<Phone className="w-4 h-4" />}
                required
              />
            </div>

            <Input
              label="Known Allergies (Optional)"
              name="allergies"
              placeholder="e.g. Penicillin, Dust allergy, None"
              value={formData.allergies}
              onChange={handleChange}
              icon={<ShieldAlert className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                icon={<Lock className="w-4 h-4" />}
                required
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <Button type="submit" className="w-full py-3 mt-2" loading={loading}>
              Complete Student Registration
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">Already registered?</p>
            <Link
              to="/login"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors mt-1 inline-block"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
