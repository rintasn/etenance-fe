"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  FileText,
  Plus,
  GripVertical,
  Clock,
  ListChecks,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  Circle,
  AlertCircle,
  Package,
  X,
  MoveUp,
  MoveDown,
  Clipboard,
  BookOpen,
  Timer,
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
  DropdownMenuSeparator,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ==================== INTERFACES ====================

const BASE_URL = "http://localhost:8080/api/v1";

interface ProcedureStep {
  id: string;
  order: number;
  title: string;
  description: string;
  estimated_time: number; // dalam menit
  is_required: boolean;
  has_checklist: boolean;
  checklist_items: string[];
  warning_note: string;
  tools_required: string[];
  attachments: string[];
}

interface Procedure {
  id_procedure: string;
  procedure_name: string;
  procedure_desc: string;
  procedure_steps: ProcedureStep[];
  estimated_time: number;
  id_asset_type: string | null;
  asset_type_name?: string;
  total_steps: number;
  is_active: boolean;
  version: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

interface AssetType {
  id_asset_type: string;
  type_name: string;
}

// ==================== CONSTANTS ====================

const initialStepData: ProcedureStep = {
  id: "",
  order: 1,
  title: "",
  description: "",
  estimated_time: 5,
  is_required: true,
  has_checklist: false,
  checklist_items: [],
  warning_note: "",
  tools_required: [],
  attachments: [],
};

const initialFormData = {
  procedure_name: "",
  procedure_desc: "",
  procedure_steps: [] as ProcedureStep[],
  estimated_time: 0,
  id_asset_type: "",
  is_active: true,
  version: "1.0",
};

// ==================== STEP BUILDER COMPONENT ====================

interface StepBuilderProps {
  steps: ProcedureStep[];
  onChange: (steps: ProcedureStep[]) => void;
}

function StepBuilder({ steps, onChange }: StepBuilderProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [newChecklistItem, setNewChecklistItem] = useState<
    Record<string, string>
  >({});
  const [newTool, setNewTool] = useState<Record<string, string>>({});

  const generateId = () =>
    `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addStep = () => {
    const newStep: ProcedureStep = {
      ...initialStepData,
      id: generateId(),
      order: steps.length + 1,
    };
    onChange([...steps, newStep]);
    setExpandedStep(newStep.id);
  };

  const updateStep = (stepId: string, updates: Partial<ProcedureStep>) => {
    onChange(
      steps.map((step) =>
        step.id === stepId ? { ...step, ...updates } : step,
      ),
    );
  };

  const removeStep = (stepId: string) => {
    const newSteps = steps
      .filter((step) => step.id !== stepId)
      .map((step, index) => ({ ...step, order: index + 1 }));
    onChange(newSteps);
  };

  const moveStep = (stepId: string, direction: "up" | "down") => {
    const index = steps.findIndex((s) => s.id === stepId);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [
      newSteps[targetIndex],
      newSteps[index],
    ];

    onChange(newSteps.map((step, idx) => ({ ...step, order: idx + 1 })));
  };

  const duplicateStep = (step: ProcedureStep) => {
    const newStep: ProcedureStep = {
      ...step,
      id: generateId(),
      order: steps.length + 1,
      title: `${step.title} (Copy)`,
    };
    onChange([...steps, newStep]);
  };

  const addChecklistItem = (stepId: string) => {
    const item = newChecklistItem[stepId]?.trim();
    if (!item) return;

    const step = steps.find((s) => s.id === stepId);
    if (step) {
      updateStep(stepId, {
        checklist_items: [...step.checklist_items, item],
      });
      setNewChecklistItem({ ...newChecklistItem, [stepId]: "" });
    }
  };

  const removeChecklistItem = (stepId: string, index: number) => {
    const step = steps.find((s) => s.id === stepId);
    if (step) {
      const items = [...step.checklist_items];
      items.splice(index, 1);
      updateStep(stepId, { checklist_items: items });
    }
  };

  const addTool = (stepId: string) => {
    const tool = newTool[stepId]?.trim();
    if (!tool) return;

    const step = steps.find((s) => s.id === stepId);
    if (step) {
      updateStep(stepId, {
        tools_required: [...step.tools_required, tool],
      });
      setNewTool({ ...newTool, [stepId]: "" });
    }
  };

  const removeTool = (stepId: string, index: number) => {
    const step = steps.find((s) => s.id === stepId);
    if (step) {
      const tools = [...step.tools_required];
      tools.splice(index, 1);
      updateStep(stepId, { tools_required: tools });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">
          Langkah-langkah Prosedur
        </Label>
        <Button type="button" variant="outline" size="sm" onClick={addStep}>
          <Plus className="w-4 h-4 mr-1" />
          Tambah Langkah
        </Button>
      </div>

      {steps.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
          <ListChecks className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-slate-500">Belum ada langkah</p>
          <Button type="button" variant="link" size="sm" onClick={addStep}>
            Tambah langkah pertama
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "border rounded-lg overflow-hidden transition-all",
                expandedStep === step.id
                  ? "border-emerald-300 shadow-sm"
                  : "border-slate-200",
              )}
            >
              {/* Step Header */}
              <div
                className={cn(
                  "flex items-center gap-3 p-3 cursor-pointer",
                  expandedStep === step.id
                    ? "bg-emerald-50"
                    : "bg-slate-50 hover:bg-slate-100",
                )}
                onClick={() =>
                  setExpandedStep(expandedStep === step.id ? null : step.id)
                }
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-slate-400" />
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">
                    {step.order}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">
                    {step.title || "Langkah tanpa judul"}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {step.estimated_time} menit
                    </span>
                    {step.is_required && (
                      <Badge variant="outline" className="text-xs py-0">
                        Wajib
                      </Badge>
                    )}
                    {step.has_checklist && step.checklist_items.length > 0 && (
                      <Badge variant="outline" className="text-xs py-0">
                        {step.checklist_items.length} checklist
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveStep(step.id, "up");
                          }}
                          disabled={index === 0}
                        >
                          <MoveUp className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Pindah ke atas</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveStep(step.id, "down");
                          }}
                          disabled={index === steps.length - 1}
                        >
                          <MoveDown className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Pindah ke bawah</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateStep(step);
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Duplikat</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStep(step.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Hapus</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {expandedStep === step.id ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Step Content */}
              {expandedStep === step.id && (
                <div className="p-4 space-y-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label>Judul Langkah *</Label>
                      <Input
                        value={step.title}
                        onChange={(e) =>
                          updateStep(step.id, { title: e.target.value })
                        }
                        placeholder="Contoh: Matikan sumber listrik"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Deskripsi</Label>
                      <Textarea
                        value={step.description}
                        onChange={(e) =>
                          updateStep(step.id, { description: e.target.value })
                        }
                        placeholder="Jelaskan detail langkah ini..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Estimasi Waktu (menit)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={step.estimated_time}
                        onChange={(e) =>
                          updateStep(step.id, {
                            estimated_time: parseInt(e.target.value) || 5,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center gap-6 pt-6">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`required-${step.id}`}
                          checked={step.is_required}
                          onCheckedChange={(checked) =>
                            updateStep(step.id, { is_required: !!checked })
                          }
                        />
                        <Label
                          htmlFor={`required-${step.id}`}
                          className="cursor-pointer"
                        >
                          Langkah Wajib
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`checklist-${step.id}`}
                          checked={step.has_checklist}
                          onCheckedChange={(checked) =>
                            updateStep(step.id, { has_checklist: !!checked })
                          }
                        />
                        <Label
                          htmlFor={`checklist-${step.id}`}
                          className="cursor-pointer"
                        >
                          Dengan Checklist
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Checklist Items */}
                  {step.has_checklist && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <Label className="text-sm">Checklist Items</Label>
                      <div className="mt-2 space-y-2">
                        {step.checklist_items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-white p-2 rounded border"
                          >
                            <CheckCircle2 className="w-4 h-4 text-slate-400" />
                            <span className="flex-1 text-sm">{item}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeChecklistItem(step.id, idx)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Tambah item checklist..."
                            value={newChecklistItem[step.id] || ""}
                            onChange={(e) =>
                              setNewChecklistItem({
                                ...newChecklistItem,
                                [step.id]: e.target.value,
                              })
                            }
                            onKeyPress={(e) =>
                              e.key === "Enter" &&
                              (e.preventDefault(), addChecklistItem(step.id))
                            }
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addChecklistItem(step.id)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tools Required */}
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <Label className="text-sm">Alat yang Diperlukan</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {step.tools_required.map((tool, idx) => (
                        <Badge key={idx} variant="secondary" className="gap-1">
                          {tool}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-red-500"
                            onClick={() => removeTool(step.id, idx)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Nama alat..."
                        value={newTool[step.id] || ""}
                        onChange={(e) =>
                          setNewTool({ ...newTool, [step.id]: e.target.value })
                        }
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addTool(step.id))
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addTool(step.id)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Warning Note */}
                  <div>
                    <Label>Catatan Peringatan (Opsional)</Label>
                    <div className="relative">
                      <AlertCircle className="absolute left-3 top-3 w-4 h-4 text-amber-500" />
                      <Textarea
                        value={step.warning_note}
                        onChange={(e) =>
                          updateStep(step.id, { warning_note: e.target.value })
                        }
                        placeholder="Tambahkan peringatan keselamatan atau catatan penting..."
                        className="pl-10"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {steps.length > 0 && (
        <div className="flex justify-center">
          <Button type="button" variant="outline" size="sm" onClick={addStep}>
            <Plus className="w-4 h-4 mr-1" />
            Tambah Langkah Lagi
          </Button>
        </div>
      )}
    </div>
  );
}

// ==================== STEP PREVIEW COMPONENT ====================

interface StepPreviewProps {
  steps: ProcedureStep[];
}

function StepPreview({ steps }: StepPreviewProps) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId],
    );
  };

  const totalTime = steps.reduce((sum, step) => sum + step.estimated_time, 0);
  const progress =
    steps.length > 0 ? (completedSteps.length / steps.length) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
        <div>
          <p className="text-sm text-slate-500">Progress</p>
          <p className="text-2xl font-bold text-slate-800">
            {completedSteps.length} / {steps.length}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Estimasi Waktu</p>
          <p className="text-lg font-semibold text-slate-800">
            {Math.floor(totalTime / 60) > 0 &&
              `${Math.floor(totalTime / 60)} jam `}
            {totalTime % 60} menit
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className="bg-emerald-500 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps Timeline */}
      <div className="relative">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="relative pl-8 pb-6">
              {/* Timeline Line */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-[15px] top-8 w-0.5 h-full",
                    isCompleted ? "bg-emerald-500" : "bg-slate-200",
                  )}
                />
              )}

              {/* Timeline Dot */}
              <div
                onClick={() => toggleStep(step.id)}
                className={cn(
                  "absolute left-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all",
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : "bg-white border-2 border-slate-300 text-slate-500 hover:border-emerald-500",
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">{step.order}</span>
                )}
              </div>

              {/* Step Content */}
              <div
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  isCompleted
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-white border-slate-200",
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4
                      className={cn(
                        "font-semibold",
                        isCompleted
                          ? "text-emerald-700 line-through"
                          : "text-slate-800",
                      )}
                    >
                      {step.title}
                    </h4>
                    {step.description && (
                      <p className="text-sm text-slate-500 mt-1">
                        {step.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {step.is_required && (
                      <Badge variant="outline" className="text-xs">
                        Wajib
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {step.estimated_time}m
                    </Badge>
                  </div>
                </div>

                {/* Warning Note */}
                {step.warning_note && (
                  <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-700">
                      {step.warning_note}
                    </p>
                  </div>
                )}

                {/* Tools */}
                {step.tools_required.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-500 mb-1">
                      Alat yang diperlukan:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {step.tools_required.map((tool, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Checklist */}
                {step.has_checklist && step.checklist_items.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-slate-500">Checklist:</p>
                    {step.checklist_items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Checkbox id={`check-${step.id}-${idx}`} />
                        <label
                          htmlFor={`check-${step.id}-${idx}`}
                          className="cursor-pointer"
                        >
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function ProceduresManagement() {
  const [data, setData] = useState<Procedure[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Procedure | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
    fetchAssetTypes();
  }, []);

  // Calculate total estimated time when steps change
  useEffect(() => {
    const totalTime = formData.procedure_steps.reduce(
      (sum, step) => sum + (step.estimated_time || 0),
      0,
    );
    setFormData((prev) => ({ ...prev, estimated_time: totalTime }));
  }, [formData.procedure_steps]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/procedures`, {
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
      const response = await fetch(`${BASE_URL}/asset-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.data) setAssetTypes(result.data);
    } catch (error) {
      console.error("Failed to fetch asset types");
    }
  };

  const handleAdd = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = (item: Procedure) => {
    setFormData({
      procedure_name: item.procedure_name,
      procedure_desc: item.procedure_desc || "",
      procedure_steps: item.procedure_steps || [],
      estimated_time: item.estimated_time || 0,
      id_asset_type: item.id_asset_type || "",
      is_active: item.is_active ?? true,
      version: item.version || "1.0",
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

  const handlePreview = (item: Procedure) => {
    setSelectedItem(item);
    setShowPreviewModal(true);
  };

  const handleDuplicate = (item: Procedure) => {
    setFormData({
      procedure_name: `${item.procedure_name} (Copy)`,
      procedure_desc: item.procedure_desc || "",
      procedure_steps:
        item.procedure_steps?.map((step) => ({
          ...step,
          id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        })) || [],
      estimated_time: item.estimated_time || 0,
      id_asset_type: item.id_asset_type || "",
      is_active: true,
      version: "1.0",
    });
    setIsEditing(false);
    setShowFormModal(true);
    toast.info("Prosedur diduplikasi. Silakan edit dan simpan.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.procedure_steps.length === 0) {
      toast.error("Prosedur harus memiliki minimal 1 langkah");
      return;
    }

    const emptySteps = formData.procedure_steps.filter((s) => !s.title.trim());
    if (emptySteps.length > 0) {
      toast.error("Semua langkah harus memiliki judul");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = isEditing
        ? `${BASE_URL}/procedures/${selectedItem?.id_procedure}`
        : `${BASE_URL}/procedures`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          total_steps: formData.procedure_steps.length,
        }),
      });

      if (!response.ok) throw new Error("Gagal menyimpan data");

      toast.success(
        isEditing
          ? "Prosedur berhasil diperbarui"
          : "Prosedur berhasil ditambahkan",
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
        `${BASE_URL}/procedures/${selectedItem.id_procedure}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Gagal menghapus data");

      toast.success("Prosedur berhasil dihapus");
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
            <p className="font-medium text-slate-800">
              {row.original.procedure_name}
            </p>
            <p className="text-xs text-slate-500 line-clamp-1">
              {row.original.procedure_desc || "Tidak ada deskripsi"}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "total_steps",
      header: "Langkah",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-slate-400" />
          <span className="font-medium">
            {row.original.procedure_steps?.length || 0}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "estimated_time",
      header: "Estimasi",
      cell: ({ row }) => {
        const time = row.original.estimated_time || 0;
        const hours = Math.floor(time / 60);
        const minutes = time % 60;
        return (
          <div className="flex items-center gap-1 text-slate-600">
            <Timer className="w-4 h-4" />
            <span>
              {hours > 0 && `${hours}j `}
              {minutes}m
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "asset_type_name",
      header: "Tipe Aset",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.asset_type_name || "Umum"}
        </Badge>
      ),
    },
    {
      accessorKey: "version",
      header: "Versi",
      cell: ({ row }) => (
        <span className="text-slate-600">v{row.original.version || "1.0"}</span>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? "Aktif" : "Nonaktif"}
        </Badge>
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
            <DropdownMenuItem onClick={() => handlePreview(row.original)}>
              <BookOpen className="w-4 h-4 mr-2" /> Preview Interaktif
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDuplicate(row.original)}>
              <Copy className="w-4 h-4 mr-2" /> Duplikat
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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

  // Stats
  const stats = {
    total: data.length,
    active: data.filter((d) => d.is_active).length,
    totalSteps: data.reduce(
      (sum, d) => sum + (d.procedure_steps?.length || 0),
      0,
    ),
  };

  return (
    <div>
      <PageHeader
        title="Manajemen Prosedur"
        description="Kelola prosedur standar maintenance dengan langkah-langkah terstruktur"
        actions={
          <Button
            onClick={handleAdd}
            className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Buat Prosedur
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.total}
                </p>
                <p className="text-xs text-slate-500">Total Prosedur</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.active}
                </p>
                <p className="text-xs text-slate-500">Prosedur Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <ListChecks className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.totalSteps}
                </p>
                <p className="text-xs text-slate-500">Total Langkah</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={data}
            searchKey="procedure_name"
            searchPlaceholder="Cari prosedur..."
            onAdd={handleAdd}
            addButtonText="Buat Prosedur"
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Form Modal */}
      <FormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={isEditing ? "Edit Prosedur" : "Buat Prosedur Baru"}
        description={
          isEditing
            ? "Perbarui prosedur maintenance"
            : "Buat prosedur maintenance baru dengan langkah-langkah terstruktur"
        }
        size="xl"
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
              className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Nama Prosedur *</Label>
              <Input
                value={formData.procedure_name}
                onChange={(e) =>
                  setFormData({ ...formData, procedure_name: e.target.value })
                }
                placeholder="Contoh: SOP Pembersihan Filter AC"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label>Deskripsi</Label>
              <Textarea
                value={formData.procedure_desc}
                onChange={(e) =>
                  setFormData({ ...formData, procedure_desc: e.target.value })
                }
                placeholder="Jelaskan tujuan dan ruang lingkup prosedur ini..."
                rows={2}
              />
            </div>
            <div>
              <Label>Tipe Aset</Label>
              <Select
                value={formData.id_asset_type || "__none__"}
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
                  <SelectItem value="__none__">Umum (Semua Tipe)</SelectItem>
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
              <Label>Versi</Label>
              <Input
                value={formData.version}
                onChange={(e) =>
                  setFormData({ ...formData, version: e.target.value })
                }
                placeholder="1.0"
              />
            </div>
          </div>

