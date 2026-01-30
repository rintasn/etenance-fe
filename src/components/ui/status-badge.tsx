"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant = "success" | "warning" | "danger" | "info" | "default";

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  warning: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  danger: "bg-red-100 text-red-700 hover:bg-red-100",
  info: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  default: "bg-slate-100 text-slate-700 hover:bg-slate-100",
};

// Auto-detect variant from status string
const getVariantFromStatus = (status: string): StatusVariant => {
  const lowerStatus = status.toLowerCase();
  
  if (["active", "operational", "completed", "success", "approved", "aktif"].includes(lowerStatus)) {
    return "success";
  }
  if (["pending", "in_progress", "maintenance", "warning", "on_hold"].includes(lowerStatus)) {
    return "warning";
  }
  if (["inactive", "breakdown", "failed", "rejected", "cancelled", "urgent", "nonaktif"].includes(lowerStatus)) {
    return "danger";
  }
  if (["open", "scheduled", "new", "info"].includes(lowerStatus)) {
    return "info";
  }
  return "default";
};

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const resolvedVariant = variant || getVariantFromStatus(status);
  
  // Format status untuk display
  const displayStatus = status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <Badge className={cn("font-medium", variantStyles[resolvedVariant], className)}>
      {displayStatus}
    </Badge>
  );
}

// Priority Badge
type PriorityLevel = "low" | "medium" | "high" | "urgent" | "critical";

interface PriorityBadgeProps {
  priority: PriorityLevel | string;
  className?: string;
}

const priorityStyles: Record<PriorityLevel, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700",
  critical: "bg-red-500 text-white",
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const lowerPriority = priority.toLowerCase() as PriorityLevel;
  const style = priorityStyles[lowerPriority] || priorityStyles.medium;
  
  const displayPriority = priority.charAt(0).toUpperCase() + priority.slice(1);

  return (
    <Badge className={cn("font-medium", style, className)}>
      {displayPriority}
    </Badge>
  );
}

// Criticality Badge
type CriticalityLevel = "low" | "medium" | "high" | "critical";

interface CriticalityBadgeProps {
  criticality: CriticalityLevel | string;
  className?: string;
}

const criticalityStyles: Record<CriticalityLevel, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  critical: "bg-red-100 text-red-700",
};

export function CriticalityBadge({ criticality, className }: CriticalityBadgeProps) {
  const lowerCriticality = criticality.toLowerCase() as CriticalityLevel;
  const style = criticalityStyles[lowerCriticality] || criticalityStyles.medium;
  
  const displayCriticality = criticality.charAt(0).toUpperCase() + criticality.slice(1);

  return (
    <Badge className={cn("font-medium", style, className)}>
      {displayCriticality}
    </Badge>
  );
}
