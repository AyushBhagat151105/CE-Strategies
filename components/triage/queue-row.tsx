import { ArrowUpCircle, CheckCircle2, Send, XCircle } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CrisisTweetRecord, UrgencyLevel } from "@/lib/types";

const URGENCY_BADGE_VARIANT: Record<UrgencyLevel, BadgeProps["variant"]> = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  NONE: "outline",
};

interface QueueRowProps {
  tweet: CrisisTweetRecord;
  focused: boolean;
  pending: boolean;
  onOpenDetail: () => void;
  onVerify: () => void;
  onEscalate: () => void;
  onDispatch: () => void;
  onDismiss: () => void;
}

export function QueueRow({
  tweet,
  focused,
  pending,
  onOpenDetail,
  onVerify,
  onEscalate,
  onDispatch,
  onDismiss,
}: QueueRowProps) {
  return (
    <div
      onClick={onOpenDetail}
      className={`flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors cursor-pointer ${
        focused ? "border-primary bg-primary/10" : "border-border/60 bg-card hover:bg-secondary/40"
      } ${pending ? "opacity-50 pointer-events-none" : ""}`}
    >
      <div className="w-24 shrink-0">
        <Badge variant={URGENCY_BADGE_VARIANT[tweet.urgency]}>{tweet.urgency}</Badge>
      </div>
      <div className="w-32 shrink-0">
        <Badge variant="outline">{tweet.category}</Badge>
      </div>
      <div className="w-28 shrink-0 truncate text-xs text-muted-foreground">
        {tweet.locationName ?? "—"}
      </div>
      <p className="min-w-0 flex-1 truncate">{tweet.rawText}</p>
      <div className="flex shrink-0 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        <Button size="icon" variant="outline" onClick={onVerify} title="Verify (V)">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
        </Button>
        <Button size="icon" variant="outline" onClick={onEscalate} title="Escalate (E)">
          <ArrowUpCircle className="h-3.5 w-3.5 text-amber-400" />
        </Button>
        <Button size="icon" variant="outline" onClick={onDispatch} title="Dispatch (D)">
          <Send className="h-3.5 w-3.5 text-blue-400" />
        </Button>
        <Button size="icon" variant="outline" onClick={onDismiss} title="Dismiss (X)">
          <XCircle className="h-3.5 w-3.5 text-red-400" />
        </Button>
      </div>
    </div>
  );
}
