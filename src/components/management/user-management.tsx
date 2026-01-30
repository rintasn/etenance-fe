"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  UserCircle,
  Mail,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface User {
  id_user: string;
  username: string;
  email: string;
  user_role: string;
  id_company: string | null;
  company_name?: string;
  created_at: string;
}

interface Company {
  id_company: string;
  company_name: string;
}

const initialFormData = {
  username: "",
  email: "",
  password: "",
  user_role: "viewer",
  id_company: "",
};

const roleColors: Record<string, string> = {
  superadmin: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  manager: "bg-emerald-100 text-emerald-700",
  technician: "bg-amber-100 text-amber-700",
  viewer: "bg-slate-100 text-slate-700",
};

export default function UserManagement() {
  const [data, setData] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<User | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
    fetchCompanies();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users", {
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

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setCompanies(result.data);
    } catch (error) {
      console.error("Failed to fetch companies");
    }
  };

  const handleAdd = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = (item: User) => {
    setFormData({
      username: item.username,
      email: item.email,
      password: "",
      user_role: item.user_role,
      id_company: item.id_company || "",
    });
    setSelectedItem(item);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleDelete = (item: User) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleView = (item: User) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = isEditing
        ? `/api/users/${selectedItem?.id_user}`
        : "/api/users";
      const method = isEditing ? "PUT" : "POST";

      const payload = { ...formData };
      if (isEditing && !payload.password) {
        delete (payload as any).password;
      }
      if (!payload.id_company) {
        payload.id_company = "";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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
      const response = await fetch(`/api/users/${selectedItem.id_user}`, {
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

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "username",
      header: "User",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white font-semibold">
              {row.original.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-slate-800">
              {row.original.username}
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {row.original.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "user_role",
      header: "Role",
      cell: ({ row }) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleColors[row.original.user_role] || roleColors.viewer}`}
        >
          {row.original.user_role}
        </span>
      ),
    },
    {
      accessorKey: "company_name",
      header: "Perusahaan",
      cell: ({ row }) => (
        <span className="text-slate-600">
          {row.original.company_name || "-"}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Terdaftar",
      cell: ({ row }) => (
        <span className="text-slate-600">
          {new Date(row.original.created_at).toLocaleDateString("id-ID")}
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
        title="Manajemen User"
        description="Kelola user dan hak akses sistem"
      />

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={data}
            searchKey="username"
            searchPlaceholder="Cari user..."
            onAdd={handleAdd}
            addButtonText="Tambah User"
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Form Modal */}
      <FormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={isEditing ? "Edit User" : "Tambah User"}
        description={
          isEditing ? "Perbarui informasi user" : "Masukkan informasi user baru"
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
            <div>
              <Label>Username *</Label>
              <Input
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Masukkan username"
                required
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Masukkan email"
                required
              />
            </div>
            <div>
              <Label>
                {isEditing
                  ? "Password (kosongkan jika tidak diubah)"
                  : "Password *"}
              </Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Masukkan password"
                required={!isEditing}
              />
            </div>
            <div>
              <Label>Role *</Label>
              <Select
                value={formData.user_role}
                onValueChange={(value) =>
                  setFormData({ ...formData, user_role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Perusahaan</Label>
              <Select
                value={formData.id_company}
                onValueChange={(value) =>
                  setFormData({ ...formData, id_company: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih perusahaan (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada</SelectItem>
                  {companies.map((company) => (
                    <SelectItem
                      key={company.id_company}
                      value={company.id_company}
                    >
                      {company.company_name}
                    </SelectItem>
                  ))}
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
        title="Hapus User"
        description={`Apakah Anda yakin ingin menghapus user "${selectedItem?.username}"?`}
        isLoading={isSubmitting}
      />

      {/* Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail User"
      >
        {selectedItem && (
          <div>
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white text-xl font-semibold">
                  {selectedItem.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {selectedItem.username}
                </h3>
                <p className="text-slate-500">{selectedItem.email}</p>
              </div>
            </div>
            <DetailRow
              label="Role"
              value={
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleColors[selectedItem.user_role]}`}
                >
                  {selectedItem.user_role}
                </span>
              }
            />
            <DetailRow
              label="Perusahaan"
              value={selectedItem.company_name || "-"}
            />
            <DetailRow
              label="Terdaftar"
              value={new Date(selectedItem.created_at).toLocaleString("id-ID")}
            />
          </div>
        )}
      </DetailModal>
    </div>
  );
}
