export default function Loading() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Nav skeleton */}
      <div className="flex items-center justify-between px-8 py-[0.85rem] border-b border-border">
        <div className="w-16 h-5 bg-surface rounded animate-pulse" />
        <div className="flex gap-6">
          <div className="w-14 h-4 bg-surface rounded animate-pulse" />
          <div className="w-20 h-4 bg-surface rounded animate-pulse" />
        </div>
        <div className="w-20 h-7 bg-surface rounded-md animate-pulse" />
      </div>
      {/* Ticker skeleton */}
      <div className="bg-[#0a0a0a] border-b border-border px-8 py-[0.4rem] h-8" />
      {/* Hero skeleton */}
      <div className="px-8 pt-12 pb-10">
        <div className="w-48 h-5 bg-surface rounded-full animate-pulse mb-4" />
        <div className="w-80 h-16 bg-surface rounded-lg animate-pulse mb-4" />
        <div className="w-64 h-4 bg-surface rounded animate-pulse mb-8" />
        <div className="h-14 bg-surface border border-border rounded-[10px] animate-pulse" />
      </div>
      {/* Category tabs */}
      <div className="flex border-b border-border px-8 gap-2">
        {[80, 64, 56, 64, 64, 60].map((w, i) => (
          <div key={i} className={`w-[${w}px] h-10 bg-surface rounded animate-pulse my-1`} style={{ width: w }} />
        ))}
      </div>
      {/* Cards */}
      <div className="grid grid-cols-3 gap-px bg-border border-t border-b border-border mt-6">
        {[0,1,2].map(i => (
          <div key={i} className="bg-bg p-6">
            <div className="w-full h-20 bg-surface rounded-[7px] animate-pulse mb-4" />
            <div className="w-20 h-4 bg-surface rounded animate-pulse mb-2" />
            <div className="w-48 h-4 bg-surface rounded animate-pulse mb-1" />
            <div className="w-32 h-3 bg-surface rounded animate-pulse" />
          </div>
        ))}
      </div>
      {/* List rows */}
      <div className="mt-4">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="grid grid-cols-[56px_1fr_120px_90px] items-center px-8 py-3 border-b border-[#0f0f0f] gap-4">
            <div className="w-8 h-10 bg-surface rounded animate-pulse" />
            <div className="w-48 h-4 bg-surface rounded animate-pulse" />
            <div className="w-24 h-4 bg-surface rounded animate-pulse" />
            <div className="w-16 h-4 bg-surface rounded animate-pulse ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
