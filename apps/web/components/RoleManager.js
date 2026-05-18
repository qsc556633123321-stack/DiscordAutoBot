import { Eye, EyeOff, Users } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardDescription, CardTitle } from './ui/card';

export default function RoleManager({ roles = [] }) {
  return (
    <Card>
      <CardTitle>身分組管理</CardTitle>
      <CardDescription>MVP 先顯示角色資訊與可見性切換狀態，實際權限仍由 slash command 套用。</CardDescription>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {roles.map((role) => (
          <div key={role.id} className="rounded-lg border border-white/10 bg-discord-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="h-4 w-4 rounded-full" style={{ background: role.color === '#000000' ? '#5865F2' : role.color }} />
                <div className="truncate font-semibold text-white">{role.name}</div>
              </div>
              <Badge tone={role.editable ? 'good' : 'warn'}>{role.editable ? '可管理' : '鎖定'}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-discord-muted">
              <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> 成員數待同步</span>
              <span>Position {role.position}</span>
            </div>
            <button className="mt-4 inline-flex items-center gap-2 rounded-md bg-white/5 px-3 py-2 text-sm text-discord-muted transition hover:bg-white/10 hover:text-white">
              {role.editable ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              頻道可見性：{role.editable ? '可套用' : '受保護'}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
