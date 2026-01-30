"use client";

import { useState, useEffect, useMemo } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Search,
  ChevronDown,
  BarChart3,
  PieChart,
  Table,
  RefreshCw,
  Printer,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PauseCircle,
  Circle,
  MapPin,
  Package,
  Users,
  Wrench,
  Eye,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileSpreadsheet,
  Columns,
  LayoutList,
  Grid3X3,
  CalendarDays,
  TrendingUp,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { DetailModal, DetailRow } from "@/components/ui/modal";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ==================== INTERFACES ====================

interface WorkOrderReport {
  id_wo: string;
  wo_number: string;
  wo_name: string;
  wo_desc: string;
  wo_type: string;
  wo_priority: string;
  wo_status: string;
  created_at: string;
  due_date: string;
  start_date: string | null;
  completed_date: string | null;
  actual_duration: number | null;
  estimated_duration: number | null;
  id_asset: string | null;
  asset_name: string | null;
  asset_code: string | null;
  id_location: string | null;
  location_name: string | null;
  id_category: string | null;
  category_name: string | null;
  id_team: string | null;
  team_name: string | null;
  assigned_technicians: string[];
  technician_names: string[];
  id_vendor: string | null;
  vendor_name: string | null;
  is_scheduled: boolean;
  schedule_name: string | null;
  cost_parts: number;
  cost_labor: number;
  cost_total: number;
  created_by: string;
  completed_by: string | null;
}

interface FilterOptions {
  status: string[];
  priority: string[];
  type: string[];
  location: string[];
  category: string[];
  team: string[];
  dateRange: {
    from: string;
    to: string;
  };
  isScheduled: boolean | null;
  searchQuery: string;
}

interface ReportSummary {
  total: number;
  byStatus: { status: string; count: number; percentage: number }[];
  byPriority: { priority: string; count: number; percentage: number }[];
  byType: { type: string; count: number; percentage: number }[];
  avgCompletionTime: number;
  overdueCount: number;
  totalCost: number;
  completionRate: number;
}

interface Location {
  id_location: string;
  location_name: string;
}

interface Category {
  id_categories: string;
  category_name: string;
}

interface Team {
  id_team: string;
  team_name: string;
}

// ==================== CONSTANTS ====================

const initialFilters: FilterOptions = {
  status: [],
  priority: [],
  type: [],
  location: [],
  category: [],
  team: [],
  dateRange: {
    from: "",
    to: "",
  },
  isScheduled: null,
  searchQuery: "",
};

