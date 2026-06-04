'use client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateMatch } from '../CreateMatchContext';
import { CreateMatchStepper } from '../CreateMatchStepper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Timer, Coffee, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConfigPage() {
  const { state, update } = useCreateMatch();
  const router = useRouter();

  return (
    <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-lg flex flex-col justify-between overflow-hidden bg-background border-x border-border/5">
      {/* Header (Sticky / Apple style) */}
      <div className="bg-background/85 backdrop-blur-md border-b border-border/10 px-4 py-3.5 flex flex-col gap-0.5 sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-1.5 -ml-1">
          <button onClick={() => router.push('/matches/create/teams')} className="flex items-center gap-0.5 text-[#007AFF] hover:opacity-75 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            <span className="text-sm font-semibold">Back</span>
          </button>
          <span className="text-muted/20 font-light select-none">|</span>
          <h1 className="text-base font-bold text-foreground select-none">Create Match</h1>
        </div>
        <p className="text-[10px] font-bold text-primary tracking-widest uppercase ml-1 select-none">STEP 3 OF 4 — CONFIG</p>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <CreateMatchStepper current={2} />

        <div className="space-y-4">
          <Card className="p-4 relative overflow-hidden transition-all duration-300 shadow-sm border border-border/40 bg-card/45 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div className="pb-3 border-b border-border/10">
                <span className="text-[9px] uppercase font-bold text-primary tracking-widest select-none">Match Settings</span>
              </div>

              {/* Match Duration Row */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Timer size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">Match Duration</p>
                    <p className="text-[11px] text-muted leading-tight">Duration of each half</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-muted/40 border border-border/30 rounded-full p-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => update({ matchDuration: Math.max(1, state.matchDuration - 5) })}
                    className="w-7 h-7 rounded-full bg-card border border-border/30 flex items-center justify-center text-foreground hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="text-base font-extrabold w-8 text-center tabular-nums">{state.matchDuration}</span>
                  <button
                    type="button"
                    onClick={() => update({ matchDuration: Math.min(120, state.matchDuration + 5) })}
                    className="w-7 h-7 rounded-full bg-card border border-border/30 flex items-center justify-center text-foreground hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    <Plus size={13} />
                  </button>
                  <span className="text-[10px] font-bold text-muted pr-2">min</span>
                </div>
              </div>

              <div className="h-px bg-border/10" />

              {/* Break Duration Row */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Coffee size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">Break Duration</p>
                    <p className="text-[11px] text-muted leading-tight">Half-time break length</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-muted/40 border border-border/30 rounded-full p-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => update({ breakDuration: Math.max(1, state.breakDuration - 5) })}
                    className="w-7 h-7 rounded-full bg-card border border-border/30 flex items-center justify-center text-foreground hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="text-base font-extrabold w-8 text-center tabular-nums">{state.breakDuration}</span>
                  <button
                    type="button"
                    onClick={() => update({ breakDuration: Math.min(120, state.breakDuration + 5) })}
                    className="w-7 h-7 rounded-full bg-card border border-border/30 flex items-center justify-center text-foreground hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    <Plus size={13} />
                  </button>
                  <span className="text-[10px] font-bold text-muted pr-2">min</span>
                </div>
              </div>

              <div className="h-px bg-border/10" />

              {/* Extra Time Row */}
              <div className="flex flex-col py-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-sm">
                      <Plus size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">Extra Time</p>
                      <p className="text-[11px] text-muted leading-tight">Optional extra time if draw</p>
                    </div>
                  </div>
                  {/* iOS Style Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => update({ extraTime: state.extraTime === null ? 15 : null })}
                    className={cn(
                      "w-11 h-6 rounded-full transition-colors relative outline-none cursor-pointer border border-transparent",
                      state.extraTime !== null ? "bg-[#34C759]" : "bg-muted-foreground/20"
                    )}
                  >
                    <span
                      className={cn(
                        "w-5 h-5 rounded-full bg-white absolute top-[2px] shadow transition-all duration-200 ease-out",
                        state.extraTime !== null ? "right-[2px]" : "left-[2px]"
                      )}
                    />
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {state.extraTime !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center justify-between bg-primary/5 rounded-xl p-3 border border-primary/10">
                        <span className="text-xs font-semibold text-foreground/80">Extra Time Duration:</span>
                        <div className="flex items-center gap-2 bg-muted/40 border border-border/30 rounded-full p-1 shadow-inner">
                          <button
                            type="button"
                            onClick={() => update({ extraTime: Math.max(1, (state.extraTime ?? 15) - 5) })}
                            className="w-6 h-6 rounded-full bg-card border border-border/30 flex items-center justify-center text-foreground hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-sm font-extrabold w-8 text-center tabular-nums">{state.extraTime}</span>
                          <button
                            type="button"
                            onClick={() => update({ extraTime: Math.min(60, (state.extraTime ?? 15) + 5) })}
                            className="w-6 h-6 rounded-full bg-card border border-border/30 flex items-center justify-center text-foreground hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
                          >
                            <Plus size={11} />
                          </button>
                          <span className="text-[9px] font-bold text-muted pr-2">min</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </Card>
        </div>
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
          className="flex-1 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow text-[15px] font-bold" 
          onClick={() => router.push('/matches/create/review')}
        >
          Next → Review
        </Button>
      </div>
    </div>
  );
}
