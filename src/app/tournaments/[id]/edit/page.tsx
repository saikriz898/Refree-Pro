'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { MapPin } from 'lucide-react';

export default function EditTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const isInvalidEndDate = startDate && endDate && endDate < startDate;
  const valid = name && venue && startDate && endDate && !isInvalidEndDate;

  useEffect(() => {
    params.then(async ({ id }) => {
      setId(id);
      const res = await fetch(`/api/tournaments/${id}`);
      const d = await res.json();
      const t = d.tournament;
      setName(t.name); setVenue(t.venue); setStartDate(t.startDate); setEndDate(t.endDate);
    });
  }, [params]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch(`/api/tournaments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, venue, startDate, endDate }),
      });
      toast('Tournament updated!');
      router.push(`/tournaments/${id}`);
    } catch { toast('Failed', 'error'); setLoading(false); }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-6">Edit Tournament</h1>
        <Card className="p-6 space-y-4">
          <Input label="Tournament Name" value={name} onChange={e => setName(e.target.value)} />
          <Input label="Venue" icon={<MapPin size={15} />} value={venue} onChange={e => setVenue(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={startDate} onChange={e => {
              setStartDate(e.target.value);
              if (endDate && e.target.value > endDate) setEndDate(e.target.value);
            }} />
            <Input label="End Date" type="date" min={startDate} value={endDate} onChange={e => setEndDate(e.target.value)} error={isInvalidEndDate ? "Must be after start date" : undefined} />
          </div>
        </Card>
        <div className="flex gap-3 mt-6">
          <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave} disabled={!valid} loading={loading}>Save Changes</Button>
        </div>
      </motion.div>
    </div>
  );
}
