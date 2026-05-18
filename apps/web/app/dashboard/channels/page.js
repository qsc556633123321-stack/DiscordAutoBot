'use client';

import { useEffect, useState } from 'react';
import ChannelTree from '../../../components/ChannelTree';
import LoadingSkeleton from '../../../components/LoadingSkeleton';
import { Card, CardDescription, CardTitle } from '../../../components/ui/card';
import { apiFetch } from '../../../lib/api';
import { useGuildId } from '../../../lib/useGuild';

export default function ChannelsPage() {
  const guildId = useGuildId();
  const [data, setData] = useState(null);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!guildId) return;
    setLoading(true);
    apiFetch(`/api/guilds/${guildId}/channels`).then((next) => {
      setData(next);
      setLoading(false);
    });
  }, [guildId]);

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <Card>
        <CardTitle>頻道樹</CardTitle>
        <CardDescription>分類樹狀結構，支援收合、頻道圖示與 active highlight。</CardDescription>
        <div className="mt-5">
          {loading ? <LoadingSkeleton rows={5} /> : (
            <ChannelTree
              categories={data?.categories || []}
              uncategorized={data?.uncategorized || []}
              activeChannelId={active?.id}
              onSelect={setActive}
            />
          )}
        </div>
      </Card>

      <Card>
        <CardTitle>頻道資訊</CardTitle>
        {active ? (
          <div className="mt-5 space-y-3 text-sm text-discord-muted">
            <div className="rounded-lg bg-white/5 p-3">
              <div className="text-xs uppercase tracking-wide">Name</div>
              <div className="mt-1 text-white">{active.name}</div>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <div className="text-xs uppercase tracking-wide">Type</div>
              <div className="mt-1 text-white">{active.type}</div>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <div className="text-xs uppercase tracking-wide">ID</div>
              <div className="mt-1 break-all text-white">{active.id}</div>
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm text-discord-muted">選擇左側頻道後會顯示詳細資訊。</p>
        )}
      </Card>
    </div>
  );
}
