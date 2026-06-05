'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Stepper } from '@/components/ui/Stepper';
import { useToast } from '@/components/ui/Toast';
import { MapPin, Hash, Calendar, Clock, User } from 'lucide-react';

export default function EditMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState('');
  const [match, setMatch] = useState<any>(null);
  const [venue, setVenue] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [refereeName, setRefereeName] = useState('');
  const [matchDuration, setMatchDuration] = useState(45);
  const [breakDuration, setBreakDuration] = useState(15);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    params.then(async ({ id }) => {
      setId(id);
      const res = await fetch(`/api/matches/${id}`);
      const d = await res.json();
      const m = d.match;
      setMatch(m);
      setVenue(m.venue); setMatchDate(m.matchDate); setMatchTime(m.matchTime);
      setRefereeName(m.refereeName ?? ''); setMatchDuration(m.matchDuration); setBreakDuration(m.breakDuration);
    });
  }, [params]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch(`/api/matches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venue, matchDate, matchTime, refereeName: refereeName || null, matchDuration, breakDuration }),
      });
      toast('Match updated!');
      router.push(`/matches/${id}`);
    } catch { toast('Failed', 'error'); setLoading(false); }
  };

  if (!match) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" /></div>;

  if (match.status !== 'scheduled') return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-white/60">
        <p className="text-lg font-semibold">Cannot edit</p>
        <p className="text-sm mt-1">Match is already {match.status}</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-2">Edit Match {match.matchNumber}</h1>
        <p className="text-white/40 text-sm mb-6">{match.teamA} vs {match.teamB}</p>

        <div className="space-y-4">
          <Input label="Venue" icon={<MapPin size={15} />} value={venue} onChange={e => setVenue(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Match Date" icon={<Calendar size={15} />} type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)} />
            <Input label="Match Time" icon={<Clock size={15} />} type="time" value={matchTime} onChange={e => setMatchTime(e.target.value)} />
          </div>
          <Input label="Referee Name" icon={<User size={15} />} value={refereeName} onChange={e => setRefereeName(e.target.value)} />

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div><p className="font-semibold text-sm">Match Duration</p><p className="text-xs text-white/40">Minutes per half</p></div>
              <Stepper value={matchDuration} onChange={setMatchDuration} min={1} max={120} />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-semibold text-sm">Break Duration</p><p className="text-xs text-white/40">Half-time break</p></div>
              <Stepper value={breakDuration} onChange={setBreakDuration} min={1} max={60} />
            </div>
          </Card>
        </div>

        <div className="flex gap-3 mt-8">
          <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave} loading={loading}>Save Changes</Button>
        </div>
      </motion.div>
    </div>
  );
}
