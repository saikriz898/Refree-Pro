'use client';

import { useEffect, useState } from 'react';
import { useToast } from './ui/Toast';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initial check
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
      toast('You are currently offline. Some features may be unavailable.', 'error');
    }

    const handleOnline = () => {
      setIsOffline(false);
      toast('Back online! Your connection has been restored.', 'success');
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast('You are offline. Changes will be synced when you reconnect.', 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // We can also render a persistent banner if we want, but for now we just use the toast
  return null;
}
