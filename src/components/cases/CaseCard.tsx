import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { calculateProgress } from "@/lib/helpers";
import { Request } from "@/lib/type";
import { deleteCase } from "@/supabase/cases/deleteCase";
import { Edit, Eye, FileTextIcon, TrashIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";

interface CaseCardProps {
  request: Request;
  onDelete?: (id: string) => void;
}

const CaseCard: React.FC<CaseCardProps> = ({ request, onDelete }) => {
  const displayStatus = request.status
    ? request.status.charAt(0).toUpperCase() + request.status.slice(1)
    : "Unknown";

  const displayUrgency = request.urgency_level
    ? request.urgency_level.charAt(0).toUpperCase() +
      request.urgency_level.slice(1)
    : "Normal";

  const handleDelete = async (requestParam: Request) => {
    const result = await deleteCase(requestParam?.id);
    if (result.success) {
      toast({ title: "Case Delted Successfully", variant: "destructive" });
      onDelete(requestParam.id);
    }
  };

  return (
    <Card className="p-6 hover:shadow-hover transition-shadow max-w-full w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 ">
        <div className="max-w-[300px]">
          <h3 className="font-semibold text-lg mb-2 text-wrap">
            {request.title || "No Title"}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 truncate">
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
            {calculateProgress(request.raised_amount, request.required_amount)}%
            funded
          </span>
        </div>
      </div>

      {/* View/Edit Buttons */}
      <div className="flex gap-2 max-w-full w-full">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="w-4 h-4 mr-2" /> View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl w-full p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {request.title || "Untitled Request"}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-6 max-w-full w-full">
              {/* Summary Section */}
              <Card className="p-4 bg-muted/50 w-full">
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
              <div className="w-full max-w-[720px] break-words">
                <Label className="text-sm font-medium text-muted-foreground">
                  Full Story
                </Label>
                <p className="text-sm text-foreground mt-1 ">
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

export default CaseCard;
