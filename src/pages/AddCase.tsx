import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { citiesOfPakistan } from "@/lib/constant";
import { FormValues } from "@/lib/type";
import { useAuthStore } from "@/store/useAuthStore";
import { addCase } from "@/supabase/cases/addCase";
import { supabase } from "@/supabase/client";
import { FileText, MapPin, Upload, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const AddCase = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  // react hook form setup
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      cnic: "",
      phone: "",
      address: "",
      title: "",
      shortStory: "",
      fullStory: "",
      category: "",
      urgencyLevel: "",
      requiredAmount: 0,
      familyMembers: 0,
      isRecurring: false,
      recurringDuration: undefined,
      caseImage: null,
      location: "",
      docs: [], // ✅ one pre-added row
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "docs",
  });
  const isRecurring = watch("isRecurring");

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      await addCase({
        userId: user?.id,
        ...data,
      });

      setLoading(false);
      toast({
        title: "Case Added Successfully",
        description: "The new case has been created.",
      });
      navigate("/case-management");
      reset();
    } catch (err: any) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Something Went Wrong",
      });
    }
  };
  useEffect(() => {
    const checkNeedyDoc = async () => {
      const { data: needy_profile } = await supabase
        .from("needy_profiles")
        .select("*")
        .eq("profile_id", user.id)
        .single();

      if (needy_profile.role_type === "widow") {
        if (
          needy_profile.cnic_self_front_url === null ||
          needy_profile.cnic_self_back_url === null ||
          needy_profile.cnic_spouse_front_url === null ||
          needy_profile.cnic_spouse_back_url === null ||
          needy_profile.death_certificate_spouse_url === null
        ) {
          toast({
            variant: "destructive",
            title: "Please Upload Required Documents To Proceed Creating Case",
          });
          navigate("/edit-profile");
        }
      } else {
        if (
          needy_profile.birth_certificate_url === null &&
          needy_profile.death_certificate_parents_url === null &&
          needy_profile.supporting_document_url === null
        ) {
          toast({
            variant: "destructive",
            title: "Please Upload Required Documents To Proceed Creating Case",
          });
          navigate("/edit-profile");
        }
      }
    };
    checkNeedyDoc();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Add New Case
        </h1>
        <p className="text-muted-foreground">
          Create a new case for someone in need of assistance
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Basic details of the person in need
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm ml-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>CNIC *</Label>
                <Input
                  {...register("cnic", {
                    required: "CNIC is required",
                    pattern: {
                      value: /^[0-9]{13}$/,
                      message: "CNIC must be exactly 13 digits",
                    },
                  })}
                />
                {errors.cnic && (
                  <p className="text-red-500 text-sm ml-1">
                    {errors.cnic.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  {...register("phone", {
                    required: "Phone is required",
                    pattern: {
                      value: /^[1-9][0-9]{9}$/,
                      message: "Phone must be 10 digits without 0 at start",
                    },
                  })}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm ml-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Family Members</Label>
                <Input
                  type="number"
                  defaultValue={0}
                  {...register("familyMembers", {
                    valueAsNumber: true,
                    min: { value: 0, message: "Must be 0 or greater" },
                  })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Complete Address *</Label>
              <Textarea
                {...register("address", { required: "Address is required" })}
              />
              {errors.address && (
                <p className="text-red-500 text-sm ml-1">
                  {errors.address.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Case Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Case Details
            </CardTitle>
            <CardDescription>
              Information about the case requirement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Case Title *</Label>
              <Input
                {...register("title", { required: "Case title is required" })}
              />
            </div>

            {/* Recurring */}
            <div className="flex items-center space-x-2">
              <Controller
                control={control}
                name="isRecurring"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(!!checked)}
                  />
                )}
              />
              <Label>Recurring Assistance</Label>
            </div>
            {isRecurring && (
              <div className="space-y-2">
                <Label>Recurring Duration (months)</Label>
                <Input
                  type="number"
                  {...register("recurringDuration", {
                    setValueAs: (val) => (val === "" ? null : Number(val)),
                    valueAsNumber: true,
                  })}
                />
              </div>
            )}

            {/* Category and Urgency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={control}
                name="category"
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="shelter">Shelter</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-red-500 text-sm ml-1">
                        {errors.category.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                control={control}
                name="urgencyLevel"
                rules={{ required: "Urgency level is required" }}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Urgency Level *</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.urgencyLevel && (
                      <p className="text-red-500 text-sm ml-1">
                        {errors.urgencyLevel.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Required Amount (PKR) *</Label>
              <Input
                type="number"
                {...register("requiredAmount", {
                  required: "Required amount is mandatory",
                  valueAsNumber: true,
                  min: { value: 1, message: "Amount must be greater than 0" },
                })}
              />
              {errors.requiredAmount && (
                <p className="text-red-500 text-sm ml-1">
                  {errors.requiredAmount.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Short Story *</Label>
              <Textarea
                {...register("shortStory", {
                  required: "Short story is required",
                })}
              />
              {errors.shortStory && (
                <p className="text-red-500 text-sm ml-1">
                  {errors.shortStory.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Full Story *</Label>
              <Textarea
                className="min-h-[150px]"
                {...register("fullStory", {
                  required: "Full story is required",
                })}
              />
              {errors.fullStory && (
                <p className="text-red-500 text-sm ml-1">
                  {errors.fullStory.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Case Picture
            </CardTitle>
            <CardDescription>
              Upload a main picture for this case (jpg, png only)
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <Input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;

                setValue("caseImage", file, { shouldValidate: true });

                if (file) {
                  setPreview(URL.createObjectURL(file));
                } else {
                  setPreview(null);
                }
              }}
            />

            {preview && (
              <div className="w-full h-48 border rounded-lg overflow-hidden bg-muted">
                <img
                  src={preview}
                  alt="Case Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {errors.caseImage && (
              <p className="text-red-500 text-sm ml-1">
                {errors.caseImage.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Document Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label>Supporting Documents (at least 1, max 5)</Label>
            {fields.map((field, index) => (
              <DocumentField
                key={field.id}
                index={index}
                register={register}
                setValue={setValue}
                errors={errors}
                remove={() => remove(index)}
              />
            ))}
            {fields.length < 5 && (
              <Button
                type="button"
                variant="outline"
                className="block"
                onClick={() => append({ docName: "", file: null })}
              >
                + Add Document
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              control={control}
              name="location"
              rules={{ required: "Location is required" }}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Select City *</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {citiesOfPakistan.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.location && (
                    <p className="text-red-500 text-sm ml-1">
                      {errors.location.message}
                    </p>
                  )}
                </div>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <Button
          type="submit"
          className="flex justify-self-end bg-primary hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Case"}
        </Button>
      </form>
    </div>
  );
};

// Extracted component for document field to handle useEffect cleanly
const DocumentField = ({
  index,
  register,
  setValue,
  errors,
  remove,
}: {
  index: number;
  register: any;
  setValue: any;
  errors: any;
  remove: () => void;
}) => {
  useEffect(() => {
    register(`docs.${index}.file`, { required: "File is required" });
  }, [register, index]);

  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1">
        <Input
          placeholder="Document Name"
          {...register(`docs.${index}.docName`, {
            required: "Document name is required",
          })}
        />
        {errors.docs?.[index]?.docName && (
          <p className="text-red-500 text-sm ml-1">
            {errors.docs[index].docName?.message}
          </p>
        )}
      </div>

      <div>
        <Input
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setValue(`docs.${index}.file`, file, { shouldValidate: true });
          }}
        />
        {errors.docs?.[index]?.file && (
          <p className="text-red-500 text-sm ml-1">
            {errors.docs[index].file?.message}
          </p>
        )}
      </div>

      <div>
        <Button type="button" variant="destructive" size="sm" onClick={remove}>
          Remove
        </Button>
      </div>
    </div>
  );
};

export default AddCase;
