'use client';

import Link from 'next/link';
import type { Invoice } from '@/lib/types';
import { FileText, Trash2, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface InvoiceCardProps {
  invoice: Invoice;
  onDelete?: (id: string) => void;
}

const statusConfig = {
  draft: {
    label: 'Brouillon',
    className: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  },
  sent: {
    label: 'Envoyée',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  paid: {
    label: 'Payée',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
};

export default function InvoiceCard({ invoice, onDelete }: InvoiceCardProps) {
  const status = statusConfig[invoice.status];
  const formattedDate = new Date(invoice.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="group relative rounded-2xl bg-slate-800/50 border border-white/5 p-5 hover:border-violet-500/20 hover:shadow-lg hover:shadow-violet-500/5 transition-all">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Info */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="p-2.5 rounded-xl bg-violet-500/10 shrink-0">
            <FileText className="w-5 h-5 text-violet-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-white truncate">
                {invoice.invoiceNumber}
              </h3>
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.className}`}
              >
                {status.label}
              </span>
            </div>
            <p className="text-sm text-slate-400 truncate">{invoice.clientName}</p>
            <p className="text-xs text-slate-500 mt-1">{formattedDate}</p>
          </div>
        </div>

        {/* Right: Total + Actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <p className="text-lg font-bold text-white">
            {formatCurrency(invoice.total, invoice.currency)}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Link
              href={`/dashboard/invoices/${invoice.id}`}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-colors"
            >
              Voir les détails
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(invoice.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
