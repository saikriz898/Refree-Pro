'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatchStore } from '@/store/matchStore';
import { MatchTimer } from '@/lib/timer';
import { Scoreboard } from '@/components/match/Scoreboard';
import { StopwatchModel } from '@/components/3d/StopwatchModel';
import { QuickActions } from '@/components/match/QuickActions';
import { GoalModal } from '@/components/match/GoalModal';
import { CardModal } from '@/components/match/CardModal';
import { SubModal } from '@/components/match/SubModal';
import { EventItem } from '@/components/match/EventItem';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Pause, Play, Timer, CheckCircle, PanelRight } from 'lucide-react';

export default function LiveMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState('');
  const [match, setMatch] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [showGoal, setShowGoal] = useState(false);
  const [showYellow, setShowYellow] = useState(false);
  const [showRed, setShowRed] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showHalftimeModal, setShowHalftimeModal] = useState(false);

  const { timer, setTimer, tickTimer, setScore, scoreA, scoreB } = useMatchStore();
  const { toast } = useToast();
  const router = useRouter();
  const rafRef = useRef<number | undefined>(undefined);
  const [pendingElapsedMs, setPendingElapsedMs] = useState<number | null>(null);

  const getOffsetElapsedMs = () => {
    const offset = timer.currentHalf === 2
      ? (match?.matchDuration ?? 45) * 60 * 1000
      : timer.currentHalf === 3
      ? (match?.matchDuration ?? 45) * 2 * 60 * 1000
      : 0;
    return timer.elapsedMs + offset;
  };

  const triggerGoal = () => {
    setPendingElapsedMs(getOffsetElapsedMs());
    setShowGoal(true);
  };
  const triggerYellow = () => {
    setPendingElapsedMs(getOffsetElapsedMs());
    setShowYellow(true);
  };
  const triggerRed = () => {
    setPendingElapsedMs(getOffsetElapsedMs());
    setShowRed(true);
  };
  const triggerSub = () => {
    setPendingElapsedMs(getOffsetElapsedMs());
    setShowSub(true);
  };

  useEffect(() => {
    params.then(async ({ id: matchId }) => {
      setId(matchId);
      const [matchRes, eventsRes] = await Promise.all([
        fetch(`/api/matches/${matchId}`),
        fetch(`/api/matches/${matchId}/events`),
      ]);
      const matchData = await matchRes.json();
      const eventsData = await eventsRes.json();

      setMatch(matchData.match);
      setPlayers(matchData.players || []);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setScore(matchData.match.scoreA ?? 0, matchData.match.scoreB ?? 0);

      // Restore timer from DB
      if (matchData.timer) {
        const t = matchData.timer;
        const elapsed = t.isRunning
          ? MatchTimer.calculateElapsed(t.startedAtUnix, t.totalPausedMs, null, true)
          : MatchTimer.calculateElapsed(t.startedAtUnix, t.totalPausedMs, t.pausedAtUnix, false);
        setTimer({
          startedAtUnix: t.startedAtUnix,
          pausedAtUnix: t.pausedAtUnix,
          totalPausedMs: t.totalPausedMs,
          isRunning: t.isRunning,
          currentHalf: t.currentHalf ?? 1,
          elapsedMs: elapsed,
        });
        if (t.isRunning) toast('Resumed from saved state', 'info');
      } else {
        setTimer({
          startedAtUnix: null,
          pausedAtUnix: null,
          totalPausedMs: 0,
          isRunning: false,
          currentHalf: 1,
          elapsedMs: 0,
        });
      }
    });
  }, [params]);

  // RAF timer loop
  useEffect(() => {
    const tick = () => {
      tickTimer();
      rafRef.current = requestAnimationFrame(tick);
    };
    if (timer.isRunning) rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [timer.isRunning]);

  // Auto-pause timer when navigating away, hiding tab, or closing app
  useEffect(() => {
    if (!id || !timer.isRunning) return;

    const pauseTimer = () => {
      fetch(`/api/matches/${id}/timer/pause`, { method: 'POST', keepalive: true }).catch(() => {});
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        pauseTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', pauseTimer);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', pauseTimer);
      pauseTimer();
    };
  }, [id, timer.isRunning]);

  // Halftime / Fulltime auto-trigger
  useEffect(() => {
    if (!match || !timer.isRunning) return;
    const halfMs = match.matchDuration * 60 * 1000;
    if (timer.currentHalf === 1 && timer.elapsedMs >= halfMs) {
      setShowHalftimeModal(true);
    } else if (timer.currentHalf === 2 && timer.elapsedMs >= halfMs) {
      setShowEndModal(true);
    }
  }, [timer.elapsedMs, match, timer.currentHalf, timer.isRunning]);

  const currentMinute = timer.currentHalf === 2
    ? MatchTimer.getMinute(timer.elapsedMs + (match?.matchDuration ?? 45) * 60 * 1000)
    : timer.currentHalf === 3
    ? MatchTimer.getMinute(timer.elapsedMs + (match?.matchDuration ?? 45) * 2 * 60 * 1000)
    : MatchTimer.getMinute(timer.elapsedMs);

  const apiCall = useCallback(async (url: string, body: object) => {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error();
    return res.json();
  }, []);

  const handleGoal = async (data: any) => {
    try {
      const res = await apiCall(`/api/matches/${id}/goals`, data);
      setScore(res.scoreA, res.scoreB);
      setEvents(e => [...e, { ...res.goal, eventType: 'goal' }]);
      toast('⚽ Goal recorded!');
    } catch { toast('Failed to record goal', 'error'); }
  };

  const handleCard = async (data: any) => {
    try {
      const res = await apiCall(`/api/matches/${id}/cards`, data);
      setEvents(e => [...e, { ...res, eventType: 'card' }]);
      toast(`${data.cardType === 'yellow' ? '🟨' : '🟥'} Card issued`);
    } catch { toast('Failed to record card', 'error'); }
  };

  const handleSub = async (data: any) => {
    try {
      const res = await apiCall(`/api/matches/${id}/substitutions`, data);
      setEvents(e => [...e, { ...res, eventType: 'sub' }]);
      toast('🔄 Substitution recorded');
    } catch { toast('Failed to record substitution', 'error'); }
  };

  const handlePause = async () => {
    try {
      const currentlyRunning = timer.isRunning;
      const now = Date.now();
      
      // Optimistic update for instant UI feedback
      if (currentlyRunning) {
        setTimer({ isRunning: false, pausedAtUnix: now });
      } else {
        const additionalPaused = timer.pausedAtUnix ? now - timer.pausedAtUnix : 0;
        setTimer({
          isRunning: true,
          pausedAtUnix: null,
          totalPausedMs: timer.totalPausedMs + additionalPaused,
          startedAtUnix: timer.startedAtUnix || now,
        });
      }

      const endpoint = currentlyRunning ? 'pause' : 'start';
      const res = await fetch(`/api/matches/${id}/timer/${endpoint}`, { method: 'POST' });
      const t = await res.json();
      
      // Sync with exact server timestamps
      setTimer({ 
        isRunning: t.isRunning, 
        pausedAtUnix: t.pausedAtUnix, 
        totalPausedMs: t.totalPausedMs,
        startedAtUnix: t.startedAtUnix
      });
    } catch { toast('Timer error', 'error'); }
  };

  const handleHalftime = async () => {
    try {
      await fetch(`/api/matches/${id}/timer/halftime`, { method: 'POST' });
      router.push(`/matches/${id}/halftime`);
    } catch { toast('Failed', 'error'); }
  };

  const handleUndo = async () => {
    try {
      const res = await fetch(`/api/matches/${id}/undo`, { method: 'POST' });
      const data = await res.json();
      if (data.scoreA !== undefined) setScore(data.scoreA, data.scoreB);
      setEvents(evs => {
        const last = [...evs].reverse().find(e => !e.isUndone);
        if (!last) return evs;
        return evs.map(e => e.id === last.id ? { ...e, isUndone: true } : e);
      });
      toast('Event undone');
      setShowUndo(false);
    } catch { toast('Undo failed', 'error'); }
  };

  const renderTimeline = (evts: any[]) => (
    <div className="space-y-1">
      {[...evts].reverse().map((e, i) => {
        const type = e.eventType === 'goal' ? 'goal' : e.cardType ? 'card' : 'sub';
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
            isUndone={e.isUndone}
          />
        );
      })}
    </div>
  );

  if (!match) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top ribbon */}
      <div className="glass border-b border-border/50 px-4 py-2 flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push(`/matches/${id}`)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-foreground/10 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <span>{match.venue}</span>
        </div>
        <span className="flex items-center gap-2">
          {timer.isRunning && <span className="live-dot" />}
          Match #{match.matchNumber}
        </span>
        <span>{match.matchDate}</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop timeline */}
        <div className="hidden lg:flex flex-col w-72 border-r border-border/50 p-4 overflow-y-auto">
          <p className="text-xs text-muted tracking-widest mb-4">TIMELINE</p>
          {renderTimeline(events)}
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-y-auto lg:overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4 w-full max-w-2xl mx-auto pb-32 lg:pb-4">
            <Scoreboard
              teamA={match.teamA} teamB={match.teamB}
              scoreA={scoreA} scoreB={scoreB}
              teamAColor={match.teamAColor} teamBColor={match.teamBColor}
            />

            <StopwatchModel matchDuration={match?.matchDuration} size={280} />

            {/* Timer controls */}
            <div className="flex w-full max-w-sm gap-2 mt-2">
              <Button variant="secondary" onClick={handlePause} className="flex-1 flex items-center justify-center gap-1 px-0 text-sm">
                {timer.isRunning ? <><Pause size={16} /> PAUSE</> : <><Play size={16} /> {timer.startedAtUnix ? 'RESUME' : 'START'}</>}
              </Button>
              {timer.currentHalf === 1 && (
                <Button variant="secondary" onClick={() => setShowHalftimeModal(true)} className="flex-1 flex items-center justify-center gap-1 px-0 text-sm">
                  <Timer size={16} /> HALF
                </Button>
              )}
              <Button variant="danger" onClick={() => setShowEndModal(true)} className="flex-1 flex items-center justify-center gap-1 px-0 text-sm">
                <CheckCircle size={16} /> END
              </Button>
            </div>

            {/* Goal Laps Dashboard */}
            {events.filter(e => e.eventType === 'goal' && !e.isUndone).length > 0 && (
              <div className="w-full max-w-sm mt-3 glass border border-border/50 rounded-2xl p-4 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-border/30 pb-2">
                  <span className="text-xs font-bold text-muted tracking-widest uppercase flex items-center gap-1.5">
                    ⚽ GOAL LAPS
                  </span>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                    STOPWATCH TIME
                  </span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {events
                    .filter(e => e.eventType === 'goal' && !e.isUndone)
                    .map((g, idx) => {
                      const teamName = g.team === 'team_a' ? match.teamA : match.teamB;
                      const teamColor = g.team === 'team_a' ? match.teamAColor : match.teamBColor;
                      return (
                        <div key={g.id} className="flex items-center justify-between text-sm py-1 border-b border-border/10 last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: teamColor }} />
                            <span className="font-semibold text-foreground">
                              {g.playerName} {g.jerseyNo ? `#${g.jerseyNo}` : ''}
                            </span>
                            <span className="text-xs text-muted">({teamName})</span>
                          </div>
                          <span className="font-mono text-xs text-primary font-bold tabular-nums">
                            {g.elapsedMs !== null && g.elapsedMs !== undefined
                              ? MatchTimer.formatDisplay(g.elapsedMs)
                              : `${g.minute}'`}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Mobile timeline toggle */}
            <button onClick={() => setShowTimeline(true)}
              className="lg:hidden flex items-center gap-2 text-xs text-muted hover:text-foreground mt-2">
              <PanelRight size={14} /> View Timeline ({events.filter(e => !e.isUndone).length} events)
            </button>
          </div>

          <QuickActions
            onGoal={triggerGoal}
            onYellow={triggerYellow}
            onRed={triggerRed}
            onSub={triggerSub}
            onUndo={() => setShowUndo(true)}
          />
        </div>

        {/* Desktop quick actions column */}
        <div className="hidden lg:flex flex-col w-72 border-l border-border/50 p-4">
          <p className="text-xs text-muted tracking-widest mb-4">QUICK STATS</p>
          <div className="space-y-3 text-sm text-muted">
            <div className="flex justify-between"><span>Goals</span><span>{scoreA} – {scoreB}</span></div>
            <div className="flex justify-between"><span>Yellow cards</span>
              <span>{events.filter(e => e.cardType === 'yellow' && !e.isUndone).length}</span>
            </div>
            <div className="flex justify-between"><span>Red cards</span>
              <span>{events.filter(e => e.cardType === 'red' && !e.isUndone).length}</span>
            </div>
            <div className="flex justify-between"><span>Subs</span>
              <span>{events.filter(e => e.eventType === 'sub' && !e.isUndone).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <GoalModal open={showGoal} onClose={() => setShowGoal(false)} teamA={match.teamA} teamB={match.teamB}
        players={players} currentMinute={currentMinute} elapsedMs={pendingElapsedMs} onSave={handleGoal} />
      <CardModal open={showYellow} onClose={() => setShowYellow(false)} cardType="yellow"
        teamA={match.teamA} teamB={match.teamB} players={players} currentMinute={currentMinute} elapsedMs={pendingElapsedMs} onSave={handleCard} />
      <CardModal open={showRed} onClose={() => setShowRed(false)} cardType="red"
        teamA={match.teamA} teamB={match.teamB} players={players} currentMinute={currentMinute} elapsedMs={pendingElapsedMs} onSave={handleCard} />
      <SubModal open={showSub} onClose={() => setShowSub(false)} teamA={match.teamA} teamB={match.teamB}
        players={players} currentMinute={currentMinute} elapsedMs={pendingElapsedMs} onSave={handleSub} />

      {/* Undo modal */}
      <Modal open={showUndo} onClose={() => setShowUndo(false)} title="Undo Last Event">
        <p className="text-muted text-sm mb-5">
          This will mark the most recent event as undone. Scores will update accordingly.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setShowUndo(false)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={handleUndo}>Undo Event</Button>
        </div>
      </Modal>

      {/* Half time modal */}
      <Modal open={showHalftimeModal} onClose={() => setShowHalftimeModal(false)} title="Half Time">
        <p className="text-muted text-sm mb-5">End the first half and go to the break?</p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setShowHalftimeModal(false)}>Not Yet</Button>
          <Button className="flex-1" onClick={handleHalftime}>End First Half</Button>
        </div>
      </Modal>

      {/* End match modal */}
      <Modal open={showEndModal} onClose={() => setShowEndModal(false)} title="End Match">
        <p className="text-muted text-sm mb-5">Confirm match completion? This will finalize the result.</p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setShowEndModal(false)}>Cancel</Button>
          <Button className="flex-1" onClick={() => router.push(`/matches/${id}/finish`)}>Go to Full Time</Button>
        </div>
      </Modal>

      {/* Mobile timeline drawer */}
      <AnimatePresence>
        {showTimeline && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowTimeline(false)} className="fixed inset-0 bg-black/60 z-40" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="fixed right-0 top-0 bottom-0 w-4/5 bg-background border-l border-border/50 z-50 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold">Match Timeline</p>
                <button onClick={() => setShowTimeline(false)} className="text-muted hover:text-foreground transition-colors">✕</button>
              </div>
              {renderTimeline(events)}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
