'use client';

import { Plus, Save, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardDescription, CardTitle } from './ui/card';
import { Input, Label, Select, Textarea } from './ui/form';

const panelTypes = ['custom', 'rules', 'announcement', 'welcome', 'general_chat', 'game_chat', 'game_party', 'support', 'admin'];

export default function PanelEditor({
  channels = [],
  channelId,
  setChannelId,
  panel,
  setPanel,
  onSave,
  onPublish,
  status
}) {
  function update(key, value) {
    setPanel((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr_420px]">
      <Card>
        <CardTitle>面板列表</CardTitle>
        <CardDescription>選擇要管理的頻道面板。</CardDescription>
        <div className="mt-4 max-h-[620px] space-y-2 overflow-auto pr-1">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setChannelId(channel.id)}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${channelId === channel.id ? 'bg-discord-blurple text-white' : 'bg-white/5 text-discord-muted hover:bg-white/10 hover:text-white'}`}
            >
              <div className="font-medium"># {channel.name}</div>
              <div className="text-xs opacity-75">{channel.categoryName}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>編輯面板</CardTitle>
        <CardDescription>可編輯標題、描述、顏色、按鈕、footer 與 image。</CardDescription>
        <div className="mt-5 grid gap-4">
          <div>
            <Label>目標頻道</Label>
            <Select value={channelId} onChange={(event) => setChannelId(event.target.value)}>
              <option value="">選擇文字頻道</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>{channel.categoryName} / {channel.name}</option>
              ))}
            </Select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Panel 類型</Label>
              <Select value={panel.panelType} onChange={(event) => update('panelType', event.target.value)}>
                {panelTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </Select>
            </div>
            <div>
              <Label>Embed 顏色</Label>
              <Input value={panel.color} onChange={(event) => update('color', event.target.value)} placeholder="#5865F2" />
            </div>
          </div>
          <div>
            <Label>標題</Label>
            <Input value={panel.title} onChange={(event) => update('title', event.target.value)} />
          </div>
          <div>
            <Label>描述</Label>
            <Textarea rows={10} value={panel.content} onChange={(event) => update('content', event.target.value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Buttons JSON / 文字草稿</Label>
              <Textarea rows={4} value={panel.buttons} onChange={(event) => update('buttons', event.target.value)} placeholder='[{"label":"建立 Ticket","style":"primary"}]' />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={panel.image} onChange={(event) => update('image', event.target.value)} placeholder="https://..." />
              <div className="mt-4">
                <Label>Footer</Label>
                <Input value={panel.footer} onChange={(event) => update('footer', event.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={onSave} disabled={!channelId}>
              <Save className="mr-2 h-4 w-4" />
              儲存草稿
            </Button>
            <Button onClick={onPublish} disabled={!channelId || !panel.content} variant="secondary">
              <Send className="mr-2 h-4 w-4" />
              更新 Discord Panel
            </Button>
            <Button variant="ghost" disabled>
              <Plus className="mr-2 h-4 w-4" />
              新增按鈕
            </Button>
          </div>
          {status && <p className="text-sm text-discord-muted">{status}</p>}
        </div>
      </Card>

      <Card>
        <CardTitle>Discord Embed 預覽</CardTitle>
        <CardDescription>右側即時預覽。</CardDescription>
        <div className="mt-5 rounded-lg bg-[#0f1320] p-4">
          <div className="rounded-md border-l-4 p-4" style={{ borderColor: panel.color || '#5865F2', background: 'rgba(255,255,255,0.04)' }}>
            <div className="text-lg font-bold text-white">{panel.title || '未命名面板'}</div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-discord-muted">{panel.content || '面板描述預覽'}</p>
            {panel.image && <img src={panel.image} alt="" className="mt-4 max-h-48 rounded-md object-cover" />}
            {panel.footer && <div className="mt-4 border-t border-white/10 pt-3 text-xs text-discord-muted">{panel.footer}</div>}
          </div>
          {panel.buttons && (
            <div className="mt-4 rounded-md bg-white/5 p-3 text-xs text-discord-muted">
              Buttons: {panel.buttons}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
