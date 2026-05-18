import { Check, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardDescription, CardTitle } from './ui/card';

function tone(confidence) {
  if (confidence === 'high' || confidence === '高') return 'good';
  if (confidence === 'medium' || confidence === '中') return 'warn';
  return 'danger';
}

export default function AIOrganizeTable({ suggestions = [], moves = [] }) {
  return (
    <Card>
      <CardTitle>AI 整理建議</CardTitle>
      <CardDescription>檢查建議後再決定是否回到 Discord 執行整理。</CardDescription>
      <div className="mt-5 overflow-hidden rounded-lg border border-white/10">
        <div className="grid grid-cols-[1fr_1fr_120px_180px] bg-white/5 px-4 py-3 text-xs uppercase tracking-wide text-discord-muted">
          <div>頻道</div>
          <div>建議分類 / 搬移</div>
          <div>信心</div>
          <div>操作</div>
        </div>
        {[...moves, ...suggestions].map((item, index) => (
          <div key={`${item.channelName || item.channel_name}-${index}`} className="grid grid-cols-[1fr_1fr_120px_180px] items-center border-t border-white/10 px-4 py-3 text-sm">
            <div className="text-white">{item.channelName || item.channel_name}</div>
            <div className="text-discord-muted">
              {item.currentCategoryName ? `${item.currentCategoryName} -> ${item.targetCategoryName}` : item.suggested_category || item.suggestedCategory || '-'}
            </div>
            <div><Badge tone={tone(item.confidence)}>{item.confidence || 'low'}</Badge></div>
            <div className="flex gap-2">
              <Button variant="secondary" className="h-8 px-3" disabled><Check className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" className="h-8 px-3" disabled><X className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        ))}
        {[...moves, ...suggestions].length === 0 && (
          <div className="p-6 text-sm text-discord-muted">目前沒有建議。先產生 auto-organize preview 或等待 AI 建議。</div>
        )}
      </div>
    </Card>
  );
}
