import React, { useEffect } from 'react';

interface ChunkErrorBoundaryProps {
  children: React.ReactNode;
}

const ChunkErrorBoundary: React.FC<ChunkErrorBoundaryProps> = ({ children }) => {
  useEffect(() => {
    function handleChunkError(e: PromiseRejectionEvent) {
      const reason = e.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      
      if (message.includes('Failed to fetch dynamically imported module')) {
        console.warn("Chunk load error detected, reloading app…");
        window.location.reload();
      }
    }

    function handleScriptError(e: Event) {
      const target = e.target as HTMLElement;
      if (target?.tagName === "LINK" && (target as any)?.href?.includes("/assets/")) {
        console.warn("CSS chunk load error, reloading app…");
        window.location.reload();
      }
    }

    window.addEventListener("unhandledrejection", handleChunkError);
    window.addEventListener("error", handleScriptError, true);
    
    return () => {
      window.removeEventListener("unhandledrejection", handleChunkError);
      window.removeEventListener("error", handleScriptError, true);
    };
  }, []);

  return <>{children}</>;
};

export default ChunkErrorBoundary;
