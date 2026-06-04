import { MatchTimer } from '@/lib/timer';

interface EventItemProps {
  minute: number;
  elapsedMs?: number | null;
  type: 'goal' | 'yellow' | 'red' | 'sub';
  playerName: string;
  teamSide?: 'home' | 'away';
  isUndone?: boolean;
}

export function EventItem({ minute, elapsedMs, type, playerName, teamSide = 'home', isUndone }: EventItemProps) {
  const timeDisplay = elapsedMs !== null && elapsedMs !== undefined
    ? MatchTimer.formatDisplay(elapsedMs)
    : `${minute}'`;

  return (
    <div className={`grid grid-cols-[1fr_auto_1fr] gap-4 items-center py-2 px-2 ${isUndone ? 'opacity-40 line-through' : ''}`}>
      {/* Home Side */}
      <div className="flex justify-end items-center gap-2 text-right">
        {teamSide === 'home' && (
          <>
            <span className="text-sm font-medium truncate">{playerName}</span>
            <span className="text-xs text-muted tabular-nums">{timeDisplay}</span>
          </>
        )}
      </div>

      {/* Center Icon */}
      <div className="flex justify-center items-center w-6 shrink-0">
        {type === 'goal' && <span className="text-base">⚽</span>}
        {type === 'red' && <div className="w-3 h-4 bg-red-500 rounded-[2px]" />}
        {type === 'yellow' && <div className="w-3 h-4 bg-yellow-400 rounded-[2px]" />}
        {type === 'sub' && <span className="text-base">🔄</span>}
      </div>

      {/* Away Side */}
      <div className="flex justify-start items-center gap-2 text-left">
        {teamSide === 'away' && (
          <>
            <span className="text-xs text-muted tabular-nums">{timeDisplay}</span>
            <span className="text-sm font-medium truncate">{playerName}</span>
          </>
        )}
      </div>
    </div>
  );
}
