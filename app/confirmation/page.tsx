import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Calendar, CreditCard, Mail, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import PlanUpdater from '@/components/PlanUpdater';

export const dynamic = 'force-dynamic';

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams?.session_id;
  console.log('ConfirmationPage rendered with searchParams:', searchParams);

  if (!sessionId) {
    console.log('No sessionId found, redirecting to /dashboard');
    redirect('/dashboard');
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    // Si pas de clé en dev, on fait un rendu fallback visuel
    return <FallbackConfirmation />;
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2026-04-22.dahlia',
  });

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });
  } catch (error: any) {
    console.error('Retrieval error:', error);
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-400 mb-4">Erreur de récupération Stripe</h2>
          <p className="text-slate-400 text-sm mb-6">
            Impossible de valider votre session de paiement. Détails :
          </p>
          <pre className="bg-slate-900 text-left p-4 rounded-xl text-xs text-red-300 overflow-auto max-h-40 mb-6">
            {error.message || String(error)}
          </pre>
          <Link href="/dashboard" className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-all">
            Retourner au Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const customerEmail = session.customer_details?.email || 'votre adresse email';
  const amountTotal = session.amount_total ? session.amount_total / 100 : 4.99;
  
  const subscription = session.subscription as Stripe.Subscription | undefined | string;
  const trialEnd = typeof subscription === 'object' && subscription?.trial_end 
    ? new Date(subscription.trial_end * 1000).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Composant invisible qui met à jour Firestore côté client */}
      <PlanUpdater 
        plan={typeof subscription === 'object' && subscription?.status === 'trialing' ? 'trial' : 'premium'} 
        trialEndAt={typeof subscription === 'object' ? subscription?.trial_end : null} 
      />

      {/* Effet lumineux en fond */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-xl bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl animate-fadeIn">
        
        {/* 1. Icône de succès */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-4 border-green-500/30 animate-pulse" />
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-3">Abonnement activé !</h1>
          <p className="text-slate-400 text-lg">
            Bienvenue dans BizInvoice Premium. Vos limites sont maintenant levées.
          </p>
        </div>

        {/* 2. Récapitulatif de l'abonnement */}
        <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 mb-8 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3 text-slate-300">
              <ShieldCheck className="w-5 h-5 text-violet-400" />
              <span>Plan choisi</span>
            </div>
            <span className="font-semibold text-white">Premium (Illimité)</span>
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3 text-slate-300">
              <Calendar className="w-5 h-5 text-violet-400" />
              <span>Période d'essai</span>
            </div>
            <span className="font-semibold text-white">3 jours offerts</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-300">
              <CreditCard className="w-5 h-5 text-violet-400" />
              <span>Prochain paiement</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-white">${amountTotal.toFixed(2)} USD</div>
              {trialEnd && <div className="text-xs text-slate-500">le {trialEnd}</div>}
            </div>
          </div>
        </div>

        {/* 3. Email de confirmation */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-10">
          <Mail className="w-6 h-6 text-violet-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-violet-300 mb-1">Reçu par email</h3>
            <p className="text-sm text-violet-200/70 leading-relaxed">
              Un email de confirmation contenant votre reçu a été envoyé à <strong>{customerEmail}</strong>.
            </p>
          </div>
        </div>

        {/* 4. Call to Action */}
        <Link 
          href="/dashboard/invoices/new"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 transition-all group"
        >
          Créer ma première facture
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* 5. Note d'annulation */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Vous pouvez annuler ou modifier votre abonnement à tout moment depuis les paramètres de votre compte, en un seul clic.
        </p>
      </div>
    </div>
  );
}

// Composant de fallback en cas d'absence de clé Stripe en développement
function FallbackConfirmation() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* En mode dev sans Stripe, on force le passage en premium pour tester */}
      <PlanUpdater plan="premium" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="relative w-full max-w-xl bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center relative">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-3">Mode Démo - Activé !</h1>
          <p className="text-slate-400 text-lg">Ceci est une page de test car Stripe n'est pas configuré.</p>
        </div>
        <Link 
          href="/dashboard"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-violet-600 text-white font-bold text-lg hover:bg-violet-500"
        >
          Aller au Dashboard
        </Link>
      </div>
    </div>
  );
}
