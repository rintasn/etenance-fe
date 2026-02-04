"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  UsersRound,
  UserPlus,
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const BASE_URL = "http://localhost:8080/api/v1";

interface Team {
  id_team: string;
  id_organization: string;
  organization_name?: string;
  team_name: string;
  team_status: string;
  member_count?: number;
  created_at: string;
}

interface Organization {
  id_organization: string;
  org_name: string;
}

const initialFormData = {
  team_name: "",
  id_organization: "",
  team_status: "active",
};

export default function TeamManagement() {
  const [data, setData] = useState<Team[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Team | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
    fetchOrganizations();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/teams`, {
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

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/organizations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setOrganizations(result.data);
    } catch (error) {
      console.error("Failed to fetch organizations");
    }
  };

  const handleAdd = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = (item: Team) => {
    setFormData({
      team_name: item.team_name,
      id_organization: item.id_organization || "",
      team_status: item.team_status,
    });
    setSelectedItem(item);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleDelete = (item: Team) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleView = (item: Team) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = isEditing
        ? `${BASE_URL}/teams/${selectedItem?.id_team}`
        : `${BASE_URL}/teams`;
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
        `${BASE_URL}/teams/${selectedItem.id_team}`,
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

  const columns: ColumnDef<Team>[] = [
    {
      accessorKey: "team_name",
      header: "Tim",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <UsersRound className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-800">
              {row.original.team_name}
            </p>
            <p className="text-xs text-slate-500">
              {row.original.organization_name}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "organization_name",
      header: "Organisasi",
      cell: ({ row }) => (
        <span className="text-slate-600">
          {row.original.organization_name || "-"}
        </span>
      ),
    },
    {
      accessorKey: "member_count",
      header: "Anggota",
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-medium">
          {row.original.member_count || 0} anggota
        </Badge>
      ),
    },
    {
      accessorKey: "team_status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.team_status} />,
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
            <DropdownMenuItem>
              <UserPlus className="w-4 h-4 mr-2" /> Tambah Anggota
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
        title="Manajemen Tim"
        description="Kelola tim dan anggota tim"
      />

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={data}
            searchKey="team_name"
            searchPlaceholder="Cari tim..."
            onAdd={handleAdd}
            addButtonText="Tambah Tim"
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Form Modal */}
      <FormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={isEditing ? "Edit Tim" : "Tambah Tim"}
        description={
          isEditing ? "Perbarui informasi tim" : "Masukkan informasi tim baru"
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
            <Label>Nama Tim *</Label>
            <Input
              value={formData.team_name}
              onChange={(e) =>
                setFormData({ ...formData, team_name: e.target.value })
              }
              placeholder="Masukkan nama tim"
              required
            />
          </div>
          <div>
            <Label>Organisasi *</Label>
            <Select
              value={formData.id_organization}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  id_organization: value === "__none__" ? "" : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih organisasi" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
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
            <Label>Status *</Label>
            <Select
              value={formData.team_status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  team_status: value === "__none__" ? "" : value,
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

      {/* Delete Modal */}
      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Tim"
        description={`Apakah Anda yakin ingin menghapus tim "${selectedItem?.team_name}"?`}
        isLoading={isSubmitting}
      />

      {/* Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Tim"
      >
        {selectedItem && (
          <div>
            <DetailRow label="Nama Tim" value={selectedItem.team_name} />
            <DetailRow
              label="Organisasi"
              value={selectedItem.organization_name || "-"}
            />
            <DetailRow
              label="Jumlah Anggota"
              value={`${selectedItem.member_count || 0} anggota`}
            />
            <DetailRow
              label="Status"
              value={<StatusBadge status={selectedItem.team_status} />}
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
