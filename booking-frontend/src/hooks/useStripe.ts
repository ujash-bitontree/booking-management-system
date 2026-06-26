import { useEffect, useState } from 'react';
// import { loadStripe, Stripe } from '@stripe/stripe';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useAppointments } from './useAppointments';

export const useStripe = () => {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const { createCheckoutSession } = useAppointments();

  useEffect(() => {
    const load = async () => {
      const stripeInstance = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
      );
      setStripe(stripeInstance);
    };
    load();
  }, []);

  const redirectToCheckout = async (appointmentId: string) => {
    if (!stripe) {
      console.error('Stripe not loaded');
      return;
    }

    try {
      const { url } = await createCheckoutSession(appointmentId);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to redirect to checkout:', error);
    }
  };

  return {
    stripe,
    redirectToCheckout,
  };
};