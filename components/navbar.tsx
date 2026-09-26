import Link from "next/link";
import { AlertCircle, Flame, MapPin, Radio, ShieldAlert } from "lucide-react";

export function Navbar() {
  return (
    <header className="border-b border-border/40 bg-card/60 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white">CE Strategies</span>
              <span className="text-xs font-mono uppercase bg-red-950/80 text-red-400 px-1.5 py-0.5 rounded border border-red-800">
                Crisis Ops
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Calgary Flood 2013 Informatics Platform</p>
          </div>
        </div>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <Radio className="h-4 w-4 text-blue-400" />
            Dashboard
          </Link>
          <Link href="/triage" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            Triage Queue
          </Link>
          <Link href="/map" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-emerald-400" />
            Flood Map
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-xs font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            System Live
          </div>
        </div>
      </div>
    </header>
  );
}
