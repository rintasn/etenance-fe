"use client";

import { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Key,
  Plus,
  Settings,
  Tag,
  Hash,
  ToggleLeft,
  Copy,
  Check,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Shield,
  Lock,
  Unlock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { StatusBadge } from "@/components/ui/status-badge";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ==================== INTERFACES ====================

interface MasterKey {
  id_master_key: string;
  key_group: string;
  key_code: string;
  key_name: string;
  key_value: string;
  key_desc: string;
  key_type:
    | "string"
    | "number"
    | "boolean"
    | "json"
    | "color"
    | "url"
    | "email";
  key_order: number;
  is_system: boolean;
  is_active: boolean;
  is_editable: boolean;
  id_company: string | null;
  company_name?: string;
  created_at: string;
  updated_at: string;
}

interface KeyGroup {
  group_name: string;
  group_code: string;
  description: string;
  icon: string;
  count: number;
}

// ==================== CONSTANTS ====================

const initialFormData = {
  key_group: "",
  key_code: "",
  key_name: "",
  key_value: "",
  key_desc: "",
  key_type: "string" as const,
  key_order: 0,
  is_system: false,
  is_active: true,
  is_editable: true,
  id_company: "",
};

const keyTypes = [
  { value: "string", label: "Text", icon: "Aa" },
  { value: "number", label: "Number", icon: "#" },
  { value: "boolean", label: "Boolean", icon: "⊘" },
  { value: "json", label: "JSON", icon: "{}" },
  { value: "color", label: "Color", icon: "🎨" },
  { value: "url", label: "URL", icon: "🔗" },
  { value: "email", label: "Email", icon: "✉" },
];

const predefinedGroups = [
  {
    code: "GENERAL",
    name: "General Settings",
    icon: "Settings",
    description: "Pengaturan umum aplikasi",
  },
  {
    code: "NOTIFICATION",
    name: "Notification",
    icon: "Bell",
    description: "Pengaturan notifikasi",
  },
  {
    code: "WORK_ORDER",
    name: "Work Order",
    icon: "ClipboardList",
    description: "Konfigurasi work order",
  },
  {
    code: "ASSET",
    name: "Asset",
    icon: "Package",
    description: "Konfigurasi aset",
  },
  {
    code: "MAINTENANCE",
    name: "Maintenance",
    icon: "Wrench",
    description: "Konfigurasi maintenance",
  },
  {
    code: "REPORT",
    name: "Report",
    icon: "FileText",
    description: "Pengaturan laporan",
  },
  {
    code: "PRIORITY",
    name: "Priority Levels",
    icon: "Flag",
    description: "Level prioritas",
  },
  {
    code: "STATUS",
    name: "Status Types",
    icon: "Tag",
    description: "Tipe status",
  },
  {
    code: "INTEGRATION",
    name: "Integration",
    icon: "Link",
    description: "Integrasi pihak ketiga",
  },
  {
    code: "EMAIL",
    name: "Email Templates",
    icon: "Mail",
    description: "Template email",
  },
];

const typeColors: Record<string, string> = {
  string: "bg-blue-100 text-blue-700",
  number: "bg-emerald-100 text-emerald-700",
  boolean: "bg-purple-100 text-purple-700",
  json: "bg-amber-100 text-amber-700",
  color: "bg-pink-100 text-pink-700",
  url: "bg-cyan-100 text-cyan-700",
  email: "bg-indigo-100 text-indigo-700",
};

// ==================== HELPER COMPONENTS ====================

interface CopyButtonProps {
  text: string;
}

function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Disalin ke clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Disalin!" : "Salin"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface KeyValueDisplayProps {
  keyData: MasterKey;
}

