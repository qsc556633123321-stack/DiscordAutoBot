import { Settings } from 'lucide-react';
import { Card, CardDescription, CardTitle } from '../../../components/ui/card';

export default function SettingsPage() {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-discord-blurple/20 p-2 text-discord-blurple">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Dashboard 設定頁預留。OAuth、Supabase、Bot 權限狀態會在後續版本集中到這裡。</CardDescription>
        </div>
      </div>
    </Card>
  );
}
