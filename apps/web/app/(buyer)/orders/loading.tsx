export default function Loading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="flex items-center justify-between px-8 py-[0.85rem] border-b border-border">
        <div className="w-16 h-5 bg-surface rounded animate-pulse" />
        <div className="w-20 h-7 bg-surface rounded-md animate-pulse" />
      </div>
      <div className="px-8 py-8">
        <div className="w-32 h-8 bg-surface rounded-lg animate-pulse mb-8" />
        <div className="flex flex-col gap-2">
          {[0,1,2].map(i => (
            <div key={i} className="flex items-center gap-4 px-4 py-4 bg-surface border border-border rounded-lg animate-pulse">
              <div className="flex-1">
                <div className="w-48 h-4 bg-bg rounded mb-2" />
                <div className="w-64 h-3 bg-bg rounded" />
              </div>
              <div className="w-14 h-5 bg-bg rounded" />
              <div className="w-16 h-5 bg-bg rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
