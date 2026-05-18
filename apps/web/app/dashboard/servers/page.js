'use client';

import { useEffect, useState } from 'react';
import GuildCard from '../../../components/GuildCard';
import LoadingSkeleton from '../../../components/LoadingSkeleton';
import { Card, CardDescription, CardTitle } from '../../../components/ui/card';
import { apiFetch } from '../../../lib/api';

export default function ServersPage() {
  const [guilds, setGuilds] = useState([]);
  const [selectedGuildId, setSelectedGuildId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedGuildId(window.localStorage.getItem('guildId') || '');
    apiFetch('/api/guilds').then(async (data) => {
      const enriched = await Promise.all(data.guilds.map(async (guild) => {
        if (!guild.botPresent) return guild;
        try {
          const detail = await apiFetch(`/api/guilds/${guild.id}`);
          return {
            ...guild,
            memberCount: detail.guild.memberCount,
            channelCount: (detail.guild.categories || []).reduce((sum, item) => sum + item.channels.length, 0) + (detail.guild.uncategorized?.length || 0)
          };
        } catch {
          return guild;
        }
      }));
      setGuilds(enriched);
      setLoading(false);
    });
  }, []);

  function selectGuild(id) {
    setSelectedGuildId(id);
    window.localStorage.setItem('guildId', id);
    window.dispatchEvent(new CustomEvent('guild:selected', { detail: id }));
  }

  return (
    <Card>
      <CardTitle>伺服器</CardTitle>
      <CardDescription>選擇要管理的 Discord 伺服器。</CardDescription>
      <div className="mt-5">
        {loading ? <LoadingSkeleton rows={4} /> : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {guilds.map((guild) => (
              <GuildCard key={guild.id} guild={guild} active={selectedGuildId === guild.id} onClick={() => selectGuild(guild.id)} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
