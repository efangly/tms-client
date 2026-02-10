import { format, parseISO } from 'date-fns';

/**
 * Format date to dd/MM/yyyy
 */
export const formatDate = (datetime: string | number | Date): string => {
  const date = typeof datetime === 'string' ? parseISO(datetime) : new Date(datetime);
  return format(date, 'dd/MM/yyyy');
};

/**
 * Format datetime to dd/MM/yyyy HH:mm:ss
 */
export const formatDateTime = (datetime: string | number | Date): string => {
  const date = typeof datetime === 'string' ? parseISO(datetime) : new Date(datetime);
  return format(date, 'dd/MM/yyyy HH:mm:ss');
};

/**
 * Format datetime for chart axis (dd/MM HH:mm)
 */
export const formatChartDateTime = (datetime: string | number | Date): string => {
  const date = typeof datetime === 'string' ? parseISO(datetime) : new Date(datetime);
  return format(date, 'dd/MM HH:mm');
};
