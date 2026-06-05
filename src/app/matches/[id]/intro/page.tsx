'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { MapPin, Calendar, User, Shield } from 'lucide-react';

export default function IntroPage({ params }: { params: Promise<{ id: string }> }) {
  const [match, setMatch] = useState<any>(null);
  const [id, setId] = useState('');
  const router = useRouter();

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetch(`/api/matches/${id}`).then(r => r.json()).then(d => setMatch(d.match));
    });
  }, [params]);

  if (!match) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" />
    </div>
  );

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, #0F8A5F 0, #0F8A5F 1px, transparent 0, transparent 50%)', backgroundSize: '100% 40px' }} />
      </div>

      <motion.div
        variants={container} initial="hidden" animate="show"
        className="relative z-10 text-center max-w-lg px-6"
      >
        <motion.p variants={item} className="text-xs text-muted tracking-[0.3em] mb-2">
          {match.tournamentId ? 'TOURNAMENT MATCH' : 'FRIENDLY'}
        </motion.p>
        <motion.div variants={item} className="flex items-center justify-center gap-2 text-xs text-muted mb-8">
          <MapPin size={12} />{match.venue}
          <span>·</span>
          <Calendar size={12} />{match.matchDate}
        </motion.div>

        <motion.div variants={item} className="flex items-center justify-center gap-6 mb-8">
          <span className="text-3xl md:text-5xl font-bold" style={{ color: match.teamAColor }}>{match.teamA}</span>
          <span className="text-muted/50 text-xl font-light">vs</span>
          <span className="text-3xl md:text-5xl font-bold" style={{ color: match.teamBColor }}>{match.teamB}</span>
        </motion.div>

        <motion.div variants={item} className="glass rounded-xl px-6 py-3 inline-flex items-center gap-4 mb-8 text-sm text-muted hover:text-foreground">
          <span>Match {match.matchNumber}</span>
          <span>·</span>
          <span>{match.squadFormat}</span>
          <span>·</span>
          <span>{match.matchDuration} min</span>
        </motion.div>

        {match.refereeName && (
          <motion.div variants={item} className="flex items-center justify-center gap-2 text-sm text-muted mb-8">
            <Shield size={14} className="text-primary" />
            Referee: {match.refereeName}
          </motion.div>
        )}

        <motion.div variants={item}>
          <div className="w-24 h-px bg-primary/30 mx-auto mb-8" />
          <Button size="xl" onClick={() => router.push(`/matches/${id}/countdown`)} className="w-full">
            START KICK OFF COUNTDOWN →
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
