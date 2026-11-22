'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMonthlyStats, getRecentInvoices } from '@/lib/firestore';
import type { Invoice } from '@/lib/types';
import DashboardStats from '@/components/DashboardStats';
import InvoiceCard from '@/components/InvoiceCard';
import Link from 'next/link';
import { PlusCircle, ArrowRight } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [stats, setStats] = useState({ totalRevenue: 0, invoiceCount: 0, pendingCount: 0, paidCount: 0 });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [s, inv] = await Promise.all([
        getMonthlyStats(user.uid),
        getRecentInvoices(user.uid, 5),
      ]);
      setStats(s);
      setRecentInvoices(inv);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Bonjour, {userProfile?.displayName?.split(' ')[0] || 'Utilisateur'} 👋
          </h1>
          <p className="text-slate-400 mt-1">Voici le résumé de votre activité ce mois.</p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Nouvelle facture
        </Link>
      </div>

      {/* Stats */}
      <DashboardStats {...stats} currency={userProfile?.currency} />

      {/* Recent invoices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Factures récentes</h2>
          <Link
            href="/dashboard/invoices"
            className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="rounded-2xl bg-slate-800/30 border border-white/5 p-12 text-center">
            <p className="text-slate-500 mb-4">Aucune facture pour le moment</p>
            <Link
              href="/dashboard/invoices/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500/15 text-violet-400 text-sm font-medium hover:bg-violet-500/25 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Créer ma première facture
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentInvoices.map((inv) => (
              <InvoiceCard key={inv.id} invoice={inv} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
