'use client';

import { useEffect, useMemo, useState } from 'react';
import PanelEditor from '../../../components/PanelEditor';
import { apiFetch } from '../../../lib/api';
import { useGuildId } from '../../../lib/useGuild';

const defaultPanel = {
  panelType: 'custom',
  title: 'Discord Community OS',
  content: '',
  color: '#5865F2',
  buttons: '',
  footer: 'Discord Community OS',
  image: ''
};

export default function PanelsPage() {
  const guildId = useGuildId();
  const [structure, setStructure] = useState(null);
  const [channelId, setChannelId] = useState('');
  const [panel, setPanel] = useState(defaultPanel);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (guildId) apiFetch(`/api/guilds/${guildId}/channels`).then(setStructure);
  }, [guildId]);

  const textChannels = useMemo(() => (
    structure?.categories?.flatMap((category) => category.channels
      .filter((channel) => ['GuildText', 'GuildAnnouncement'].includes(channel.type))
      .map((channel) => ({ ...channel, categoryName: category.name }))) || []
  ), [structure]);

  useEffect(() => {
    if (!guildId || !channelId) return;
    apiFetch(`/api/guilds/${guildId}/panels/${channelId}`).then((data) => {
      if (!data.draft) {
        setPanel(defaultPanel);
        return;
      }
      setPanel({
        panelType: data.draft.panel_type || data.draft.panelType || 'custom',
        title: data.draft.title || 'Discord Community OS',
        content: data.draft.content || '',
        color: data.draft.color || '#5865F2',
        buttons: data.draft.buttons || '',
        footer: data.draft.footer || 'Discord Community OS',
        image: data.draft.image || ''
      });
    });
  }, [guildId, channelId]);

  async function saveDraft() {
    setStatus('正在儲存草稿...');
    await apiFetch(`/api/guilds/${guildId}/panels/${channelId}`, {
      method: 'PUT',
      body: JSON.stringify(panel)
    });
    setStatus('草稿已儲存。');
  }

  async function publishPanel() {
    setStatus('正在更新 Discord Panel...');
    await apiFetch(`/api/guilds/${guildId}/panels/${channelId}/publish`, {
      method: 'POST',
      body: JSON.stringify(panel)
    });
    setStatus('Discord Panel 已更新。');
  }

  return (
    <PanelEditor
      channels={textChannels}
      channelId={channelId}
      setChannelId={setChannelId}
      panel={panel}
      setPanel={setPanel}
      onSave={saveDraft}
      onPublish={publishPanel}
      status={status}
    />
  );
}
