'use client';

import { useEffect, useState } from 'react';
import LoadingSkeleton from '../../../components/LoadingSkeleton';
import { Card, CardDescription, CardTitle } from '../../../components/ui/card';
import { apiFetch } from '../../../lib/api';
import { useGuildId } from '../../../lib/useGuild';

const labels = { KEEP: '維持', RENAME: '改名', MOVE: '移動', CREATE: '建立', PERMISSION_REVIEW: '權限審核', DUPLICATE_REVIEW: '重複審核', DELETE_CANDIDATE: '刪除候選' };
function Tree({ title, categories = [], channels = [] }) {
  return <Card><CardTitle>{title}</CardTitle><div className="mt-4 space-y-3 text-sm">{categories.map((category) => <div key={category.id || category.key} className="border-l-2 border-white/15 pl-3"><div className="font-medium text-white">{category.name || category.displayName}</div>{channels.filter((channel) => channel.parentId === category.id || channel.parentKey === category.key).map((channel) => <div key={channel.id || channel.key} className="mt-1 text-discord-muted">{channel.name || channel.displayName} <span className="text-xs">{channel.id || channel.key}</span></div>)}</div>)}</div></Card>;
}
export default function CommunityPreviewPage() {
  const guildId = useGuildId();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (!guildId) return; setLoading(true); apiFetch(`/api/guilds/${guildId}/community-preview`).then((result) => { setData(result); setLoading(false); }); }, [guildId]);
  const actions = data?.diff?.actions || [];
  const desired = data?.desired?.resources || [];
  const desiredCategories = desired.filter((resource) => resource.type === 'category');
  const desiredChannels = desired.filter((resource) => resource.type !== 'category');
  return <div className="space-y-5">
    <Card><CardTitle>社群結構預覽</CardTitle><CardDescription>僅讀取 Discord 現況與已知綁定；不會建立、移動、改名或修改權限。</CardDescription>
      <div className="mt-4 text-sm text-discord-muted">Guild ID: {guildId || '請先選擇伺服器'} · Snapshot: {data?.snapshot?.capturedAt || '尚未載入'}</div>
    </Card>
    <div className="grid gap-5 lg:grid-cols-2"><Tree title="目前 Discord 結構" categories={data?.snapshot?.categories} channels={data?.snapshot?.channels} /><Tree title="預期社群結構" categories={desiredCategories} channels={desiredChannels} /></div>
    <Card><CardTitle>差異清單</CardTitle>{loading ? <div className="mt-4"><LoadingSkeleton rows={6} /></div> : <div className="mt-4 space-y-2">{actions.map((item, index) => <div key={`${item.action}-${item.channelId || item.targetKey}-${index}`} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm"><div className="font-medium text-white">{labels[item.action] || item.action} <span className="ml-2 text-xs text-discord-muted">風險：{item.risk}</span></div><div className="mt-1 text-discord-muted">{item.reason}</div><div className="mt-1 break-all text-xs text-discord-muted">Discord ID: {item.channelId || '未綁定'} · Target: {item.targetKey || '審核項目'}</div></div>)}{!actions.length && <p className="text-sm text-discord-muted">尚無預覽結果。</p>}</div>}</Card>
  </div>;
}
