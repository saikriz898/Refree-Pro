'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Swords, Calendar, History, Settings, Plus, X, Trophy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/matches', icon: Swords, label: 'Matches' },
  { href: '/history', icon: Calendar, label: 'History' },
  { href: '/tournaments', icon: History, label: 'Tournaments' },
];

export function MobileNav() {
  const pathname = usePathname();
  const [showQuick, setShowQuick] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'match' | 'tournament' | null>(null);
  const router = useRouter();

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center h-[68px] px-2 pb-1">
          {navItems.slice(0, 2).map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className={cn('flex-1 flex flex-col items-center gap-1 py-1.5 min-h-[44px] justify-center transition-all duration-300 rounded-2xl mx-1', isActive(href) ? 'text-primary bg-foreground/5' : 'text-muted hover:text-foreground/70')}>
              <Icon size={20} className={cn("transition-transform duration-300", isActive(href) && "scale-110")} />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </Link>
          ))}
          <div className="relative -top-5 mx-2 shrink-0">
            <button
              onClick={() => setShowQuick(true)}
              className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-md text-white transform transition-transform hover:scale-105 active:scale-95"
            >
              <Plus size={28} />
            </button>
          </div>
          {navItems.slice(2).map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className={cn('flex-1 flex flex-col items-center gap-1 py-1.5 min-h-[44px] justify-center transition-all duration-300 rounded-2xl mx-1', isActive(href) ? 'text-primary bg-foreground/5' : 'text-muted hover:text-foreground/70')}>
              <Icon size={20} className={cn("transition-transform duration-300", isActive(href) && "scale-110")} />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <AnimatePresence>
        {showQuick && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuick(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs"
            />
            {/* Modal Container */}
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pb-safe pointer-events-none">
              <motion.div
                initial={{ y: '100%', opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0.5 }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="bg-card w-full sm:max-w-sm rounded-t-[32px] sm:rounded-3xl overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t sm:border border-border/10 flex flex-col pointer-events-auto"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border/10 bg-muted/10 shrink-0">
                  <span className="text-xl font-black text-foreground tracking-tight">Quick Action</span>
                  <button
                    onClick={() => setShowQuick(false)}
                    className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center text-muted hover:text-foreground transition-colors"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Body (Action Buttons) */}
                <div className="p-5 flex flex-col gap-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAction('match')}
                    className={cn(
                      "relative overflow-hidden flex items-center gap-3 p-3.5 rounded-2xl border text-left w-full group shadow-sm transition-all duration-200",
                      selectedAction === 'match'
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-border/50 bg-foreground/5 hover:bg-foreground/10"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner transition-colors",
                      selectedAction === 'match' ? "bg-primary/20 border border-primary/20" : "bg-background border border-border/50"
                    )}>
                      <Swords size={22} className={selectedAction === 'match' ? "text-primary drop-shadow-sm" : "text-muted-foreground"} />
                    </div>
                    <div>
                      <h3 className={cn("font-bold text-[16px] tracking-tight", selectedAction === 'match' ? "text-foreground" : "text-foreground/80")}>Schedule Match</h3>
                      <p className="text-[11px] text-muted font-medium mt-0.5">Create a new match event</p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAction('tournament')}
                    className={cn(
                      "relative overflow-hidden flex items-center gap-3 p-3.5 rounded-2xl border text-left w-full group shadow-sm transition-all duration-200",
                      selectedAction === 'tournament'
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-border/50 bg-foreground/5 hover:bg-foreground/10"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner transition-colors",
                      selectedAction === 'tournament' ? "bg-primary/20 border border-primary/20" : "bg-background border border-border/50"
                    )}>
                      <Trophy size={22} className={selectedAction === 'tournament' ? "text-primary drop-shadow-sm" : "text-muted-foreground"} />
                    </div>
                    <div>
                      <h3 className={cn("font-bold text-[16px] tracking-tight", selectedAction === 'tournament' ? "text-foreground" : "text-foreground/80")}>Create Tournament</h3>
                      <p className="text-[11px] text-muted font-medium mt-0.5">Setup a new multi-match event</p>
                    </div>
                  </motion.button>
                </div>

                {/* Footer (Cancel & Continue Buttons) */}
                <div className="p-3.5 border-t border-border/10 bg-muted/5 flex items-center gap-3 justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => setShowQuick(false)}
                    className="w-1/3 text-muted-foreground hover:bg-foreground/5 font-semibold text-[15px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 shadow-lg shadow-primary/20 text-[15px]"
                    disabled={!selectedAction}
                    onClick={() => {
                      if (!selectedAction) return;
                      setShowQuick(false);
                      if (selectedAction === 'match') router.push('/matches/create/details');
                      if (selectedAction === 'tournament') router.push('/tournaments/create');
                    }}
                  >
                    Continue →
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
