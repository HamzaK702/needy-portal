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
import { EditCaseFormDoc, EditCaseFormValues } from "@/lib/type";
import { updateCase } from "@/supabase/cases/updateCase";
import { supabase } from "@/supabase/client"; // Assuming Supabase client is imported
import { FileText, MapPin, Upload, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";

// Local form types aligned to DB (snake_case) and including optional file for docs UI

const EditCase = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditCaseFormValues>({
    defaultValues: {
      name: "",
      cnic: "",
      phone: "",
      address: "",
      title: "",
      short_story: "",
      full_story: "",
      category: "",
      urgency_level: "",
      required_amount: 0,
      family_members: 0,
      is_recurring: false,
      recurring_duration: undefined,
      location: "",
      docs: [{ name: "", file: null, url: "", isOldOne: false }],
      removedDocs: [],
      status: "active",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "docs",
  });

  const { fields: removedDocFields, append: removedDocAppend } = useFieldArray({
    control,
    name: "removedDocs",
  });
  const isRecurring = watch("is_recurring");

  useEffect(() => {
    async function fetchCase() {
      if (!id) {
        toast({
          variant: "destructive",
          title: "Invalid Case ID",
        });
        return;
      }

      try {
        const { data, error } = await supabase
          .from("cases") // Assuming the table name is 'cases'
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        // Add file: null to each doc for form handling
        if (data.docs) {
          data.docs = data.docs.map((doc: any) => ({
            ...doc,
            file: null,
            isOldOne: true,
          }));
        } else {
          data.docs = [
            {
              name: "",
              file: null,
              url: "",
              isOldOne: false,
            },
          ];
        }
        reset(data);
        setPreview(data.case_image || null);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Failed to load case",
          description: "Please try again later.",
        });
      }
    }

    fetchCase();
  }, [id, reset, toast]);

  const onSubmit = async (data: EditCaseFormValues) => {
    try {
      setLoading(true);
      await updateCase(data, id);
      toast({ title: "Case Updated Successfully" });
      setLoading(false);
      navigate("/case-management");
    } catch (error) {
      setLoading(false);
      toast({ title: error || "Something went wrong" });
    }
  };

  const preRemoveFilter = (field: EditCaseFormDoc, idx: number) => {
    if (field.isOldOne) {
      removedDocAppend(field);
    }
    remove(idx);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Edit Case</h1>
        <p className="text-muted-foreground">Update details for this case</p>
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
              Update the details of the person in need
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
                  <p className="text-sm text-red-500">{errors.name.message}</p>
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
                  <p className="text-sm text-red-500">{errors.cnic.message}</p>
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
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Family Members *</Label>
                <Input
                  type="number"
                  {...register("family_members", {
                    required: "Family members count is required",
                    valueAsNumber: true,
                    min: { value: 0, message: "Must be between 0 and 20" },
                    max: { value: 20, message: "Must be between 0 and 20" },
                  })}
                />
                {errors.family_members && (
                  <p className="text-sm text-red-500">
                    {errors.family_members.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Complete Address *</Label>
              <Textarea
                {...register("address", { required: "Address is required" })}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Case Title *</Label>
              <Input
                {...register("title", { required: "Case title is required" })}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Category, Urgency, Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <p className="text-sm text-red-500">
                        {errors.category.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                control={control}
                name="urgency_level"
                rules={{ required: "Urgency is required" }}
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
                    {errors.urgency_level && (
                      <p className="text-sm text-red-500">
                        {errors.urgency_level.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Mark as fulfilled?</Label>
                    <Select
                      onValueChange={(val) =>
                        field.onChange(val === "yes" ? "fulfilled" : "active")
                      }
                      value={field.value === "fulfilled" ? "yes" : "no"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Required Amount (PKR) *</Label>
              <Input
                type="number"
                {...register("required_amount", {
                  required: "Required amount is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Amount must be greater than 0" },
                })}
              />
              {errors.required_amount && (
                <p className="text-sm text-red-500">
                  {errors.required_amount.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Short Story *</Label>
              <Textarea
                {...register("short_story", {
                  required: "Short story is required",
                })}
              />
              {errors.short_story && (
                <p className="text-sm text-red-500">
                  {errors.short_story.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Full Story *</Label>
              <Textarea
                className="min-h-[150px]"
                {...register("full_story", {
                  required: "Full story is required",
                })}
              />
              {errors.full_story && (
                <p className="text-sm text-red-500">
                  {errors.full_story.message}
                </p>
              )}
            </div>

            {/* Recurring */}
            <div className="flex items-center space-x-2">
              <Controller
                control={control}
                name="is_recurring"
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
                <Input type="number" {...register("recurring_duration")} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Case Picture
            </CardTitle>
            <CardDescription>
              Replace the main picture for this case (optional)
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <Input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setValue("caseImage", file);

                if (file) {
                  setPreview(URL.createObjectURL(file));
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
            {fields.map((field, index) => (
              <DocumentField
                key={field.id}
                index={index}
                register={register}
                setValue={setValue}
                errors={errors}
                remove={() => preRemoveFilter(field, index)}
                doc={watch(`docs.${index}` as any)}
              />
            ))}
            {fields.length < 5 && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({ name: "", file: null, url: "", isOldOne: false })
                }
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
                    <p className="text-sm text-red-500">
                      {errors.location.message}
                    </p>
                  )}
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 flex justify-self-end"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Case"}
        </Button>
      </form>
    </div>
  );
};

// DocumentField component (edit mode → file optional; show existing url to view)
const DocumentField = ({
  index,
  register,
  setValue,
  errors,
  remove,
  doc,
}: {
  index: number;
  register: any;
  setValue: any;
  errors: any;
  remove: () => void;
  doc: any;
}) => {
  useEffect(() => {
    // Only require file for new documents (not existing ones)
    if (!doc?.isOldOne) {
      register(`docs.${index}.file`, { required: "File is required" });
    }
  }, [register, index, doc?.isOldOne]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <Input
            placeholder="Document Name"
            {...register(`docs.${index}.name`, {
              required: "Document name is required",
            })}
          />
          {errors.docs?.[index]?.name && (
            <p className="text-sm text-red-500 mt-0.5 ml-0.5">
              {errors.docs[index].name?.message}
            </p>
          )}
        </div>
        {doc?.url ? (
          <div className="flex items-center gap-2">
            <Link
              to={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline"
            >
              View
            </Link>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={remove}
            >
              Remove
            </Button>
          </div>
        ) : (
          <div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={remove}
            >
              Remove
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-2 items-center">
        <Input
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setValue(`docs.${index}.file`, file, { shouldValidate: true });
          }}
        />
        {doc?.url && (
          <span className="text-xs text-muted-foreground">
            Already uploaded. Select a file to replace.
          </span>
        )}
        {!doc?.isOldOne && errors.docs?.[index]?.file && (
          <p className="text-sm text-red-500">
            {errors.docs[index].file?.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default EditCase;
