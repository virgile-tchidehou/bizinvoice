'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getInvoice, updateInvoiceStatus, deleteInvoice } from '@/lib/firestore';
import type { Invoice, InvoiceStatus } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft, Download, Share2, Trash2, CheckCircle, Send, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Chargement dynamique du PDF pour éviter les erreurs SSR
const PDFDownloadButton = dynamic<{ invoice: Invoice }>(
  () => import('./PDFDownloadButton'), // Trigger TS server update
  { ssr: false, loading: () => <span className="text-sm text-slate-400">Chargement PDF...</span> }
);

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  draft: { label: 'Brouillon', className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  sent: { label: 'Envoyée', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  paid: { label: 'Payée', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
};

const statusFlow: InvoiceStatus[] = ['draft', 'sent', 'paid'];

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
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

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    if (!invoice) return;
    try {
      await updateInvoiceStatus(invoice.id, newStatus);
      setInvoice({ ...invoice, status: newStatus });
      toast.success(`Statut → ${statusConfig[newStatus].label}`);
    } catch {
      toast.error('Erreur de mise à jour');
    }
  };

  const handleDelete = async () => {
    if (!invoice || !user) return;
    if (!confirm('Supprimer cette facture définitivement ?')) return;
    try {
      await deleteInvoice(invoice.id, user.uid);
      toast.success('Facture supprimée');
      router.push('/dashboard/invoices');
    } catch {
      toast.error('Erreur de suppression');
    }
  };

  const handleWhatsApp = () => {
    if (!invoice) return;
    const publicUrl = `${window.location.origin}/i/${invoice.id}`;
    const msg = encodeURIComponent(
      `Bonjour ${invoice.clientName},\n\n` +
      `Voici votre facture ${invoice.invoiceNumber} d'un montant de ${formatCurrency(invoice.total, invoice.currency)}.\n` +
      `📅 Échéance : ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}\n\n` +
      `Vous pouvez consulter et télécharger votre facture PDF en toute sécurité via ce lien :\n${publicUrl}\n\n` +
      `Merci pour votre confiance !`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Facture introuvable</p>
        <Link href="/dashboard/invoices" className="text-violet-400 hover:text-violet-300 mt-4 inline-block">
          Retour aux factures
        </Link>
      </div>
    );
  }

  const status = statusConfig[invoice.status];
  const nextStatus = statusFlow[statusFlow.indexOf(invoice.status) + 1];
  const formatDate = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{invoice.invoiceNumber}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.className}`}>
                {status.label}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">{invoice.clientName}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {nextStatus && (
            <button
              onClick={() => handleStatusChange(nextStatus)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/15 text-violet-400 text-sm font-medium hover:bg-violet-500/25 transition-all"
            >
              {nextStatus === 'sent' ? <Send className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              Marquer {statusConfig[nextStatus].label.toLowerCase()}
            </button>
          )}
          <PDFDownloadButton invoice={invoice} />
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/5 transition-all"
          >
            <Share2 className="w-4 h-4" />
            WhatsApp
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Invoice preview */}
      <div className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden">
        {/* Violet top bar */}
        <div className="h-2 bg-gradient-to-r from-violet-500 to-indigo-500" />

        <div className="p-6 sm:p-8 space-y-8">
          {/* Top info */}
          <div className="flex flex-col sm:flex-row justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <Image src={invoice.companyLogoUrl || "/logo_bizinvoice.png"} alt="Logo" width={48} height={48} className="rounded-xl shadow-lg shadow-violet-500/20" />
                <div>
                  <h1 className="text-2xl font-bold text-white">{invoice.companyName || 'Mon Entreprise'}</h1>
                  {invoice.companyAddress && <p className="text-slate-400 text-sm mt-1">{invoice.companyAddress}</p>}
                </div>
              </div>
              <div className="space-y-1 text-sm text-slate-400 mt-4">
                <p>Date: {formatDate(invoice.createdAt)}</p>
                <p>Échéance: {formatDate(invoice.dueDate)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{formatCurrency(invoice.total, invoice.currency)}</p>
              <p className="text-sm text-slate-500 mt-1">{invoice.invoiceNumber}</p>
            </div>
          </div>

          {/* Client */}
          <div className="rounded-xl bg-slate-900/50 p-4">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">Client</p>
            <p className="text-white font-medium">{invoice.clientName}</p>
            {invoice.clientEmail && <p className="text-sm text-slate-400">{invoice.clientEmail}</p>}
            {invoice.clientAddress && <p className="text-sm text-slate-400">{invoice.clientAddress}</p>}
          </div>

          {/* Items table */}
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

          {/* Notes */}
          {invoice.notes && (
            <div className="rounded-xl bg-slate-900/50 border-l-2 border-violet-500 p-4">
              <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-slate-400">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
