'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Download, Share2 } from 'lucide-react';
import { MatchTimer } from '@/lib/timer';

const templates = ['Match Night', 'Broadcast Result', 'Matchday Premium', 'Minimal Sports', 'Neon Cyber', 'Classic Gold', 'Real Pitch', 'Stadium Lights'];

export default function PosterPage({ params }: { params: Promise<{ id: string }> }) {
  const [match, setMatch] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [template, setTemplate] = useState(0);
  const [loading, setLoading] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    params.then(async ({ id }) => {
      const [mr, er] = await Promise.all([fetch(`/api/matches/${id}`), fetch(`/api/matches/${id}/events`)]);
      const d = await mr.json();
      setMatch(d.match);
      setEvents(await er.json());
    });
  }, [params]);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setLoading(true);
    try {
      const dataUrl = await toPng(posterRef.current, { pixelRatio: 2 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `match-poster-${match?.matchNumber}.png`;
      a.click();
    } catch { alert('Export failed. Try again.'); }
    finally { setLoading(false); }
  };

  const handleShare = async () => {
    if (!posterRef.current) return;
    try {
      const dataUrl = await toPng(posterRef.current, { pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'match-poster.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Match Result' });
      } else {
        handleDownload();
      }
    } catch {}
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth - 32;
      const h = window.innerHeight - 240;
      
      if (w > 0 && h > 0) {
        const scaleX = w / 360;
        const scaleY = h / 640;
        setScale(Math.min(scaleX * 0.95, scaleY * 0.95, 1));
        setMounted(true);
      }
    };

    updateScale();
    const timer = setTimeout(() => {
      updateScale();
      setMounted(true);
    }, 150);
    
    window.addEventListener('resize', updateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  if (!match) return <div className="h-[100dvh] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" /></div>;

  const goals = events.filter(e => e.eventType === 'goal' && !e.isUndone);
  const yellows = events.filter(e => e.cardType === 'yellow' && !e.isUndone);
  const reds = events.filter(e => e.cardType === 'red' && !e.isUndone);

  const templateStyles = [
    { bg: 'bg-[#0A0A0A]', accent: 'text-primary', accentBg: 'bg-primary/20', scoreColor: 'text-white', border: 'border-primary/30' },
    { bg: 'bg-white', accent: 'text-[#2563EB]', accentBg: 'bg-[#2563EB]/10', scoreColor: 'text-[#0A0A0A]', border: 'border-gray-200' },
    { bg: 'bg-gradient-to-b from-[#0B1528] to-[#0A0A0A]', accent: 'text-primary', accentBg: 'bg-primary/20', scoreColor: 'text-white', border: 'border-primary/20' },
    { bg: 'bg-[#111]', accent: 'text-white/60', accentBg: 'bg-white/10', scoreColor: 'text-white', border: 'border-white/10' },
    { bg: 'bg-black', accent: 'text-[#38BDF8]', accentBg: 'bg-[#38BDF8]/20', scoreColor: 'text-[#E11D48]', border: 'border-[#E11D48]/50' },
    { bg: 'bg-[#1A1A1A]', accent: 'text-[#D4AF37]', accentBg: 'bg-[#D4AF37]/20', scoreColor: 'text-[#D4AF37]', border: 'border-[#D4AF37]/40' },
    { bg: 'bg-[#1b4332]', accent: 'text-white', accentBg: 'bg-white/20', scoreColor: 'text-white', border: 'border-white/40' },
    { bg: 'bg-[#0f172a]', accent: 'text-[#38bdf8]', accentBg: 'bg-[#38bdf8]/20', scoreColor: 'text-white', border: 'border-[#38bdf8]/40' },
  ];

  const ts = templateStyles[template];

  return (
    <div className="h-[100dvh] bg-background p-4 md:p-6 overflow-hidden flex flex-col">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-full max-w-lg mx-auto w-full">
        
        {/* Header with Back button */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-foreground/10 transition-colors border border-border/50 text-foreground"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="text-2xl font-bold text-foreground">Poster Generator</h1>
        </div>

        {/* Template selector */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 shrink-0" style={{ scrollbarWidth: 'none' }}>
          {templates.map((t, i) => (
            <button key={t} onClick={() => setTemplate(i)}
              className={cn('px-3 py-2 rounded-lg text-sm whitespace-nowrap min-h-[36px] transition-all',
                template === i ? 'bg-primary/10 border border-primary text-primary shadow-[0_0_10px_rgba(0,230,118,0.2)] font-semibold' : 'glass text-muted hover:text-foreground')}>
              {t}
            </button>
          ))}
        </div>

        {/* Scalable Poster container */}
        <div className="flex-1 min-h-0 w-full relative mb-6" ref={containerRef}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div style={{ width: 360 * scale, height: 640 * scale, position: 'relative' }}>
            
            {/* The scaled wrapper */}
            <div style={{ opacity: mounted ? 1 : 0, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0, transition: 'opacity 0.2s ease-in-out' }}>
              
              {/* The actual poster div */}
              <div ref={posterRef} className={cn('w-[360px] h-[640px] rounded-2xl overflow-hidden border shadow-[0_0_40px_rgba(0,0,0,0.5)] shrink-0 relative', ts.bg, ts.border)}>
                
                {/* Background Images for all Templates */}
                <div className="absolute inset-0 z-0">
                  {template === 0 && (
                    <>
                      <img src="/match-night-bg.png" alt="Night Stadium" className="w-full h-full object-cover opacity-70" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-[#0A0A0A]/20"></div>
                    </>
                  )}
                  {template === 1 && (
                    <>
                      <img src="/broadcast-bg.png" alt="Broadcast Studio" className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90"></div>
                    </>
                  )}
                  {template === 2 && (
                    <>
                      <img src="/pitch-bg.png" alt="Pitch Premium" className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20"></div>
                      <div className="absolute inset-0 bg-gradient-to-b from-[#0F1F17]/80 to-transparent"></div>
                    </>
                  )}
                  {template === 3 && (
                    <>
                      <img src="/minimal-bg.png" alt="Minimal Pitch" className="w-full h-full object-cover opacity-60 mix-blend-screen" />
                      <div className="absolute inset-0 bg-[#111]/70"></div>
                    </>
                  )}
                  {template === 4 && (
                    <>
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1e1b4b] via-[#020617] to-black"></div>
                      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#E11D48]/10 blur-[100px] rounded-full"></div>
                      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-[#38BDF8]/10 blur-[100px] rounded-full"></div>
                    </>
                  )}
                  {template === 5 && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#0c0a09]"></div>
                      <div className="absolute inset-0 border-[3px] border-[#D4AF37]/20 m-4 rounded-xl pointer-events-none"></div>
                    </>
                  )}
                  {template === 6 && (
                    <div className="absolute inset-0 overflow-hidden bg-[#1b4332] perspective-1000">
                      {/* Realistic CSS pitch grass pattern */}
                      <div className="absolute inset-0" style={{ 
                        backgroundImage: 'repeating-linear-gradient(0deg, #1b4332, #1b4332 40px, #2d6a4f 40px, #2d6a4f 80px)',
                        transform: 'perspective(500px) rotateX(45deg) scale(2)',
                        transformOrigin: 'top center',
                        opacity: 0.8
                      }}></div>
                      {/* Pitch lines */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-4 border-white/40 border-b-0 rounded-t-sm" style={{ transform: 'perspective(500px) rotateX(45deg)' }}></div>
                      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-16 h-8 border-4 border-white/40 border-b-0 rounded-t-sm" style={{ transform: 'perspective(500px) rotateX(45deg)' }}></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#081c15] via-transparent to-[#081c15]/80"></div>
                    </div>
                  )}
                  {template === 7 && (
                    <div className="absolute inset-0 bg-[#020617] overflow-hidden">
                      {/* Stadium Floodlights */}
                      <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/20 blur-[100px] rounded-full mix-blend-screen"></div>
                      <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/20 blur-[100px] rounded-full mix-blend-screen"></div>
                      
                      {/* Light beams */}
                      <div className="absolute top-0 left-[20%] w-[100px] h-[150%] bg-gradient-to-b from-white/10 to-transparent -rotate-45 transform-origin-top mix-blend-screen blur-[20px]"></div>
                      <div className="absolute top-0 right-[20%] w-[100px] h-[150%] bg-gradient-to-b from-white/10 to-transparent rotate-45 transform-origin-top mix-blend-screen blur-[20px]"></div>
                      
                      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay"></div>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#020617] opacity-80"></div>
                    </div>
                  )}
                </div>

                <div className="relative z-10 flex flex-col h-full p-8 justify-between">
                  <div className="text-center mt-2">
                    <div className={`inline-block px-4 py-1.5 rounded-full border mb-4 ${template === 1 ? 'border-[#2563EB]/30 text-[#2563EB] bg-[#2563EB]/10' : 'border-white/10 bg-black/60'}`}>
                      <p className={`text-[10px] tracking-widest font-black ${template !== 1 && ts.accent}`}>FINAL SCORE</p>
                    </div>
                    <p className={`text-xs uppercase tracking-widest font-bold ${template === 1 ? 'text-[#0A0A0A]' : 'text-white'}`}>{match.venue}</p>
                    <p className={`text-[10px] uppercase tracking-wider mt-1 ${template === 1 ? 'text-gray-500 font-medium' : 'text-white/80'}`}>{match.matchDate}</p>
                  </div>

                  <div className="text-center my-auto w-full">
                    {/* Premium Score Section with Circles */}
                    <div className="flex items-center justify-between mb-8 w-full">
                      <div className="flex flex-col items-center w-24 shrink-0">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2 border-white/20 shrink-0" style={{ backgroundColor: match.teamAColor }}>
                          <span className="text-xl font-bold text-white">{match.teamA.charAt(0)}</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest truncate w-full text-center ${template === 1 ? 'text-black' : 'text-white'}`}>{match.teamA}</span>
                      </div>
                      
                      <div className={`px-4 py-2 shrink-0 rounded-2xl ${template === 1 ? 'bg-white/95 border border-gray-200' : 'bg-black/70 border border-white/10'}`}>
                        <span className={`whitespace-nowrap text-4xl font-black ${ts.scoreColor} score-digit tracking-widest`}>
                          {match.scoreA} <span className={`text-xl ${template === 1 ? 'text-gray-400' : 'text-primary/80'} align-middle mx-1`}>-</span> {match.scoreB}
                        </span>
                      </div>

                      <div className="flex flex-col items-center w-24 shrink-0">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2 border-white/20 shrink-0" style={{ backgroundColor: match.teamBColor }}>
                          <span className="text-xl font-bold text-white">{match.teamB.charAt(0)}</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest truncate w-full text-center ${template === 1 ? 'text-black' : 'text-white'}`}>{match.teamB}</span>
                      </div>
                    </div>

                  {/* Match events */}
                  {goals.length > 0 && (
                    <div className={`mt-6 space-y-2 p-4 rounded-xl border ${template === 1 ? 'bg-white/95 border-gray-200 text-gray-800' : 'bg-black/70 border-white/10 text-white/90'}`}>
                      <div className="text-[10px] uppercase tracking-widest font-bold mb-2 opacity-60 flex items-center justify-center gap-2">
                        <div className="w-3 h-[1px] bg-current"></div>
                        Goals
                        <div className="w-3 h-[1px] bg-current"></div>
                      </div>
                      {goals.map(g => (
                        <div key={g.id} className="text-xs flex items-center justify-center gap-2">
                          <span className="font-semibold">{g.playerName}</span>
                          <span className={`text-[10px] px-1.5 rounded font-bold ${ts.accentBg} ${ts.accent}`}>
                            {g.elapsedMs !== null && g.elapsedMs !== undefined ? MatchTimer.formatDisplay(g.elapsedMs) : `${g.minute}'`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`text-center`}>
                  <div className={`w-12 h-1 mx-auto mb-4 rounded-full ${template === 1 ? 'bg-gray-300' : 'bg-white/20'}`}></div>
                  <p className={`font-bold tracking-widest text-sm mb-1 ${ts.accent}`}>REFEREE PRO</p>
                  {yellows.length > 0 && <p className={`text-[10px] uppercase tracking-wider font-medium ${template === 1 ? 'text-gray-500' : 'text-white/60'}`}>Cards: 🟨 {yellows.length} {reds.length > 0 ? `🟥 ${reds.length}` : ''}</p>}
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 shrink-0 pb-safe">
          <Button className="flex-1" onClick={handleDownload} loading={loading}>
            <Download size={16} /> Download
          </Button>
          <Button variant="secondary" className="flex-1" onClick={handleShare}>
            <Share2 size={16} /> Share
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
