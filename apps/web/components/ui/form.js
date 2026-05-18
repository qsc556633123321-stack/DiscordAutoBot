import { cn } from '../../lib/utils';

const control = 'w-full rounded-md border border-white/10 bg-[#101521] px-3 py-2 text-sm text-white outline-none transition placeholder:text-discord-muted focus:border-discord-blurple';

export function Input({ className, ...props }) {
  return <input className={cn(control, className)} {...props} />;
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn(control, 'min-h-32 resize-y', className)} {...props} />;
}

export function Select({ className, ...props }) {
  return <select className={cn(control, className)} {...props} />;
}

export function Label({ className, ...props }) {
  return <label className={cn('text-xs font-medium uppercase tracking-wide text-discord-muted', className)} {...props} />;
}
