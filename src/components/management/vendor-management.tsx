"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Truck,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";

const BASE_URL = "http://localhost:8080/api/v1";

interface Vendor {
  id_vendor: string;
  vendor_name: string;
  vendor_address: string;
  vendor_color: string;
  vendor_contracts: string;
  created_at: string;
}

const initialFormData = {
  vendor_name: "",
  vendor_address: "",
  vendor_color: "#0066CC",
  vendor_contracts: "",
};

const colorOptions = [
  { value: "#0066CC", label: "Blue" },
  { value: "#3DCD58", label: "Green" },
  { value: "#FF6600", label: "Orange" },
  { value: "#FF0000", label: "Red" },
  { value: "#9333EA", label: "Purple" },
  { value: "#F59E0B", label: "Yellow" },
  { value: "#6366F1", label: "Indigo" },
  { value: "#EC4899", label: "Pink" },
];

export default function VendorManagement() {
  const [data, setData] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/vendors`, {
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
    setFormData(initialFormData);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = (item: Vendor) => {
    setFormData({
      vendor_name: item.vendor_name,
      vendor_address: item.vendor_address || "",
      vendor_color: item.vendor_color || "#0066CC",
      vendor_contracts: item.vendor_contracts || "",
    });
    setSelectedItem(item);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleDelete = (item: Vendor) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleView = (item: Vendor) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = isEditing
        ? `${BASE_URL}/vendors/${selectedItem?.id_vendor}`
        : `${BASE_URL}/vendors`;
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
        `${BASE_URL}/vendors/${selectedItem.id_vendor}`,
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

  const columns: ColumnDef<Vendor>[] = [
    {
      accessorKey: "vendor_name",
      header: "Vendor",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: row.original.vendor_color || "#0066CC" }}
          >
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-800">
              {row.original.vendor_name}
            </p>
            <p className="text-xs text-slate-500 line-clamp-1">
              {row.original.vendor_contracts}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "vendor_address",
      header: "Alamat",
      cell: ({ row }) => (
        <span className="text-slate-600 line-clamp-2">
          {row.original.vendor_address || "-"}
        </span>
      ),
    },
    {
      accessorKey: "vendor_contracts",
      header: "Kontrak",
      cell: ({ row }) => (
        <span className="text-slate-600">
          {row.original.vendor_contracts || "-"}
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
        title="Manajemen Vendor"
        description="Kelola data vendor dan supplier"
      />

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={data}
            searchKey="vendor_name"
            searchPlaceholder="Cari vendor..."
            onAdd={handleAdd}
            addButtonText="Tambah Vendor"
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Form Modal */}
      <FormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={isEditing ? "Edit Vendor" : "Tambah Vendor"}
        description={
          isEditing
            ? "Perbarui informasi vendor"
            : "Masukkan informasi vendor baru"
        }
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
            <Label>Nama Vendor *</Label>
            <Input
              value={formData.vendor_name}
              onChange={(e) =>
                setFormData({ ...formData, vendor_name: e.target.value })
              }
              placeholder="Masukkan nama vendor"
              required
            />
          </div>
          <div>
            <Label>Alamat</Label>
            <Textarea
              value={formData.vendor_address}
              onChange={(e) =>
                setFormData({ ...formData, vendor_address: e.target.value })
              }
              placeholder="Masukkan alamat vendor"
              rows={3}
            />
          </div>
          <div>
            <Label>Deskripsi Kontrak</Label>
            <Input
              value={formData.vendor_contracts}
              onChange={(e) =>
                setFormData({ ...formData, vendor_contracts: e.target.value })
              }
              placeholder="Contoh: HVAC Equipment & Services"
            />
          </div>
          <div>
            <Label>Warna</Label>
            <div className="flex gap-2 mt-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, vendor_color: color.value })
                  }
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    formData.vendor_color === color.value
                      ? "border-slate-800 scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        </form>
      </FormModal>

      {/* Delete Modal */}
      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Vendor"
        description={`Apakah Anda yakin ingin menghapus vendor "${selectedItem?.vendor_name}"?`}
        isLoading={isSubmitting}
      />

      {/* Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Vendor"
      >
        {selectedItem && (
          <div>
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: selectedItem.vendor_color || "#0066CC",
                }}
              >
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {selectedItem.vendor_name}
                </h3>
                <p className="text-slate-500">
                  {selectedItem.vendor_contracts}
                </p>
              </div>
            </div>
            <DetailRow
              label="Alamat"
              value={selectedItem.vendor_address || "-"}
            />
            <DetailRow
              label="Deskripsi Kontrak"
              value={selectedItem.vendor_contracts || "-"}
            />
            <DetailRow
              label="Warna"
              value={
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: selectedItem.vendor_color }}
                  />
                  <span>{selectedItem.vendor_color}</span>
                </div>
              }
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
