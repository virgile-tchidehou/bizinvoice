'use client';

import { useEffect, useState, use } from 'react';
import { getInvoice } from '@/lib/firestore';
import type { Invoice } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FileText } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';

const PDFDownloadButton = dynamic<{ invoice: Invoice }>(
  () => import('@/app/dashboard/invoices/[id]/PDFDownloadButton'),
  { ssr: false, loading: () => <span className="text-sm text-slate-400">Chargement PDF...</span> }
);

export default function PublicInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await getInvoice(id);
      setInvoice(data);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-slate-600" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Facture introuvable</h1>
        <p className="text-slate-400">Ce lien est invalide ou la facture a été supprimée.</p>
      </div>
    );
  }

  const formatDate = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Navbar simplifiée pour le client */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/5 h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Image src="/logo_bizinvoice.png" alt="BizInvoice Logo" width={32} height={32} className="rounded-lg shadow-lg" />
          <span className="text-lg font-bold gradient-text">BizInvoice</span>
        </div>
        <PDFDownloadButton invoice={invoice} />
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Facture {invoice.invoiceNumber}</h1>
          <p className="text-slate-400">Pour {invoice.clientName}</p>
        </div>

        {/* Invoice preview */}
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-violet-500 to-indigo-500" />

          <div className="p-6 sm:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Image src={invoice.companyLogoUrl || "/logo_bizinvoice.png"} alt="Logo" width={48} height={48} className="rounded-xl shadow-lg shadow-violet-500/20" />
                  <div>
                    <h1 className="text-2xl font-bold text-white">{invoice.companyName || 'Mon Entreprise'}</h1>
                    {invoice.companyAddress && <p className="text-slate-400 text-sm mt-1">{invoice.companyAddress}</p>}
                  </div>
                </div>
                <div className="space-y-1 text-sm text-slate-400">
                  <p>Date: {formatDate(invoice.createdAt)}</p>
                  <p>Échéance: {formatDate(invoice.dueDate)}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-3xl font-bold text-white">{formatCurrency(invoice.total, invoice.currency)}</p>
                <p className="text-sm text-slate-500 mt-1">{invoice.invoiceNumber}</p>
                {invoice.status === 'paid' && (
                  <div className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                    Payée
                  </div>
                )}
              </div>
            </div>

            {/* Client info */}
            <div className="rounded-xl bg-slate-900/50 p-4">
              <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">Facturé à</p>
              <p className="text-white font-medium">{invoice.clientName}</p>
              {invoice.clientEmail && <p className="text-sm text-slate-400">{invoice.clientEmail}</p>}
              {invoice.clientAddress && <p className="text-sm text-slate-400">{invoice.clientAddress}</p>}
            </div>

            {/* Items */}
            <div>
              <div className="hidden sm:grid grid-cols-12 gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 pb-3 border-b border-white/5">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-center">Qté</div>
                <div className="col-span-2 text-right">Prix unit.</div>
                <div className="col-span-3 text-right">Total</div>
              </div>
              {invoice.items.map((item, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-4 py-3 border-b border-white/5 last:border-0">
                  <div className="sm:col-span-5 text-white font-medium text-sm">{item.description}</div>
                  <div className="sm:col-span-2 text-center text-slate-400 text-sm">
                    <span className="sm:hidden text-slate-500">Qté: </span>{item.quantity}
                  </div>
                  <div className="sm:col-span-2 text-right text-slate-400 text-sm">
                    <span className="sm:hidden text-slate-500">Prix: </span>{formatCurrency(item.unitPrice, invoice.currency)}
                  </div>
                  <div className="sm:col-span-3 text-right text-white font-medium text-sm">
                    {formatCurrency(item.quantity * item.unitPrice, invoice.currency)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full sm:w-64 space-y-2">
                <div className="flex justify-between text-sm px-4 py-2">
                  <span className="text-slate-400">Sous-total</span>
                  <span className="text-white">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                </div>
                <div className="flex justify-between text-sm px-4 py-2">
                  <span className="text-slate-400">Taxe</span>
                  <span className="text-white">{formatCurrency(invoice.tax, invoice.currency)}</span>
                </div>
                <div className="flex justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-white font-bold text-lg">{formatCurrency(invoice.total, invoice.currency)}</span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <div className="rounded-xl bg-slate-900/50 border-l-2 border-violet-500 p-4">
                <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">Notes</p>
                <p className="text-sm text-slate-400">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
