/** Formats a price as e.g. "₹250" or "₹250.50" (no trailing ".00"). */
export function formatPrice(amount: number | null | undefined): string {
  if (amount == null) return "";
  const rounded = Math.round(amount * 100) / 100;
  const hasCents = rounded % 1 !== 0;
  return `₹${hasCents ? rounded.toFixed(2) : rounded.toFixed(0)}`;
}
