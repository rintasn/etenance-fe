"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Package,
  Building2,
  GitBranch,
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ==================== ASSET TYPE MANAGEMENT ====================

const BASE_URL = "http://localhost:8080/api/v1";

interface AssetType {
  id_asset_type: string;
  type_name: string;
  type_desc: string;
  status_asset_type: string;
  created_at: string;
}

const assetTypeInitialFormData = {
  type_name: "",
  type_desc: "",
  status_asset_type: "active",
};

export function AssetTypeManagement() {
  const [data, setData] = useState<AssetType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AssetType | null>(null);
  const [formData, setFormData] = useState(assetTypeInitialFormData);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/asset-types`, {
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
    setFormData(assetTypeInitialFormData);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = (item: AssetType) => {
    setFormData({
      type_name: item.type_name,
      type_desc: item.type_desc || "",
      status_asset_type: item.status_asset_type,
    });
    setSelectedItem(item);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleDelete = (item: AssetType) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleView = (item: AssetType) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = isEditing
        ? `${BASE_URL}/asset-types/${selectedItem?.id_asset_type}`
        : `${BASE_URL}/asset-types`;
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
        isEditing ? "Data berhasil diperbarui" : "Data berhasil ditambahkan",
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
        `${BASE_URL}/asset-types/${selectedItem.id_asset_type}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

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

  const columns: ColumnDef<AssetType>[] = [
    {
      accessorKey: "type_name",
      header: "Tipe Aset",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-800">
              {row.original.type_name}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type_desc",
      header: "Deskripsi",
      cell: ({ row }) => (
        <span className="text-slate-600">{row.original.type_desc || "-"}</span>
      ),
    },
    {
      accessorKey: "status_asset_type",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status_asset_type} />
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
        title="Manajemen Tipe Aset"
        description="Kelola tipe-tipe aset dalam sistem"
      />

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={data}
            searchKey="type_name"
            searchPlaceholder="Cari tipe aset..."
            onAdd={handleAdd}
            addButtonText="Tambah Tipe Aset"
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <FormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={isEditing ? "Edit Tipe Aset" : "Tambah Tipe Aset"}
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
          <div>
            <Label>Nama Tipe Aset *</Label>
            <Input
              value={formData.type_name}
              onChange={(e) =>
                setFormData({ ...formData, type_name: e.target.value })
              }
              placeholder="Contoh: HVAC, Electrical, Mechanical"
              required
            />
          </div>
          <div>
            <Label>Deskripsi</Label>
            <Textarea
              value={formData.type_desc}
              onChange={(e) =>
                setFormData({ ...formData, type_desc: e.target.value })
              }
              placeholder="Masukkan deskripsi tipe aset"
              rows={3}
            />
          </div>
          <div>
            <Label>Status *</Label>
            <Select
              value={formData.status_asset_type}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status_asset_type: value === "__none__" ? "" : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </FormModal>

      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Tipe Aset"
        description={`Apakah Anda yakin ingin menghapus tipe aset "${selectedItem?.type_name}"?`}
        isLoading={isSubmitting}
      />

      <DetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Tipe Aset"
      >
        {selectedItem && (
          <div>
            <DetailRow label="Nama Tipe" value={selectedItem.type_name} />
            <DetailRow
              label="Deskripsi"
              value={selectedItem.type_desc || "-"}
            />
            <DetailRow
              label="Status"
              value={<StatusBadge status={selectedItem.status_asset_type} />}
            />
            <DetailRow
              label="Dibuat"
              value={new Date(selectedItem.created_at).toLocaleString("id-ID")}
            />
          </div>
        )}
      </DetailModal>
    </div>
  );
}

// ==================== ORGANIZATION MANAGEMENT ====================

interface Organization {
  id_organization: string;
  org_name: string;
  org_level: number;
  id_parent_organization: string | null;
  parent_org_name?: string;
  label: string;
  org_status: string;
  created_at: string;
}

const orgInitialFormData = {
  org_name: "",
  org_level: 1,
  id_parent_organization: "",
  label: "Headquarters",
  org_status: "active",
};

