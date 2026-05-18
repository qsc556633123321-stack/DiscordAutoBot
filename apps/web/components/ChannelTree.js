'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, Hash, Volume2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

function ChannelIcon({ type }) {
  return String(type).includes('Voice') ? <Volume2 className="h-4 w-4" /> : <Hash className="h-4 w-4" />;
}

export default function ChannelTree({ categories = [], uncategorized = [], activeChannelId, onSelect }) {
  const [collapsed, setCollapsed] = useState({});

  function toggle(id) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-3">
      {categories.map((category) => {
        const isCollapsed = collapsed[category.id];
        return (
          <Card key={category.id} className="p-3">
            <button
              onClick={() => toggle(category.id)}
              className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left transition hover:bg-white/5"
            >
              <span className="flex items-center gap-2 font-semibold text-white">
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <Folder className="h-4 w-4 text-discord-blurple" />
                {category.name}
              </span>
              <Badge>{category.channels.length} 個頻道</Badge>
            </button>
            {!isCollapsed && (
              <div className="mt-2 space-y-1 pl-7">
                {category.channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => onSelect?.(channel)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition',
                      activeChannelId === channel.id
                        ? 'bg-discord-blurple/20 text-white'
                        : 'text-discord-muted hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <ChannelIcon type={channel.type} />
                    {channel.name}
                    <span className="ml-auto text-xs opacity-70">{channel.type}</span>
                  </button>
                ))}
              </div>
            )}
          </Card>
        );
      })}

      {uncategorized.length > 0 && (
        <Card className="p-3">
          <div className="flex items-center gap-2 px-2 py-2 font-semibold text-white">
            <Folder className="h-4 w-4 text-discord-muted" />
            未分類
          </div>
          <div className="space-y-1 pl-7">
            {uncategorized.map((channel) => (
              <button key={channel.id} onClick={() => onSelect?.(channel)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-discord-muted hover:bg-white/5 hover:text-white">
                <ChannelIcon type={channel.type} />
                {channel.name}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
