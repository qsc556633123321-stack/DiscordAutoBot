export default function LoadingSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-lg border border-white/10 bg-white/5" />
      ))}
    </div>
  );
}
