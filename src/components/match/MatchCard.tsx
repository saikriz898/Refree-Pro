import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Calendar, MapPin } from 'lucide-react';

interface MatchCardProps {
  id: string;
  matchNumber: number;
  teamA: string;
  teamB: string;
  teamAColor?: string;
  teamBColor?: string;
  scoreA?: number;
  scoreB?: number;
  status: string;
  venue: string;
  matchDate: string;
  matchTime: string;
}

export function MatchCard({ id, matchNumber, teamA, teamB, teamAColor, teamBColor, scoreA, scoreB, status, venue, matchDate, matchTime }: MatchCardProps) {
  let displayStatus = status;
  if (status === 'scheduled' && matchDate && matchTime) {
    try {
      const scheduledDate = new Date(`${matchDate}T${matchTime}`);
      const now = new Date();
      if (scheduledDate <= now) {
        displayStatus = 'kickoff';
      }
    } catch {}
  }

  return (
    <Link href={`/matches/${id}`}>
      <Card hover className="group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted font-mono">MATCH #{matchNumber}</span>
          <Badge status={displayStatus} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: teamAColor || '#3b82f6' }} />
            <span className="font-bold text-sm text-foreground truncate">{teamA}</span>
          </div>
          {(status !== 'scheduled') && (
            <span className="score-digit text-2xl text-foreground px-2 shrink-0">{scoreA ?? 0} - {scoreB ?? 0}</span>
          )}
          {status === 'scheduled' && <span className="text-muted text-sm px-2 shrink-0">vs</span>}
          <div className="flex items-center justify-end gap-1.5 flex-1 min-w-0">
            <span className="font-bold text-sm text-foreground truncate text-right">{teamB}</span>
            <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: teamBColor || '#ef4444' }} />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-muted">
          <span className="flex items-center gap-1"><MapPin size={11} />{venue}</span>
          <span className="flex items-center gap-1"><Calendar size={11} />{matchDate} {matchTime}</span>
        </div>
      </Card>
    </Link>
  );
}
