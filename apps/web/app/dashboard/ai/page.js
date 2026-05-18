'use client';

import { useEffect, useState } from 'react';
import { Badge } from '../../../components/ui/badge';
import { Card, CardDescription, CardTitle } from '../../../components/ui/card';
import { apiFetch } from '../../../lib/api';
import { useGuildId } from '../../../lib/useGuild';

export default function AIPage() {
  const guildId = useGuildId();
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (guildId) apiFetch(`/api/guilds/${guildId}/ai-suggestions`).then((data) => setSuggestions(data.suggestions));
  }, [guildId]);

  return (
    <Card>
      <CardTitle>AI Organize Suggestions</CardTitle>
      <CardDescription>Stored AI cleanup suggestions from Supabase. The MVP only displays suggestions.</CardDescription>
      <div className="mt-5 space-y-3">
        {suggestions.length === 0 && (
          <div className="rounded-md bg-discord-card p-4 text-sm text-discord-muted">
            No AI suggestions yet. Run auto-organize with AI from the bot to populate this later.
          </div>
        )}
        {suggestions.map((item) => (
          <div key={item.id || `${item.channel_name}-${item.created_at}`} className="rounded-md border border-white/10 bg-discord-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-semibold text-white">{item.channel_name || 'Unknown channel'}</div>
              <Badge>{item.confidence || 'low'}</Badge>
            </div>
            <p className="mt-2 text-sm text-discord-muted">Suggested category: {item.suggested_category || '-'}</p>
            <p className="mt-2 text-sm text-discord-muted">{item.reason || 'No reason provided.'}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