function KeyValueDisplay({ keyData }: KeyValueDisplayProps) {
  const { key_type, key_value } = keyData;

  switch (key_type) {
    case "boolean":
      return (
        <Badge variant={key_value === "true" ? "default" : "secondary"}>
          {key_value === "true" ? "True" : "False"}
        </Badge>
      );
    case "color":
      return (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border border-slate-200"
            style={{ backgroundColor: key_value }}
          />
          <span className="font-mono text-sm">{key_value}</span>
        </div>
      );
    case "json":
      return (
        <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
          {key_value.length > 50
            ? `${key_value.substring(0, 50)}...`
            : key_value}
        </code>
      );
    case "url":
      return (
        <a
          href={key_value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm truncate max-w-[200px] block"
        >
          {key_value}
        </a>
      );
    case "number":
      return <span className="font-mono font-semibold">{key_value}</span>;
    default:
      return (
        <span className="text-slate-700 truncate max-w-[200px] block">
          {key_value || "-"}
        </span>
      );
  }
}

interface KeyValueInputProps {
  type: string;
  value: string;
  onChange: (value: string) => void;
}

function KeyValueInput({ type, value, onChange }: KeyValueInputProps) {
  switch (type) {
    case "boolean":
      return (
        <div className="flex items-center gap-3">
          <Switch
            checked={value === "true"}
            onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
          />
          <span className="text-sm text-slate-600">
            {value === "true" ? "Aktif (True)" : "Nonaktif (False)"}
          </span>
        </div>
      );
    case "color":
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-10 rounded border border-slate-200 cursor-pointer"
          />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="font-mono"
          />
        </div>
      );
    case "json":
      return (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='{"key": "value"}'
          rows={5}
          className="font-mono text-sm"
        />
      );
    case "number":
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
        />
      );
    case "url":
      return (
        <Input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com"
        />
      );
    case "email":
      return (
        <Input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="email@example.com"
        />
      );
    default:
      return (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Masukkan nilai"
        />
      );
  }
}

// ==================== GROUP CARD COMPONENT ====================

interface GroupCardProps {
  group: KeyGroup;
  isActive: boolean;
  onClick: () => void;
}

