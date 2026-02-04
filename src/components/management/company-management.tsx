"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Eye, Building2 } from "lucide-react";
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
import { toast } from "sonner";

const BASE_URL = "http://localhost:8080/api/v1";

interface Company {
  id_company: string;
  company_name: string;
  company_address: string;
  company_category: string;
  qty_subscriptions: number;
  expired_date: string;
  company_status: string;
  subscription_type: string;
  created_at: string;
}

const initialFormData = {
  company_name: "",
  company_address: "",
  company_category: "",
  qty_subscriptions: 1,
  expired_date: "",
  company_status: "active",
  subscription_type: "basic",
};

export default function CompanyManagement() {
  const [data, setData] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Company | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/companies`, {
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

  const handleEdit = (item: Company) => {
    setFormData({
      company_name: item.company_name,
      company_address: item.company_address || "",
      company_category: item.company_category || "",
      qty_subscriptions: item.qty_subscriptions,
      expired_date: item.expired_date?.split("T")[0] || "",
      company_status: item.company_status,
      subscription_type: item.subscription_type,
    });
    setSelectedItem(item);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleDelete = (item: Company) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleView = (item: Company) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = isEditing
        ? `${BASE_URL}/companies/${selectedItem?.id_company}`
        : `${BASE_URL}/companies`;
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
        `${BASE_URL}/companies/${selectedItem.id_company}`,
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

  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: "company_name",
      header: "Nama Perusahaan",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-800">
              {row.original.company_name}
            </p>
            <p className="text-xs text-slate-500">
              {row.original.company_category}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "subscription_type",
      header: "Subscription",
      cell: ({ row }) => (
        <span className="capitalize font-medium text-slate-700">
          {row.original.subscription_type}
        </span>
      ),
    },
    {
      accessorKey: "qty_subscriptions",
      header: "Qty",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.qty_subscriptions}</span>
      ),
    },
    {
      accessorKey: "expired_date",
      header: "Expired",
      cell: ({ row }) => (
        <span className="text-slate-600">
          {row.original.expired_date
            ? new Date(row.original.expired_date).toLocaleDateString("id-ID")
            : "-"}
        </span>
      ),
    },
    {
      accessorKey: "company_status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.company_status} />,
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
        title="Manajemen Perusahaan"
        description="Kelola data perusahaan yang terdaftar dalam sistem"
      />

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={data}
            searchKey="company_name"
            searchPlaceholder="Cari perusahaan..."
            onAdd={handleAdd}
            addButtonText="Tambah Perusahaan"
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Form Modal */}
      <FormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={isEditing ? "Edit Perusahaan" : "Tambah Perusahaan"}
        description={
          isEditing
            ? "Perbarui informasi perusahaan"
            : "Masukkan informasi perusahaan baru"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Nama Perusahaan *</Label>
              <Input
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
                placeholder="Masukkan nama perusahaan"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label>Alamat</Label>
              <Textarea
                value={formData.company_address}
                onChange={(e) =>
                  setFormData({ ...formData, company_address: e.target.value })
                }
                placeholder="Masukkan alamat perusahaan"
                rows={3}
              />
            </div>
            <div>
              <Label>Kategori</Label>
              <Select
                value={formData.company_category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    company_category: value === "__none__" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Hospitality">Hospitality</SelectItem>
                  <SelectItem value="Property">Property</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipe Subscription *</Label>
              <Select
                value={formData.subscription_type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    subscription_type: value === "__none__" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Jumlah Subscription</Label>
              <Input
                type="number"
                min={1}
                value={formData.qty_subscriptions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    qty_subscriptions: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label>Tanggal Expired</Label>
              <Input
                type="date"
                value={formData.expired_date}
                onChange={(e) =>
                  setFormData({ ...formData, expired_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Status *</Label>
              <Select
                value={formData.company_status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    company_status: value === "__none__" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
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
        title="Hapus Perusahaan"
        description={`Apakah Anda yakin ingin menghapus "${selectedItem?.company_name}"? Semua data terkait juga akan terhapus.`}
        isLoading={isSubmitting}
      />

      {/* Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Perusahaan"
      >
        {selectedItem && (
          <div>
            <DetailRow
              label="Nama Perusahaan"
              value={selectedItem.company_name}
            />
            <DetailRow label="Alamat" value={selectedItem.company_address} />
            <DetailRow label="Kategori" value={selectedItem.company_category} />
            <DetailRow
              label="Tipe Subscription"
              value={
                <span className="capitalize">
                  {selectedItem.subscription_type}
                </span>
              }
            />
            <DetailRow
              label="Jumlah Subscription"
              value={selectedItem.qty_subscriptions}
            />
            <DetailRow
              label="Tanggal Expired"
              value={
                selectedItem.expired_date
                  ? new Date(selectedItem.expired_date).toLocaleDateString(
                      "id-ID",
                    )
                  : "-"
              }
            />
            <DetailRow
              label="Status"
              value={<StatusBadge status={selectedItem.company_status} />}
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
