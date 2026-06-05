'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { MapPin, Trophy, Calendar, Sparkles } from 'lucide-react';

export default function CreateTournamentPage() {
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCreate = async () => {
    if (!name || !venue || !startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, venue, startDate, endDate }),
      });
      if (!res.ok) throw new Error();
      const t = await res.json();
      toast('Tournament created successfully! 🎉');
      router.push(`/tournaments/${t.id}`);
    } catch { toast('Failed to create tournament', 'error'); setLoading(false); }
  };

  const isPastStartDate = startDate && startDate < todayStr;
  const isInvalidEndDate = startDate && endDate && endDate < startDate;

  const valid = name && venue && startDate && endDate && !isPastStartDate && !isInvalidEndDate;

  return (
    <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-lg flex flex-col justify-between overflow-hidden bg-background border-x border-border/5">
      {/* Header */}
      <div className="bg-background/85 backdrop-blur-md border-b border-border/10 px-4 py-3.5 flex flex-col gap-0.5 sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-1.5 -ml-1">
          <button onClick={() => router.back()} className="flex items-center gap-0.5 text-[#007AFF] hover:opacity-75 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            <span className="text-sm font-semibold">Back</span>
          </button>
          <span className="text-muted/20 font-light select-none">|</span>
          <h1 className="text-base font-bold text-foreground select-none">Tournaments</h1>
        </div>
        <p className="text-[10px] font-bold text-primary tracking-widest uppercase ml-1 select-none">NEW EVENT</p>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col relative min-h-0">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="flex flex-col items-center text-center mb-4 relative z-10 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mb-2.5 relative shadow-[0_0_30px_rgba(0,230,118,0.15)]">
            <Trophy size={20} className="text-primary relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" />
            <Sparkles size={10} className="text-primary/60 absolute top-1.5 right-1.5" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-foreground">Create Tournament</h2>
          <p className="text-xs text-muted mt-1 font-medium max-w-[260px] leading-snug">Set up the foundational details for your upcoming sports event.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }} className="relative z-10 w-full shrink-0">
          <Card className="p-1 glass shadow-lg border border-border/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
            <div className="bg-background/40 backdrop-blur-md rounded-xl p-3.5 space-y-3.5">
              <div className="pb-1 border-b border-border/10">
                <span className="text-[9px] uppercase font-bold text-muted tracking-widest select-none flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Event Details
                </span>
              </div>

              <div className="space-y-3">
                <Input 
                  label="Tournament Name" 
                  icon={<Trophy size={14} />} 
                  value={name}
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Summer Cup 2026" 
                />

                <Input 
                  label="Venue / Location" 
                  icon={<MapPin size={14} />} 
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)} 
                  placeholder="e.g. National Stadium" 
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input 
                      label="Start Date" 
                      icon={<Calendar size={14} />} 
                      type="date" 
                      min={todayStr}
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (endDate && e.target.value > endDate) {
                          setEndDate(e.target.value);
                        }
                      }} 
                      error={isPastStartDate ? "Cannot be in past" : undefined}
                    />
                  </div>
                  <div>
                    <Input 
                      label="End Date" 
                      icon={<Calendar size={14} />} 
                      type="date" 
                      min={startDate || todayStr}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)} 
                      error={isInvalidEndDate ? "Must be after start date" : undefined}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Sticky Bottom Footer */}
      <div className="bg-background/85 backdrop-blur-md border-t border-border/10 px-4 py-4 flex gap-3 sticky bottom-0 z-40 shrink-0 pb-safe">
        <Button 
          variant="ghost" 
          className="w-1/3 font-semibold" 
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button 
          className="flex-1 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow" 
          disabled={!valid} 
          loading={loading}
          onClick={handleCreate}
        >
          {!valid ? 'Fill Required Fields' : 'Initialize Tournament →'}
        </Button>
      </div>
    </div>
  );
}
