import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { stockService, StockTransaction } from '../../services/stockService';
import { useToast } from '../../contexts/ToastContext';
import { ArrowDownRight, ArrowUpRight, RefreshCw, FileSpreadsheet } from 'lucide-react';

export const StockTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const { showError } = useToast();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await stockService.getStockTransactions({ type: typeFilter });
      setTransactions(data);
    } catch (err: any) {
      showError('Failed to fetch stock transaction audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter]);

  const columns: Column<StockTransaction>[] = [
    {
      header: 'Timestamp',
      cell: (item) => (
        <span className="text-xs text-indigo-800 font-mono">
          {new Date(item.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Medicine Name',
      cell: (item) => (
        <div>
          <p className="font-bold text-indigo-950">{item.medicine.name}</p>
          <p className="text-xs text-indigo-600/80">{item.medicine.category}</p>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (item) => (
        <Badge variant={item.type === 'IN' ? 'success' : 'danger'}>
          {item.type === 'IN' ? '↑ STOCK-IN' : '↓ STOCK-OUT (Dispensed)'}
        </Badge>
      ),
    },
    {
      header: 'Quantity',
      cell: (item) => (
        <span className={`font-extrabold text-sm ${item.type === 'IN' ? 'text-emerald-700' : 'text-rose-700'}`}>
          {item.type === 'IN' ? `+${item.quantity}` : `-${item.quantity}`} {item.medicine.unit}
        </span>
      ),
    },
    {
      header: 'Responsible User',
      cell: (item) => (
        <div>
          <p className="font-bold text-indigo-950 text-xs">{item.performedBy.name}</p>
          <p className="text-[11px] text-indigo-600/80">{item.performedBy.email}</p>
        </div>
      ),
    },
    {
      header: 'Reference Notes',
      cell: (item) => (
        <span className="text-xs text-indigo-800 italic">{item.referenceNotes || 'N/A'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Stock Movement Audit Logs"
        subtitle="Immutable audit trail of all inward batch additions (Stock-IN) and patient prescription dispensations (Stock-OUT)"
        action={
          <Button variant="outline" icon={<RefreshCw />} onClick={fetchTransactions}>
            Refresh Audit Log
          </Button>
        }
      />

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-900">Filter by Movement Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white border border-indigo-200 text-indigo-950 rounded-xl text-xs p-2.5 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">All Transactions (IN & OUT)</option>
              <option value="IN">Stock-IN Only (Inward Additions)</option>
              <option value="OUT">Stock-OUT Only (Dispensed Prescriptions)</option>
            </select>
          </div>
        </div>
      </Card>

      <Card title="Stock Transactions Audit History">
        <Table
          columns={columns}
          data={transactions}
          keyExtractor={(item) => item.id}
          emptyMessage="No stock transactions found matching filter criteria."
          loading={loading}
        />
      </Card>
    </div>
  );
};
