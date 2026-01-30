"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Eye, Layers, FileText, Clock } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { FormModal, DeleteModal, DetailModal, DetailRow } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ==================== CATEGORY MANAGEMENT ====================

interface Category {
  id_categories: string;
  category_name: string;
  category_icon: string;
  category_desc: string;
  created_at: string;
}

const categoryInitialFormData = {
  category_name: "",
  category_icon: "wrench",
  category_desc: "",
};

const iconOptions = [
  { value: "wrench", label: "Wrench" },
  { value: "tools", label: "Tools" },
  { value: "chart-line", label: "Chart Line" },
  { value: "alert-triangle", label: "Alert Triangle" },
  { value: "search", label: "Search" },
  { value: "droplet", label: "Droplet" },
  { value: "sliders", label: "Sliders" },
  { value: "refresh-cw", label: "Refresh" },
  { value: "settings", label: "Settings" },
  { value: "clipboard", label: "Clipboard" },
];

export function CategoryManagement() {
  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Category | null>(null);
  const [formData, setFormData] = useState(categoryInitialFormData);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/categories", {
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

  const handleAdd = () => {
    setFormData(categoryInitialFormData);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = (item: Category) => {
    setFormData({
      category_name: item.category_name,
      category_icon: item.category_icon || "wrench",
      category_desc: item.category_desc || "",
    });
    setSelectedItem(item);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleDelete = (item: Category) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleView = (item: Category) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = isEditing ? `/api/categories/${selectedItem?.id_categories}` : "/api/categories";
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

      toast.success(isEditing ? "Data berhasil diperbarui" : "Data berhasil ditambahkan");
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
      const response = await fetch(`/api/categories/${selectedItem.id_categories}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Gagal menghapus data");

      toast.success("Data berhasil dihapus");
      setShowDeleteModal(false);
      fetchData();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "category_name",
      header: "Kategori",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-800">{row.original.category_name}</p>
            <p className="text-xs text-slate-500">{row.original.category_icon}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category_desc",
      header: "Deskripsi",
      cell: ({ row }) => (
        <span className="text-slate-600">{row.original.category_desc || "-"}</span>
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
            <DropdownMenuItem onClick={() => handleDelete(row.original)} className="text-red-600">
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
        title="Manajemen Kategori"
        description="Kelola kategori work order"
      />

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={data}
            searchKey="category_name"
            searchPlaceholder="Cari kategori..."
            onAdd={handleAdd}
            addButtonText="Tambah Kategori"
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <FormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={isEditing ? "Edit Kategori" : "Tambah Kategori"}
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" onClick={() => setShowFormModal(false)} disabled={isSubmitting}>Batal</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nama Kategori *</Label>
            <Input
              value={formData.category_name}
              onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
              placeholder="Masukkan nama kategori"
              required
            />
          </div>
          <div>
            <Label>Icon</Label>
            <Select
              value={formData.category_icon}
              onValueChange={(value) => setFormData({ ...formData, category_icon: value })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {iconOptions.map((icon) => (
                  <SelectItem key={icon.value} value={icon.value}>{icon.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Deskripsi</Label>
            <Textarea
              value={formData.category_desc}
              onChange={(e) => setFormData({ ...formData, category_desc: e.target.value })}
              placeholder="Masukkan deskripsi kategori"
              rows={3}
            />
          </div>
        </form>
      </FormModal>

      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Kategori"
        description={`Apakah Anda yakin ingin menghapus kategori "${selectedItem?.category_name}"?`}
        isLoading={isSubmitting}
      />

      <DetailModal open={showDetailModal} onClose={() => setShowDetailModal(false)} title="Detail Kategori">
        {selectedItem && (
          <div>
            <DetailRow label="Nama Kategori" value={selectedItem.category_name} />
            <DetailRow label="Icon" value={selectedItem.category_icon} />
            <DetailRow label="Deskripsi" value={selectedItem.category_desc || "-"} />
            <DetailRow label="Dibuat" value={new Date(selectedItem.created_at).toLocaleString("id-ID")} />
          </div>
        )}
      </DetailModal>
    </div>
  );
}

// ==================== PROCEDURE MANAGEMENT ====================

interface Procedure {
  id_procedure: string;
  procedure_name: string;
  procedure_desc: string;
  procedure_steps: string;
  estimated_time: number;
  id_asset_type: string | null;
  asset_type_name?: string;
  created_at: string;
}

interface AssetType {
  id_asset_type: string;
  type_name: string;
}

const procedureInitialFormData = {
  procedure_name: "",
  procedure_desc: "",
  procedure_steps: "",
  estimated_time: 60,
  id_asset_type: "",
};

export function ProcedureManagement() {
  const [data, setData] = useState<Procedure[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Procedure | null>(null);
  const [formData, setFormData] = useState(procedureInitialFormData);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
    fetchAssetTypes();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/procedures", {
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

  const fetchAssetTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/asset-types", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setAssetTypes(result.data);
    } catch (error) {
      console.error("Failed to fetch asset types");
    }
  };

  const handleAdd = () => {
    setFormData(procedureInitialFormData);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = (item: Procedure) => {
    setFormData({
      procedure_name: item.procedure_name,
      procedure_desc: item.procedure_desc || "",
      procedure_steps: item.procedure_steps || "",
      estimated_time: item.estimated_time || 60,
      id_asset_type: item.id_asset_type || "",
    });
    setSelectedItem(item);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleDelete = (item: Procedure) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleView = (item: Procedure) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = isEditing ? `/api/procedures/${selectedItem?.id_procedure}` : "/api/procedures";
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

      toast.success(isEditing ? "Data berhasil diperbarui" : "Data berhasil ditambahkan");
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
      const response = await fetch(`/api/procedures/${selectedItem.id_procedure}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Gagal menghapus data");

      toast.success("Data berhasil dihapus");
      setShowDeleteModal(false);
      fetchData();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Procedure>[] = [
    {
      accessorKey: "procedure_name",
      header: "Prosedur",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-800">{row.original.procedure_name}</p>
            <p className="text-xs text-slate-500">{row.original.asset_type_name || "General"}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "procedure_desc",
      header: "Deskripsi",
      cell: ({ row }) => (
        <span className="text-slate-600 line-clamp-2">{row.original.procedure_desc || "-"}</span>
      ),
    },
    {
      accessorKey: "estimated_time",
      header: "Est. Waktu",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-slate-600">
          <Clock className="w-4 h-4" />
          <span>{row.original.estimated_time} menit</span>
        </div>
      ),
    },
    {
      accessorKey: "asset_type_name",
      header: "Tipe Aset",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.asset_type_name || "General"}</Badge>
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
            <DropdownMenuItem onClick={() => handleDelete(row.original)} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Parse steps from JSON string
  const parseSteps = (steps: string): string[] => {
    try {
      return JSON.parse(steps);
    } catch {
      return steps ? [steps] : [];
    }
  };

  return (
    <div>
      <PageHeader
        title="Manajemen Prosedur"
        description="Kelola prosedur maintenance"
      />

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={data}
            searchKey="procedure_name"
            searchPlaceholder="Cari prosedur..."
            onAdd={handleAdd}
            addButtonText="Tambah Prosedur"
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <FormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={isEditing ? "Edit Prosedur" : "Tambah Prosedur"}
        size="lg"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" onClick={() => setShowFormModal(false)} disabled={isSubmitting}>Batal</Button>
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
              <Label>Nama Prosedur *</Label>
              <Input
                value={formData.procedure_name}
                onChange={(e) => setFormData({ ...formData, procedure_name: e.target.value })}
                placeholder="Masukkan nama prosedur"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label>Deskripsi</Label>
              <Textarea
                value={formData.procedure_desc}
                onChange={(e) => setFormData({ ...formData, procedure_desc: e.target.value })}
                placeholder="Masukkan deskripsi prosedur"
                rows={2}
              />
            </div>
            <div>
              <Label>Tipe Aset</Label>
              <Select
                value={formData.id_asset_type}
                onValueChange={(value) => setFormData({ ...formData, id_asset_type: value })}
              >
                <SelectTrigger><SelectValue placeholder="Pilih tipe aset" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">General</SelectItem>
                  {assetTypes.map((type) => (
                    <SelectItem key={type.id_asset_type} value={type.id_asset_type}>
                      {type.type_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estimasi Waktu (menit)</Label>
              <Input
                type="number"
                min={1}
                value={formData.estimated_time}
                onChange={(e) => setFormData({ ...formData, estimated_time: parseInt(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Langkah-langkah (JSON array)</Label>
              <Textarea
                value={formData.procedure_steps}
                onChange={(e) => setFormData({ ...formData, procedure_steps: e.target.value })}
                placeholder='["Langkah 1", "Langkah 2", "Langkah 3"]'
                rows={4}
              />
              <p className="text-xs text-slate-500 mt-1">Format: ["Step 1", "Step 2", "Step 3"]</p>
            </div>
          </div>
        </form>
      </FormModal>

      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Prosedur"
        description={`Apakah Anda yakin ingin menghapus prosedur "${selectedItem?.procedure_name}"?`}
        isLoading={isSubmitting}
      />

      <DetailModal open={showDetailModal} onClose={() => setShowDetailModal(false)} title="Detail Prosedur" size="lg">
        {selectedItem && (
          <div>
            <DetailRow label="Nama Prosedur" value={selectedItem.procedure_name} />
            <DetailRow label="Deskripsi" value={selectedItem.procedure_desc || "-"} />
            <DetailRow label="Tipe Aset" value={selectedItem.asset_type_name || "General"} />
            <DetailRow label="Estimasi Waktu" value={`${selectedItem.estimated_time} menit`} />
            <div className="py-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-500 block mb-2">Langkah-langkah</span>
              <ol className="list-decimal list-inside space-y-1">
                {parseSteps(selectedItem.procedure_steps).map((step, idx) => (
                  <li key={idx} className="text-sm text-slate-800">{step}</li>
                ))}
              </ol>
            </div>
            <DetailRow label="Dibuat" value={new Date(selectedItem.created_at).toLocaleString("id-ID")} />
          </div>
        )}
      </DetailModal>
    </div>
  );
}

export default CategoryManagement;
