'use client';

import { useEffect, useState } from 'react';
import { Clock, Sparkles } from 'lucide-react';
import DashboardCards from '../../components/DashboardCards';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { Card, CardDescription, CardTitle } from '../../components/ui/card';
import { apiFetch } from '../../lib/api';
import { useGuildId } from '../../lib/useGuild';

export default function DashboardPage() {
  const guildId = useGuildId();
  const [bot, setBot] = useState(null);
  const [guild, setGuild] = useState(null);
  const [aiCount, setAiCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/bot/status').then(setBot);
  }, []);

  useEffect(() => {
    if (!guildId) return;
    setLoading(true);
    Promise.all([
      apiFetch(`/api/guilds/${guildId}`),
      apiFetch(`/api/guilds/${guildId}/ai-suggestions`).catch(() => ({ suggestions: [] }))
    ]).then(([guildData, aiData]) => {
      setGuild(guildData.guild);
      setAiCount(aiData.suggestions?.length || 0);
      setLoading(false);
    });
  }, [guildId]);

  return (
    <div className="space-y-5">
      <DashboardCards bot={bot} guild={guild} aiCount={aiCount} loading={loading} />

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-discord-blurple/20 p-2 text-discord-blurple">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>最近整理紀錄</CardTitle>
              <CardDescription>Web MVP 先顯示操作摘要，後續可接 server-logs。</CardDescription>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {loading ? (
              <LoadingSkeleton rows={3} />
            ) : (
              ['Dashboard 已連接 Discord OAuth2', '已讀取伺服器分類與頻道', '可從 AI Organize 產生整理預覽'].map((item) => (
                <div key={item} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-discord-muted">
                  {item}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="rounded-lg border border-discord-blurple/30 bg-discord-blurple/10 p-4">
            <Sparkles className="h-6 w-6 text-discord-blurple" />
            <h3 className="mt-3 font-semibold text-white">Community OS MVP</h3>
            <p className="mt-2 text-sm leading-6 text-discord-muted">
              目前支援伺服器選擇、頻道樹、Panel 編輯、公告發送、角色檢視與 AI 整理預覽。
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
