"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  ClipboardList,
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  AlertTriangle,
  Bell,
  BellRing,
  X,
  GripVertical,
  Plus,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ==================== INTERFACES ====================

interface WorkOrder {
  id_wo: string;
  wo_name: string;
  wo_desc: string;
  wo_est_time: number;
  id_procedure: string | null;
  procedure_name?: string;
  due_date: string;
  start_date: string | null;
  wo_type: string;
  wo_priority: string;
  id_location: string | null;
  location_name?: string;
  id_asset: string | null;
  asset_name?: string;
  id_categories: string | null;
  category_name?: string;
  id_vendor: string | null;
  vendor_name?: string;
  wo_status: string;
  created_at: string;
}

interface Location {
  id_location: string;
  location_name: string;
}

interface Asset {
  id_asset: string;
  asset_name: string;
}

interface Category {
  id_categories: string;
  category_name: string;
}

interface Procedure {
  id_procedure: string;
  procedure_name: string;
}

interface Vendor {
  id_vendor: string;
  vendor_name: string;
}

interface DragItem {
  wo: WorkOrder;
  sourceDate: string;
}

// ==================== CONSTANTS ====================

const initialFormData = {
  wo_name: "",
  wo_desc: "",
  wo_est_time: 60,
  id_procedure: "",
  due_date: "",
  start_date: "",
  wo_type: "preventive",
  wo_priority: "medium",
  id_location: "",
  id_asset: "",
  id_categories: "",
  id_vendor: "",
  wo_status: "open",
};

const woTypeLabels: Record<string, string> = {
  preventive: "Preventive",
  corrective: "Corrective",
  predictive: "Predictive",
  emergency: "Emergency",
};

