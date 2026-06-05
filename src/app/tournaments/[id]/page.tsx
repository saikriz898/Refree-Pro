'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MatchCard } from '@/components/match/MatchCard';
import { StandingsTable } from '@/components/tournament/StandingsTable';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { Plus, Edit, FileText, MapPin, Calendar, Trash2 } from 'lucide-react';

const tabs = ['overview', 'fixtures', 'results', 'standings', 'scorers', 'report'];

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState('');
  const [data, setData] = useState<any>(null);
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    params.then(async ({ id }) => {
      setId(id);
      const [dr, sr] = await Promise.all([
        fetch(`/api/tournaments/${id}`),
        fetch(`/api/tournaments/${id}/standings`),
      ]);
      setData(await dr.json());
      setStandings(await sr.json());
      setLoading(false);
    });
  }, [params]);

  if (loading) return <AppLayout><div className="p-8 space-y-4"><SkeletonCard /><SkeletonCard /></div></AppLayout>;
  if (!data?.tournament) return <AppLayout><div className="p-8 text-center text-muted/50">Tournament not found</div></AppLayout>;

  const { tournament, matches, scorers } = data;
  const fixtures = matches.filter((m: any) => m.status !== 'completed');
  const results = matches.filter((m: any) => m.status === 'completed');

  // Top scorers
  const scorerMap: Record<string, { name: string; goals: number; team: string }> = {};
  (scorers || []).filter((g: any) => !g.isUndone).forEach((g: any) => {
    if (!scorerMap[g.playerName]) scorerMap[g.playerName] = { name: g.playerName, goals: 0, team: g.team };
    scorerMap[g.playerName].goals++;
  });
  const topScorers = Object.values(scorerMap).sort((a, b) => b.goals - a.goals);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass rounded-xl p-5 mb-4">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-2xl font-bold">{tournament.name}</h1>
            <div className="flex gap-2 items-center">
              <Badge status={tournament.status} />
              <Button size="sm" variant="secondary" onClick={() => router.push(`/tournaments/${id}/edit`)}>
                <Edit size={14} />
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setShowDeleteModal(true)}>
                <Trash2 size={14} className="text-red-500" />
              </Button>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-muted">
            <span className="flex items-center gap-1"><MapPin size={11} />{tournament.venue}</span>
            <span className="flex items-center gap-1"><Calendar size={11} />{tournament.startDate} – {tournament.endDate}</span>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border/50">
            {[{ label: 'Matches', v: matches.length }, { label: 'Completed', v: results.length }, { label: 'Goals', v: (scorers || []).filter((g: any) => !g.isUndone).length }, { label: 'Teams', v: standings.length }].map(({ label, v }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold">{v}</p>
                <p className="text-xs text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn('px-3 py-1.5 rounded-lg text-sm capitalize whitespace-nowrap min-h-[36px] transition-all',
                tab === t ? 'bg-primary text-white' : 'text-muted hover:text-foreground')}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-xs text-muted tracking-widest mb-3">QUICK ACTIONS</p>
              <Button className="w-full mb-2" size="sm" onClick={() => router.push(`/matches/create/details?tournamentId=${id}`)}>
                <Plus size={14} /> Schedule Match
              </Button>
              <Button variant="secondary" className="w-full" size="sm" onClick={() => router.push(`/tournaments/${id}/report`)}>
                <FileText size={14} /> Generate Report
              </Button>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted tracking-widest mb-3">PROGRESS</p>
              <p className="text-2xl font-bold">{results.length} <span className="text-muted/50 text-base">/ {matches.length}</span></p>
              <p className="text-xs text-muted">matches completed</p>
            </Card>
          </div>
        )}

        {tab === 'fixtures' && (
          <div className="space-y-3">
            {fixtures.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted/50 text-sm mb-4">No upcoming fixtures</p>
                <Button size="sm" onClick={() => router.push(`/matches/create/details?tournamentId=${id}`)}>
                  <Plus size={14} /> Schedule Match
                </Button>
              </div>
            ) : (
              fixtures.map((m: any) => <MatchCard key={m.id} {...m} />)
            )}
          </div>
        )}

        {tab === 'results' && (
          <div className="space-y-3">
            {results.length === 0 ? <p className="text-center text-muted/50 py-8">No results yet</p> :
              results.map((m: any) => <MatchCard key={m.id} {...m} />)}
          </div>
        )}

        {tab === 'standings' && (
          standings.length === 0 ? <p className="text-center text-muted/50 py-8">No standings data yet</p> :
          <Card className="overflow-hidden p-0">
            <StandingsTable standings={standings.map(s => ({
              teamName: s.teamName,
              played: s.played ?? 0, won: s.won ?? 0, drawn: s.drawn ?? 0, lost: s.lost ?? 0,
              goalsFor: s.goalsFor ?? 0, goalsAgainst: s.goalsAgainst ?? 0,
              goalDifference: s.goalDifference ?? 0, points: s.points ?? 0,
            }))} />
          </Card>
        )}

        {tab === 'scorers' && (
          <div className="space-y-2">
            {topScorers.length === 0 ? <p className="text-center text-muted/50 py-8">No goals recorded</p> :
              topScorers.map((s, i) => (
                <div key={s.name} className="glass rounded-xl p-3 flex items-center gap-3">
                  <span className="text-muted/50 font-mono text-sm w-6">{i + 1}</span>
                  <span className="flex-1 font-medium">{s.name}</span>
                  <span className="text-primary font-bold">{s.goals} ⚽</span>
                </div>
              ))}
          </div>
        )}

        {tab === 'report' && (
          <Card className="p-6 text-center">
            <p className="text-muted mb-4">Generate a comprehensive PDF report for this tournament.</p>
            <Button onClick={() => router.push(`/tournaments/${id}/report`)}>
              <FileText size={16} /> Generate Tournament Report
            </Button>
          </Card>
        )}

        {/* Delete Confirmation Modal */}
        <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Tournament">
          <p className="text-muted text-sm mb-6">
            Are you sure you want to delete this tournament? This action cannot be undone and will permanently remove all associated matches, standings, and reports.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button className="flex-1 bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50" onClick={async () => {
              try {
                await fetch(`/api/tournaments/${id}`, { method: 'DELETE' });
                router.push('/tournaments');
              } catch (e) {
                alert('Failed to delete tournament');
              }
            }}>
              Yes, Delete
            </Button>
          </div>
        </Modal>
      </motion.div>
    </AppLayout>
  );
}
