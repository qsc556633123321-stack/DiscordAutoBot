import { cn } from '../../lib/utils';

export function Badge({ className, tone = 'default', ...props }) {
  const tones = {
    default: 'border-white/10 bg-white/10 text-discord-muted',
    good: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    warn: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    danger: 'border-red-400/30 bg-red-400/10 text-red-200'
  };
  return (
    <span
      className={cn('inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium', tones[tone], className)}
      {...props}
    />
  );
}
