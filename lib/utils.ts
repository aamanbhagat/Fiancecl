import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Handles number input changes with proper zero handling
 * Prevents the issue where you can't delete the last "0"
 * @param value - The input value from onChange event
 * @returns The parsed number or 0
 */
export function parseNumberInput(value: string): number {
  // If empty string, return 0
  if (value === '') return 0;
  
  // Parse the number
  const parsed = Number(value);
  
  // Return 0 if NaN, otherwise return the parsed value
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats a number for display in input fields
 * Returns empty string for 0 to allow easy editing
 * @param value - The number to format
 * @param keepZero - If true, keep "0" instead of empty string
 * @returns Formatted string for input display
 */
export function formatNumberInput(value: number, keepZero: boolean = false): string {
  if (value === 0 && !keepZero) return '';
  return String(value);
}
