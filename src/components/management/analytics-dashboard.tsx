"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Wrench,
  Package,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Filter,
  ChevronDown,
  Activity,
  Timer,
  Target,
  Zap,
  PieChart,
  LineChart,
  BarChart,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ==================== INTERFACES ====================

interface AnalyticsData {
  overview: {
    totalWorkOrders: number;
    completedWorkOrders: number;
    pendingWorkOrders: number;
    overdueWorkOrders: number;
    avgCompletionTime: number;
    complianceRate: number;
    mttr: number; // Mean Time To Repair
    mtbf: number; // Mean Time Between Failures
  };
  trends: {
    woCreated: TrendData[];
    woCompleted: TrendData[];
    avgResponseTime: TrendData[];
  };
  byPriority: PriorityData[];
  byType: TypeData[];
  byStatus: StatusData[];
  byLocation: LocationData[];
  byAsset: AssetData[];
  byTechnician: TechnicianData[];
  monthlyComparison: MonthlyData[];
  recentActivity: ActivityItem[];
}

interface TrendData {
  date: string;
  value: number;
}

interface PriorityData {
  priority: string;
  count: number;
  percentage: number;
  avgTime: number;
}

interface TypeData {
  type: string;
  count: number;
  percentage: number;
}

interface StatusData {
  status: string;
  count: number;
  percentage: number;
}

interface LocationData {
  id: string;
  name: string;
  totalWO: number;
  completed: number;
  pending: number;
}

interface AssetData {
  id: string;
  name: string;
  totalWO: number;
  downtime: number;
  lastMaintenance: string;
}

interface TechnicianData {
  id: string;
  name: string;
  avatar?: string;
  completed: number;
  inProgress: number;
  avgTime: number;
  rating: number;
}

interface MonthlyData {
  month: string;
  created: number;
  completed: number;
  overdue: number;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user?: string;
}

// ==================== CONSTANTS ====================

const periodOptions = [
  { value: "7d", label: "7 Hari Terakhir" },
  { value: "30d", label: "30 Hari Terakhir" },
  { value: "90d", label: "90 Hari Terakhir" },
  { value: "1y", label: "1 Tahun Terakhir" },
  { value: "custom", label: "Custom" },
];

const priorityColors: Record<string, string> = {
  low: "bg-slate-500",
  medium: "bg-blue-500",
  high: "bg-amber-500",
  urgent: "bg-red-500",
};

const statusColors: Record<string, string> = {
  open: "bg-slate-400",
  in_progress: "bg-blue-500",
  completed: "bg-emerald-500",
  on_hold: "bg-amber-500",
  cancelled: "bg-red-400",
};

const typeColors: Record<string, string> = {
  preventive: "bg-blue-500",
  corrective: "bg-amber-500",
  predictive: "bg-purple-500",
  emergency: "bg-red-500",
};

// ==================== CHART COMPONENTS ====================

// Simple Bar Chart
interface SimpleBarChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  showValues?: boolean;
  height?: number;
}

