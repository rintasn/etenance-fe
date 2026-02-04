"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Package,
  QrCode,
  Calendar,
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
import { StatusBadge, CriticalityBadge } from "@/components/ui/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const BASE_URL = "http://localhost:8080/api/v1";

interface Asset {
  id_asset: string;
  id_location: string;
  location_name?: string;
  asset_name: string;
  asset_desc: string;
  asset_criticality: string;
  asset_serialnumber: string;
  asset_year: number;
  asset_qr_code: string;
  id_asset_type: string;
  asset_type_name?: string;
  id_vendor: string | null;
  vendor_name?: string;
  asset_status: string;
  id_parent_asset: string | null;
  parent_asset_name?: string;
  level_asset: number;
  created_at: string;
}

interface Location {
  id_location: string;
  location_name: string;
}

interface AssetType {
  id_asset_type: string;
  type_name: string;
}

interface Vendor {
  id_vendor: string;
  vendor_name: string;
}

const initialFormData = {
  asset_name: "",
  asset_desc: "",
  asset_criticality: "medium",
  asset_serialnumber: "",
  asset_year: new Date().getFullYear(),
  asset_qr_code: "",
  id_location: "",
  id_asset_type: "",
  id_vendor: "",
  asset_status: "operational",
  id_parent_asset: "",
  level_asset: 1,
};

