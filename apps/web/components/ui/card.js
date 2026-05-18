import { cn } from '../../lib/utils';

export function Card({ className, ...props }) {
  return (
    <section
      className={cn('rounded-lg border border-white/10 bg-discord-panel p-5 shadow-xl shadow-black/10', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-semibold text-white', className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('mt-1 text-sm text-discord-muted', className)} {...props} />;
}
