'use client';
import { useEffect } from 'react';
import { ensureTables } from '@/db';

export function AutoMigrate() {
  useEffect(() => {
    const key = 'referee_pro_migrated';
    if (sessionStorage.getItem(key)) return;

    // Use fetch for migration (works in dev and prod)
    fetch('/api/migrate', {
      method: 'POST',
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          sessionStorage.setItem(key, '1');
        }
      })
      .catch(err => {
        console.error('Migration failed', err);
        // Don't block startup
      });
  }, []);

  return null;
}
