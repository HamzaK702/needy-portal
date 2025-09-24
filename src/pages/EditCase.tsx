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
import { EditFormValues } from "@/lib/type";
import { supabase } from "@/supabase/client"; // Assuming Supabase client is imported
import { FileText, MapPin, Upload, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

// Utility function to convert snake_case to camelCase
const snakeToCamel = (str: string) =>
  str.replace(/(_\w)/g, (match) => match[1].toUpperCase());

// Utility function to convert camelCase to snake_case
const camelToSnake = (str: string) =>
  str.replace(/([A-Z])/g, "_$1").toLowerCase();

// Map database fields (snake_case) to form fields (camelCase)
const mapDbToForm = (dbData: any): EditFormValues => ({
  name: dbData.name || "",
  cnic: dbData.cnic || "",
  phone: dbData.phone || "",
  address: dbData.address || "",
  title: dbData.title || "",
  shortStory: dbData.short_story || "",
  fullStory: dbData.full_story || "",
  category: dbData.category || "",
  urgencyLevel: dbData.urgency_level || "",
  requiredAmount: dbData.required_amount || 0,
  familyMembers: dbData.family_members || 0,
  monthlyIncome: dbData.monthly_income || undefined,
  isRecurring: dbData.is_recurring || false,
  recurringDuration: dbData.recurring_duration || undefined,
  location: dbData.location || "",
  docs: dbData.docs?.map((doc: { doc_name: string }) => ({
    docName: doc.doc_name,
    file: null, // Set file to null for edit mode
  })) || [{ docName: "", file: null }],
  status: dbData.status || "pending",
});

// Map form fields (camelCase) to database fields (snake_case)
const mapFormToDb = (formData: EditFormValues) => ({
  name: formData.name,
  cnic: formData.cnic,
  phone: formData.phone,
  address: formData.address,
  title: formData.title,
  short_story: formData.shortStory,
  full_story: formData.fullStory,
  category: formData.category,
  urgency_level: formData.urgencyLevel,
  required_amount: formData.requiredAmount,
  family_members: formData.familyMembers,
  monthly_income: formData.monthlyIncome,
  is_recurring: formData.isRecurring,
  recurring_duration: formData.recurringDuration,
  location: formData.location,
  docs: formData.docs.map((doc) => ({
    doc_name: doc.docName,
    file: doc.file, // File will be handled separately if uploading
  })),
  status: formData.status,
});

const EditCase = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditFormValues>({
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
      monthlyIncome: undefined,
      isRecurring: false,
      recurringDuration: undefined,
      location: "",
      docs: [{ docName: "", file: null }],
      status: "pending",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "docs",
  });
  const isRecurring = watch("isRecurring");

  // 🟢 Fetch case details by ID from Supabase
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

        // Map database fields to form fields
        const formData = mapDbToForm(data);
        reset(formData); // Populate form with fetched data
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

  const onSubmit = async (data: EditFormValues) => {
    try {
      setLoading(true);
      // Map form data to database structure
      const dbData = mapFormToDb(data);
      console.log("Updated case:", { id, ...dbData });
      // Optionally, add Supabase update logic here
      /*
      const { error } = await supabase
        .from("cases")
        .update(dbData)
        .eq("id", id);
      
      if (error) throw error;
      */
      setLoading(false);
      toast({ title: "Case Updated Successfully" });
      navigate("/case-management");
    } catch (err) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Something Went Wrong",
        description: "Failed to update case. Please try again.",
      });
    }
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
                  {...register("cnic", { required: "CNIC is required" })}
                />
                {errors.cnic && (
                  <p className="text-sm text-red-500">{errors.cnic.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  {...register("phone", { required: "Phone is required" })}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Family Members</Label>
                <Input type="number" {...register("familyMembers")} />
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
                name="urgencyLevel"
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
                    {errors.urgencyLevel && (
                      <p className="text-sm text-red-500">
                        {errors.urgencyLevel.message}
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
                    <Label>Status</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="fulfilled">Fulfilled</SelectItem>
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
                {...register("requiredAmount", {
                  required: "Required amount is required",
                })}
              />
              {errors.requiredAmount && (
                <p className="text-sm text-red-500">
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
                <p className="text-sm text-red-500">
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
                <p className="text-sm text-red-500">
                  {errors.fullStory.message}
                </p>
              )}
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
                <Input type="number" {...register("recurringDuration")} />
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
                remove={() => remove(index)}
                disabledRemove={fields.length === 1}
              />
            ))}
            {fields.length < 5 && (
              <Button
                type="button"
                variant="outline"
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
                    <p className="text-sm text-red-500">
                      {errors.location.message}
                    </p>
                  )}
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" className="bg-primary hover:bg-primary/90">
          {loading ? "Updating..." : "Update Case"}
        </Button>
      </form>
    </div>
  );
};

// DocumentField component (edit mode → file not required)
const DocumentField = ({
  index,
  register,
  setValue,
  errors,
  remove,
  disabledRemove,
}: {
  index: number;
  register: any;
  setValue: any;
  errors: any;
  remove: () => void;
  disabledRemove: boolean;
}) => {
  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1">
        <Input
          placeholder="Document Name"
          {...register(`docs.${index}.docName`)}
        />
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
      </div>
      <div>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={remove}
          disabled={disabledRemove}
        >
          Remove
        </Button>
      </div>
    </div>
  );
};

export default EditCase;