export default function AssetManagement() {
  const [data, setData] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [parentAssets, setParentAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Asset | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
    fetchLocations();
    fetchAssetTypes();
    fetchVendors();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/assets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) {
        setData(result.data);
        setParentAssets(result.data.filter((a: Asset) => a.level_asset === 1));
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
      const response = await fetch(`${BASE_URL}/locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setLocations(result.data);
    } catch (error) {
      console.error("Failed to fetch locations");
    }
  };

  const fetchAssetTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/asset-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setAssetTypes(result.data);
    } catch (error) {
      console.error("Failed to fetch asset types");
    }
  };

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/vendors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setVendors(result.data);
    } catch (error) {
      console.error("Failed to fetch vendors");
    }
  };

  const handleAdd = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = (item: Asset) => {
    setFormData({
      asset_name: item.asset_name,
      asset_desc: item.asset_desc || "",
      asset_criticality: item.asset_criticality,
      asset_serialnumber: item.asset_serialnumber || "",
      asset_year: item.asset_year || new Date().getFullYear(),
      asset_qr_code: item.asset_qr_code || "",
      id_location: item.id_location || "",
      id_asset_type: item.id_asset_type || "",
      id_vendor: item.id_vendor || "",
      asset_status: item.asset_status,
      id_parent_asset: item.id_parent_asset || "",
      level_asset: item.level_asset,
    });
    setSelectedItem(item);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleDelete = (item: Asset) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleView = (item: Asset) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = isEditing
        ? `${BASE_URL}/assets/${selectedItem?.id_asset}`
        : `${BASE_URL}/assets`;
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
        `${BASE_URL}/assets/${selectedItem.id_asset}`,
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

  const columns: ColumnDef<Asset>[] = [
    {
      accessorKey: "asset_name",
      header: "Aset",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-800">
              {row.original.asset_name}
            </p>
            <p className="text-xs text-slate-500">
              {row.original.asset_type_name}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "location_name",
      header: "Lokasi",
      cell: ({ row }) => (
        <span className="text-slate-600">
          {row.original.location_name || "-"}
        </span>
      ),
    },
    {
      accessorKey: "asset_serialnumber",
      header: "Serial Number",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-slate-600">
          {row.original.asset_serialnumber || "-"}
        </span>
      ),
    },
    {
      accessorKey: "asset_criticality",
      header: "Criticality",
      cell: ({ row }) => (
        <CriticalityBadge criticality={row.original.asset_criticality} />
      ),
    },
    {
      accessorKey: "asset_status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.asset_status} />,
    },
    {
      accessorKey: "asset_year",
      header: "Tahun",
      cell: ({ row }) => (
        <span className="text-slate-600">{row.original.asset_year || "-"}</span>
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
        title="Manajemen Aset"
        description="Kelola data aset dan peralatan"
      />

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={data}
            searchKey="asset_name"
            searchPlaceholder="Cari aset..."
            onAdd={handleAdd}
            addButtonText="Tambah Aset"
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Form Modal */}
      <FormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={isEditing ? "Edit Aset" : "Tambah Aset"}
        description={
          isEditing ? "Perbarui informasi aset" : "Masukkan informasi aset baru"
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
            <div className="md:col-span-2">
              <Label>Nama Aset *</Label>
              <Input
                value={formData.asset_name}
                onChange={(e) =>
                  setFormData({ ...formData, asset_name: e.target.value })
                }
                placeholder="Masukkan nama aset"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label>Deskripsi</Label>
              <Textarea
                value={formData.asset_desc}
                onChange={(e) =>
                  setFormData({ ...formData, asset_desc: e.target.value })
                }
                placeholder="Masukkan deskripsi aset"
                rows={3}
              />
            </div>
            <div>
              <Label>Lokasi *</Label>
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
                  {locations.map((loc) => (
                    <SelectItem key={loc.id_location} value={loc.id_location}>
                      {loc.location_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipe Aset *</Label>
              <Select
                value={formData.id_asset_type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    id_asset_type: value === "__none__" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe aset" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map((type) => (
                    <SelectItem
                      key={type.id_asset_type}
                      value={type.id_asset_type}
                    >
                      {type.type_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Serial Number</Label>
              <Input
                value={formData.asset_serialnumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    asset_serialnumber: e.target.value,
                  })
                }
                placeholder="Masukkan serial number"
              />
            </div>
            <div>
              <Label>Tahun</Label>
              <Input
                type="number"
                min={1900}
                max={2100}
                value={formData.asset_year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    asset_year: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label>Criticality *</Label>
              <Select
                value={formData.asset_criticality}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    asset_criticality: value === "__none__" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status *</Label>
              <Select
                value={formData.asset_status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    asset_status: value === "__none__" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="breakdown">Breakdown</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Vendor</Label>
              <Select
                value={formData.id_vendor}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    id_vendor: value === "__none__" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih vendor" />
                </SelectTrigger>
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
              <Label>Parent Aset</Label>
              <Select
                value={formData.id_parent_asset}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    id_parent_asset: value,
                    level_asset: value ? 2 : 1,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih parent aset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada (Level 1)</SelectItem>
                  {parentAssets.map((asset) => (
                    <SelectItem key={asset.id_asset} value={asset.id_asset}>
                      {asset.asset_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>QR Code</Label>
              <Input
                value={formData.asset_qr_code}
                onChange={(e) =>
                  setFormData({ ...formData, asset_qr_code: e.target.value })
                }
                placeholder="Masukkan kode QR"
              />
            </div>
          </div>
        </form>
      </FormModal>

      {/* Delete Modal */}
      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Aset"
        description={`Apakah Anda yakin ingin menghapus aset "${selectedItem?.asset_name}"?`}
        isLoading={isSubmitting}
      />

      {/* Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Aset"
        size="lg"
      >
        {selectedItem && (
          <div>
            <DetailRow label="Nama Aset" value={selectedItem.asset_name} />
            <DetailRow label="Deskripsi" value={selectedItem.asset_desc} />
            <DetailRow
              label="Tipe Aset"
              value={selectedItem.asset_type_name || "-"}
            />
            <DetailRow
              label="Lokasi"
              value={selectedItem.location_name || "-"}
            />
            <DetailRow
              label="Serial Number"
              value={selectedItem.asset_serialnumber || "-"}
            />
            <DetailRow label="Tahun" value={selectedItem.asset_year || "-"} />
            <DetailRow
              label="Criticality"
              value={
                <CriticalityBadge
                  criticality={selectedItem.asset_criticality}
                />
              }
            />
            <DetailRow
              label="Status"
              value={<StatusBadge status={selectedItem.asset_status} />}
            />
            <DetailRow label="Vendor" value={selectedItem.vendor_name || "-"} />
            <DetailRow
              label="Parent Aset"
              value={selectedItem.parent_asset_name || "-"}
            />
            <DetailRow
              label="Level"
              value={`Level ${selectedItem.level_asset}`}
            />
            <DetailRow
              label="QR Code"
              value={selectedItem.asset_qr_code || "-"}
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
