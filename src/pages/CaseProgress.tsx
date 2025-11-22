import { supabase } from "@/supabase/client";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { toast } from "@/hooks/use-toast";

import {
  addProgress,
  deleteProgress,
  editProgress,
} from "@/supabase/cases/progress";

import { Edit2, Trash2, UploadCloud } from "lucide-react";
import { useParams } from "react-router-dom";

interface CaseUpdate {
  id: string;
  case_id: string;
  title: string;
  description: string;
  image_url: string | null;
  doc_url: string | null;
  created_at: string;
}

const CaseProgress = () => {
  const { caseId } = useParams();
  const [updates, setUpdates] = useState<CaseUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [editUpdate, setEditUpdate] = useState<CaseUpdate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      document: null as File | null,
    },
  });

  const editForm = useForm({
    defaultValues: {
      title: "",
      description: "",
      document: null as File | null,
    },
  });

  // -----------------------------
  // LOAD UPDATES
  // -----------------------------
  async function fetchUpdates() {
    const { data, error } = await supabase
      .from("case_updates")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false });

    if (!error && data) setUpdates(data as CaseUpdate[]);
  }

  useEffect(() => {
    fetchUpdates();
  }, []);

  // -----------------------------
  // ADD NEW UPDATE
  // -----------------------------
  async function onSubmit(values: any) {
    try {
      setLoading(true);
      await addProgress({ ...values, case_id: caseId! });
      toast({ title: "Progress added", description: "The update is saved." });
      reset();
      fetchUpdates();
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not add update.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------
  // OPEN EDIT MODAL
  // -----------------------------
  const openEditModal = (update: CaseUpdate) => {
    setEditUpdate(update);
    editForm.reset({
      title: update.title,
      description: update.description,
      document: null,
    });
  };

  // -----------------------------
  // SAVE EDITED UPDATE
  // -----------------------------
  const handleEditSubmit = async (values: any) => {
    try {
      await editProgress({ ...values, id: editUpdate?.id });
      toast({
        title: "Update saved",
        description: "Changes have been applied.",
      });
      setEditUpdate(null);
      fetchUpdates();
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not update progress.",
        variant: "destructive",
      });
    }
  };

  // -----------------------------
  // DELETE CONFIRMATION HANDLER
  // -----------------------------
  async function handleDeleteConfirmed() {
    if (!deleteId) return;
    try {
      await deleteProgress(deleteId);
      toast({
        title: "Deleted",
        description: "Progress update removed.",
        variant: "destructive",
      });
      fetchUpdates();
      setDeleteId(null);
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not delete update.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 p-6">
      {/* ---------------------- */}
      {/* FORM SECTION */}
      {/* ---------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Add Progress Update</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Update Title *</Label>
              <Input
                {...register("title", {
                  required: "Progress title is required",
                })}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Short Description *</Label>
              <Textarea
                {...register("description", {
                  required: "Description is required",
                })}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Document Proof (PDF or Image)</Label>
              <Controller
                name="document"
                control={control}
                rules={{
                  required: "Document is required",
                  validate: (file: File) =>
                    file
                      ? ["application/pdf", "image/png", "image/jpeg"].includes(
                          file.type
                        )
                        ? file.size <= 5 * 1024 * 1024 || "Max 5MB allowed"
                        : "Only PDF, PNG, JPEG allowed"
                      : "Document is required",
                }}
                render={({ field }) => (
                  <>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        field.onChange(e.target.files?.[0] || null)
                      }
                    />
                    {errors.document && (
                      <p className="text-sm text-red-500">
                        {errors.document.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <Button className="w-full" disabled={loading}>
              {loading ? "Uploading..." : "Add Update"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ---------------------- */}
      {/* UPDATES LIST */}
      {/* ---------------------- */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Case Progress Timeline</h2>

        {updates.length === 0 && (
          <p className="text-muted-foreground">No updates yet.</p>
        )}

        <div className="space-y-4">
          {updates.map((u) => (
            <Card key={u.id} className="relative">
              <CardContent className="p-4 space-y-3 max-w-full">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{u.title}</h3>
                  <span className="text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground break-words">
                  {u.description}
                </p>

                {u.doc_url && (
                  <a
                    href={u.doc_url}
                    target="_blank"
                    className="text-blue-600 underline flex items-center gap-2 text-sm"
                  >
                    <UploadCloud size={16} />
                    View Document Proof
                  </a>
                )}

                <div className=" flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(u)}
                  >
                    <Edit2 size={14} />
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteId(u.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ---------------------- */}
      {/* EDIT MODAL */}
      {/* ---------------------- */}
      <Dialog
        open={!!editUpdate}
        onOpenChange={(open) => !open && setEditUpdate(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Progress Update</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={editForm.handleSubmit(handleEditSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Update Title *</Label>
              <Input
                {...editForm.register("title", {
                  required: "Title is required",
                })}
              />
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                {...editForm.register("description", {
                  required: "Description is required",
                })}
              />
            </div>

            <div className="space-y-2">
              <Label>Replace Document (optional)</Label>
              <Controller
                name="document"
                control={editForm.control}
                render={({ field }) => (
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      field.onChange(e.target.files?.[0] || null)
                    }
                  />
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ---------------------- */}
      {/* DELETE CONFIRMATION */}
      {/* ---------------------- */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Update?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This update will be removed
              permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteConfirmed}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CaseProgress;
