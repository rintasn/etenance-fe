"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Eye, ClipboardList, Calendar, Clock, User } from "lucide-react";
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
import { FormModal, DeleteModal, DetailModal, DetailRow } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

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
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WorkOrder | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

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
      const response = await fetch("/api/locations", { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (result.data) setLocations(result.data);
    } catch (error) { console.error("Failed to fetch locations"); }
  };

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/assets", { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (result.data) setAssets(result.data);
    } catch (error) { console.error("Failed to fetch assets"); }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/categories", { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (result.data) setCategories(result.data);
    } catch (error) { console.error("Failed to fetch categories"); }
  };

  const fetchProcedures = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/procedures", { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (result.data) setProcedures(result.data);
    } catch (error) { console.error("Failed to fetch procedures"); }
  };

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/vendors", { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (result.data) setVendors(result.data);
    } catch (error) { console.error("Failed to fetch vendors"); }
  };

  const handleAdd = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = (item: WorkOrder) => {
    setFormData({
      wo_name: item.wo_name,
      wo_desc: item.wo_desc || "",
      wo_est_time: item.wo_est_time || 60,
      id_procedure: item.id_procedure || "",
      due_date: item.due_date?.split("T")[0] || "",
      start_date: item.start_date?.split("T")[0] || "",
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
      const url = isEditing ? `/api/work-orders/${selectedItem?.id_wo}` : "/api/work-orders";
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

      toast.success(isEditing ? "Work order berhasil diperbarui" : "Work order berhasil dibuat");
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
            <p className="text-xs text-slate-500">{row.original.asset_name || "No Asset"}</p>
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
        <span className="text-slate-600">{row.original.location_name || "-"}</span>
      ),
    },
    {
      accessorKey: "due_date",
      header: "Due Date",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-slate-600">
          <Calendar className="w-4 h-4" />
          <span>{row.original.due_date ? new Date(row.original.due_date).toLocaleDateString("id-ID") : "-"}</span>
        </div>
      ),
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
            <DropdownMenuItem onClick={() => handleStatusChange(row.original, "in_progress")}>
              Mulai Kerjakan
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(row.original, "completed")}>
              Selesai
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(row.original, "on_hold")}>
              Tunda
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(row.original)} className="text-red-600">
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
      />

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          {/* Status Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-slate-100 p-1">
              {statusFilters.map((filter) => (
                <TabsTrigger
                  key={filter.value}
                  value={filter.value}
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  {filter.label}
                  <Badge variant="secondary" className="ml-2 bg-slate-200 text-slate-600">
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

      {/* Form Modal */}
      <FormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={isEditing ? "Edit Work Order" : "Buat Work Order"}
        description={isEditing ? "Perbarui informasi work order" : "Masukkan informasi work order baru"}
        size="lg"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" onClick={() => setShowFormModal(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
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
                onChange={(e) => setFormData({ ...formData, wo_name: e.target.value })}
                placeholder="Masukkan nama work order"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label>Deskripsi</Label>
              <Textarea
                value={formData.wo_desc}
                onChange={(e) => setFormData({ ...formData, wo_desc: e.target.value })}
                placeholder="Masukkan deskripsi work order"
                rows={3}
              />
            </div>
            <div>
              <Label>Tipe *</Label>
              <Select
                value={formData.wo_type}
                onValueChange={(value) => setFormData({ ...formData, wo_type: value })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                onValueChange={(value) => setFormData({ ...formData, wo_priority: value })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                onValueChange={(value) => setFormData({ ...formData, id_location: value })}
              >
                <SelectTrigger><SelectValue placeholder="Pilih lokasi" /></SelectTrigger>
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
                onValueChange={(value) => setFormData({ ...formData, id_asset: value })}
              >
                <SelectTrigger><SelectValue placeholder="Pilih aset" /></SelectTrigger>
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
                onValueChange={(value) => setFormData({ ...formData, id_categories: value })}
              >
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id_categories} value={cat.id_categories}>
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
                onValueChange={(value) => setFormData({ ...formData, id_procedure: value })}
              >
                <SelectTrigger><SelectValue placeholder="Pilih prosedur" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada</SelectItem>
                  {procedures.map((proc) => (
                    <SelectItem key={proc.id_procedure} value={proc.id_procedure}>
                      {proc.procedure_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Estimasi Waktu (menit)</Label>
              <Input
                type="number"
                min={1}
                value={formData.wo_est_time}
                onChange={(e) => setFormData({ ...formData, wo_est_time: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>Vendor</Label>
              <Select
                value={formData.id_vendor}
                onValueChange={(value) => setFormData({ ...formData, id_vendor: value })}
              >
                <SelectTrigger><SelectValue placeholder="Pilih vendor" /></SelectTrigger>
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
                onValueChange={(value) => setFormData({ ...formData, wo_status: value })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                <h3 className="text-lg font-semibold text-slate-800">{selectedItem.wo_name}</h3>
                <p className="text-slate-500 text-sm">{selectedItem.wo_desc}</p>
              </div>
              <StatusBadge status={selectedItem.wo_status} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <DetailRow label="Tipe" value={<Badge variant="outline" className="capitalize">{woTypeLabels[selectedItem.wo_type]}</Badge>} />
              <DetailRow label="Prioritas" value={<PriorityBadge priority={selectedItem.wo_priority} />} />
              <DetailRow label="Lokasi" value={selectedItem.location_name || "-"} />
              <DetailRow label="Aset" value={selectedItem.asset_name || "-"} />
              <DetailRow label="Kategori" value={selectedItem.category_name || "-"} />
              <DetailRow label="Prosedur" value={selectedItem.procedure_name || "-"} />
              <DetailRow label="Due Date" value={selectedItem.due_date ? new Date(selectedItem.due_date).toLocaleString("id-ID") : "-"} />
              <DetailRow label="Estimasi Waktu" value={`${selectedItem.wo_est_time} menit`} />
              <DetailRow label="Vendor" value={selectedItem.vendor_name || "-"} />
              <DetailRow label="Dibuat" value={new Date(selectedItem.created_at).toLocaleString("id-ID")} />
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
}
