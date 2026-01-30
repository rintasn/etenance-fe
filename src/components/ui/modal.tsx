"use client";

import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Form Modal
interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[90vw]",
};

export function FormModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: FormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn("p-0 gap-0", sizeClasses[size])}>
        <DialogHeader className="p-6 pb-4 border-b border-slate-100">
          <DialogTitle className="text-xl font-semibold text-slate-800">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-slate-500">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && (
          <DialogFooter className="p-6 pt-4 border-t border-slate-100 bg-slate-50">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Delete Confirmation Modal
interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: React.ReactNode;
  isLoading?: boolean;
}

export function DeleteModal({
  open,
  onClose,
  onConfirm,
  title = "Hapus Data",
  description = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
  isLoading = false,
}: DeleteModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-800">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Detail Modal
interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function DetailModal({
  open,
  onClose,
  title,
  children,
  size = "lg",
}: DetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn("p-0 gap-0", sizeClasses[size])}>
        <DialogHeader className="p-6 pb-4 border-b border-slate-100">
          <DialogTitle className="text-xl font-semibold text-slate-800">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

// Detail Row Component
interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function DetailRow({ label, value, className }: DetailRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-slate-100 last:border-0",
        className,
      )}
    >
      <span className="text-sm font-medium text-slate-500 sm:w-1/3 sm:flex-shrink-0">
        {label}
      </span>
      <span className="text-sm text-slate-800 sm:flex-1">{value || "-"}</span>
    </div>
  );
}