function SimpleBarChart({
  data,
  maxValue,
  showValues = true,
  height = 200,
}: SimpleBarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-2 justify-between" style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex flex-col items-center">
            {showValues && (
              <span className="text-xs font-medium text-slate-600 mb-1">
                {item.value}
              </span>
            )}
            <div
              className={cn(
                "w-full rounded-t-md transition-all",
                item.color || "bg-emerald-500",
              )}
              style={{
                height: `${(item.value / max) * (height - 40)}px`,
                minHeight: item.value > 0 ? "4px" : "0px",
              }}
            />
          </div>
          <span className="text-xs text-slate-500 text-center truncate w-full">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// Donut Chart
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

function DonutChart({
  data,
  size = 160,
  thickness = 24,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {data.map((item, index) => {
          const percentage = total > 0 ? item.value / total : 0;
          const strokeDasharray = `${percentage * circumference} ${circumference}`;
          const strokeDashoffset = -currentOffset * circumference;
          currentOffset += percentage;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={thickness}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          );
        })}
        {total === 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={thickness}
          />
        )}
      </svg>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <span className="text-2xl font-bold text-slate-800">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-xs text-slate-500">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

// Line Sparkline
interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

function Sparkline({
  data,
  color = "#10b981",
  height = 40,
  width = 120,
}: SparklineProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={((data.length - 1) / (data.length - 1)) * width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="3"
        fill={color}
      />
    </svg>
  );
}

// Progress Ring
interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

function ProgressRing({
  value,
  size = 60,
  strokeWidth = 6,
  color = "#10b981",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute text-sm font-bold text-slate-800">
        {value}%
      </span>
    </div>
  );
}

// ==================== STAT CARD COMPONENT ====================

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  sparklineData?: number[];
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "bg-emerald-500",
  sparklineData,
}: StatCardProps) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 mt-2 text-xs font-medium",
                  trend.isPositive ? "text-emerald-600" : "text-red-600",
                )}
              >
                {trend.isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                <span>{Math.abs(trend.value)}% dari periode sebelumnya</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                color,
              )}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            {sparklineData && sparklineData.length > 0 && (
              <Sparkline data={sparklineData} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== METRIC CARD COMPONENT ====================

interface MetricCardProps {
  title: string;
  value: string | number;
  target?: number;
  unit?: string;
  description?: string;
  status?: "good" | "warning" | "critical";
}

function MetricCard({
  title,
  value,
  target,
  unit,
  description,
  status,
}: MetricCardProps) {
  const statusColors = {
    good: "text-emerald-600 bg-emerald-50 border-emerald-200",
    warning: "text-amber-600 bg-amber-50 border-amber-200",
    critical: "text-red-600 bg-red-50 border-red-200",
  };

  return (
    <div
      className={cn(
        "p-4 rounded-xl border-2",
        status ? statusColors[status] : "bg-white border-slate-200",
      )}
    >
      <p className="text-sm text-slate-500 mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold">{value}</span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
      {target && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span>
              Target: {target}
              {unit}
            </span>
            <span>{Math.round((Number(value) / target) * 100)}%</span>
          </div>
          <Progress value={(Number(value) / target) * 100} className="h-1.5" />
        </div>
      )}
      {description && (
        <p className="text-xs text-slate-500 mt-2">{description}</p>
      )}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function AnalyticsDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) {
        setAnalyticsData(result.data);
      } else {
        // Mock data for demo
        setAnalyticsData(getMockData());
      }
    } catch (error) {
      // Use mock data on error
      setAnalyticsData(getMockData());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockData = (): AnalyticsData => ({
    overview: {
      totalWorkOrders: 1247,
      completedWorkOrders: 1089,
      pendingWorkOrders: 112,
      overdueWorkOrders: 46,
      avgCompletionTime: 4.2,
      complianceRate: 87.3,
      mttr: 2.5,
      mtbf: 168,
    },
    trends: {
      woCreated: Array.from({ length: 7 }, (_, i) => ({
        date: `Day ${i + 1}`,
        value: Math.floor(Math.random() * 50) + 20,
      })),
      woCompleted: Array.from({ length: 7 }, (_, i) => ({
        date: `Day ${i + 1}`,
        value: Math.floor(Math.random() * 45) + 15,
      })),
      avgResponseTime: Array.from({ length: 7 }, (_, i) => ({
        date: `Day ${i + 1}`,
        value: Math.random() * 5 + 1,
      })),
    },
    byPriority: [
      { priority: "low", count: 312, percentage: 25, avgTime: 6.2 },
      { priority: "medium", count: 534, percentage: 43, avgTime: 4.1 },
      { priority: "high", count: 287, percentage: 23, avgTime: 2.8 },
      { priority: "urgent", count: 114, percentage: 9, avgTime: 1.2 },
    ],
    byType: [
      { type: "preventive", count: 523, percentage: 42 },
      { type: "corrective", count: 412, percentage: 33 },
      { type: "predictive", count: 187, percentage: 15 },
      { type: "emergency", count: 125, percentage: 10 },
    ],
    byStatus: [
      { status: "open", count: 67, percentage: 5 },
      { status: "in_progress", count: 112, percentage: 9 },
      { status: "completed", count: 1089, percentage: 87 },
      { status: "on_hold", count: 25, percentage: 2 },
    ],
    byLocation: [
      { id: "1", name: "Gedung A", totalWO: 342, completed: 298, pending: 44 },
      { id: "2", name: "Gedung B", totalWO: 287, completed: 256, pending: 31 },
      { id: "3", name: "Gedung C", totalWO: 198, completed: 178, pending: 20 },
      { id: "4", name: "Gudang", totalWO: 156, completed: 143, pending: 13 },
      { id: "5", name: "Workshop", totalWO: 134, completed: 127, pending: 7 },
    ],
    byAsset: [
      {
        id: "1",
        name: "AC Central #1",
        totalWO: 45,
        downtime: 12,
        lastMaintenance: "2025-01-15",
      },
      {
        id: "2",
        name: "Genset #1",
        totalWO: 32,
        downtime: 8,
        lastMaintenance: "2025-01-20",
      },
      {
        id: "3",
        name: "Lift A",
        totalWO: 28,
        downtime: 4,
        lastMaintenance: "2025-01-25",
      },
      {
        id: "4",
        name: "Pompa Air #2",
        totalWO: 24,
        downtime: 6,
        lastMaintenance: "2025-01-18",
      },
      {
        id: "5",
        name: "Panel Listrik",
        totalWO: 21,
        downtime: 2,
        lastMaintenance: "2025-01-22",
      },
    ],
    byTechnician: [
      {
        id: "1",
        name: "Budi Santoso",
        completed: 156,
        inProgress: 3,
        avgTime: 3.2,
        rating: 4.8,
      },
      {
        id: "2",
        name: "Andi Wijaya",
        completed: 142,
        inProgress: 5,
        avgTime: 3.8,
        rating: 4.6,
      },
      {
        id: "3",
        name: "Dedi Kurniawan",
        completed: 128,
        inProgress: 2,
        avgTime: 4.1,
        rating: 4.5,
      },
      {
        id: "4",
        name: "Rudi Hermawan",
        completed: 115,
        inProgress: 4,
        avgTime: 4.5,
        rating: 4.3,
      },
      {
        id: "5",
        name: "Agus Prasetyo",
        completed: 98,
        inProgress: 3,
        avgTime: 4.8,
        rating: 4.2,
      },
    ],
    monthlyComparison: [
      { month: "Jul", created: 180, completed: 165, overdue: 12 },
      { month: "Aug", created: 195, completed: 178, overdue: 15 },
      { month: "Sep", created: 210, completed: 192, overdue: 18 },
      { month: "Oct", created: 225, completed: 208, overdue: 14 },
      { month: "Nov", created: 198, completed: 185, overdue: 10 },
      { month: "Dec", created: 175, completed: 168, overdue: 8 },
    ],
    recentActivity: [
      {
        id: "1",
        type: "completed",
        description: "WO-2025-0147 selesai dikerjakan",
        timestamp: "10 menit lalu",
        user: "Budi S.",
      },
      {
        id: "2",
        type: "created",
        description: "WO-2025-0148 dibuat untuk AC Gedung A",
        timestamp: "25 menit lalu",
        user: "Admin",
      },
      {
        id: "3",
        type: "assigned",
        description: "WO-2025-0145 ditugaskan ke Andi W.",
        timestamp: "1 jam lalu",
        user: "Manager",
      },
      {
        id: "4",
        type: "overdue",
        description: "WO-2025-0132 melewati due date",
        timestamp: "2 jam lalu",
      },
      {
        id: "5",
        type: "completed",
        description: "WO-2025-0143 selesai dikerjakan",
        timestamp: "3 jam lalu",
        user: "Dedi K.",
      },
    ],
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading || !analyticsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const {
    overview,
    byPriority,
    byType,
    byStatus,
    byLocation,
    byAsset,
    byTechnician,
    monthlyComparison,
    recentActivity,
  } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Analytics Dashboard
          </h1>
          <p className="text-slate-500">Monitor performa maintenance dan KPI</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Export PDF</DropdownMenuItem>
              <DropdownMenuItem>Export Excel</DropdownMenuItem>
              <DropdownMenuItem>Export CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Work Orders"
          value={overview.totalWorkOrders.toLocaleString()}
          subtitle={`${overview.completedWorkOrders} selesai`}
          icon={BarChart3}
          trend={{ value: 12, isPositive: true }}
          color="bg-blue-500"
          sparklineData={[30, 45, 35, 50, 42, 55, 48]}
        />
        <StatCard
          title="Completion Rate"
          value={`${Math.round((overview.completedWorkOrders / overview.totalWorkOrders) * 100)}%`}
          subtitle={`${overview.pendingWorkOrders} pending`}
          icon={CheckCircle2}
          trend={{ value: 5, isPositive: true }}
          color="bg-emerald-500"
          sparklineData={[82, 85, 84, 87, 86, 88, 87]}
        />
        <StatCard
          title="Overdue"
          value={overview.overdueWorkOrders}
          subtitle="Perlu perhatian segera"
          icon={AlertTriangle}
          trend={{ value: 8, isPositive: false }}
          color="bg-red-500"
          sparklineData={[12, 15, 18, 14, 16, 13, 11]}
        />
        <StatCard
          title="Compliance Rate"
          value={`${overview.complianceRate}%`}
          subtitle="PM terjadwal"
          icon={Target}
          trend={{ value: 3, isPositive: true }}
          color="bg-violet-500"
          sparklineData={[84, 85, 86, 85, 87, 86, 87]}
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="MTTR"
          value={overview.mttr}
          unit="jam"
          target={4}
          description="Mean Time To Repair"
          status={
            overview.mttr <= 3
              ? "good"
              : overview.mttr <= 5
                ? "warning"
                : "critical"
          }
        />
        <MetricCard
          title="MTBF"
          value={overview.mtbf}
          unit="jam"
          target={200}
          description="Mean Time Between Failures"
          status={
            overview.mtbf >= 150
              ? "good"
              : overview.mtbf >= 100
                ? "warning"
                : "critical"
          }
        />
        <MetricCard
          title="Avg Completion Time"
          value={overview.avgCompletionTime}
          unit="jam"
          target={6}
          description="Rata-rata waktu penyelesaian"
          status={
            overview.avgCompletionTime <= 4
              ? "good"
              : overview.avgCompletionTime <= 6
                ? "warning"
                : "critical"
          }
        />
        <MetricCard
          title="First Time Fix Rate"
          value="92"
          unit="%"
          target={95}
          description="Selesai tanpa rework"
          status="good"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Trend Bulanan</CardTitle>
            <CardDescription>Perbandingan WO dibuat vs selesai</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={monthlyComparison.flatMap((m) => [
                { label: m.month, value: m.created, color: "bg-blue-400" },
                { label: "", value: m.completed, color: "bg-emerald-500" },
              ])}
              height={220}
            />
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-400" />
                <span className="text-sm text-slate-600">Dibuat</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-sm text-slate-600">Selesai</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Status Distribution</CardTitle>
            <CardDescription>Breakdown berdasarkan status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <DonutChart
                data={byStatus.map((s) => ({
                  label: s.status,
                  value: s.count,
                  color: statusColors[s.status] || "#94a3b8",
                }))}
                size={160}
                centerValue={overview.totalWorkOrders}
                centerLabel="Total WO"
              />
            </div>
            <div className="space-y-2">
              {byStatus.map((s) => (
                <div
                  key={s.status}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        statusColors[s.status],
                      )}
                    />
                    <span className="text-sm capitalize">
                      {s.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{s.count}</span>
                    <span className="text-xs text-slate-400">
                      ({s.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority & Type Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Priority */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">By Priority</CardTitle>
            <CardDescription>Distribusi berdasarkan prioritas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {byPriority.map((p) => (
                <div key={p.priority}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full",
                          priorityColors[p.priority],
                        )}
                      />
                      <span className="text-sm font-medium capitalize">
                        {p.priority}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold">{p.count}</span>
                      <span className="text-xs text-slate-400 ml-1">
                        ({p.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={p.percentage} className="h-2 flex-1" />
                    <span className="text-xs text-slate-500 w-16">
                      Avg: {p.avgTime}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By Type */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">By Type</CardTitle>
            <CardDescription>
              Distribusi berdasarkan tipe maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-6">
              <DonutChart
                data={byType.map((t) => ({
                  label: t.type,
                  value: t.count,
                  color: typeColors[t.type] || "#94a3b8",
                }))}
                size={140}
                thickness={20}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {byType.map((t) => (
                <div
                  key={t.type}
                  className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg"
                >
                  <div
                    className={cn("w-3 h-3 rounded-full", typeColors[t.type])}
                  />
                  <div>
                    <p className="text-sm font-medium capitalize">{t.type}</p>
                    <p className="text-xs text-slate-500">
                      {t.count} ({t.percentage}%)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location & Technician Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Locations */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-500" />
              Top Locations
            </CardTitle>
            <CardDescription>WO terbanyak per lokasi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {byLocation.map((loc, index) => (
                <div key={loc.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-800">
                        {loc.name}
                      </span>
                      <span className="text-sm font-bold">{loc.totalWO}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(loc.completed / loc.totalWO) * 100}
                        className="h-1.5 flex-1"
                      />
                      <span className="text-xs text-slate-500">
                        {Math.round((loc.completed / loc.totalWO) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Technicians */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Top Technicians
            </CardTitle>
            <CardDescription>Performa teknisi terbaik</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {byTechnician.map((tech, index) => (
                <div key={tech.id} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={tech.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-sm">
                        {getInitials(tech.name)}
                      </AvatarFallback>
                    </Avatar>
                    {index < 3 && (
                      <div
                        className={cn(
                          "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white",
                          index === 0
                            ? "bg-amber-500"
                            : index === 1
                              ? "bg-slate-400"
                              : "bg-amber-700",
                        )}
                      >
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{tech.name}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{tech.completed} selesai</span>
                      <span>Avg: {tech.avgTime}h</span>
                      <span className="flex items-center gap-1">
                        ⭐ {tech.rating}
                      </span>
                    </div>
                  </div>
                  <ProgressRing
                    value={Math.round((tech.completed / 200) * 100)}
                    size={50}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assets with Most Issues & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Assets */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              Assets - Most Work Orders
            </CardTitle>
            <CardDescription>Aset dengan WO terbanyak</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {byAsset.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-800">{asset.name}</p>
                    <p className="text-xs text-slate-500">
                      Last maintenance:{" "}
                      {new Date(asset.lastMaintenance).toLocaleDateString(
                        "id-ID",
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">
                      {asset.totalWO} WO
                    </p>
                    <p className="text-xs text-amber-600">
                      {asset.downtime}h downtime
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-500" />
              Recent Activity
            </CardTitle>
            <CardDescription>Aktivitas terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        activity.type === "completed"
                          ? "bg-emerald-100 text-emerald-600"
                          : activity.type === "created"
                            ? "bg-blue-100 text-blue-600"
                            : activity.type === "assigned"
                              ? "bg-violet-100 text-violet-600"
                              : "bg-red-100 text-red-600",
                      )}
                    >
                      {activity.type === "completed" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : activity.type === "created" ? (
                        <BarChart3 className="w-4 h-4" />
                      ) : activity.type === "assigned" ? (
                        <Users className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-800">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{activity.timestamp}</span>
                        {activity.user && (
                          <>
                            <span>•</span>
                            <span>{activity.user}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
