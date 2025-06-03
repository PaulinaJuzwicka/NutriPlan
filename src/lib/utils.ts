import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return format(date, 'MMM d, yyyy', { locale: enUS });
}

export function extractNumber(text: string): number | null {
  const match = text.match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

export function formatCookingTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours} hr ${remainingMinutes > 0 ? `${remainingMinutes} min` : ''}`;
  }
  return `${remainingMinutes} min`;
}

export function formatServings(count: number): string {
  return count === 1 ? 'serving' : 'servings';
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function formatDateTime(date: Date): string {
  return format(date, 'MMM d, yyyy, h:mm a', { locale: enUS });
}

export function formatTime(date: Date): string {
  return format(date, 'h:mm a', { locale: enUS });
}

export function formatShortDate(date: Date): string {
  return format(date, 'MMM d', { locale: enUS });
}

export function formatLongDate(date: Date): string {
  return format(date, 'MMMM d, yyyy', { locale: enUS });
}

export function formatWeekday(date: Date): string {
  return format(date, 'EEEE', { locale: enUS });
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: enUS });
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return formatDate(date);
}