const statusOptions = [
  { value: "open", label: "Open", color: "bg-slate-500" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-500" },
  { value: "completed", label: "Completed", color: "bg-emerald-500" },
  { value: "on_hold", label: "On Hold", color: "bg-amber-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
];

const priorityOptions = [
  { value: "low", label: "Low", color: "bg-slate-500" },
  { value: "medium", label: "Medium", color: "bg-blue-500" },
  { value: "high", label: "High", color: "bg-amber-500" },
  { value: "urgent", label: "Urgent", color: "bg-red-500" },
];

const typeOptions = [
  { value: "preventive", label: "Preventive", color: "bg-blue-500" },
  { value: "corrective", label: "Corrective", color: "bg-amber-500" },
  { value: "predictive", label: "Predictive", color: "bg-purple-500" },
  { value: "emergency", label: "Emergency", color: "bg-red-500" },
];

const datePresets = [
  { value: "today", label: "Hari Ini" },
  { value: "yesterday", label: "Kemarin" },
  { value: "last7days", label: "7 Hari Terakhir" },
  { value: "last30days", label: "30 Hari Terakhir" },
  { value: "thisMonth", label: "Bulan Ini" },
  { value: "lastMonth", label: "Bulan Lalu" },
  { value: "thisQuarter", label: "Kuartal Ini" },
  { value: "thisYear", label: "Tahun Ini" },
  { value: "custom", label: "Custom Range" },
];

const visibleColumns = [
  { id: "wo_number", label: "WO Number", default: true },
  { id: "wo_name", label: "Nama WO", default: true },
  { id: "wo_type", label: "Tipe", default: true },
  { id: "wo_priority", label: "Prioritas", default: true },
  { id: "wo_status", label: "Status", default: true },
  { id: "asset_name", label: "Aset", default: true },
  { id: "location_name", label: "Lokasi", default: true },
  { id: "due_date", label: "Due Date", default: true },
  { id: "completed_date", label: "Completed", default: false },
  { id: "actual_duration", label: "Durasi", default: false },
  { id: "technician_names", label: "Teknisi", default: false },
  { id: "cost_total", label: "Total Cost", default: false },
  { id: "category_name", label: "Kategori", default: false },
  { id: "team_name", label: "Tim", default: false },
];

// ==================== HELPER FUNCTIONS ====================

const formatDuration = (minutes: number | null): string => {
  if (!minutes) return "-";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}j ${mins}m`;
  return `${mins}m`;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const getDateRange = (preset: string): { from: string; to: string } => {
  const today = new Date();
  const from = new Date();
  const to = new Date();

  switch (preset) {
    case "today":
      break;
    case "yesterday":
      from.setDate(from.getDate() - 1);
      to.setDate(to.getDate() - 1);
      break;
    case "last7days":
      from.setDate(from.getDate() - 7);
      break;
    case "last30days":
      from.setDate(from.getDate() - 30);
      break;
    case "thisMonth":
      from.setDate(1);
      break;
    case "lastMonth":
      from.setMonth(from.getMonth() - 1, 1);
      to.setDate(0);
      break;
    case "thisQuarter":
      const quarter = Math.floor(today.getMonth() / 3);
      from.setMonth(quarter * 3, 1);
      break;
    case "thisYear":
      from.setMonth(0, 1);
      break;
    default:
      return { from: "", to: "" };
  }

  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
};

// ==================== SUMMARY CARDS COMPONENT ====================

interface SummaryCardsProps {
  summary: ReportSummary;
}

function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Total WO</p>
              <p className="text-2xl font-bold text-slate-800">
                {summary.total}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Completion Rate</p>
              <p className="text-2xl font-bold text-emerald-600">
                {summary.completionRate}%
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Overdue</p>
              <p className="text-2xl font-bold text-red-600">
                {summary.overdueCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Avg Time</p>
              <p className="text-2xl font-bold text-slate-800">
                {formatDuration(summary.avgCompletionTime)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-violet-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Total Cost</p>
              <p className="text-lg font-bold text-slate-800">
                {formatCurrency(summary.totalCost)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div>
            <p className="text-xs text-slate-500 mb-2">By Status</p>
            <div className="flex gap-1">
              {summary.byStatus.slice(0, 4).map((s) => (
                <div
                  key={s.status}
                  className="h-2 rounded-full"
                  style={{
                    width: `${s.percentage}%`,
                    backgroundColor:
                      s.status === "completed"
                        ? "#10b981"
                        : s.status === "in_progress"
                          ? "#3b82f6"
                          : s.status === "on_hold"
                            ? "#f59e0b"
                            : s.status === "open"
                              ? "#94a3b8"
                              : "#ef4444",
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== FILTER SHEET COMPONENT ====================

interface FilterSheetProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onReset: () => void;
  locations: Location[];
  categories: Category[];
  teams: Team[];
}

function FilterSheet({
  filters,
  onFiltersChange,
  onReset,
  locations,
  categories,
  teams,
}: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const toggleArrayFilter = (key: keyof FilterOptions, value: string) => {
    const arr = localFilters[key] as string[];
    const newArr = arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
    setLocalFilters({ ...localFilters, [key]: newArr });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status.length) count++;
    if (filters.priority.length) count++;
    if (filters.type.length) count++;
    if (filters.location.length) count++;
    if (filters.category.length) count++;
    if (filters.team.length) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.isScheduled !== null) count++;
    return count;
  }, [filters]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filter
          {activeFilterCount > 0 && (
            <Badge className="ml-2 bg-emerald-500">{activeFilterCount}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Filter Report</SheetTitle>
          <SheetDescription>
            Atur filter untuk menyaring data work order
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)] pr-4 mt-6">
          <div className="space-y-6">
            {/* Date Range */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">
                Periode
              </Label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {datePresets.slice(0, 6).map((preset) => (
                  <Button
                    key={preset.value}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "text-xs",
                      localFilters.dateRange.from ===
                        getDateRange(preset.value).from &&
                        "bg-emerald-50 border-emerald-500 text-emerald-700",
                    )}
                    onClick={() => {
                      const range = getDateRange(preset.value);
                      setLocalFilters({
                        ...localFilters,
                        dateRange: range,
                      });
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Dari</Label>
                  <Input
                    type="date"
                    value={localFilters.dateRange.from}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        dateRange: {
                          ...localFilters.dateRange,
                          from: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Sampai</Label>
                  <Input
                    type="date"
                    value={localFilters.dateRange.to}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        dateRange: {
                          ...localFilters.dateRange,
                          to: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Status */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Status</Label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((opt) => (
                  <Badge
                    key={opt.value}
                    variant={
                      localFilters.status.includes(opt.value)
                        ? "default"
                        : "outline"
                    }
                    className={cn(
                      "cursor-pointer",
                      localFilters.status.includes(opt.value) &&
                        "bg-emerald-500",
                    )}
                    onClick={() => toggleArrayFilter("status", opt.value)}
                  >
                    {opt.label}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Priority */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">
                Prioritas
              </Label>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map((opt) => (
                  <Badge
                    key={opt.value}
                    variant={
                      localFilters.priority.includes(opt.value)
                        ? "default"
                        : "outline"
                    }
                    className={cn(
                      "cursor-pointer",
                      localFilters.priority.includes(opt.value) &&
                        "bg-emerald-500",
                    )}
                    onClick={() => toggleArrayFilter("priority", opt.value)}
                  >
                    {opt.label}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Type */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Tipe</Label>
              <div className="flex flex-wrap gap-2">
                {typeOptions.map((opt) => (
                  <Badge
                    key={opt.value}
                    variant={
                      localFilters.type.includes(opt.value)
                        ? "default"
                        : "outline"
                    }
                    className={cn(
                      "cursor-pointer",
                      localFilters.type.includes(opt.value) && "bg-emerald-500",
                    )}
                    onClick={() => toggleArrayFilter("type", opt.value)}
                  >
                    {opt.label}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Lokasi</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {locations.map((loc) => (
                  <div
                    key={loc.id_location}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      id={`loc-${loc.id_location}`}
                      checked={localFilters.location.includes(loc.id_location)}
                      onCheckedChange={() =>
                        toggleArrayFilter("location", loc.id_location)
                      }
                    />
                    <Label
                      htmlFor={`loc-${loc.id_location}`}
                      className="text-sm cursor-pointer"
                    >
                      {loc.location_name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Category */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">
                Kategori
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {categories.map((cat) => (
                  <div
                    key={cat.id_categories}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      id={`cat-${cat.id_categories}`}
                      checked={localFilters.category.includes(
                        cat.id_categories,
                      )}
                      onCheckedChange={() =>
                        toggleArrayFilter("category", cat.id_categories)
                      }
                    />
                    <Label
                      htmlFor={`cat-${cat.id_categories}`}
                      className="text-sm cursor-pointer"
                    >
                      {cat.category_name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Scheduled */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Sumber</Label>
              <div className="flex gap-2">
                <Badge
                  variant={
                    localFilters.isScheduled === true ? "default" : "outline"
                  }
                  className={cn(
                    "cursor-pointer",
                    localFilters.isScheduled === true && "bg-emerald-500",
                  )}
                  onClick={() =>
                    setLocalFilters({
                      ...localFilters,
                      isScheduled:
                        localFilters.isScheduled === true ? null : true,
                    })
                  }
                >
                  Scheduled
                </Badge>
                <Badge
                  variant={
                    localFilters.isScheduled === false ? "default" : "outline"
                  }
                  className={cn(
                    "cursor-pointer",
                    localFilters.isScheduled === false && "bg-emerald-500",
                  )}
                  onClick={() =>
                    setLocalFilters({
                      ...localFilters,
                      isScheduled:
                        localFilters.isScheduled === false ? null : false,
                    })
                  }
                >
                  Manual
                </Badge>
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setLocalFilters(initialFilters);
              onReset();
            }}
          >
            Reset
          </Button>
          <Button
            onClick={handleApply}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500"
          >
            Terapkan Filter
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ==================== CHART VIEW COMPONENT ====================

interface ChartViewProps {
  data: WorkOrderReport[];
  summary: ReportSummary;
}

function ChartView({ data, summary }: ChartViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* By Status */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">By Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.byStatus.map((s) => (
              <div key={s.status}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm capitalize">
                    {s.status.replace("_", " ")}
                  </span>
                  <span className="text-sm font-medium">
                    {s.count} ({s.percentage}%)
                  </span>
                </div>
                <Progress value={s.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* By Priority */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">By Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.byPriority.map((p) => (
              <div key={p.priority}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        p.priority === "low"
                          ? "bg-slate-500"
                          : p.priority === "medium"
                            ? "bg-blue-500"
                            : p.priority === "high"
                              ? "bg-amber-500"
                              : "bg-red-500",
                      )}
                    />
                    <span className="text-sm capitalize">{p.priority}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {p.count} ({p.percentage}%)
                  </span>
                </div>
                <Progress value={p.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* By Type */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">By Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {summary.byType.map((t) => (
              <div key={t.type} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      t.type === "preventive"
                        ? "bg-blue-500"
                        : t.type === "corrective"
                          ? "bg-amber-500"
                          : t.type === "predictive"
                            ? "bg-purple-500"
                            : "bg-red-500",
                    )}
                  />
                  <span className="text-sm font-medium capitalize">
                    {t.type}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-800">{t.count}</p>
                <p className="text-xs text-slate-500">
                  {t.percentage}% dari total
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Completions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data
              .filter((wo) => wo.wo_status === "completed")
              .slice(0, 5)
              .map((wo) => (
                <div
                  key={wo.id_wo}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{wo.wo_number}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">
                      {wo.wo_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      {wo.completed_date &&
                        new Date(wo.completed_date).toLocaleDateString("id-ID")}
                    </p>
                    <p className="text-xs font-medium text-emerald-600">
                      {formatDuration(wo.actual_duration)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function WorkOrderReports() {
  const [data, setData] = useState<WorkOrderReport[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [viewMode, setViewMode] = useState<"table" | "chart">("table");
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    visibleColumns.filter((c) => c.default).map((c) => c.id),
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WorkOrderReport | null>(
    null,
  );

  useEffect(() => {
    fetchData();
    fetchLocations();
    fetchCategories();
    fetchTeams();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/reports/work-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) {
        setData(result.data);
      } else {
        // Mock data
        setData(getMockData());
      }
    } catch (error) {
      setData(getMockData());
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
      setLocations([
        { id_location: "1", location_name: "Gedung A" },
        { id_location: "2", location_name: "Gedung B" },
        { id_location: "3", location_name: "Gudang" },
      ]);
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
      setCategories([
        { id_categories: "1", category_name: "Electrical" },
        { id_categories: "2", category_name: "HVAC" },
        { id_categories: "3", category_name: "Plumbing" },
      ]);
    }
  };

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/teams", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setTeams(result.data);
    } catch (error) {
      setTeams([
        { id_team: "1", team_name: "Team A" },
        { id_team: "2", team_name: "Team B" },
      ]);
    }
  };

  const getMockData = (): WorkOrderReport[] => {
    return Array.from({ length: 50 }, (_, i) => ({
      id_wo: `wo-${i + 1}`,
      wo_number: `WO-2025-${String(i + 1).padStart(4, "0")}`,
      wo_name: `Work Order ${i + 1}`,
      wo_desc: `Description for work order ${i + 1}`,
      wo_type: ["preventive", "corrective", "predictive", "emergency"][
        Math.floor(Math.random() * 4)
      ],
      wo_priority: ["low", "medium", "high", "urgent"][
        Math.floor(Math.random() * 4)
      ],
      wo_status: ["open", "in_progress", "completed", "on_hold"][
        Math.floor(Math.random() * 4)
      ],
      created_at: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      due_date: new Date(
        Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      start_date:
        Math.random() > 0.3
          ? new Date(
              Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
            ).toISOString()
          : null,
      completed_date: Math.random() > 0.5 ? new Date().toISOString() : null,
      actual_duration:
        Math.random() > 0.5 ? Math.floor(Math.random() * 480) : null,
      estimated_duration: Math.floor(Math.random() * 240) + 30,
      id_asset: `asset-${Math.floor(Math.random() * 10) + 1}`,
      asset_name: `Asset ${Math.floor(Math.random() * 10) + 1}`,
      asset_code: `AST-${String(Math.floor(Math.random() * 1000)).padStart(4, "0")}`,
      id_location: `${Math.floor(Math.random() * 3) + 1}`,
      location_name: ["Gedung A", "Gedung B", "Gudang"][
        Math.floor(Math.random() * 3)
      ],
      id_category: `${Math.floor(Math.random() * 3) + 1}`,
      category_name: ["Electrical", "HVAC", "Plumbing"][
        Math.floor(Math.random() * 3)
      ],
      id_team: `${Math.floor(Math.random() * 2) + 1}`,
      team_name: ["Team A", "Team B"][Math.floor(Math.random() * 2)],
      assigned_technicians: ["tech-1", "tech-2"],
      technician_names: ["Budi Santoso", "Andi Wijaya"],
      id_vendor: null,
      vendor_name: null,
      is_scheduled: Math.random() > 0.5,
      schedule_name: Math.random() > 0.5 ? "PM Bulanan" : null,
      cost_parts: Math.floor(Math.random() * 1000000),
      cost_labor: Math.floor(Math.random() * 500000),
      cost_total: Math.floor(Math.random() * 1500000),
      created_by: "Admin",
      completed_by: Math.random() > 0.5 ? "Budi Santoso" : null,
    }));
  };

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter((wo) => {
      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (
          !wo.wo_number.toLowerCase().includes(query) &&
          !wo.wo_name.toLowerCase().includes(query) &&
          !wo.asset_name?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Status filter
      if (filters.status.length && !filters.status.includes(wo.wo_status)) {
        return false;
      }

      // Priority filter
      if (
        filters.priority.length &&
        !filters.priority.includes(wo.wo_priority)
      ) {
        return false;
      }

      // Type filter
      if (filters.type.length && !filters.type.includes(wo.wo_type)) {
        return false;
      }

      // Location filter
      if (
        filters.location.length &&
        wo.id_location &&
        !filters.location.includes(wo.id_location)
      ) {
        return false;
      }

      // Category filter
      if (
        filters.category.length &&
        wo.id_category &&
        !filters.category.includes(wo.id_category)
      ) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.from) {
        const fromDate = new Date(filters.dateRange.from);
        const woDate = new Date(wo.created_at);
        if (woDate < fromDate) return false;
      }
      if (filters.dateRange.to) {
        const toDate = new Date(filters.dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        const woDate = new Date(wo.created_at);
        if (woDate > toDate) return false;
      }

      // Scheduled filter
      if (
        filters.isScheduled !== null &&
        wo.is_scheduled !== filters.isScheduled
      ) {
        return false;
      }

      return true;
    });
  }, [data, filters]);

  // Calculate summary
  const summary: ReportSummary = useMemo(() => {
    const total = filteredData.length;
    const statusCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    let totalDuration = 0;
    let completedCount = 0;
    let overdueCount = 0;
    let totalCost = 0;

    filteredData.forEach((wo) => {
      statusCounts[wo.wo_status] = (statusCounts[wo.wo_status] || 0) + 1;
      priorityCounts[wo.wo_priority] =
        (priorityCounts[wo.wo_priority] || 0) + 1;
      typeCounts[wo.wo_type] = (typeCounts[wo.wo_type] || 0) + 1;

      if (wo.actual_duration) {
        totalDuration += wo.actual_duration;
        completedCount++;
      }

      if (wo.wo_status !== "completed" && new Date(wo.due_date) < new Date()) {
        overdueCount++;
      }

      totalCost += wo.cost_total || 0;
    });

    return {
      total,
      byStatus: Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        percentage: Math.round((count / total) * 100) || 0,
      })),
      byPriority: Object.entries(priorityCounts).map(([priority, count]) => ({
        priority,
        count,
        percentage: Math.round((count / total) * 100) || 0,
      })),
      byType: Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / total) * 100) || 0,
      })),
      avgCompletionTime:
        completedCount > 0 ? Math.round(totalDuration / completedCount) : 0,
      overdueCount,
      totalCost,
      completionRate:
        Math.round(((statusCounts["completed"] || 0) / total) * 100) || 0,
    };
  }, [filteredData]);

  const handleView = (item: WorkOrderReport) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleExport = (format: "pdf" | "excel" | "csv") => {
    toast.success(`Exporting to ${format.toUpperCase()}...`);
    // Implement export logic
  };

  const handlePrint = () => {
    window.print();
  };

  const columns: ColumnDef<WorkOrderReport>[] = [
    {
      accessorKey: "wo_number",
      header: "WO Number",
      cell: ({ row }: { row: Row<WorkOrderReport> }) => (
        <span className="font-mono text-sm font-medium text-blue-600">
          {row.original.wo_number}
        </span>
      ),
    },
    {
      accessorKey: "wo_name",
      header: "Nama WO",
      cell: ({ row }: { row: Row<WorkOrderReport> }) => (
        <div className="max-w-[200px]">
          <p className="font-medium text-slate-800 truncate">
            {row.original.wo_name}
          </p>
          {row.original.is_scheduled && (
            <Badge variant="outline" className="text-xs mt-1">
              <CalendarDays className="w-3 h-3 mr-1" />
              {row.original.schedule_name}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "wo_type",
      header: "Tipe",
      cell: ({ row }: { row: Row<WorkOrderReport> }) => (
        <Badge
          className={cn(
            "capitalize text-xs",
            row.original.wo_type === "preventive"
              ? "bg-blue-100 text-blue-700"
              : row.original.wo_type === "corrective"
                ? "bg-amber-100 text-amber-700"
                : row.original.wo_type === "predictive"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-red-100 text-red-700",
          )}
        >
          {row.original.wo_type}
        </Badge>
      ),
    },
    {
      accessorKey: "wo_priority",
      header: "Prioritas",
      cell: ({ row }: { row: Row<WorkOrderReport> }) => (
        <PriorityBadge priority={row.original.wo_priority} />
      ),
    },
    {
      accessorKey: "wo_status",
      header: "Status",
      cell: ({ row }: { row: Row<WorkOrderReport> }) => (
        <StatusBadge status={row.original.wo_status} />
      ),
    },
    {
      accessorKey: "asset_name",
      header: "Aset",
      cell: ({ row }: { row: Row<WorkOrderReport> }) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-slate-400" />
          <span>{row.original.asset_name || "-"}</span>
        </div>
      ),
    },
    {
      accessorKey: "location_name",
      header: "Lokasi",
      cell: ({ row }: { row: Row<WorkOrderReport> }) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span>{row.original.location_name || "-"}</span>
        </div>
      ),
    },
    {
      accessorKey: "due_date",
      header: "Due Date",
      cell: ({ row }: { row: Row<WorkOrderReport> }) => {
        const isOverdue =
          new Date(row.original.due_date) < new Date() &&
          row.original.wo_status !== "completed";
        return (
          <span className={cn(isOverdue && "text-red-600 font-medium")}>
            {new Date(row.original.due_date).toLocaleDateString("id-ID")}
          </span>
        );
      },
    },
    {
      accessorKey: "actual_duration",
      header: "Durasi",
      cell: ({ row }: { row: Row<WorkOrderReport> }) =>
        formatDuration(row.original.actual_duration),
    },
    {
      accessorKey: "cost_total",
      header: "Total Cost",
      cell: ({ row }: { row: Row<WorkOrderReport> }) =>
        formatCurrency(row.original.cost_total),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: { row: Row<WorkOrderReport> }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleView(row.original)}
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ].filter(
    (col) =>
      col.id === "actions" ||
      selectedColumns.includes(col.accessorKey as string),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Work Order Reports
          </h1>
          <p className="text-slate-500">Laporan dan analisis work order</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileText className="w-4 h-4 mr-2" />
                Export CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Filters & View Toggle */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Cari WO number, nama, atau aset..."
                  value={filters.searchQuery}
                  onChange={(e) =>
                    setFilters({ ...filters, searchQuery: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
              <FilterSheet
                filters={filters}
                onFiltersChange={setFilters}
                onReset={() => setFilters(initialFilters)}
                locations={locations}
                categories={categories}
                teams={teams}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Columns className="w-4 h-4 mr-2" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Visible Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {visibleColumns.map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      checked={selectedColumns.includes(col.id)}
                      onCheckedChange={(checked) => {
                        setSelectedColumns(
                          checked
                            ? [...selectedColumns, col.id]
                            : selectedColumns.filter((c) => c !== col.id),
                        );
                      }}
                    >
                      {col.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="rounded-none"
              >
                <Table className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "chart" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("chart")}
                className="rounded-none"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.status.length > 0 ||
            filters.priority.length > 0 ||
            filters.type.length > 0 ||
            filters.dateRange.from ||
            filters.dateRange.to) && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-slate-500">Active filters:</span>
              {filters.status.map((s) => (
                <Badge key={s} variant="secondary" className="gap-1">
                  {s}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        status: filters.status.filter((x) => x !== s),
                      })
                    }
                  />
                </Badge>
              ))}
              {filters.priority.map((p) => (
                <Badge key={p} variant="secondary" className="gap-1">
                  {p}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        priority: filters.priority.filter((x) => x !== p),
                      })
                    }
                  />
                </Badge>
              ))}
              {filters.type.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1">
                  {t}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        type: filters.type.filter((x) => x !== t),
                      })
                    }
                  />
                </Badge>
              ))}
              {(filters.dateRange.from || filters.dateRange.to) && (
                <Badge variant="secondary" className="gap-1">
                  {filters.dateRange.from} - {filters.dateRange.to}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        dateRange: { from: "", to: "" },
                      })
                    }
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters(initialFilters)}
                className="text-red-500"
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === "table" ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <DataTable
              columns={columns}
              data={filteredData}
              searchKey="wo_name"
              searchPlaceholder="Cari work order..."
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      ) : (
        <ChartView data={filteredData} summary={summary} />
      )}

      {/* Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Work Order"
        size="lg"
      >
        {selectedItem && (
          <div>
            <div className="flex items-start justify-between mb-6 pb-4 border-b">
              <div>
                <p className="font-mono text-lg font-bold text-blue-600">
                  {selectedItem.wo_number}
                </p>
                <h3 className="text-xl font-semibold text-slate-800">
                  {selectedItem.wo_name}
                </h3>
                <p className="text-slate-500 mt-1">{selectedItem.wo_desc}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={selectedItem.wo_status} />
                <PriorityBadge priority={selectedItem.wo_priority} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <DetailRow
                label="Tipe"
                value={
                  <Badge className="capitalize">{selectedItem.wo_type}</Badge>
                }
              />
              <DetailRow
                label="Scheduled"
                value={
                  selectedItem.is_scheduled
                    ? selectedItem.schedule_name
                    : "Manual"
                }
              />
              <DetailRow label="Aset" value={selectedItem.asset_name || "-"} />
              <DetailRow
                label="Lokasi"
                value={selectedItem.location_name || "-"}
              />
              <DetailRow
                label="Kategori"
                value={selectedItem.category_name || "-"}
              />
              <DetailRow label="Tim" value={selectedItem.team_name || "-"} />
              <DetailRow
                label="Dibuat"
                value={new Date(selectedItem.created_at).toLocaleString(
                  "id-ID",
                )}
              />
              <DetailRow
                label="Due Date"
                value={new Date(selectedItem.due_date).toLocaleString("id-ID")}
              />
              <DetailRow
                label="Mulai"
                value={
                  selectedItem.start_date
                    ? new Date(selectedItem.start_date).toLocaleString("id-ID")
                    : "-"
                }
              />
              <DetailRow
                label="Selesai"
                value={
                  selectedItem.completed_date
                    ? new Date(selectedItem.completed_date).toLocaleString(
                        "id-ID",
                      )
                    : "-"
                }
              />
              <DetailRow
                label="Durasi Estimasi"
                value={formatDuration(selectedItem.estimated_duration)}
              />
              <DetailRow
                label="Durasi Aktual"
                value={formatDuration(selectedItem.actual_duration)}
              />
            </div>

            <div className="mb-6">
              <Label className="text-sm font-semibold mb-2 block">
                Teknisi
              </Label>
              <div className="flex flex-wrap gap-2">
                {selectedItem.technician_names.map((name, idx) => (
                  <Badge key={idx} variant="outline">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <Label className="text-sm font-semibold mb-3 block">
                Cost Breakdown
              </Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Parts</p>
                  <p className="font-semibold">
                    {formatCurrency(selectedItem.cost_parts)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Labor</p>
                  <p className="font-semibold">
                    {formatCurrency(selectedItem.cost_labor)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="font-bold text-emerald-600">
                    {formatCurrency(selectedItem.cost_total)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
}
