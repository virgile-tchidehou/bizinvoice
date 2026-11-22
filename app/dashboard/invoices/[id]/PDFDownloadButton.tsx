'use client';

import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '@/components/InvoicePDF';
import type { Invoice } from '@/lib/types';
import { Download } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function PDFDownloadButton({ invoice }: { invoice: Invoice }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF téléchargé !');
    } catch {
      toast.error('Erreur de génération PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50"
    >
      <Download className="w-4 h-4" />
      {loading ? 'Génération...' : 'PDF'}
    </button>
  );
}
