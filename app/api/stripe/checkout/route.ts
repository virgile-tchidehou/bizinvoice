import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const secretKey = process.env.STRIPE_SECRET_KEY;

  // Vérifier que la clé Stripe est configurée
  if (!secretKey || secretKey === 'sk_xxx') {
    return NextResponse.json(
      { error: 'Stripe non configuré. Ajoutez votre clé STRIPE_SECRET_KEY dans .env.local' },
      { status: 500 }
    );
  }

  try {
    const stripe = new Stripe(secretKey, {
      apiVersion: '2026-04-22.dahlia',
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || 'price_XXXXX', // Remplacer par l'ID du prix Stripe
          quantity: 1,
        },
      ],
      success_url: `${origin}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur lors de la création de la session Stripe' },
      { status: 500 }
    );
  }
}