const statusFilters = [
  { value: "all", label: "Semua" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
  { value: "scheduled", label: "Scheduled" },
];

const priorityColors: Record<string, string> = {
  low: "bg-slate-500",
  medium: "bg-blue-500",
  high: "bg-amber-500",
  urgent: "bg-red-500",
};

const statusColors: Record<string, string> = {
  open: "border-l-slate-500",
  in_progress: "border-l-blue-500",
  completed: "border-l-emerald-500",
  on_hold: "border-l-amber-500",
  scheduled: "border-l-purple-500",
};

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

// ==================== HELPER FUNCTIONS ====================

const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const parseDate = (dateStr: string): Date => {
  return new Date(dateStr);
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

const isPastDue = (wo: WorkOrder): boolean => {
  if (!wo.due_date) return false;
  const dueDate = new Date(wo.due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today && wo.wo_status !== "completed";
};

const isDueToday = (wo: WorkOrder): boolean => {
  if (!wo.due_date) return false;
  return (
    isSameDay(new Date(wo.due_date), new Date()) && wo.wo_status !== "completed"
  );
};

// ==================== ALARM COMPONENT ====================

interface AlarmPopoverProps {
  urgentWorkOrders: WorkOrder[];
  onViewWO: (wo: WorkOrder) => void;
}

function AlarmPopover({ urgentWorkOrders, onViewWO }: AlarmPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasAlarms = urgentWorkOrders.length > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={hasAlarms ? "destructive" : "outline"}
          size="sm"
          className={cn("relative", hasAlarms && "animate-pulse")}
        >
          {hasAlarms ? (
            <BellRing className="w-4 h-4 mr-2" />
          ) : (
            <Bell className="w-4 h-4 mr-2" />
          )}
          Alarm
          {hasAlarms && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-red-600 text-xs font-bold rounded-full flex items-center justify-center">
              {urgentWorkOrders.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <h4 className="font-semibold">Work Order Memerlukan Perhatian!</h4>
          </div>
          <p className="text-sm text-red-600 mt-1">
            {urgentWorkOrders.length} work order belum di-action hari ini
          </p>
        </div>
        <ScrollArea className="max-h-80">
          {urgentWorkOrders.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>Tidak ada alarm aktif</p>
            </div>
          ) : (
            <div className="p-2">
              {urgentWorkOrders.map((wo) => (
                <div
                  key={wo.id_wo}
                  className="p-3 rounded-lg hover:bg-slate-50 cursor-pointer border-l-4 border-l-red-500 mb-2 bg-white shadow-sm"
                  onClick={() => {
                    onViewWO(wo);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 text-sm">
                        {wo.wo_name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {wo.asset_name || "No Asset"} •{" "}
                        {wo.location_name || "No Location"}
                      </p>
                    </div>
                    <PriorityBadge priority={wo.wo_priority} />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {woTypeLabels[wo.wo_type]}
                    </Badge>
                    <span className="text-xs text-red-600 font-medium">
                      {isPastDue(wo) ? "Overdue!" : "Due Today"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// ==================== CALENDAR COMPONENTS ====================

interface CalendarDayProps {
  date: Date;
  workOrders: WorkOrder[];
  isCurrentMonth: boolean;
  onDrop: (wo: WorkOrder, newDate: string) => void;
  onClickWO: (wo: WorkOrder) => void;
  onAddWO: (date: string) => void;
  dragItem: DragItem | null;
  setDragItem: (item: DragItem | null) => void;
}

function CalendarDay({
  date,
  workOrders,
  isCurrentMonth,
  onDrop,
  onClickWO,
  onAddWO,
  dragItem,
  setDragItem,
}: CalendarDayProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dateKey = formatDateKey(date);
  const today = isToday(date);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (dragItem) {
      onDrop(dragItem.wo, dateKey);
      setDragItem(null);
    }
  };

  const hasOverdue = workOrders.some((wo) => isPastDue(wo));
  const hasDueToday = workOrders.some((wo) => isDueToday(wo));

  return (
    <div
      className={cn(
        "min-h-[120px] border border-slate-200 p-1 transition-all",
        !isCurrentMonth && "bg-slate-50",
        isDragOver && "bg-emerald-50 border-emerald-300",
        today && "bg-blue-50 border-blue-300",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
            !isCurrentMonth && "text-slate-400",
            today && "bg-blue-500 text-white",
          )}
        >
          {date.getDate()}
        </span>
        <div className="flex items-center gap-1">
          {(hasOverdue || hasDueToday) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle
                    className={cn(
                      "w-4 h-4",
                      hasOverdue ? "text-red-500" : "text-amber-500",
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {hasOverdue
                    ? "Ada work order overdue!"
                    : "Ada work order due hari ini!"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <button
            onClick={() => onAddWO(dateKey)}
            className="w-5 h-5 rounded hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
      <ScrollArea className="h-[80px]">
        <div className="space-y-1">
          {workOrders.slice(0, 5).map((wo) => (
            <CalendarWorkOrderItem
              key={wo.id_wo}
              wo={wo}
              onClick={() => onClickWO(wo)}
              onDragStart={() => setDragItem({ wo, sourceDate: dateKey })}
              onDragEnd={() => setDragItem(null)}
            />
          ))}
          {workOrders.length > 5 && (
            <p className="text-xs text-slate-500 pl-1">
              +{workOrders.length - 5} lainnya
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface CalendarWorkOrderItemProps {
  wo: WorkOrder;
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

function CalendarWorkOrderItem({
  wo,
  onClick,
  onDragStart,
  onDragEnd,
}: CalendarWorkOrderItemProps) {
  const overdue = isPastDue(wo);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-1 p-1 rounded text-xs cursor-grab active:cursor-grabbing border-l-2 bg-white shadow-sm hover:shadow transition-all",
        statusColors[wo.wo_status],
        overdue && "bg-red-50 border-l-red-500",
      )}
    >
      <GripVertical className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 flex-shrink-0" />
      <div
        className={cn(
          "w-2 h-2 rounded-full flex-shrink-0",
          priorityColors[wo.wo_priority],
        )}
      />
      <span className="truncate flex-1 font-medium text-slate-700">
        {wo.wo_name}
      </span>
      {overdue && (
        <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
      )}
    </div>
  );
}

interface CalendarViewProps {
  workOrders: WorkOrder[];
  onUpdateWO: (wo: WorkOrder, newDueDate: string) => void;
  onClickWO: (wo: WorkOrder) => void;
  onAddWO: (date: string) => void;
}

function CalendarView({
  workOrders,
  onUpdateWO,
  onClickWO,
  onAddWO,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dragItem, setDragItem] = useState<DragItem | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [year, month]);

  // Group work orders by date
  const workOrdersByDate = useMemo(() => {
    const grouped: Record<string, WorkOrder[]> = {};
    workOrders.forEach((wo) => {
      if (wo.due_date) {
        const dateKey = formatDateKey(new Date(wo.due_date));
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(wo);
      }
    });
    return grouped;
  }, [workOrders]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDrop = (wo: WorkOrder, newDate: string) => {
    onUpdateWO(wo, newDate);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b bg-slate-50">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Hari Ini
          </Button>
        </div>
        <h2 className="text-lg font-semibold text-slate-800">
          {MONTHS[month]} {year}
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-slate-500" />
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Urgent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b">
        {DAYS.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-semibold text-slate-600 bg-slate-50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => (
          <CalendarDay
            key={index}
            date={day.date}
            workOrders={workOrdersByDate[formatDateKey(day.date)] || []}
            isCurrentMonth={day.isCurrentMonth}
            onDrop={handleDrop}
            onClickWO={onClickWO}
            onAddWO={onAddWO}
            dragItem={dragItem}
            setDragItem={setDragItem}
          />
        ))}
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function WorkOrderManagement() {
  const [data, setData] = useState<WorkOrder[]>([]);
  const [filteredData, setFilteredData] = useState<WorkOrder[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WorkOrder | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  // Urgent work orders for alarm
  const urgentWorkOrders = useMemo(() => {
    return data.filter((wo) => {
      const isDueTodayOrOverdue = isPastDue(wo) || isDueToday(wo);
      const isNotCompleted = wo.wo_status !== "completed";
      return isDueTodayOrOverdue && isNotCompleted;
    });
  }, [data]);

  useEffect(() => {
    fetchData();
    fetchLocations();
    fetchAssets();
    fetchCategories();
    fetchProcedures();
    fetchVendors();
  }, []);

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredData(data);
    } else {
      setFilteredData(data.filter((wo) => wo.wo_status === activeTab));
    }
  }, [activeTab, data]);

  // Show alarm notification on load
  useEffect(() => {
    if (urgentWorkOrders.length > 0) {
      toast.warning(
        `${urgentWorkOrders.length} work order memerlukan perhatian!`,
        {
          description: "Klik tombol Alarm untuk melihat detail",
          duration: 5000,
        },
      );
    }
  }, [urgentWorkOrders.length]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/work-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) {
        setData(result.data);
        setFilteredData(result.data);
      }
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/locations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setLocations(result.data);
    } catch (error) {
      console.error("Failed to fetch locations");
    }
  };

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/assets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setAssets(result.data);
    } catch (error) {
      console.error("Failed to fetch assets");
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setCategories(result.data);
    } catch (error) {
      console.error("Failed to fetch categories");
    }
  };

  const fetchProcedures = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/procedures", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setProcedures(result.data);
    } catch (error) {
      console.error("Failed to fetch procedures");
    }
  };

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/vendors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setVendors(result.data);
    } catch (error) {
      console.error("Failed to fetch vendors");
    }
  };

  const handleAdd = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleAddWithDate = (date: string) => {
    setFormData({
      ...initialFormData,
      due_date: `${date}T09:00`,
    });
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = (item: WorkOrder) => {
    setFormData({
      wo_name: item.wo_name,
      wo_desc: item.wo_desc || "",
      wo_est_time: item.wo_est_time || 60,
      id_procedure: item.id_procedure || "",
      due_date: item.due_date?.slice(0, 16) || "",
      start_date: item.start_date?.slice(0, 16) || "",
      wo_type: item.wo_type,
      wo_priority: item.wo_priority,
      id_location: item.id_location || "",
      id_asset: item.id_asset || "",
      id_categories: item.id_categories || "",
      id_vendor: item.id_vendor || "",
      wo_status: item.wo_status,
    });
    setSelectedItem(item);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleDelete = (item: WorkOrder) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleView = (item: WorkOrder) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = isEditing
        ? `/api/work-orders/${selectedItem?.id_wo}`
        : "/api/work-orders";
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
          ? "Work order berhasil diperbarui"
          : "Work order berhasil dibuat",
      );
      setShowFormModal(false);
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
      const response = await fetch(`/api/work-orders/${selectedItem.id_wo}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Gagal menghapus data");

      toast.success("Work order berhasil dihapus");
      setShowDeleteModal(false);
      fetchData();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (item: WorkOrder, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/work-orders/${item.id_wo}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...item, wo_status: newStatus }),
      });

      if (!response.ok) throw new Error("Gagal mengubah status");

      toast.success("Status berhasil diubah");
      fetchData();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  // Handle calendar drag & drop reschedule
  const handleCalendarUpdateWO = async (wo: WorkOrder, newDueDate: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/work-orders/${wo.id_wo}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...wo,
          due_date: `${newDueDate}T${wo.due_date?.slice(11, 16) || "09:00"}`,
        }),
      });

      if (!response.ok) throw new Error("Gagal mengubah jadwal");

      toast.success(`Work order dipindahkan ke ${newDueDate}`);
      fetchData();
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengubah jadwal");
    }
  };

  const columns: ColumnDef<WorkOrder>[] = [
    {
      accessorKey: "wo_name",
      header: "Work Order",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-800">{row.original.wo_name}</p>
            <p className="text-xs text-slate-500">
              {row.original.asset_name || "No Asset"}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "wo_type",
      header: "Tipe",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {woTypeLabels[row.original.wo_type] || row.original.wo_type}
        </Badge>
      ),
    },
    {
      accessorKey: "wo_priority",
      header: "Prioritas",
      cell: ({ row }) => <PriorityBadge priority={row.original.wo_priority} />,
    },
    {
      accessorKey: "location_name",
      header: "Lokasi",
      cell: ({ row }) => (
        <span className="text-slate-600">
          {row.original.location_name || "-"}
        </span>
      ),
    },
    {
      accessorKey: "due_date",
      header: "Due Date",
      cell: ({ row }) => {
        const overdue = isPastDue(row.original);
        return (
          <div
            className={cn(
              "flex items-center gap-1",
              overdue ? "text-red-600" : "text-slate-600",
            )}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>
              {row.original.due_date
                ? new Date(row.original.due_date).toLocaleDateString("id-ID")
                : "-"}
            </span>
            {overdue && <AlertTriangle className="w-4 h-4 text-red-500" />}
          </div>
        );
      },
    },
    {
      accessorKey: "wo_status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.wo_status} />,
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
            <DropdownMenuItem
              onClick={() => handleStatusChange(row.original, "in_progress")}
            >
              Mulai Kerjakan
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange(row.original, "completed")}
            >
              Selesai
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange(row.original, "on_hold")}
            >
              Tunda
            </DropdownMenuItem>
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

  // Count by status
  const statusCounts = {
    all: data.length,
    open: data.filter((wo) => wo.wo_status === "open").length,
    in_progress: data.filter((wo) => wo.wo_status === "in_progress").length,
    completed: data.filter((wo) => wo.wo_status === "completed").length,
    on_hold: data.filter((wo) => wo.wo_status === "on_hold").length,
    scheduled: data.filter((wo) => wo.wo_status === "scheduled").length,
  };

  return (
    <div>
      <PageHeader
        title="Manajemen Work Order"
        description="Kelola work order dan jadwal maintenance"
        actions={
          <div className="flex items-center gap-2">
            <AlarmPopover
              urgentWorkOrders={urgentWorkOrders}
              onViewWO={handleView}
            />
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-none"
              >
                <List className="w-4 h-4 mr-1" />
                List
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className="rounded-none"
              >
                <LayoutGrid className="w-4 h-4 mr-1" />
                Calendar
              </Button>
            </div>
          </div>
        }
      />

      {viewMode === "list" ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            {/* Status Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-6"
            >
              <TabsList className="bg-slate-100 p-1">
                {statusFilters.map((filter) => (
                  <TabsTrigger
                    key={filter.value}
                    value={filter.value}
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    {filter.label}
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-slate-200 text-slate-600"
                    >
                      {statusCounts[filter.value as keyof typeof statusCounts]}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <DataTable
              columns={columns}
              data={filteredData}
              searchKey="wo_name"
              searchPlaceholder="Cari work order..."
              onAdd={handleAdd}
              addButtonText="Buat Work Order"
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={handleAdd}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Buat Work Order
            </Button>
          </div>
          <CalendarView
            workOrders={data}
            onUpdateWO={handleCalendarUpdateWO}
            onClickWO={(wo) => {
              setSelectedItem(wo);
              setShowDetailModal(true);
            }}
            onAddWO={handleAddWithDate}
          />
        </div>
      )}

      {/* Form Modal */}
      <FormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={isEditing ? "Edit Work Order" : "Buat Work Order"}
        description={
          isEditing
            ? "Perbarui informasi work order"
            : "Masukkan informasi work order baru"
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
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Nama Work Order *</Label>
              <Input
                value={formData.wo_name}
                onChange={(e) =>
                  setFormData({ ...formData, wo_name: e.target.value })
                }
                placeholder="Masukkan nama work order"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label>Deskripsi</Label>
              <Textarea
                value={formData.wo_desc}
                onChange={(e) =>
                  setFormData({ ...formData, wo_desc: e.target.value })
                }
                placeholder="Masukkan deskripsi work order"
                rows={3}
              />
            </div>
            <div>
              <Label>Tipe *</Label>
              <Select
                value={formData.wo_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, wo_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="corrective">Corrective</SelectItem>
                  <SelectItem value="predictive">Predictive</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioritas *</Label>
              <Select
                value={formData.wo_priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, wo_priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Lokasi</Label>
              <Select
                value={formData.id_location}
                onValueChange={(value) =>
                  setFormData({ ...formData, id_location: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih lokasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id_location} value={loc.id_location}>
                      {loc.location_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Aset</Label>
              <Select
                value={formData.id_asset}
                onValueChange={(value) =>
                  setFormData({ ...formData, id_asset: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih aset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada</SelectItem>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id_asset} value={asset.id_asset}>
                      {asset.asset_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kategori</Label>
              <Select
                value={formData.id_categories}
                onValueChange={(value) =>
                  setFormData({ ...formData, id_categories: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat.id_categories}
                      value={cat.id_categories}
                    >
                      {cat.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prosedur</Label>
              <Select
                value={formData.id_procedure}
                onValueChange={(value) =>
                  setFormData({ ...formData, id_procedure: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih prosedur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada</SelectItem>
                  {procedures.map((proc) => (
                    <SelectItem
                      key={proc.id_procedure}
                      value={proc.id_procedure}
                    >
                      {proc.procedure_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date *</Label>
              <Input
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>Estimasi Waktu (menit)</Label>
              <Input
                type="number"
                min={1}
                value={formData.wo_est_time}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    wo_est_time: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label>Vendor</Label>
              <Select
                value={formData.id_vendor}
                onValueChange={(value) =>
                  setFormData({ ...formData, id_vendor: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id_vendor} value={vendor.id_vendor}>
                      {vendor.vendor_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status *</Label>
              <Select
                value={formData.wo_status}
                onValueChange={(value) =>
                  setFormData({ ...formData, wo_status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </FormModal>

      {/* Delete Modal */}
      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Work Order"
        description={`Apakah Anda yakin ingin menghapus work order "${selectedItem?.wo_name}"?`}
        isLoading={isSubmitting}
      />

      {/* Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Work Order"
        size="lg"
      >
        {selectedItem && (
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {selectedItem.wo_name}
                </h3>
                <p className="text-slate-500 text-sm">{selectedItem.wo_desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedItem.wo_status} />
                {isPastDue(selectedItem) && (
                  <Badge variant="destructive" className="animate-pulse">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <DetailRow
                label="Tipe"
                value={
                  <Badge variant="outline" className="capitalize">
                    {woTypeLabels[selectedItem.wo_type]}
                  </Badge>
                }
              />
              <DetailRow
                label="Prioritas"
                value={<PriorityBadge priority={selectedItem.wo_priority} />}
              />
              <DetailRow
                label="Lokasi"
                value={selectedItem.location_name || "-"}
              />
              <DetailRow label="Aset" value={selectedItem.asset_name || "-"} />
              <DetailRow
                label="Kategori"
                value={selectedItem.category_name || "-"}
              />
              <DetailRow
                label="Prosedur"
                value={selectedItem.procedure_name || "-"}
              />
              <DetailRow
                label="Due Date"
                value={
                  selectedItem.due_date
                    ? new Date(selectedItem.due_date).toLocaleString("id-ID")
                    : "-"
                }
              />
              <DetailRow
                label="Estimasi Waktu"
                value={`${selectedItem.wo_est_time} menit`}
              />
              <DetailRow
                label="Vendor"
                value={selectedItem.vendor_name || "-"}
              />
              <DetailRow
                label="Dibuat"
                value={new Date(selectedItem.created_at).toLocaleString(
                  "id-ID",
                )}
              />
            </div>
            <div className="flex gap-2 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false);
                  handleEdit(selectedItem);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusChange(selectedItem, "in_progress")}
                disabled={selectedItem.wo_status === "in_progress"}
              >
                Mulai Kerjakan
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusChange(selectedItem, "completed")}
                disabled={selectedItem.wo_status === "completed"}
                className="text-emerald-600 hover:text-emerald-700"
              >
                Selesai
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false);
                  handleDelete(selectedItem);
                }}
                className="text-red-600 hover:text-red-700 ml-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus
              </Button>
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
}
