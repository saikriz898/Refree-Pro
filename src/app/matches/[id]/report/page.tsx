'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Button } from '@/components/ui/Button';
import { FileText, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MatchTimer } from '@/lib/timer';

export default function MatchReportPage({ params }: { params: Promise<{ id: string }> }) {
  const [match, setMatch] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    params.then(async ({ id }) => {
      const [mr, er] = await Promise.all([fetch(`/api/matches/${id}`), fetch(`/api/matches/${id}/events`)]);
      const d = await mr.json();
      setMatch(d.match);
      setEvents(await er.json());
    });
  }, [params]);

  const generatePDF = async () => {
    if (!match) return;
    setLoading(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const { width, height } = page.getSize();
      const green = rgb(0.145, 0.388, 0.922); // Electric blue instead of green
      let y = height - 50;

      const draw = (text: string, x: number, yPos: number, size: number = 11, f = font, color = rgb(0, 0, 0)) => {
        page.drawText(text, { x, y: yPos, size, font: f, color });
      };

      // Header
      page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: rgb(0.04, 0.04, 0.04) });
      draw('MATCH REPORT — REFEREE PRO', 50, height - 35, 16, bold, rgb(1, 1, 1));
      draw(`Generated ${new Date().toLocaleDateString()}`, 50, height - 55, 9, font, rgb(0.5, 0.5, 0.5));
      y = height - 100;

      // Match info
      draw(`${match.venue}  |  ${match.matchDate}  |  ${match.matchTime}`, 50, y, 10, font, rgb(0.3, 0.3, 0.3));
      y -= 20;
      if (match.refereeName) { draw(`Referee: ${match.refereeName}`, 50, y, 10, font, rgb(0.3, 0.3, 0.3)); y -= 20; }

      // Score
      page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: green });
      y -= 30;
      draw(`${match.teamA}`, 50, y, 20, bold, rgb(0, 0, 0));
      draw(`${match.scoreA ?? 0}  –  ${match.scoreB ?? 0}`, width / 2 - 30, y, 24, bold, green);
      draw(`${match.teamB}`, width - 50 - match.teamB.length * 12, y, 20, bold, rgb(0, 0, 0));
      y -= 40;
      page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: green });
      y -= 25;

      const activeEvents = events.filter(e => !e.isUndone);

      // Goals
      const goals = activeEvents.filter(e => e.eventType === 'goal');
      if (goals.length > 0) {
        draw('GOALS', 50, y, 11, bold, green); y -= 18;
        draw("Time     Player                    Team              Type", 50, y, 9, font, rgb(0.4, 0.4, 0.4)); y -= 14;
        page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) }); y -= 12;
        for (const g of goals) {
          const timeText = g.elapsedMs !== null && g.elapsedMs !== undefined ? MatchTimer.formatDisplay(g.elapsedMs) : `${g.minute}'`;
          draw(timeText, 50, y, 10, font); draw(g.playerName.slice(0, 25), 95, y, 10, font);
          draw(g.team === 'team_a' ? match.teamA : match.teamB, 300, y, 10, font);
          draw(g.goalType, 450, y, 10, font); y -= 14;
          if (y < 80) break;
        }
        y -= 10;
      }

      // Cards
      const cards = activeEvents.filter(e => e.eventType === 'card');
      if (cards.length > 0) {
        draw('CARDS', 50, y, 11, bold, rgb(0.9, 0.2, 0.2)); y -= 18;
        for (const c of cards) {
          const timeText = c.elapsedMs !== null && c.elapsedMs !== undefined ? MatchTimer.formatDisplay(c.elapsedMs) : `${c.minute}'`;
          draw(`${timeText} ${c.cardType === 'yellow' ? '[Y]' : '[R]'} ${c.playerName} — ${c.team === 'team_a' ? match.teamA : match.teamB}`, 50, y, 10, font);
          y -= 14; if (y < 80) break;
        }
        y -= 10;
      }

      // Subs
      const subs = activeEvents.filter(e => e.eventType === 'sub');
      if (subs.length > 0) {
        draw('SUBSTITUTIONS', 50, y, 11, bold, rgb(0.2, 0.5, 0.9)); y -= 18;
        for (const s of subs) {
          const timeText = s.elapsedMs !== null && s.elapsedMs !== undefined ? MatchTimer.formatDisplay(s.elapsedMs) : `${s.minute}'`;
          draw(`${timeText} ${s.playerOut} → ${s.playerIn} (${s.team === 'team_a' ? match.teamA : match.teamB})`, 50, y, 10, font);
          y -= 14; if (y < 80) break;
        }
      }

      // Footer
      page.drawLine({ start: { x: 50, y: 40 }, end: { x: width - 50, y: 40 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
      draw('Referee Pro v1.0 — Professional Match Management', 50, 25, 9, font, rgb(0.6, 0.6, 0.6));

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `match-report-${match.matchNumber}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } finally { setLoading(false); }
  };

  if (!match) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col p-4 md:p-6">
      <div>
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-foreground/10 transition-colors border border-border/50 text-foreground shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full mx-auto text-center my-auto -mt-6">
        <div className="w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileText size={32} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Match Report</h1>
        <p className="text-muted text-sm mb-6">
          {match.teamA} vs {match.teamB} · Match {match.matchNumber}
        </p>
        <div className="glass rounded-xl p-4 text-left text-sm text-muted mb-6 space-y-1">
          <p>✓ Match details & result</p>
          <p>✓ Goals, cards & substitutions</p>
          <p>✓ Full event timeline</p>
          <p>✓ A4 PDF format</p>
        </div>
        <Button size="lg" className="w-full" onClick={generatePDF} loading={loading}>
          <Download size={18} /> Download PDF Report
        </Button>
      </motion.div>
    </div>
  );
}
