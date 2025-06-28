/**
 * Utility to add a delay to async functions (for API simulation)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format a date string into a readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Format a date string to relative time (e.g., "2 hours ago")
 */
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + ' years ago';
  }
  
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months ago';
  }
  
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days ago';
  }
  
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours ago';
  }
  
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes ago';
  }
  
  return Math.floor(seconds) + ' seconds ago';
}

/**
 * Utility to truncate text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Generate a readable status label from device status
 */
export function getStatusLabel(status: string): string {
  switch (status) {
    case 'online':
      return 'Online';
    case 'offline':
      return 'Offline';
    case 'warning':
      return 'Warning';
    case 'error':
      return 'Critical';
    default:
      return 'Unknown';
  }
}

/**
 * Get status color classes for different statuses
 */
export function getStatusColorClass(status: string): string {
  switch (status) {
    case 'online':
      return 'text-success-500 bg-success-100 dark:bg-success-900/30';
    case 'offline':
      return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
    case 'warning':
      return 'text-warning-500 bg-warning-100 dark:bg-warning-900/30';
    case 'error':
      return 'text-error-500 bg-error-100 dark:bg-error-900/30';
    default:
      return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
  }
}

/**
 * Generate appropriate icon name based on device type
 */
export function getDeviceIconName(type: string): string {
  switch (type) {
    case 'waterTank':
      return 'Droplets';
    case 'dustbin':
      return 'Trash2';
    default:
      return 'Device';
  }
}