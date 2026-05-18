'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  BrainCircuit,
  LayoutDashboard,
  ListTree,
  MessagesSquare,
  PanelTop,
  ScrollText,
  Server,
  Settings,
  Shield,
  Ticket
} from 'lucide-react';
import { cn } from '../lib/utils';

const nav = [
  ['總覽', '/dashboard', LayoutDashboard],
  ['伺服器', '/dashboard/servers', Server],
  ['頻道', '/dashboard/channels', ListTree],
  ['面板', '/dashboard/panels', PanelTop],
  ['身分組', '/dashboard/roles', Shield],
  ['AI 整理', '/dashboard/organize', BrainCircuit],
  ['客服單', '/dashboard/tickets', Ticket],
  ['紀錄', '/dashboard/logs', ScrollText],
  ['設定', '/dashboard/settings', Settings]
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-white/10 bg-[#0d111b] p-4 md:block">
      <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-discord-blurple text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-white">Community OS</div>
            <div className="text-xs text-discord-muted">Discord 管理後台</div>
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {nav.map(([label, href, Icon]) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition',
                active
                  ? 'bg-discord-blurple text-white shadow-lg shadow-discord-blurple/20'
                  : 'text-discord-muted hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-lg border border-white/10 bg-[#121827] p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <MessagesSquare className="h-4 w-4 text-discord-blurple" />
          操作提示
        </div>
        <p className="mt-2 text-xs leading-5 text-discord-muted">
          Web MVP 目前以預覽、編輯與發送為主，高風險變更仍保留在 Discord slash commands。
        </p>
      </div>
    </aside>
  );
}
