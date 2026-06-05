'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCreateMatch } from '../CreateMatchContext';
import { CreateMatchStepper } from '../CreateMatchStepper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MapPin, Hash, Calendar, Clock, User, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select } from '@/components/ui/Select';

export default function DetailsPage() {
  const { state, update } = useCreateMatch();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [existingMatches, setExistingMatches] = useState<any[]>([]);
  const router = useRouter();

  const getOffsetDateStr = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  };

  const todayStr = getOffsetDateStr(0);
  const tomorrowStr = getOffsetDateStr(1);
  const dayAfterTomorrowStr = getOffsetDateStr(2);

  // Store the exact current time at the moment page loads so the ticking clock doesn't invalidate form state
  const pageLoadTimeRef = useRef<string | null>(null);
  if (!pageLoadTimeRef.current) {
    pageLoadTimeRef.current = new Date().toTimeString().slice(0, 5);
  }
  const pageLoadTime = pageLoadTimeRef.current;

  useEffect(() => {
    fetch('/api/tournaments').then(r => r.json()).then(d => {
      setTournaments(Array.isArray(d) ? d : []);

      const urlParams = new URLSearchParams(window.location.search);
      const queryTourneyId = urlParams.get('tournamentId');
      if (queryTourneyId) {
        update({ tournamentId: queryTourneyId });
      }
    });

    fetch('/api/matches').then(r => r.json()).then(d => {
      const fetchedMatches = Array.isArray(d) ? d : [];
      setExistingMatches(fetchedMatches);
      
      if (!state.matchNumber) {
        const highest = fetchedMatches.reduce((max, m) => Math.max(max, m.matchNumber || 0), 0);
        update({ matchNumber: String(highest + 1) });
      }
    });

    let initialDate = state.matchDate;
    if (!initialDate || initialDate < todayStr) {
      initialDate = todayStr;
      update({ matchDate: todayStr });
    }

    // Set default time to exact current time on page load
    if (!state.matchTime) {
      update({ matchTime: pageLoadTime });
    } else if (initialDate === todayStr && state.matchTime < pageLoadTime) {
      update({ matchTime: pageLoadTime });
    }
  }, []);

  const setQuickDate = (offset: number) => {
    const dateStr = getOffsetDateStr(offset);
    update({ matchDate: dateStr });
    if (offset === 0 && state.matchTime && state.matchTime < pageLoadTime) {
      update({ matchTime: pageLoadTime });
    }
  };

  const isPastDate = state.matchDate && state.matchDate < todayStr;
  const dateError = isPastDate ? "Date cannot be in the past" : undefined;

  const isPastTime = state.matchDate === todayStr && state.matchTime && state.matchTime < pageLoadTime;
  const timeError = isPastTime ? "Time cannot be in the past" : undefined;

  const isConflict = !!(state.matchDate && state.matchTime && state.venue && existingMatches.some(m => {
    const dbDate = m.matchDate;
    const dbTime = m.matchTime?.slice(0, 5);
    const dbVenue = m.venue?.toLowerCase().trim();
    const currentVenue = state.venue?.toLowerCase().trim();
    return dbDate === state.matchDate && dbTime === state.matchTime && dbVenue === currentVenue;
  }));

  const valid = state.venue && state.matchNumber && state.matchDate && state.matchTime &&
    !dateError && !timeError && !isConflict;

  return (
    <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-lg flex flex-col justify-between overflow-hidden bg-background border-x border-border/5">
      {/* Header (Sticky / Apple style) */}
      <div className="bg-background/85 backdrop-blur-md border-b border-border/10 px-4 py-3.5 flex flex-col gap-0.5 sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-1.5 -ml-1">
          <button onClick={() => router.push('/matches')} className="flex items-center gap-0.5 text-[#007AFF] hover:opacity-75 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            <span className="text-sm font-semibold">Back</span>
          </button>
          <span className="text-muted/20 font-light select-none">|</span>
          <h1 className="text-base font-bold text-foreground select-none">Create Match</h1>
        </div>
        <p className="text-[10px] font-bold text-primary tracking-widest uppercase ml-1 select-none">STEP 1 OF 4 — DETAILS</p>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-5">
        <CreateMatchStepper current={0} />

        <div className="space-y-4 pt-1">
          {/* Tournament Row */}
          <Select
            label="Tournament (optional)"
            value={state.tournamentId || ''}
            onChange={(val) => update({ tournamentId: val })}
            options={[
              { value: '', label: 'No Tournament' },
              ...tournaments.map((t) => ({ value: t.id, label: t.name })),
            ]}
            placeholder="No Tournament"
            icon={<Trophy size={16} />}
          />

          {/* Venue & Match Number Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input label="Venue" icon={<MapPin size={16} />} value={state.venue}
                onChange={(e) => update({ venue: e.target.value })} placeholder="Enter venue name..." />
            </div>
            <div>
              <Input label="Match Number" type="number" value={state.matchNumber}
                onChange={(e) => update({ matchNumber: e.target.value })} placeholder="e.g. 1" />
            </div>
          </div>

          {/* Match Date Selector (Full Input Bar + Presets Below) */}
          <div className="space-y-2">
            <Input
              label="Match Date"
              icon={<Calendar size={16} />}
              type="date"
              min={todayStr}
              value={state.matchDate || ''}
              onChange={(e) => {
                const val = e.target.value;
                update({ matchDate: val });
                if (val === todayStr && state.matchTime && state.matchTime < pageLoadTime) {
                  update({ matchTime: pageLoadTime });
                }
              }}
              error={dateError}
            />

            {/* Quick date presets */}
            <div className="flex flex-wrap gap-2 mt-1 ml-0.5">
              {[
                { offset: 0, label: 'Today', dateStr: todayStr },
                { offset: 1, label: 'Tomorrow', dateStr: tomorrowStr },
                { offset: 2, label: 'Day After Tomorrow', dateStr: dayAfterTomorrowStr }
              ].map(({ offset, label, dateStr }) => {
                const isSelected = state.matchDate === dateStr;
                return (
                  <button
                    key={offset}
                    type="button"
                    onClick={() => setQuickDate(offset)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer font-semibold select-none",
                      isSelected
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-background border-border text-muted hover:text-foreground hover:border-foreground/30"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Match Time & Referee Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                label="Match Time"
                icon={<Clock size={16} />}
                type="time"
                min={state.matchDate === todayStr ? pageLoadTime : undefined}
                value={state.matchTime || ''}
                onChange={(e) => update({ matchTime: e.target.value })}
                error={timeError}
              />
            </div>
            <div>
              <Input
                label="Referee Name"
                icon={<User size={16} />}
                value={state.refereeName}
                onChange={(e) => update({ refereeName: e.target.value })}
                placeholder="Optional referee name"
              />
            </div>
          </div>

          {/* Slot booking conflict notification */}
          {isConflict && (
            <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0 animate-pulse" />
              <span>This time slot at the selected venue is already booked. Please choose a different venue, date, or time.</span>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Footer */}
      <div className="bg-background/85 backdrop-blur-md border-t border-border/10 px-4 py-4 flex gap-3 sticky bottom-0 z-40 shrink-0 pb-safe">
        <Button 
          variant="ghost" 
          className="w-1/3 font-semibold text-muted-foreground hover:bg-foreground/5" 
          onClick={() => router.push('/matches')}
        >
          Cancel
        </Button>
        <Button 
          className="flex-1 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow text-[15px] font-bold" 
          disabled={!valid} 
          onClick={() => router.push('/matches/create/teams')}
        >
          {valid ? 'Next Step →' : 'Fill Required Fields'}
        </Button>
      </div>
    </div>
  );
}
