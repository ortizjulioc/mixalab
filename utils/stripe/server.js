import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is missing. Please set it in your .env.local file.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

/**
 * Calculate the platform fee based on the amount and percentage
 * @param {number} amount - Amount in cents
 * @param {number} percentage - Commission percentage (e.g., 15 for 15%)
 * @returns {number} - Platform fee in cents
 */
export function calculatePlatformFee(amount, percentage) {
    const feePercentage = parseFloat(percentage) || 10; // Default to 10% if not provided
    return Math.round(amount * (feePercentage / 100));
}

/**
 * Calculate the creator payout amount
 * @param {number} amount - Total amount in cents
 * @param {number} percentage - Commission percentage
 * @returns {number} - Creator payout in cents
 */
export function calculateCreatorPayout(amount, percentage) {
    return amount - calculatePlatformFee(amount, percentage);
}
