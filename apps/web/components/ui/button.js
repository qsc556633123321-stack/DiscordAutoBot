import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-discord-blurple text-white hover:brightness-110',
  secondary: 'bg-white/10 text-white hover:bg-white/15',
  destructive: 'bg-red-500/90 text-white hover:bg-red-500',
  ghost: 'text-discord-muted hover:bg-white/10 hover:text-white'
};

export function Button({ className, variant = 'default', ...props }) {
  return (
    <button
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-45',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
