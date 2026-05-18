import { ScrollText } from 'lucide-react';
import { Card, CardDescription, CardTitle } from '../../../components/ui/card';

export default function LogsPage() {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-discord-blurple/20 p-2 text-discord-blurple">
          <ScrollText className="h-5 w-5" />
        </div>
        <div>
          <CardTitle>Logs</CardTitle>
          <CardDescription>整理紀錄與系統事件頁預留。後續可串接 server-logs 或 Supabase audit log。</CardDescription>
        </div>
      </div>
    </Card>
  );
}
