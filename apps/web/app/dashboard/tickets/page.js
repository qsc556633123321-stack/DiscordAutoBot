import { Ticket } from 'lucide-react';
import { Card, CardDescription, CardTitle } from '../../../components/ui/card';

export default function TicketsPage() {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-discord-blurple/20 p-2 text-discord-blurple">
          <Ticket className="h-5 w-5" />
        </div>
        <div>
          <CardTitle>Tickets</CardTitle>
          <CardDescription>客服單管理頁預留。MVP 目前由 Discord button 與 slash command 管理 Ticket。</CardDescription>
        </div>
      </div>
    </Card>
  );
}
