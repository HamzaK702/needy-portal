export type FormValues = {
  name: string;
  cnic: string;
  phone: string;
  address: string;
  title: string;
  shortStory: string;
  fullStory: string;
  category: string;
  urgencyLevel: string;
  requiredAmount: number;
  familyMembers: number;
  monthlyIncome?: number;
  isRecurring: boolean;
  recurringDuration?: number;
  location: string;
  docs: { docName: string; file: File | null }[];
};

export type Request = {
  id: string; // UUID from DB
  user_id: string | null; // User who created the case
  name: string; // Case title holder / beneficiary name
  title: string; // Case title
  short_story: string; // Short story / description
  full_story: string; // Full story
  category: "medical" | "education" | "food" | "shelter" | "other";
  urgency_level: "low" | "medium" | "high";
  required_amount: number;
  raised_amount: number;
  is_recurring: boolean;
  recurring_duration: number | null; // in days
  location: string;
  docs: { name: string; url: string }[]; // JSONB documents array
  status: "active" | "pending" | "fulfilled" | string;
  created_at: string;
  updated_at: string;
};
