import { CheckCircle2, Hash, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';

function initials(name) {
  return (name || '?').slice(0, 2).toUpperCase();
}

export default function GuildCard({ guild, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/10',
        active ? 'border-discord-blurple bg-discord-blurple/15' : 'border-white/10 bg-discord-panel'
      )}
    >
      <div className="flex items-start gap-3">
        {guild.iconUrl ? (
          <img src={guild.iconUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 font-bold text-white">
            {initials(guild.name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-white">{guild.name}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone={guild.botPresent ? 'good' : 'warn'}>
              <CheckCircle2 className="mr-1 h-3 w-3" />
              {guild.botPresent ? 'Bot 已加入' : 'Bot 未加入'}
            </Badge>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-discord-muted">
        <div className="rounded-md bg-white/5 px-3 py-2">
          <Users className="mb-1 h-3.5 w-3.5" />
          {guild.memberCount ?? '-'} 成員
        </div>
        <div className="rounded-md bg-white/5 px-3 py-2">
          <Hash className="mb-1 h-3.5 w-3.5" />
          {guild.channelCount ?? '-'} 頻道
        </div>
      </div>
    </button>
  );
}
