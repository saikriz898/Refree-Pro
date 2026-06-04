'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCreateMatch } from '../CreateMatchContext';
import { CreateMatchStepper } from '../CreateMatchStepper';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const formats = ['3v3', '5v5', '7v7', '9v9', '11v11'];
const formatCounts: Record<string, number> = { '3v3': 3, '5v5': 5, '7v7': 7, '9v9': 9, '11v11': 11 };
const colors = [
  '#E74C3C', // Red
  '#3498DB', // Blue
  '#2C3E50', // Navy
  '#60A5FA', // Sky Blue
  '#F1C40F', // Yellow
  '#E67E22', // Orange
  '#27AE60', // Green
  '#8E44AD', // Purple
  '#FF8DA1', // Pink
  '#78281F', // Maroon
  '#117A65', // Teal
  '#D4AF37', // Gold
  '#F8F9F9', // White
  '#1A1D20', // Black
  '#566573', // Grey
];

const JerseyIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={color} stroke="var(--color-foreground)" strokeWidth="1.5" strokeOpacity="0.2" className="transition-colors duration-300 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.15)]">
    <path d="M6 3L8 5C9 4 10 3.5 12 3.5C14 3.5 15 4 16 5L18 3C19 3 20 4 20 5V10H17V21H7V10H4V5C4 4 5 3 6 3Z" />
  </svg>
);

export default function TeamsPage() {
  const { state, update } = useCreateMatch();
  const router = useRouter();

  const setFormat = (fmt: string) => {
    const count = formatCounts[fmt];
    const newPlayers = [
      ...Array(count).fill(null).map((_, i) => ({ name: '', team: 'team_a', jerseyNo: i + 1 })),
      ...Array(count).fill(null).map((_, i) => ({ name: '', team: 'team_b', jerseyNo: i + 1 })),
    ];
    update({ squadFormat: fmt, players: newPlayers });
  };

  const valid = state.teamA && state.teamB && state.squadFormat;

  return (
    <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-lg flex flex-col justify-between overflow-hidden bg-background border-x border-border/5">
      {/* Header (Sticky / Apple style) */}
      <div className="bg-background/85 backdrop-blur-md border-b border-border/10 px-4 py-3.5 flex flex-col gap-0.5 sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-1.5 -ml-1">
          <button onClick={() => router.push('/matches/create/details')} className="flex items-center gap-0.5 text-[#007AFF] hover:opacity-75 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            <span className="text-sm font-semibold">Back</span>
          </button>
          <span className="text-muted/20 font-light select-none">|</span>
          <h1 className="text-base font-bold text-foreground select-none">Create Match</h1>
        </div>
        <p className="text-[10px] font-bold text-primary tracking-widest uppercase ml-1 select-none">STEP 2 OF 4 — TEAMS</p>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <CreateMatchStepper current={1} />

        <div className="space-y-4">
          {[
            { key: 'teamA', colorKey: 'teamAColor', color: state.teamAColor, name: state.teamA, label: 'Team A' },
            { key: 'teamB', colorKey: 'teamBColor', color: state.teamBColor, name: state.teamB, label: 'Team B' },
          ].map(({ key, colorKey, color, name, label }) => (
            <div
              key={key}
              className="bg-card border border-border/40 rounded-2xl p-4 relative overflow-hidden transition-all duration-300 shadow-sm"
            >
              {/* Subtle background glow based on team color */}
              <div
                className="absolute inset-0 opacity-5 blur-2xl transition-colors duration-500 pointer-events-none"
                style={{ backgroundColor: color }}
              />

              <div className="relative z-10 space-y-3">
                {/* Team Label and Input with Live Jersey */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center shrink-0">
                    <JerseyIcon color={color} />
                  </div>
                  <div className="flex-1">
                    <span className="text-[9px] uppercase font-bold text-muted tracking-wider block mb-0.5 select-none">{label} Name</span>
                    <input
                      value={name}
                      onChange={(e) => update({ [key]: e.target.value.toUpperCase() } as any)}
                      className={cn(
                        "w-full text-base font-extrabold outline-none placeholder-muted/50 transition-colors uppercase border-none focus:ring-0",
                        name && (color === '#F8F9F9' || color === '#1A1D20') ? "px-2 py-0.5 rounded-md" : "p-0 bg-transparent"
                      )}
                      style={{ 
                        color: name ? color : 'var(--color-foreground)',
                        backgroundColor: name && color === '#F8F9F9' ? '#1A1D20' : name && color === '#1A1D20' ? '#F8F9F9' : 'transparent'
                      }}
                      placeholder={`Enter ${label} name...`}
                    />
                  </div>
                </div>

                <div className="h-px bg-border/20" />

                {/* Team Color Selector (Symmetric Grid) */}
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted tracking-wider block mb-2 select-none">Select Color</span>
                  <div className="grid grid-cols-8 gap-2.5 justify-items-center">
                    {colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => update({ [colorKey]: c } as any)}
                        className={cn(
                          'w-[22px] h-[22px] rounded-full transition-all duration-300 outline-none cursor-pointer',
                          color === c ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110 shadow-[0_0_8px_rgba(150,150,150,0.3)]' : 'hover:scale-110 opacity-70 hover:opacity-100'
                        )}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-1">
          <label className="text-xs text-muted font-bold uppercase tracking-widest block select-none">Squad Format *</label>
          <div className="grid grid-cols-5 gap-2">
            {formats.map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={cn(
                  'py-2.5 rounded-xl text-xs font-bold transition-all duration-300 outline-none cursor-pointer',
                  state.squadFormat === f
                    ? 'bg-primary/10 border border-primary text-primary shadow-[0_0_15px_rgba(0,230,118,0.3)]'
                    : 'bg-background border border-border/50 text-muted hover:border-foreground/30 hover:text-foreground'
                )}
              >
                {f}
              </button>
            ))}
          </div>
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
          disabled={!valid} 
          onClick={() => router.push('/matches/create/config')}
        >
          {valid ? 'Next Step →' : 'Select Format'}
        </Button>
      </div>
    </div>
  );
}
