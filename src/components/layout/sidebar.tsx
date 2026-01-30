"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  MapPin,
  Package,
  ClipboardList,
  Wrench,
  Calendar,
  FileText,
  Settings,
  ChevronLeft,
  ChevronDown,
  LogOut,
  UserCircle,
  Bell,
  Key,
  Truck,
  UsersRound,
  Layers,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavItem {
  title: string;
  href?: string;
  icon: any;
  badge?: number;
  children?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: "Menu Utama",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Work Orders",
        href: "/work-order-management",
        icon: ClipboardList,
        badge: 5,
      },
    ],
  },
  {
    title: "Master Data",
    items: [
      {
        title: "Perusahaan",
        icon: Building2,
        children: [
          { title: "Daftar Perusahaan", href: "/companies", icon: Building2 },
          { title: "Organisasi", href: "/organizations", icon: Layers },
        ],
      },
      {
        title: "Lokasi & Aset",
        icon: MapPin,
        children: [
          {
            title: "Lokasi",
            href: "/assets-management/asset-locations",
            icon: MapPin,
          },
          {
            title: "Tipe Aset",
            href: "/assets-management/asset-types",
            icon: Package,
          },
          {
            title: "Daftar Aset",
            href: "/assets-management/assets",
            icon: Package,
          },
        ],
      },
      {
        title: "Tim & Karyawan",
        icon: Users,
        children: [
          { title: "Users", href: "/user-management/users", icon: UserCircle },
          { title: "Tim", href: "/user-management/teams", icon: UsersRound },
          {
            title: "Karyawan",
            href: "/user-management/employees",
            icon: Users,
          },
        ],
      },
      {
        title: "Vendor",
        href: "/vendors-management",
        icon: Truck,
      },
    ],
  },
  {
    title: "Maintenance",
    items: [
      {
        title: "Kategori",
        href: "/category-procedure-management",
        icon: Layers,
      },
      {
        title: "Prosedur",
        href: "/procedures-management",
        icon: FileText,
      },
      {
        title: "Penjadwalan",
        href: "/scheduling-management",
        icon: Calendar,
      },
      {
        title: "Job Loading",
        href: "/job-loading-management",
        icon: Wrench,
      },
    ],
  },
  {
    title: "Laporan",
    items: [
      {
        title: "Analitik",
        href: "/analytics-dashboard",
        icon: BarChart3,
      },
      {
        title: "Laporan WO",
        href: "/report-work-orders",
        icon: FileText,
      },
    ],
  },
  {
    title: "Pengaturan",
    items: [
      {
        title: "Master Key",
        href: "/master-key-management",
        icon: Key,
      },
      {
        title: "Pengaturan",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Load user dari localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Auto-expand menu yang aktif
    navigation.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children) {
          const isActive = item.children.some(
            (child) => child.href === pathname,
          );
          if (isActive && !openMenus.includes(item.title)) {
            setOpenMenus((prev) => [...prev, item.title]);
          }
        }
      });
    });
  }, [pathname]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const NavItemComponent = ({
    item,
    depth = 0,
  }: {
    item: NavItem;
    depth?: number;
  }) => {
    const isActive = item.href === pathname;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus.includes(item.title);

    if (hasChildren) {
      return (
        <Collapsible
          open={isOpen && !collapsed}
          onOpenChange={() => toggleMenu(item.title)}
        >
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                collapsed && "justify-center px-2",
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                  />
                </>
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <div className="ml-4 pl-4 border-l border-slate-200 mt-1 space-y-1">
              {item.children!.map((child) => (
                <NavItemComponent
                  key={child.title}
                  item={child}
                  depth={depth + 1}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    const linkContent = (
      <Link
        href={item.href || "#"}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-500/25"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
          collapsed && "justify-center px-2",
          depth > 0 && "py-2",
        )}
      >
        <item.icon
          className={cn("flex-shrink-0", depth > 0 ? "w-4 h-4" : "w-5 h-5")}
        />
        {!collapsed && (
          <>
            <span className="flex-1">{item.title}</span>
            {item.badge && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-semibold",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 text-emerald-700",
                )}
              >
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.title}
              {item.badge && ` (${item.badge})`}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return linkContent;
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-white border-r border-slate-200 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[280px]",
        className,
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">Etenance</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto">
            <Wrench className="w-5 h-5 text-white" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "h-8 w-8 text-slate-500 hover:text-slate-700",
            collapsed &&
              "absolute -right-3 top-6 bg-white border border-slate-200 shadow-sm rounded-full",
          )}
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 transition-transform",
              collapsed && "rotate-180",
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {navigation.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavItemComponent key={item.title} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className="border-t border-slate-200 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors",
                collapsed && "justify-center",
              )}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-white text-sm font-semibold">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {user?.username || "User"}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {user?.user_role || "Role"}
                  </p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={collapsed ? "center" : "end"}
            className="w-56"
          >
            <div className="px-2 py-1.5">
              <p className="text-sm font-semibold">{user?.username}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <UserCircle className="w-4 h-4 mr-2" />
                Profil Saya
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/notifications" className="cursor-pointer">
                <Bell className="w-4 h-4 mr-2" />
                Notifikasi
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Pengaturan
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
