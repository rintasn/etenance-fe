"use client";

import { useState, useEffect } from "react";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wrench,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  Building2,
  ArrowRight,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Stats Cards Data
const statsCards = [
  {
    title: "Total Work Orders",
    value: "156",
    change: "+12%",
    trend: "up",
    icon: ClipboardList,
    color: "emerald",
    description: "Bulan ini",
  },
  {
    title: "Completed",
    value: "98",
    change: "+8%",
    trend: "up",
    icon: CheckCircle2,
    color: "blue",
    description: "63% completion rate",
  },
  {
    title: "In Progress",
    value: "42",
    change: "-5%",
    trend: "down",
    icon: Clock,
    color: "amber",
    description: "27% dari total",
  },
  {
    title: "Urgent",
    value: "16",
    change: "+3",
    trend: "up",
    icon: AlertTriangle,
    color: "red",
    description: "Butuh perhatian",
  },
];

// Recent Work Orders
const recentWorkOrders = [
  {
    id: "WO-2024-001",
    title: "PM Chiller 1 - Januari",
    asset: "Chiller 1",
    location: "Lantai Basement",
    priority: "medium",
    status: "in_progress",
    assignee: "Dedi Kurniawan",
    dueDate: "2024-01-15",
  },
  {
    id: "WO-2024-002",
    title: "Perbaikan Lift A2",
    asset: "Lift Penumpang A2",
    location: "Tower A",
    priority: "urgent",
    status: "in_progress",
    assignee: "Fajar Rahman",
    dueDate: "2024-01-20",
  },
  {
    id: "WO-2024-003",
    title: "Emergency - Kebocoran Pipa",
    asset: "Pompa Chilled Water 1",
    location: "Lantai Basement",
    priority: "urgent",
    status: "in_progress",
    assignee: "Eko Prasetyo",
    dueDate: "2024-01-19",
  },
  {
    id: "WO-2024-004",
    title: "PM Genset Tower A",
    asset: "Genset Tower A",
    location: "Ruang Genset",
    priority: "high",
    status: "completed",
    assignee: "Ahmad Sudirman",
    dueDate: "2024-01-08",
  },
  {
    id: "WO-2024-005",
    title: "Inspeksi Fire System Q1",
    asset: "Fire Pump",
    location: "Lantai Basement",
    priority: "high",
    status: "open",
    assignee: "-",
    dueDate: "2024-03-31",
  },
];

// Asset Status
const assetStatus = [
  { status: "Operational", count: 45, color: "bg-emerald-500" },
  { status: "Maintenance", count: 8, color: "bg-amber-500" },
  { status: "Breakdown", count: 3, color: "bg-red-500" },
  { status: "Inactive", count: 4, color: "bg-slate-400" },
];

// Upcoming Schedules
const upcomingSchedules = [
  {
    title: "PM Lift Bulanan",
    date: "28 Feb 2024",
    time: "09:00",
    type: "preventive",
  },
  {
    title: "Inspeksi Struktur Tahunan",
    date: "30 Jun 2024",
    time: "08:00",
    type: "inspection",
  },
  {
    title: "PM Mesin CNC Line 1",
    date: "15 Feb 2024",
    time: "07:00",
    type: "preventive",
  },
  {
    title: "Cleaning Cooling Tower",
    date: "25 Feb 2024",
    time: "10:00",
    type: "cleaning",
  },
];

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700",
};

const statusColors: Record<string, string> = {
  open: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  on_hold: "bg-amber-100 text-amber-700",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  completed: "Completed",
  on_hold: "On Hold",
};

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const totalAssets = assetStatus.reduce((acc, item) => acc + item.count, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Selamat Datang, {user?.username || "User"}! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Berikut ringkasan aktivitas maintenance hari ini
          </p>
        </div>
        <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/25">
          <ClipboardList className="w-4 h-4 mr-2" />
          Buat Work Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span
                      className={cn(
                        "flex items-center text-xs font-semibold",
                        stat.trend === "up" ? "text-emerald-600" : "text-red-600"
                      )}
                    >
                      {stat.trend === "up" ? (
                        <TrendingUp className="w-3 h-3 mr-0.5" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-0.5" />
                      )}
                      {stat.change}
                    </span>
                    <span className="text-xs text-slate-400">{stat.description}</span>
                  </div>
                </div>
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    stat.color === "emerald" && "bg-emerald-100",
                    stat.color === "blue" && "bg-blue-100",
                    stat.color === "amber" && "bg-amber-100",
                    stat.color === "red" && "bg-red-100"
                  )}
                >
                  <stat.icon
                    className={cn(
                      "w-6 h-6",
                      stat.color === "emerald" && "text-emerald-600",
                      stat.color === "blue" && "text-blue-600",
                      stat.color === "amber" && "text-amber-600",
                      stat.color === "red" && "text-red-600"
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Work Orders */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold">Work Orders Terbaru</CardTitle>
              <CardDescription>Daftar work order yang memerlukan perhatian</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
              Lihat Semua
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentWorkOrders.map((wo) => (
                <div
                  key={wo.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">{wo.id}</span>
                        <Badge className={cn("text-xs", priorityColors[wo.priority])}>
                          {wo.priority}
                        </Badge>
                      </div>
                      <p className="font-medium text-slate-800 mt-0.5">{wo.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {wo.asset} • {wo.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={cn("text-xs", statusColors[wo.status])}>
                      {statusLabels[wo.status]}
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">{wo.assignee}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Asset Status */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Status Aset</CardTitle>
                <Package className="w-5 h-5 text-slate-400" />
              </div>
              <CardDescription>{totalAssets} total aset terdaftar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assetStatus.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", item.color)} />
                        <span className="text-sm font-medium text-slate-700">{item.status}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{item.count}</span>
                    </div>
                    <Progress
                      value={(item.count / totalAssets) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Schedules */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Jadwal Mendatang</CardTitle>
                <Calendar className="w-5 h-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingSchedules.map((schedule, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"
                  >
                    <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex flex-col items-center justify-center">
                      <span className="text-xs text-slate-500">
                        {schedule.date.split(" ")[1]}
                      </span>
                      <span className="text-lg font-bold text-slate-800">
                        {schedule.date.split(" ")[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{schedule.title}</p>
                      <p className="text-xs text-slate-500">{schedule.time}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
                        <DropdownMenuItem>Edit Jadwal</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Batalkan</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-cyan-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Total Perusahaan</p>
                <p className="text-3xl font-bold mt-1">3</p>
                <p className="text-xs text-white/60 mt-1">Aktif berlangganan</p>
              </div>
              <Building2 className="w-12 h-12 text-white/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-violet-500 to-purple-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Total Lokasi</p>
                <p className="text-3xl font-bold mt-1">12</p>
                <p className="text-xs text-white/60 mt-1">Tersebar di 3 area</p>
              </div>
              <Building2 className="w-12 h-12 text-white/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500 to-orange-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Total Teknisi</p>
                <p className="text-3xl font-bold mt-1">8</p>
                <p className="text-xs text-white/60 mt-1">6 tersedia hari ini</p>
              </div>
              <Users className="w-12 h-12 text-white/20" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
