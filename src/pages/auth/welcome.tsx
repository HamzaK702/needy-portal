// src/components/auth/WelcomeForm.tsx
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
import { completeCaretakerProfile } from "@/supabase/auth/welcome";
import { supabase } from "@/supabase/client";
import { LogOutIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type WelcomeValues = {
  cnicFile: FileList;
  areaOfOperations: string;
  profilePic?: FileList;
};

export default function WelcomeForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<WelcomeValues>();

  const Navigate = useNavigate();
  const { user, reset } = useAuthStore();
  const onSubmit = async (data: WelcomeValues) => {
    try {
      if (!user) throw new Error("Not logged in");

      const userId = user.id;

      // Prepare form data for completeCaretakerProfile
      const formData: WelcomeValues & { userId: string } = {
        userId,
        cnicFile: data.cnicFile,
        areaOfOperations: data.areaOfOperations,
        profilePic: data.profilePic,
      };

      // Call the centralized function to handle uploads and DB insertion
      await completeCaretakerProfile(formData);

      Navigate("/");
      toast({ title: "Profile completed 🎉" });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/5 to-primary/5 p-4">
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* CNIC */}
            <div className="space-y-2">
              <Label htmlFor="cnicFile">CNIC Verification</Label>
              <Input
                id="cnicFile"
                type="file"
                accept="image/*"
                {...register("cnicFile", { required: "CNIC file is required" })}
              />
              {errors.cnicFile && (
                <p className="text-red-500 text-xs">
                  {errors.cnicFile.message}
                </p>
              )}
            </div>

            {/* Area */}
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

            {/* Profile Pic */}
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
