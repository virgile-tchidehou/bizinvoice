'use client';

import { useState } from 'react';
import { X, Crown, Check, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Erreur Stripe. Vérifiez votre configuration.');
      }
    } catch {
      toast.error('Impossible de lancer le paiement');
    } finally {
      setLoading(false);
    }
  };

  const freeFeatures = ['2 factures / mois', 'Téléchargement PDF', 'Partage WhatsApp'];
  const premiumFeatures = [
    'Factures illimitées',
    'Téléchargement PDF',
    'Partage WhatsApp',
    'Support prioritaire',
    'Personnalisation avancée',
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-3xl bg-slate-900 border border-white/10 shadow-2xl animate-fadeIn">
        {/* Gradient top */}
        <div className="h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Passez à Premium</h2>
            <p className="text-slate-400 mt-2">
              Vous avez atteint la limite gratuite de 2 factures/mois
            </p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Free */}
            <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-1">Free</h3>
              <p className="text-3xl font-bold text-white">
                $0<span className="text-sm font-normal text-slate-400">/mois</span>
              </p>
              <ul className="mt-5 space-y-3">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                    <Check className="w-4 h-4 text-slate-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="mt-6 w-full py-2.5 rounded-xl border border-white/10 text-sm font-medium text-slate-500 cursor-not-allowed"
              >
                Plan actuel
              </button>
            </div>

            {/* Premium */}
            <div className="rounded-2xl border-2 border-violet-500/50 bg-gradient-to-b from-violet-500/10 to-transparent p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 text-xs font-bold text-white">
                RECOMMANDÉ
              </div>
              <h3 className="text-lg font-semibold text-white mb-1 mt-1">Premium</h3>
              <p className="text-3xl font-bold text-white">
                $4.99<span className="text-sm font-normal text-slate-400">/mois</span>
              </p>
              <ul className="mt-5 space-y-3">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-violet-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                {loading ? 'Redirection...' : 'Passer à Premium'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
