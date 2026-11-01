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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f4f3ff] relative overflow-hidden py-12">
      {/* Background ambient elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center shadow-xl shadow-purple-500/30 mx-auto mb-3 border border-purple-400/30">
            <HeartPulse className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">STUDENT REGISTRATION</h1>
          <p className="text-xs font-black text-purple-600 uppercase tracking-widest mt-1">BIT Health Center Patient Portal Account</p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-100">
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

          <div className="mt-6 pt-6 border-t border-indigo-50 text-center">
            <p className="text-xs text-indigo-600/80 font-medium">Already registered?</p>
            <Link
              to="/login"
              className="text-xs font-extrabold text-purple-600 hover:text-purple-700 transition-colors mt-1 inline-block"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
