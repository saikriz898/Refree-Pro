'use client';
import { Button } from '@/components/ui/Button';
import { Target, Square, Circle, ArrowLeftRight, RotateCcw } from 'lucide-react';

interface QuickActionsProps {
  onGoal: () => void;
  onYellow: () => void;
  onRed: () => void;
  onSub: () => void;
  onUndo: () => void;
  disabled?: boolean;
}

export function QuickActions({ onGoal, onYellow, onRed, onSub, onUndo, disabled }: QuickActionsProps) {
  const actions = [
    { id: 'goal', icon: <span className="text-[22px] leading-none drop-shadow-md">⚽</span>, label: 'GOAL', onClick: onGoal, color: 'text-foreground', bg: 'bg-foreground/10' },
    { id: 'yellow', icon: <div className="w-4 h-5 rounded-sm bg-[#F1C40F] shadow-[0_0_10px_rgba(241,196,15,0.4)]" />, label: 'YELLOW', onClick: onYellow, color: 'text-foreground', bg: 'bg-[#F1C40F]/10' },
    { id: 'red', icon: <div className="w-4 h-5 rounded-sm bg-[#E74C3C] shadow-[0_0_10px_rgba(231,76,60,0.4)]" />, label: 'RED', onClick: onRed, color: 'text-foreground', bg: 'bg-[#E74C3C]/10' },
    { id: 'sub', icon: <ArrowLeftRight size={18} className="text-[#3498DB]" />, label: 'SUB', onClick: onSub, color: 'text-foreground', bg: 'bg-[#3498DB]/10' },
    { id: 'undo', icon: <RotateCcw size={18} className="text-muted" />, label: 'UNDO', onClick: onUndo, color: 'text-muted', bg: 'bg-transparent border border-border/50' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-2xl border-t border-border/50 pb-[env(safe-area-inset-bottom)] px-2 pt-2 lg:relative lg:bottom-auto lg:left-auto lg:right-auto lg:z-0 lg:bg-transparent lg:backdrop-blur-none lg:border-t-0 lg:pb-0 lg:px-0">
      <div className="glass border border-border/50 rounded-2xl p-2 mb-2 lg:mb-0 mx-2 lg:mx-0 shadow-2xl flex justify-between gap-1">
        {actions.map((a) => (
          <button
            key={a.id}
            onClick={a.onClick}
            disabled={disabled}
            className={`flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-xl transition-all hover:bg-foreground/5 active:scale-95 disabled:opacity-40 group`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${a.bg} group-hover:scale-110 transition-transform duration-300`}>
              {a.icon}
            </div>
            <span className={`text-[10px] font-bold tracking-widest ${a.color}`}>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
