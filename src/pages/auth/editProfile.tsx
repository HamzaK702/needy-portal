// src/components/profile/EditProfile.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { editProfile } from "@/supabase/auth/edit-profile";
import { supabase } from "@/supabase/client";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type Child = {
  bformNo: string;
};

type ProfileValues = {
  areaOfOperations: string;
  guardianInfo?: string;
  children: Child[];
  cnicFile?: FileList;
  spouseCnicFile?: FileList;
  deathCertificate?: FileList;
  birthCertificate?: FileList;
  supportingDocument?: FileList;
  profilePic?: FileList;
};

export default function EditProfile() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [role, setRole] = useState<"widow" | "orphan" | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    defaultValues: { children: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "children",
  });

  // LOAD EXISTING PROFILE
  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("needy_profiles")
        .select("*")
        .eq("profile_id", user.id)
        .single();

      if (error || !data) {
        toast({
          title: "Failed to load profile",
          description: error?.message || "Profile not found",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setProfile(data);
      setRole(data.role_type as "widow" | "orphan");

      reset({
        areaOfOperations: data.area_of_operations || "",
        guardianInfo: data.guardian_info || "",
        children:
          data.childrens && Array.isArray(data.childrens)
            ? data.childrens.map((c: any) => ({
                bformNo: typeof c === "string" ? c : c.bformNo || "",
              }))
            : [],
      });

      setLoading(false);
    }

    loadProfile();
  }, [user, reset]);

  // HANDLE UPDATE
  async function onSubmit(values: ProfileValues) {
    try {
      const result = await editProfile(values, profile, role);
      if (result.success) {
        toast({
          title: "Account created! Please verify your email to continue.",
        });
        navigate("/sign-in");
      }
    } catch (error: any) {
      toast({
        title: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-secondary/5 to-primary/5">
      <Card className="w-full max-w-[75%]">
        <CardHeader>
          <CardTitle className="text-center text-xl">Edit Profile</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Type */}
            <div className="space-y-2">
              <Label>Profile Type </Label>
              <span className="font-bold capitalize">{role ?? "-"}</span>
            </div>

            {/* Widow Section */}
            {role === "widow" && (
              <div className="space-y-4 border p-5 rounded-lg bg-secondary/5">
                {/* CNIC Self */}
                <div className="space-y-2">
                  <Label>CNIC (Your Own)</Label>
                  {profile?.cnic_self_url ? (
                    <p className="text-xs text-green-600">
                      Already uploaded ✓{" "}
                      <a
                        href={profile.cnic_self_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600"
                      >
                        View
                      </a>
                    </p>
                  ) : (
                    <p className="text-xs text-red-600">Not uploaded yet</p>
                  )}
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    {...register("cnicFile")}
                  />
                </div>

                {/* CNIC Spouse */}
                <div className="space-y-2">
                  <Label>CNIC (Spouse)</Label>
                  {profile?.cnic_spouse_url ? (
                    <p className="text-xs text-green-600">
                      Already uploaded ✓{" "}
                      <a
                        href={profile.cnic_spouse_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600"
                      >
                        View
                      </a>
                    </p>
                  ) : (
                    <p className="text-xs text-red-600">Not uploaded yet</p>
                  )}
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    {...register("spouseCnicFile")}
                  />
                </div>

                {/* Death Certificate Spouse */}
                <div className="space-y-2">
                  <Label>Death Certificate (Spouse)</Label>
                  {profile?.death_certificate_spouse_url ? (
                    <p className="text-xs text-green-600">
                      Already uploaded ✓{" "}
                      <a
                        href={profile.death_certificate_spouse_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600"
                      >
                        View
                      </a>
                    </p>
                  ) : (
                    <p className="text-xs text-red-600">Not uploaded yet</p>
                  )}
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    {...register("deathCertificate")}
                  />
                </div>

                {/* Children */}
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-medium text-sm mb-2">Children</h3>

                  {fields.map((child, index) => (
                    <div
                      key={child.id}
                      className="border p-3 rounded-md space-y-2 flex items-end gap-3"
                    >
                      <div className="flex-1">
                        <Label>B-Form / CNIC Number</Label>
                        <Input
                          placeholder="Enter B-Form / NIC"
                          {...register(`children.${index}.bformNo`, {
                            required: "Required",
                          })}
                        />
                        {errors.children?.[index]?.bformNo && (
                          <p className="text-red-500 text-xs">
                            {errors.children[index].bformNo?.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => append({ bformNo: "" })}
                  >
                    + Add Child
                  </Button>
                </div>
              </div>
            )}

            {/* Orphan Section */}
            {role === "orphan" && (
              <div className="space-y-4 border p-5 rounded-lg bg-secondary/5">
                {/* Birth Certificate */}
                <div className="space-y-2">
                  <Label>Birth Certificate</Label>
                  {profile?.birth_certificate_url ? (
                    <p className="text-xs text-green-600">
                      Already uploaded ✓{" "}
                      <a
                        href={profile.birth_certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600"
                      >
                        View
                      </a>
                    </p>
                  ) : (
                    <p className="text-xs text-red-600">Not uploaded yet</p>
                  )}
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    {...register("birthCertificate")}
                  />
                </div>

                {/* Death Certificate Parents */}
                <div className="space-y-2">
                  <Label>Death Certificate (Parents)</Label>
                  {profile?.death_certificate_parents_url ? (
                    <p className="text-xs text-green-600">
                      Already uploaded ✓{" "}
                      <a
                        href={profile.death_certificate_parents_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600"
                      >
                        View
                      </a>
                    </p>
                  ) : (
                    <p className="text-xs text-red-600">Not uploaded yet</p>
                  )}
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    {...register("deathCertificate")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Guardian Info</Label>
                  <Input
                    placeholder="Guardian name & contact"
                    {...register("guardianInfo")}
                  />
                </div>

                {/* Supporting Document */}
                <div className="space-y-2">
                  <Label>Supporting Document</Label>
                  {profile?.supporting_document_url ? (
                    <p className="text-xs text-green-600">
                      Already uploaded ✓{" "}
                      <a
                        href={profile.supporting_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600"
                      >
                        View
                      </a>
                    </p>
                  ) : (
                    <p className="text-xs text-red-600">Not uploaded yet</p>
                  )}
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    {...register("supportingDocument")}
                  />
                </div>
              </div>
            )}

            {/* Area of Operations */}
            <div className="space-y-2">
              <Label>Area of Operations</Label>
              <Controller
                control={control}
                name="areaOfOperations"
                rules={{ required: "Required" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Karachi district" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="central">Karachi Central</SelectItem>
                      <SelectItem value="east">Karachi East</SelectItem>
                      <SelectItem value="west">Karachi West</SelectItem>
                      <SelectItem value="south">Karachi South</SelectItem>
                      <SelectItem value="korangi">Korangi</SelectItem>
                      <SelectItem value="malir">Malir</SelectItem>
                      <SelectItem value="keamari">Keamari</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.areaOfOperations && (
                <p className="text-red-500 text-xs">
                  {errors.areaOfOperations.message}
                </p>
              )}
            </div>

            {/* Profile Picture */}
            <div className="space-y-3">
              <Label>Profile Picture</Label>

              {profile?.profile_pic_url ? (
                <div className="flex items-center gap-4">
                  <img
                    src={profile.profile_pic_url}
                    alt="Current profile"
                    className="w-28 h-28 rounded-full object-cover border"
                  />
                  <p className="text-sm text-green-600 font-medium">
                    Already uploaded ✓
                  </p>
                </div>
              ) : (
                <p className="text-sm text-red-600">
                  No profile picture uploaded yet
                </p>
              )}

              <Input type="file" accept="image/*" {...register("profilePic")} />
              <p className="text-xs text-muted-foreground">
                {profile?.profile_pic_url
                  ? "Upload new picture to replace"
                  : "Upload profile picture"}
              </p>
            </div>

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
