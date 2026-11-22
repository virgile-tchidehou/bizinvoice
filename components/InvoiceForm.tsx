'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createInvoice } from '@/lib/firestore';
import type { InvoiceItem } from '@/lib/types';
import { Plus, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { useEffect } from 'react';

export default function InvoiceForm() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  useEffect(() => {
    if (userProfile?.companies && userProfile.companies.length > 0) {
      const defaultCompany = userProfile.companies[0];
      setSelectedCompanyId(defaultCompany.id);
      setCurrency(defaultCompany.currency || 'USD');
    } else if (userProfile?.currency) {
      setCurrency(userProfile.currency);
    }
  }, [userProfile]);

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    const company = userProfile?.companies?.find((c) => c.id === companyId);
    if (company && company.currency) {
      setCurrency(company.currency);
    }
  };

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  // Générer un numéro de facture unique
  const generateInvoiceNumber = () => {
    const date = new Date();
    const y = date.getFullYear().toString().slice(-2);
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const rand = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `INV-${y}${m}-${rand}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!clientName.trim()) {
      toast.error('Nom du client requis');
      return;
    }
    if (items.some((item) => !item.description.trim())) {
      toast.error('Toutes les descriptions doivent être remplies');
      return;
    }
    if (items.some((item) => item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error('Quantités et prix doivent être positifs');
      return;
    }

    setLoading(true);
    try {
      const selectedCompany = userProfile?.companies?.find(c => c.id === selectedCompanyId);
      const companyName = selectedCompany?.name || userProfile?.companyName || 'Mon Entreprise';
      const companyAddress = selectedCompany?.address || userProfile?.companyAddress || '';
      const companyLogoUrl = selectedCompany?.logoUrl || userProfile?.logoUrl || '';

      const id = await createInvoice({
        userId: user.uid,
        companyId: selectedCompanyId,
        invoiceNumber: generateInvoiceNumber(),
        companyName,
        companyAddress,
        companyLogoUrl,
        clientName,
        clientEmail,
        clientAddress,
        items,
        subtotal,
        tax,
        total,
        currency,
        status: 'draft',
        notes,
        dueDate: new Date(dueDate),
      });
      toast.success('Facture créée !');
      router.push(`/dashboard/invoices/${id}`);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      {/* Sélection de l'entreprise (s'il y en a plusieurs) */}
      {userProfile?.companies && userProfile.companies.length > 0 && (
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Entreprise émettrice</h2>
          <div>
            <select
              value={selectedCompanyId}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all appearance-none"
            >
              {userProfile.companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name || 'Entreprise sans nom'} {company.address ? `(${company.address})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Informations client */}
      <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400">
            1
          </span>
          Informations client
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Nom du client *
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              placeholder="Nom ou entreprise"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              placeholder="client@email.com"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Adresse
            </label>
            <input
              type="text"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              placeholder="Adresse du client"
            />
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400">
            2
          </span>
          Articles & Services
        </h2>

        <div className="space-y-3">
          {/* Header row - desktop */}
          <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-medium text-slate-500 uppercase tracking-wider px-1">
            <div className="col-span-5">Description</div>
            <div className="col-span-2">Quantité</div>
            <div className="col-span-2">Prix unitaire</div>
            <div className="col-span-2 text-right">Sous-total</div>
            <div className="col-span-1" />
          </div>

          {items.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 rounded-xl bg-slate-900/30 border border-white/5"
            >
              <div className="md:col-span-5">
                <label className="md:hidden text-xs text-slate-500 mb-1 block">
                  Description
                </label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(idx, 'description', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  placeholder="Description du service"
                />
              </div>
              <div className="md:col-span-2">
                <label className="md:hidden text-xs text-slate-500 mb-1 block">
                  Quantité
                </label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity === 0 ? '' : item.quantity}
                  onChange={(e) => updateItem(idx, 'quantity', e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="md:hidden text-xs text-slate-500 mb-1 block">
                  Prix unitaire
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice === 0 ? '' : item.unitPrice}
                  onChange={(e) => updateItem(idx, 'unitPrice', e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-end">
                <span className="text-sm font-semibold text-white">
                  {formatCurrency(item.quantity * item.unitPrice, currency)}
                </span>
              </div>
              <div className="md:col-span-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  disabled={items.length === 1}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-violet-400 border border-violet-500/30 hover:bg-violet-500/10 transition-all"
        >
          <Plus className="w-4 h-4" />
          Ajouter un article
        </button>
      </div>

      {/* Paramètres & Totaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notes & Date */}
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400">
              3
            </span>
            Détails
          </h2>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Devise
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all appearance-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="CAD">CAD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="XOF">XOF (FCFA)</option>
              <option value="MAD">MAD (MAD)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Date d&apos;échéance
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Taxe (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-none"
              placeholder="Conditions de paiement, remarques..."
            />
          </div>
        </div>

        {/* Résumé */}
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400">
              4
            </span>
            Résumé
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Sous-total</span>
              <span className="text-white font-medium">{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Taxe ({taxRate}%)</span>
              <span className="text-white font-medium">{formatCurrency(tax, currency)}</span>
            </div>
            <hr className="border-white/10" />
            <div className="flex justify-between">
              <span className="text-white font-semibold">Total</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Création...' : 'Créer la facture'}
          </button>
        </div>
      </div>
    </form>
  );
}
