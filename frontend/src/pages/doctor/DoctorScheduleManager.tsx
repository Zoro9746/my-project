import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { doctorService, Doctor } from '../../services/doctorService';
import { useToast } from '../../contexts/ToastContext';
import { Calendar, Clock, Save, Check, XCircle } from 'lucide-react';

export const DoctorScheduleManager: React.FC = () => {
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingDay, setSavingDay] = useState<number | null>(null);

  const { showSuccess, showError } = useToast();

  const daysOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const [schedulesData, setSchedulesData] = useState<
    {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      slotDuration: number;
      active: boolean;
    }[]
  >(
    daysOfWeekNames.map((_, idx) => ({
      dayOfWeek: idx,
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 15,
      active: idx >= 1 && idx <= 6, // Mon-Sat default active
    }))
  );

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const doctors = await doctorService.getAllDoctors();
      const currentDoc = doctors.find((d) => d.user.id === user?.id) || doctors[0];
      if (currentDoc) {
        setDoctorProfile(currentDoc);
        if (currentDoc.schedules && currentDoc.schedules.length > 0) {
          const updated = [...schedulesData];
          currentDoc.schedules.forEach((sch) => {
            updated[sch.dayOfWeek] = {
              dayOfWeek: sch.dayOfWeek,
              startTime: sch.startTime,
              endTime: sch.endTime,
              slotDuration: sch.slotDuration,
              active: sch.active,
            };
          });
          setSchedulesData(updated);
        }
      }
    } catch (err: any) {
      showError('Failed to load doctor schedule information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleFieldChange = (dayIdx: number, field: string, value: any) => {
    setSchedulesData((prev) => {
      const copy = [...prev];
      copy[dayIdx] = { ...copy[dayIdx], [field]: value };
      return copy;
    });
  };

  const handleSaveDaySchedule = async (dayIdx: number) => {
    if (!doctorProfile) return;
    setSavingDay(dayIdx);
    try {
      const dayData = schedulesData[dayIdx];
      await doctorService.updateDoctorSchedule(doctorProfile.id, dayData);
      showSuccess(`OPD hours for ${daysOfWeekNames[dayIdx]} saved successfully!`);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update OPD hours.');
    } finally {
      setSavingDay(null);
    }
  };

  if (loading) {
    return <Spinner size="lg" className="min-h-[50vh]" />;
  }

  return (
    <div className="space-y-6">
      <Header
        title="Manage Doctor OPD Schedules"
        subtitle={`Configure weekly consultation working hours and slot durations for ${doctorProfile?.user.name}`}
      />

      <div className="grid grid-cols-1 gap-4">
        {schedulesData.map((sch, dayIdx) => (
          <Card key={dayIdx} className="glass-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:w-1/4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    sch.active
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {daysOfWeekNames[dayIdx].substring(0, 3)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100">{daysOfWeekNames[dayIdx]}</h4>
                  <Badge variant={sch.active ? 'success' : 'neutral'} size="sm">
                    {sch.active ? 'OPD Active' : 'Off Day'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Active Status
                  </label>
                  <button
                    type="button"
                    onClick={() => handleFieldChange(dayIdx, 'active', !sch.active)}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                      sch.active
                        ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {sch.active ? 'Active Day' : 'Closed'}
                  </button>
                </div>

                <div>
                  <Input
                    label="Start Time"
                    type="time"
                    disabled={!sch.active}
                    value={sch.startTime}
                    onChange={(e) => handleFieldChange(dayIdx, 'startTime', e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="End Time"
                    type="time"
                    disabled={!sch.active}
                    value={sch.endTime}
                    onChange={(e) => handleFieldChange(dayIdx, 'endTime', e.target.value)}
                  />
                </div>

                <div>
                  <Select
                    label="Slot Minutes"
                    disabled={!sch.active}
                    value={sch.slotDuration}
                    onChange={(e) => handleFieldChange(dayIdx, 'slotDuration', Number(e.target.value))}
                    options={[
                      { label: '10 Mins', value: 10 },
                      { label: '15 Mins', value: 15 },
                      { label: '20 Mins', value: 20 },
                      { label: '30 Mins', value: 30 },
                    ]}
                  />
                </div>
              </div>

              <div className="shrink-0 pt-2 sm:pt-0">
                <Button
                  size="sm"
                  variant="primary"
                  loading={savingDay === dayIdx}
                  onClick={() => handleSaveDaySchedule(dayIdx)}
                  icon={<Save className="w-4 h-4" />}
                >
                  Save Day
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
