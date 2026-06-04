'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Scoreboard } from '@/components/match/Scoreboard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { CheckCircle, FileText, Image, Eye } from 'lucide-react';

export default function LockPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState('');
  const [match, setMatch] = useState<any>(null);
  const [locked, setLocked] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetch(`/api/matches/${id}`).then(r => r.json()).then(d => {
        setMatch(d.match);
        setLocked(d.match.isLocked);
      });
    });
  }, [params]);

  const handleLock = async () => {
    await fetch(`/api/matches/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isLocked: true }),
    });
    setLocked(true);
    toast('Match locked ✓');
  };

  if (!match) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
      <button 
        onClick={() => router.push('/matches')} 
        className="absolute top-4 left-4 md:top-8 md:left-8 w-10 h-10 flex items-center justify-center rounded-full hover:bg-foreground/10 transition-colors border border-border/50 text-foreground z-10"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
          className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={32} className="text-primary" />
        </motion.div>

        <h1 className="text-3xl font-bold text-center mb-2">MATCH COMPLETE</h1>
        <p className="text-center text-muted text-sm mb-6">All data saved to database ✓</p>

        <Card className="mb-4">
          <Scoreboard teamA={match.teamA} teamB={match.teamB}
            scoreA={match.scoreA ?? 0} scoreB={match.scoreB ?? 0}
            teamAColor={match.teamAColor} teamBColor={match.teamBColor} />
          <div className="pt-2 border-t border-border/50 mt-2 text-xs text-muted flex gap-4 justify-center">
            <span>{match.venue}</span>
            <span>{match.matchDate}</span>
            {match.refereeName && <span>Ref: {match.refereeName}</span>}
          </div>
        </Card>

        {!locked ? (
          <Button className="w-full mb-4" size="lg" onClick={handleLock}>
            🔒 LOCK MATCH
          </Button>
        ) : (
          <div className="glass rounded-xl p-3 text-center text-sm text-primary mb-4">🔒 Match is locked — read only</div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Button variant="secondary" className="flex flex-col items-center justify-center h-20 gap-2" onClick={() => router.push(`/matches/${id}/report`)}>
            <FileText size={20} /><span className="text-[11px] font-bold tracking-wide">PDF Report</span>
          </Button>
          <Button variant="secondary" className="flex flex-col items-center justify-center h-20 gap-2" onClick={() => router.push(`/matches/${id}/poster`)}>
            <Image size={20} /><span className="text-[11px] font-bold tracking-wide">Poster</span>
          </Button>
          <Button variant="secondary" className="flex flex-col items-center justify-center h-20 gap-2 bg-transparent border border-border/50 hover:bg-foreground/5 text-foreground" onClick={() => router.push(`/matches/${id}`)}>
            <Eye size={20} /><span className="text-[11px] font-bold tracking-wide">View</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
