'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Scoreboard } from '@/components/match/Scoreboard';
import { EventItem } from '@/components/match/EventItem';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { AppLayout } from '@/components/layout/AppLayout';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Edit, Trash2, Play, Lock, FileText, Image as ImageIcon } from 'lucide-react';

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState('');
  const [match, setMatch] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    params.then(async ({ id }) => {
      setId(id);
      const [mr, er] = await Promise.all([fetch(`/api/matches/${id}`), fetch(`/api/matches/${id}/events`)]);
      const d = await mr.json();
      setMatch(d.match); setPlayers(d.players || []);
      setEvents(await er.json());
      setLoading(false);
    });
  }, [params]);

  const tabs = ['overview', 'timeline', 'squads', 'stats'];

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-8 max-w-4xl mx-auto">
        {loading ? <><SkeletonCard /><SkeletonCard /></> : !match ? (
          <div className="text-center py-16 text-white/30">Match not found</div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <button 
                onClick={() => router.push('/matches')} 
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-foreground/10 transition-colors border border-border/50 text-foreground"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <h1 className="text-xl font-bold">Match Details</h1>
            </div>
            <div className="glass rounded-xl p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <Badge status={match.status} />
                <span className="text-xs text-muted">Match {match.matchNumber}</span>
              </div>
              <Scoreboard teamA={match.teamA} teamB={match.teamB}
                scoreA={match.scoreA ?? 0} scoreB={match.scoreB ?? 0}
                teamAColor={match.teamAColor} teamBColor={match.teamBColor} />
              <div className="text-xs text-muted text-center mt-2">
                {match.venue} · {match.matchDate} {match.matchTime}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {match.status === 'scheduled' && (
                <><Button size="sm" variant="secondary" onClick={() => router.push(`/matches/${id}/edit`)}><Edit size={14} />Edit</Button>
                <Button size="sm" variant="danger" onClick={() => router.push(`/matches/${id}/countdown`)}><Play size={14} />Start</Button></>
              )}
              {match.status === 'live' && (
                <Button size="sm" onClick={() => router.push(`/matches/${id}/live`)}><Play size={14} />Resume</Button>
              )}
              {match.status === 'completed' && !match.isLocked && (
                <Button size="sm" variant="secondary" onClick={() => router.push(`/matches/${id}/lock`)}><Lock size={14} />Lock</Button>
              )}
              {(match.status === 'completed') && (
                <><Button size="sm" variant="secondary" onClick={() => router.push(`/matches/${id}/report`)}><FileText size={14} />Report</Button>
                <Button size="sm" variant="secondary" onClick={() => router.push(`/matches/${id}/poster`)}><ImageIcon size={14} />Poster</Button></>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {tabs.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${tab === t ? 'bg-primary text-white' : 'text-muted hover:text-foreground'}`}>
                  {t}
                </button>
              ))}
            </div>

            {tab === 'overview' && (
              <Card>
                {[
                  { label: 'Format', value: match.squadFormat },
                  { label: 'Duration', value: `${match.matchDuration} min` },
                  { label: 'Referee', value: match.refereeName || '—' },
                  { label: 'Tournament', value: match.tournamentId || 'None' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-border/50 text-sm">
                    <span className="text-muted">{label}</span><span>{value}</span>
                  </div>
                ))}
              </Card>
            )}

            {tab === 'timeline' && (
              <div className="space-y-1">
                {events.filter(e => !e.isUndone).map(e => {
                  const type = e.eventType === 'goal' ? 'goal' : e.cardType === 'yellow' ? 'yellow' : e.cardType === 'red' ? 'red' : 'sub';
                  const playerName = e.eventType === 'sub' ? `${e.playerOut} → ${e.playerIn}` : e.playerName;
                  const extraInfo = e.eventType === 'goal' && e.goalType !== 'normal' ? ` (${e.goalType})` : '';
                  return (
                    <EventItem key={e.id} minute={e.minute} elapsedMs={e.elapsedMs}
                      type={type}
                      playerName={`${playerName}${extraInfo}`}
                      teamSide={e.team === 'team_a' ? 'home' : 'away'}
                      isUndone={e.isUndone}
                    />
                  );
                })}
                {events.length === 0 && <p className="text-muted/50 text-sm text-center py-8">No events recorded</p>}
              </div>
            )}

            {tab === 'squads' && (
              <div className="grid grid-cols-2 gap-4">
                {['team_a', 'team_b'].map(team => (
                  <div key={team}>
                    <p className="text-sm font-bold mb-3" style={{ color: team === 'team_a' ? match.teamAColor : match.teamBColor }}>
                      {team === 'team_a' ? match.teamA : match.teamB}
                    </p>
                    {players.filter(p => p.team === team).map(p => (
                      <div key={p.id} className="flex gap-2 text-sm py-1 border-b border-border/50">
                        <span className="text-muted/50 w-5">#{p.jerseyNo ?? '—'}</span>
                        <span>{p.name}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {tab === 'stats' && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: '⚽ Goals', a: events.filter(e => e.eventType === 'goal' && e.team === 'team_a' && !e.isUndone).length, b: events.filter(e => e.eventType === 'goal' && e.team === 'team_b' && !e.isUndone).length },
                  { label: '🟨 Yellow', a: events.filter(e => e.cardType === 'yellow' && e.team === 'team_a' && !e.isUndone).length, b: events.filter(e => e.cardType === 'yellow' && e.team === 'team_b' && !e.isUndone).length },
                  { label: '🟥 Red', a: events.filter(e => e.cardType === 'red' && e.team === 'team_a' && !e.isUndone).length, b: events.filter(e => e.cardType === 'red' && e.team === 'team_b' && !e.isUndone).length },
                  { label: '🔄 Subs', a: events.filter(e => e.eventType === 'sub' && e.team === 'team_a' && !e.isUndone).length, b: events.filter(e => e.eventType === 'sub' && e.team === 'team_b' && !e.isUndone).length },
                ].map(({ label, a, b }) => (
                  <Card key={label} className="text-center p-3">
                    <p className="text-xs text-muted mb-2">{label}</p>
                    <div className="flex justify-around">
                      <span className="font-bold">{a}</span>
                      <span className="font-bold">{b}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
    </AppLayout>
  );
}
