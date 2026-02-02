import { loadStripe } from '@stripe/stripe-js';

let stripePromise;

export const getStripe = () => {
    if (!stripePromise) {
        if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
            console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing');
            return null;
        }
        stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    }
    return stripePromise;
};
