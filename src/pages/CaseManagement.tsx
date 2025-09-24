import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateProgress } from "@/lib/helpers";
import { useAuthStore } from "@/store/useAuthStore";
import { deleteCase } from "@/supabase/cases/deleteCase";
import { supabase } from "@/supabase/client";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  FileTextIcon,
  Plus,
  Search,
  TrashIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

// Define request type
interface Request {
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
}

const CaseManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);

      // Fetch only cases for this user
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("user_id", user.id) // filter by user
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching requests:", error);
        setRequests([]);
      } else {
        setRequests(data || []);
      }

      setLoading(false);
    };

    fetchRequests();
  }, []);

  const filteredBySearch = requests.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.short_story.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRequests = filteredBySearch.filter((r) => {
    const status = r.status.toLowerCase();
    switch (activeTab) {
      case "active":
        return status === "active";
      case "pending":
        return status === "pending";
      case "fulfilled":
        return status === "fulfilled";
      default:
        return true;
    }
  });

  const activeCount = requests.filter(
    (r) => r.status.toLowerCase() === "active"
  ).length;
  const pendingCount = requests.filter(
    (r) => r.status.toLowerCase() === "pending"
  ).length;
  const fulfilledCount = requests.filter(
    (r) => r.status.toLowerCase() === "fulfilled"
  ).length;

  const RequestCard = ({ request }: { request: Request }) => {
    const displayStatus = request.status
      ? request.status.charAt(0).toUpperCase() + request.status.slice(1)
      : "Unknown";

    const displayUrgency = request.urgency_level
      ? request.urgency_level.charAt(0).toUpperCase() +
        request.urgency_level.slice(1)
      : "Normal";

    const handleDelete = async (requestParam) => {
      const result = await deleteCase(requestParam?.id);
      if (result.success) {
        toast("Case deleted2 successfully");
        // Optionally, remove it from state so UI updates immediately
        setRequests((prev) => prev.filter((r) => r.id !== requestParam?.id));
      }
    };

    return (
      <Card className="p-6 hover:shadow-hover transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">
              {request.title || "No Title"}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {request.short_story || "No short story"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={
                request.status?.toLowerCase() === "active"
                  ? "default"
                  : request.status?.toLowerCase() === "fulfilled"
                  ? "secondary"
                  : "outline"
              }
            >
              {displayStatus}
            </Badge>
            <Badge
              variant={
                request.urgency_level?.toLowerCase() === "critical"
                  ? "destructive"
                  : request.urgency_level?.toLowerCase() === "high"
                  ? "secondary"
                  : "outline"
              }
            >
              {displayUrgency}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>
              PKR {request.raised_amount?.toLocaleString() || 0} / PKR{" "}
              {request.required_amount?.toLocaleString() || 0}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-success h-2 rounded-full transition-all"
              style={{
                width: `${calculateProgress(
                  request.raised_amount,
                  request.required_amount
                )}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {calculateProgress(
                request.raised_amount,
                request.required_amount
              )}
              % funded
            </span>
          </div>
        </div>

        {/* View/Edit Buttons */}
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="w-4 h-4 mr-2" /> View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {request.title || "Untitled Request"}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-6">
                {/* Summary Section */}
                <Card className="p-4 bg-muted/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Category
                      </Label>
                      <p className="text-base font-semibold capitalize">
                        {request.category || "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Urgency Level
                      </Label>
                      <p className="text-base font-semibold">
                        {request.urgency_level
                          ? request.urgency_level.charAt(0).toUpperCase() +
                            request.urgency_level.slice(1)
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Required Amount
                      </Label>
                      <p className="text-base font-semibold">
                        PKR {request.required_amount?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Raised Amount
                      </Label>
                      <p className="text-base font-semibold">
                        PKR {request.raised_amount?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Recurring
                      </Label>
                      <p className="text-base font-semibold">
                        {request.is_recurring
                          ? `Yes (Every ${
                              request.recurring_duration || "-"
                            } days)`
                          : "No"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Location
                      </Label>
                      <p className="text-base font-semibold">
                        {request.location || "-"}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Full Story Section */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Full Story
                  </Label>
                  <p className="text-base text-foreground mt-1 leading-relaxed">
                    {request.full_story || "No story provided."}
                  </p>
                </div>

                {/* Documents Section */}
                {request.docs && request.docs.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Documents
                    </Label>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {request.docs.map((doc: any, idx: number) => (
                        <a
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                        >
                          <FileTextIcon className="w-5 h-5 text-primary" />
                          <span className="text-sm text-blue-600 underline truncate">
                            {doc.name || `Document ${idx + 1}`}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button size="sm" className="flex-1">
            <Edit className="w-3 h-3 mr-1" /> Edit Request
          </Button>
          <Button
            size="sm"
            className="flex items-center justify-center w-[10%] hover:bg-red-600 bg-red-500"
            onClick={() => handleDelete(request)}
          >
            <TrashIcon className="w-3 h-3" />
          </Button>
        </div>
      </Card>
    );
  };

  if (loading) {
    return <div className="p-6 text-center text-lg">Loading requests...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Case Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and track your donation requests
          </p>
        </div>
        <Link to="/add-case">
          <Button className="bg-gradient-primary">
            <Plus className="w-4 h-4 mr-2" /> Create New Request
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <Clock className="w-8 h-8 text-warning" />
          <div>
            <p className="text-2xl font-bold">{activeCount}</p>
            <p className="text-sm text-muted-foreground">Active Requests</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-success" />
          <div>
            <p className="text-2xl font-bold">{fulfilledCount}</p>
            <p className="text-sm text-muted-foreground">Fulfilled</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-destructive" />
          <div>
            <p className="text-2xl font-bold">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search requests..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="fulfilled">
            Fulfilled ({fulfilledCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No requests found. {searchTerm && "Try adjusting your search."}{" "}
              {activeTab !== "all" && `No ${activeTab} requests yet.`}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredRequests.map((r) => (
                <RequestCard key={r.id} request={r} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaseManagement;
