"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Eye, User, Phone, MapPin, BadgeCheck } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { FormModal, DeleteModal, DetailModal, DetailRow } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Employee {
  id_employee: string;
  id_user: string | null;
  username?: string;
  emp_name: string;
  emp_address: string;
  emp_level: string;
  emp_pict: string | null;
  emp_npk: string;
  emp_available: boolean;
  emp_status: string;
  created_at: string;
}

interface User {
  id_user: string;
  username: string;
}

const initialFormData = {
  emp_name: "",
  emp_address: "",
  emp_level: "junior",
  emp_npk: "",
  emp_available: true,
  emp_status: "active",
  id_user: "",
};

const levelColors: Record<string, string> = {
  junior: "bg-slate-100 text-slate-700",
  mid: "bg-blue-100 text-blue-700",
  senior: "bg-emerald-100 text-emerald-700",
  lead: "bg-purple-100 text-purple-700",
  manager: "bg-amber-100 text-amber-700",
};

export default function EmployeeManagement() {
  const [data, setData] = useState<Employee[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Employee | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/employees", {
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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setUsers(result.data);
    } catch (error) {
      console.error("Failed to fetch users");
    }
  };

  const handleAdd = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = (item: Employee) => {
    setFormData({
      emp_name: item.emp_name,
      emp_address: item.emp_address || "",
      emp_level: item.emp_level,
      emp_npk: item.emp_npk || "",
      emp_available: item.emp_available,
      emp_status: item.emp_status,
      id_user: item.id_user || "",
    });
    setSelectedItem(item);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleDelete = (item: Employee) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleView = (item: Employee) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = isEditing ? `/api/employees/${selectedItem?.id_employee}` : "/api/employees";
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
      const response = await fetch(`/api/employees/${selectedItem.id_employee}`, {
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

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "emp_name",
      header: "Karyawan",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold">
              {row.original.emp_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-slate-800">{row.original.emp_name}</p>
            <p className="text-xs text-slate-500">{row.original.emp_npk}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "emp_level",
      header: "Level",
      cell: ({ row }) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${levelColors[row.original.emp_level] || levelColors.junior}`}>
          {row.original.emp_level}
        </span>
      ),
    },
    {
      accessorKey: "emp_available",
      header: "Ketersediaan",
      cell: ({ row }) => (
        row.original.emp_available ? (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            <BadgeCheck className="w-3 h-3 mr-1" />
            Tersedia
          </Badge>
        ) : (
          <Badge variant="secondary">Tidak Tersedia</Badge>
        )
      ),
    },
    {
      accessorKey: "emp_status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.emp_status} />,
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
        title="Manajemen Karyawan"
        description="Kelola data karyawan dan teknisi"
      />

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={data}
            searchKey="emp_name"
            searchPlaceholder="Cari karyawan..."
            onAdd={handleAdd}
            addButtonText="Tambah Karyawan"
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Form Modal */}
      <FormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={isEditing ? "Edit Karyawan" : "Tambah Karyawan"}
        description={isEditing ? "Perbarui informasi karyawan" : "Masukkan informasi karyawan baru"}
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
              <Label>Nama Karyawan *</Label>
              <Input
                value={formData.emp_name}
                onChange={(e) => setFormData({ ...formData, emp_name: e.target.value })}
                placeholder="Masukkan nama karyawan"
                required
              />
            </div>
            <div>
              <Label>NPK</Label>
              <Input
                value={formData.emp_npk}
                onChange={(e) => setFormData({ ...formData, emp_npk: e.target.value })}
                placeholder="Nomor Pokok Karyawan"
              />
            </div>
            <div>
              <Label>Level *</Label>
              <Select
                value={formData.emp_level}
                onValueChange={(value) => setFormData({ ...formData, emp_level: value })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Alamat</Label>
              <Textarea
                value={formData.emp_address}
                onChange={(e) => setFormData({ ...formData, emp_address: e.target.value })}
                placeholder="Masukkan alamat karyawan"
                rows={3}
              />
            </div>
            <div>
              <Label>Link ke User</Label>
              <Select
                value={formData.id_user}
                onValueChange={(value) => setFormData({ ...formData, id_user: value })}
              >
                <SelectTrigger><SelectValue placeholder="Pilih user (opsional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id_user} value={user.id_user}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status *</Label>
              <Select
                value={formData.emp_status}
                onValueChange={(value) => setFormData({ ...formData, emp_status: value })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <Label>Ketersediaan</Label>
                  <p className="text-sm text-slate-500">Karyawan tersedia untuk ditugaskan</p>
                </div>
                <Switch
                  checked={formData.emp_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, emp_available: checked })}
                />
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
        title="Hapus Karyawan"
        description={`Apakah Anda yakin ingin menghapus karyawan "${selectedItem?.emp_name}"?`}
        isLoading={isSubmitting}
      />

      {/* Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Karyawan"
      >
        {selectedItem && (
          <div>
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-xl font-semibold">
                  {selectedItem.emp_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{selectedItem.emp_name}</h3>
                <p className="text-slate-500">{selectedItem.emp_npk}</p>
              </div>
            </div>
            <DetailRow label="Level" value={
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${levelColors[selectedItem.emp_level]}`}>
                {selectedItem.emp_level}
              </span>
            } />
            <DetailRow label="Alamat" value={selectedItem.emp_address || "-"} />
            <DetailRow label="User Account" value={selectedItem.username || "-"} />
            <DetailRow label="Ketersediaan" value={
              selectedItem.emp_available ? (
                <Badge className="bg-emerald-100 text-emerald-700">Tersedia</Badge>
              ) : (
                <Badge variant="secondary">Tidak Tersedia</Badge>
              )
            } />
            <DetailRow label="Status" value={<StatusBadge status={selectedItem.emp_status} />} />
            <DetailRow label="Dibuat" value={new Date(selectedItem.created_at).toLocaleString("id-ID")} />
          </div>
        )}
      </DetailModal>
    </div>
  );
}
