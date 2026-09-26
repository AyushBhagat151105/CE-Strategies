"use client";

import React, { useState } from "react";
import { Database, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface IngestTriggerProps {
  onIngestComplete?: () => void;
  className?: string;
}

export function IngestTrigger({ onIngestComplete, className = "" }: IngestTriggerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    total?: number;
  } | null>(null);

  const handleIngest = async () => {
    setLoading(true);
    setResult(null);

    const startTime = performance.now();

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
      });

      const data = await res.json();
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);

      if (res.ok && data.success) {
        setResult({
          success: true,
          message: `Ingested ${data.totalRowsProcessed?.toLocaleString() ?? 8025} tweets in ${elapsed}s`,
          total: data.totalRowsProcessed,
        });
        onIngestComplete?.();
      } else {
        setResult({
          success: false,
          message: data.error || "Ingestion encountered an error",
        });
      }
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : "Failed to connect to ingestion endpoint",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-3 ${className}`}>
      <button
        type="button"
        disabled={loading}
        onClick={handleIngest}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            <span>Ingesting 8,026 Tweets...</span>
          </>
        ) : (
          <>
            <Database className="h-4 w-4" />
            <span>Reload 8,026 Dataset</span>
          </>
        )}
      </button>

      {result && (
        <div
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium animate-in fade-in duration-200 ${
            result.success
              ? "border-emerald-800/80 bg-emerald-950/60 text-emerald-300"
              : "border-red-800/80 bg-red-950/60 text-red-300"
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          )}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
}
