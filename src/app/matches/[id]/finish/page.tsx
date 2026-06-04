'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Scoreboard } from '@/components/match/Scoreboard';
import { EventItem } from '@/components/match/EventItem';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export default function FinishPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState('');
  const [match, setMatch] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    params.then(async ({ id }) => {
      setId(id);
      const [mr, er] = await Promise.all([fetch(`/api/matches/${id}`), fetch(`/api/matches/${id}/events`)]);
      const d = await mr.json();
      setMatch(d.match);
      setEvents(await er.json());
    });
  }, [params]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await fetch(`/api/matches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', completedAt: new Date().toISOString() }),
      });
      await fetch(`/api/matches/${id}/timer/complete`, { method: 'POST' });
      if (match.tournamentId) {
        await fetch(`/api/tournaments/${match.tournamentId}/standings/recalculate`, { method: 'POST' });
      }
      toast('Match completed!');
      router.push(`/matches/${id}/lock`);
    } catch { toast('Failed', 'error'); setLoading(false); }
  };

  if (!match) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" /></div>;

  const activeEvents = events.filter(e => !e.isUndone);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
        <h1 className="text-5xl font-bold text-center score-digit mb-6">FULL TIME</h1>

        <Card className="mb-4">
          <Scoreboard teamA={match.teamA} teamB={match.teamB}
            scoreA={match.scoreA ?? 0} scoreB={match.scoreB ?? 0}
            teamAColor={match.teamAColor} teamBColor={match.teamBColor} />
        </Card>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="text-center p-3">
            <p className="text-xl font-bold">{activeEvents.filter(e => e.eventType === 'goal').length}</p>
            <p className="text-xs text-muted">Goals</p>
          </Card>
          <Card className="text-center p-3">
            <p className="text-xl font-bold text-yellow-card">{activeEvents.filter(e => e.cardType === 'yellow').length}</p>
            <p className="text-xs text-muted">Yellow</p>
          </Card>
          <Card className="text-center p-3">
            <p className="text-xl font-bold text-red-card">{activeEvents.filter(e => e.cardType === 'red').length}</p>
            <p className="text-xs text-muted">Red</p>
          </Card>
        </div>

        {activeEvents.length > 0 && (
          <Card className="mb-6 p-4">
            <p className="text-xs text-muted tracking-widest mb-3">EVENT TIMELINE</p>
            <div className="space-y-1">
              {activeEvents.map(e => {
                const type = e.eventType === 'goal' ? 'goal' : e.cardType === 'yellow' ? 'yellow' : e.cardType === 'red' ? 'red' : 'sub';
                const playerName = e.eventType === 'sub' ? `${e.playerOut} → ${e.playerIn}` : e.playerName;
                const extraInfo = e.eventType === 'goal' && e.goalType !== 'normal' ? ` (${e.goalType})` : '';
                return (
                  <EventItem key={e.id} minute={e.minute}
                    type={type}
                    playerName={`${playerName}${extraInfo}`}
                    teamSide={e.team === 'team_a' ? 'home' : 'away'}
                  />
                );
              })}
            </div>
          </Card>
        )}

        <Button className="w-full" size="xl" onClick={handleConfirm} loading={loading}>
          CONFIRM FULL TIME ✓
        </Button>
      </motion.div>
    </div>
  );
}
