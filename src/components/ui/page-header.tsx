"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface PageHeaderProps {
  title: string;
  description?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  showBack = false,
  actions,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          {description && (
            <p className="text-slate-500 mt-1">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
