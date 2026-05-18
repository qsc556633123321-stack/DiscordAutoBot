'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardDescription, CardTitle } from '../../../components/ui/card';
import { Input, Label, Select, Textarea } from '../../../components/ui/form';
import { apiFetch } from '../../../lib/api';
import { useGuildId } from '../../../lib/useGuild';

export default function AnnouncementsPage() {
  const guildId = useGuildId();
  const [structure, setStructure] = useState(null);
  const [channelId, setChannelId] = useState('');
  const [title, setTitle] = useState('社群公告');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (guildId) apiFetch(`/api/guilds/${guildId}/channels`).then(setStructure);
  }, [guildId]);

  const textChannels = useMemo(() => (
    structure?.categories?.flatMap((category) => category.channels
      .filter((channel) => ['GuildText', 'GuildAnnouncement'].includes(channel.type))
      .map((channel) => ({ ...channel, categoryName: category.name }))) || []
  ), [structure]);

  async function send() {
    setStatus('Sending announcement...');
    await apiFetch(`/api/guilds/${guildId}/announcements`, {
      method: 'POST',
      body: JSON.stringify({ channelId, title, message })
    });
    setStatus('Announcement sent.');
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <Card>
        <CardTitle>Send Announcement</CardTitle>
        <CardDescription>Publish a Discord embed announcement through the bot.</CardDescription>
        <div className="mt-5 grid gap-4">
          <div>
            <Label>Target channel</Label>
            <Select value={channelId} onChange={(event) => setChannelId(event.target.value)}>
              <option value="">Select announcement channel</option>
              {textChannels.map((channel) => (
                <option key={channel.id} value={channel.id}>{channel.categoryName} / {channel.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea rows={12} value={message} onChange={(event) => setMessage(event.target.value)} />
          </div>
          <Button onClick={send} disabled={!guildId || !channelId || !message}>Send Announcement</Button>
          {status && <p className="text-sm text-discord-muted">{status}</p>}
        </div>
      </Card>

      <Card>
        <CardTitle>Embed Preview</CardTitle>
        <div className="mt-5 rounded-md border-l-4 border-discord-blurple bg-[#101521] p-4">
          <div className="font-bold text-white">{title}</div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-discord-muted">{message || 'Announcement message preview'}</p>
        </div>
      </Card>
    </div>
  );
}
