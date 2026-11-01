import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { medicineService, Medicine } from '../../services/medicineService';
import { stockService } from '../../services/stockService';
import { useToast } from '../../contexts/ToastContext';
import { Pill, Edit, Search, CheckCircle2, ShieldAlert, ArrowDownRight } from 'lucide-react';

export const AdminMedicineControl: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Edit stock override state
  const [editTarget, setEditTarget] = useState<Medicine | null>(null);
  const [overrideQty, setOverrideQty] = useState<number>(0);
  const [overrideReorder, setOverrideReorder] = useState<number>(10);
  const [updating, setUpdating] = useState<boolean>(false);

  const { showSuccess, showError } = useToast();

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const data = await medicineService.getAllMedicines();
      setMedicines(data);
    } catch (err: any) {
      showError('Failed to load master medicine inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleToggleActive = async (med: Medicine) => {
    try {
      const newStatus = !med.isActive;
      await stockService.updateMedicine(med.id, { isActive: newStatus });
      showSuccess(`Medicine '${med.name}' ${newStatus ? 'enabled' : 'disabled'} successfully!`);
      fetchMedicines();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update medicine status.');
    }
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    setUpdating(true);
    try {
      await stockService.updateMedicine(editTarget.id, {
        quantity: overrideQty,
        reorderLevel: overrideReorder,
      });
      showSuccess(`Stock overrides for '${editTarget.name}' applied successfully!`);
      setEditTarget(null);
      fetchMedicines();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Stock override failed.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<Medicine>[] = [
    {
      header: 'Medicine Name & Category',
      cell: (item) => (
        <div>
          <p className="font-bold text-indigo-950">{item.name}</p>
          <p className="text-xs text-indigo-600/80">{item.category}</p>
        </div>
      ),
    },
    {
      header: 'Current Quantity',
      cell: (item) => (
        <span className="font-mono text-base font-extrabold text-emerald-700">
          {item.quantity} {item.unit}
        </span>
      ),
    },
    {
      header: 'Reorder Threshold',
      cell: (item) => <span className="text-xs text-indigo-800 font-medium">{item.reorderLevel} {item.unit}</span>,
    },
    {
      header: 'Status',
      cell: (item) => (
        <Badge variant={item.isActive ? 'success' : 'danger'}>
          {item.isActive ? 'Active Catalog' : 'Disabled'}
        </Badge>
      ),
    },
    {
      header: 'Admin Actions',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<Edit className="w-3.5 h-3.5" />}
            onClick={() => {
              setEditTarget(item);
              setOverrideQty(item.quantity);
              setOverrideReorder(item.reorderLevel);
            }}
          >
            Adjust Stock
          </Button>

          <Button
            size="sm"
            variant={item.isActive ? 'danger' : 'outline'}
            onClick={() => handleToggleActive(item)}
          >
            {item.isActive ? 'Disable' : 'Enable'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Admin Master Inventory Control"
        subtitle="Full administrative control over medicine master catalog, stock override adjustments, and catalog status"
      />

      <Card>
        <div className="relative">
          <Input
            placeholder="Search medicine name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </Card>

      <Card title="Master Medicine Inventory Catalog">
        <Table
          columns={columns}
          data={filteredMedicines}
          keyExtractor={(item) => item.id}
          emptyMessage="No medicines found in master catalog."
          loading={loading}
        />
      </Card>

      {/* Adjust Stock Override Modal */}
      {editTarget && (
        <Modal
          isOpen={Boolean(editTarget)}
          onClose={() => setEditTarget(null)}
          title={`Admin Stock Override — ${editTarget.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleOverrideSubmit} className="space-y-4">
            <Input
              label="Override Quantity Count *"
              type="number"
              min={0}
              value={overrideQty}
              onChange={(e) => setOverrideQty(Number(e.target.value))}
              required
            />

            <Input
              label="Reorder Threshold Level *"
              type="number"
              min={0}
              value={overrideReorder}
              onChange={(e) => setOverrideReorder(Number(e.target.value))}
              required
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-indigo-100">
              <Button variant="ghost" onClick={() => setEditTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={updating} icon={<CheckCircle2 />}>
                Apply Stock Override
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
