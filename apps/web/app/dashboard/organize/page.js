'use client';

import { useEffect, useState } from 'react';
import { BrainCircuit } from 'lucide-react';
import AIOrganizeTable from '../../../components/AIOrganizeTable';
import { Button } from '../../../components/ui/button';
import { Card, CardDescription, CardTitle } from '../../../components/ui/card';
import { apiFetch } from '../../../lib/api';
import { useGuildId } from '../../../lib/useGuild';

export default function OrganizePage() {
  const guildId = useGuildId();
  const [plan, setPlan] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (guildId) apiFetch(`/api/guilds/${guildId}/ai-suggestions`).then((data) => setSuggestions(data.suggestions || []));
  }, [guildId]);

  async function runPreview() {
    setStatus('正在產生 AI / 規則整理預覽...');
    const result = await apiFetch(`/api/guilds/${guildId}/auto-organize`, { method: 'POST' });
    setPlan(result.plan);
    setStatus('預覽已產生。MVP 目前不從 Web 直接搬移頻道。');
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-discord-blurple/20 p-2 text-discord-blurple">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>AI 整理</CardTitle>
              <CardDescription>檢視 AI 建議與 auto-organize 搬移預覽。</CardDescription>
            </div>
          </div>
          <Button onClick={runPreview} disabled={!guildId}>產生搬移預覽</Button>
        </div>
        {status && <p className="mt-4 text-sm text-discord-muted">{status}</p>}
      </Card>

      <AIOrganizeTable suggestions={suggestions} moves={plan?.moves || []} />
    </div>
  );
}
