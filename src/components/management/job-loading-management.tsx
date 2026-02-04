"use client";

import { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Users,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  PlayCircle,
  PauseCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Timer,
  User,
  ClipboardList,
  MapPin,
  Package,
  ArrowRight,
  RefreshCw,
  Filter,
  BarChart3,
  TrendingUp,
  Zap,
  ChevronRight,
  UserPlus,
  UserMinus,
  History,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import {
  FormModal,
  DeleteModal,
  DetailModal,
  DetailRow,
} from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import React from "react";

// ==================== INTERFACES ====================

const BASE_URL = "http://localhost:8080/api/v1";

interface JobLoading {
  id_job: string;
  id_wo: string;
  wo_name: string;
  wo_desc?: string;
  wo_priority: string;
  wo_type: string;
  wo_status: string;
  due_date: string;
  id_employee: string;
  emp_name: string;
  emp_npk?: string;
  emp_level?: string;
  emp_pict?: string;
  job_status:
    | "assigned"
    | "in_progress"
    | "completed"
    | "on_hold"
    | "cancelled";
  started_at: string | null;
  completed_at: string | null;
  notes: string;
  actual_duration: number | null; // dalam menit
  id_location?: string;
  location_name?: string;
  id_asset?: string;
  asset_name?: string;
  created_at: string;
  updated_at: string;
}

interface WorkOrder {
  id_wo: string;
  wo_name: string;
  wo_desc: string;
  wo_priority: string;
  wo_type: string;
  wo_status: string;
  due_date: string;
  wo_est_time: number;
  location_name?: string;
  asset_name?: string;
}

interface Employee {
  id_employee: string;
  emp_name: string;
  emp_npk: string;
  emp_level: string;
  emp_pict?: string;
  emp_available: boolean;
  emp_status: string;
  current_jobs: number;
  total_completed: number;
}

interface JobHistory {
  id: string;
  action: string;
  description: string;
  performed_by: string;
  performed_at: string;
}

// ==================== CONSTANTS ====================

const initialFormData: {
  id_wo: string;
  id_employee: string;
  job_status: JobLoading["job_status"];
  notes: string;
} = {
  id_wo: "",
  id_employee: "",
  job_status: "assigned",
  notes: "",
};

const jobStatusConfig = {
  assigned: {
    label: "Ditugaskan",
    color: "bg-slate-100 text-slate-700",
    icon: Circle,
  },
  in_progress: {
    label: "Dikerjakan",
    color: "bg-blue-100 text-blue-700",
    icon: PlayCircle,
  },
  completed: {
    label: "Selesai",
    color: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle2,
  },
  on_hold: {
    label: "Ditunda",
    color: "bg-amber-100 text-amber-700",
    icon: PauseCircle,
  },
  cancelled: {
    label: "Dibatalkan",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

const levelColors: Record<string, string> = {
  junior: "bg-slate-100 text-slate-700",
  mid: "bg-blue-100 text-blue-700",
  senior: "bg-emerald-100 text-emerald-700",
  lead: "bg-purple-100 text-purple-700",
  manager: "bg-amber-100 text-amber-700",
};

// ==================== HELPER FUNCTIONS ====================

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatDuration = (minutes: number | null): string => {
  if (!minutes) return "-";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}j ${mins}m`;
  return `${mins}m`;
};

const calculateWorkingTime = (
  startedAt: string | null,
  completedAt: string | null,
): number | null => {
  if (!startedAt) return null;
  const start = new Date(startedAt);
  const end = completedAt ? new Date(completedAt) : new Date();
  return Math.round((end.getTime() - start.getTime()) / 60000);
};

// ==================== EMPLOYEE CARD COMPONENT ====================

interface EmployeeCardProps {
  employee: Employee;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

function EmployeeCard({
  employee,
  isSelected,
  onSelect,
  disabled,
}: EmployeeCardProps) {
  const workload = Math.min(employee.current_jobs * 25, 100); // Assume max 4 jobs = 100%

  return (
    <div
      onClick={() => !disabled && onSelect()}
      className={cn(
        "p-4 rounded-xl border-2 transition-all cursor-pointer",
        isSelected
          ? "border-emerald-500 bg-emerald-50"
          : disabled
            ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
            : "border-slate-200 hover:border-slate-300 bg-white",
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={employee.emp_pict} />
          <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
            {getInitials(employee.emp_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 truncate">
            {employee.emp_name}
          </p>
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", levelColors[employee.emp_level])}>
              {employee.emp_level}
            </Badge>
            {!employee.emp_available && (
              <Badge variant="outline" className="text-xs text-amber-600">
                Tidak Tersedia
              </Badge>
            )}
          </div>
        </div>
        {isSelected && (
          <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
        )}
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Workload</span>
          <span className="font-medium">{employee.current_jobs} job aktif</span>
        </div>
        <Progress value={workload} className="h-1.5" />
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>NPK: {employee.emp_npk}</span>
        <span>{employee.total_completed} selesai</span>
      </div>
    </div>
  );
}

// ==================== WORK ORDER CARD COMPONENT ====================

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  isSelected: boolean;
  onSelect: () => void;
  assignedCount?: number;
}

function WorkOrderCard({
  workOrder,
  isSelected,
  onSelect,
  assignedCount = 0,
}: WorkOrderCardProps) {
  const isOverdue =
    new Date(workOrder.due_date) < new Date() &&
    workOrder.wo_status !== "completed";

  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-4 rounded-xl border-2 transition-all cursor-pointer",
        isSelected
          ? "border-emerald-500 bg-emerald-50"
          : "border-slate-200 hover:border-slate-300 bg-white",
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 line-clamp-1">
            {workOrder.wo_name}
          </p>
          <p className="text-xs text-slate-500 line-clamp-1">
            {workOrder.wo_desc}
          </p>
        </div>
        {isSelected && (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 ml-2" />
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <PriorityBadge priority={workOrder.wo_priority} />
        <StatusBadge status={workOrder.wo_status} />
        {assignedCount > 0 && (
          <Badge variant="outline" className="text-xs">
            <Users className="w-3 h-3 mr-1" />
            {assignedCount} teknisi
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span className={cn(isOverdue && "text-red-600 font-medium")}>
            {new Date(workOrder.due_date).toLocaleDateString("id-ID")}
          </span>
          {isOverdue && <AlertTriangle className="w-3 h-3 text-red-500" />}
        </div>
        <div className="flex items-center gap-1">
          <Timer className="w-3 h-3" />
          <span>{formatDuration(workOrder.wo_est_time)}</span>
        </div>
      </div>

      {(workOrder.location_name || workOrder.asset_name) && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-500">
          {workOrder.location_name && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {workOrder.location_name}
            </span>
          )}
          {workOrder.asset_name && (
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {workOrder.asset_name}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== JOB STATUS TIMELINE ====================

interface JobTimelineProps {
  job: JobLoading;
  history: JobHistory[];
}

function JobTimeline({ job, history }: JobTimelineProps) {
  const events = [
    {
      status: "assigned",
      label: "Ditugaskan",
      date: job.created_at,
      icon: UserPlus,
      color: "bg-slate-500",
    },
    ...(job.started_at
      ? [
          {
            status: "in_progress",
            label: "Mulai Dikerjakan",
            date: job.started_at,
            icon: PlayCircle,
            color: "bg-blue-500",
          },
        ]
      : []),
    ...(job.completed_at
      ? [
          {
            status: "completed",
            label: "Selesai",
            date: job.completed_at,
            icon: CheckCircle2,
            color: "bg-emerald-500",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={index} className="relative pl-8">
          {index !== events.length - 1 && (
            <div className="absolute left-[15px] top-8 w-0.5 h-full bg-slate-200" />
          )}
          <div
            className={cn(
              "absolute left-0 w-8 h-8 rounded-full flex items-center justify-center text-white",
              event.color,
            )}
          >
            <event.icon className="w-4 h-4" />
          </div>
          <div className="pb-4">
            <p className="font-medium text-slate-800">{event.label}</p>
            <p className="text-sm text-slate-500">
              {new Date(event.date).toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function JobLoadingManagement() {
  const [data, setData] = useState<JobLoading[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "board">("table");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<JobLoading | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  // Bulk assign states
  const [selectedWO, setSelectedWO] = useState<string>("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Computed data
  const filteredData = useMemo(() => {
    if (activeTab === "all") return data;
    return data.filter((job) => job.job_status === activeTab);
  }, [data, activeTab]);

  const statusCounts = useMemo(() => {
    return {
      all: data.length,
      assigned: data.filter((j) => j.job_status === "assigned").length,
      in_progress: data.filter((j) => j.job_status === "in_progress").length,
      completed: data.filter((j) => j.job_status === "completed").length,
      on_hold: data.filter((j) => j.job_status === "on_hold").length,
    };
  }, [data]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedToday = data.filter((j) => {
      if (!j.completed_at) return false;
      const completed = new Date(j.completed_at);
      completed.setHours(0, 0, 0, 0);
      return completed.getTime() === today.getTime();
    }).length;

    const avgDuration = data
      .filter((j) => j.actual_duration)
      .reduce(
        (sum, j, _, arr) => sum + (j.actual_duration || 0) / arr.length,
        0,
      );

    const activeWorkers = new Set(
      data
        .filter((j) => j.job_status === "in_progress")
        .map((j) => j.id_employee),
    ).size;

    return {
      completedToday,
      avgDuration: Math.round(avgDuration),
      activeWorkers,
      totalJobs: data.length,
    };
  }, [data]);

  // Unassigned work orders
  const unassignedWOs = useMemo(() => {
    const assignedWOIds = new Set(data.map((j) => j.id_wo));
    return workOrders.filter(
      (wo) => !assignedWOIds.has(wo.id_wo) && wo.wo_status !== "completed",
    );
  }, [workOrders, data]);

  useEffect(() => {
    fetchData();
    fetchWorkOrders();
    fetchEmployees();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/job-loading`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setData(result.data);
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/work-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setWorkOrders(result.data);
    } catch (error) {
      console.error("Failed to fetch work orders");
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setEmployees(result.data);
    } catch (error) {
      console.error("Failed to fetch employees");
    }
  };

  const handleAdd = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleBulkAssign = () => {
    setSelectedWO("");
    setSelectedEmployees([]);
    setShowBulkAssignModal(true);
  };

  const handleEdit = (item: JobLoading) => {
    setFormData({
      id_wo: item.id_wo,
      id_employee: item.id_employee,
      job_status: item.job_status,
      notes: item.notes || "",
    });
    setSelectedItem(item);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleDelete = (item: JobLoading) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleView = (item: JobLoading) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleStatusChange = async (item: JobLoading, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const updates: any = { job_status: newStatus };

      if (newStatus === "in_progress" && !item.started_at) {
        updates.started_at = new Date().toISOString();
      }
      if (newStatus === "completed" && !item.completed_at) {
        updates.completed_at = new Date().toISOString();
        if (item.started_at) {
          updates.actual_duration = calculateWorkingTime(
            item.started_at,
            updates.completed_at,
          );
        }
      }

      const response = await fetch(`${BASE_URL}/job-loading/${item.id_job}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Gagal mengubah status");

      toast.success(
        `Status berhasil diubah ke ${jobStatusConfig[newStatus as keyof typeof jobStatusConfig].label}`,
      );
      fetchData();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = isEditing
        ? `${BASE_URL}/job-loading/${selectedItem?.id_job}`
        : `${BASE_URL}/job-loading`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Gagal menyimpan data");

      toast.success(
        isEditing
          ? "Penugasan berhasil diperbarui"
          : "Penugasan berhasil dibuat",
      );
      setShowFormModal(false);
      fetchData();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkAssignSubmit = async () => {
    if (!selectedWO || selectedEmployees.length === 0) {
      toast.error("Pilih work order dan minimal 1 teknisi");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      // Create job for each selected employee
      for (const empId of selectedEmployees) {
        await fetch(`${BASE_URL}/job-loading`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_wo: selectedWO,
            id_employee: empId,
            job_status: "assigned",
            notes: "",
          }),
        });
      }

      toast.success(`${selectedEmployees.length} teknisi berhasil ditugaskan`);
      setShowBulkAssignModal(false);
      fetchData();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/job-loading/${selectedItem.id_job}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Gagal menghapus data");

      toast.success("Penugasan berhasil dihapus");
      setShowDeleteModal(false);
      fetchData();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEmployeeSelection = (empId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(empId)
        ? prev.filter((id) => id !== empId)
        : [...prev, empId],
    );
  };

  const columns: ColumnDef<JobLoading>[] = [
    {
      accessorKey: "wo_name",
      header: "Work Order",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-800 line-clamp-1">
              {row.original.wo_name}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {row.original.asset_name && (
                <span>{row.original.asset_name}</span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "emp_name",
      header: "Teknisi",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={row.original.emp_pict} />
            <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-xs">
              {getInitials(row.original.emp_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-slate-800">
              {row.original.emp_name}
            </p>
            <p className="text-xs text-slate-500">{row.original.emp_npk}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "wo_priority",
      header: "Prioritas",
      cell: ({ row }) => <PriorityBadge priority={row.original.wo_priority} />,
    },
    {
      accessorKey: "due_date",
      header: "Due Date",
      cell: ({ row }) => {
        const isOverdue =
          new Date(row.original.due_date) < new Date() &&
          row.original.job_status !== "completed";
        return (
          <div
            className={cn(
              "flex items-center gap-1",
              isOverdue && "text-red-600",
            )}
          >
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(row.original.due_date).toLocaleDateString("id-ID")}
            </span>
            {isOverdue && <AlertTriangle className="w-4 h-4" />}
          </div>
        );
      },
    },
    {
      accessorKey: "job_status",
      header: "Status",
      cell: ({ row }) => {
        const config = jobStatusConfig[row.original.job_status];
        const Icon = config.icon;
        return (
          <Badge className={cn("gap-1", config.color)}>
            <Icon className="w-3 h-3" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "actual_duration",
      header: "Durasi",
      cell: ({ row }) => {
        const duration =
          row.original.actual_duration ||
          (row.original.started_at
            ? calculateWorkingTime(
                row.original.started_at,
                row.original.completed_at,
              )
            : null);
        return (
          <span className="text-slate-600">{formatDuration(duration)}</span>
        );
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleView(row.original)}>
              <Eye className="w-4 h-4 mr-2" /> Lihat Detail
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.original.job_status === "assigned" && (
              <DropdownMenuItem
                onClick={() => handleStatusChange(row.original, "in_progress")}
              >
                <PlayCircle className="w-4 h-4 mr-2" /> Mulai Kerjakan
              </DropdownMenuItem>
            )}
            {row.original.job_status === "in_progress" && (
              <>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(row.original, "completed")}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Selesai
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(row.original, "on_hold")}
                >
                  <PauseCircle className="w-4 h-4 mr-2" /> Tunda
                </DropdownMenuItem>
              </>
            )}
            {row.original.job_status === "on_hold" && (
              <DropdownMenuItem
                onClick={() => handleStatusChange(row.original, "in_progress")}
              >
                <PlayCircle className="w-4 h-4 mr-2" /> Lanjutkan
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDelete(row.original)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Job Loading"
        description="Kelola penugasan work order ke teknisi"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleBulkAssign}>
              <Users className="w-4 h-4 mr-2" />
              Bulk Assign
            </Button>
            <Button
              onClick={handleAdd}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tugaskan Job
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.totalJobs}
                </p>
                <p className="text-xs text-slate-500">Total Job</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.completedToday}
                </p>
                <p className="text-xs text-slate-500">Selesai Hari Ini</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.activeWorkers}
                </p>
                <p className="text-xs text-slate-500">Teknisi Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <Timer className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {formatDuration(stats.avgDuration)}
                </p>
                <p className="text-xs text-slate-500">Rata-rata Durasi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unassigned Work Orders Alert */}
      {unassignedWOs.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">
                    {unassignedWOs.length} Work Order Belum Ditugaskan
                  </p>
                  <p className="text-sm text-amber-600">
                    Segera tugaskan ke teknisi yang tersedia
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleBulkAssign}>
                Tugaskan Sekarang
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Tabs & Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-slate-100 p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-white">
                Semua
                <Badge variant="secondary" className="ml-2">
                  {statusCounts.all}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="assigned"
                className="data-[state=active]:bg-white"
              >
                Ditugaskan
                <Badge variant="secondary" className="ml-2">
                  {statusCounts.assigned}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="in_progress"
                className="data-[state=active]:bg-white"
              >
                Dikerjakan
                <Badge variant="secondary" className="ml-2">
                  {statusCounts.in_progress}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-white"
              >
                Selesai
                <Badge variant="secondary" className="ml-2">
                  {statusCounts.completed}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="on_hold"
                className="data-[state=active]:bg-white"
              >
                Ditunda
                <Badge variant="secondary" className="ml-2">
                  {statusCounts.on_hold}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <DataTable
            columns={columns}
            data={filteredData}
            searchKey="wo_name"
            searchPlaceholder="Cari work order atau teknisi..."
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Single Assignment Form Modal */}
      <FormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={isEditing ? "Edit Penugasan" : "Tugaskan Job Baru"}
        description={
          isEditing
            ? "Perbarui penugasan job"
            : "Tugaskan work order ke teknisi"
        }
        size="lg"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button
              variant="outline"
              onClick={() => setShowFormModal(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Work Order *</Label>
            <Select
              value={formData.id_wo}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  id_wo: value === "__none__" ? "" : value,
                })
              }
              disabled={isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih work order" />
              </SelectTrigger>
              <SelectContent>
                {workOrders
                  .filter((wo) => wo.wo_status !== "completed")
                  .map((wo) => (
                    <SelectItem key={wo.id_wo} value={wo.id_wo}>
                      <div className="flex items-center gap-2">
                        <span>{wo.wo_name}</span>
                        <PriorityBadge priority={wo.wo_priority} />
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Teknisi *</Label>
            <Select
              value={formData.id_employee}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  id_employee: value === "__none__" ? "" : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih teknisi" />
              </SelectTrigger>
              <SelectContent>
                {employees
                  .filter((emp) => emp.emp_status === "active")
                  .map((emp) => (
                    <SelectItem key={emp.id_employee} value={emp.id_employee}>
                      <div className="flex items-center gap-2">
                        <span>{emp.emp_name}</span>
                        <Badge
                          className={cn("text-xs", levelColors[emp.emp_level])}
                        >
                          {emp.emp_level}
                        </Badge>
                        {!emp.emp_available && (
                          <Badge
                            variant="outline"
                            className="text-xs text-amber-600"
                          >
                            Tidak Tersedia
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {isEditing && (
            <div>
              <Label>Status</Label>
              <Select
                value={formData.job_status}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, job_status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(jobStatusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="w-4 h-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Catatan</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Tambahkan catatan untuk teknisi..."
              rows={3}
            />
          </div>
        </form>
      </FormModal>

      {/* Bulk Assignment Modal */}
      <FormModal
        open={showBulkAssignModal}
        onClose={() => setShowBulkAssignModal(false)}
        title="Bulk Assignment"
        description="Tugaskan satu work order ke beberapa teknisi sekaligus"
        size="xl"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button
              variant="outline"
              onClick={() => setShowBulkAssignModal(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleBulkAssignSubmit}
              disabled={
                isSubmitting || !selectedWO || selectedEmployees.length === 0
              }
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              {isSubmitting
                ? "Menugaskan..."
                : `Tugaskan ${selectedEmployees.length} Teknisi`}
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Work Order Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              1. Pilih Work Order
            </Label>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {unassignedWOs.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                    <p>Semua work order sudah ditugaskan</p>
                  </div>
                ) : (
                  unassignedWOs.map((wo) => (
                    <WorkOrderCard
                      key={wo.id_wo}
                      workOrder={wo}
                      isSelected={selectedWO === wo.id_wo}
                      onSelect={() => setSelectedWO(wo.id_wo)}
                      assignedCount={
                        data.filter((j) => j.id_wo === wo.id_wo).length
                      }
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Employee Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              2. Pilih Teknisi ({selectedEmployees.length} dipilih)
            </Label>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {employees
                  .filter((emp) => emp.emp_status === "active")
                  .map((emp) => (
                    <EmployeeCard
                      key={emp.id_employee}
                      employee={emp}
                      isSelected={selectedEmployees.includes(emp.id_employee)}
                      onSelect={() => toggleEmployeeSelection(emp.id_employee)}
                      disabled={!emp.emp_available}
                    />
                  ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </FormModal>

      {/* Delete Modal */}
      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Penugasan"
        description={`Apakah Anda yakin ingin menghapus penugasan "${selectedItem?.wo_name}" untuk ${selectedItem?.emp_name}?`}
        isLoading={isSubmitting}
      />

      {/* Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Penugasan"
        size="lg"
      >
        {selectedItem && (
          <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-6 pb-4 border-b">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={selectedItem.emp_pict} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-lg">
                    {getInitials(selectedItem.emp_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {selectedItem.emp_name}
                  </h3>
                  <p className="text-slate-500">{selectedItem.emp_npk}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge
                  className={cn(
                    "gap-1",
                    jobStatusConfig[selectedItem.job_status].color,
                  )}
                >
                  {React.createElement(
                    jobStatusConfig[selectedItem.job_status].icon,
                    { className: "w-3 h-3" },
                  )}
                  {jobStatusConfig[selectedItem.job_status].label}
                </Badge>
                <PriorityBadge priority={selectedItem.wo_priority} />
              </div>
            </div>

            {/* Work Order Info */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  Work Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold text-slate-800 mb-1">
                  {selectedItem.wo_name}
                </h4>
                <p className="text-sm text-slate-500 mb-3">
                  {selectedItem.wo_desc}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  {selectedItem.location_name && (
                    <span className="flex items-center gap-1 text-slate-600">
                      <MapPin className="w-4 h-4" />
                      {selectedItem.location_name}
                    </span>
                  )}
                  {selectedItem.asset_name && (
                    <span className="flex items-center gap-1 text-slate-600">
                      <Package className="w-4 h-4" />
                      {selectedItem.asset_name}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline & Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Timeline</h4>
                <JobTimeline job={selectedItem} history={[]} />
              </div>
              <div className="space-y-3">
                <DetailRow
                  label="Due Date"
                  value={
                    <span
                      className={cn(
                        new Date(selectedItem.due_date) < new Date() &&
                          selectedItem.job_status !== "completed"
                          ? "text-red-600 font-medium"
                          : "",
                      )}
                    >
                      {new Date(selectedItem.due_date).toLocaleDateString(
                        "id-ID",
                      )}
                    </span>
                  }
                />
                <DetailRow
                  label="Durasi Aktual"
                  value={formatDuration(
                    selectedItem.actual_duration ||
                      calculateWorkingTime(
                        selectedItem.started_at,
                        selectedItem.completed_at,
                      ),
                  )}
                />
                <DetailRow
                  label="Dibuat"
                  value={new Date(selectedItem.created_at).toLocaleString(
                    "id-ID",
                  )}
                />
                {selectedItem.notes && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Catatan:</p>
                    <p className="text-sm text-slate-700 p-2 bg-slate-50 rounded">
                      {selectedItem.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false);
                  handleEdit(selectedItem);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Button>
              {selectedItem.job_status === "assigned" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    handleStatusChange(selectedItem, "in_progress")
                  }
                >
                  <PlayCircle className="w-4 h-4 mr-2" /> Mulai
                </Button>
              )}
              {selectedItem.job_status === "in_progress" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleStatusChange(selectedItem, "completed")
                    }
                    className="text-emerald-600"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Selesai
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange(selectedItem, "on_hold")}
                  >
                    <PauseCircle className="w-4 h-4 mr-2" /> Tunda
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false);
                  handleDelete(selectedItem);
                }}
                className="text-red-600 hover:text-red-700 ml-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Hapus
              </Button>
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
}