export function OrganizationManagement() {
  const [data, setData] = useState<Organization[]>([]);
  const [parentOrgs, setParentOrgs] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Organization | null>(null);
  const [formData, setFormData] = useState(orgInitialFormData);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/organizations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) {
        setData(result.data);
        setParentOrgs(
          result.data.filter((o: Organization) => o.org_level === 1),
        );
      }
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData(orgInitialFormData);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = (item: Organization) => {
    setFormData({
      org_name: item.org_name,
      org_level: item.org_level,
      id_parent_organization: item.id_parent_organization || "",
      label: item.label || "Headquarters",
      org_status: item.org_status,
    });
    setSelectedItem(item);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleDelete = (item: Organization) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleView = (item: Organization) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = isEditing
        ? `${BASE_URL}/organizations/${selectedItem?.id_organization}`
        : `${BASE_URL}/organizations`;
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
        isEditing ? "Data berhasil diperbarui" : "Data berhasil ditambahkan",
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
        `${BASE_URL}/organizations/${selectedItem.id_organization}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

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

  const columns: ColumnDef<Organization>[] = [
    {
      accessorKey: "org_name",
      header: "Organisasi",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
            {row.original.org_level === 1 ? (
              <Building2 className="w-5 h-5 text-white" />
            ) : (
              <GitBranch className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <p className="font-medium text-slate-800">
              {row.original.org_name}
            </p>
            {row.original.parent_org_name && (
              <p className="text-xs text-slate-500">
                ↳ {row.original.parent_org_name}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "label",
      header: "Label",
      cell: ({ row }) => <Badge variant="outline">{row.original.label}</Badge>,
    },
    {
      accessorKey: "org_level",
      header: "Level",
      cell: ({ row }) => (
        <Badge variant="secondary">Level {row.original.org_level}</Badge>
      ),
    },
    {
      accessorKey: "org_status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.org_status} />,
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
        title="Manajemen Organisasi"
        description="Kelola struktur organisasi perusahaan"
      />

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={data}
            searchKey="org_name"
            searchPlaceholder="Cari organisasi..."
            onAdd={handleAdd}
            addButtonText="Tambah Organisasi"
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <FormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={isEditing ? "Edit Organisasi" : "Tambah Organisasi"}
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
          <div>
            <Label>Nama Organisasi *</Label>
            <Input
              value={formData.org_name}
              onChange={(e) =>
                setFormData({ ...formData, org_name: e.target.value })
              }
              placeholder="Masukkan nama organisasi"
              required
            />
          </div>
          <div>
            <Label>Parent Organisasi</Label>
            <Select
              value={formData.id_parent_organization}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  id_parent_organization: value,
                  org_level: value ? 2 : 1,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih parent (opsional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tidak ada (Level 1)</SelectItem>
                {parentOrgs.map((org) => (
                  <SelectItem
                    key={org.id_organization}
                    value={org.id_organization}
                  >
                    {org.org_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Label</Label>
            <Select
              value={formData.label}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  label: value === "__none__" ? "" : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Headquarters">Headquarters</SelectItem>
                <SelectItem value="Division">Division</SelectItem>
                <SelectItem value="Department">Department</SelectItem>
                <SelectItem value="Branch">Branch</SelectItem>
                <SelectItem value="Unit">Unit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status *</Label>
            <Select
              value={formData.org_status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  org_status: value === "__none__" ? "" : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </FormModal>

      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Organisasi"
        description={`Apakah Anda yakin ingin menghapus organisasi "${selectedItem?.org_name}"?`}
        isLoading={isSubmitting}
      />

      <DetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Organisasi"
      >
        {selectedItem && (
          <div>
            <DetailRow label="Nama Organisasi" value={selectedItem.org_name} />
            <DetailRow
              label="Parent"
              value={selectedItem.parent_org_name || "-"}
            />
            <DetailRow label="Label" value={selectedItem.label} />
            <DetailRow
              label="Level"
              value={`Level ${selectedItem.org_level}`}
            />
            <DetailRow
              label="Status"
              value={<StatusBadge status={selectedItem.org_status} />}
            />
            <DetailRow
              label="Dibuat"
              value={new Date(selectedItem.created_at).toLocaleString("id-ID")}
            />
          </div>
        )}
      </DetailModal>
    </div>
  );
}

export default AssetTypeManagement;
