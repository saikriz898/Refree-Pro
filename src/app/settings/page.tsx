'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Download, Upload, Trash2, Info, ChevronRight, Shield, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [showClearModal, setShowClearModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | 'system' || 'dark';
    setTheme(saved);
  }, []);

  const applyTheme = (t: 'dark' | 'light' | 'system') => {
    setTheme(t);
    localStorage.setItem('theme', t);
    const html = document.documentElement;
    if (t === 'dark') { html.classList.add('dark'); html.classList.remove('light'); }
    else if (t === 'light') { html.classList.remove('dark'); html.classList.add('light'); }
    else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) { html.classList.add('dark'); html.classList.remove('light'); }
      else { html.classList.remove('dark'); html.classList.add('light'); }
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/export');
      const data = await res.json();

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let page = pdfDoc.addPage([595, 842]); // A4
      const { width, height } = page.getSize();
      let y = height - 50;

      const draw = (text: string, x: number, yPos: number, size: number = 11, f = font, color = rgb(0, 0, 0)) => {
        page.drawText(text, { x, y: yPos, size, font: f, color });
      };

      draw('REFEREE PRO — DATABASE EXPORT', 50, y, 16, bold); y -= 20;
      draw(`Generated: ${new Date().toLocaleString()}`, 50, y, 10, font, rgb(0.5, 0.5, 0.5)); y -= 40;

      for (const m of data.matches || []) {
        if (y < 100) {
          page = pdfDoc.addPage([595, 842]);
          y = height - 50;
        }
        draw(`Match ${m.matchNumber}: ${m.teamA} vs ${m.teamB}`, 50, y, 12, bold); y -= 15;
        draw(`Date: ${m.matchDate}  |  Venue: ${m.venue}  |  Score: ${m.scoreA ?? 0} - ${m.scoreB ?? 0}`, 50, y, 10, font); y -= 25;
      }

      if ((data.matches || []).length === 0) {
        draw('No matches recorded yet.', 50, y, 11, font);
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `referee-pro-backup-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click(); URL.revokeObjectURL(url);
      toast('PDF Exported successfully!');
    } catch { toast('Export failed', 'error'); }
    setLoading(false);
  };

  const handleClearData = async () => {
    if (confirmText !== 'CONFIRM') return;
    setClearing(true);
    try {
      const res = await fetch('/api/settings/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmText: 'CONFIRM' }),
      });
      if (res.ok) {
        toast('All database data cleared successfully!');
        setShowClearModal(false);
        setConfirmText('');
      } else {
        const errorData = await res.json();
        toast(errorData.error || 'Failed to clear data', 'error');
      }
    } catch {
      toast('Network error while clearing data', 'error');
    } finally {
      setClearing(false);
    }
  };

  type SettingItem =
    | { type: 'custom'; content: React.ReactNode }
    | { type?: undefined; label: string; icon: React.ReactNode; iconBg: string; onClick: () => void; isDestructive?: boolean; value?: string };

  interface SettingSection {
    title: string;
    items: SettingItem[];
  }

  const sections: SettingSection[] = [
    {
      title: 'APPEARANCE',
      items: [
        {
          type: 'custom',
          content: (
            <div className="flex items-center justify-between py-2 px-4 w-full">
              <div className="flex items-center gap-3.5">
                <div className="w-7 h-7 rounded-[7px] flex items-center justify-center bg-[#007AFF] text-white shrink-0 shadow-sm">
                  <Shield size={16} />
                </div>
                <span className="text-[15px] font-normal text-foreground">Theme</span>
              </div>
              <div className="flex bg-foreground/5 dark:bg-foreground/10 rounded-lg p-0.5 border border-border/10">
                {(['dark', 'light', 'system'] as const).map(t => (
                  <button key={t} onClick={() => applyTheme(t)}
                    className={cn('px-3.5 py-1 rounded-md text-[13px] capitalize transition-all outline-none',
                      theme === t ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted hover:text-foreground/80')}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )
        }
      ]
    },
    {
      title: 'STORAGE & DATA',
      items: [
        { label: loading ? 'Generating PDF...' : 'Export All Data (.pdf)', icon: <Download size={16} className="text-white" />, iconBg: 'bg-[#34C759]', onClick: handleExport },
        { label: 'Import Data', icon: <Upload size={16} className="text-white" />, iconBg: 'bg-[#FF9500]', onClick: () => router.push('/settings/import') },
        { label: 'Clear All Data', icon: <Trash2 size={16} className="text-white" />, iconBg: 'bg-[#FF3B30]', onClick: () => setShowClearModal(true), isDestructive: true },
      ]
    },
    {
      title: 'ABOUT',
      items: [
        {
          label: 'Software Version',
          icon: <Info size={16} className="text-white" />,
          iconBg: 'bg-[#8E8E93]',
          value: '1.0.0',
          onClick: () => toast('Referee Pro is up to date!', 'info')
        }
      ]
    }
  ];

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-8 max-w-xl mx-auto">
        <div className="flex flex-col gap-1.5 mb-6 ml-2">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-[#007AFF] hover:opacity-80 transition-opacity -ml-1 text-[17px] font-normal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m15 18-6-6 6-6" /></svg>
            Back
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mt-2">Settings</h1>
        </div>

        <div className="space-y-7">
          {sections.map(({ title, items }) => (
            <div key={title} className="space-y-1.5">
              <p className="text-[12px] text-muted/80 uppercase font-bold tracking-wider mb-1.5 ml-4">{title}</p>
              <div className="bg-card border border-border/30 rounded-xl overflow-hidden shadow-sm divide-y divide-border/20">
                {items.map((item, i) => {
                  if (item.type === 'custom') {
                    return (
                      <div key={i} className="flex items-center min-h-[48px] py-1">
                        {item.content}
                      </div>
                    );
                  }
                  return (
                    <button
                      key={i}
                      onClick={item.onClick}
                      className="w-full flex items-center justify-between min-h-[48px] px-4 hover:bg-foreground/5 transition-colors active:bg-foreground/10 text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={cn("w-7 h-7 rounded-[7px] flex items-center justify-center text-white shrink-0 shadow-sm", item.iconBg)}>
                          {item.icon}
                        </div>
                        <span className={cn("text-[15px] font-normal", item.isDestructive ? "text-red-500" : "text-foreground")}>
                          {item.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.value && <span className="text-[14px] text-muted">{item.value}</span>}
                        <ChevronRight size={18} className="text-muted/30" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Centered App Icon at the bottom */}
          <div className="pt-4 text-center space-y-1">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 overflow-hidden bg-black shadow-lg shadow-black/30">
              <img src="/image.png" className="w-full h-full object-cover" />
            </div>
            <p className="font-bold text-foreground text-base">Referee Pro</p>
            <p className="text-[13px] text-muted">Version 1.0.0</p>
          </div>
        </div>

        <Modal open={showClearModal} onClose={() => { setShowClearModal(false); setConfirmText(''); }} title="Clear All Data">
          <p className="text-muted-foreground text-sm mb-4">
            This will permanently delete ALL matches, tournaments, players and events. This cannot be undone.
          </p>
          <p className="text-sm mb-3">Type <span className="font-mono text-red-500 font-bold">CONFIRM</span> to proceed:</p>
          <Input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="CONFIRM" className="mb-4" />
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => { setShowClearModal(false); setConfirmText(''); }} disabled={clearing}>Cancel</Button>
            <Button variant="danger" className="flex-1" disabled={confirmText !== 'CONFIRM'} loading={clearing}
              onClick={handleClearData}>
              Delete Everything
            </Button>
          </div>
        </Modal>
      </motion.div>
    </AppLayout>
  );
}
