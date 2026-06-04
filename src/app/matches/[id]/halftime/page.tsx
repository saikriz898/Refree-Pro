'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MatchTimer } from '@/lib/timer';
import { Scoreboard } from '@/components/match/Scoreboard';
import { EventItem } from '@/components/match/EventItem';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Pause, Play } from 'lucide-react';

export default function HalftimePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState('');
  const [match, setMatch] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [remainingMs, setRemainingMs] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const rafRef = useRef<number | undefined>(undefined);
  const lastTickRef = useRef(Date.now());
  const isRunningRef = useRef(true);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    isRunningRef.current = !isRunning;
  };

  useEffect(() => {
    params.then(async ({ id }) => {
      setId(id);
      const [matchRes, eventsRes] = await Promise.all([
        fetch(`/api/matches/${id}`),
        fetch(`/api/matches/${id}/events`),
      ]);
      const d = await matchRes.json();
      setMatch(d.match);
      setEvents(await eventsRes.json());
      const breakSecs = d.match.breakDuration * 60 * 1000;
      setRemainingMs(breakSecs);
      lastTickRef.current = Date.now();

      const tick = () => {
        const now = Date.now();
        if (isRunningRef.current) {
          const delta = now - lastTickRef.current;
          setRemainingMs(prev => Math.max(0, prev - delta));
        }
        lastTickRef.current = now;
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    });
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [params]);

  const handleStartSecondHalf = async () => {
    setLoading(true);
    try {
      await fetch(`/api/matches/${id}/timer/second-half`, { method: 'POST' });
      router.push(`/matches/${id}/live`);
    } catch { toast('Failed', 'error'); setLoading(false); }
  };

  if (!match) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" /></div>;

  const activeEvents = events.filter(e => !e.isUndone);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 score-digit tracking-widest">HALF TIME</h1>

        <Scoreboard teamA={match.teamA} teamB={match.teamB}
          scoreA={match.scoreA ?? 0} scoreB={match.scoreB ?? 0}
          teamAColor={match.teamAColor} teamBColor={match.teamBColor} />

        {/* Break timer */}
        <div className="glass-heavy rounded-2xl p-6 text-center mb-6">
          <p className="text-xs text-muted tracking-widest mb-2">BREAK ENDS IN</p>
          <span className={`timer-display text-5xl font-bold ${remainingMs > 0 ? 'text-live' : 'text-yellow-card animate-pulse'}`}>
            {MatchTimer.formatDisplay(remainingMs)}
          </span>
          <div className="mt-4 flex justify-center">
            <Button variant="secondary" size="sm" onClick={toggleTimer} className="flex items-center gap-1">
              {isRunning ? <><Pause size={14} /> PAUSE</> : <><Play size={14} /> RESUME</>}
            </Button>
          </div>
          {remainingMs === 0 && <p className="text-yellow-card text-sm mt-4 font-semibold">BREAK OVER — Ready to start!</p>}
        </div>

        {/* First half summary */}
        <div className="glass rounded-xl p-4 mb-4">
          <p className="text-xs text-muted tracking-widest mb-3">FIRST HALF EVENTS</p>
          {activeEvents.length === 0 ? (
            <p className="text-muted/50 text-sm text-center py-4">No events in first half</p>
          ) : (
            <div className="space-y-1">
              {activeEvents.map((e) => {
                const type = e.eventType === 'goal' ? 'goal' : e.cardType === 'yellow' ? 'yellow' : e.cardType === 'red' ? 'red' : 'sub';
                const playerName = e.eventType === 'sub' ? `${e.playerOut} → ${e.playerIn}` : e.playerName;
                const extraInfo = e.eventType === 'goal' && e.goalType !== 'normal' ? ` (${e.goalType})` : '';
                return (
                  <EventItem
                    key={e.id}
                    minute={e.minute}
                    elapsedMs={e.elapsedMs}
                    type={type as any}
                    playerName={`${playerName}${extraInfo}`}
                    teamSide={e.team === 'team_a' ? 'home' : 'away'}
                  />
                );
              })}
            </div>
          )}
        </div>

        <Button className="w-full" size="xl" onClick={handleStartSecondHalf} loading={loading}>
          START SECOND HALF →
        </Button>
      </motion.div>
    </div>
  );
}
