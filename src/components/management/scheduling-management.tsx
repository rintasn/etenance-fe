"use client";

import { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Play,
  Pause,
  RefreshCw,
  List,
  LayoutGrid,
  CalendarDays,
  Timer,
  Repeat,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Wrench,
  Package,
  MapPin,
  Users,
  Bell,
  Copy,
  RotateCcw,
  FastForward,
  History,
  Zap,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ==================== INTERFACES ====================

const BASE_URL = "http://localhost:8080/api/v1";

interface Schedule {
  id_schedule: string;
  schedule_name: string;
  schedule_desc: string;
  schedule_type: "preventive" | "predictive" | "inspection" | "calibration";
  frequency_type:
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "custom"
    | "meter_based";
  frequency_value: number;
  frequency_unit: string;
  day_of_week: number[] | null; // 0-6 for weekly
  day_of_month: number | null; // 1-31 for monthly
  month_of_year: number | null; // 1-12 for yearly
  start_date: string;
  end_date: string | null;
  next_due_date: string;
  last_completed_date: string | null;
  lead_time_days: number;
  estimated_duration: number; // in minutes
  priority: "low" | "medium" | "high" | "urgent";
  id_asset: string | null;
  asset_name?: string;
  id_location: string | null;
  location_name?: string;
  id_procedure: string | null;
  procedure_name?: string;
  id_team: string | null;
  team_name?: string;
  id_categories: string | null;
  category_name?: string;
  assigned_to: string[] | null;
  is_active: boolean;
  auto_generate_wo: boolean;
  notification_days: number[];
  meter_reading_field: string | null;
  meter_threshold: number | null;
  total_completed: number;
  total_skipped: number;
  compliance_rate: number;
  created_at: string;
  updated_at: string;
}

interface ScheduleExecution {
  id_execution: string;
  id_schedule: string;
  scheduled_date: string;
  actual_date: string | null;
  status: "pending" | "in_progress" | "completed" | "skipped" | "overdue";
  id_wo: string | null;
  wo_name?: string;
  notes: string;
  created_at: string;
}

interface Asset {
  id_asset: string;
  asset_name: string;
}

interface Location {
  id_location: string;
  location_name: string;
}

interface Team {
  id_team: string;
  team_name: string;
}

interface Procedure {
  id_procedure: string;
  procedure_name: string;
}

interface Category {
  id_categories: string;
  category_name: string;
}

// ==================== CONSTANTS ====================

const initialFormData = {
  schedule_name: "",
  schedule_desc: "",
  schedule_type: "preventive" as Schedule["schedule_type"],
  frequency_type: "monthly" as Schedule["frequency_type"],
  frequency_value: 1,
  frequency_unit: "month",
  day_of_week: [] as number[],
  day_of_month: 1,
  month_of_year: 1,
  start_date: "",
  end_date: "",
  lead_time_days: 7,
  estimated_duration: 60,
  priority: "medium" as Schedule["priority"],
  id_asset: "",
  id_location: "",
  id_procedure: "",
  id_team: "",
  id_categories: "",
  is_active: true,
  auto_generate_wo: true,
  notification_days: [7, 3, 1],
  meter_reading_field: "",
  meter_threshold: 0,
};

const scheduleTypes = [
  {
    value: "preventive",
    label: "Preventive Maintenance",
    icon: Wrench,
    color: "bg-blue-500",
  },
  {
    value: "predictive",
    label: "Predictive Maintenance",
    icon: Zap,
    color: "bg-purple-500",
  },
  {
    value: "inspection",
    label: "Inspection",
    icon: Eye,
    color: "bg-amber-500",
  },
  {
    value: "calibration",
    label: "Calibration",
    icon: Timer,
    color: "bg-emerald-500",
  },
];

const frequencyTypes = [
  { value: "daily", label: "Harian", desc: "Setiap hari" },
  { value: "weekly", label: "Mingguan", desc: "Hari tertentu setiap minggu" },
  { value: "monthly", label: "Bulanan", desc: "Tanggal tertentu setiap bulan" },
  { value: "yearly", label: "Tahunan", desc: "Tanggal tertentu setiap tahun" },
  { value: "custom", label: "Custom", desc: "Interval khusus" },
  {
    value: "meter_based",
    label: "Meter Based",
    desc: "Berdasarkan pembacaan meter",
  },
];

const DAYS_OF_WEEK = [
  { value: 0, label: "Min", fullLabel: "Minggu" },
  { value: 1, label: "Sen", fullLabel: "Senin" },
  { value: 2, label: "Sel", fullLabel: "Selasa" },
  { value: 3, label: "Rab", fullLabel: "Rabu" },
  { value: 4, label: "Kam", fullLabel: "Kamis" },
  { value: 5, label: "Jum", fullLabel: "Jumat" },
  { value: 6, label: "Sab", fullLabel: "Sabtu" },
];

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

const typeColors: Record<string, string> = {
  preventive: "bg-blue-100 text-blue-700 border-blue-200",
  predictive: "bg-purple-100 text-purple-700 border-purple-200",
  inspection: "bg-amber-100 text-amber-700 border-amber-200",
  calibration: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const statusColors: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  skipped: "bg-amber-100 text-amber-700",
  overdue: "bg-red-100 text-red-700",
};

// ==================== HELPER FUNCTIONS ====================

const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const getFrequencyLabel = (schedule: Schedule): string => {
  switch (schedule.frequency_type) {
    case "daily":
      return schedule.frequency_value === 1
        ? "Setiap hari"
        : `Setiap ${schedule.frequency_value} hari`;
    case "weekly":
      const days =
        schedule.day_of_week?.map((d) => DAYS_OF_WEEK[d]?.label).join(", ") ||
        "";
      return `Setiap minggu (${days})`;
    case "monthly":
      return `Setiap tanggal ${schedule.day_of_month}`;
    case "yearly":
      return `Setiap ${schedule.day_of_month} ${MONTHS[(schedule.month_of_year || 1) - 1]}`;
    case "custom":
      return `Setiap ${schedule.frequency_value} ${schedule.frequency_unit}`;
    case "meter_based":
      return `Setiap ${schedule.meter_threshold} ${schedule.meter_reading_field}`;
    default:
      return "-";
  }
};

const getDaysUntilDue = (dueDate: string): number => {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const getNextOccurrences = (schedule: Schedule, count: number = 5): Date[] => {
  const occurrences: Date[] = [];
  let currentDate = new Date(schedule.next_due_date);

  for (let i = 0; i < count; i++) {
    occurrences.push(new Date(currentDate));

    switch (schedule.frequency_type) {
      case "daily":
        currentDate.setDate(currentDate.getDate() + schedule.frequency_value);
        break;
      case "weekly":
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case "yearly":
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
      case "custom":
        if (schedule.frequency_unit === "day") {
          currentDate.setDate(currentDate.getDate() + schedule.frequency_value);
        } else if (schedule.frequency_unit === "week") {
          currentDate.setDate(
            currentDate.getDate() + schedule.frequency_value * 7,
          );
        } else if (schedule.frequency_unit === "month") {
          currentDate.setMonth(
            currentDate.getMonth() + schedule.frequency_value,
          );
        }
        break;
      default:
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  return occurrences;
};

// ==================== COMPONENTS ====================

// Schedule Type Card
interface ScheduleTypeCardProps {
  type: (typeof scheduleTypes)[0];
  count: number;
  isActive: boolean;
  onClick: () => void;
}

function ScheduleTypeCard({
  type,
  count,
  isActive,
  onClick,
}: ScheduleTypeCardProps) {
  const Icon = type.icon;
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border-2 cursor-pointer transition-all",
        isActive
          ? "border-emerald-500 bg-emerald-50 shadow-md"
          : "border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center text-white",
            type.color,
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-800">{type.label}</p>
          <p className="text-xs text-slate-500">{count} jadwal aktif</p>
        </div>
      </div>
    </div>
  );
}

// Upcoming Schedule Card
interface UpcomingCardProps {
  schedule: Schedule;
  onClick: () => void;
}

function UpcomingCard({ schedule, onClick }: UpcomingCardProps) {
  const daysUntil = getDaysUntilDue(schedule.next_due_date);
  const isOverdue = daysUntil < 0;
  const isDueSoon = daysUntil >= 0 && daysUntil <= 3;

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md",
        isOverdue
          ? "border-red-200 bg-red-50"
          : isDueSoon
            ? "border-amber-200 bg-amber-50"
            : "border-slate-200 bg-white",
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 line-clamp-1">
            {schedule.schedule_name}
          </p>
          <p className="text-xs text-slate-500">
            {schedule.asset_name || schedule.location_name}
          </p>
        </div>
        <Badge className={cn("text-xs", typeColors[schedule.schedule_type])}>
          {schedule.schedule_type}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <CalendarIcon className="w-4 h-4 text-slate-400" />
          <span
            className={cn(
              isOverdue
                ? "text-red-600 font-semibold"
                : isDueSoon
                  ? "text-amber-600 font-semibold"
                  : "text-slate-600",
            )}
          >
            {new Date(schedule.next_due_date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
        <div
          className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            isOverdue
              ? "bg-red-100 text-red-700"
              : isDueSoon
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-600",
          )}
        >
          {isOverdue
            ? `${Math.abs(daysUntil)} hari terlambat`
            : daysUntil === 0
              ? "Hari ini"
              : daysUntil === 1
                ? "Besok"
                : `${daysUntil} hari lagi`}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Repeat className="w-3 h-3" />
            {getFrequencyLabel(schedule)}
          </span>
          <PriorityBadge priority={schedule.priority} />
        </div>
      </div>
    </div>
  );
}

// Calendar View Component
interface CalendarViewProps {
  schedules: Schedule[];
  onClickSchedule: (schedule: Schedule) => void;
  onAddSchedule: (date: string) => void;
}

function ScheduleCalendarView({
  schedules,
  onClickSchedule,
  onAddSchedule,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
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

  // Get schedules for each day (considering recurring)
  const schedulesByDate = useMemo(() => {
    const result: Record<string, Schedule[]> = {};

    schedules.forEach((schedule) => {
      if (!schedule.is_active) return;

      const occurrences = getNextOccurrences(schedule, 60);
      occurrences.forEach((date) => {
        const dateKey = formatDateKey(date);
        if (!result[dateKey]) {
          result[dateKey] = [];
        }
        result[dateKey].push(schedule);
      });
    });

    return result;
  }, [schedules]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-slate-50">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Hari Ini
          </Button>
        </div>
        <h2 className="text-lg font-semibold text-slate-800">
          {MONTHS[month]} {year}
        </h2>
        <div className="flex items-center gap-2">
          {scheduleTypes.map((type) => (
            <div key={type.value} className="flex items-center gap-1 text-xs">
              <div className={cn("w-3 h-3 rounded-full", type.color)} />
              <span className="hidden sm:inline">
                {type.label.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day.value}
            className="p-2 text-center text-sm font-semibold text-slate-600 bg-slate-50"
          >
            {day.label}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dateKey = formatDateKey(day.date);
          const daySchedules = schedulesByDate[dateKey] || [];
          const today = isToday(day.date);

          return (
            <div
              key={index}
              className={cn(
                "min-h-[100px] border-b border-r border-slate-100 p-1 transition-all",
                !day.isCurrentMonth && "bg-slate-50",
                today && "bg-blue-50",
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                    !day.isCurrentMonth && "text-slate-400",
                    today && "bg-blue-500 text-white",
                  )}
                >
                  {day.date.getDate()}
                </span>
                {day.isCurrentMonth && (
                  <button
                    onClick={() => onAddSchedule(dateKey)}
                    className="w-5 h-5 rounded hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
              <ScrollArea className="h-[70px]">
                <div className="space-y-1">
                  {daySchedules.slice(0, 3).map((schedule, idx) => (
                    <div
                      key={`${schedule.id_schedule}-${idx}`}
                      onClick={() => onClickSchedule(schedule)}
                      className={cn(
                        "text-xs p-1 rounded cursor-pointer truncate border-l-2",
                        typeColors[schedule.schedule_type],
                      )}
                    >
                      {schedule.schedule_name}
                    </div>
                  ))}
                  {daySchedules.length > 3 && (
                    <p className="text-xs text-slate-500 pl-1">
                      +{daySchedules.length - 3} lainnya
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Timeline View Component
interface TimelineViewProps {
  schedules: Schedule[];
  onClickSchedule: (schedule: Schedule) => void;
}

function TimelineView({ schedules, onClickSchedule }: TimelineViewProps) {
  const sortedSchedules = useMemo(() => {
    return [...schedules]
      .filter((s) => s.is_active)
      .sort(
        (a, b) =>
          new Date(a.next_due_date).getTime() -
          new Date(b.next_due_date).getTime(),
      );
  }, [schedules]);

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, Schedule[]> = {};

    sortedSchedules.forEach((schedule) => {
      const date = new Date(schedule.next_due_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(schedule);
    });

    return groups;
  }, [sortedSchedules]);

  return (
    <div className="space-y-6">
      {Object.entries(groupedByMonth).map(([monthKey, monthSchedules]) => {
        const [year, month] = monthKey.split("-").map(Number);
        const monthName = MONTHS[month - 1];

        return (
          <div key={monthKey}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                {month}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">
                  {monthName} {year}
                </h3>
                <p className="text-sm text-slate-500">
                  {monthSchedules.length} jadwal
                </p>
              </div>
            </div>

            <div className="relative pl-6 border-l-2 border-slate-200 space-y-4 ml-5">
              {monthSchedules.map((schedule) => {
                const dueDate = new Date(schedule.next_due_date);
                const daysUntil = getDaysUntilDue(schedule.next_due_date);
                const isOverdue = daysUntil < 0;

                return (
                  <div
                    key={schedule.id_schedule}
                    onClick={() => onClickSchedule(schedule)}
                    className="relative cursor-pointer group"
                  >
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "absolute -left-[29px] w-4 h-4 rounded-full border-2 border-white",
                        isOverdue
                          ? "bg-red-500"
                          : daysUntil <= 3
                            ? "bg-amber-500"
                            : "bg-emerald-500",
                      )}
                    />

                    {/* Content */}
                    <div
                      className={cn(
                        "p-4 rounded-xl border transition-all group-hover:shadow-md",
                        isOverdue
                          ? "border-red-200 bg-red-50"
                          : "border-slate-200 bg-white",
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {schedule.schedule_name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {schedule.asset_name ||
                              schedule.location_name ||
                              "-"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-800">
                            {dueDate.toLocaleDateString("id-ID", {
                              weekday: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p
                            className={cn(
                              "text-xs",
                              isOverdue ? "text-red-600" : "text-slate-500",
                            )}
                          >
                            {isOverdue
                              ? `${Math.abs(daysUntil)} hari terlambat`
                              : daysUntil === 0
                                ? "Hari ini"
                                : `${daysUntil} hari lagi`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          className={cn(
                            "text-xs",
                            typeColors[schedule.schedule_type],
                          )}
                        >
                          {schedule.schedule_type}
                        </Badge>
                        <PriorityBadge priority={schedule.priority} />
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Repeat className="w-3 h-3" />
                          {getFrequencyLabel(schedule)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {sortedSchedules.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>Tidak ada jadwal aktif</p>
        </div>
      )}
    </div>
  );
}

// Execution History Component
interface ExecutionHistoryProps {
  executions: ScheduleExecution[];
}

function ExecutionHistory({ executions }: ExecutionHistoryProps) {
  return (
    <div className="space-y-3">
      {executions.map((exec) => (
        <div
          key={exec.id_execution}
          className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 bg-white"
        >
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              exec.status === "completed"
                ? "bg-emerald-100"
                : exec.status === "skipped"
                  ? "bg-amber-100"
                  : exec.status === "overdue"
                    ? "bg-red-100"
                    : "bg-slate-100",
            )}
          >
            {exec.status === "completed" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : exec.status === "skipped" ? (
              <FastForward className="w-5 h-5 text-amber-600" />
            ) : exec.status === "overdue" ? (
              <XCircle className="w-5 h-5 text-red-600" />
            ) : (
              <Clock className="w-5 h-5 text-slate-600" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-800">
              {new Date(exec.scheduled_date).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            {exec.wo_name && (
              <p className="text-sm text-slate-500">WO: {exec.wo_name}</p>
            )}
          </div>
          <Badge className={cn("capitalize", statusColors[exec.status])}>
            {exec.status}
          </Badge>
        </div>
      ))}

      {executions.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm">Belum ada riwayat eksekusi</p>
        </div>
      )}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function SchedulingMaintenance() {
  const [data, setData] = useState<Schedule[]>([]);
  const [executions, setExecutions] = useState<ScheduleExecution[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar" | "timeline">(
    "list",
  );
  const [activeType, setActiveType] = useState<string>("all");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  // Computed data
  const filteredData = useMemo(() => {
    if (activeType === "all") return data;
    return data.filter((s) => s.schedule_type === activeType);
  }, [data, activeType]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: data.filter((d) => d.is_active).length,
    };
    scheduleTypes.forEach((type) => {
      counts[type.value] = data.filter(
        (d) => d.schedule_type === type.value && d.is_active,
      ).length;
    });
    return counts;
  }, [data]);

  const upcomingSchedules = useMemo(() => {
    return [...data]
      .filter((s) => s.is_active)
      .sort(
        (a, b) =>
          new Date(a.next_due_date).getTime() -
          new Date(b.next_due_date).getTime(),
      )
      .slice(0, 6);
  }, [data]);

  const stats = useMemo(() => {
    const active = data.filter((d) => d.is_active).length;
    const overdue = data.filter(
      (d) => d.is_active && getDaysUntilDue(d.next_due_date) < 0,
    ).length;
    const dueSoon = data.filter((d) => {
      const days = getDaysUntilDue(d.next_due_date);
      return d.is_active && days >= 0 && days <= 7;
    }).length;
    const avgCompliance =
      data.length > 0
        ? Math.round(
            data.reduce((sum, d) => sum + d.compliance_rate, 0) / data.length,
          )
        : 0;

    return { active, overdue, dueSoon, avgCompliance };
  }, [data]);

  useEffect(() => {
    fetchData();
    fetchAssets();
    fetchLocations();
    fetchTeams();
    fetchProcedures();
    fetchCategories();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/schedules`, {
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

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/assets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setAssets(result.data);
    } catch (error) {
      console.error("Failed to fetch assets");
    }
  };

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setLocations(result.data);
    } catch (error) {
      console.error("Failed to fetch locations");
    }
  };

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setTeams(result.data);
    } catch (error) {
      console.error("Failed to fetch teams");
    }
  };

  const fetchProcedures = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/procedures`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setProcedures(result.data);
    } catch (error) {
      console.error("Failed to fetch procedures");
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setCategories(result.data);
    } catch (error) {
      console.error("Failed to fetch categories");
    }
  };

  const handleAdd = (date?: string) => {
    setFormData({
      ...initialFormData,
      start_date: date || new Date().toISOString().split("T")[0],
    });
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = (item: Schedule) => {
    setFormData({
      schedule_name: item.schedule_name,
      schedule_desc: item.schedule_desc || "",
      schedule_type: item.schedule_type,
      frequency_type: item.frequency_type,
      frequency_value: item.frequency_value,
      frequency_unit: item.frequency_unit || "month",
      day_of_week: item.day_of_week || [],
      day_of_month: item.day_of_month || 1,
      month_of_year: item.month_of_year || 1,
      start_date: item.start_date?.split("T")[0] || "",
      end_date: item.end_date?.split("T")[0] || "",
      lead_time_days: item.lead_time_days,
      estimated_duration: item.estimated_duration,
      priority: item.priority,
      id_asset: item.id_asset || "",
      id_location: item.id_location || "",
      id_procedure: item.id_procedure || "",
      id_team: item.id_team || "",
      id_categories: item.id_categories || "",
      is_active: item.is_active,
      auto_generate_wo: item.auto_generate_wo,
      notification_days: item.notification_days || [7, 3, 1],
      meter_reading_field: item.meter_reading_field || "",
      meter_threshold: item.meter_threshold || 0,
    });
    setSelectedItem(item);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleDelete = (item: Schedule) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleView = (item: Schedule) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleToggleActive = async (item: Schedule) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/schedules/${item.id_schedule}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...item, is_active: !item.is_active }),
        },
      );

      if (!response.ok) throw new Error("Gagal mengubah status");

      toast.success(
        `Jadwal ${item.is_active ? "dinonaktifkan" : "diaktifkan"}`,
      );
      fetchData();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleGenerateWO = async (item: Schedule) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/schedules/${item.id_schedule}/generate-wo`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Gagal generate work order");

      toast.success("Work order berhasil dibuat");
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
        ? `${BASE_URL}/schedules/${selectedItem?.id_schedule}`
        : `${BASE_URL}/schedules`;
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
          ? "Jadwal berhasil diperbarui"
          : "Jadwal berhasil ditambahkan",
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
      const response = await fetch(
        `${BASE_URL}/schedules/${selectedItem.id_schedule}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Gagal menghapus data");

      toast.success("Jadwal berhasil dihapus");
      setShowDeleteModal(false);
      fetchData();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Schedule>[] = [
    {
      accessorKey: "schedule_name",
      header: "Jadwal",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center text-white",
              scheduleTypes.find((t) => t.value === row.original.schedule_type)
                ?.color || "bg-slate-500",
            )}
          >
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-slate-800">
              {row.original.schedule_name}
            </p>
            <p className="text-xs text-slate-500">
              {row.original.asset_name || row.original.location_name || "-"}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "schedule_type",
      header: "Tipe",
      cell: ({ row }) => (
        <Badge
          className={cn(
            "capitalize text-xs",
            typeColors[row.original.schedule_type],
          )}
        >
          {row.original.schedule_type}
        </Badge>
      ),
    },
    {
      accessorKey: "frequency_type",
      header: "Frekuensi",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-slate-600">
          <Repeat className="w-4 h-4" />
          <span>{getFrequencyLabel(row.original)}</span>
        </div>
      ),
    },
    {
      accessorKey: "next_due_date",
      header: "Jadwal Berikutnya",
      cell: ({ row }) => {
        const daysUntil = getDaysUntilDue(row.original.next_due_date);
        const isOverdue = daysUntil < 0;

        return (
          <div>
            <p
              className={cn(
                "font-medium",
                isOverdue ? "text-red-600" : "text-slate-800",
              )}
            >
              {new Date(row.original.next_due_date).toLocaleDateString(
                "id-ID",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                },
              )}
            </p>
            <p
              className={cn(
                "text-xs",
                isOverdue ? "text-red-500" : "text-slate-500",
              )}
            >
              {isOverdue
                ? `${Math.abs(daysUntil)} hari terlambat`
                : daysUntil === 0
                  ? "Hari ini"
                  : `${daysUntil} hari lagi`}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Prioritas",
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    },
    {
      accessorKey: "compliance_rate",
      header: "Compliance",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Progress value={row.original.compliance_rate} className="w-16 h-2" />
          <span className="text-sm font-medium">
            {row.original.compliance_rate}%
          </span>
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Switch
          checked={row.original.is_active}
          onCheckedChange={() => handleToggleActive(row.original)}
        />
      ),
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
            <DropdownMenuItem onClick={() => handleGenerateWO(row.original)}>
              <Play className="w-4 h-4 mr-2" /> Generate Work Order
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

  return (
    <div>
      <PageHeader
        title="Scheduling Maintenance"
        description="Kelola jadwal maintenance preventive dan predictive"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-none"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className="rounded-none"
              >
                <CalendarDays className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "timeline" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("timeline")}
                className="rounded-none"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={() => handleAdd()}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Buat Jadwal
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
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.active}
                </p>
                <p className="text-xs text-slate-500">Jadwal Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.overdue}
                </p>
                <p className="text-xs text-slate-500">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.dueSoon}
                </p>
                <p className="text-xs text-slate-500">Due 7 Hari</p>
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
                  {stats.avgCompliance}%
                </p>
                <p className="text-xs text-slate-500">Avg Compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Type Filter */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div
          onClick={() => setActiveType("all")}
          className={cn(
            "p-3 rounded-xl border-2 cursor-pointer transition-all",
            activeType === "all"
              ? "border-emerald-500 bg-emerald-50"
              : "border-slate-200 hover:border-slate-300 bg-white",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-800">Semua</span>
            <Badge variant="secondary">{typeCounts.all}</Badge>
          </div>
        </div>
        {scheduleTypes.map((type) => (
          <ScheduleTypeCard
            key={type.value}
            type={type}
            count={typeCounts[type.value]}
            isActive={activeType === type.value}
            onClick={() => setActiveType(type.value)}
          />
        ))}
      </div>

      {/* Main Content */}
      {viewMode === "list" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Upcoming Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-md sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-500" />
                  Akan Datang
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-2">
                  <div className="space-y-3">
                    {upcomingSchedules.map((schedule) => (
                      <UpcomingCard
                        key={schedule.id_schedule}
                        schedule={schedule}
                        onClick={() => handleView(schedule)}
                      />
                    ))}
                    {upcomingSchedules.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm">Tidak ada jadwal</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <DataTable
                  columns={columns}
                  data={filteredData}
                  searchKey="schedule_name"
                  searchPlaceholder="Cari jadwal..."
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : viewMode === "calendar" ? (
        <ScheduleCalendarView
          schedules={filteredData}
          onClickSchedule={handleView}
          onAddSchedule={handleAdd}
        />
      ) : (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <TimelineView
              schedules={filteredData}
              onClickSchedule={handleView}
            />
          </CardContent>
        </Card>
      )}

      {/* Form Modal */}
      <FormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={isEditing ? "Edit Jadwal" : "Buat Jadwal Baru"}
        description={
          isEditing
            ? "Perbarui konfigurasi jadwal maintenance"
            : "Masukkan konfigurasi jadwal maintenance baru"
        }
        size="xl"
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
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
              <TabsTrigger value="frequency">Frekuensi</TabsTrigger>
              <TabsTrigger value="assignment">Assignment</TabsTrigger>
              <TabsTrigger value="notification">Notifikasi</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Nama Jadwal *</Label>
                  <Input
                    value={formData.schedule_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        schedule_name: e.target.value,
                      })
                    }
                    placeholder="Contoh: PM Bulanan AC Lantai 1"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Deskripsi</Label>
                  <Textarea
                    value={formData.schedule_desc}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        schedule_desc: e.target.value,
                      })
                    }
                    placeholder="Jelaskan detail jadwal maintenance"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Tipe Maintenance *</Label>
                  <Select
                    value={formData.schedule_type}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, schedule_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className={cn("w-3 h-3 rounded-full", type.color)}
                            />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioritas *</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, priority: value })
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
                  <Label>Estimasi Durasi (menit)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.estimated_duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimated_duration: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Lead Time (hari)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.lead_time_days}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lead_time_days: parseInt(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    WO dibuat sekian hari sebelum due date
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Frequency Tab */}
            <TabsContent value="frequency" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Tipe Frekuensi *</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {frequencyTypes.map((freq) => (
                      <div
                        key={freq.value}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            frequency_type: freq.value as any,
                          })
                        }
                        className={cn(
                          "p-3 rounded-lg border-2 cursor-pointer transition-all",
                          formData.frequency_type === freq.value
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 hover:border-slate-300",
                        )}
                      >
                        <p className="font-medium text-slate-800">
                          {freq.label}
                        </p>
                        <p className="text-xs text-slate-500">{freq.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conditional fields based on frequency type */}
                {formData.frequency_type === "weekly" && (
                  <div className="md:col-span-2">
                    <Label>Hari dalam Minggu</Label>
                    <div className="flex gap-2 mt-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => {
                            const days = formData.day_of_week.includes(
                              day.value,
                            )
                              ? formData.day_of_week.filter(
                                  (d) => d !== day.value,
                                )
                              : [...formData.day_of_week, day.value];
                            setFormData({ ...formData, day_of_week: days });
                          }}
                          className={cn(
                            "w-10 h-10 rounded-lg font-medium transition-all",
                            formData.day_of_week.includes(day.value)
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                          )}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {formData.frequency_type === "monthly" && (
                  <div>
                    <Label>Tanggal dalam Bulan</Label>
                    <Select
                      value={String(formData.day_of_month)}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          day_of_month: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(
                          (day) => (
                            <SelectItem key={day} value={String(day)}>
                              Tanggal {day}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.frequency_type === "yearly" && (
                  <>
                    <div>
                      <Label>Bulan</Label>
                      <Select
                        value={String(formData.month_of_year)}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            month_of_year: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((month, idx) => (
                            <SelectItem key={idx} value={String(idx + 1)}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tanggal</Label>
                      <Select
                        value={String(formData.day_of_month)}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            day_of_month: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(
                            (day) => (
                              <SelectItem key={day} value={String(day)}>
                                {day}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {formData.frequency_type === "custom" && (
                  <>
                    <div>
                      <Label>Setiap</Label>
                      <Input
                        type="number"
                        min={1}
                        value={formData.frequency_value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            frequency_value: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Satuan</Label>
                      <Select
                        value={formData.frequency_unit}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            frequency_unit: value === "__none__" ? "" : value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Hari</SelectItem>
                          <SelectItem value="week">Minggu</SelectItem>
                          <SelectItem value="month">Bulan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {formData.frequency_type === "meter_based" && (
                  <>
                    <div>
                      <Label>Field Meter</Label>
                      <Input
                        value={formData.meter_reading_field}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            meter_reading_field: e.target.value,
                          })
                        }
                        placeholder="Contoh: running_hours, odometer"
                      />
                    </div>
                    <div>
                      <Label>Threshold</Label>
                      <Input
                        type="number"
                        min={1}
                        value={formData.meter_threshold}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            meter_threshold: parseInt(e.target.value),
                          })
                        }
                        placeholder="Contoh: 500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label>Tanggal Mulai *</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Tanggal Berakhir</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Kosongkan jika tidak ada batas waktu
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Assignment Tab */}
            <TabsContent value="assignment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Aset</Label>
                  <Select
                    value={formData.id_asset}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        id_asset: value === "__none__" ? "" : value,
                      })
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
                  <Label>Lokasi</Label>
                  <Select
                    value={formData.id_location}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        id_location: value === "__none__" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih lokasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tidak ada</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem
                          key={loc.id_location}
                          value={loc.id_location}
                        >
                          {loc.location_name}
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
                      setFormData({
                        ...formData,
                        id_procedure: value === "__none__" ? "" : value,
                      })
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
                  <Label>Kategori</Label>
                  <Select
                    value={formData.id_categories}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        id_categories: value === "__none__" ? "" : value,
                      })
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
                  <Label>Tim</Label>
                  <Select
                    value={formData.id_team}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        id_team: value === "__none__" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tim" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tidak ada</SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team.id_team} value={team.id_team}>
                          {team.team_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Notification Tab */}
            <TabsContent value="notification" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <Label>Auto Generate Work Order</Label>
                    <p className="text-sm text-slate-500">
                      Buat WO otomatis saat jadwal jatuh tempo
                    </p>
                  </div>
                  <Switch
                    checked={formData.auto_generate_wo}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, auto_generate_wo: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <Label>Jadwal Aktif</Label>
                    <p className="text-sm text-slate-500">
                      Aktifkan atau nonaktifkan jadwal ini
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                </div>

                <div>
                  <Label>Hari Notifikasi Sebelum Due Date</Label>
                  <div className="flex gap-2 mt-2">
                    {[1, 3, 7, 14, 30].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const days = formData.notification_days.includes(day)
                            ? formData.notification_days.filter(
                                (d) => d !== day,
                              )
                            : [...formData.notification_days, day].sort(
                                (a, b) => b - a,
                              );
                          setFormData({ ...formData, notification_days: days });
                        }}
                        className={cn(
                          "px-3 py-2 rounded-lg font-medium transition-all",
                          formData.notification_days.includes(day)
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                        )}
                      >
                        {day} hari
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Notifikasi akan dikirim pada hari-hari yang dipilih sebelum
                    due date
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </FormModal>

      {/* Delete Modal */}
      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Jadwal"
        description={`Apakah Anda yakin ingin menghapus jadwal "${selectedItem?.schedule_name}"? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={isSubmitting}
      />

      {/* Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Jadwal"
        size="xl"
      >
        {selectedItem && (
          <div>
            <div className="flex items-start justify-between mb-6 pb-4 border-b">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center text-white",
                    scheduleTypes.find(
                      (t) => t.value === selectedItem.schedule_type,
                    )?.color,
                  )}
                >
                  <CalendarIcon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">
                    {selectedItem.schedule_name}
                  </h3>
                  <p className="text-slate-500">{selectedItem.schedule_desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={cn(
                    "capitalize",
                    typeColors[selectedItem.schedule_type],
                  )}
                >
                  {selectedItem.schedule_type}
                </Badge>
                <PriorityBadge priority={selectedItem.priority} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">
                      Frekuensi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Repeat className="w-5 h-5 text-emerald-500" />
                      {getFrequencyLabel(selectedItem)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">
                      Jadwal Berikutnya
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getNextOccurrences(selectedItem, 5).map((date, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CalendarIcon className="w-4 h-4 text-slate-400" />
                          <span
                            className={cn(
                              idx === 0 && "font-semibold text-emerald-600",
                            )}
                          >
                            {date.toLocaleDateString("id-ID", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          {idx === 0 && (
                            <Badge variant="outline" className="text-xs">
                              Berikutnya
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <DetailRow
                    label="Aset"
                    value={selectedItem.asset_name || "-"}
                  />
                  <DetailRow
                    label="Lokasi"
                    value={selectedItem.location_name || "-"}
                  />
                  <DetailRow
                    label="Tim"
                    value={selectedItem.team_name || "-"}
                  />
                  <DetailRow
                    label="Prosedur"
                    value={selectedItem.procedure_name || "-"}
                  />
                  <DetailRow
                    label="Kategori"
                    value={selectedItem.category_name || "-"}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">
                      Compliance Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20">
                        <svg className="w-20 h-20 -rotate-90">
                          <circle
                            cx="40"
                            cy="40"
                            r="35"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="8"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="35"
                            fill="none"
                            stroke={
                              selectedItem.compliance_rate >= 80
                                ? "#10b981"
                                : selectedItem.compliance_rate >= 50
                                  ? "#f59e0b"
                                  : "#ef4444"
                            }
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${selectedItem.compliance_rate * 2.2} 220`}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                          {selectedItem.compliance_rate}%
                        </span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Selesai</span>
                          <span className="font-medium text-emerald-600">
                            {selectedItem.total_completed}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Dilewati</span>
                          <span className="font-medium text-amber-600">
                            {selectedItem.total_skipped}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <DetailRow
                    label="Estimasi Durasi"
                    value={`${selectedItem.estimated_duration} menit`}
                  />
                  <DetailRow
                    label="Lead Time"
                    value={`${selectedItem.lead_time_days} hari`}
                  />
                  <DetailRow
                    label="Auto Generate WO"
                    value={selectedItem.auto_generate_wo ? "Ya" : "Tidak"}
                  />
                  <DetailRow
                    label="Status"
                    value={
                      <Badge
                        variant={
                          selectedItem.is_active ? "default" : "secondary"
                        }
                      >
                        {selectedItem.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    }
                  />
                  <DetailRow
                    label="Terakhir Selesai"
                    value={
                      selectedItem.last_completed_date
                        ? new Date(
                            selectedItem.last_completed_date,
                          ).toLocaleDateString("id-ID")
                        : "Belum pernah"
                    }
                  />
                  <DetailRow
                    label="Dibuat"
                    value={new Date(selectedItem.created_at).toLocaleString(
                      "id-ID",
                    )}
                  />
                </div>
              </div>
            </div>

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
              <Button
                variant="outline"
                onClick={() => handleGenerateWO(selectedItem)}
              >
                <Play className="w-4 h-4 mr-2" /> Generate WO
              </Button>
              <Button
                variant="outline"
                onClick={() => handleToggleActive(selectedItem)}
              >
                {selectedItem.is_active ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" /> Nonaktifkan
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" /> Aktifkan
                  </>
                )}
              </Button>
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
