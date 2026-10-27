import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names with clsx and merges conflicting Tailwind classes.
 * @param {...any} inputs - Class names or conditions.
 * @returns {string} Merged class string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
