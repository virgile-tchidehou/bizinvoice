'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getInvoices, deleteInvoice } from '@/lib/firestore';
import type { Invoice, InvoiceStatus } from '@/lib/types';
import InvoiceCard from '@/components/InvoiceCard';
import Link from 'next/link';
import { PlusCircle, Filter } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

const filters: { label: string; value: InvoiceStatus | 'all' }[] = [
  { label: 'Toutes', value: 'all' },
  { label: 'Brouillons', value: 'draft' },
  { label: 'Envoyées', value: 'sent' },
  { label: 'Payées', value: 'paid' },
];

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<InvoiceStatus | 'all'>('all');

  const loadInvoices = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getInvoices(user.uid);
    setInvoices(data);
    setLoading(false);
  };

  useEffect(() => {
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm('Supprimer cette facture ?')) return;
    try {
      await deleteInvoice(id, user.uid);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      toast.success('Facture supprimée');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filtered = activeFilter === 'all' ? invoices : invoices.filter((inv) => inv.status === activeFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Mes factures</h1>
        <Link
          href="/dashboard/invoices/new"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Nouvelle facture
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-slate-500 shrink-0" />
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === f.value
                ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-slate-800/30 border border-white/5 p-12 text-center">
          <p className="text-slate-500">Aucune facture {activeFilter !== 'all' ? `avec le statut "${activeFilter}"` : ''}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => (
            <InvoiceCard key={inv.id} invoice={inv} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
