'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { canCreateInvoice } from '@/lib/firestore';
import InvoiceForm from '@/components/InvoiceForm';
import PaywallModal from '@/components/PaywallModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewInvoicePage() {
  const { user } = useAuth();
  const [canCreate, setCanCreate] = useState<boolean | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const allowed = await canCreateInvoice(user.uid);
      setCanCreate(allowed);
      if (!allowed) setShowPaywall(true);
    };
    check();
  }, [user]);

  if (canCreate === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/invoices"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Nouvelle facture</h1>
      </div>

      {canCreate ? (
        <InvoiceForm />
      ) : (
        <div className="rounded-2xl bg-slate-800/30 border border-white/5 p-12 text-center">
          <p className="text-slate-400 mb-4">
            Vous avez atteint la limite de 2 factures/mois du plan gratuit.
          </p>
          <button
            onClick={() => setShowPaywall(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 transition-all"
          >
            Passer à Premium
          </button>
        </div>
      )}
      </div>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </>
  );
}
