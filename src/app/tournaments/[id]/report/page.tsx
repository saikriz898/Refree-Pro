'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Button } from '@/components/ui/Button';
import { FileText, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TournamentReportPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    params.then(async ({ id }) => {
      const [dr, sr] = await Promise.all([fetch(`/api/tournaments/${id}`), fetch(`/api/tournaments/${id}/standings`)]);
      const d = await dr.json();
      setTournament(d.tournament);
      setMatches(d.matches || []);
      setStandings(await sr.json());
    });
  }, [params]);

  const generatePDF = async () => {
    if (!tournament) return;
    setLoading(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const green = rgb(0.145, 0.388, 0.922); // Electric blue instead of green

      // Page 1: Summary
      let page = pdfDoc.addPage([595, 842]);
      const { width, height } = page.getSize();
      let y = height - 60;

      page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: rgb(0.04, 0.04, 0.04) });
      page.drawText('TOURNAMENT REPORT — REFEREE PRO', { x: 50, y: height - 35, size: 16, font: bold, color: rgb(1, 1, 1) });
      page.drawText(tournament.name, { x: 50, y: height - 55, size: 10, font, color: rgb(0.6, 0.6, 0.6) });
      y = height - 110;
      page.drawText(`${tournament.venue}  ·  ${tournament.startDate} – ${tournament.endDate}`, { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
      y -= 30;

      // Standings
      page.drawText('STANDINGS', { x: 50, y, size: 12, font: bold, color: green }); y -= 20;
      const headers = '#  Team                P    W    D    L   GF   GA   GD  PTS';
      page.drawText(headers, { x: 50, y, size: 9, font, color: rgb(0.4, 0.4, 0.4) }); y -= 14;
      page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) }); y -= 12;
      standings.forEach((s, i) => {
        const row = `${i + 1}   ${s.teamName.padEnd(18)} ${String(s.played ?? 0).padStart(3)} ${String(s.won ?? 0).padStart(4)} ${String(s.drawn ?? 0).padStart(4)} ${String(s.lost ?? 0).padStart(4)} ${String(s.goalsFor ?? 0).padStart(4)} ${String(s.goalsAgainst ?? 0).padStart(4)} ${String(s.goalDifference ?? 0).padStart(4)} ${String(s.points ?? 0).padStart(4)}`;
        page.drawText(row, { x: 50, y, size: 10, font: i === 0 ? bold : font, color: i === 0 ? green : rgb(0, 0, 0) });
        y -= 14; if (y < 80) { page = pdfDoc.addPage([595, 842]); y = height - 60; }
      });

      // Page 2: Results
      page = pdfDoc.addPage([595, 842]);
      y = height - 60;
      page.drawText('FIXTURES & RESULTS', { x: 50, y, size: 12, font: bold, color: green }); y -= 20;
      matches.filter(m => m.status === 'completed').forEach(m => {
        page.drawText(`${m.matchDate}  Match ${m.matchNumber}  ${m.teamA} ${m.scoreA ?? 0} – ${m.scoreB ?? 0} ${m.teamB}`, { x: 50, y, size: 10, font });
        y -= 14; if (y < 80) { page = pdfDoc.addPage([595, 842]); y = height - 60; }
      });

      // Footer on each page
      pdfDoc.getPages().forEach(p => {
        p.drawLine({ start: { x: 50, y: 40 }, end: { x: 545, y: 40 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
        p.drawText('Referee Pro v1.0', { x: 50, y: 25, size: 9, font, color: rgb(0.6, 0.6, 0.6) });
      });

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `tournament-report-${tournament.name}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } finally { setLoading(false); }
  };

  if (!tournament) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" /></div>;

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
        <h1 className="text-2xl font-bold mb-2">Tournament Report</h1>
        <p className="text-muted text-sm mb-6">{tournament.name}</p>
        <div className="glass rounded-xl p-4 text-left text-sm text-muted mb-6 space-y-1">
          <p>✓ Tournament summary</p>
          <p>✓ All fixtures & results</p>
          <p>✓ Points table</p>
          <p>✓ Multi-page A4 PDF</p>
        </div>
        <Button size="lg" className="w-full" onClick={generatePDF} loading={loading}>
          <Download size={18} /> Download PDF Report
        </Button>
      </motion.div>
    </div>
  );
}
