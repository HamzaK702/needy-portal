// src/components/auth/WelcomeForm.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { completeNeedyProfile } from "@/supabase/auth/welcome";
import { supabase } from "@/supabase/client";
import { LogOutIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type WelcomeValues = {
  roleType: "widow" | "orphan";
  cnicFile?: FileList;
  spouseCnicFile?: FileList;
  deathCertificate?: FileList;
  birthCertificate?: FileList;
  guardianInfo?: string;
  supportingDocument?: FileList;
  areaOfOperations: string;
  profilePic?: FileList;
};

export default function WelcomeForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<WelcomeValues>({
    mode: "onSubmit", // ✅ only validate when submitted
  });

  const roleType = watch("roleType");
  const navigate = useNavigate();
  const { user, reset, setProfileCompleted } = useAuthStore();

  const onSubmit = async (data: WelcomeValues) => {
    try {
      if (!user) throw new Error("Not logged in");
      const formData = data;
      await completeNeedyProfile(user.id, formData);
      toast({ title: "Profile completed 🎉" });
      setProfileCompleted(true);
    } catch (err: any) {
      toast({
        title: err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    reset();
    supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/5 to-primary/5 p-4 relative">
      <LogOutIcon
        className="absolute top-5 right-5 cursor-pointer hover:text-secondaryCM"
        onClick={handleLogout}
      />
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl text-center">
            Complete Your Profile
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Type */}
            <div className="space-y-2">
              <Label>Profile Type</Label>
              <Controller
                control={control}
                name="roleType"
                rules={{ required: "Please select one" }}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={(val) => field.onChange(val)}
                    value={field.value}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="widow" id="widow" />
                      <Label htmlFor="widow">Widow</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="orphan" id="orphan" />
                      <Label htmlFor="orphan">Orphan</Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors.roleType && (
                <p className="text-red-500 text-xs">
                  {errors.roleType.message}
                </p>
              )}
            </div>

            {/* Conditional Fields */}
            {roleType === "widow" && (
              <div className="space-y-4 border p-4 rounded-lg bg-secondary/5">
                <h3 className="font-medium text-sm mb-2">
                  Documentation Requirements (Widow)
                </h3>

                <div>
                  <Label>CNIC (Your Own)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    {...register("cnicFile", {
                      required:
                        roleType === "widow" ? "CNIC file is required" : false,
                    })}
                  />
                  {errors.cnicFile && (
                    <p className="text-red-500 text-xs">
                      {errors.cnicFile.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>CNIC (Deceased Spouse)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    {...register("spouseCnicFile", {
                      required:
                        roleType === "widow"
                          ? "Spouse CNIC is required"
                          : false,
                    })}
                  />
                  {errors.spouseCnicFile && (
                    <p className="text-red-500 text-xs">
                      {errors.spouseCnicFile.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Death Certificate of Husband/Father</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    {...register("deathCertificate", {
                      required:
                        roleType === "widow"
                          ? "Death certificate is required"
                          : false,
                    })}
                  />
                  {errors.deathCertificate && (
                    <p className="text-red-500 text-xs">
                      {errors.deathCertificate.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {roleType === "orphan" && (
              <div className="space-y-4 border p-4 rounded-lg bg-secondary/5">
                <h3 className="font-medium text-sm mb-2">
                  Documentation Requirements (Orphan)
                </h3>

                <div>
                  <Label>Birth Certificate</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    {...register("birthCertificate", {
                      required:
                        roleType === "orphan"
                          ? "Birth certificate is required"
                          : false,
                    })}
                  />
                  {errors.birthCertificate && (
                    <p className="text-red-500 text-xs">
                      {errors.birthCertificate.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Death Certificate of Parent(s)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    {...register("deathCertificate", {
                      required:
                        roleType === "orphan"
                          ? "Death certificate is required"
                          : false,
                    })}
                  />
                  {errors.deathCertificate && (
                    <p className="text-red-500 text-xs">
                      {errors.deathCertificate.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Guardian Information</Label>
                  <Input
                    type="text"
                    placeholder="Enter guardian name and relation"
                    {...register("guardianInfo", {
                      required:
                        roleType === "orphan"
                          ? "Guardian information is required"
                          : false,
                    })}
                  />
                  {errors.guardianInfo && (
                    <p className="text-red-500 text-xs">
                      {errors.guardianInfo.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Supporting Document</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    {...register("supportingDocument", {
                      required:
                        roleType === "orphan"
                          ? "Supporting document is required"
                          : false,
                    })}
                  />
                  {errors.supportingDocument && (
                    <p className="text-red-500 text-xs">
                      {errors.supportingDocument.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Area of Operations */}
            <div className="space-y-2">
              <Label>Area of Operations</Label>
              <Controller
                control={control}
                name="areaOfOperations"
                rules={{ required: "Please select an area" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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
            <div className="space-y-2">
              <Label htmlFor="profilePic">Profile Picture (optional)</Label>
              <Input
                id="profilePic"
                type="file"
                accept="image/*"
                {...register("profilePic")}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save & Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
