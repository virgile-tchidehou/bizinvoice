'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Zap, FileText, Download, Share2, Shield, Star, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  { icon: FileText, title: 'Créez en 30 secondes', desc: 'Formulaire intelligent avec calcul automatique des totaux et taxes.' },
  { icon: Download, title: 'PDF professionnel', desc: 'Téléchargez des factures au design premium, prêtes à envoyer.' },
  { icon: Share2, title: 'Partagez via WhatsApp', desc: 'Envoyez vos factures directement depuis l\'app en un clic.' },
  { icon: Shield, title: 'Données sécurisées', desc: 'Authentification Firebase et stockage cloud fiable.' },
];

const pricingFeatures = {
  free: ['2 factures par mois', 'PDF téléchargeable', 'Partage WhatsApp', 'Dashboard basique'],
  premium: ['Factures illimitées', 'PDF téléchargeable', 'Partage WhatsApp', 'Dashboard complet', 'Support prioritaire', 'Personnalisation'],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo_bizinvoice.png" alt="BizInvoice Logo" width={32} height={32} className="rounded-lg shadow-lg shadow-violet-500/25" />
            <span className="text-lg font-bold gradient-text">BizInvoice</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Connexion
            </Link>
            <Link href="/register" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 transition-all">
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] animate-glow" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-[100px] animate-glow delay-500" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-8 animate-fadeIn">
            <Star className="w-4 h-4" />
            Facturation simplifiée pour entrepreneurs
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-slideUp">
            Créez vos factures{' '}
            <span className="gradient-text">en quelques clics</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-slideUp delay-200">
            BizInvoice vous permet de créer, gérer et partager des factures professionnelles. Simple, rapide, mobile-first.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slideUp delay-300">
            <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-lg hover:from-violet-500 hover:to-indigo-500 shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all">
              Commencer gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/10 text-slate-300 font-medium text-lg hover:bg-white/5 transition-all text-center">
              J&apos;ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Une solution complète de facturation, conçue pour les entrepreneurs qui veulent aller vite.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className={`group rounded-2xl bg-slate-800/30 border border-white/5 p-6 hover:border-violet-500/20 hover:shadow-lg hover:shadow-violet-500/5 transition-all animate-fadeIn delay-${(i + 1) * 100}`}>
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                  <f.icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Tarifs simples</h2>
            <p className="text-slate-400">Commencez gratuitement, passez à Premium quand vous en avez besoin.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Free */}
            <div className="rounded-2xl bg-slate-800/30 border border-white/10 p-8">
              <h3 className="text-xl font-semibold text-white">Free</h3>
              <p className="text-4xl font-bold text-white mt-4">$0<span className="text-base font-normal text-slate-500">/mois</span></p>
              <ul className="mt-8 space-y-3">
                {pricingFeatures.free.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-400">
                    <CheckCircle className="w-4 h-4 text-slate-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/register?plan=free" className="mt-8 block text-center py-3 rounded-xl border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/5 transition-all">
                Commencer
              </Link>
            </div>
            {/* Premium */}
            <div className="rounded-2xl border-2 border-violet-500/40 bg-gradient-to-b from-violet-500/10 to-transparent p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 text-xs font-bold text-white">POPULAIRE</div>
              <h3 className="text-xl font-semibold text-white mt-1">Premium</h3>
              <p className="text-4xl font-bold text-white mt-4">$4.99<span className="text-base font-normal text-slate-500">/mois</span></p>
              <p className="text-sm text-violet-400 mt-2 font-medium">3 jours d'essai gratuit</p>
              <ul className="mt-6 space-y-3">
                {pricingFeatures.premium.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-violet-400 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/register?plan=premium" className="mt-8 block text-center py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 transition-all">
                Démarrer l'essai gratuit
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo_bizinvoice.png" alt="BizInvoice Logo" width={16} height={16} />
            <span className="text-sm font-semibold text-slate-400">BizInvoice</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 BizInvoice. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
