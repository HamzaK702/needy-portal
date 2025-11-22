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
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type Child = {
  bformNo: string;
};

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
  children: Child[];
};

export default function WelcomeForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<WelcomeValues>({
    mode: "onSubmit",
    defaultValues: { children: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "children",
  });

  const roleType = watch("roleType");
  // Reset children whenever roleType changes
  useEffect(() => {
    setValue("children", []);
  }, [roleType, setValue]);
  const navigate = useNavigate();
  const { user, reset, setProfileCompleted } = useAuthStore();

  const onSubmit = async (data: WelcomeValues) => {
    try {
      if (!user) throw new Error("Not logged in");
      await completeNeedyProfile(user.id, data);
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

            {/* Widow Section */}
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
                    {...register("cnicFile")}
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
                    {...register("spouseCnicFile")}
                  />
                  {errors.spouseCnicFile && (
                    <p className="text-red-500 text-xs">
                      {errors.spouseCnicFile.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Death Certificate of Husband</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    {...register("deathCertificate")}
                  />
                  {errors.deathCertificate && (
                    <p className="text-red-500 text-xs">
                      {errors.deathCertificate.message}
                    </p>
                  )}
                </div>

                {/* 👶 Children Section */}
                <div className="space-y-3 border-t pt-4">
                  <h3 className="font-medium text-sm mb-2">
                    Children Information
                  </h3>

                  {fields.map((child, index) => (
                    <div
                      key={child.id}
                      className="flex flex-col md:flex-row md:items-end gap-3 border p-3 rounded-md"
                    >
                      <div className="flex-1">
                        <Label>B-Form / NIC Number</Label>
                        <Input
                          type="number"
                          inputMode="numeric"
                          placeholder="Enter B-Form / NIC"
                          {...register(`children.${index}.bformNo`, {
                            required: "B-Form / NIC is required",
                            minLength: {
                              value: 13,
                              message: "B-Form / NIC must be 13 digits",
                            },
                            maxLength: {
                              value: 13,
                              message: "B-Form / NIC must be 13 digits",
                            },
                            pattern: {
                              value: /^[0-9]+$/,
                              message: "Only numbers are allowed",
                            },
                          })}
                        />

                        {errors.children?.[index]?.bformNo && (
                          <p className="text-red-500 text-xs mt-1.5 ml-1">
                            {errors.children[index].bformNo?.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => remove(index)}
                        className="self-start mt-6"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => append({ bformNo: "" })}
                  >
                    + Add Child
                  </Button>
                </div>
              </div>
            )}

            {/* Orphan Section */}
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
                    {...register("birthCertificate")}
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
                    {...register("deathCertificate")}
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
                    {...register("guardianInfo")}
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
                    {...register("supportingDocument")}
                  />
                  {errors.supportingDocument && (
                    <p className="text-red-500 text-xs">
                      {errors.supportingDocument.message}
                    </p>
                  )}
                </div>

                {/* 👶 Children Section */}
                <div className="space-y-3 border-t pt-4">
                  <h3 className="font-medium text-sm mb-2">
                    Children Information
                  </h3>

                  {fields.map((child, index) => (
                    <div
                      key={child.id}
                      className="flex flex-col md:flex-row md:items-end gap-3 border p-3 rounded-md"
                    >
                      <div className="flex-1">
                        <Label>B-Form / NIC Number</Label>
                        <Input
                          type="number"
                          inputMode="numeric"
                          placeholder="Enter B-Form / NIC"
                          {...register(`children.${index}.bformNo`, {
                            required: "B-Form / NIC is required",
                            minLength: {
                              value: 13,
                              message: "B-Form / NIC must be 13 digits",
                            },
                            maxLength: {
                              value: 13,
                              message: "B-Form / NIC must be 13 digits",
                            },
                            pattern: {
                              value: /^[0-9]+$/,
                              message: "Only numbers are allowed",
                            },
                          })}
                        />

                        {errors.children?.[index]?.bformNo && (
                          <p className="text-red-500 text-xs mt-1.5 ml-1">
                            {errors.children[index].bformNo?.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => remove(index)}
                        className="self-start mt-6"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => append({ bformNo: "" })}
                  >
                    + Add Child
                  </Button>
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
