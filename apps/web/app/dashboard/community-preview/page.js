'use client';

import { useEffect, useState } from 'react';
import LoadingSkeleton from '../../../components/LoadingSkeleton';
import { Card, CardDescription, CardTitle } from '../../../components/ui/card';
import { apiFetch } from '../../../lib/api';
import { useGuildId } from '../../../lib/useGuild';

const labels = { KEEP: '維持', RENAME: '改名', MOVE: '移動', CREATE: '建立', PERMISSION_REVIEW: '權限審核', DUPLICATE_REVIEW: '重複審核', DELETE_CANDIDATE: '刪除候選' };
const reconciliationLabels = { MATCHED: '已驗證', MISSING_BINDING: '缺少綁定', STALE_BINDING: '過期綁定', DUPLICATE_CANDIDATE: '重複候選', AMBIGUOUS_MATCH: '模糊匹配', PERMISSION_DRIFT: '權限漂移', UNMANAGED_RESOURCE: '未管理資源' };
function Tree({ title, categories = [], channels = [] }) {
  return <Card><CardTitle>{title}</CardTitle><div className="mt-4 space-y-3 text-sm">{categories.map((category) => <div key={category.id || category.key} className="border-l-2 border-white/15 pl-3"><div className="font-medium text-white">{category.name || category.displayName}</div>{channels.filter((channel) => channel.parentId === category.id || channel.parentKey === category.key).map((channel) => <div key={channel.id || channel.key} className="mt-1 text-discord-muted">{channel.name || channel.displayName} <span className="text-xs">{channel.id || channel.key}</span></div>)}</div>)}</div></Card>;
}
export default function CommunityPreviewPage() {
  const guildId = useGuildId();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resourceFilter, setResourceFilter] = useState('all');
  useEffect(() => { if (!guildId) return; setLoading(true); apiFetch(`/api/guilds/${guildId}/community-preview`).then((result) => { setData(result); setLoading(false); }); }, [guildId]);
  const actions = data?.diff?.actions || [];
  const desired = data?.desired?.resources || [];
  const desiredCategories = desired.filter((resource) => resource.type === 'category');
  const desiredChannels = desired.filter((resource) => resource.type !== 'category');
  const issues = [...(data?.reconciliation?.issues || [])].filter((issue) => resourceFilter === 'all' || issue.resourceType === resourceFilter).sort((left, right) => `${left.risk}:${left.status}`.localeCompare(`${right.risk}:${right.status}`));
  return <div className="space-y-5">
    <Card><CardTitle>社群結構預覽</CardTitle><CardDescription>僅讀取 Discord 現況與已知綁定；不會建立、移動、改名或修改權限。</CardDescription>
      <div className="mt-4 text-sm text-discord-muted">Guild ID: {guildId || '請先選擇伺服器'} · Snapshot: {data?.snapshot?.capturedAt || '尚未載入'} · Schema: {data?.snapshot?.schemaVersion || '尚未載入'}</div>
    </Card>
    <Card><CardTitle>資料來源與遷移準備</CardTitle><div className="mt-3 text-sm text-discord-muted">正式來源：{data?.migrationReadiness?.primarySource || 'json'} · 資料庫：{data?.migrationReadiness?.databaseStatus || '尚未檢查'} · Dry run 寫入：{data?.migrationReadiness?.migrationDryRun?.writes ?? 0}</div><div className="mt-2 text-xs text-discord-muted">資料庫尚未就緒時，預覽仍只使用現有 JSON；不會自動切換或寫入。</div>{data?.migrationReadiness?.reconciliation?.issues?.length ? <div className="mt-3 space-y-2">{data.migrationReadiness.reconciliation.issues.map((item, index) => <div key={`${item.type}-${item.key}-${index}`} className="rounded border border-white/10 bg-white/5 p-2 text-xs">{item.status} · {item.type} · {item.key} · 風險：{item.risk}</div>)}</div> : null}</Card>
    <div className="grid gap-5 lg:grid-cols-2"><Tree title="目前 Discord 結構" categories={data?.snapshot?.categories} channels={data?.snapshot?.channels} /><Tree title="預期社群結構" categories={desiredCategories} channels={desiredChannels} /></div>
    <Card><CardTitle>資料一致性</CardTitle><div className="mt-3"><select value={resourceFilter} onChange={(event) => setResourceFilter(event.target.value)} className="rounded border border-white/10 bg-black/20 px-2 py-1 text-sm"><option value="all">所有資源</option><option value="category">分類</option><option value="text">文字頻道</option><option value="voice">語音頻道</option></select></div><div className="mt-4 space-y-2">{issues.map((issue, index) => <div key={`${issue.status}-${issue.targetKey || issue.channelId}-${index}`} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm"><div className="font-medium text-white">{reconciliationLabels[issue.status] || issue.status} <span className="ml-2 text-xs text-discord-muted">風險：{issue.risk}</span></div><div className="mt-1 text-discord-muted">{issue.reason}</div><div className="mt-1 break-all text-xs text-discord-muted">Discord ID: {issue.channelId || '未綁定'} · Target: {issue.targetKey || '未管理項目'}</div>{issue.permissionComparison && <div className="mt-1 break-all text-xs text-discord-muted">Recorded: {issue.permissionComparison.recorded} · Observed: {issue.permissionComparison.observed}</div>}</div>)}{!issues.length && <p className="text-sm text-discord-muted">目前沒有一致性問題。</p>}</div></Card>
    <Card><CardTitle>差異清單</CardTitle>{loading ? <div className="mt-4"><LoadingSkeleton rows={6} /></div> : <div className="mt-4 space-y-2">{actions.map((item, index) => <div key={`${item.action}-${item.channelId || item.targetKey}-${index}`} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm"><div className="font-medium text-white">{labels[item.action] || item.action} <span className="ml-2 text-xs text-discord-muted">風險：{item.risk}</span></div><div className="mt-1 text-discord-muted">{item.reason}</div><div className="mt-1 break-all text-xs text-discord-muted">Discord ID: {item.channelId || '未綁定'} · Target: {item.targetKey || '審核項目'}</div></div>)}{!actions.length && <p className="text-sm text-discord-muted">尚無預覽結果。</p>}</div>}</Card>
  </div>;
}
