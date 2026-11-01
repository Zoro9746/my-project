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
import { Pill, Plus, ArrowDownRight, Edit, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Add Medicine Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addForm, setAddForm] = useState({
    name: '',
    category: 'Analgesics',
    unit: 'Tablets',
    quantity: 100,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reorderLevel: 20,
  });
  const [adding, setAdding] = useState<boolean>(false);

  // Stock-In Modal State
  const [stockInMed, setStockInMed] = useState<Medicine | null>(null);
  const [stockInQty, setStockInQty] = useState<number>(50);
  const [stockInNotes, setStockInNotes] = useState<string>('');
  const [stockingIn, setStockingIn] = useState<boolean>(false);

  const { showSuccess, showError } = useToast();

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const data = await medicineService.getAllMedicines();
      setMedicines(data);
    } catch (err: any) {
      showError('Failed to fetch medicine catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await stockService.createMedicine(addForm);
      showSuccess(`Medicine '${addForm.name}' added to catalog successfully!`);
      setShowAddModal(false);
      fetchMedicines();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to add medicine.');
    } finally {
      setAdding(false);
    }
  };

  const handleStockInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInMed) return;

    setStockingIn(true);
    try {
      await stockService.addStockIn({
        medicineId: stockInMed.id,
        quantity: stockInQty,
        referenceNotes: stockInNotes || 'Inward stock addition batch',
      });
      showSuccess(`Added +${stockInQty} units to ${stockInMed.name}!`);
      setStockInMed(null);
      fetchMedicines();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Stock Inward failed.');
    } finally {
      setStockingIn(false);
    }
  };

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? m.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(medicines.map((m) => m.category)));

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
      header: 'Stock Quantity',
      cell: (item) => {
        const isLow = item.quantity <= item.reorderLevel;
        const isOut = item.quantity === 0;

        return (
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base text-indigo-950">{item.quantity}</span>
            <span className="text-xs text-indigo-600/80">{item.unit}</span>
            {isOut ? (
              <Badge variant="danger" size="sm">
                Out of Stock
              </Badge>
            ) : isLow ? (
              <Badge variant="warning" size="sm">
                Low Stock (Reorder: {item.reorderLevel})
              </Badge>
            ) : (
              <Badge variant="success" size="sm">
                Healthy
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      header: 'Expiry Date',
      cell: (item) => {
        const expiry = new Date(item.expiryDate);
        const now = new Date();
        const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
        const isExpired = daysLeft <= 0;
        const isNearExpiry = daysLeft > 0 && daysLeft <= 30;

        return (
          <div className="text-xs">
            <p className={`font-semibold ${isExpired ? 'text-rose-700' : isNearExpiry ? 'text-amber-700' : 'text-indigo-950'}`}>
              {expiry.toLocaleDateString()}
            </p>
            {isExpired ? (
              <Badge variant="danger" size="sm">
                EXPIRED
              </Badge>
            ) : isNearExpiry ? (
              <Badge variant="warning" size="sm">
                Expiring in {daysLeft}d
              </Badge>
            ) : (
              <span className="text-[11px] text-indigo-600/80">{daysLeft} days remaining</span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Actions',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<ArrowDownRight />}
            onClick={() => {
              setStockInMed(item);
              setStockInQty(50);
              setStockInNotes('');
            }}
          >
            + Stock-In
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Medicine Inventory Control"
        subtitle="Manage pharmacy medicine catalog, reorder levels, expiry tracking, and inward batch stock-in"
        action={
          <Button icon={<Plus />} onClick={() => setShowAddModal(true)}>
            Add New Medicine
          </Button>
        }
      />

      {/* Filter & Search Bar */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search medicine name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-indigo-200 text-indigo-950 rounded-xl text-xs p-2.5 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card title="Medicine Inventory Catalog">
        <Table
          columns={columns}
          data={filteredMedicines}
          keyExtractor={(item) => item.id}
          emptyMessage="No medicines found in catalog matching search criteria."
          loading={loading}
        />
      </Card>

      {/* Add New Medicine Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Medicine to Catalog"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateMedicine} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Medicine Name"
                placeholder="e.g. Dextromethorphan 10mg"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                required
              />

              <Input
                label="Category"
                placeholder="e.g. Cough Suppressants"
                value={addForm.category}
                onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Unit Type"
                placeholder="e.g. Tablets, Bottles"
                value={addForm.unit}
                onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })}
                required
              />

              <Input
                label="Initial Stock Quantity"
                type="number"
                min={0}
                value={addForm.quantity}
                onChange={(e) => setAddForm({ ...addForm, quantity: Number(e.target.value) })}
                required
              />

              <Input
                label="Reorder Threshold"
                type="number"
                min={0}
                value={addForm.reorderLevel}
                onChange={(e) => setAddForm({ ...addForm, reorderLevel: Number(e.target.value) })}
                required
              />
            </div>

            <Input
              label="Expiry Date"
              type="date"
              value={addForm.expiryDate}
              onChange={(e) => setAddForm({ ...addForm, expiryDate: e.target.value })}
              required
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-indigo-100">
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={adding} icon={<CheckCircle2 />}>
                Save Medicine to Catalog
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Stock-In Inward Modal */}
      {stockInMed && (
        <Modal
          isOpen={Boolean(stockInMed)}
          onClose={() => setStockInMed(null)}
          title={`Inward Stock Addition — ${stockInMed.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleStockInSubmit} className="space-y-4">
            <p className="text-xs text-indigo-800">
              Current Stock: <span className="font-bold text-indigo-950">{stockInMed.quantity} {stockInMed.unit}</span>
            </p>

            <Input
              label="Incoming Quantity to Add"
              type="number"
              min={1}
              value={stockInQty}
              onChange={(e) => setStockInQty(Number(e.target.value))}
              required
            />

            <Input
              label="Reference Notes / Supplier Batch #"
              placeholder="e.g. Received batch #B-2026-09 from BIT Central Pharmacy"
              value={stockInNotes}
              onChange={(e) => setStockInNotes(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-indigo-100">
              <Button variant="ghost" onClick={() => setStockInMed(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={stockingIn} icon={<CheckCircle2 />}>
                Confirm Stock Inward (+{stockInQty})
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
