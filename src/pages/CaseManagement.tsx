import CaseCard from "@/components/cases/CaseCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Request } from "@/lib/type";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/supabase/client";
import { AlertTriangle, CheckCircle, Clock, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Define request type

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

  if (loading) {
    return <div className="p-6 text-center text-lg">Loading requests...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Case Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and track your donation cases
          </p>
        </div>
        <Link to="/add-case">
          <Button className="bg-gradient-primary">
            <Plus className="w-4 h-4 mr-2" /> Create New Case
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <Clock className="w-8 h-8 text-warning" />
          <div>
            <p className="text-2xl font-bold">{activeCount}</p>
            <p className="text-sm text-muted-foreground">Active Cases</p>
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
          <TabsTrigger value="all">All Cases</TabsTrigger>
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
              {filteredRequests?.map((r) => (
                <CaseCard
                  key={r.id}
                  request={r}
                  onDelete={(id) => {
                    setRequests((prev) => prev.filter((req) => req.id !== id));
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaseManagement;
