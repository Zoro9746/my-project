import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import {
  reportService,
  AppointmentReportData,
  MedicationConsumptionReportData,
  PatientVisitsReportData,
} from '../../services/reportService';
import { stockService, StockAlertsSummary } from '../../services/stockService';
import { exportToCSV } from '../../utils/exportUtils';
import { useToast } from '../../contexts/ToastContext';
import {
  BarChart3,
  Calendar,
  Pill,
  FileText,
  Download,
  Filter,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

export const ReportsCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'medications' | 'stock' | 'visits'>('appointments');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Report states
  const [appointmentReport, setAppointmentReport] = useState<AppointmentReportData | null>(null);
  const [medicationReport, setMedicationReport] = useState<MedicationConsumptionReportData | null>(null);
  const [stockReport, setStockReport] = useState<StockAlertsSummary | null>(null);
  const [visitsReport, setVisitsReport] = useState<PatientVisitsReportData | null>(null);

  const { showError, showSuccess } = useToast();

  const fetchCurrentReport = async () => {
    setLoading(true);
    try {
      if (activeTab === 'appointments') {
        const data = await reportService.getAppointmentSummaryReport(startDate, endDate);
        setAppointmentReport(data);
      } else if (activeTab === 'medications') {
        const data = await reportService.getMedicationConsumptionReport(startDate, endDate);
        setMedicationReport(data);
      } else if (activeTab === 'stock') {
        const data = await stockService.getStockAlerts();
        setStockReport(data);
      } else if (activeTab === 'visits') {
        const data = await reportService.getPatientVisitsReport(startDate, endDate);
        setVisitsReport(data);
      }
    } catch (err: any) {
      showError('Failed to generate report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentReport();
  }, [activeTab]);

  const handleExportCSV = () => {
    if (activeTab === 'appointments' && appointmentReport) {
      exportToCSV('Appointment_Summary_Report', appointmentReport.appointments);
      showSuccess('Appointment summary report exported to CSV!');
    } else if (activeTab === 'medications' && medicationReport) {
      exportToCSV('Medication_Consumption_Report', medicationReport.consumptionList);
      showSuccess('Medication consumption report exported to CSV!');
    } else if (activeTab === 'stock' && stockReport) {
      const rows = [
        ...stockReport.lowStock.map((m) => ({ Name: m.name, Category: m.category, Stock: m.quantity, ReorderLevel: m.reorderLevel, Status: 'LOW_STOCK' })),
        ...stockReport.nearExpiry.map((m) => ({ Name: m.name, Category: m.category, Stock: m.quantity, ExpiryDate: m.expiryDate, Status: 'NEAR_EXPIRY' })),
      ];
      exportToCSV('Stock_Alerts_Report', rows);
      showSuccess('Stock alerts report exported to CSV!');
    } else if (activeTab === 'visits' && visitsReport) {
      exportToCSV('Patient_Visits_Report', visitsReport.visits);
      showSuccess('Patient visits report exported to CSV!');
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="System Reports & Analytics Center"
        subtitle="Generate comprehensive operational reports, track medication consumption metrics, and export data for auditing"
        action={
          <Button variant="primary" icon={<Download />} onClick={handleExportCSV}>
            Export to CSV / Excel
          </Button>
        }
      />

      {/* Report Tabs */}
      <div className="flex items-center gap-2 border-b border-indigo-100 pb-2 overflow-x-auto">
        {[
          { id: 'appointments', label: 'Appointment Summary', icon: Calendar },
          { id: 'medications', label: 'Medication Consumption', icon: Pill },
          { id: 'stock', label: 'Stock & Expiry Audit', icon: AlertTriangle },
          { id: 'visits', label: 'Patient Visit History', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-sm border border-purple-600'
                  : 'text-indigo-700 hover:bg-purple-50 bg-white border border-indigo-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Date Range Filter Bar */}
      {activeTab !== 'stock' && (
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-indigo-900">Date Range Filtering:</span>
            </div>

            <div className="flex items-center gap-3 flex-1 sm:flex-none">
              <Input
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Button size="sm" className="mt-5" icon={<RefreshCw />} onClick={fetchCurrentReport}>
                Filter
              </Button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <Spinner size="lg" className="min-h-[50vh]" />
      ) : activeTab === 'appointments' && appointmentReport ? (
        /* Appointment Summary Report */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="text-center">
              <p className="text-xs font-extrabold uppercase text-indigo-900">Total Scheduled</p>
              <h3 className="text-2xl font-black text-indigo-950 mt-1">{appointmentReport.totalAppointments}</h3>
            </Card>
            <Card className="text-center">
              <p className="text-xs font-extrabold uppercase text-indigo-900">Completed Consultations</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">{appointmentReport.statusCounts.COMPLETED}</h3>
            </Card>
            <Card className="text-center">
              <p className="text-xs font-extrabold uppercase text-indigo-900">Cancelled Appointments</p>
              <h3 className="text-2xl font-black text-rose-700 mt-1">{appointmentReport.statusCounts.CANCELLED}</h3>
            </Card>
          </div>

          <Card title="Doctor-Wise Consultation Volume Summary">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {appointmentReport.doctorVolume.map((doc, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white border border-indigo-100 flex justify-between items-center text-xs shadow-sm">
                  <div>
                    <p className="font-bold text-indigo-950">{doc.doctorName}</p>
                    <p className="text-indigo-600/80 mt-0.5">{doc.completed} Completed Consultations</p>
                  </div>
                  <Badge variant="info">{doc.total} Total Bookings</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : activeTab === 'medications' && medicationReport ? (
        /* Medication Consumption Report */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="text-center">
              <p className="text-xs font-extrabold uppercase text-indigo-900">Total Outward Dispensations</p>
              <h3 className="text-2xl font-black text-indigo-950 mt-1">{medicationReport.totalDispensedTransactions}</h3>
            </Card>
            <Card className="text-center">
              <p className="text-xs font-extrabold uppercase text-indigo-900">Fast-Moving Medicines (≥20 Qty)</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">{medicationReport.fastMovingCount}</h3>
            </Card>
            <Card className="text-center">
              <p className="text-xs font-extrabold uppercase text-indigo-900">Slow-Moving Medicines (&lt;20 Qty)</p>
              <h3 className="text-2xl font-black text-amber-700 mt-1">{medicationReport.slowMovingCount}</h3>
            </Card>
          </div>

          <Card title="Medication Consumption Breakdown & Movement Classification">
            <div className="space-y-2">
              {medicationReport.consumptionList.map((med) => (
                <div key={med.medicineId} className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-indigo-100 text-xs shadow-sm">
                  <div>
                    <p className="font-bold text-indigo-950">{med.medicineName} ({med.category})</p>
                    <p className="text-emerald-700 font-bold mt-0.5">Dispensed Quantity: {med.dispensedQuantity} {med.unit}</p>
                  </div>
                  <Badge variant={med.movementCategory === 'FAST_MOVING' ? 'success' : 'neutral'}>
                    {med.movementCategory === 'FAST_MOVING' ? '⚡ FAST MOVING' : '🐌 SLOW MOVING'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : activeTab === 'stock' && stockReport ? (
        /* Stock & Expiry Audit Report */
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="text-center">
              <p className="text-xs font-extrabold uppercase text-indigo-900">Total Medicines</p>
              <h3 className="text-2xl font-black text-indigo-950 mt-1">{stockReport.summary.totalMedicines}</h3>
            </Card>
            <Card className="text-center">
              <p className="text-xs font-extrabold uppercase text-indigo-900">Low Stock</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{stockReport.summary.lowStockCount}</h3>
            </Card>
            <Card className="text-center">
              <p className="text-xs font-extrabold uppercase text-indigo-900">Near Expiry</p>
              <h3 className="text-2xl font-black text-orange-600 mt-1">{stockReport.summary.nearExpiryCount}</h3>
            </Card>
            <Card className="text-center">
              <p className="text-xs font-extrabold uppercase text-indigo-900">Expired</p>
              <h3 className="text-2xl font-black text-rose-700 mt-1">{stockReport.summary.expiredCount}</h3>
            </Card>
          </div>

          {/* Low Stock Table */}
          {stockReport.lowStock.length > 0 && (
            <Card title="⚠️ Low Stock Medicines">
              <div className="space-y-2">
                {stockReport.lowStock.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                    <div>
                      <p className="font-bold text-indigo-950">{m.name}</p>
                      <p className="text-indigo-600/80 mt-0.5">{m.category} · Reorder Level: {m.reorderLevel}</p>
                    </div>
                    <Badge variant="warning">Stock: {m.quantity} {m.unit}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Near Expiry Table */}
          {stockReport.nearExpiry.length > 0 && (
            <Card title="🕐 Near Expiry Medicines (within 30 days)">
              <div className="space-y-2">
                {stockReport.nearExpiry.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-xs">
                    <div>
                      <p className="font-bold text-indigo-950">{m.name}</p>
                      <p className="text-indigo-600/80 mt-0.5">{m.category} · Expires in {m.daysRemaining} days</p>
                    </div>
                    <Badge variant="warning">Qty: {m.quantity}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Expired Table */}
          {stockReport.expired.length > 0 && (
            <Card title="❌ Expired Medicines">
              <div className="space-y-2">
                {stockReport.expired.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                    <div>
                      <p className="font-bold text-indigo-950">{m.name}</p>
                      <p className="text-rose-600/80 mt-0.5">{m.category} · Expired {Math.abs(m.daysRemaining)} days ago</p>
                    </div>
                    <Badge variant="danger">EXPIRED</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {stockReport.lowStock.length === 0 && stockReport.nearExpiry.length === 0 && stockReport.expired.length === 0 && (
            <Card>
              <p className="text-center text-sm font-semibold text-emerald-700 py-6">✅ All medicines are in healthy stock and within expiry. No alerts raised.</p>
            </Card>
          )}
        </div>
      ) : activeTab === 'visits' && visitsReport ? (
        /* Patient Visit History Report */
        <Card title="Patient Health Center Visit Logs">
          <div className="space-y-3">
            {visitsReport.visits.length === 0 ? (
              <p className="text-center text-sm text-indigo-500 py-6">No visit records found for the selected date range.</p>
            ) : visitsReport.visits.map((v) => (
              <div key={v.visitId} className="p-4 rounded-xl bg-white border border-indigo-100 text-xs space-y-2 shadow-sm">
                <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                  <span className="font-bold text-indigo-950">{v.studentName} ({v.studentRollNo}) — Dept: {v.department}</span>
                  <span className="text-indigo-600/80 font-mono">Date: {v.createdAt} | Doctor: {v.doctorName}</span>
                </div>
                <p className="text-indigo-800">Symptoms: <span className="text-indigo-950 font-medium">{v.symptoms}</span></p>
                <p className="text-emerald-700 font-bold">Diagnosis: {v.diagnosis}</p>
                <p className="text-indigo-600/80 italic">Prescription: {v.prescribedMedicines}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        /* Empty state — data not yet loaded or no results */
        <Card>
          <p className="text-center text-sm text-indigo-400 py-10">No report data available. Try adjusting the date range and clicking Filter.</p>
        </Card>
      )}
    </div>
  );
};
