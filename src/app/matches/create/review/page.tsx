'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateMatch } from '../CreateMatchContext';
import { CreateMatchStepper } from '../CreateMatchStepper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { MapPin, Hash, Calendar, Clock, User, Trophy, Timer, Coffee, Plus, Layers, Sparkles, Ticket } from 'lucide-react';
import dynamic from 'next/dynamic';

const FootballModel = dynamic(() => import('@/components/3d/FootballModel').then(m => ({ default: m.FootballModel })), { ssr: false });

const JerseyIcon = ({ color }: { color: string }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill={color} stroke="var(--color-foreground)" strokeWidth="1.5" strokeOpacity="0.2" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
    <path d="M6 3L8 5C9 4 10 3.5 12 3.5C14 3.5 15 4 16 5L18 3C19 3 20 4 20 5V10H17V21H7V10H4V5C4 4 5 3 6 3Z" />
  </svg>
);

export default function ReviewPage() {
  const { state, reset } = useCreateMatch();
  const [loading, setLoading] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (createdSuccess) {
      const timer = setTimeout(() => {
        reset();
        router.push('/matches');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [createdSuccess, reset, router]);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId: state.tournamentId && state.tournamentId.trim() !== '' ? state.tournamentId : null,
          venue: state.venue,
          matchNumber: parseInt(state.matchNumber),
          matchDate: state.matchDate,
          matchTime: state.matchTime,
          refereeName: state.refereeName || null,
          teamA: state.teamA,
          teamB: state.teamB,
          teamAColor: state.teamAColor,
          teamBColor: state.teamBColor,
          squadFormat: state.squadFormat,
          matchDuration: state.matchDuration,
          breakDuration: state.breakDuration,
          extraTime: state.extraTime,
          players: state.players.filter(p => p.name),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const detail = data?.detail || data?.error || 'Unknown error';
        toast(`Failed: ${detail}`, 'error');
        return;
      }

      setCreatedSuccess(true);
    } catch (e) {
      toast(`Error: ${e instanceof Error ? e.message : 'Network error'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const rows = [
    { label: 'Venue', value: state.venue, icon: MapPin },
    { label: 'Match', value: state.matchNumber, icon: Ticket },
    { label: 'Date', value: state.matchDate, icon: Calendar },
    { label: 'Time', value: state.matchTime, icon: Clock },
    { label: 'Format', value: state.squadFormat, icon: Layers },
    { label: 'Duration', value: `${state.matchDuration} min/half`, icon: Timer },
    { label: 'Break', value: `${state.breakDuration} min`, icon: Coffee },
    { label: 'Extra Time', value: state.extraTime ? `${state.extraTime} min` : 'None', icon: Plus },
    { label: 'Referee', value: state.refereeName || 'Not assigned', icon: User },
  ];

  return (
    <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-lg flex flex-col justify-between overflow-hidden bg-background border-x border-border/5">
      {/* Header (Sticky / Apple style) */}
      <div className="bg-background/85 backdrop-blur-md border-b border-border/10 px-4 py-3.5 flex flex-col gap-0.5 sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-1.5 -ml-1">
          <button onClick={() => router.push('/matches/create/config')} className="flex items-center gap-0.5 text-[#007AFF] hover:opacity-75 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            <span className="text-sm font-semibold">Back</span>
          </button>
          <span className="text-muted/20 font-light select-none">|</span>
          <h1 className="text-base font-bold text-foreground select-none">Create Match</h1>
        </div>
        <p className="text-[10px] font-bold text-primary tracking-widest uppercase ml-1 select-none">STEP 4 OF 4 — REVIEW</p>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <CreateMatchStepper current={3} />

        {/* Scoreboard VS Card */}
        <Card className="p-4 relative overflow-hidden shadow-md border border-border/40 bg-gradient-to-br from-card to-card/50">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between gap-3">
            {/* Team A */}
            <div className="flex flex-col items-center flex-1 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-center mb-2 shadow-inner">
                <JerseyIcon color={state.teamAColor} />
              </div>
              <span 
                className={`font-extrabold text-sm tracking-tight truncate max-w-full ${(state.teamAColor === '#F8F9F9' || state.teamAColor === '#1A1D20') ? 'px-2 py-0.5 rounded-md' : 'w-full'}`} 
                style={{ 
                  color: state.teamAColor,
                  backgroundColor: state.teamAColor === '#F8F9F9' ? '#1A1D20' : state.teamAColor === '#1A1D20' ? '#F8F9F9' : 'transparent'
                }}>
                {state.teamA || 'TEAM A'}
              </span>
            </div>

            {/* VS Badge */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shadow-sm select-none">
                VS
              </div>
            </div>

            {/* Team B */}
            <div className="flex flex-col items-center flex-1 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-center mb-2 shadow-inner">
                <JerseyIcon color={state.teamBColor} />
              </div>
              <span 
                className={`font-extrabold text-sm tracking-tight truncate max-w-full ${(state.teamBColor === '#F8F9F9' || state.teamBColor === '#1A1D20') ? 'px-2 py-0.5 rounded-md' : 'w-full'}`} 
                style={{ 
                  color: state.teamBColor,
                  backgroundColor: state.teamBColor === '#F8F9F9' ? '#1A1D20' : state.teamBColor === '#1A1D20' ? '#F8F9F9' : 'transparent'
                }}>
                {state.teamB || 'TEAM B'}
              </span>
            </div>
          </div>
        </Card>

        {/* Details Card */}
        <Card className="p-4 shadow-sm border border-border/40">
          <div className="pb-3 border-b border-border/10 mb-3">
            <span className="text-[9px] uppercase font-bold text-muted tracking-widest select-none">Match Details</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {rows.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-muted/50 border border-border/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={14} className="text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-muted leading-none block mb-0.5">{label}</span>
                  <span className="text-xs font-bold text-foreground truncate block">{value || '—'}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Squad Selection Lineup */}
        {state.players.filter(p => p.name).length > 0 && (
          <Card className="p-4 shadow-sm border border-border/40">
            <div className="pb-3 border-b border-border/10 mb-3">
              <span className="text-[9px] uppercase font-bold text-muted tracking-widest select-none">Squads Lineup</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Team A Squad */}
              <div className="space-y-1.5 border-r border-border/10 pr-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: state.teamAColor }} />
                  <span 
                    className={`text-[10px] font-bold tracking-wide truncate block ${(state.teamAColor === '#F8F9F9' || state.teamAColor === '#1A1D20') ? 'px-1.5 py-0.5 rounded-sm inline-block' : ''}`} 
                    style={{ 
                      color: state.teamAColor,
                      backgroundColor: state.teamAColor === '#F8F9F9' ? '#1A1D20' : state.teamAColor === '#1A1D20' ? '#F8F9F9' : 'transparent'
                    }}>
                    {state.teamA || 'TEAM A'}
                  </span>
                </div>
                {state.players.filter(p => p.name && p.team === 'team_a').length === 0 ? (
                  <span className="text-[11px] text-muted italic">No players added</span>
                ) : (
                  state.players.filter(p => p.name && p.team === 'team_a').map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 shadow-sm"
                        style={{ 
                          backgroundColor: state.teamAColor,
                          color: state.teamAColor === '#F8F9F9' || state.teamAColor === '#F1C40F' ? '#1A1D20' : '#FFF'
                        }}
                      >
                        {p.jerseyNo ?? '—'}
                      </span>
                      <span className="text-foreground font-semibold truncate">{p.name}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Team B Squad */}
              <div className="space-y-1.5 pl-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: state.teamBColor }} />
                  <span 
                    className={`text-[10px] font-bold tracking-wide truncate block ${(state.teamBColor === '#F8F9F9' || state.teamBColor === '#1A1D20') ? 'px-1.5 py-0.5 rounded-sm inline-block' : ''}`} 
                    style={{ 
                      color: state.teamBColor,
                      backgroundColor: state.teamBColor === '#F8F9F9' ? '#1A1D20' : state.teamBColor === '#1A1D20' ? '#F8F9F9' : 'transparent'
                    }}>
                    {state.teamB || 'TEAM B'}
                  </span>
                </div>
                {state.players.filter(p => p.name && p.team === 'team_b').length === 0 ? (
                  <span className="text-[11px] text-muted italic">No players added</span>
                ) : (
                  state.players.filter(p => p.name && p.team === 'team_b').map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 shadow-sm"
                        style={{ 
                          backgroundColor: state.teamBColor,
                          color: state.teamBColor === '#F8F9F9' || state.teamBColor === '#F1C40F' ? '#1A1D20' : '#FFF'
                        }}
                      >
                        {p.jerseyNo ?? '—'}
                      </span>
                      <span className="text-foreground font-semibold truncate">{p.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="bg-background/85 backdrop-blur-md border-t border-border/10 px-4 py-4 flex gap-3 sticky bottom-0 z-40 shrink-0 pb-safe">
        <Button 
          variant="ghost" 
          className="w-1/3 font-semibold text-muted-foreground hover:bg-foreground/5" 
          onClick={() => router.back()}
        >
          ← Back
        </Button>
        <Button 
          className="flex-1 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow text-[15px] font-bold whitespace-nowrap flex items-center justify-center gap-1" 
          onClick={handleCreate} 
          loading={loading}
        >
          Create Match →
        </Button>
      </div>

      {/* 3D Celebration Success Overlay */}
      <AnimatePresence>
        {createdSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md"
          >
            {/* Ambient Background Radial Lights */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.15, 0.25, 0.15],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-96 h-96 rounded-full bg-primary/20 blur-[120px]"
              />
            </div>

            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="relative z-10 flex flex-col items-center text-center px-6"
            >
              {/* Spinning 3D Football Model */}
              <div className="mb-4">
                <FootballModel size={240} />
              </div>

              {/* Sparkles / Success Icon */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20"
              >
                <Sparkles size={20} className="text-primary animate-pulse" />
              </motion.div>

              <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
                Match Created Successfully
              </h2>
              <p className="text-muted text-sm max-w-xs leading-relaxed mb-6 font-medium">
                Your new match is set up and ready. Redirecting you back to the Match Hub...
              </p>

              {/* Progress Indicator */}
              <div className="w-48 h-1 bg-muted rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.8, ease: "linear" }}
                  className="h-full bg-primary"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
