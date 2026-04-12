/**
 * Formats a number as South African Rand.
 * e.g. formatCurrency(29.5) → "R 29.50"
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(amount);
};
