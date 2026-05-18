'use client';

import { useEffect, useMemo, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ServerSelector from './ServerSelector';
import { Card, CardDescription, CardTitle } from './ui/card';
import { apiFetch } from '../lib/api';

export default function DashboardShell({ children }) {
  const [me, setMe] = useState(null);
  const [guilds, setGuilds] = useState([]);
  const [selectedGuildId, setSelectedGuildId] = useState('');
  const [bot, setBot] = useState(null);
  const [structure, setStructure] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/me')
      .then((data) => {
        if (data.ok === false) {
          window.location.href = '/login';
          return;
        }
        setMe(data.user);
      });
    apiFetch('/api/guilds')
      .then((data) => {
        if (data.ok === false) setError(data.error);
        setGuilds(data.guilds);
        const saved = window.localStorage.getItem('guildId');
        const nextGuildId = saved || data.guilds[0]?.id || '';
        setSelectedGuildId(nextGuildId);
        if (nextGuildId) window.localStorage.setItem('guildId', nextGuildId);
      })
      .catch((err) => setError(err.message));
    apiFetch('/api/bot/status').then(setBot).catch(() => null);
  }, []);

  useEffect(() => {
    if (!selectedGuildId) return;
    apiFetch(`/api/guilds/${selectedGuildId}`)
      .then((data) => {
        if (data.ok === false) setError(data.error);
        setStructure(data.guild);
      });
  }, [selectedGuildId]);

  function selectGuild(id) {
    setSelectedGuildId(id);
    window.localStorage.setItem('guildId', id);
    window.dispatchEvent(new CustomEvent('guild:selected', { detail: id }));
  }

  const enrichedGuilds = useMemo(() => guilds.map((guild) => (
    guild.id === selectedGuildId && structure
      ? {
          ...guild,
          memberCount: structure.memberCount,
          channelCount: (structure.categories || []).reduce((sum, item) => sum + item.channels.length, 0) + (structure.uncategorized?.length || 0)
        }
      : guild
  )), [guilds, selectedGuildId, structure]);

  return (
    <div className="flex min-h-screen text-discord-text">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Header bot={bot} me={me} activeGuild={structure} />
        <section className="space-y-5 p-5" data-guild-id={selectedGuildId}>
          {error && (
            <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
              API 錯誤：{error}
            </div>
          )}
          <Card>
            <CardTitle>選擇伺服器</CardTitle>
            <CardDescription>點擊 Guild Card 切換目前操作的 Discord 伺服器。</CardDescription>
            <div className="mt-4">
              <ServerSelector guilds={enrichedGuilds} selectedGuildId={selectedGuildId} onSelect={selectGuild} />
            </div>
          </Card>
          {children}
        </section>
      </main>
    </div>
  );
}
