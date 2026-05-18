import { Bot, BrainCircuit, Hash, Server, Users } from 'lucide-react';
import { Card } from './ui/card';

const icons = {
  bot: Bot,
  guilds: Server,
  channels: Hash,
  members: Users,
  ai: BrainCircuit
};

export default function DashboardCards({ bot, guild, aiCount = 0, loading }) {
  const channelCount = (guild?.categories || []).reduce((sum, item) => sum + item.channels.length, 0) + (guild?.uncategorized?.length || 0);
  const items = [
    ['bot', 'Bot 狀態', bot?.ready ? '在線' : '離線', 'Gateway 連線狀態'],
    ['guilds', 'Guild 數量', String(bot?.guilds ?? '-'), 'Bot 可見伺服器'],
    ['channels', 'Channel 數量', String(channelCount || '-'), '目前選擇伺服器'],
    ['members', 'Member 數量', String(guild?.memberCount ?? '-'), 'Discord 成員數'],
    ['ai', 'AI 建議', String(aiCount), '待審核整理建議']
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map(([key, title, value, desc]) => {
        const Icon = icons[key];
        return (
          <Card key={key} className="relative overflow-hidden">
            <div className="absolute right-3 top-3 rounded-lg bg-white/5 p-2 text-discord-blurple">
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-sm text-discord-muted">{title}</div>
            <div className="mt-4 text-3xl font-bold text-white">
              {loading ? <span className="block h-8 w-20 animate-pulse rounded bg-white/10" /> : value}
            </div>
            <div className="mt-2 text-xs text-discord-muted">{desc}</div>
          </Card>
        );
      })}
    </div>
  );
}
