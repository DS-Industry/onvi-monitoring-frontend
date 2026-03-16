import React from 'react';

export const CreateOrganizationSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black">
      <aside className="w-full md:w-[280px] shrink-0 border-b md:border-b-0 md:border-r border-[#1f1f1f] py-4 px-4 md:py-8 md:px-6">
        <div className="flex flex-row md:flex-col gap-2">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="flex items-center gap-3 py-2.5 px-2 rounded-lg shrink-0"
            >
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] animate-pulse" />
              <div
                className="hidden sm:block h-4 rounded bg-[#1a1a1a] animate-pulse"
                style={{ width: i === 1 ? 100 : 80 + i * 20 }}
              />
            </div>
          ))}
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0">
        <div className="w-full max-w-[560px] rounded-2xl bg-[#0d0d0d] border border-[#1f1f1f] p-6 md:p-8 shadow-xl shadow-black/20">
          <div className="h-6 w-48 rounded-lg bg-[#1a1a1a] animate-pulse mb-3" />
          <div className="h-4 w-full max-w-md rounded bg-[#1a1a1a] animate-pulse mb-6" />
          <div className="space-y-5">
            <div className="h-12 rounded-xl bg-[#1a1a1a] animate-pulse" />
            <div className="h-12 rounded-xl bg-[#1a1a1a] animate-pulse" />
            <div className="h-12 rounded-xl bg-[#1a1a1a] animate-pulse" />
            <div className="h-12 rounded-xl bg-[#1a1a1a] animate-pulse mt-6" />
          </div>
        </div>
      </main>
    </div>
  );
};
