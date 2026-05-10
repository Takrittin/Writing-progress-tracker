export default function Loading() {
  return (
    <div className="grid gap-4">
      <div className="h-10 w-64 animate-pulse rounded-full bg-white/48" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="liquid-card h-32 animate-pulse rounded-[24px]" />
        ))}
      </div>
      <div className="liquid-card h-80 animate-pulse rounded-[26px]" />
    </div>
  );
}