          <Separator />

          {/* Step Builder */}
          <StepBuilder
            steps={formData.procedure_steps}
            onChange={(steps) =>
              setFormData({ ...formData, procedure_steps: steps })
            }
          />

          {/* Summary */}
          {formData.procedure_steps.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800">
                    {formData.procedure_steps.length}
                  </p>
                  <p className="text-xs text-slate-500">Langkah</p>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800">
                    {Math.floor(formData.estimated_time / 60) > 0 &&
                      `${Math.floor(formData.estimated_time / 60)}j `}
                    {formData.estimated_time % 60}m
                  </p>
                  <p className="text-xs text-slate-500">Total Waktu</p>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800">
                    {
                      formData.procedure_steps.filter((s) => s.is_required)
                        .length
                    }
                  </p>
                  <p className="text-xs text-slate-500">Langkah Wajib</p>
                </div>
              </div>
            </div>
          )}
        </form>
      </FormModal>

      {/* Delete Modal */}
      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Prosedur"
        description={`Apakah Anda yakin ingin menghapus prosedur "${selectedItem?.procedure_name}"? Prosedur yang sudah digunakan di work order tidak akan terpengaruh.`}
        isLoading={isSubmitting}
      />

      {/* Detail Modal */}
      <DetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Prosedur"
        size="xl"
      >
        {selectedItem && (
          <div>
            <div className="flex items-start justify-between mb-6 pb-4 border-b">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">
                    {selectedItem.procedure_name}
                  </h3>
                  <p className="text-slate-500">
                    {selectedItem.procedure_desc}
                  </p>
                </div>
              </div>
              <Badge variant={selectedItem.is_active ? "default" : "secondary"}>
                {selectedItem.is_active ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-slate-800">
                  {selectedItem.procedure_steps?.length || 0}
                </p>
                <p className="text-xs text-slate-500">Langkah</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-slate-800">
                  {Math.floor((selectedItem.estimated_time || 0) / 60) > 0 &&
                    `${Math.floor((selectedItem.estimated_time || 0) / 60)}j `}
                  {(selectedItem.estimated_time || 0) % 60}m
                </p>
                <p className="text-xs text-slate-500">Estimasi</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-slate-800">
                  v{selectedItem.version || "1.0"}
                </p>
                <p className="text-xs text-slate-500">Versi</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-lg font-bold text-slate-800">
                  {selectedItem.asset_type_name || "Umum"}
                </p>
                <p className="text-xs text-slate-500">Tipe Aset</p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-slate-800 mb-3">
                Langkah-langkah:
              </h4>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {selectedItem.procedure_steps?.map((step, index) => (
                    <div
                      key={step.id || index}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {step.order}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-slate-800">
                              {step.title}
                            </h5>
                            {step.is_required && (
                              <Badge variant="outline" className="text-xs">
                                Wajib
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {step.estimated_time}m
                            </Badge>
                          </div>
                          {step.description && (
                            <p className="text-sm text-slate-500 mt-1">
                              {step.description}
                            </p>
                          )}
                          {step.warning_note && (
                            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700 flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              {step.warning_note}
                            </div>
                          )}
                          {step.tools_required?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {step.tools_required.map((tool, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tool}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {step.checklist_items?.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {step.checklist_items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-sm text-slate-600"
                                >
                                  <Circle className="w-3 h-3" />
                                  {item}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false);
                  handleEdit(selectedItem);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false);
                  handlePreview(selectedItem);
                }}
              >
                <BookOpen className="w-4 h-4 mr-2" /> Preview Interaktif
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDuplicate(selectedItem)}
              >
                <Copy className="w-4 h-4 mr-2" /> Duplikat
              </Button>
            </div>
          </div>
        )}
      </DetailModal>

      {/* Preview Modal */}
      <DetailModal
        open={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={`Preview: ${selectedItem?.procedure_name}`}
        size="lg"
      >
        {selectedItem && (
          <StepPreview steps={selectedItem.procedure_steps || []} />
        )}
      </DetailModal>
    </div>
  );
}
