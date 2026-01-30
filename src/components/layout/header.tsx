"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Map path ke breadcrumb
const pathNameMap: Record<string, string> = {
  dashboard: "Dashboard",
  "work-orders": "Work Orders",
  companies: "Perusahaan",
  organizations: "Organisasi",
  locations: "Lokasi",
  "asset-types": "Tipe Aset",
  assets: "Aset",
  users: "Users",
  teams: "Tim",
  employees: "Karyawan",
  vendors: "Vendor",
  categories: "Kategori",
  procedures: "Prosedur",
  scheduling: "Penjadwalan",
  "job-loading": "Job Loading",
  analytics: "Analitik",
  reports: "Laporan",
  "master-keys": "Master Key",
  settings: "Pengaturan",
  profile: "Profil",
};

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  // Generate breadcrumbs dari pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    return paths.map((path, index) => ({
      name: pathNameMap[path] || path.charAt(0).toUpperCase() + path.slice(1),
      href: "/" + paths.slice(0, index + 1).join("/"),
      isLast: index === paths.length - 1,
    }));
  };

  const breadcrumbs = generateBreadcrumbs();

  // Dummy notifications
  const notifications = [
    {
      id: 1,
      title: "Work Order Baru",
      message: "WO-2024-001 telah dibuat untuk Chiller 1",
      time: "5 menit lalu",
      read: false,
    },
    {
      id: 2,
      title: "Maintenance Terjadwal",
      message: "PM Genset Tower A besok pukul 09:00",
      time: "1 jam lalu",
      read: false,
    },
    {
      id: 3,
      title: "Asset Status Update",
      message: "Lift A2 status berubah ke maintenance",
      time: "3 jam lalu",
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-slate-400 mx-1" />
              )}
              {crumb.isLast ? (
                <span className="font-semibold text-slate-800">
                  {crumb.name}
                </span>
              ) : (
                <a
                  href={crumb.href}
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {crumb.name}
                </a>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile Title */}
        <h1 className="sm:hidden text-lg font-semibold text-slate-800">
          {breadcrumbs[breadcrumbs.length - 1]?.name || "Dashboard"}
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div
          className={cn(
            "transition-all duration-200",
            searchOpen ? "w-64" : "w-auto"
          )}
        >
          {searchOpen ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari work order, aset..."
                className="pl-9 pr-9 h-9 bg-slate-50 border-slate-200 focus:bg-white"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="text-slate-500 hover:text-slate-700"
            >
              <Search className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Help */}
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-500 hover:text-slate-700 hidden sm:flex"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-slate-700 relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifikasi</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} baru
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                >
                  <div className="flex items-start justify-between w-full gap-2">
                    <span
                      className={cn(
                        "font-medium text-sm",
                        !notif.read && "text-slate-900"
                      )}
                    >
                      {notif.title}
                    </span>
                    {!notif.read && (
                      <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {notif.message}
                  </p>
                  <span className="text-xs text-slate-400">{notif.time}</span>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-emerald-600 font-medium cursor-pointer">
              Lihat Semua Notifikasi
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-500 hover:text-slate-700 hidden sm:flex"
          asChild
        >
          <a href="/settings">
            <Settings className="w-5 h-5" />
          </a>
        </Button>
      </div>
    </header>
  );
}
