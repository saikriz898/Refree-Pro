'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { FileText } from 'lucide-react';

export default function ReportsPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    Promise.all([fetch('/api/matches').then(r => r.json()), fetch('/api/tournaments').then(r => r.json())])
      .then(([m, t]) => {
        setMatches(Array.isArray(m) ? m.filter((x: any) => x.status === 'completed') : []);
        setTournaments(Array.isArray(t) ? t : []);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-foreground/10 transition-colors border border-border/50 text-foreground shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="text-2xl font-bold">Reports</h1>
        </div>

        {loading ? <SkeletonCard /> : (
          <>
            <h2 className="text-xs text-muted tracking-widest mb-3">MATCH REPORTS</h2>
            <div className="space-y-2 mb-8">
              {matches.length === 0 ? <p className="text-muted/50 text-sm">No completed matches</p> :
                matches.map(m => (
                  <div key={m.id} className="glass rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{m.teamA} vs {m.teamB}</p>
                      <p className="text-xs text-muted">{m.matchDate} · Match {m.matchNumber}</p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => router.push(`/matches/${m.id}/report`)}>
                      <FileText size={14} /> PDF
                    </Button>
                  </div>
                ))}
            </div>

            <h2 className="text-xs text-muted tracking-widest mb-3">TOURNAMENT REPORTS</h2>
            <div className="space-y-2">
              {tournaments.length === 0 ? <p className="text-muted/50 text-sm">No tournaments</p> :
                tournaments.map(t => (
                  <div key={t.id} className="glass rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted">{t.venue}</p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => router.push(`/tournaments/${t.id}/report`)}>
                      <FileText size={14} /> PDF
                    </Button>
                  </div>
                ))}
            </div>
          </>
        )}
      </motion.div>
    </AppLayout>
  );
}
