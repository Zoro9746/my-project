import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { HeartPulse, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      showSuccess('Login successful! Welcome to BIT Health Center.');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please verify your credentials.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background glowing ambient elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-2xl shadow-emerald-500/30 mx-auto mb-4 border border-emerald-400/30">
            <HeartPulse className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">BIT HEALTH CENTER</h1>
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mt-1">
            Bannari Amman Institute of Technology
          </p>
          <p className="text-xs text-slate-400 mt-2">Patient Appointment & Medication Management System</p>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-700/60">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Campus Email Address"
              type="email"
              placeholder="e.g. 7376211cs101@bitsathy.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <Button type="submit" className="w-full py-3" loading={loading}>
              Sign In to Health Center
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400 mb-3">New Student? Register your medical profile</p>
            <Link
              to="/register"
              className="inline-block text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Create Student Account →
            </Link>
          </div>

          {/* Quick Demo Credentials Panel */}
          <div className="mt-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              ⚡ Quick Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleDemoFill('admin@bitsathy.ac.in', 'Admin@123')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left text-slate-300 transition-colors border border-slate-700/50"
              >
                <span className="font-bold text-rose-400 block">Admin</span>
                <span className="text-[10px] text-slate-400">admin@bitsathy.ac.in</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('dr.smith@bitsathy.ac.in', 'Doctor@123')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left text-slate-300 transition-colors border border-slate-700/50"
              >
                <span className="font-bold text-sky-400 block">Doctor</span>
                <span className="text-[10px] text-slate-400">dr.smith@bitsathy.ac.in</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('pharma@bitsathy.ac.in', 'Pharma@123')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left text-slate-300 transition-colors border border-slate-700/50"
              >
                <span className="font-bold text-amber-400 block">Pharmacist</span>
                <span className="text-[10px] text-slate-400">pharma@bitsathy.ac.in</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('7376211cs101@bitsathy.ac.in', 'Student@123')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left text-slate-300 transition-colors border border-slate-700/50"
              >
                <span className="font-bold text-emerald-400 block">Student</span>
                <span className="text-[10px] text-slate-400">7376211cs101@bitsathy...</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
