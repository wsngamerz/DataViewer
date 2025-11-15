import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility to generate a consistent color from a string (e.g., senderId, chatId, or chat title)
export function getAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#fbbf24', // amber
    '#a5b4fc', // indigo
    '#34d399', // green
    '#f472b6', // pink
    '#60a5fa', // blue
    '#f87171', // red
    '#facc15', // yellow
    '#38bdf8', // sky
    '#c084fc', // purple
    '#fb7185', // rose
  ];
  const idx = Math.abs(hash) % colors.length;
  return colors[idx];
}
