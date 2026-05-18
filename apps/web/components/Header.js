'use client';

import { Activity, Bell, Search } from 'lucide-react';
import { Badge } from './ui/badge';

export default function Header({ bot, me, activeGuild }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0f17]/85 px-5 py-4 backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.32em] text-discord-muted">Discord Community OS</div>
          <h1 className="mt-1 text-xl font-semibold text-white">
            {activeGuild ? activeGuild.name : '社群管理控制台'}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden h-10 min-w-64 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-discord-muted md:flex">
            <Search className="h-4 w-4" />
            搜尋頻道、面板、身分組
          </div>
          <Badge tone={bot?.ready ? 'good' : 'danger'}>
            <Activity className="mr-1 h-3 w-3" />
            Bot {bot?.ready ? '在線' : '離線'}
          </Badge>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-discord-muted transition hover:bg-white/10 hover:text-white">
            <Bell className="h-4 w-4" />
          </button>
          {me && <Badge>{me.username}</Badge>}
        </div>
      </div>
    </header>
  );
}