function GroupCard({ group, isActive, onClick }: GroupCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border-2 cursor-pointer transition-all",
        isActive
          ? "border-emerald-500 bg-emerald-50"
          : "border-slate-200 hover:border-slate-300 bg-white",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isActive
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-600",
            )}
          >
            <Key className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">{group.group_name}</p>
            <p className="text-xs text-slate-500">{group.description}</p>
          </div>
        </div>
        <Badge variant="secondary" className="font-semibold">
          {group.count}
        </Badge>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function MasterKeyManagement() {
  const [data, setData] = useState<MasterKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MasterKey | null>(null);
  const [formData, setFormData] = useState<{
    key_group: string;
    key_code: string;
    key_name: string;
    key_value: string;
    key_desc: string;
    key_type: MasterKey["key_type"];
    key_order: number;
    is_system: boolean;
    is_active: boolean;
    is_editable: boolean;
    id_company: string | null | "";
  }>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  // Computed: Group data by key_group
  const groupedData = useMemo(() => {
    const groups: Record<string, KeyGroup> = {};

    // Initialize with predefined groups
    predefinedGroups.forEach((g) => {
      groups[g.code] = {
        group_code: g.code,
        group_name: g.name,
        description: g.description,
        icon: g.icon,
        count: 0,
      };
    });

    // Count items per group
    data.forEach((item) => {
      if (groups[item.key_group]) {
        groups[item.key_group].count++;
      } else {
        groups[item.key_group] = {
          group_code: item.key_group,
          group_name: item.key_group,
          description: "Custom group",
          icon: "Key",
          count: 1,
        };
      }
    });

    return Object.values(groups).filter(
      (g) =>
        g.count > 0 || predefinedGroups.some((pg) => pg.code === g.group_code),
    );
  }, [data]);

  // Computed: Filtered data
  const filteredData = useMemo(() => {
    let result = data;

    // Filter by group
    if (activeGroup !== "all") {
      result = result.filter((item) => item.key_group === activeGroup);
    }

    // Filter by search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.key_code.toLowerCase().includes(search) ||
          item.key_name.toLowerCase().includes(search) ||
          item.key_value.toLowerCase().includes(search),
      );
    }

    return result;
  }, [data, activeGroup, searchTerm]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/master-keys", {
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

  const handleAdd = (group?: string) => {
    setFormData({
      ...initialFormData,
      key_group: group || "",
    });
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = (item: MasterKey) => {
    if (!item.is_editable) {
      toast.error("Key ini tidak dapat diedit karena merupakan system key");
      return;
    }
    setFormData({
      key_group: item.key_group,
      key_code: item.key_code,
      key_name: item.key_name,
      key_value: item.key_value,
      key_desc: item.key_desc || "",
      key_type: item.key_type,
      key_order: item.key_order,
      is_system: item.is_system,
      is_active: item.is_active,
      is_editable: item.is_editable,
      id_company: item.id_company || "",
    });
    setSelectedItem(item);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleDelete = (item: MasterKey) => {
    if (item.is_system) {
      toast.error("System key tidak dapat dihapus");
      return;
    }
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleView = (item: MasterKey) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleToggleActive = async (item: MasterKey) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/master-keys/${item.id_master_key}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...item, is_active: !item.is_active }),
      });

      if (!response.ok) throw new Error("Gagal mengubah status");

      toast.success(`Key ${item.is_active ? "dinonaktifkan" : "diaktifkan"}`);
      fetchData();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate JSON if type is json
    if (formData.key_type === "json") {
      try {
        JSON.parse(formData.key_value);
      } catch {
        toast.error("Format JSON tidak valid");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      const url = isEditing
        ? `/api/master-keys/${selectedItem?.id_master_key}`
        : "/api/master-keys";
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
        isEditing ? "Key berhasil diperbarui" : "Key berhasil ditambahkan",
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
        `/api/master-keys/${selectedItem.id_master_key}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Gagal menghapus data");

      toast.success("Key berhasil dihapus");
      setShowDeleteModal(false);
      fetchData();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    const exportData = filteredData.map((item) => ({
      key_group: item.key_group,
      key_code: item.key_code,
      key_name: item.key_name,
      key_value: item.key_value,
      key_type: item.key_type,
      key_desc: item.key_desc,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `master-keys-${activeGroup || "all"}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data berhasil diexport");
  };

  const columns: ColumnDef<MasterKey>[] = [
    {
      accessorKey: "key_code",
      header: "Key Code",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {row.original.is_system ? (
              <Lock className="w-4 h-4 text-amber-500" />
            ) : (
              <Key className="w-4 h-4 text-slate-400" />
            )}
            <code className="text-sm font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
              {row.original.key_code}
            </code>
          </div>
          <CopyButton text={row.original.key_code} />
        </div>
      ),
    },
    {
      accessorKey: "key_name",
      header: "Nama",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-800">{row.original.key_name}</p>
          <p className="text-xs text-slate-500 truncate max-w-[200px]">
            {row.original.key_desc || "-"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "key_value",
      header: "Nilai",
      cell: ({ row }) => <KeyValueDisplay keyData={row.original} />,
    },
    {
      accessorKey: "key_type",
      header: "Tipe",
      cell: ({ row }) => (
        <Badge className={cn("capitalize", typeColors[row.original.key_type])}>
          {row.original.key_type}
        </Badge>
      ),
    },
    {
      accessorKey: "key_group",
      header: "Group",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.key_group}</Badge>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.original.is_active}
            onCheckedChange={() => handleToggleActive(row.original)}
            disabled={row.original.is_system}
          />
          <span
            className={cn(
              "text-xs",
              row.original.is_active ? "text-emerald-600" : "text-slate-400",
            )}
          >
            {row.original.is_active ? "Aktif" : "Nonaktif"}
          </span>
        </div>
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
            <DropdownMenuItem
              onClick={() => handleEdit(row.original)}
              disabled={!row.original.is_editable}
            >
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDelete(row.original)}
              className="text-red-600"
              disabled={row.original.is_system}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Stats
  const stats = {
    total: data.length,
    active: data.filter((d) => d.is_active).length,
    system: data.filter((d) => d.is_system).length,
    groups: groupedData.length,
  };

  return (
    <div>
      <PageHeader
        title="Master Key"
        description="Kelola konfigurasi dan pengaturan sistem"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() =>
                handleAdd(activeGroup !== "all" ? activeGroup : undefined)
              }
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Key
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
                <Key className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.total}
                </p>
                <p className="text-xs text-slate-500">Total Keys</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ToggleLeft className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.active}
                </p>
                <p className="text-xs text-slate-500">Active Keys</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.system}
                </p>
                <p className="text-xs text-slate-500">System Keys</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Tag className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.groups}
                </p>
                <p className="text-xs text-slate-500">Groups</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Groups */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-md sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Groups</CardTitle>
              <CardDescription>Filter berdasarkan grup</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-2">
                  <div
                    onClick={() => setActiveGroup("all")}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between",
                      activeGroup === "all"
                        ? "bg-emerald-50 border-2 border-emerald-500"
                        : "bg-slate-50 hover:bg-slate-100 border-2 border-transparent",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span className="font-medium">Semua</span>
                    </div>
                    <Badge variant="secondary">{data.length}</Badge>
                  </div>

                  <Separator className="my-3" />

                  {groupedData.map((group) => (
                    <div
                      key={group.group_code}
                      onClick={() => setActiveGroup(group.group_code)}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-all",
                        activeGroup === group.group_code
                          ? "bg-emerald-50 border-2 border-emerald-500"
                          : "bg-slate-50 hover:bg-slate-100 border-2 border-transparent",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          <span className="font-medium text-sm">
                            {group.group_name}
                          </span>
                        </div>
                        <Badge variant="secondary">{group.count}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 ml-6">
                        {group.description}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {activeGroup === "all"
                      ? "Semua Keys"
                      : groupedData.find((g) => g.group_code === activeGroup)
                          ?.group_name || activeGroup}
                  </CardTitle>
                  <CardDescription>
                    {filteredData.length} key ditemukan
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Cari key..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-[200px]"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activeGroup !== "all" && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Grup: {activeGroup}</AlertTitle>
                  <AlertDescription>
                    Menampilkan semua key dalam grup{" "}
                    {groupedData.find((g) => g.group_code === activeGroup)
                      ?.group_name || activeGroup}
                  </AlertDescription>
                </Alert>
              )}

              <DataTable
                columns={columns}
                data={filteredData}
                searchKey="key_code"
                searchPlaceholder="Cari key..."
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Modal */}
      <FormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={isEditing ? "Edit Master Key" : "Tambah Master Key"}
        description={
          isEditing
            ? "Perbarui konfigurasi key"
            : "Masukkan konfigurasi key baru"
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
            <div>
              <Label>Group *</Label>
              <Select
                value={formData.key_group}
                onValueChange={(value) =>
                  setFormData({ ...formData, key_group: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih grup" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedGroups.map((group) => (
                    <SelectItem key={group.code} value={group.code}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipe *</Label>
              <Select
                value={formData.key_type}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, key_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {keyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Key Code *</Label>
              <Input
                value={formData.key_code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    key_code: e.target.value.toUpperCase().replace(/\s/g, "_"),
                  })
                }
                placeholder="EXAMPLE_KEY_CODE"
                className="font-mono"
                disabled={isEditing}
              />
              <p className="text-xs text-slate-500 mt-1">
                Hanya huruf kapital, angka, dan underscore
              </p>
            </div>
            <div>
              <Label>Nama Key *</Label>
              <Input
                value={formData.key_name}
                onChange={(e) =>
                  setFormData({ ...formData, key_name: e.target.value })
                }
                placeholder="Nama yang mudah dipahami"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Nilai *</Label>
              <KeyValueInput
                type={formData.key_type}
                value={formData.key_value}
                onChange={(value) =>
                  setFormData({ ...formData, key_value: value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label>Deskripsi</Label>
              <Textarea
                value={formData.key_desc}
                onChange={(e) =>
                  setFormData({ ...formData, key_desc: e.target.value })
                }
                placeholder="Jelaskan fungsi key ini"
                rows={2}
              />
            </div>
            <div>
              <Label>Urutan</Label>
              <Input
                type="number"
                min={0}
                value={formData.key_order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    key_order: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label>Aktif</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_editable}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_editable: checked })
                  }
                />
                <Label>Dapat Diedit</Label>
              </div>
            </div>
          </div>
        </form>
      </FormModal>

      {/* Delete Modal */}
      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Master Key"
        description={
          <span>
            Apakah Anda yakin ingin menghapus key{" "}
            <code className="bg-slate-100 px-1 rounded">
              {selectedItem?.key_code}
            </code>
            ? Tindakan ini tidak dapat dibatalkan.
          </span>
        }
        isLoading={isSubmitting}
      />

      {/* Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Master Key"
        size="lg"
      >
        {selectedItem && (
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    selectedItem.is_system ? "bg-amber-100" : "bg-slate-100",
                  )}
                >
                  {selectedItem.is_system ? (
                    <Lock className="w-6 h-6 text-amber-600" />
                  ) : (
                    <Key className="w-6 h-6 text-slate-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-mono font-semibold text-slate-800">
                      {selectedItem.key_code}
                    </code>
                    <CopyButton text={selectedItem.key_code} />
                  </div>
                  <p className="text-slate-500">{selectedItem.key_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={cn(
                    "capitalize",
                    typeColors[selectedItem.key_type],
                  )}
                >
                  {selectedItem.key_type}
                </Badge>
                {selectedItem.is_system && (
                  <Badge
                    variant="outline"
                    className="text-amber-600 border-amber-300"
                  >
                    <Lock className="w-3 h-3 mr-1" />
                    System
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <Label className="text-xs text-slate-500">Nilai</Label>
                <div className="mt-2">
                  {selectedItem.key_type === "json" ? (
                    <pre className="text-sm font-mono bg-white p-3 rounded border overflow-x-auto">
                      {JSON.stringify(
                        JSON.parse(selectedItem.key_value || "{}"),
                        null,
                        2,
                      )}
                    </pre>
                  ) : (
                    <KeyValueDisplay keyData={selectedItem} />
                  )}
                </div>
              </div>

              <DetailRow
                label="Group"
                value={
                  <Badge variant="outline">{selectedItem.key_group}</Badge>
                }
              />
              <DetailRow
                label="Deskripsi"
                value={selectedItem.key_desc || "-"}
              />
              <DetailRow label="Urutan" value={selectedItem.key_order} />
              <DetailRow
                label="Status"
                value={
                  <Badge
                    variant={selectedItem.is_active ? "default" : "secondary"}
                  >
                    {selectedItem.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                }
              />
              <DetailRow
                label="Dapat Diedit"
                value={selectedItem.is_editable ? "Ya" : "Tidak"}
              />
              <DetailRow
                label="Dibuat"
                value={new Date(selectedItem.created_at).toLocaleString(
                  "id-ID",
                )}
              />
              <DetailRow
                label="Diperbarui"
                value={new Date(selectedItem.updated_at).toLocaleString(
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
                disabled={!selectedItem.is_editable}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${selectedItem.key_code}=${selectedItem.key_value}`,
                  );
                  toast.success("Key-Value disalin ke clipboard");
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Key=Value
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false);
                  handleDelete(selectedItem);
                }}
                className="text-red-600 hover:text-red-700 ml-auto"
                disabled={selectedItem.is_system}
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
