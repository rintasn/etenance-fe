"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  MapPin,
  QrCode,
  Building,
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const BASE_URL = "http://localhost:8080/api/v1";

interface Location {
  id_location: string;
  location_name: string;
  location_address: string;
  location_desc: string;
  id_team: string;
  team_name?: string;
  qr_code: string;
  id_parent_location: string | null;
  parent_location_name?: string;
  level_location: number;
  id_vendor: string | null;
  vendor_name?: string;
  created_at: string;
}

interface Team {
  id_team: string;
  team_name: string;
}

interface Vendor {
  id_vendor: string;
  vendor_name: string;
}

const initialFormData = {
  location_name: "",
  location_address: "",
  location_desc: "",
  id_team: "",
  qr_code: "",
  id_parent_location: "",
  level_location: 1,
  id_vendor: "",
};

export default function LocationManagement() {
  const [data, setData] = useState<Location[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [parentLocations, setParentLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Location | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
    fetchTeams();
    fetchVendors();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) {
        setData(result.data);
        setParentLocations(
          result.data.filter((l: Location) => l.level_location === 1),
        );
      }
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
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

  const handleEdit = (item: Location) => {
    setFormData({
      location_name: item.location_name,
      location_address: item.location_address || "",
      location_desc: item.location_desc || "",
      id_team: item.id_team || "",
      qr_code: item.qr_code || "",
      id_parent_location: item.id_parent_location || "",
      level_location: item.level_location,
      id_vendor: item.id_vendor || "",
    });
    setSelectedItem(item);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleDelete = (item: Location) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleView = (item: Location) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = isEditing
        ? `${BASE_URL}/locations/${selectedItem?.id_location}`
        : `${BASE_URL}/locations`;
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
        `${BASE_URL}/locations/${selectedItem.id_location}`,
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

  const columns: ColumnDef<Location>[] = [
    {
      accessorKey: "location_name",
      header: "Lokasi",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-800">
              {row.original.location_name}
            </p>
            {row.original.parent_location_name && (
              <p className="text-xs text-slate-500">
                📍 {row.original.parent_location_name}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "level_location",
      header: "Level",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-medium">
          Level {row.original.level_location}
        </Badge>
      ),
    },
    {
      accessorKey: "team_name",
      header: "Tim",
      cell: ({ row }) => (
        <span className="text-slate-600">{row.original.team_name || "-"}</span>
      ),
    },
    {
      accessorKey: "qr_code",
      header: "QR Code",
      cell: ({ row }) =>
        row.original.qr_code ? (
          <div className="flex items-center gap-1 text-slate-600">
            <QrCode className="w-4 h-4" />
            <span className="text-xs font-mono">{row.original.qr_code}</span>
          </div>
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "vendor_name",
      header: "Vendor",
      cell: ({ row }) => (
        <span className="text-slate-600">
          {row.original.vendor_name || "-"}
        </span>
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
        title="Manajemen Lokasi"
        description="Kelola lokasi dan area dalam sistem"
      />

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={data}
            searchKey="location_name"
            searchPlaceholder="Cari lokasi..."
            onAdd={handleAdd}
            addButtonText="Tambah Lokasi"
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Form Modal */}
      <FormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={isEditing ? "Edit Lokasi" : "Tambah Lokasi"}
        description={
          isEditing
            ? "Perbarui informasi lokasi"
            : "Masukkan informasi lokasi baru"
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
              <Label>Nama Lokasi *</Label>
              <Input
                value={formData.location_name}
                onChange={(e) =>
                  setFormData({ ...formData, location_name: e.target.value })
                }
                placeholder="Masukkan nama lokasi"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label>Alamat</Label>
              <Input
                value={formData.location_address}
                onChange={(e) =>
                  setFormData({ ...formData, location_address: e.target.value })
                }
                placeholder="Masukkan alamat lokasi"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Deskripsi</Label>
              <Textarea
                value={formData.location_desc}
                onChange={(e) =>
                  setFormData({ ...formData, location_desc: e.target.value })
                }
                placeholder="Masukkan deskripsi lokasi"
                rows={3}
              />
            </div>
            <div>
              <Label>Parent Lokasi</Label>
              <Select
                value={formData.id_parent_location}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    id_parent_location: value,
                    level_location: value ? 2 : 1,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih parent lokasi (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada (Level 1)</SelectItem>
                  {parentLocations.map((loc) => (
                    <SelectItem key={loc.id_location} value={loc.id_location}>
                      {loc.location_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Level Lokasi</Label>
              <Input
                type="number"
                min={1}
                value={formData.level_location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    level_location: parseInt(e.target.value),
                  })
                }
              />
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
                  <SelectValue placeholder="Pilih vendor (opsional)" />
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
              <Label>QR Code</Label>
              <Input
                value={formData.qr_code}
                onChange={(e) =>
                  setFormData({ ...formData, qr_code: e.target.value })
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
        title="Hapus Lokasi"
        description={`Apakah Anda yakin ingin menghapus lokasi "${selectedItem?.location_name}"?`}
        isLoading={isSubmitting}
      />

      {/* Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Lokasi"
      >
        {selectedItem && (
          <div>
            <DetailRow label="Nama Lokasi" value={selectedItem.location_name} />
            <DetailRow label="Alamat" value={selectedItem.location_address} />
            <DetailRow label="Deskripsi" value={selectedItem.location_desc} />
            <DetailRow
              label="Parent Lokasi"
              value={selectedItem.parent_location_name || "-"}
            />
            <DetailRow
              label="Level"
              value={`Level ${selectedItem.level_location}`}
            />
            <DetailRow label="Tim" value={selectedItem.team_name || "-"} />
            <DetailRow label="Vendor" value={selectedItem.vendor_name || "-"} />
            <DetailRow label="QR Code" value={selectedItem.qr_code || "-"} />
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
